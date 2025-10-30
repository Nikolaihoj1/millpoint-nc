/**
 * Error handling middleware
 * Following Cursor Clause 4.5 Rules
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and formats them consistently
 * 
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: (err.errors || []).map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Custom application error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    console.error('Prisma error:', prismaError.code, prismaError.meta);
    res.status(400).json({
      success: false,
      error: 'Database operation failed',
      details: prismaError.message,
      code: prismaError.code,
      meta: process.env.NODE_ENV === 'development' ? prismaError.meta : undefined,
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * 
 * @param fn - Async route handler function
 * @returns Wrapped function with error handling
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    path: req.originalUrl,
  });
}


