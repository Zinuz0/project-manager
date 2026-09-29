import axios from 'axios';
import { API_URL } from '../config';

// Fetch notifications for the logged in user
export const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch notifications' };
  }
};

// Create a new notification
export const createNotifications = async (notificationData) => {
  try {
    const response = await axios.post(`${API_URL}/notifications`, notificationData, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to create notification' };
  }
};

