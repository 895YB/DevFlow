import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { searchLimiter } from '../../middleware/rate-limiter.js';
import * as controller from './leetcode.controller.js';

const router = Router();

router.use(requireAuth);
router.use(searchLimiter);

router.post('/connect', controller.connect);
router.delete('/disconnect', controller.disconnect);
router.get('/profile', controller.getProfile);
router.post('/sync', controller.sync);
router.get('/submissions', controller.getSubmissions);
router.get('/contests', controller.getContests);
router.post('/entries', controller.addEntry);
router.delete('/entries/:entryId', controller.deleteEntry);

export default router;
