import express from 'express';
import { getProjects, createProject, editProject, deleteProject, addMemberToProject, removeMemberFromProject, getProjectById } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAuthorized } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getProjects);
router.post('/', authMiddleware, createProject);
router.get('/:projectId', authMiddleware, isAuthorized(['member']), getProjectById);
router.put('/:projectId', authMiddleware, isAuthorized(['owner']), editProject);
router.delete('/:projectId', authMiddleware, isAuthorized(['owner']), deleteProject);
router.post('/:projectId/members', authMiddleware, isAuthorized(['admin']), addMemberToProject);
router.delete('/:projectId/members/:userId', authMiddleware, isAuthorized(['admin']), removeMemberFromProject);


export default router;
