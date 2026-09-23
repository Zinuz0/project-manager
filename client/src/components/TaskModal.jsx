import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { ProjectContext } from '../context/ProjectContext.jsx';
import { createTask, deleteTask } from '../api/taskApi.js';
import { getActivities } from '../api/activityApi.js';
import CommentSection from './CommentSection.jsx';
import socket from '../socket/socket.js';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['todo', 'in-progress', 'done'];
const statusLabel = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const priorityColor = { low: 'var(--priority-low)', medium: 'var(--priority-medium)', high: 'var(--priority-high)' };

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TaskModal = ({ isOpen, onClose, task, project, mode = 'view', defaultStatus = 'todo' }) => {
  const { user } = useContext(AuthContext);
  const { addTaskLocally, removeTaskLocally } = useContext(ProjectContext);

  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: defaultStatus, dueDate: '' });
  const [activities, setActivities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (mode === 'view' && task?._id) {
      getActivities(project?._id, 'task', task._id)
        .then((data) => setActivities(Array.isArray(data) ? data : []))
        .catch(() => setActivities([]));
    }
  }, [mode, task, project]);

  useEffect(() => {
    if (mode === 'create') {
      setForm({ title: '', description: '', priority: 'medium', status: defaultStatus, dueDate: '' });
      setError('');
    }
  }, [mode, defaultStatus, isOpen]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const newTask = await createTask(project._id, form.title, form.description, [], form.dueDate || null);
      addTaskLocally(newTask);
      socket.emit('taskUpdated', newTask._id);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(task._id, project._id);
      removeTaskLocally(task._id);
      socket.emit('taskUpdated', task._id);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to delete task');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      id="task-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content" style={{ maxWidth: mode === 'view' ? 640 : 520 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.1rem' }}>
            {mode === 'create' ? '✨ New Task' : task?.title || 'Task Details'}
          </h2>
          <button className="modal-close" onClick={onClose} id="task-modal-close">✕</button>
        </div>

        {/* CREATE MODE */}
        {mode === 'create' && (
          <form onSubmit={handleCreate}>
            <div className="modal-body">
              {error && <div className="auth-error">{error}</div>}
              <div className="form-group">
                <label htmlFor="task-title-input">Title *</label>
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-desc-input">Description</label>
                <textarea
                  id="task-desc-input"
                  placeholder="Add more details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label htmlFor="task-priority-input">Priority</label>
                  <select id="task-priority-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="task-status-input">Column</label>
                  <select id="task-status-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="task-due-input">Due Date</label>
                <input id="task-due-input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" id="create-task-submit-btn" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Create Task'}
              </button>
            </div>
          </form>
        )}

        {/* VIEW MODE */}
        {mode === 'view' && task && (
          <>
            <div style={{ display: 'flex', gap: 4, padding: '0 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              {['details', 'activity'].map((tab) => (
                <button
                  key={tab}
                  id={`task-tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none', border: 'none',
                    borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-primary)' : 'transparent'}`,
                    padding: '10px 12px', fontSize: '0.85rem', fontWeight: 500,
                    color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="modal-body">
              {error && <div className="auth-error">{error}</div>}

              {activeTab === 'details' && (
                <>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className={`badge badge-${task.status === 'in-progress' ? 'progress' : task.status === 'done' ? 'done' : 'todo'}`}>
                      {statusLabel[task.status] || task.status}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: `${priorityColor[task.priority]}22`,
                      color: priorityColor[task.priority],
                      border: `1px solid ${priorityColor[task.priority]}44`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColor[task.priority], display: 'inline-block' }} />
                      {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)} Priority
                    </span>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
                    <p style={{ fontSize: '0.9rem', color: task.description ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.6 }}>
                      {task.description || 'No description provided.'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formatDate(task.dueDate)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formatDate(task.createdAt)}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Assignees ({task.assignee?.length || 0})
                    </p>
                    {Array.isArray(task.assignee) && task.assignee.length > 0 ? (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {task.assignee.map((a, i) => (
                          <div key={a._id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                            <div className="avatar avatar-sm">{getInitials(a.username)}</div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.username}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No assignees</p>
                    )}
                  </div>

                  <CommentSection taskId={task._id} />
                </>
              )}

              {activeTab === 'activity' && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Log</p>
                  {activities.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No activity yet.</p>
                  ) : (
                    activities.map((act, i) => (
                      <div key={act._id || i} style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>📌</span>
                        <span>{act.description || act.action}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={handleDelete} id="delete-task-btn">🗑 Delete</button>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
