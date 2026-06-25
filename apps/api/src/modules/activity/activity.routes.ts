import { Router } from 'express';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { globalLimiter } from '../../middleware/rate-limiter.js';
import * as ctrl from './activity.controller.js';

const router = Router({ mergeParams: true });

router.use(requireWorkspaceAccess(), globalLimiter);
router.get('/', ctrl.list);

export default router;
