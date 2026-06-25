import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { validate } from '../../middleware/validate.js';
import {
  createSnippetSchema,
  updateSnippetSchema,
  createSnippetFolderSchema,
  updateSnippetFolderSchema,
} from '@devflow/shared';
import * as controller from './snippet.controller.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

// Snippets — literal paths first
router.post('/', requireWorkspaceAccess('member'), validate(createSnippetSchema), controller.create);
router.get('/', requireWorkspaceAccess('viewer'), controller.list);

// Folders — must be before /:snippetId to avoid matching "folders" as a snippetId
router.post('/folders', requireWorkspaceAccess('member'), validate(createSnippetFolderSchema), controller.createFolder);
router.get('/folders', requireWorkspaceAccess('viewer'), controller.listFolders);
router.patch('/folders/:folderId', requireWorkspaceAccess('member'), validate(updateSnippetFolderSchema), controller.updateFolder);
router.delete('/folders/:folderId', requireWorkspaceAccess('member'), controller.deleteFolder);

// Snippets — parameterized paths
router.get('/:snippetId', requireWorkspaceAccess('viewer'), controller.getById);
router.patch('/:snippetId', requireWorkspaceAccess('member'), validate(updateSnippetSchema), controller.update);
router.delete('/:snippetId', requireWorkspaceAccess('member'), controller.remove);
router.post('/:snippetId/favorite', requireWorkspaceAccess('viewer'), controller.toggleFavorite);

export default router;
