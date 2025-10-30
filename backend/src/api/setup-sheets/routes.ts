/**
 * Setup Sheet API routes
 * Following Cursor Clause 4.5 Rules
 */

import { Router } from 'express';
import { setupSheetService } from '../../services/setup-sheet.service';
import { asyncHandler } from '../../middleware/error-handler';
import { validate } from '../../middleware/validate';
import {
  createSetupSheetSchema,
  updateSetupSheetSchema,
  approveSetupSheetSchema,
} from '../schemas/setup-sheet.schema';
import { db } from '../../db/client';
import { uploadMedia, deleteMedia } from './upload';

const router = Router();

/**
 * GET /api/setup-sheets?programId=xxx
 * Get all setup sheets for a program
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = (req as any)._validated?.query ?? (req.query as any);
    const programId = q?.programId as string;
    if (!programId) {
      return res.status(400).json({
        success: false,
        error: 'programId query parameter is required',
      });
    }

    const sheets = await setupSheetService.getSetupSheetsByProgram(programId);
    res.json({ success: true, data: sheets });
  })
);

/**
 * GET /api/setup-sheets/:id
 * Get a single setup sheet by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const sheet = await setupSheetService.getSetupSheetById(req.params.id);
    res.json({ success: true, data: sheet });
  })
);

/**
 * POST /api/setup-sheets
 * Create a new setup sheet
 */
router.post(
  '/',
  validate(createSetupSheetSchema, 'body'),
  asyncHandler(async (req, res) => {
    try {
      // Temporary user resolution
      let user = await db.user.findFirst();
      if (!user) {
        user = await db.user.create({ data: { email: 'system@local', name: 'System', role: 'admin' } });
      }
      const userId = user.id;
      const sheet = await setupSheetService.createSetupSheet(req.body, userId);
      
      // Ensure response is serializable
      const serializedSheet = {
        ...sheet,
        createdAt: sheet.createdAt instanceof Date ? sheet.createdAt.toISOString() : sheet.createdAt,
        updatedAt: sheet.updatedAt instanceof Date ? sheet.updatedAt.toISOString() : sheet.updatedAt,
        approvedAt: sheet.approvedAt instanceof Date ? sheet.approvedAt.toISOString() : sheet.approvedAt,
        tools: sheet.tools?.map((tool: any) => ({
          ...tool,
          createdAt: tool.createdAt instanceof Date ? tool.createdAt.toISOString() : tool.createdAt,
          updatedAt: tool.updatedAt instanceof Date ? tool.updatedAt.toISOString() : tool.updatedAt,
        })) || [],
        originOffsets: sheet.originOffsets || [],
        fixtures: sheet.fixtures || [],
        media: sheet.media?.map((item: any) => ({
          ...item,
          createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
          updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
        })) || [],
      };
      
      res.status(201).json({ success: true, data: serializedSheet });
    } catch (error: any) {
      console.error('Error in POST /api/setup-sheets:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
      });
      throw error; // Let asyncHandler catch it
    }
  })
);

/**
 * PUT /api/setup-sheets/:id
 * Update an existing setup sheet
 */
router.put(
  '/:id',
  validate(updateSetupSheetSchema, 'body'),
  asyncHandler(async (req, res) => {
    const sheet = await setupSheetService.updateSetupSheet(req.params.id, req.body);
    res.json({ success: true, data: sheet });
  })
);

/**
 * DELETE /api/setup-sheets/:id
 * Delete a setup sheet
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await setupSheetService.deleteSetupSheet(req.params.id);
    res.json({ success: true, message: 'Setup sheet deleted successfully' });
  })
);

/**
 * POST /api/setup-sheets/:id/approve
 * Approve a setup sheet
 */
router.post(
  '/:id/approve',
  validate(approveSetupSheetSchema, 'body'),
  asyncHandler(async (req, res) => {
    if (!req.body.approved) {
      return res.json({ success: true, message: 'Approval revoked' });
    }

    let approver = await db.user.findFirst();
    if (!approver) {
      approver = await db.user.create({ data: { email: 'system@local', name: 'System', role: 'admin' } });
    }
    const approverId = approver.id;
    const sheet = await setupSheetService.approveSetupSheet(req.params.id, approverId);
    res.json({ success: true, data: sheet });
  })
);

/**
 * POST /api/setup-sheets/:id/upload
 * Upload media files for setup sheet
 */
router.post('/:id/upload', uploadMedia);

/**
 * DELETE /api/setup-sheets/:id/media/:mediaId
 * Delete media file
 */
router.delete('/:id/media/:mediaId', deleteMedia);

export default router;


