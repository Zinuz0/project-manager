import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ProjectContext } from '../context/ProjectContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { projects, fetchProjects, projectLoading, selectProject } = useContext(ProjectContext);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSelectProject = (project) => {
    selectProject(project._id);
    navigate(`/project/${project._id}`);
  };

  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const inProgress = projects.filter((p) => p.status === 'in-progress').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: '📁', color: 'var(--accent-primary-glow)', iconColor: 'var(--accent-primary)' },
    { label: 'In Progress',    value: inProgress,       icon: '⚡', color: 'var(--status-progress-bg)', iconColor: 'var(--status-progress)' },
    { label: 'Completed',      value: completed,         icon: '✅', color: 'var(--status-done-bg)',    iconColor: 'var(--status-done)' },
    { label: 'Total Tasks',    value: totalTasks,        icon: '📋', color: 'var(--status-todo-bg)',    iconColor: 'var(--status-todo)' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div id="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <h1>{greeting()}, {user?.username?.split(' ')[0] || 'there'} 👋</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className="dashboard-stats">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="stat-card-icon" style={{ background: stat.color, color: stat.iconColor }}>{stat.icon}</div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="projects-section-header">
          <h2 style={{ fontSize: '1.1rem' }}>Your Projects</h2>
        </div>

        {projectLoading ? (
          <div className="project-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚀</div>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No projects yet</h3>
            <p style={{ fontSize: '0.875rem' }}>Create your first project from the sidebar to get started.</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project, i) => (
              <ProjectCard key={project._id} project={project} index={i} onSelect={handleSelectProject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
