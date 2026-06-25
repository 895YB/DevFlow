import type { Request } from 'express';
import { validateObjectId } from './validate-id.js';

export function getParam(req: Request, name: string): string | undefined {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export function requireParam(req: Request, name: string): string {
  const value = getParam(req, name);
  if (!value) {
    throw new Error(`Missing required parameter: ${name}`);
  }
  return value;
}

export function requireIdParam(req: Request, name: string): string {
  const value = requireParam(req, name);
  return validateObjectId(value, name);
}
