import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { globalLimiter } from '../../middleware/rate-limiter.js';
import type { Response } from 'express';

const router = Router();

router.use(requireAuth, globalLimiter);

router.use((_req, res: Response) => {
  res.status(501).json({
    success: false,
    error: { code: 'NOT_IMPLEMENTED', message: 'AI features are coming soon' },
  });
});

export default router;
