/**
 * Zod validation schemas for NC Program API
 * Following Cursor Clause 4.5 Rules
 */

import { z } from 'zod';

/**
 * Schema for creating a new NC Program
 */
export const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  // Optional to allow auto-numbering per machine
  partNumber: z.string().min(1).optional(),
  revision: z.string().min(1, 'Revision is required'),
  machineId: z.string().uuid('Invalid machine ID'),
  operation: z.string().min(1, 'Operation is required'),
  material: z.string().min(1, 'Material is required'),
  customer: z.string().min(1, 'Customer is required'),
  workOrder: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['Draft', 'In Review', 'Approved', 'Released', 'Obsolete']).default('Draft'),
});

/**
 * Schema for updating an existing NC Program
 */
export const updateProgramSchema = z.object({
  name: z.string().min(1).optional(),
  partNumber: z.string().min(1).optional(),
  revision: z.string().min(1).optional(),
  machineId: z.string().uuid().optional(),
  operation: z.string().min(1).optional(),
  material: z.string().min(1).optional(),
  customer: z.string().min(1).optional(),
  workOrder: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['Draft', 'In Review', 'Approved', 'Released', 'Obsolete']).optional(),
  ncCode: z.string().optional(), // NC program code content
});

/**
 * Schema for program query parameters (search, filter, pagination)
 */
export const programQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['Draft', 'In Review', 'Approved', 'Released', 'Obsolete']).optional(),
  machineId: z.string().uuid().optional(),
  customer: z.string().optional(),
  partNumber: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
  sortBy: z.enum(['name', 'partNumber', 'lastModified', 'customer']).default('lastModified'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema for program approval
 */
export const approveProgramSchema = z.object({
  status: z.enum(['In Review', 'Approved', 'Released']),
  comments: z.string().optional(),
});

/**
 * Schema for file upload
 */
export const fileUploadSchema = z.object({
  type: z.enum(['nc', 'cad', 'dxf', 'document']),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type ProgramQueryInput = z.infer<typeof programQuerySchema>;
export type ApproveProgramInput = z.infer<typeof approveProgramSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;


