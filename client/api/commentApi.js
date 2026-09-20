import axios from 'axios';
import { API_URL } from '../config';

export const createComment = async (taskId, content, authorId) => {
    try {
        const response = await axios.post(`${API_URL}/comments`, { data: { taskId, content, authorId } }, { withCredentials: true }); 
        return response.data;   
    } catch (error) {
        throw error.response.data;
    }
};

export const getCommentsByTaskId = async (taskId) => {
    try {
        const response = await axios.get(`${API_URL}/comments/task/${taskId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};