import React, { useState } from 'react';
import { addMembersToProject, removeMembersFromProject, addAdminToProject } from '../api/projectApi.js';
import { searchUsers } from '../api/authApi.js';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const MemberList = ({ project, currentUserId, onProjectUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const isOwner = project?.owner?._id === currentUserId || project?.owner === currentUserId;
  const isAdmin = Array.isArray(project?.admin) &&
    project.admin.some((a) => (a._id || a) === currentUserId);
  const canManage = isOwner || isAdmin;

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const results = await searchUsers(q);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (userId) => {
    setError('');
    try {
      await addMembersToProject(project._id, [userId]);
      setSearchQuery('');
      setSearchResults([]);
      if (onProjectUpdate) onProjectUpdate();
    } catch (err) {
      setError(err?.message || 'Failed to add member');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    setError('');
    try {
      await removeMembersFromProject(project._id, [userId]);
      if (onProjectUpdate) onProjectUpdate();
    } catch (err) {
      setError(err?.message || 'Failed to remove member');
    }
  };

  const handleMakeAdmin = async (userId) => {
    setError('');
    try {
      await addAdminToProject(project._id, userId);
      if (onProjectUpdate) onProjectUpdate();
    } catch (err) {
      setError(err?.message || 'Failed to update role');
    }
  };

  const getRole = (memberId) => {
    const id = memberId._id || memberId;
    if ((project.owner?._id || project.owner) === id) return 'owner';
    if (Array.isArray(project.admin) && project.admin.some((a) => (a._id || a) === id)) return 'admin';
    return 'member';
  };

  const members = Array.isArray(project?.members) ? project.members : [];

  return (
    <div className="member-list-section">
      <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        👥 Members
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({members.length})</span>
      </h4>

      {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}

      {canManage && (
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <input
            id="member-search-input"
            type="text"
            placeholder="Search users to add..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {(searching || searchResults.length > 0) && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', zIndex: 10, overflow: 'hidden', boxShadow: 'var(--shadow-md)',
            }}>
              {searching ? (
                <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching...</div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No users found</div>
              ) : (
                searchResults.map((u) => (
                  <button key={u._id} id={`add-member-${u._id}`} onClick={() => handleAdd(u._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <div className="avatar avatar-sm">{getInitials(u.username)}</div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.username}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="member-list">
        {members.map((member) => {
          const id = member._id || member;
          const role = getRole(id);
          return (
            <div key={id} className="member-item" id={`member-${id}`}>
              <div className="member-info">
                <div className="avatar">{getInitials(member.username)}</div>
                <div className="member-details">
                  <p className="member-name">{member.username || 'Unknown'}</p>
                  <p className="member-email">{member.email || ''}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`member-role-badge role-${role}`}>{role}</span>
                {canManage && role === 'member' && id !== currentUserId && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-ghost btn-sm" onClick={() => handleMakeAdmin(id)} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>↑ Admin</button>
                    <button className="btn-ghost btn-sm" onClick={() => handleRemove(id)} style={{ color: 'var(--error)', fontSize: '0.75rem', padding: '3px 8px' }}>✕</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberList;
