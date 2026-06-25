import { Router } from 'express';
import { sendSuccess } from '../utils/api-response.js';
import mongoose from 'mongoose';
import userRoutes from '../modules/users/user.routes.js';
import workspaceRoutes from '../modules/workspaces/workspace.routes.js';
import projectRoutes from '../modules/projects/project.routes.js';
import taskRoutes from '../modules/tasks/task.routes.js';
import documentRoutes from '../modules/documents/document.routes.js';
import snippetRoutes from '../modules/snippets/snippet.routes.js';
import githubRoutes from '../modules/github/github.routes.js';
import leetcodeRoutes from '../modules/leetcode/leetcode.routes.js';
import uploadRoutes from '../modules/upload/upload.routes.js';
import webhookRoutes from '../modules/webhooks/webhooks.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1
      ? 'connected'
      : dbState === 2
        ? 'connecting'
        : 'disconnected';

  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: dbStatus,
    },
  });
});

router.use('/v1/users', userRoutes);
router.use('/v1/workspaces', workspaceRoutes);
router.use('/v1/workspaces/:workspaceId/projects', projectRoutes);
router.use('/v1/workspaces/:workspaceId/projects/:projectId/tasks', taskRoutes);
router.use('/v1/workspaces/:workspaceId/documents', documentRoutes);
router.use('/v1/workspaces/:workspaceId/snippets', snippetRoutes);
router.use('/v1/integrations/github', githubRoutes);
router.use('/v1/integrations/leetcode', leetcodeRoutes);
router.use('/v1/upload', uploadRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
