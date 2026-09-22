import axios from 'axios';
import { API_URL } from '../config';

export const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createNotifications = async (notificationData) => {
  try {
    const response = await axios.post(`${API_URL}/notifications`, { data: notificationData }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
