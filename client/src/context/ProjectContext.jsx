import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { getAllProjects, getProjectById } from '../api/projectApi.js';
import { getAllTasksForProject } from '../api/taskApi.js';
import { AuthContext } from './AuthContext.jsx';
import socket from '../socket/socket.js';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Fetch all projects for the current user
  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    setProjectLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setProjectLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch a single project and its tasks
  const selectProject = useCallback(async (projectId) => {
    setTasksLoading(true);
    try {
      const [project, projectTasks] = await Promise.all([
        getProjectById(projectId),
        getAllTasksForProject(projectId),
      ]);
      setCurrentProject(project);
      setTasks(Array.isArray(projectTasks) ? projectTasks : []);

      // Join the project's socket room
      socket.emit('joinProject', projectId);
    } catch (error) {
      console.error('Failed to select project:', error);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Leave a project room when switching
  const leaveProject = useCallback(() => {
    if (currentProject) {
      socket.emit('leaveProject', currentProject._id);
    }
    setCurrentProject(null);
    setTasks([]);
  }, [currentProject]);

  // Update a single task in local state (for optimistic UI updates)
  const updateTaskLocally = useCallback((updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t))
    );
  }, []);

  // Add a task to local state
  const addTaskLocally = useCallback((newTask) => {
    setTasks((prev) => [...prev, newTask]);
  }, []);

  // Remove a task from local state
  const removeTaskLocally = useCallback((taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  }, []);

  // Listen for real-time socket events
  useEffect(() => {
    const handleTaskUpdated = ({ taskId }) => {
      // Refetch the task to get the latest data
      if (currentProject) {
        getAllTasksForProject(currentProject._id).then((data) => {
          setTasks(Array.isArray(data) ? data : []);
        });
      }
    };

    const handleTaskDeleted = ({ taskId }) => {
      removeTaskLocally(taskId);
    };

    const handleProjectUpdated = ({ projectId, updatedData }) => {
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject((prev) => ({ ...prev, ...updatedData }));
      }
      // Also update in the projects list
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, ...updatedData } : p))
      );
    };

    const handleProjectDeleted = ({ projectId }) => {
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(null);
        setTasks([]);
      }
    };

    socket.on('taskUpdatedNotification', handleTaskUpdated);
    socket.on('taskDeletedNotification', handleTaskDeleted);
    socket.on('projectUpdatedNotification', handleProjectUpdated);
    socket.on('projectDeletedNotification', handleProjectDeleted);

    return () => {
      socket.off('taskUpdatedNotification', handleTaskUpdated);
      socket.off('taskDeletedNotification', handleTaskDeleted);
      socket.off('projectUpdatedNotification', handleProjectUpdated);
      socket.off('projectDeletedNotification', handleProjectDeleted);
    };
  }, [currentProject, removeTaskLocally]);

  // Fetch projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setTasks([]);
    }
  }, [isAuthenticated, fetchProjects]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        setProjects,
        currentProject,
        setCurrentProject,
        tasks,
        setTasks,
        projectLoading,
        tasksLoading,
        fetchProjects,
        selectProject,
        leaveProject,
        updateTaskLocally,
        addTaskLocally,
        removeTaskLocally,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
