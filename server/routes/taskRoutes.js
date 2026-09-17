import express from 'express';
import { getTaskById, createTask, updateTask, assignTaskToMember, getAllTasksForProject, getAllTasksForMember } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAuthorized } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/:taskId', authMiddleware, isAuthorized, getTaskById);
router.get('/project/:projectId', authMiddleware, getAllTasksForProject);
router.get('/:userId', authMiddleware, getAllTasksForMember);
router.put('/:taskId', authMiddleware, isAuthorized, updateTask);
router.post('/:taskId/assign', authMiddleware, isAuthorized, assignTaskToMember);
router.post('/', authMiddleware, isAuthorized, createTask);

export default router;