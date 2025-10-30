/**
 * NC Program API routes
 * Following Cursor Clause 4.5 Rules
 */

import { Router } from 'express';
import { programService } from '../../services/program.service';
import { db } from '../../db/client';
import { asyncHandler } from '../../middleware/error-handler';
import { validate } from '../../middleware/validate';
import {
  createProgramSchema,
  updateProgramSchema,
  programQuerySchema,
  approveProgramSchema,
} from '../schemas/program.schema';

const router = Router();

/**
 * GET /api/programs
 * Get all programs with filtering and pagination
 */
router.get(
  '/',
  validate(programQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const q = (req as any)._validated?.query ?? (req.query as any);
    const result = await programService.getPrograms(q as any);
    res.json({ success: true, ...result });
  })
);

/**
 * GET /api/programs/:id
 * Get a single program by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const program = await programService.getProgramById(req.params.id);
    res.json({ success: true, data: program });
  })
);

/**
 * POST /api/programs
 * Create a new program
 */
router.post(
  '/',
  validate(createProgramSchema, 'body'),
  asyncHandler(async (req, res) => {
    // Temporary author resolution: pick first user or create a system user
    let author = await db.user.findFirst();
    if (!author) {
      author = await db.user.create({
        data: { email: 'system@local', name: 'System', role: 'admin' },
      });
    }
    const authorId = author.id;
    const program = await programService.createProgram(req.body, authorId);
    res.status(201).json({ success: true, data: program });
  })
);

/**
 * PUT /api/programs/:id
 * Update an existing program
 */
router.put(
  '/:id',
  validate(updateProgramSchema, 'body'),
  asyncHandler(async (req, res) => {
    const program = await programService.updateProgram(req.params.id, req.body);
    res.json({ success: true, data: program });
  })
);

/**
 * DELETE /api/programs/:id
 * Delete a program
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await programService.deleteProgram(req.params.id);
    res.json({ success: true, message: 'Program deleted successfully' });
  })
);

/**
 * POST /api/programs/:id/approve
 * Approve or change program status
 */
router.post(
  '/:id/approve',
  validate(approveProgramSchema, 'body'),
  asyncHandler(async (req, res) => {
    // TODO: Get actual user ID from authentication middleware
    const approverId = 'system-user-id'; // Temporary placeholder
    const program = await programService.updateProgramStatus(
      req.params.id,
      req.body.status,
      approverId
    );
    res.json({ success: true, data: program });
  })
);

/**
 * GET /api/programs/:id/versions
 * Get version history for a program
 */
router.get(
  '/:id/versions',
  asyncHandler(async (req, res) => {
    const versions = await programService.getProgramVersions(req.params.id);
    res.json({ success: true, data: versions });
  })
);

export default router;


