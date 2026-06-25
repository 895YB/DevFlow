import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { searchLimiter } from '../../middleware/rate-limiter.js';
import { validate } from '../../middleware/validate.js';
import {
  proxyRequestSchema,
  createCollectionSchema,
  updateCollectionSchema,
  apiRequestInputSchema,
  createEnvironmentSchema,
  updateEnvironmentSchema,
} from '@devflow/shared';
import * as controller from './api-tester.controller.js';

const router = Router();

router.use(requireAuth);
router.use(searchLimiter);

// Proxy
router.post('/proxy', validate(proxyRequestSchema), controller.proxy);

// History
router.get('/history', controller.getHistory);
router.delete('/history', controller.clearHistory);

// Collections
router.get('/collections', controller.listCollections);
router.post('/collections', validate(createCollectionSchema), controller.createCollection);
router.get('/collections/:collectionId', controller.getCollection);
router.put('/collections/:collectionId', validate(updateCollectionSchema), controller.updateCollection);
router.delete('/collections/:collectionId', controller.deleteCollection);

// Requests (nested under a collection)
router.post(
  '/collections/:collectionId/requests',
  validate(apiRequestInputSchema),
  controller.addRequest,
);
router.put(
  '/collections/:collectionId/requests/:requestId',
  validate(apiRequestInputSchema.partial()),
  controller.updateRequest,
);
router.delete(
  '/collections/:collectionId/requests/:requestId',
  controller.deleteRequest,
);

// Environments
router.get('/environments', controller.listEnvironments);
router.post('/environments', validate(createEnvironmentSchema), controller.createEnvironment);
router.put('/environments/:envId', validate(updateEnvironmentSchema), controller.updateEnvironment);
router.delete('/environments/:envId', controller.deleteEnvironment);
router.patch('/environments/:envId/activate', controller.activateEnvironment);

export default router;
