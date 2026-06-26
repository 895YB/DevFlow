import { describe, it, expect } from 'vitest';
import {
  createTaskSchema,
  updateTaskSchema,
  createCommentSchema,
  taskQuerySchema,
  reorderTasksSchema,
  bulkUpdateTasksSchema,
} from '../task.schema.js';

describe('createTaskSchema', () => {
  it('accepts minimal valid task', () => {
    const result = createTaskSchema.parse({ title: 'Fix the bug' });
    expect(result.title).toBe('Fix the bug');
    expect(result.priority).toBe('none');
    expect(result.assignees).toEqual([]);
    expect(result.labels).toEqual([]);
    expect(result.description).toBe('');
  });

  it('rejects empty title', () => {
    expect(() => createTaskSchema.parse({ title: '' })).toThrow();
  });

  it('rejects title exceeding 200 characters', () => {
    expect(() => createTaskSchema.parse({ title: 'x'.repeat(201) })).toThrow();
  });

  it('accepts valid priority values', () => {
    for (const priority of ['none', 'low', 'medium', 'high', 'urgent'] as const) {
      const result = createTaskSchema.parse({ title: 'Task', priority });
      expect(result.priority).toBe(priority);
    }
  });

  it('rejects invalid priority', () => {
    expect(() =>
      createTaskSchema.parse({ title: 'Task', priority: 'critical' }),
    ).toThrow();
  });

  it('accepts valid ISO datetime for dueDate', () => {
    const result = createTaskSchema.parse({
      title: 'Task',
      dueDate: '2025-12-31T00:00:00.000Z',
    });
    expect(result.dueDate).toBe('2025-12-31T00:00:00.000Z');
  });

  it('accepts null dueDate', () => {
    const result = createTaskSchema.parse({ title: 'Task', dueDate: null });
    expect(result.dueDate).toBeNull();
  });

  it('rejects invalid datetime for dueDate', () => {
    expect(() =>
      createTaskSchema.parse({ title: 'Task', dueDate: '2025-13-99' }),
    ).toThrow();
  });
});

describe('updateTaskSchema', () => {
  it('accepts empty object', () => {
    expect(updateTaskSchema.parse({})).toEqual({});
  });

  it('accepts partial updates', () => {
    const result = updateTaskSchema.parse({ priority: 'high', title: 'Updated' });
    expect(result.priority).toBe('high');
    expect(result.title).toBe('Updated');
  });

  it('rejects empty title on update', () => {
    expect(() => updateTaskSchema.parse({ title: '' })).toThrow();
  });
});

describe('createCommentSchema', () => {
  it('accepts valid content', () => {
    const result = createCommentSchema.parse({ content: 'Great work!' });
    expect(result.content).toBe('Great work!');
    expect(result.mentions).toEqual([]);
  });

  it('rejects empty content', () => {
    expect(() => createCommentSchema.parse({ content: '' })).toThrow();
  });

  it('rejects content exceeding 5000 characters', () => {
    expect(() => createCommentSchema.parse({ content: 'x'.repeat(5001) })).toThrow();
  });

  it('accepts mentions array', () => {
    const result = createCommentSchema.parse({
      content: 'Hi @alice',
      mentions: ['user123'],
    });
    expect(result.mentions).toEqual(['user123']);
  });
});

describe('taskQuerySchema', () => {
  it('applies defaults', () => {
    const result = taskQuerySchema.parse({});
    expect(result.sort).toBe('createdAt');
    expect(result.order).toBe('desc');
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
  });

  it('coerces string page/limit to numbers', () => {
    const result = taskQuerySchema.parse({ page: '2', limit: '25' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(25);
  });

  it('rejects limit > 100', () => {
    expect(() => taskQuerySchema.parse({ limit: '101' })).toThrow();
  });

  it('rejects page < 1', () => {
    expect(() => taskQuerySchema.parse({ page: '0' })).toThrow();
  });

  it('accepts valid dueDate filter', () => {
    for (const filter of ['overdue', 'today', 'week'] as const) {
      expect(taskQuerySchema.parse({ dueDate: filter }).dueDate).toBe(filter);
    }
  });
});

describe('reorderTasksSchema', () => {
  it('accepts valid reorder payload', () => {
    const result = reorderTasksSchema.parse({
      tasks: [{ taskId: 'abc123', status: 'in-progress', order: 0 }],
    });
    expect(result.tasks).toHaveLength(1);
  });

  it('rejects negative order', () => {
    expect(() =>
      reorderTasksSchema.parse({
        tasks: [{ taskId: 'abc', status: 'todo', order: -1 }],
      }),
    ).toThrow();
  });
});

describe('bulkUpdateTasksSchema', () => {
  it('accepts valid bulk update', () => {
    const result = bulkUpdateTasksSchema.parse({
      taskIds: ['id1', 'id2'],
      update: { priority: 'high' },
    });
    expect(result.taskIds).toHaveLength(2);
    expect(result.update.priority).toBe('high');
  });

  it('rejects empty taskIds array', () => {
    expect(() =>
      bulkUpdateTasksSchema.parse({ taskIds: [], update: { priority: 'low' } }),
    ).toThrow();
  });
});
