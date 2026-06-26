import { describe, it, expect } from 'vitest';
import {
  updateUserProfileSchema,
  updateAvatarSchema,
  updateUserPreferencesSchema,
} from '../user.schema.js';

describe('updateUserProfileSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateUserProfileSchema.parse({})).toEqual({});
  });

  it('accepts valid displayName', () => {
    const result = updateUserProfileSchema.parse({ displayName: 'Alice' });
    expect(result.displayName).toBe('Alice');
  });

  it('rejects displayName that is empty string', () => {
    expect(() => updateUserProfileSchema.parse({ displayName: '' })).toThrow();
  });

  it('rejects displayName exceeding 100 characters', () => {
    expect(() =>
      updateUserProfileSchema.parse({ displayName: 'a'.repeat(101) }),
    ).toThrow();
  });

  it('rejects bio exceeding 500 characters', () => {
    expect(() =>
      updateUserProfileSchema.parse({ bio: 'x'.repeat(501) }),
    ).toThrow();
  });

  it('accepts valid portfolioUrl', () => {
    const result = updateUserProfileSchema.parse({
      profile: { portfolioUrl: 'https://example.com' },
    });
    expect(result.profile?.portfolioUrl).toBe('https://example.com');
  });

  it('accepts empty string for portfolioUrl (clearing the field)', () => {
    const result = updateUserProfileSchema.parse({
      profile: { portfolioUrl: '' },
    });
    expect(result.profile?.portfolioUrl).toBe('');
  });

  it('rejects invalid URL for portfolioUrl', () => {
    expect(() =>
      updateUserProfileSchema.parse({ profile: { portfolioUrl: 'not-a-url' } }),
    ).toThrow();
  });

  it('rejects skills array exceeding 20 items', () => {
    expect(() =>
      updateUserProfileSchema.parse({
        profile: { skills: Array.from({ length: 21 }, (_, i) => `skill${i}`) },
      }),
    ).toThrow();
  });

  it('rejects individual skill exceeding 50 characters', () => {
    expect(() =>
      updateUserProfileSchema.parse({ profile: { skills: ['x'.repeat(51)] } }),
    ).toThrow();
  });

  it('rejects githubUsername exceeding 39 characters', () => {
    expect(() =>
      updateUserProfileSchema.parse({ profile: { githubUsername: 'a'.repeat(40) } }),
    ).toThrow();
  });

  it('accepts valid website and linkedinUrl', () => {
    const result = updateUserProfileSchema.parse({
      profile: {
        website: 'https://mysite.dev',
        linkedinUrl: 'https://linkedin.com/in/alice',
      },
    });
    expect(result.profile?.website).toBe('https://mysite.dev');
    expect(result.profile?.linkedinUrl).toBe('https://linkedin.com/in/alice');
  });

  it('accepts full valid profile', () => {
    const input = {
      displayName: 'Alice Dev',
      bio: 'Full-stack engineer',
      profile: {
        skills: ['TypeScript', 'React'],
        githubUsername: 'alicedev',
        leetcodeUsername: 'alice123',
        portfolioUrl: 'https://alice.dev',
        location: 'Berlin, Germany',
        website: '',
        linkedinUrl: '',
        timezone: 'Europe/Berlin',
        preferredLanguage: 'English',
      },
    };
    expect(() => updateUserProfileSchema.parse(input)).not.toThrow();
  });
});

describe('updateAvatarSchema', () => {
  it('accepts valid HTTPS URL', () => {
    const result = updateAvatarSchema.parse({ avatarUrl: 'https://cdn.example.com/avatar.jpg' });
    expect(result.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');
  });

  it('rejects missing avatarUrl', () => {
    expect(() => updateAvatarSchema.parse({})).toThrow();
  });

  it('rejects non-URL string', () => {
    expect(() => updateAvatarSchema.parse({ avatarUrl: 'not-a-url' })).toThrow();
  });

  it('rejects empty string', () => {
    expect(() => updateAvatarSchema.parse({ avatarUrl: '' })).toThrow();
  });
});

describe('updateUserPreferencesSchema', () => {
  it('accepts empty object', () => {
    expect(updateUserPreferencesSchema.parse({})).toEqual({});
  });

  it('accepts valid theme values', () => {
    for (const theme of ['light', 'dark', 'system'] as const) {
      expect(updateUserPreferencesSchema.parse({ theme }).theme).toBe(theme);
    }
  });

  it('rejects invalid theme value', () => {
    expect(() => updateUserPreferencesSchema.parse({ theme: 'blue' })).toThrow();
  });

  it('accepts partial notification preferences', () => {
    const result = updateUserPreferencesSchema.parse({
      notifications: { email: true, inApp: false },
    });
    expect(result.notifications?.email).toBe(true);
    expect(result.notifications?.inApp).toBe(false);
  });

  it('accepts all notification fields', () => {
    const notifs = {
      email: true,
      inApp: true,
      browser: false,
      taskAssigned: true,
      taskComment: false,
      mentions: true,
      projectUpdates: false,
      chatMessages: true,
      githubNotifications: false,
      leetcodeNotifications: true,
      teamActivity: false,
      documentUpdates: true,
    };
    const result = updateUserPreferencesSchema.parse({ notifications: notifs });
    expect(result.notifications).toMatchObject(notifs);
  });

  it('rejects non-boolean notification value', () => {
    expect(() =>
      updateUserPreferencesSchema.parse({ notifications: { email: 'yes' } }),
    ).toThrow();
  });
});
