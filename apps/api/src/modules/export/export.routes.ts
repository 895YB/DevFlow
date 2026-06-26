import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { globalLimiter } from '../../middleware/rate-limiter.js';
import * as exportController from './export.controller.js';

const router = Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceAccess('viewer'), globalLimiter);

router.get('/', exportController.exportWorkspaceData);

export default router;
