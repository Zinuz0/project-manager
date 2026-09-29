import axios from 'axios';
import { API_URL } from '../config';

const AUTH_URL = `${API_URL}/auth`;

// User login
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${AUTH_URL}/login`, { email, password }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Login failed' };
  }
};

// User logout
export const logout = async () => {
  try {
    const response = await axios.post(`${AUTH_URL}/logout`, {}, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Logout failed' };
  }
};

// User registration
export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${AUTH_URL}/register`, { username, name: username, email, password }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Registration failed' };
  }
};

// Fetch current user profile
export const getProfile = async () => {
  try {
    const response = await axios.get(`${AUTH_URL}/profile`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch profile' };
  }
};

// Update profile information
export const updateProfile = async (name, email) => {
  try {
    const response = await axios.put(`${AUTH_URL}/profile`, { name, email }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to update profile' };
  }
};

// Change password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await axios.put(`${AUTH_URL}/change-password`, { oldPassword, newPassword }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to change password' };
  }
};

// Request password reset email
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${AUTH_URL}/forgot-password`, { email }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed request' };
  }
};

// Search users by query string
export const searchUsers = async (query) => {
  try {
    const response = await axios.get(`${AUTH_URL}/search-users?query=${encodeURIComponent(query)}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed search' };
  }
};

// Fetch user details by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${AUTH_URL}/user/${userId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch user' };
  }
};

