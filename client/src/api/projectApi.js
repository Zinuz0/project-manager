import axios from 'axios';

import { API_URL } from '../config';

export const createProject = async (name, description, coverImage, adminId) => {
  try {
    const response = await axios.post(`${API_URL}/projects`, { data: { name, description, coverImage, adminId } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
/*
do i need to specify the projectData in the post request? yes, you need to specify the projectData in the post request. The projectData is an object that contains the details of the project you want to create, such as name, description, etc. In this case, it seems like you are only sending the name of the project in the request body. If you have other details to send, you should include them in the projectData object and send it in the post request. 
export const createProject = async (req, res, next) => {
  try {
    const { userId } = req.user; 
    const { name, description, coverImage, adminId} = req.body; 

for this function, you would need to send the projectData in the post request like this:
const projectData = {
  name: 'Project Name',
  description: 'Project Description',
  coverImage: 'Cover Image URL',
  adminId: 'Admin User ID'
};

const response = await axios.post(`${API_URL}/projects`, projectData, { withCredentials: true });
*/

export const getAllProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const editProject = async (projectId, name, description, coverImage) => {
  try {
    const response = await axios.put(`${API_URL}/projects/${projectId}`, { data: { name, description, coverImage } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteProject = async (projectId, members) => {
  try {
    const response = await axios.delete(`${API_URL}/projects/${projectId}`, { data: { members } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getProjectById = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/projects/${projectId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addMembersToProject = async (projectId, members) => {
  try {
    const response = await axios.post(`${API_URL}/projects/${projectId}/members`, { data: { members } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const removeMembersFromProject = async (projectId, members) => {
  try {
    const response = await axios.delete(`${API_URL}/projects/${projectId}/members`, { data: { members } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addAdminToProject = async (projectId, adminId) => {
  try {
    const response = await axios.post(`${API_URL}/projects/${projectId}/admin`, { data: { adminId } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const removeAdminFromProject = async (projectId, adminId) => {
  try {
    const response = await axios.delete(`${API_URL}/projects/${projectId}/admin`, { data: { adminId } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const transferProjectOwnership = async (projectId, newOwnerId) => {
  try {
    const response = await axios.put(`${API_URL}/projects/${projectId}/transfer-ownership`, { data: { newOwnerId } }, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};