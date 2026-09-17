import Activity from '../models/activityModel.js';

export const createActivity = async (projectId, userId, description) => {
  try {
    const activity = new Activity({
      project: projectId,
      user: userId,
      description,
    });
    await activity.save();
    return activity;
  } 
  catch (error) {
    console.error('Error creating activity log:', error);
  }
};

export const createActivityFromRequest = async (req, res, next) => {
  try {
    const { projectId, actorId, action, entityType, entityId, metadata, description } = req.body;

    // Validate project existence
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Validate actor existence
    const actor = await User.findById(actorId);
    if (!actor) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    const validEntityTypes = ['task', 'comment', 'project'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({ message: 'Invalid entity type' });
    }

    if(!entityId ||  !mongoose.Types.ObjectId.isValid(entityId)) {
      return res.status(400).json({ message: 'Invalid entity ID' });
    }

    // Validate entity existence based on entityType
    let entity;
    if (entityType === 'task') {
      entity = await Task.findById(entityId);
    }
    if (entityType === 'comment') {
      entity = await Comment.findById(entityId);
    }
    if (entityType === 'project') {
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
