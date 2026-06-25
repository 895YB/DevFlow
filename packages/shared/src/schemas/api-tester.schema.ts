import { z } from 'zod';

export const keyValuePairSchema = z.object({
  key: z.string().max(200),
  value: z.string().max(2000),
  enabled: z.boolean().default(true),
});

export const requestBodySchema = z.object({
  type: z.enum(['none', 'json', 'form', 'raw']).default('none'),
  content: z.string().max(100_000).default(''),
});

export const requestAuthSchema = z.object({
  type: z.enum(['none', 'bearer', 'basic', 'apikey']).default('none'),
  bearer: z.string().max(2000).optional(),
  username: z.string().max(200).optional(),
  password: z.string().max(200).optional(),
  apiKeyName: z.string().max(200).optional(),
  apiKeyValue: z.string().max(2000).optional(),
  apiKeyIn: z.enum(['header', 'query']).optional(),
});

export const apiRequestInputSchema = z.object({
  name: z.string().min(1).max(100),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  url: z.string().max(2000).default(''),
  params: z.array(keyValuePairSchema).max(50).default([]),
  headers: z.array(keyValuePairSchema).max(50).default([]),
  body: requestBodySchema.default({ type: 'none', content: '' }),
  auth: requestAuthSchema.default({ type: 'none' }),
  order: z.number().int().min(0).default(0),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(''),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const proxyRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  url: z.string().min(1).max(2000),
  headers: z.array(keyValuePairSchema).max(50).default([]),
  params: z.array(keyValuePairSchema).max(50).default([]),
  body: requestBodySchema.default({ type: 'none', content: '' }),
  auth: requestAuthSchema.default({ type: 'none' }),
});

export const createEnvironmentSchema = z.object({
  name: z.string().min(1).max(100),
  variables: z
    .array(
      z.object({
        key: z.string().max(100),
        value: z.string().max(2000),
        enabled: z.boolean().default(true),
      }),
    )
    .max(50)
    .default([]),
});

export const updateEnvironmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  variables: z
    .array(
      z.object({
        key: z.string().max(100),
        value: z.string().max(2000),
        enabled: z.boolean().default(true),
      }),
    )
    .max(50)
    .optional(),
});

export type ApiRequestInput = z.infer<typeof apiRequestInputSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type ProxyRequestInput = z.infer<typeof proxyRequestSchema>;
export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>;
