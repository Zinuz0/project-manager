export const handleUserNotification = (io, recipientId, notification) => {
  io.to(recipientId).emit('newUserNotification', notification);

    socket.on('taskAssignedNotification', (TaskId) => {
        console.log('New task assigned:', TaskId);
    });

    socket.on('taskUnassignedNotification', (TaskId) => {
        console.log('Task unassigned:', TaskId);
    });

    socket.on('addedToProject', (projectId) => {
        console.log('Added to project:', projectId);
    });

    socket.on('removedFromProject', (projectId) => {
        console.log('Removed from project:', projectId);
    });
};