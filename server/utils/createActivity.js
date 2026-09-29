import mongoose from 'mongoose';
import Activity from '../models/activityModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import Comment from '../models/commentModel.js';

// Create activity log programmatically
export const createActivity = async (projectId, userId, description) => {
  try {
    const activity = new Activity({
      project: projectId,
      actor: userId,
      description,
    });
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
};

// Create activity log from HTTP request endpoint
export const createActivityFromRequest = async (req, res, next) => {
  try {
    const { projectId, actorId, action, entityType, entityId, metadata, description } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const actor = await User.findById(actorId);
    if (!actor) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    const validEntityTypes = ['task', 'comment', 'project'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({ message: 'Invalid entity type' });
    }

    if (!entityId || !mongoose.Types.ObjectId.isValid(entityId)) {
      return res.status(400).json({ message: 'Invalid entity ID' });
    }

    let entity;
    if (entityType === 'task') {
      entity = await Task.findById(entityId);
    } else if (entityType === 'comment') {
      entity = await Comment.findById(entityId);
    } else if (entityType === 'project') {
      entity = await Project.findById(entityId);
    }

    if (!entity) {
      return res.status(404).json({ message: `${entityType} not found` });
    }

    const activity = new Activity({
      project: projectId,
      actor: actorId,
      action,
      entityType,
      entityId,
      metadata,
      description,
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
};

