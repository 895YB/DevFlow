import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { globalLimiter } from '../../middleware/rate-limiter.js';
import * as ctrl from './notification.controller.js';

const router = Router();

router.use(requireAuth, globalLimiter);

router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);
router.delete('/:id', ctrl.remove);

export default router;
