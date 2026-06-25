import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional().default(''),
  icon: z.string().optional().default(''),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  settings: z
    .object({
      defaultProjectView: z.enum(['kanban', 'list', 'calendar']).optional(),
      allowMemberInvites: z.boolean().optional(),
    })
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
