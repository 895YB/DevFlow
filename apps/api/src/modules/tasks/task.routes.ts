import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireWorkspaceAccess } from '../../middleware/workspace-access.js';
import { validate } from '../../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  reorderTasksSchema,
  bulkUpdateTasksSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
  createCommentSchema,
  updateCommentSchema,
  reorderSchema,
} from '@devflow/shared';
import * as controller from './task.controller.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', requireWorkspaceAccess('member'), validate(createTaskSchema), controller.create);
router.get('/', requireWorkspaceAccess('viewer'), controller.list);
router.patch('/reorder', requireWorkspaceAccess('member'), validate(reorderTasksSchema), controller.reorder);
router.post('/bulk', requireWorkspaceAccess('member'), validate(bulkUpdateTasksSchema), controller.bulkUpdate);
router.get('/:taskId', requireWorkspaceAccess('viewer'), controller.getById);
router.patch('/:taskId', requireWorkspaceAccess('member'), validate(updateTaskSchema), controller.update);
router.delete('/:taskId', requireWorkspaceAccess('member'), controller.remove);

// Subtasks
router.post('/:taskId/subtasks', requireWorkspaceAccess('member'), validate(createSubtaskSchema), controller.addSubtask);
router.patch('/:taskId/subtasks/reorder', requireWorkspaceAccess('member'), validate(reorderSchema), controller.reorderSubtasks);
router.patch('/:taskId/subtasks/:subtaskId', requireWorkspaceAccess('member'), validate(updateSubtaskSchema), controller.updateSubtask);
router.delete('/:taskId/subtasks/:subtaskId', requireWorkspaceAccess('member'), controller.deleteSubtask);

// Comments
router.get('/:taskId/comments', requireWorkspaceAccess('viewer'), controller.getComments);
router.post('/:taskId/comments', requireWorkspaceAccess('member'), validate(createCommentSchema), controller.addComment);
router.patch('/:taskId/comments/:commentId', requireWorkspaceAccess('member'), validate(updateCommentSchema), controller.updateComment);
router.delete('/:taskId/comments/:commentId', requireWorkspaceAccess('member'), controller.deleteComment);

// Activity
router.get('/:taskId/activities', requireWorkspaceAccess('viewer'), controller.getActivities);

export default router;
