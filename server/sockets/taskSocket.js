export const handleTaskNotification = (io) => {
    io.on('connection', (socket) => {
    console.log('User connected to task socket:', socket.id);

    /*
     how the room for a particular taskId get created? The room for a particular taskId is created when a user joins that task's room using the `socket.join(taskId)` method. When a user connects to the socket and emits the 'joinTask' event with a specific taskId, the server adds that user's socket to the room associated with that taskId. The room is created when a user (including the admin or any assigned user) connects to the socket and emits the 'createTaskRoom' event with the specific taskId. This event will trigger the server to call `socket.join(taskId)`, which creates the room for that task if it doesn't already exist and adds the user's socket to that room. So, the room is created dynamically based on user interactions rather than automatically when the task is created.
    */

    socket.on('createTaskRoom', (taskId) => {
      socket.join(taskId);
      console.log(`Socket ${socket.id} created task room: ${taskId}`);
    });

    socket.on('leaveTask', (taskId) => {
      socket.leave(taskId);
      console.log(`Socket ${socket.id} left task room: ${taskId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from task socket:', socket.id);
    });
    
    socket.on('taskAssigned', (taskId, assignedUserId) => {
      // io.to(assignedUserId).emit('taskAssignedNotification', {assignedUserId });
      socket.join(taskId);
      console.log(`Task ${taskId} assigned to user ${assignedUserId}`);
    });

    socket.on('taskUnassigned', (taskId, unassignedUserId) => {
    //   io.to(unassignedUserId).emit('taskUnassignedNotification', {unassignedUserId });
      socket.leave(taskId); // will this notify the speci
      console.log(`Task ${taskId} unassigned from user ${unassignedUserId}`);
    });
    
    socket.on('taskUpdated', (taskId) => {
    //   io.to(taskId).emit('taskUpdatedNotification', { taskId, updatedData }); 
      console.log(`Task ${taskId} updated with data:`);
    });

    socket.on('taskDeleted', (taskId) => {
    //   io.to(taskId).emit('taskDeletedNotification', { taskId });
      io.in(taskId).socketsleave(taskId);
      console.log(`Task ${taskId} has been deleted`);
    });
  });
};

export const handleProjectSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected to project socket:', socket.id);

        socket.on('joinProject', (projectId) => {
            socket.join(projectId);
            console.log(`Socket ${socket.id} joined project room: ${projectId}`);
        });

        socket.on('leaveProject', (projectId) => {
            socket.leave(projectId);
            console.log(`Socket ${socket.id} left project room: ${projectId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from project socket:', socket.id);
        });

        socket.on('addedToProject', (projectId, addedUserId) => {
            io.to(addedUserId).emit('addedToProjectNotification', { projectId, addedUserId });
            socket.join(projectId);
            console.log(`User ${addedUserId} added to project ${projectId}`);
        });

        socket.on('removedFromProject', (projectId, removedUserId) => {
            io.to(removedUserId).emit('removedFromProjectNotification', { projectId, removedUserId });
            socket.leave(projectId);
            console.log(`User ${removedUserId} removed from project ${projectId}`);
        });

        socket.on('projectUpdated', (projectId, updatedData) => {
            io.to(projectId).emit('projectUpdatedNotification', { projectId, updatedData });
            console.log(`Project ${projectId} updated with data:`, updatedData);
        });

        socket.on('projectDeleted', (projectId) => {
            io.to(projectId).emit('projectDeletedNotification', { projectId });
            socket.leave(projectId);
            console.log(`Project ${projectId} has been deleted`);
        });
    });
};

// export const a = (io, taskId, notification) => {
//   // Emit the notification to the specific task's room
//   io.to(taskId).emit('newTaskNotification', notification);

//   // Listen for new task notifications
//   io.on('newTaskNotification', (notification) => {
//     console.log('New task notification received:', notification);
//   });
// };

export const handleUserNotification = (io, recipientId, notification) => {
  // Emit the notification to the specific recipient's room
  io.to(recipientId).emit('newUserNotification', notification);

    socket.on('newTaskAssigned', (TaskId) => {
        console.log('New task assigned:', TaskId);
    });

    socket.on('newTaskUnassigned', (TaskId) => {
        console.log('Task unassigned:', TaskId);
    });

    socket.on('addedToProject', (projectId) => {
        console.log('Added to project:', projectId);
    });

    socket.on('removedFromProject', (projectId) => {
        console.log('Removed from project:', projectId);
    });
}