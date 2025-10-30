/**
 * Zod validation schemas for Machine API
 * Following Cursor Clause 4.5 Rules
 */

import { z } from 'zod';

/**
 * Schema for creating a new Machine
 */
export const createMachineSchema = z.object({
  name: z.string().min(1, 'Machine name is required'),
  type: z.string().min(1, 'Machine type is required'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  status: z.enum(['Online', 'Offline', 'Maintenance']).default('Offline'),
  // Relaxed IP validation for compatibility across Zod versions
  ipAddress: z.string().optional(),
  serialPort: z.string().optional(),
  capabilities: z.record(z.any()).optional(),
});

/**
 * Schema for updating a Machine
 */
export const updateMachineSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  status: z.enum(['Online', 'Offline', 'Maintenance']).optional(),
  ipAddress: z.string().optional(),
  serialPort: z.string().optional(),
  capabilities: z.record(z.any()).optional(),
});

/**
 * Schema for machine query parameters
 */
export const machineQuerySchema = z.object({
  type: z.string().optional(),
  status: z.enum(['Online', 'Offline', 'Maintenance']).optional(),
  search: z.string().optional(),
});

export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;
export type MachineQueryInput = z.infer<typeof machineQuerySchema>;


