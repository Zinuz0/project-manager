// // API Client for Authentication
// const API_URL = '/api/auth';

// export const loginUser = async (credentials) => {
//   return {};
// };

// export const registerUser = async (userData) => {
//   return {};
// };

import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/auth';

export const loginUser = async(email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const registerUser = async(userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
}

export const getUserProfile = async(token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
} 

export const updateUserProfile = async(token, updatedData) => {
  const response = await axios.put(`${API_URL}/profile`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}