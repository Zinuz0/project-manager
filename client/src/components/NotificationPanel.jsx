import React, { useEffect, useState } from 'react';
import { getNotifications } from '../api/notificationApi.js';
import socket from '../socket/socket.js';

const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    socket.on('newUserNotification', handleNew);
    socket.on('addedToProjectNotification', handleNew);
    socket.on('taskAssignedNotification', handleNew);

    return () => {
      socket.off('newUserNotification', handleNew);
      socket.off('addedToProjectNotification', handleNew);
      socket.off('taskAssignedNotification', handleNew);
    };
  }, []);

  const typeIcon = (type) => {
    const map = {
      task_assigned: { icon: '📋', bg: 'var(--status-progress-bg)', color: 'var(--status-progress)' },
      project_added: { icon: '📁', bg: 'var(--accent-primary-glow)', color: 'var(--accent-primary)' },
      comment:       { icon: '💬', bg: 'rgba(16,185,129,0.12)',       color: 'var(--success)' },
      deadline:      { icon: '⏰', bg: 'var(--warning-bg)',            color: 'var(--warning)' },
    };
    return map[type] || { icon: '🔔', bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1099 }} />
      <div className="notification-panel" id="notification-panel">
        <div className="notification-header">
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Notifications</h3>
          <button className="btn-ghost btn-icon" onClick={onClose} id="close-notifications-btn">✕</button>
        </div>

        <div className="notification-list">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '12px 16px', display: 'flex', gap: 12 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }}>🔔</div>
              <p style={{ fontSize: '0.85rem' }}>You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notif, i) => {
              const { icon, bg, color } = typeIcon(notif.type);
              return (
                <div
                  key={notif._id || i}
                  id={`notification-${notif._id || i}`}
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="notification-icon" style={{ background: bg, color }}>{icon}</div>
                  <div className="notification-content">
                    <p className="notification-text">
                      {notif.message || notif.content || 'You have a new notification'}
                    </p>
                    <p className="notification-time">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
