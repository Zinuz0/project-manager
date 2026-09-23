import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { AuthContext } from '../context/AuthContext.jsx';
import { ProjectContext } from '../context/ProjectContext.jsx';
import { updateTask } from '../api/taskApi.js';
import socket from '../socket/socket.js';
import Column from './Column.jsx';
import TaskModal from './TaskModal.jsx';

const COLUMNS = ['todo', 'in-progress', 'done'];

const Board = ({ project }) => {
  const { user } = useContext(AuthContext);
  const { tasks, setTasks, currentProject, tasksLoading } = useContext(ProjectContext);

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [createColumnDefault, setCreateColumnDefault] = useState('todo');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const columns = useMemo(() => {
    const grouped = { todo: [], 'in-progress': [], done: [] };
    tasks.forEach((task) => {
      const status = task.status || 'todo';
      if (grouped[status]) grouped[status].push(task);
    });
    return grouped;
  }, [tasks]);

  const handleDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newStatus = destination.droppableId;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
      );

      try {
        const activeProject = project || currentProject;
        await updateTask(draggableId, activeProject?._id, null, null, newStatus);
        socket.emit('taskUpdated', draggableId);
      } catch (err) {
        console.error('Failed to update task status:', err);
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) => (t._id === draggableId ? { ...t, status: source.droppableId } : t))
        );
      }
    },
    [project, currentProject, setTasks]
  );

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  }, []);

  const handleAddTask = useCallback((columnId) => {
    setCreateColumnDefault(columnId);
    setSelectedTask(null);
    setCreateModalOpen(true);
  }, []);

  const activeProject = project || currentProject;

  if (!activeProject) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: '3rem', marginBottom: 16 }}>📋</span>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No project selected</h3>
        <p style={{ fontSize: '0.875rem' }}>Select a project from the sidebar to view its board.</p>
      </div>
    );
  }

  return (
    <div id="kanban-board">
      <div className="board-header">
        <div>
          <h2>{activeProject.name}</h2>
          {activeProject.description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              {activeProject.description}
            </p>
          )}
        </div>
        <div className="board-actions">
          <button id="add-task-main-btn" className="btn btn-primary btn-sm" onClick={() => handleAddTask('todo')}>
            <span>＋</span> New Task
          </button>
        </div>
      </div>

      {tasksLoading ? (
        <div className="board-container">
          {COLUMNS.map((col) => (
            <div key={col} className="column">
              <div className="column-header">
                <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 4 }} />
              </div>
              <div className="column-body">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 96, borderRadius: 10 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="board-container" id="board-columns">
            {COLUMNS.map((colId) => (
              <Column
                key={colId}
                columnId={colId}
                tasks={columns[colId] || []}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {taskModalOpen && (
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => { setTaskModalOpen(false); setSelectedTask(null); }}
          task={selectedTask}
          project={activeProject}
          mode="view"
        />
      )}

      {createModalOpen && (
        <TaskModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          task={null}
          project={activeProject}
          mode="create"
          defaultStatus={createColumnDefault}
        />
      )}
    </div>
  );
};

export default Board;
