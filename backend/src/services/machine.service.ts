/**
 * Machine service - Business logic layer
 * Following Cursor Clause 4.5 Rules
 */

import { db } from '../db/client';
import { AppError } from '../middleware/error-handler';
import {
  CreateMachineInput,
  UpdateMachineInput,
  MachineQueryInput,
} from '../api/schemas/machine.schema';

/**
 * Service class for Machine operations
 * Handles all business logic for machine management
 */
export class MachineService {
  /**
   * Get all machines with optional filtering
   * 
   * @param query - Query parameters for filtering
   * @returns List of machines with program counts
   */
  async getMachines(query: MachineQueryInput = {}) {
    const { type, status, search } = query;

    // Build where clause
    const where: any = {};

    if (type) {
      where.type = { contains: type, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const machines = await db.machine.findMany({
      where,
      include: {
        _count: {
          select: { programs: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform to include program count
    return machines.map((m) => ({
      ...m,
      programCount: m._count.programs,
    }));
  }

  /**
   * Get a single machine by ID
   * 
   * @param id - Machine UUID
   * @returns Machine with full details
   */
  async getMachineById(id: string) {
    const machine = await db.machine.findUnique({
      where: { id },
      include: {
        programs: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            status: true,
          },
          orderBy: { lastModified: 'desc' },
        },
        _count: {
          select: { programs: true },
        },
      },
    });

    if (!machine) {
      throw new AppError(404, 'Machine not found');
    }

    return machine;
  }

  /**
   * Create a new machine
   * 
   * @param data - Machine creation data
   * @returns Created machine
   */
  async createMachine(data: CreateMachineInput) {
    const machine = await db.machine.create({
      data,
    });

    return machine;
  }

  /**
   * Update an existing machine
   * 
   * @param id - Machine UUID
   * @param data - Updated machine data
   * @returns Updated machine
   */
  async updateMachine(id: string, data: UpdateMachineInput) {
    // Check if machine exists
    await this.getMachineById(id);

    const updated = await db.machine.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Delete a machine
   * Only allowed if no programs are associated
   * 
   * @param id - Machine UUID
   */
  async deleteMachine(id: string): Promise<void> {
    const machine = await this.getMachineById(id);

    if (machine._count.programs > 0) {
      throw new AppError(
        400,
        `Cannot delete machine with ${machine._count.programs} associated programs`
      );
    }

    await db.machine.delete({
      where: { id },
    });
  }

  /**
   * Update machine status
   * 
   * @param id - Machine UUID
   * @param status - New status ('Online', 'Offline', 'Maintenance')
   * @returns Updated machine
   */
  async updateMachineStatus(id: string, status: string) {
    await this.getMachineById(id);

    const updated = await db.machine.update({
      where: { id },
      data: { status },
    });

    return updated;
  }
}

// Export singleton instance
export const machineService = new MachineService();


