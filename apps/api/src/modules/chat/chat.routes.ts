import { Router } from 'express';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { globalLimiter } from '../../middleware/rate-limiter.js';
import * as ctrl from './chat.controller.js';

const router = Router({ mergeParams: true });

router.use(requireWorkspaceAccess(), globalLimiter);

router.get('/channels', ctrl.listChannels);
router.post('/channels', ctrl.createChannel);
router.post('/channels/ensure-general', ctrl.ensureGeneral);
router.delete('/channels/:channelId', ctrl.deleteChannel);

router.get('/channels/:channelId/messages', ctrl.listMessages);
router.patch('/channels/:channelId/messages/:messageId', ctrl.editMessage);
router.delete('/channels/:channelId/messages/:messageId', ctrl.deleteMessage);

export default router;
