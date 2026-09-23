import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { updateProfile, changePassword } from '../api/authApi.js';

const Profile = () => {
  const { user, login, token } = useContext(AuthContext);

  const [profileForm, setProfileForm] = useState({ name: user?.username || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmNew: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await updateProfile(profileForm.name, profileForm.email);
      login({ ...user, username: profileForm.name, email: profileForm.email }, token);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pwForm.newPassword !== pwForm.confirmNew) { setPwMsg({ type: 'error', text: 'New passwords do not match' }); return; }
    if (pwForm.newPassword.length < 6) { setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return; }
    setSavingPw(true);
    try {
      await changePassword(pwForm.oldPassword, pwForm.newPassword);
      setPwForm({ oldPassword: '', newPassword: '', confirmNew: '' });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err?.message || 'Failed to change password' });
    } finally {
      setSavingPw(false);
    }
  };

  const msgStyle = (type) => ({
    padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: 12,
    background: type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
    color: type === 'success' ? 'var(--success)' : 'var(--error)',
    border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
  });

  return (
    <div className="profile-page" id="profile-page">
      <h1 style={{ marginBottom: 24, fontSize: '1.6rem' }}>Profile Settings</h1>

      <div className="profile-card" style={{ marginBottom: 20 }}>
        <div className="profile-header">
          <div className="avatar avatar-xl">{getInitials(user?.username)}</div>
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{user?.username}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="profile-form" id="profile-form">
          <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-secondary)' }}>Account Information</h3>
          {profileMsg.text && <div style={msgStyle(profileMsg.type)}>{profileMsg.text}</div>}
          <div className="form-group">
            <label htmlFor="profile-username">Username</label>
            <input id="profile-username" type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-email">Email address</label>
            <input id="profile-email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" id="save-profile-btn" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="profile-card">
        <form onSubmit={handlePasswordChange} className="profile-form" id="change-password-form">
          <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-secondary)' }}>Change Password</h3>
          {pwMsg.text && <div style={msgStyle(pwMsg.type)}>{pwMsg.text}</div>}
          <div className="form-group">
            <label htmlFor="old-password">Current Password</label>
            <input id="old-password" type="password" placeholder="••••••••" value={pwForm.oldPassword} onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" placeholder="••••••••" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-new-password">Confirm New</label>
              <input id="confirm-new-password" type="password" placeholder="••••••••" value={pwForm.confirmNew} onChange={(e) => setPwForm({ ...pwForm, confirmNew: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" id="change-password-btn" className="btn btn-primary" disabled={savingPw}>
              {savingPw ? <span className="spinner" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
