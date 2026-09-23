import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectContext } from '../context/ProjectContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { editProject } from '../api/projectApi.js';
import Board from '../components/Board.jsx';
import MemberList from '../components/MemberList.jsx';

const Project = () => {
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);
  const { currentProject, selectProject, fetchProjects } = useContext(ProjectContext);

  const [activeTab, setActiveTab] = useState('board');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (projectId) selectProject(projectId);
  }, [projectId]);

  useEffect(() => {
    if (currentProject) {
      setEditForm({ name: currentProject.name, description: currentProject.description || '' });
    }
  }, [currentProject]);

  const isOwner = currentProject?.owner?._id === user?._id || currentProject?.owner === user?._id;
  const isAdmin = Array.isArray(currentProject?.admin) &&
    currentProject.admin.some((a) => (a._id || a) === user?._id);
  const canManage = isOwner || isAdmin;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await editProject(currentProject._id, editForm.name, editForm.description, currentProject.coverImage);
      await fetchProjects();
      await selectProject(currentProject._id);
      setEditMode(false);
    } catch (err) {
      setSaveError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!currentProject) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const tabs = [
    { id: 'board', label: '📋 Board' },
    { id: 'members', label: '👥 Members' },
  ];

  return (
    <div id={`project-page-${currentProject._id}`}>
      <div style={{ marginBottom: 24 }}>
        {editMode && canManage ? (
          <form onSubmit={handleSave} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {saveError && <div className="auth-error" style={{ width: '100%' }}>{saveError}</div>}
            <div className="form-group" style={{ flex: '1 1 200px', minWidth: 180 }}>
              <label>Project Name</label>
              <input id="project-edit-name" type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ flex: '2 1 300px' }}>
              <label>Description</label>
              <input id="project-edit-desc" type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 2 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', margin: 0, marginBottom: 6 }}>{currentProject.name}</h1>
              {currentProject.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>{currentProject.description}</p>
              )}
            </div>
            {canManage && (
              <button id="edit-project-btn" className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>✎ Edit</button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        {tabs.map((tab) => (
          <button key={tab.id} id={`project-tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none', border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-primary)' : 'transparent'}`,
              padding: '10px 16px', fontSize: '0.9rem', fontWeight: 500,
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'board' && <Board project={currentProject} />}
      {activeTab === 'members' && (
        <MemberList project={currentProject} currentUserId={user?._id} onProjectUpdate={() => selectProject(currentProject._id)} />
      )}
    </div>
  );
};

export default Project;
