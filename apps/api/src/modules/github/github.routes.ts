import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { searchLimiter } from '../../middleware/rate-limiter.js';
import * as controller from './github.controller.js';

const router = Router();

router.use(requireAuth);
router.use(searchLimiter);

router.post('/connect', controller.connect);
router.delete('/disconnect', controller.disconnect);
router.get('/status', controller.getStatus);
router.get('/repos', controller.listRepos);
router.get('/repos/:owner/:repo/commits', controller.getCommits);
router.get('/repos/:owner/:repo/pulls', controller.getPulls);
router.get('/repos/:owner/:repo/issues', controller.getIssues);
router.get('/activity', controller.getActivity);

export default router;
