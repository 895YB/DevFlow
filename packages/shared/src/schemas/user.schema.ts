import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  profile: z
    .object({
      skills: z.array(z.string().max(50)).max(20).optional(),
      githubUsername: z.string().max(39).optional(),
      leetcodeUsername: z.string().max(50).optional(),
      portfolioUrl: z.string().url().or(z.literal('')).optional(),
      location: z.string().max(100).optional(),
    })
    .optional(),
});

export const updateUserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      inApp: z.boolean().optional(),
      browser: z.boolean().optional(),
      taskAssigned: z.boolean().optional(),
      taskComment: z.boolean().optional(),
      mentions: z.boolean().optional(),
      projectUpdates: z.boolean().optional(),
      chatMessages: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserPreferencesInput = z.infer<
  typeof updateUserPreferencesSchema
>;
