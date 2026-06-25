import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

interface ClerkJWTPayload {
  sub: string;
  iss: string;
  exp: number;
  iat: number;
}

function decodeJWT(token: string): ClerkJWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1]!, 'base64url').toString('utf-8'),
    );
    return payload as ClerkJWTPayload;
  } catch {
    return null;
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(AppError.unauthorized('Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.slice(7);

  if (env.NODE_ENV === 'development' && !env.CLERK_SECRET_KEY) {
    const payload = decodeJWT(token);
    if (payload?.sub) {
      req.userId = payload.sub;
      next();
      return;
    }
    next(AppError.unauthorized('Invalid token'));
    return;
  }

  const payload = decodeJWT(token);

  if (!payload) {
    next(AppError.unauthorized('Invalid token'));
    return;
  }

  if (payload.exp * 1000 < Date.now()) {
    next(AppError.unauthorized('Token expired'));
    return;
  }

  req.userId = payload.sub;
  next();
}
