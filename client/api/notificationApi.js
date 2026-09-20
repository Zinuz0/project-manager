import axios from 'axios';

import { API_URL } from '../config';

export const createNotification = async (recipientId, senderId, type, message) => {
    try {
        const response = await axios.post(`${API_URL}/notifications`, { recipientId, senderId, type, message }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getNotifications = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/notifications/${userId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};