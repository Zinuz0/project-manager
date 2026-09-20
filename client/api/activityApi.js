import axios from 'axios';
import { API_URL } from '../config';

export const getActivities = async (projectId, entityType, entityId) => {
    try {
        const response = await axios.get(`${API_URL}/activities/project/${projectId}?entityType=${entityType}&entityId=${entityId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
