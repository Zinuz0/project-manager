import express from 'express';
import { getComments, createComment } from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/', authMiddleware, getComments);
router.post('/', authMiddleware, createComment);

export default router;