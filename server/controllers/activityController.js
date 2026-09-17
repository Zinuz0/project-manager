import Activity from '../models/activityModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import Task from '../models/taskModel.js';


export const getActivities = async (req, res, next) => { // this function is used to get activities based on projectId, entityType, and entityId. If no query params are provided, it returns all activities. its going to be used in the activity feed component.
  try {
    const { projectId, entityType, entityId } = req.query;

    const filter = {};
    if (projectId) {
      filter.project = projectId;
    }
  }
  catch (error) {
    next(error);
  }  
}
