import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../types/http-error.js';
import { ErrorCode } from '../types/error.types.js';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Validation failed',
        details: err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      },
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      ...(env.NODE_ENV === 'development' && err instanceof Error && { stack: err.stack }),
    },
  });
};
