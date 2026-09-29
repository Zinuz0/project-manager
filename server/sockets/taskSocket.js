// Handle real-time WebSocket events for task updates and assignments
export const handleTaskNotification = (io) => {
    io.on('connection', (socket) => {
    console.log('User connected to task socket:', socket.id);

    // Create and join a task socket room
    socket.on('createTaskRoom', (taskId) => {
      socket.join(taskId);
      console.log(`Socket ${socket.id} created task room: ${taskId}`);
    });

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
    
    // Notify assigned user
    socket.on('taskAssigned', (taskId, assignedUserId) => {
      io.to(assignedUserId).emit('taskAssignedNotification', { assignedUserId });
      socket.join(taskId);
      console.log(`Task ${taskId} assigned to user ${assignedUserId}`);
    });

    // Notify unassigned user
    socket.on('taskUnassigned', (taskId, unassignedUserId) => {
      io.to(unassignedUserId).emit('taskUnassignedNotification', { unassignedUserId });
      socket.leave(taskId); 
      console.log(`Task ${taskId} unassigned from user ${unassignedUserId}`);
    });
    
    // Broadcast task update
    socket.on('taskUpdated', (taskId) => {
      io.to(taskId).emit('taskUpdatedNotification', { taskId }); 
      console.log(`Task ${taskId} updated`);
    });

    // Handle task deletion
    socket.on('taskDeleted', (taskId) => {
      io.to(taskId).emit('taskDeletedNotification', { taskId });
      io.in(taskId).socketsLeave(taskId);
      console.log(`Task ${taskId} has been deleted`);
    });
  });
};


