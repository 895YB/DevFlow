import { z } from 'zod';

export const createSnippetSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  language: z.string().min(1).max(30),
  code: z.string().min(1),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  folder: z.string().nullable().optional().default(null),
  visibility: z.enum(['personal', 'team']).optional().default('personal'),
});

export const updateSnippetSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  language: z.string().min(1).max(30).optional(),
  code: z.string().min(1).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  folder: z.string().nullable().optional(),
  visibility: z.enum(['personal', 'team']).optional(),
});

export const snippetQuerySchema = z.object({
  visibility: z.enum(['personal', 'team']).optional(),
  language: z.string().optional(),
  tag: z.string().optional(),
  folder: z.string().optional(),
  search: z.string().optional(),
  favorites: z.enum(['true', 'false']).optional(),
  sort: z.enum(['createdAt', 'title', 'updatedAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createSnippetFolderSchema = z.object({
  name: z.string().min(1).max(50),
  parent: z.string().nullable().optional().default(null),
});

export const updateSnippetFolderSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
export type SnippetQueryInput = z.infer<typeof snippetQuerySchema>;
export type CreateSnippetFolderInput = z.infer<typeof createSnippetFolderSchema>;
export type UpdateSnippetFolderInput = z.infer<typeof updateSnippetFolderSchema>;
