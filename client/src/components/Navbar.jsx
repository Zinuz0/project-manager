import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import NotificationPanel from './NotificationPanel.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <Link to="/dashboard" className="navbar-brand">
          <div className="logo-icon">⚡</div>
          <span>Kanban</span>
        </Link>

        <div className="navbar-actions">
          <button
            className="navbar-btn"
            id="notification-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            🔔
            <span className="notification-badge"></span>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="navbar-profile"
              id="profile-menu-toggle"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar avatar-sm">
                {getInitials(user?.username)}
              </div>
              <span className="navbar-profile-name">{user?.username}</span>
            </button>

            {showProfileMenu && (
              <div
                className="glass"
                id="profile-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  minWidth: 180,
                  zIndex: 1200,
                  animation: 'fadeInDown 0.15s ease-out',
                }}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <Link
                  to="/profile"
                  className="sidebar-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <span className="sidebar-item-icon">👤</span>
                  Profile
                </Link>
                <button
                  className="sidebar-item"
                  onClick={handleLogout}
                  style={{ width: '100%', color: 'var(--error)' }}
                >
                  <span className="sidebar-item-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
};

export default Navbar;
