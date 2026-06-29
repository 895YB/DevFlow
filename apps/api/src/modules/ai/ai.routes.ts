import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { globalLimiter } from '../../middleware/rate-limiter.js';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import * as aiService from './ai.service.js';

const router = Router();
router.use(requireAuth, globalLimiter);

// POST /api/v1/ai/chat — SSE streaming
router.post('/chat', async (req: Request, res: Response) => {
  const { messages, system } = req.body as {
    messages: aiService.ChatMessage[];
    system?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'messages array is required' },
    });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = aiService.streamChat(messages, system);

    stream.on('text', (text: string) => {
      res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
    });

    await stream.finalMessage();
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI service error';
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
  } finally {
    res.end();
  }
});

// POST /api/v1/ai/summarize
router.post(
  '/summarize',
  catchAsync(async (req, res) => {
    const { content } = req.body as { content?: string };
    if (!content || typeof content !== 'string' || !content.trim()) {
      throw AppError.badRequest('content is required');
    }
    const summary = await aiService.summarize(content);
    sendSuccess(res, { summary });
  }),
);

// POST /api/v1/ai/explain-code
router.post(
  '/explain-code',
  catchAsync(async (req, res) => {
    const { code, language } = req.body as { code?: string; language?: string };
    if (!code || typeof code !== 'string' || !code.trim()) {
      throw AppError.badRequest('code is required');
    }
    const result = await aiService.explainCode(code, language);
    sendSuccess(res, result);
  }),
);

// POST /api/v1/ai/suggest-tasks
router.post(
  '/suggest-tasks',
  catchAsync(async (req, res) => {
    const { requirement, projectContext } = req.body as {
      requirement?: string;
      projectContext?: string;
    };
    if (!requirement || typeof requirement !== 'string' || !requirement.trim()) {
      throw AppError.badRequest('requirement is required');
    }
    const result = await aiService.suggestTasks(requirement, projectContext);
    sendSuccess(res, result);
  }),
);

// POST /api/v1/ai/semantic-search
router.post(
  '/semantic-search',
  catchAsync(async (req, res) => {
    const { query, items } = req.body as {
      query?: string;
      items?: aiService.SearchItem[];
    };
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw AppError.badRequest('query is required');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('items array is required and must not be empty');
    }
    const result = await aiService.semanticSearch(query, items);
    sendSuccess(res, result);
  }),
);

export default router;
