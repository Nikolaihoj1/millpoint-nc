/**
 * Zod validation schemas for Setup Sheet API
 * Following Cursor Clause 4.5 Rules
 */

import { z } from 'zod';

/**
 * Tool schema
 */
export const toolSchema = z.object({
  toolNumber: z.number().int().positive(),
  toolName: z.string().min(1),
  length: z.number(),
  offsetH: z.number(),
  offsetD: z.number(),
  comment: z.string().optional(),
});

/**
 * Origin Offset schema
 */
export const originOffsetSchema = z.object({
  name: z.string().min(1), // G54, G55, etc.
  x: z.number(),
  y: z.number(),
  z: z.number(),
  a: z.number().default(0),
  b: z.number().default(0),
  c: z.number().default(0),
});

/**
 * Fixture schema
 */
export const fixtureSchema = z.object({
  fixtureId: z.string().min(1),
  quantity: z.number().int().positive(),
  setupDescription: z.string().optional(),
});

/**
 * Media schema
 */
export const mediaSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().url().or(z.string().min(1)), // URL or file path
  caption: z.string().optional(),
  annotations: z.array(z.string()).optional(),
  order: z.number().int().default(0),
});

/**
 * Schema for creating a new Setup Sheet
 */
export const createSetupSheetSchema = z.object({
  programId: z.string().uuid('Invalid program ID'),
  machineId: z.string().uuid('Invalid machine ID'),
  machineType: z.string().min(1),
  tools: z.array(toolSchema).min(1, 'At least one tool is required'),
  originOffsets: z.array(originOffsetSchema).min(1, 'At least one origin offset is required'),
  fixtures: z.array(fixtureSchema),
  media: z.array(mediaSchema).max(10, 'Maximum 10 media items allowed'),
  safetyChecklist: z.array(z.string()),
});

/**
 * Schema for updating a Setup Sheet
 */
export const updateSetupSheetSchema = z.object({
  machineType: z.string().min(1).optional(),
  tools: z.array(toolSchema).optional(),
  originOffsets: z.array(originOffsetSchema).optional(),
  fixtures: z.array(fixtureSchema).optional(),
  media: z.array(mediaSchema).optional(),
  safetyChecklist: z.array(z.string()).optional(),
});

/**
 * Schema for setup sheet approval
 */
export const approveSetupSheetSchema = z.object({
  approved: z.boolean(),
  comments: z.string().optional(),
});

export type ToolInput = z.infer<typeof toolSchema>;
export type OriginOffsetInput = z.infer<typeof originOffsetSchema>;
export type FixtureInput = z.infer<typeof fixtureSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type CreateSetupSheetInput = z.infer<typeof createSetupSheetSchema>;
export type UpdateSetupSheetInput = z.infer<typeof updateSetupSheetSchema>;
export type ApproveSetupSheetInput = z.infer<typeof approveSetupSheetSchema>;


