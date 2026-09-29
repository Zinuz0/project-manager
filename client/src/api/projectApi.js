import axios from 'axios';
import { API_URL } from '../config';

// Create a new project
export const createProject = async (name, description, coverImage, adminId) => {
  try {
    const response = await axios.post(`${API_URL}/projects`, { name, description, coverImage, adminId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to create project' };
  }
};

// Fetch all projects for current user
export const getAllProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch projects' };
  }
};

// Update existing project details
export const editProject = async (projectId, name, description, coverImage) => {
  try {
    const response = await axios.put(`${API_URL}/projects/${projectId}`, { name, description, coverImage }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to edit project' };
  }
};

// Delete a project
export const deleteProject = async (projectId, members) => {
  try {
    const response = await axios.delete(`${API_URL}/projects/${projectId}`, { data: { members }, withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to delete project' };
  }
};

// Fetch single project by ID
export const getProjectById = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/projects/${projectId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch project' };
  }
};

// Add members to a project
export const addMembersToProject = async (projectId, memberId) => {
  try {
    const response = await axios.post(`${API_URL}/projects/${projectId}/members`, { memberId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to add members' };
  }
};

// Remove members from a project
export const removeMembersFromProject = async (projectId, memberId) => {
  try {
    const response = await axios.delete(`${API_URL}/projects/${projectId}/members`, { data: { memberId }, withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to remove members' };
  }
};

// Add admin to a project
export const addAdminToProject = async (projectId, adminId) => {
  try {
    const response = await axios.post(`${API_URL}/projects/${projectId}/admin`, { adminId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to add admin' };
  }
};

// Remove admin from a project
export const removeAdminFromProject = async (projectId, adminId) => {
  try {
    const response = await axios.delete(`${API_URL}/projects/${projectId}/admin`, { data: { adminId }, withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to remove admin' };
  }
};

// Transfer project ownership
export const transferProjectOwnership = async (projectId, newOwnerId) => {
  try {
    const response = await axios.put(`${API_URL}/projects/${projectId}/transfer-ownership`, { newOwnerId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to transfer ownership' };
  }
};