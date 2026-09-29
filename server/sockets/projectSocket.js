// Handle real-time WebSocket events for project updates and notifications
export const handleProjectSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected to project socket:', socket.id);

        // Join project room
        socket.on('joinProject', (projectId) => {
            socket.join(projectId);
            console.log(`Socket ${socket.id} joined project room: ${projectId}`);
        });

        // Leave project room
        socket.on('leaveProject', (projectId) => {
            socket.leave(projectId);
            console.log(`Socket ${socket.id} left project room: ${projectId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from project socket:', socket.id);
        });

        // Notify member added to project
        socket.on('addedToProject', (projectId, addedUserId) => {
            io.to(addedUserId).emit('addedToProjectNotification', { projectId, addedUserId });
            socket.join(projectId);
            console.log(`User ${addedUserId} added to project ${projectId}`);
        });

        // Notify member removed from project
        socket.on('removedFromProject', (projectId, removedUserId) => {
             io.to(removedUserId).emit('removedFromProjectNotification', { projectId, removedUserId });
            socket.leave(projectId);
            console.log(`User ${removedUserId} removed from project ${projectId}`);
        });

        // Broadcast project updates to room
        socket.on('projectUpdated', (projectId, updatedData) => {
            io.to(projectId).emit('projectUpdatedNotification', { projectId, updatedData });
            console.log(`Project ${projectId} updated with data:`, updatedData);
        });

        // Handle project deletion
        socket.on('projectDeleted', (projectId) => {
            io.to(projectId).emit('projectDeletedNotification', { projectId });
            io.in(projectId).socketsLeave(projectId);
            console.log(`Project ${projectId} has been deleted`);
        });
    });
};
 
