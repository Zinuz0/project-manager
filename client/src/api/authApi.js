import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

/*
const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

whats the difference between getAuthConfig and withCredentials: true?The difference between `getAuthConfig` and `withCredentials: true` lies in how they handle authentication and the context in which they are used:

1. **getAuthConfig**:
   - This function returns an object containing headers for an HTTP request, specifically including an `Authorization` header with a Bearer token retrieved from local storage.
   - It is typically used for APIs that require a token to be sent in the request headers for authentication.
   - The token is usually stored in the browser's local storage or session storage, and it is manually added to the request headers.

2. **withCredentials: true**:
   - This option is used in Axios requests to indicate that cookies should be sent along with the request.
   - It is necessary when dealing with cross-origin requests where the server uses cookies (like JWTs stored in cookies) for session management.
   - When `withCredentials: true` is set, the browser will include any cookies associated with the domain of the request, allowing the server to recognize the user based on the JWT stored in the cookie.

In summary, `getAuthConfig` is for sending tokens in headers, while `withCredentials: true` is for sending cookies with requests. They serve different purposes depending on how authentication is implemented on the server side.
*/

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: error.message || 'Login failed' };
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    return response.data;
  }
  catch (error) {
    throw error?.response?.data || { message: error.message || 'Logout failed' };
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { username, name: username, email, password }, { withCredentials: true });
    return response.data;
  }
  catch (error) {
    throw error?.response?.data || { message: error.message || 'Registration failed' };
  }
};

export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
    return response.data;
  }
  catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch profile' };
  }
};

export const updateProfile = async (name, email) => {
  try {
    const response = await axios.put(`${API_URL}/profile`, { profileData: { name, email } }, { withCredentials: true });
    return response.data;
  }
  catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to update profile' };
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await axios.put(`${API_URL}/change-password`, { oldPassword, newPassword }, { withCredentials: true });
    return response.data;
  }
  catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to change password' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, { email }, { withCredentials: true });
    return response.data;
  }
  catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed request' };
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search-users?query=${query}`, { withCredentials: true });
    return response.data;
  }
  catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed search' };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`, { withCredentials: true });
    return response.data;
  }
  catch (error) {
    throw error?.response?.data || { message: error.message || 'Failed to fetch user' };
  }
};

// is this file alright and covers every api? I think it does. are you sure about that?
// yes it does, but i think we need to add more functionality to it. for example, we need to add a function to get the user by id. we can add this function to our authApi.js file. but i am not sure how to do that. can you help me with that?
