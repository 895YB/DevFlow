import { z } from 'zod';

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Channel name must be lowercase letters, numbers, or hyphens'),
  description: z.string().max(200).default(''),
});

export const editMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
