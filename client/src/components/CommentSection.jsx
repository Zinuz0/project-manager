import React, { useState, useEffect } from 'react';
import { getCommentsByTaskId, createComment } from '../api/commentApi.js';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CommentSection = ({ taskId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    getCommentsByTaskId(taskId)
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const comment = await createComment(taskId, content, user?._id);
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section">
      <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 Comments
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({comments.length})</span>
      </h4>

      <div className="comment-list">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div className="skeleton" style={{ height: 12, width: '30%', borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No comments yet. Be the first!</p>
        ) : (
          comments.map((c, i) => (
            <div key={c._id || i} className="comment-item">
              <div className="avatar avatar-sm">
                {getInitials(c.author?.username || c.authorName)}
              </div>
              <div className="comment-body">
                <p className="comment-author">{c.author?.username || c.authorName || 'Anonymous'}</p>
                <p className="comment-text">{c.content}</p>
                <p className="comment-time">{timeAgo(c.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New comment input */}
      <form onSubmit={handleSubmit}>
        <div className="comment-input-group">
          <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
            {getInitials(user?.username)}
          </div>
          <input
            id="new-comment-input"
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            id="submit-comment-btn"
            className="btn btn-primary btn-sm"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↑'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
