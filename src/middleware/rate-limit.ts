/**
 * Rate limiting middleware for API protection
 */

import { Request, Response, NextFunction } from 'express';
import { getEnv } from '@/config/env';

const env = getEnv();

interface RateLimitStore {
  [key: string]: Array<number>;
}

const store: RateLimitStore = {};

/**
 * Clean old entries from the store
 */
function cleanStore() {
  const now = Date.now();
  for (const key in store) {
    store[key] = store[key].filter((timestamp) => now - timestamp < env.RATE_LIMIT_WINDOW_MS);
    if (store[key].length === 0) {
      delete store[key];
    }
  }
}

/**
 * Rate limit middleware
 */
export function rateLimitMiddleware(
  windowMs: number = env.RATE_LIMIT_WINDOW_MS,
  maxRequests: number = env.RATE_LIMIT_MAX_REQUESTS
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Clean store periodically
    if (Math.random() < 0.01) {
      cleanStore();
    }

    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[identifier]) {
      store[identifier] = [];
    }

    // Remove old timestamps
    store[identifier] = store[identifier].filter((timestamp) => now - timestamp < windowMs);

    if (store[identifier].length >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((store[identifier][0] + windowMs - now) / 1000),
      });
      return;
    }

    store[identifier].push(now);
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - store[identifier].length));

    next();
  };
}
