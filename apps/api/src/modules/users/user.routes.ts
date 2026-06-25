import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  updateUserProfileSchema,
  updateUserPreferencesSchema,
} from '@devflow/shared';
import * as userController from './user.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateUserProfileSchema), userController.updateMe);
router.patch(
  '/me/preferences',
  validate(updateUserPreferencesSchema),
  userController.updateMyPreferences,
);
router.patch('/me/onboarding', userController.completeOnboarding);
router.get('/:userId', userController.getUserById);

export default router;
