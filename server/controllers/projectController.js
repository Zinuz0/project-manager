import User from '../models/userModel.js';
import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import { io } from '../server.js';

// Helper function to validate URL structure
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Create a new project
export const createProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { name, description, coverImage, adminId = [] } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res.status(400).json({ message: 'Project name already exists' });
    }

    if (coverImage && !isValidUrl(coverImage)) {
      return res.status(400).json({ message: 'Invalid cover image URL' });
    }

    const owner = await User.findById(userId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner user not found' });
    }

    const newProject = new Project({
      name,
      description,
      owner: userId,
      coverImage: coverImage || null,
      admin: adminId,
      members: [userId, ...adminId]
    });

    await newProject.save();
    await User.findByIdAndUpdate(userId, { $addToSet: { projects: newProject._id } }, { new: true });

    for (const id of adminId) {
      const adminUser = await User.findById(id);
      if (adminUser) {
        await User.findByIdAndUpdate(id, { $addToSet: { projects: newProject._id } }, { new: true });
        io.to(`user ${id}`).emit('adminAdded', { message: 'You have been added as an admin to the project' });
      }
    }

    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
};

// Get all projects for the authenticated user
export const getAllProjects = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const projects = await Project.find({
      $or: [{ owner: userId }, { admin: userId }, { members: userId }]
    }).populate('owner', 'username email').populate('members', 'username email');

    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// Update project details
export const editProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { name, description, coverImage } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.admin.some(id => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to edit this project' });
    }

    if (!name && !description && !coverImage) {
      return res.status(400).json({ message: 'At least one field is required to update' });
    }

    if (coverImage && !isValidUrl(coverImage)) {
      return res.status(400).json({ message: 'Invalid cover image URL' });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (coverImage) project.coverImage = coverImage;

    await project.save();

    for (const id of project.members) {
      io.to(`user ${id}`).emit('projectUpdated', { projectId, message: 'Project has been updated' });
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// Delete a project
export const deleteProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const members = req.body?.members || [];

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const targetProject = await Project.findById(projectId);
    if (!targetProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = targetProject.owner.toString() === userId;
    const isAdmin = targetProject.admin.some(id => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(projectId);
    await Task.deleteMany({ projectId });

    const allMembers = Array.from(new Set([...targetProject.members.map(m => m.toString()), ...members]));
    for (const memberId of allMembers) {
      await User.findByIdAndUpdate(memberId, { $pull: { projects: projectId } });
    }

    io.to(`project ${projectId}`).emit('projectDeleted', { projectId, message: 'Project has been deleted' });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get project by ID
export const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId)
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .populate('admin', 'username email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// Add members to project
export const addMembersToProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { memberId } = req.body;

    if (!projectId || !memberId) {
      return res.status(400).json({ message: 'Project ID and Member IDs are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.admin.some(id => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to add members to this project' });
    }

    const memberIdsToAdd = Array.isArray(memberId) ? memberId : [memberId];
    const validMembers = [];

    for (const id of memberIdsToAdd) {
      const member = await User.findById(id);
      if (member && !project.members.includes(id)) {
        validMembers.push(id);
      }
    }

    if (validMembers.length === 0) {
      return res.status(400).json({ message: 'No valid new members provided' });
    }

    await User.updateMany({ _id: { $in: validMembers } }, { $addToSet: { projects: projectId } });
    project.members.push(...validMembers);
    await project.save();

    io.to(`project ${projectId}`).emit('memberAdded', { validMembers, message: 'Members added to project' });

    res.status(200).json({ message: 'Members added successfully', project });
  } catch (error) {
    next(error);
  }
};

// Remove members from project
export const removeMemberFromProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { memberId } = req.body;

    if (!projectId || !memberId) {
      return res.status(400).json({ message: 'Project ID and Member IDs are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    const isAdmin = project.admin.some(id => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to remove members from this project' });
    }

    const memberIdsToRemove = Array.isArray(memberId) ? memberId : [memberId];

    for (const id of memberIdsToRemove) {
      await User.findByIdAndUpdate(id, { $pull: { projects: projectId } });
      await Task.deleteMany({ projectId, assignee: id });
      project.members = project.members.filter(m => m.toString() !== id);
      io.to(`user ${id}`).emit('memberRemoved', { message: 'You have been removed from the project' });
    }

    await project.save();
    res.status(200).json({ message: 'Member removed from project successfully', project });
  } catch (error) {
    next(error);
  }
};

// Add admin to project
export const addAdminToProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { adminId } = req.body;

    if (!projectId || !adminId) {
      return res.status(400).json({ message: 'Project ID and Admin ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    if (!isOwner) {
      return res.status(403).json({ message: 'Only the project owner can add admins' });
    }

    const adminIdsToAdd = Array.isArray(adminId) ? adminId : [adminId];

    for (const id of adminIdsToAdd) {
      const adminUser = await User.findById(id);
      if (adminUser && !project.admin.includes(id)) {
        project.admin.push(id);
        if (!project.members.includes(id)) {
          project.members.push(id);
        }
        await User.findByIdAndUpdate(id, { $addToSet: { projects: projectId } });
        io.to(`user ${id}`).emit('adminAdded', { message: 'You have been added as an admin to the project' });
      }
    }

    await project.save();
    res.status(200).json({ message: 'Admin added to project successfully', project });
  } catch (error) {
    next(error);
  }
};

// Remove admin from project
export const removeAdminFromProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { adminId } = req.body;

    if (!projectId || !adminId) {
      return res.status(400).json({ message: 'Project ID and Admin ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId;
    if (!isOwner) {
      return res.status(403).json({ message: 'Only the project owner can remove admins' });
    }

    const adminIdsToRemove = Array.isArray(adminId) ? adminId : [adminId];
    project.admin = project.admin.filter(id => !adminIdsToRemove.includes(id.toString()));

    for (const id of adminIdsToRemove) {
      io.to(`user ${id}`).emit('adminRemoved', { message: 'You have been removed as an admin from the project' });
    }

    await project.save();
    res.status(200).json({ message: 'Admin(s) removed from project successfully', project });
  } catch (error) {
    next(error);
  }
};

// Transfer project ownership
export const transferProjectOwnership = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { newOwnerId } = req.body;

    if (!projectId || !newOwnerId) {
      return res.status(400).json({ message: 'Project ID and New Owner ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (userId !== project.owner.toString()) {
      return res.status(403).json({ message: 'Only the project owner can transfer ownership' });
    }

    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
      return res.status(404).json({ message: 'New owner user not found' });
    }

    project.owner = newOwnerId;
    if (!project.members.includes(newOwnerId)) {
      project.members.push(newOwnerId);
    }

    await project.save();
    res.status(200).json({ message: 'Project ownership transferred successfully', project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = getAllProjects;
export const addMemberToProject = addMembersToProject;

