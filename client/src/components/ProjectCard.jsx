import React from 'react';

const ProjectCard = ({ project }) => {
  return (
    <div>
      <h3>{project?.name || 'Project Name'}</h3>
    </div>
  );
};

export default ProjectCard;
