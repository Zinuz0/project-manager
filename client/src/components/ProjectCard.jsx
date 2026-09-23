import React from 'react';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  'to-do':       { label: 'To Do',       color: 'var(--status-todo)' },
  'in-progress': { label: 'In Progress', color: 'var(--status-progress)' },
  completed:     { label: 'Completed',   color: 'var(--status-done)' },
  archived:      { label: 'Archived',    color: 'var(--text-muted)' },
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const ProjectCard = ({ project, onSelect, index }) => {
  const navigate = useNavigate();
  const status = statusConfig[project?.status] || statusConfig['to-do'];

  const handleClick = () => {
    if (onSelect) onSelect(project);
    else navigate(`/project/${project._id}`);
  };

  return (
    <div
      className="project-card animate-fade-in-up"
      id={`project-card-${project?._id}`}
      onClick={handleClick}
      style={{ animationDelay: `${(index || 0) * 60}ms` }}
    >
      <div className="project-card-header">
        <div style={{ flex: 1 }}>
          <h3 className="project-card-title">{project?.name || 'Unnamed Project'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.color, display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', color: status.color, fontWeight: 600 }}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <p className="project-card-desc">
        {project?.description || 'No description provided.'}
      </p>

      <div className="project-card-meta">
        <div className="project-card-members">
          {Array.isArray(project?.members) && project.members.slice(0, 4).map((member, i) => (
            <div
              key={member._id || i}
              className="avatar avatar-sm"
              title={member.username || member.email}
            >
              {getInitials(member.username || member.email)}
            </div>
          ))}
          {project?.members?.length > 4 && (
            <div className="avatar avatar-sm" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              +{project.members.length - 4}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            📋 {project?.tasks?.length || 0} tasks
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
