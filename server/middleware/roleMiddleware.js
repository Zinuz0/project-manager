import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';

export const isAuthorized = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      let projectId = req.params.projectId || req.body.projectId;

      // If there's a taskId instead, we need to find the project it belongs to
      if (!projectId && req.params.taskId) {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        projectId = task.project;
      }

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required for authorization' });
      }

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      const userId = req.user.userId;

      const isOwner = project.owner.toString() === userId;
      const isAdmin = project.admin.includes(userId);
      const isMember = project.members.includes(userId);

      if (requiredRoles.includes('owner') && isOwner) return next();
      if (requiredRoles.includes('admin') && (isOwner || isAdmin)) return next();
      if (requiredRoles.includes('member') && (isOwner || isAdmin || isMember)) return next();

      return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    } catch (error) {
      console.error("Authorization Error:", error);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  };
};
