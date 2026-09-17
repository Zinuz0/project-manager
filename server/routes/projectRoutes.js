import express from 'express';
import { getProjects, createProject, editProject, deleteProject, addMemberToProject, removeMemberFromProject , getProjectById} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
// add auth middleware to protect the routes

router.get('/',authMiddleware, getProjects);
router.post('/', authMiddleware, createProject);
router.get('/:projectId', authMiddleware, getProjectById);
router.put('/:projectId', authMiddleware, editProject);
router.delete('/:projectId', authMiddleware, deleteProject);
router.post('/:projectId/members', authMiddleware, addMemberToProject);
router.delete('/:projectId/members/:userId', authMiddleware, removeMemberFromProject);


export default router;
