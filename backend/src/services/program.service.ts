/**
 * NC Program service - Business logic layer
 * Following Cursor Clause 4.5 Rules
 */

import { db } from '../db/client';
import { AppError } from '../middleware/error-handler';
import { PaginatedResponse } from '../types';
import { searchService } from './search.service';
import {
  CreateProgramInput,
  UpdateProgramInput,
  ProgramQueryInput,
} from '../api/schemas/program.schema';

/**
 * Service class for NC Program operations
 * Handles all business logic for program management
 */
export class ProgramService {
  /**
   * Get all programs with filtering, search, and pagination
   * 
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of programs
   */
  async getPrograms(query: ProgramQueryInput): Promise<PaginatedResponse<any>> {
    const { search, status, machineId, customer, partNumber, page, limit, sortBy, sortOrder } = query;

    // Use Meilisearch for full-text search if search term provided
    if (search && search.trim().length > 0) {
      const programIds = await searchService.searchPrograms(
        search,
        { status, machineId, customer },
        limit * 2 // Get more results as we'll filter further
      );

      if (programIds.length === 0) {
        return {
          data: [],
          meta: { page, limit, total: 0, totalPages: 0 },
        };
      }

      // Get programs by IDs from database
      const programs = await db.nCProgram.findMany({
        where: {
          id: { in: programIds },
          ...(partNumber && { partNumber: { contains: partNumber, mode: 'insensitive' } }),
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          machine: { select: { id: true, name: true, type: true } },
          setupSheets: { select: { id: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy || 'lastModified']: sortOrder || 'desc' },
      });

      return {
        data: programs,
        meta: {
          page,
          limit,
          total: programIds.length,
          totalPages: Math.ceil(programIds.length / limit),
        },
      };
    }

    // Regular database query without search
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (machineId) {
      where.machineId = machineId;
    }

    if (customer) {
      where.customer = { contains: customer, mode: 'insensitive' };
    }

    if (partNumber) {
      where.partNumber = { contains: partNumber, mode: 'insensitive' };
    }

    // Get total count
    const total = await db.nCProgram.count({ where });

    // Get programs with pagination
    const programs = await db.nCProgram.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        machine: { select: { id: true, name: true, type: true } },
        setupSheets: { select: { id: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy || 'lastModified']: sortOrder || 'desc' },
    });

    return {
      data: programs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single program by ID
   * 
   * @param id - Program UUID
   * @returns Program with full details
   */
  async getProgramById(id: string) {
    const program = await db.nCProgram.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
        machine: true,
        setupSheets: {
          include: {
            tools: true,
            originOffsets: true,
            fixtures: true,
            media: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 10,
        },
      },
    });

    if (!program) {
      throw new AppError(404, 'Program not found');
    }

    return program;
  }

  /**
   * Create a new NC program
   * 
   * @param data - Program creation data
   * @param authorId - ID of the user creating the program
   * @returns Created program
   */
  async createProgram(data: CreateProgramInput, authorId: string) {
    // Verify machine exists and get nextProgramNumber
    const machine = await db.machine.findUnique({
      where: { id: data.machineId },
      select: { id: true, nextProgramNumber: true },
    });

    if (!machine) {
      throw new AppError(404, 'Machine not found');
    }

    // Determine part number: if not provided, generate from machine.nextProgramNumber (4-digit padded)
    const shouldAutoNumber = !data.partNumber || data.partNumber.trim().length === 0;
    const currentProgramNumber = machine.nextProgramNumber ?? 100; // Fallback to 100 if not set
    const generatedPartNumber = shouldAutoNumber
      ? String(currentProgramNumber).padStart(4, '0')
      : data.partNumber;

    // Create program
    const program = await db.nCProgram.create({
      data: {
        ...data,
        partNumber: generatedPartNumber!,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        machine: { select: { id: true, name: true, type: true } },
      },
    });

    // If auto-numbered, increment machine counter
    if (shouldAutoNumber) {
      await db.machine.update({
        where: { id: machine.id },
        data: { nextProgramNumber: currentProgramNumber + 1 },
      });
    }

    // Index in Meilisearch (non-blocking - don't fail if indexing fails)
    try {
      await searchService.indexProgram(program);
    } catch (error) {
      console.error('Warning: Failed to index program in search service:', error);
      // Continue - program creation succeeded, indexing is optional
    }

    return program;
  }

  /**
   * Update an existing program
   * 
   * @param id - Program UUID
   * @param data - Updated program data
   * @returns Updated program
   */
  async updateProgram(id: string, data: UpdateProgramInput) {
    // Check if program exists
    await this.getProgramById(id);

    // Update program
    const updated = await db.nCProgram.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        machine: { select: { id: true, name: true, type: true } },
      },
    });

    // Re-index in Meilisearch
    await searchService.indexProgram(updated);

    return updated;
  }

  /**
   * Delete a program
   * 
   * @param id - Program UUID
   */
  async deleteProgram(id: string): Promise<void> {
    // Check if program exists
    await this.getProgramById(id);

    // Delete program (cascade will delete related data)
    await db.nCProgram.delete({
      where: { id },
    });

    // Remove from Meilisearch index
    await searchService.deleteProgram(id);
  }

  /**
   * Approve or change program status
   * 
   * @param id - Program UUID
   * @param status - New status
   * @param approverId - ID of approving user
   * @returns Updated program
   */
  async updateProgramStatus(id: string, status: string, approverId: string) {
    const program = await this.getProgramById(id);

    const updated = await db.nCProgram.update({
      where: { id },
      data: {
        status,
        approverId,
        approvedAt: status === 'Approved' || status === 'Released' ? new Date() : null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
        machine: { select: { id: true, name: true, type: true } },
      },
    });

    return updated;
  }

  /**
   * Create a new version of a program
   * 
   * @param programId - Program UUID
   * @param revision - Revision string
   * @param filePath - Path to versioned file
   * @param userId - User creating the version
   * @param changeLog - Change description
   * @returns Created version
   */
  async createProgramVersion(
    programId: string,
    revision: string,
    filePath: string,
    userId: string,
    changeLog?: string
  ) {
    const program = await this.getProgramById(programId);

    // Get latest version number
    const latestVersion = await db.programVersion.findFirst({
      where: { programId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = (latestVersion?.versionNumber || 0) + 1;

    const version = await db.programVersion.create({
      data: {
        programId,
        versionNumber,
        revision,
        filePath,
        changeLog,
        createdById: userId,
      },
    });

    // Update program's current revision
    await db.nCProgram.update({
      where: { id: programId },
      data: { revision },
    });

    return version;
  }

  /**
   * Get program version history
   * 
   * @param programId - Program UUID
   * @returns List of versions
   */
  async getProgramVersions(programId: string) {
    const versions = await db.programVersion.findMany({
      where: { programId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { versionNumber: 'desc' },
    });

    return versions;
  }
}

// Export singleton instance
export const programService = new ProgramService();

