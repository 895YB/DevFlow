import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.js';
import { uploadLimiter } from '../../middleware/rate-limiter.js';
import * as controller from './upload.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

router.use(requireAuth);
router.use(uploadLimiter);

router.post('/image', upload.single('file'), controller.uploadImage);
router.post('/file', upload.single('file'), controller.uploadFile);

export default router;
