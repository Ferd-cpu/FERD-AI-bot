/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { getEnv } from '@/config/env';

const env = getEnv();

export class APIError extends Error {
  constructor(
    public code: string,
    public statusCode: number = 500,
    message: string = 'Internal Server Error',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[ERROR]', err);

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        ...(env.NODE_ENV === 'development' && { details: err.details }),
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
      statusCode: 500,
    },
    timestamp: new Date().toISOString(),
  });
}
