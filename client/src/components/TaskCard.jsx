import React from 'react';

const TaskCard = ({ task }) => {
  return (
    <div>
      <h4>{task?.title || 'Task Title'}</h4>
    </div>
  );
};

export default TaskCard;
