/**
 * Zod validation middleware
 * Following Cursor Clause 4.5 Rules
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware to validate request data against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body', 'query', 'params')
 * @returns Express middleware function
 */
export function validate(
  schema: AnyZodObject,
  target: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);
      if (target === 'body') {
        // body is safe to overwrite
        (req as any).body = validated;
      } else {
        const v = (req as any)._validated || {};
        (req as any)._validated = { ...v, [target]: validated };
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
}


