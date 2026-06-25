import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { validate } from '../../middleware/validate.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  moveDocumentSchema,
  reorderDocumentsSchema,
} from '@devflow/shared';
import * as controller from './document.controller.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', requireWorkspaceAccess('member'), validate(createDocumentSchema), controller.create);
router.get('/', requireWorkspaceAccess('viewer'), controller.list);
router.get('/search', requireWorkspaceAccess('viewer'), controller.search);
router.patch('/reorder', requireWorkspaceAccess('member'), validate(reorderDocumentsSchema), controller.reorder);
router.get('/:docId', requireWorkspaceAccess('viewer'), controller.getById);
router.patch('/:docId', requireWorkspaceAccess('member'), validate(updateDocumentSchema), controller.update);
router.delete('/:docId', requireWorkspaceAccess('member'), controller.remove);
router.patch('/:docId/move', requireWorkspaceAccess('member'), validate(moveDocumentSchema), controller.move);

// Versions
router.get('/:docId/versions', requireWorkspaceAccess('viewer'), controller.getVersions);
router.get('/:docId/versions/:versionId', requireWorkspaceAccess('viewer'), controller.getVersion);
router.post('/:docId/versions/:versionId/restore', requireWorkspaceAccess('member'), controller.restoreVersion);

export default router;
