import { describe, it, expect } from 'vitest';
import { AppError } from '../app-error.js';

describe('AppError', () => {
  it('is an instance of Error', () => {
    const err = new AppError('oops', 500, 'INTERNAL_ERROR');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('sets message, statusCode, code, and isOperational', () => {
    const err = new AppError('Not found', 404, 'NOT_FOUND');
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.isOperational).toBe(true);
  });

  it('carries optional details array', () => {
    const details = [{ field: 'email', message: 'Invalid format' }];
    const err = AppError.badRequest('Validation failed', details);
    expect(err.details).toEqual(details);
  });

  describe('static factories', () => {
    it('badRequest returns 400 VALIDATION_ERROR', () => {
      const err = AppError.badRequest('Bad input');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('VALIDATION_ERROR');
    });

    it('unauthorized returns 401 UNAUTHORIZED with default message', () => {
      const err = AppError.unauthorized();
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
      expect(err.message).toBe('Authentication required');
    });

    it('unauthorized accepts custom message', () => {
      const err = AppError.unauthorized('Token expired');
      expect(err.message).toBe('Token expired');
    });

    it('forbidden returns 403 FORBIDDEN', () => {
      const err = AppError.forbidden();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    });

    it('notFound returns 404 NOT_FOUND', () => {
      const err = AppError.notFound();
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
    });

    it('notFound accepts custom message', () => {
      const err = AppError.notFound('User not found');
      expect(err.message).toBe('User not found');
    });

    it('conflict returns 409 CONFLICT', () => {
      const err = AppError.conflict('Already exists');
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('CONFLICT');
    });

    it('rateLimited returns 429 RATE_LIMITED', () => {
      const err = AppError.rateLimited();
      expect(err.statusCode).toBe(429);
      expect(err.code).toBe('RATE_LIMITED');
    });

    it('internal returns 500 INTERNAL_ERROR', () => {
      const err = AppError.internal();
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('INTERNAL_ERROR');
    });
  });
});
