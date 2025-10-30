/**
 * Setup Sheet service - Business logic layer
 * Following Cursor Clause 4.5 Rules
 */

import { db } from '../db/client';
import { AppError } from '../middleware/error-handler';
import {
  CreateSetupSheetInput,
  UpdateSetupSheetInput,
} from '../api/schemas/setup-sheet.schema';

/**
 * Service class for Setup Sheet operations
 * Handles all business logic for setup sheet management
 */
export class SetupSheetService {
  /**
   * Get all setup sheets for a program
   * 
   * @param programId - Program UUID
   * @returns List of setup sheets
   */
  async getSetupSheetsByProgram(programId: string) {
    const sheets = await db.setupSheet.findMany({
      where: { programId },
      include: {
        tools: true,
        originOffsets: true,
        fixtures: true,
        media: {
          orderBy: { order: 'asc' },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        machine: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sheets;
  }

  /**
   * Get a single setup sheet by ID
   * 
   * @param id - Setup sheet UUID
   * @returns Setup sheet with full details
   */
  async getSetupSheetById(id: string) {
    const sheet = await db.setupSheet.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            revision: true,
          },
        },
        machine: true,
        tools: { orderBy: { toolNumber: 'asc' } },
        originOffsets: { orderBy: { name: 'asc' } },
        fixtures: true,
        media: { orderBy: { order: 'asc' } },
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!sheet) {
      throw new AppError(404, 'Setup sheet not found');
    }

    return sheet;
  }

  /**
   * Create a new setup sheet
   * 
   * @param data - Setup sheet creation data
   * @param userId - ID of the user creating the sheet
   * @returns Created setup sheet
   */
  async createSetupSheet(data: CreateSetupSheetInput, userId: string) {
    const { programId, machineId, tools, originOffsets, fixtures, media, safetyChecklist } = data;

    console.log('Creating setup sheet:', { programId, machineId, toolsCount: tools.length, originOffsetsCount: originOffsets.length, fixturesCount: fixtures?.length || 0, mediaCount: media?.length || 0 });

    // Verify program exists
    const program = await db.nCProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new AppError(404, 'Program not found');
    }

    // Verify machine exists
    const machine = await db.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new AppError(404, 'Machine not found');
    }

    try {
      // Create setup sheet with all related data
      const sheet = await db.setupSheet.create({
        data: {
          programId,
          machineId,
          machineType: data.machineType,
          safetyChecklist: safetyChecklist || [],
          createdById: userId,
          tools: {
            create: tools.map((tool) => ({
              toolNumber: tool.toolNumber,
              toolName: tool.toolName,
              length: tool.length,
              offsetH: tool.offsetH,
              offsetD: tool.offsetD,
              comment: tool.comment || null,
            })),
          },
          originOffsets: {
            create: originOffsets.map((offset) => ({
              name: offset.name,
              x: offset.x,
              y: offset.y,
              z: offset.z,
              a: offset.a || 0,
              b: offset.b || 0,
              c: offset.c || 0,
            })),
          },
          fixtures: {
            create: (fixtures || []).map((fixture) => ({
              fixtureId: fixture.fixtureId,
              quantity: fixture.quantity,
              setupDescription: fixture.setupDescription || null,
            })),
          },
          media: {
            create: (media || []).filter(m => m.url && m.url.trim() !== '').map((item, index) => ({
              type: item.type,
              url: item.url,
              caption: item.caption || null,
              annotations: item.annotations || [],
              order: item.order !== undefined ? item.order : index,
            })),
          },
        },
        include: {
          tools: true,
          originOffsets: true,
          fixtures: true,
          media: true,
        },
      });

      // Update program to indicate it has a setup sheet
      await db.nCProgram.update({
        where: { id: programId },
        data: { hasSetupSheet: true },
      });

      // Return the sheet - Express will serialize it correctly
      return sheet;
    } catch (error: any) {
      console.error('Error creating setup sheet:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.meta) {
        console.error('Error meta:', JSON.stringify(error.meta, null, 2));
      }
      throw error;
    }
  }

  /**
   * Update an existing setup sheet
   * 
   * @param id - Setup sheet UUID
   * @param data - Updated setup sheet data
   * @returns Updated setup sheet
   */
  async updateSetupSheet(id: string, data: UpdateSetupSheetInput) {
    // Check if setup sheet exists
    await this.getSetupSheetById(id);

    const { tools, originOffsets, fixtures, media, ...basicData } = data;

    // Update basic data
    const updated = await db.setupSheet.update({
      where: { id },
      data: basicData,
    });

    // Update tools if provided
    if (tools) {
      await db.tool.deleteMany({ where: { setupSheetId: id } });
      await db.tool.createMany({
        data: tools.map((tool) => ({
          setupSheetId: id,
          ...tool,
        })),
      });
    }

    // Update origin offsets if provided
    if (originOffsets) {
      await db.originOffset.deleteMany({ where: { setupSheetId: id } });
      await db.originOffset.createMany({
        data: originOffsets.map((offset) => ({
          setupSheetId: id,
          ...offset,
        })),
      });
    }

    // Update fixtures if provided
    if (fixtures) {
      await db.fixture.deleteMany({ where: { setupSheetId: id } });
      await db.fixture.createMany({
        data: fixtures.map((fixture) => ({
          setupSheetId: id,
          ...fixture,
        })),
      });
    }

    // Update media if provided
    if (media) {
      await db.media.deleteMany({ where: { setupSheetId: id } });
      await db.media.createMany({
        data: media.map((item, index) => ({
          setupSheetId: id,
          ...item,
          order: item.order !== undefined ? item.order : index,
        })),
      });
    }

    // Fetch and return updated sheet
    return await this.getSetupSheetById(id);
  }

  /**
   * Delete a setup sheet
   * 
   * @param id - Setup sheet UUID
   */
  async deleteSetupSheet(id: string): Promise<void> {
    const sheet = await this.getSetupSheetById(id);

    // Delete setup sheet (cascade will delete related data)
    await db.setupSheet.delete({
      where: { id },
    });

    // Check if program has other setup sheets
    const remainingSheets = await db.setupSheet.count({
      where: { programId: sheet.programId },
    });

    if (remainingSheets === 0) {
      await db.nCProgram.update({
        where: { id: sheet.programId },
        data: { hasSetupSheet: false },
      });
    }
  }

  /**
   * Approve a setup sheet
   * 
   * @param id - Setup sheet UUID
   * @param approverId - ID of approving user
   * @returns Updated setup sheet
   */
  async approveSetupSheet(id: string, approverId: string) {
    await this.getSetupSheetById(id);

    const updated = await db.setupSheet.update({
      where: { id },
      data: {
        approvedById: approverId,
        approvedAt: new Date(),
      },
      include: {
        tools: true,
        originOffsets: true,
        fixtures: true,
        media: true,
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return updated;
  }
}

// Export singleton instance
export const setupSheetService = new SetupSheetService();


