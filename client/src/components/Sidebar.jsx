import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ProjectContext } from '../context/ProjectContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { createProject } from '../api/projectApi.js';

const Sidebar = () => {
  const { projects, fetchProjects, selectProject, currentProject, projectLoading } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleSelectProject = (project) => {
    selectProject(project._id);
    navigate(`/project/${project._id}`);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      await createProject(createForm.name, createForm.description, '', user?._id);
      await fetchProjects();
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '' });
    } catch (err) {
      setCreateError(err?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <aside className="sidebar" id="main-sidebar">
        <div className="sidebar-section">
          <p className="sidebar-section-title">Navigation</p>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} id="nav-dashboard">
            <span className="sidebar-item-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} id="nav-profile">
            <span className="sidebar-item-icon">👤</span> Profile
          </NavLink>
        </div>

        <div className="sidebar-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: 8 }}>
            <p className="sidebar-section-title" style={{ margin: 0 }}>Projects</p>
            <button
              id="create-project-btn"
              onClick={() => setShowCreateModal(true)}
              className="btn-ghost btn-sm"
              title="New Project"
              style={{ fontSize: '1.1rem', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}
            >
              +
            </button>
          </div>

          <div className="sidebar-project-list" style={{ overflowY: 'auto', flex: 1 }}>
            {projectLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 36, margin: '2px 0', borderRadius: 8 }} />
              ))
            ) : projects.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 12px' }}>
                No projects yet. Create one!
              </p>
            ) : (
              projects.map((project) => (
                <button
                  key={project._id}
                  id={`sidebar-project-${project._id}`}
                  className={`sidebar-item ${currentProject?._id === project._id ? 'active' : ''}`}
                  onClick={() => handleSelectProject(project)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: '1px solid transparent' }}
                >
                  <span className="sidebar-item-icon" style={{ fontSize: '0.7rem' }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      background: project.status === 'in-progress'
                        ? 'var(--status-progress)'
                        : project.status === 'completed'
                        ? 'var(--status-done)'
                        : 'var(--status-todo)',
                    }} />
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {showCreateModal && (
        <div className="modal-overlay" id="create-project-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal-content create-project-modal">
            <div className="modal-header">
              <h2>New Project</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {createError && <div className="auth-error">{createError}</div>}
                <div className="form-group">
                  <label htmlFor="project-name-input">Project Name *</label>
                  <input
                    id="project-name-input"
                    type="text"
                    placeholder="My Awesome Project"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    autoFocus
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="project-desc-input">Description</label>
                  <textarea
                    id="project-desc-input"
                    placeholder="What is this project about?"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="create-project-submit-btn" disabled={creating}>
                  {creating ? <span className="spinner" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
