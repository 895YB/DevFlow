import { z } from 'zod';

export const createSessionSchema = z.object({
  type: z.enum(['work', 'short-break', 'long-break']),
  duration: z.number().int().min(1).max(120),
  label: z.string().max(200).default(''),
  startedAt: z.string().datetime().optional(),
});

export const completeSessionSchema = z.object({
  completedAt: z.string().datetime().optional(),
});

export const createPlanItemSchema = z.object({
  title: z.string().min(1).max(200),
  scheduledTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .default(null),
  duration: z.number().int().min(1).max(480).nullable().default(null),
  notes: z.string().max(500).default(''),
});

export const updatePlanItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  scheduledTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  duration: z.number().int().min(1).max(480).nullable().optional(),
  done: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;
export type CreatePlanItemInput = z.infer<typeof createPlanItemSchema>;
export type UpdatePlanItemInput = z.infer<typeof updatePlanItemSchema>;
