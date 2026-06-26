import { describe, it, expect } from 'vitest';
import { parsePagination, buildPaginationMeta } from '../pagination.js';

describe('parsePagination', () => {
  it('returns defaults when no options provided', () => {
    const result = parsePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  it('calculates skip correctly', () => {
    const result = parsePagination({ page: 3, limit: 10 });
    expect(result.skip).toBe(20);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
  });

  it('clamps page to minimum of 1', () => {
    expect(parsePagination({ page: 0 }).page).toBe(1);
    expect(parsePagination({ page: -5 }).page).toBe(1);
  });

  it('clamps limit to minimum of 1', () => {
    expect(parsePagination({ limit: 0 }).limit).toBe(1);
    expect(parsePagination({ limit: -10 }).limit).toBe(1);
  });

  it('clamps limit to maximum of 100', () => {
    expect(parsePagination({ limit: 500 }).limit).toBe(100);
    expect(parsePagination({ limit: 101 }).limit).toBe(100);
  });

  it('accepts limit of exactly 100', () => {
    expect(parsePagination({ limit: 100 }).limit).toBe(100);
  });

  it('page 1 always gives skip 0', () => {
    expect(parsePagination({ page: 1, limit: 50 }).skip).toBe(0);
  });
});

describe('buildPaginationMeta', () => {
  it('calculates totalPages correctly', () => {
    const meta = buildPaginationMeta(1, 20, 100);
    expect(meta.totalPages).toBe(5);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(20);
    expect(meta.total).toBe(100);
  });

  it('rounds up totalPages for non-even division', () => {
    const meta = buildPaginationMeta(1, 20, 21);
    expect(meta.totalPages).toBe(2);
  });

  it('returns 0 totalPages when total is 0', () => {
    const meta = buildPaginationMeta(1, 20, 0);
    expect(meta.totalPages).toBe(0);
  });

  it('returns 1 totalPage when total equals limit', () => {
    const meta = buildPaginationMeta(1, 10, 10);
    expect(meta.totalPages).toBe(1);
  });

  it('returns 1 totalPage when total is less than limit', () => {
    const meta = buildPaginationMeta(1, 20, 5);
    expect(meta.totalPages).toBe(1);
  });
});
