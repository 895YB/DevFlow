import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { searchLimiter } from '../../middleware/rate-limiter.js';
import * as searchController from './search.controller.js';

const router = Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceAccess(), searchLimiter);

router.get('/', searchController.search);

export default router;
