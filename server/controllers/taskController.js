import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';

export const createTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId, title, description, assigneeIds, dueDate } = req.body;

    if (!projectId || !title || !description) {
      return res.status(400).json({ message: 'Project ID, title, and description are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (userId !== project.owner.toString() && !project.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to create a task in this project' });
    }
    
    // Validate assignees existence
    for (const assigneeId of assigneeIds) {
      const assignee = await User.findById(assigneeId);
      if (!assignee) {
        return res.status(404).json({ message: `Assignee with ID ${assigneeId} not found` });
      }
      if(!project.members.includes(assigneeId)) {
        return res.status(400).json({ message: `Assignee with ID ${assigneeId} is not a member of the project` });
      }
      // Add the task to the assignee's tasks array
      await User.findByIdAndUpdate(assigneeId, { $push: { tasks: newTask._id } });
      io.to(`user ${assigneeId}`).emit('taskAssigned', newTask);
    }
    

    const newTask = new Task({
      project: projectId,
      title,
      description,
      assignee: assigneeIds || [],
      dueDate: dueDate ? new Date(dueDate) : null,
      creator: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};
/*
the axios api function for this function would look like this:
export const createTask = async (projectId, title, description, assigneeIds, dueDate) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, { projectId, title, description, assigneeIds, dueDate }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  } 
could i write it like:
export const createTask = async (taskData) => {
    try {
        const response = await axios.post(`${API_URL}/tasks`, { taskData }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

*/

export const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await Task.findById(taskId).populate('project', '').populate('assignee', '');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async(req, res, next) => {
  try{
    const { userId } = req.user;
    const { taskId } = req.params;
    const{projectId, title, description, status} = req.body;

    const task = await Task.findById(taskId);
    if(!task){
      return res.status(404).json({message: 'Task not found'});
    };

    const isProjectMember = await Project.findOne({_id: projectId, members: userId});

    const isTaskAssignee = await Task.findOne({_id: taskId, assignee: userId});

    if(!projectId.owner.toString() === userId && !projectId.admin.includes(userId) && !taskId.assignee.includes(userId) && !isProjectMember && !isTaskAssignee){
      return res.status(403).json({message: 'You are not authorized to update this task'});
    };

    if(userId === task.creator.toString() || projectId.owner.toString() === userId || projectId.admin.includes(userId)){
      if(title) task.title = title;
      if(description) task.description = description;
    }
    if(status) task.status = status; 

    for (const assigneeId of task.assignee) {
      io.to(`user ${assigneeId}`).emit('taskUpdated', task);
    }

    await task.save();
    return res.status(200).json(task);
  } 
  catch(error){
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { taskId } = req.params;
    const { projectId } = req.body; 

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    if (userId !== projectId.owner.toString() && !projectId.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to delete this task' });
    }
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(taskId); 

    await Project.findByIdAndUpdate(projectId, { $pull: { tasks: taskId } }); 
    await User.updateMany({ tasks: taskId }, { $pull: { tasks: taskId } }); // remove the task from all users' tasks array
    
    for (const assigneeId of task.assignee){
      io.to(`user ${assigneeId}, task ${taskId}`).emit('taskDeleted', { taskId });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  }
  catch (error) {
    next(error);
  }
};

export const getAllTasksForMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const tasks = await Task.find({ assignee: userId }).populate('project', 'name description status createdAt updatedAt comments').populate('assignee', 'username email');

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getAllTasksForProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const tasks = await Task.find({ project: projectId }).populate('assignee', 'username email').populate('project', 'name description status createdAt updatedAt comments');
    res.status(200).json(tasks);
  } catch (error){
    next(error);
  }
};

export const assignTaskToMember = async (req, res, next) => {
  try {
    const { userId } = req.user; 
    const {taskId } = req.params;
    const { assigneeId, projectId } = req.body;

    if (!taskId){
      return res.status(400).json({ message: 'Task ID is required' });
    }

    if (!projectId){
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project){
      return res.status(404).json({ message: 'Project not found' });
    }

    if (userId !== project.owner.toString() && !project.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to assign this task' });
    }

    const task = await Task.findById(taskId);
    if (!task){
      return res.status(404).json({ message: 'Task not found' });
    }

    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      return res.status(404).json({ message: 'Assignee not found' });
    } 

    if(!project.members.includes(assigneeId)) {
      return res.status(400).json({ message: 'Assignee is not a member of the project' });
    }

    if(task.assignee.includes(assigneeId)) {
      return res.status(400).json({ message: 'Assignee is already assigned to this task' });
    }

    await task.save();
    await Task.findByIdAndUpdate(taskId, { $addToSet: { assignee: assigneeId } }, { new: true });
    await User.findByIdAndUpdate(assigneeId, { $addToSet: { tasks: taskId } }, { new: true });
    for (const id of task.assignee) {
      io.to(`user ${id}`).emit('taskUpdated', task);
    }
    res.status(200).json(task);
  }
  catch (error) {
    next(error);
  }
};

export const unassignTaskFromMember = async (req, res, next) => {
  try {
    const { userId } = req.user; 
    const { taskId, assigneeId, projectId } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (userId !== project.owner.toString() && !project.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to unassign this task' });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    for(const id in assigneeId){
      if(!project.members.includes(assigneeId[id])) {
        return res.status(400).json({ message: `Assignee with ID ${assigneeId[id]} is not a member of the project` });
      }
      if(!task.assignee.includes(assigneeId[id])) {
        return res.status(400).json({ message: `Assignee with ID ${assigneeId[id]} is not assigned to this task` });
      }
    }
    await Task.findByIdAndUpdate(taskId, { $pull: { assignee: { $in: assigneeId } } }, { new: true });
    await User.updateMany({ _id: { $in: assigneeId } }, { $pull: { tasks: taskId } }, { new: true });

    for (const id of task.assignee) {
      io.to(`user ${id}`).emit('taskUpdated', task);
    }

    res.status(200).json(task);
  }
  catch (error) {
    next(error);
  }
};