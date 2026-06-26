import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { globalLimiter } from '../../middleware/rate-limiter.js';
import * as analyticsController from './analytics.controller.js';

const router = Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceAccess(), globalLimiter);

router.get('/', analyticsController.getAnalytics);

export default router;
