import express from 'express';
import { getComments, getAllCommentsForTask, createComment } from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/task/:taskId', authMiddleware, getAllCommentsForTask);
router.get('/:taskId', authMiddleware, getComments);
router.post('/', authMiddleware, createComment);

export default router;