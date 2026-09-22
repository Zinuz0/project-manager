import axios from 'axios';
import { API_URL } from '../config';

export const getActivities = async (projectId, entityType, entityId) => {
  try {
    let queryParams = '';
    if (projectId) queryParams += `?projectId=${projectId}`;
    if (entityType) queryParams += queryParams ? `&entityType=${entityType}` : `?entityType=${entityType}`;
    if (entityId) queryParams += queryParams ? `&entityId=${entityId}` : `?entityId=${entityId}`;
    
    const response = await axios.get(`${API_URL}/activities${queryParams}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
