import axios from 'axios';
import { API_URL } from '../config';

// Create a new task
export const createTask = async (projectId, title, description, assigneeIds, dueDate) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, { projectId, title, description, assigneeIds, dueDate }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to create task' };
  }
};

// Get all tasks for a project
export const getTasksByProjectId = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/project/${projectId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch project tasks' };
  }
};

// Update task details
export const updateTask = async (taskId, projectId, title, description, status) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, { projectId, title, description, status }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to update task' };
  }
};

// Delete a task
export const deleteTask = async (taskId, projectId) => {
  try {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}`, { data: { projectId }, withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to delete task' };
  }
};

// Get all tasks for a project
export const getAllTasksForProject = getTasksByProjectId;

// Get task details by ID
export const getTaskById = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch task' };
  }
};

// Assign task to member
export const assignTaskToMember = async (taskId, assigneeId, projectId) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${taskId}/assign`, { assigneeId, projectId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to assign task' };
  }
};

// Unassign task from member
export const unassignTaskFromMember = async (taskId, assigneeId, projectId) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${taskId}/unassign`, { assigneeId, projectId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to unassign task' };
  }
};