
export const handleTaskSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected to task socket:', socket.id);

    socket.on('joinTask', (taskId) => {
      socket.join(taskId);
      console.log(`Socket ${socket.id} joined task room: ${taskId}`);
    });

    socket.on('leaveTask', (taskId) => {
      socket.leave(taskId);
      console.log(`Socket ${socket.id} left task room: ${taskId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from task socket:', socket.id);
    });
    
    socket.on('taskAssigned', (taskId, assignedUserId) => {
      // Emit the task assignment notification to the specific user's room
      io.to(assignedUserId).emit('taskAssignedNotification', { taskId, assignedUserId });
      console.log(`Task ${taskId} assigned to user ${assignedUserId}`);
    });
    
    socket.on('taskUpdated', (taskId, updatedData) => {
      // Emit the task update notification to the specific task's room
      io.to(taskId).emit('taskUpdatedNotification', { taskId, updatedData }); 
      console.log(`Task ${taskId} updated with data:`, updatedData);
    });
    socket.on('taskDeleted', (taskId) => {
      // Emit the task deletion notification to the specific task's room
      io.to(taskId).emit('taskDeletedNotification', { taskId });
      console.log(`Task ${taskId} deleted`);
    });
  });
};

export const handleProjectNotification = (io, projectId, notification) => {
  // Emit the notification to the specific project's room
  io.to(projectId).emit('newProjectNotification', notification);

  // Listen for new project notifications
  socket.on('newProjectNotification', (notification) => {
    console.log('New project notification received:', notification);
  });
};

export const handleTaskNotification = (io, taskId, notification) => {
  // Emit the notification to the specific task's room
  io.to(taskId).emit('newTaskNotification', notification);

  // Listen for new task notifications
  socket.on('newTaskNotification', (notification) => {
    console.log('New task notification received:', notification);
  });
};