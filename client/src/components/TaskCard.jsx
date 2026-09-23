import React from 'react';

const priorityConfig = {
  low:    { label: 'Low',    color: 'var(--priority-low)',    dot: 'priority-low' },
  medium: { label: 'Medium', color: 'var(--priority-medium)', dot: 'priority-medium' },
  high:   { label: 'High',   color: 'var(--priority-high)',   dot: 'priority-high' },
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const isOverdue = (dueDateStr) => {
  if (!dueDateStr) return false;
  return new Date(dueDateStr) < new Date();
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TaskCard = ({ task, onClick, provided, snapshot }) => {
  const priority = priorityConfig[task?.priority] || priorityConfig.medium;
  const overdue = isOverdue(task?.dueDate);

  const cardStyle = { ...provided?.draggableProps?.style };

  return (
    <div
      id={`task-card-${task?._id}`}
      className={`task-card${snapshot?.isDragging ? ' dragging' : ''}`}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={cardStyle}
      onClick={() => onClick && onClick(task)}
    >
      <div className="task-card-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`priority-dot ${priority.dot}`} title={`Priority: ${priority.label}`} />
          <span style={{ fontSize: '0.72rem', color: priority.color, fontWeight: 600 }}>
            {priority.label}
          </span>
        </div>
        <div className="task-card-actions">
          <button
            className="btn-ghost btn-sm"
            onClick={(e) => { e.stopPropagation(); onClick && onClick(task); }}
            style={{ padding: '2px 6px', fontSize: '0.75rem' }}
            title="Open task"
          >
            ↗
          </button>
        </div>
      </div>

      <p className="task-card-title">{task?.title || 'Untitled Task'}</p>

      {task?.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-card-assignees">
          {Array.isArray(task?.assignee) && task.assignee.length > 0 ? (
            <>
              {task.assignee.slice(0, 3).map((a, i) => (
                <div key={a._id || i} className="avatar avatar-sm" title={a.username || a.email || 'Member'}>
                  {getInitials(a.username || a.email)}
                </div>
              ))}
              {task.assignee.length > 3 && (
                <div className="avatar avatar-sm" title="More assignees">
                  +{task.assignee.length - 3}
                </div>
              )}
            </>
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unassigned</span>
          )}
        </div>

        {task?.dueDate && (
          <div className={`task-card-due ${overdue ? 'overdue' : ''}`}>
            <span>{overdue ? '⚠' : '📅'}</span>
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
