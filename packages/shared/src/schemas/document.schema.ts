import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional().default(''),
  icon: z.string().optional().default(''),
  parent: z.string().nullable().optional().default(null),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
});

export const moveDocumentSchema = z.object({
  parent: z.string().nullable(),
  order: z.number().int().min(0).optional(),
});

export const reorderDocumentsSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type MoveDocumentInput = z.infer<typeof moveDocumentSchema>;
export type ReorderDocumentsInput = z.infer<typeof reorderDocumentsSchema>;
