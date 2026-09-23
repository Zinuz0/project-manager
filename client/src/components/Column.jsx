import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard.jsx';

const columnConfig = {
  todo: { label: 'To Do', color: 'var(--status-todo)', bg: 'var(--status-todo-bg)' },
  'in-progress': { label: 'In Progress', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' },
  done: { label: 'Done', color: 'var(--status-done)', bg: 'var(--status-done-bg)' },
};

const Column = ({ columnId, tasks, onTaskClick, onAddTask }) => {
  const config = columnConfig[columnId] || { label: columnId, color: 'var(--text-secondary)', bg: 'transparent' };

  return (
    <div className="column" id={`column-${columnId}`}>
      <div className="column-header">
        <div className="column-title-group">
          <span className="column-dot" style={{ background: config.color }} />
          <span className="column-title">{config.label}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
        {onAddTask && (
          <button
            className="btn-ghost btn-sm btn-icon"
            id={`add-task-${columnId}`}
            onClick={() => onAddTask(columnId)}
            title={`Add task to ${config.label}`}
            style={{ fontSize: '1rem', color: config.color }}
          >
            +
          </button>
        )}
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            className={`column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ background: snapshot.isDraggingOver ? config.bg : undefined, transition: 'background 0.2s ease' }}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', marginTop: 4 }}>
                Drop tasks here
              </div>
            )}

            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided, snapshot) => (
                  <TaskCard task={task} onClick={onTaskClick} provided={provided} snapshot={snapshot} />
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
