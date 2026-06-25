import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { globalLimiter } from '../../middleware/rate-limiter.js';
import { validate } from '../../middleware/validate.js';
import {
  createSessionSchema,
  createPlanItemSchema,
  updatePlanItemSchema,
} from '@devflow/shared';
import * as controller from './productivity.controller.js';

const router = Router();

router.use(requireAuth);
router.use(globalLimiter);

// Pomodoro sessions
router.get('/sessions', controller.listSessions);
router.post('/sessions', validate(createSessionSchema), controller.createSession);
router.patch('/sessions/:sessionId', controller.completeSession);

// Statistics
router.get('/stats', controller.getStats);

// Daily planner
router.get('/planner/:date', controller.getPlan);
router.post('/planner/:date/items', validate(createPlanItemSchema), controller.addItem);
router.patch(
  '/planner/:date/items/:itemId',
  validate(updatePlanItemSchema),
  controller.updateItem,
);
router.delete('/planner/:date/items/:itemId', controller.removeItem);

export default router;
