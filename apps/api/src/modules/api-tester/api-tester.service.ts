import { ApiCollection, type IApiCollection } from './api-collection.model.js';
import { ApiEnvironment, type IApiEnvironment } from './api-environment.model.js';
import { ApiHistory } from './api-history.model.js';
import { AppError } from '../../utils/app-error.js';
import { logger } from '../../utils/logger.js';
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
  ApiRequestInput,
  ProxyRequestInput,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from '@devflow/shared';

const PROXY_TIMEOUT = 30_000;
const MAX_RESPONSE_BYTES = 1_048_576; // 1 MB
const HISTORY_LIMIT = 50;

// SSRF protection: block requests to private/loopback ranges
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fe[89ab][0-9a-f]:/i,
  /^0\.0\.0\.0$/,
];

function assertSafeUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw AppError.badRequest('Invalid URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw AppError.badRequest('Only http and https protocols are allowed');
  }

  const hostname = parsed.hostname.toLowerCase();
  for (const pattern of BLOCKED_HOST_PATTERNS) {
    if (pattern.test(hostname)) {
      throw AppError.badRequest('Requests to private or loopback addresses are not allowed');
    }
  }

  return parsed;
}

function buildFetchOptions(input: ProxyRequestInput): {
  url: string;
  init: RequestInit;
} {
  // Apply enabled query params
  const url = assertSafeUrl(input.url);
  for (const p of input.params) {
    if (p.enabled && p.key) {
      url.searchParams.append(p.key, p.value);
    }
  }

  const headers: Record<string, string> = {};
  for (const h of input.headers) {
    if (h.enabled && h.key) {
      headers[h.key] = h.value;
    }
  }

  // Auth injection
  const { auth } = input;
  if (auth.type === 'bearer' && auth.bearer) {
    headers['Authorization'] = `Bearer ${auth.bearer}`;
  } else if (auth.type === 'basic' && auth.username) {
    const encoded = Buffer.from(`${auth.username}:${auth.password ?? ''}`).toString('base64');
    headers['Authorization'] = `Basic ${encoded}`;
  } else if (auth.type === 'apikey' && auth.apiKeyName && auth.apiKeyValue) {
    if (auth.apiKeyIn === 'query') {
      url.searchParams.append(auth.apiKeyName, auth.apiKeyValue);
    } else {
      headers[auth.apiKeyName] = auth.apiKeyValue;
    }
  }

  let bodyContent: string | URLSearchParams | undefined;
  if (input.method !== 'GET' && input.method !== 'HEAD') {
    const { body } = input;
    if (body.type === 'json' && body.content) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
      bodyContent = body.content;
    } else if (body.type === 'form' && body.content) {
      // content is JSON-encoded key-value pairs
      try {
        const pairs = JSON.parse(body.content) as Array<{ key: string; value: string; enabled: boolean }>;
        const form = new URLSearchParams();
        for (const p of pairs) {
          if (p.enabled && p.key) form.append(p.key, p.value);
        }
        bodyContent = form.toString();
        headers['Content-Type'] = headers['Content-Type'] ?? 'application/x-www-form-urlencoded';
      } catch {
        bodyContent = body.content;
      }
    } else if (body.type === 'raw' && body.content) {
      bodyContent = body.content;
    }
  }

  return {
    url: url.toString(),
    init: {
      method: input.method,
      headers,
      body: bodyContent,
    },
  };
}

