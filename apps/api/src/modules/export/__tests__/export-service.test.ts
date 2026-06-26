import { describe, it, expect } from 'vitest';
import { parseTypes } from '../export.service.js';

describe('parseTypes', () => {
  it('returns all types when input is undefined', () => {
    const result = parseTypes(undefined);
    expect(result).toEqual(['tasks', 'projects', 'documents', 'snippets', 'api_collections']);
  });

  it('returns all types when input is empty string (falsy = default)', () => {
    const result = parseTypes('');
    expect(result).toEqual(['tasks', 'projects', 'documents', 'snippets', 'api_collections']);
  });

  it('parses a single valid type', () => {
    expect(parseTypes('tasks')).toEqual(['tasks']);
  });

  it('parses multiple valid types', () => {
    expect(parseTypes('tasks,projects')).toEqual(['tasks', 'projects']);
  });

  it('filters out unknown types', () => {
    expect(parseTypes('tasks,unknown,projects')).toEqual(['tasks', 'projects']);
  });

  it('trims whitespace around type names', () => {
    expect(parseTypes(' tasks , projects ')).toEqual(['tasks', 'projects']);
  });

  it('returns empty array for all unknown types', () => {
    expect(parseTypes('foo,bar,baz')).toEqual([]);
  });

  it('accepts all valid type names', () => {
    const all = 'tasks,projects,documents,snippets,api_collections';
    expect(parseTypes(all)).toEqual(['tasks', 'projects', 'documents', 'snippets', 'api_collections']);
  });

  it('handles duplicates by returning them as given', () => {
    const result = parseTypes('tasks,tasks');
    expect(result).toEqual(['tasks', 'tasks']);
  });
});
