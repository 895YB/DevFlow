import { Router } from 'express';
import { handleClerkWebhook } from './clerk.controller.js';

const router = Router();

router.post('/clerk', handleClerkWebhook);

export default router;
