import axios from 'axios';
import { API_URL } from '../config';

// Create a comment on a task
export const createComment = async (taskId, content, authorId) => {
  try {
    const response = await axios.post(`${API_URL}/comments`, { taskId, content, authorId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to create comment' };
  }
};

// Get all comments for a task
export const getCommentsByTaskId = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/comments/task/${taskId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch comments' };
  }
};