export async function executeProxy(
  userId: string,
  input: ProxyRequestInput,
): Promise<{
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
  size: number;
}> {
  const { url: finalUrl, init } = buildFetchOptions(input);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT);
  const startTime = Date.now();

  try {
    const res = await fetch(finalUrl, { ...init, signal: controller.signal });
    const duration = Date.now() - startTime;

    // Collect response headers
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      // Skip sensitive/hop-by-hop headers
      if (!['set-cookie', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    // Read body with size cap
    const buffer = await res.arrayBuffer();
    const truncated = buffer.byteLength > MAX_RESPONSE_BYTES
      ? buffer.slice(0, MAX_RESPONSE_BYTES)
      : buffer;
    const body = new TextDecoder().decode(truncated);
    const size = buffer.byteLength;

    const result = {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      body,
      duration,
      size,
    };

    // Save to history (non-blocking — failures are logged, not thrown)
    ApiHistory.create({
      userId,
      method: input.method,
      url: finalUrl,
      request: {
        params: input.params,
        headers: input.headers,
        body: input.body,
        auth: { type: input.auth.type }, // never persist auth credentials
      },
      response: result,
      executedAt: new Date(),
    }).catch((err) => logger.error('Failed to save request history', { error: err }));

    return result;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw AppError.badRequest('Request timed out after 30 seconds');
    }
    logger.error('Proxy request failed', { url: finalUrl, error: err });
    throw AppError.badRequest('Request failed. Check the URL and try again.');
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Collections ────────────────────────────────────────────────────────────

export async function listCollections(userId: string): Promise<IApiCollection[]> {
  return ApiCollection.find({ userId }).sort({ createdAt: 1 });
}

export async function getCollectionById(
  userId: string,
  collectionId: string,
): Promise<IApiCollection> {
  const col = await ApiCollection.findOne({ _id: collectionId, userId });
  if (!col) throw AppError.notFound('Collection not found');
  return col;
}

export async function createCollection(
  userId: string,
  input: CreateCollectionInput,
): Promise<IApiCollection> {
  return ApiCollection.create({ userId, ...input });
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  input: UpdateCollectionInput,
): Promise<IApiCollection> {
  const col = await ApiCollection.findOneAndUpdate(
    { _id: collectionId, userId },
    { $set: input },
    { new: true, runValidators: true },
  );
  if (!col) throw AppError.notFound('Collection not found');
  return col;
}

export async function deleteCollection(
  userId: string,
  collectionId: string,
): Promise<void> {
  const result = await ApiCollection.findOneAndDelete({ _id: collectionId, userId });
  if (!result) throw AppError.notFound('Collection not found');
}

// ─── Requests (embedded in Collection) ──────────────────────────────────────

export async function addRequest(
  userId: string,
  collectionId: string,
  input: ApiRequestInput,
): Promise<IApiCollection> {
  const col = await ApiCollection.findOneAndUpdate(
    { _id: collectionId, userId },
    { $push: { requests: { ...input } } },
    { new: true, runValidators: true },
  );
  if (!col) throw AppError.notFound('Collection not found');
  return col;
}

export async function updateRequest(
  userId: string,
  collectionId: string,
  requestId: string,
  input: Partial<ApiRequestInput>,
): Promise<IApiCollection> {
  const setFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    setFields[`requests.$.${key}`] = value;
  }

  const col = await ApiCollection.findOneAndUpdate(
    { _id: collectionId, userId, 'requests._id': requestId },
    { $set: setFields },
    { new: true, runValidators: true },
  );
  if (!col) throw AppError.notFound('Collection or request not found');
  return col;
}

export async function deleteRequest(
  userId: string,
  collectionId: string,
  requestId: string,
): Promise<IApiCollection> {
  const col = await ApiCollection.findOneAndUpdate(
    { _id: collectionId, userId },
    { $pull: { requests: { _id: requestId } } },
    { new: true },
  );
  if (!col) throw AppError.notFound('Collection not found');
  return col;
}

// ─── Environments ────────────────────────────────────────────────────────────

export async function listEnvironments(userId: string): Promise<IApiEnvironment[]> {
  return ApiEnvironment.find({ userId }).sort({ createdAt: 1 });
}

export async function createEnvironment(
  userId: string,
  input: CreateEnvironmentInput,
): Promise<IApiEnvironment> {
  return ApiEnvironment.create({ userId, ...input });
}

export async function updateEnvironment(
  userId: string,
  envId: string,
  input: UpdateEnvironmentInput,
): Promise<IApiEnvironment> {
  const env = await ApiEnvironment.findOneAndUpdate(
    { _id: envId, userId },
    { $set: input },
    { new: true, runValidators: true },
  );
  if (!env) throw AppError.notFound('Environment not found');
  return env;
}

export async function deleteEnvironment(
  userId: string,
  envId: string,
): Promise<void> {
  const result = await ApiEnvironment.findOneAndDelete({ _id: envId, userId });
  if (!result) throw AppError.notFound('Environment not found');
}

export async function activateEnvironment(
  userId: string,
  envId: string,
): Promise<IApiEnvironment> {
  // Deactivate all, then activate the chosen one
  await ApiEnvironment.updateMany({ userId }, { $set: { isActive: false } });
  const env = await ApiEnvironment.findOneAndUpdate(
    { _id: envId, userId },
    { $set: { isActive: true } },
    { new: true },
  );
  if (!env) throw AppError.notFound('Environment not found');
  return env;
}

// ─── History ─────────────────────────────────────────────────────────────────

export async function getHistory(userId: string) {
  return ApiHistory.find({ userId })
    .sort({ executedAt: -1 })
    .limit(HISTORY_LIMIT);
}

export async function clearHistory(userId: string): Promise<void> {
  await ApiHistory.deleteMany({ userId });
}
