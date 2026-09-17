import React from 'react';

const TaskModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div>
      <div>Task Modal</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default TaskModal;
