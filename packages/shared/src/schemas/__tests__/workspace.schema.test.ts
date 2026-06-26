import { describe, it, expect } from 'vitest';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../workspace.schema.js';

describe('createWorkspaceSchema', () => {
  it('accepts valid name', () => {
    const result = createWorkspaceSchema.parse({ name: 'My Workspace' });
    expect(result.name).toBe('My Workspace');
    expect(result.description).toBe('');
    expect(result.icon).toBe('');
  });

  it('rejects empty name', () => {
    expect(() => createWorkspaceSchema.parse({ name: '' })).toThrow();
  });

  it('rejects name exceeding 50 characters', () => {
    expect(() =>
      createWorkspaceSchema.parse({ name: 'a'.repeat(51) }),
    ).toThrow();
  });

  it('rejects description exceeding 500 characters', () => {
    expect(() =>
      createWorkspaceSchema.parse({ name: 'WS', description: 'x'.repeat(501) }),
    ).toThrow();
  });

  it('accepts optional fields', () => {
    const result = createWorkspaceSchema.parse({
      name: 'Dev Team',
      description: 'Our dev workspace',
      icon: '🚀',
    });
    expect(result.icon).toBe('🚀');
    expect(result.description).toBe('Our dev workspace');
  });
});

describe('updateWorkspaceSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateWorkspaceSchema.parse({})).toEqual({});
  });

  it('accepts valid settings', () => {
    const result = updateWorkspaceSchema.parse({
      settings: { defaultProjectView: 'kanban', allowMemberInvites: true },
    });
    expect(result.settings?.defaultProjectView).toBe('kanban');
  });

  it('rejects invalid defaultProjectView', () => {
    expect(() =>
      updateWorkspaceSchema.parse({ settings: { defaultProjectView: 'grid' } }),
    ).toThrow();
  });
});

describe('inviteMemberSchema', () => {
  it('accepts valid email with default role', () => {
    const result = inviteMemberSchema.parse({ email: 'user@example.com' });
    expect(result.email).toBe('user@example.com');
    expect(result.role).toBe('member');
  });

  it('accepts explicit role', () => {
    const result = inviteMemberSchema.parse({ email: 'admin@example.com', role: 'admin' });
    expect(result.role).toBe('admin');
  });

  it('rejects invalid email', () => {
    expect(() => inviteMemberSchema.parse({ email: 'not-an-email' })).toThrow();
  });

  it('rejects owner role (not assignable via invite)', () => {
    expect(() =>
      inviteMemberSchema.parse({ email: 'a@b.com', role: 'owner' }),
    ).toThrow();
  });

  it('accepts all valid roles', () => {
    for (const role of ['admin', 'member', 'viewer'] as const) {
      expect(inviteMemberSchema.parse({ email: 'a@b.com', role }).role).toBe(role);
    }
  });
});

describe('updateMemberRoleSchema', () => {
  it('accepts valid roles', () => {
    for (const role of ['admin', 'member', 'viewer'] as const) {
      expect(updateMemberRoleSchema.parse({ role }).role).toBe(role);
    }
  });

  it('rejects owner role', () => {
    expect(() => updateMemberRoleSchema.parse({ role: 'owner' })).toThrow();
  });

  it('rejects missing role', () => {
    expect(() => updateMemberRoleSchema.parse({})).toThrow();
  });
});
