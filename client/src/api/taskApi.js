import axios from 'axios';
import { API_URL } from '../config';

export const createTask = async (projectId, title, description, assigneeIds, dueDate) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, { data: { projectId, title, description, assigneeIds, dueDate } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTasksByProjectId = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/project/${projectId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateTask = async (taskId, projectId, title, description, status) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, { data: { projectId, title, description, status } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteTask = async (taskId, projectId) => {
  try {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}`, { data: { projectId } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllTasksForProject = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/project/${projectId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTaskById = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const assignTaskToMember = async (taskId, assigneeIds, projectId) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${taskId}/assign`, { data: { assigneeIds, projectId } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const unassignTaskFromMember = async (taskId, assigneeIds, projectId) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${taskId}/unassign`, { data: { assigneeIds, projectId } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};