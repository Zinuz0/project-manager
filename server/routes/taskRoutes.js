import express from 'express';
import { getTaskById, createTask, updateTask, assignTaskToMember, getAllTasksForProject, getAllTasksForMember } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAuthorized } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/:taskId', authMiddleware, isAuthorized(['member']), getTaskById);
router.get('/project/:projectId', authMiddleware, isAuthorized(['member']), getAllTasksForProject);
router.get('/:userId', authMiddleware, getAllTasksForMember); // No projectId here, handle separately
router.put('/:taskId', authMiddleware, isAuthorized(['admin']), updateTask);
router.post('/:taskId/assign', authMiddleware, isAuthorized(['admin']), assignTaskToMember);
router.post('/', authMiddleware, isAuthorized(['admin']), createTask);

export default router;