/**
 * Machine API routes
 * Following Cursor Clause 4.5 Rules
 */

import { Router } from 'express';
import { machineService } from '../../services/machine.service';
import { asyncHandler } from '../../middleware/error-handler';
import { validate } from '../../middleware/validate';
import {
  createMachineSchema,
  updateMachineSchema,
  machineQuerySchema,
} from '../schemas/machine.schema';
import { z } from 'zod';

const router = Router();

/**
 * GET /api/machines
 * Get all machines with optional filtering
 */
router.get(
  '/',
  validate(machineQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const q = (req as any)._validated?.query ?? (req.query as any);
    const machines = await machineService.getMachines(q as any);
    res.json({ success: true, data: machines });
  })
);

/**
 * GET /api/machines/:id
 * Get a single machine by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const machine = await machineService.getMachineById(req.params.id);
    res.json({ success: true, data: machine });
  })
);

/**
 * POST /api/machines
 * Create a new machine
 */
router.post(
  '/',
  validate(createMachineSchema, 'body'),
  asyncHandler(async (req, res) => {
    const machine = await machineService.createMachine(req.body);
    res.status(201).json({ success: true, data: machine });
  })
);

/**
 * PUT /api/machines/:id
 * Update an existing machine
 */
router.put(
  '/:id',
  validate(updateMachineSchema, 'body'),
  asyncHandler(async (req, res) => {
    const machine = await machineService.updateMachine(req.params.id, req.body);
    res.json({ success: true, data: machine });
  })
);

/**
 * DELETE /api/machines/:id
 * Delete a machine
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await machineService.deleteMachine(req.params.id);
    res.json({ success: true, message: 'Machine deleted successfully' });
  })
);

/**
 * PATCH /api/machines/:id/status
 * Update machine status
 */
router.patch(
  '/:id/status',
  validate(z.object({ status: z.enum(['Online', 'Offline', 'Maintenance']) }), 'body'),
  asyncHandler(async (req, res) => {
    const machine = await machineService.updateMachineStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: machine });
  })
);

/**
 * GET /api/machines/:id/next-program-number
 * Preview next program number for a machine
 */
router.get(
  '/:id/next-program-number',
  asyncHandler(async (req, res) => {
    const machine = await machineService.getMachineById(req.params.id);
    const next = (machine as any).nextProgramNumber || 100;
    res.json({ success: true, data: { next, formatted: String(next).padStart(4, '0') } });
  })
);

export default router;


