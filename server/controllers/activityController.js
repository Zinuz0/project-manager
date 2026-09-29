import Activity from '../models/activityModel.js';

// Get activity logs filtered by project or entity
export const getActivities = async (req, res, next) => {
  try {
    const { projectId, entityType, entityId } = req.query;

    const filter = {};
    if (projectId) filter.project = projectId;
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    const activities = await Activity.find(filter)
      .populate('actor', 'username email')
      .sort({ timestamp: -1 });

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

