import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import { io } from '../server.js';

// Create a new task in a project
export const createTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId, title, description, assigneeIds = [], dueDate } = req.body;

    if (!projectId || !title || !description) {
      return res.status(400).json({ message: 'Project ID, title, and description are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.admin.some(id => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to create a task in this project' });
    }

    // Validate assignee membership
    for (const assigneeId of assigneeIds) {
      const assignee = await User.findById(assigneeId);
      if (!assignee) {
        return res.status(404).json({ message: `Assignee with ID ${assigneeId} not found` });
      }
      if (!project.members.some(id => id.toString() === assigneeId.toString())) {
        return res.status(400).json({ message: `Assignee with ID ${assigneeId} is not a member of the project` });
      }
    }

    const newTask = new Task({
      project: projectId,
      title,
      description,
      assignee: assigneeIds,
      dueDate: dueDate ? new Date(dueDate) : null,
      creator: userId
    });

    await newTask.save();

    for (const assigneeId of assigneeIds) {
      await User.findByIdAndUpdate(assigneeId, { $addToSet: { tasks: newTask._id } });
      io.to(`user ${assigneeId}`).emit('taskAssigned', newTask);
    }

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

// Get a single task by ID
export const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await Task.findById(taskId)
      .populate('project', 'name description')
      .populate('assignee', 'username email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Update task title, description, or status
export const updateTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { taskId } = req.params;
    const { projectId, title, description, status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const targetProjectId = projectId || task.project;
    const project = await Project.findById(targetProjectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.admin.some(id => id.toString() === userId);
    const isAssignee = task.assignee.some(id => id.toString() === userId);
    const isCreator = task.creator?.toString() === userId;

    if (!isOwner && !isAdmin && !isAssignee && !isCreator) {
      return res.status(403).json({ message: 'You are not authorized to update this task' });
    }

    if (isOwner || isAdmin || isCreator) {
      if (title) task.title = title;
      if (description) task.description = description;
    }

    if (status) task.status = status;

    await task.save();

    for (const assigneeId of task.assignee) {
      io.to(`user ${assigneeId}`).emit('taskUpdated', task);
    }

    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { taskId } = req.params;
    const { projectId } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const targetProjectId = projectId || task.project;
    const project = await Project.findById(targetProjectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.admin.some(id => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(taskId);
    await User.updateMany({ tasks: taskId }, { $pull: { tasks: taskId } });

    for (const assigneeId of task.assignee) {
      io.to(`user ${assigneeId}`).emit('taskDeleted', { taskId });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all tasks assigned to a specific user
export const getAllTasksForMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const tasks = await Task.find({ assignee: userId })
      .populate('project', 'name description status')
      .populate('assignee', 'username email');

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get all tasks for a given project
export const getAllTasksForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'username email')
      .populate('project', 'name description status');

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Assign a task to a member
export const assignTaskToMember = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { taskId } = req.params;
    const { assigneeId, projectId } = req.body;

    if (!taskId || !projectId || !assigneeId) {
      return res.status(400).json({ message: 'Task ID, Project ID, and Assignee ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.admin.some(id => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to assign this task' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      return res.status(404).json({ message: 'Assignee not found' });
    }

    if (!project.members.some(id => id.toString() === assigneeId.toString())) {
      return res.status(400).json({ message: 'Assignee is not a member of the project' });
    }

    if (task.assignee.some(id => id.toString() === assigneeId.toString())) {
      return res.status(400).json({ message: 'Assignee is already assigned to this task' });
    }

    task.assignee.push(assigneeId);
    await task.save();
    await User.findByIdAndUpdate(assigneeId, { $addToSet: { tasks: taskId } });

    for (const id of task.assignee) {
      io.to(`user ${id}`).emit('taskUpdated', task);
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Unassign a task from members
export const unassignTaskFromMember = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { taskId } = req.params;
    const { assigneeId, projectId } = req.body;

    if (!taskId || !projectId || !assigneeId) {
      return res.status(400).json({ message: 'Task ID, Project ID, and Assignee ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.admin.some(id => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to unassign this task' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const assigneeIdsToRemove = Array.isArray(assigneeId) ? assigneeId : [assigneeId];

    task.assignee = task.assignee.filter(id => !assigneeIdsToRemove.includes(id.toString()));
    await task.save();
    await User.updateMany({ _id: { $in: assigneeIdsToRemove } }, { $pull: { tasks: taskId } });

    for (const id of task.assignee) {
      io.to(`user ${id}`).emit('taskUpdated', task);
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};