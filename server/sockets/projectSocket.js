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
            io.in(projectId).socketsLeave(projectId);
            console.log(`Project ${projectId} has been deleted`);
        });
    });
};

/*
//io.to vs io.on: io.to emits to a specific room, while io.on listens for events. like for example, io.to(recipientId).emit('newNotification', notification) sends the notification to the specific recipient's room, while io.on('newNotification', ...) listens for incoming notifications from clients.

// socket.emit vs io.to: socket.emit sends an event to the specific socket that triggered the event, while io.to emits to all sockets in a specific room. For example, socket.emit('newNotification', notification) sends the notification only to the socket that triggered the event, while io.to(recipientId).emit('newNotification', notification) sends the notification to all sockets in the recipient's room. what do you mean room? A room in Socket.IO is a way to group sockets together. Each socket can join one or more rooms, and you can emit events to all sockets in a specific room. In this context, when a user joins a project, their socket is added to a room named after the project ID. This allows you to send notifications or messages specifically to users who are part of that project by emitting events to that room. if you want to send a notification to a specific user, you can create a room for that user using their user ID. When the user connects, their socket joins a room named after their user ID. Then, when you want to send a notification to that user, you can emit the event to that room using io.to(userId).emit('newNotification', notification). This way, only the sockets in that user's room will receive the notification.

// a userid can be part of multiple projects, so when a notification is created for a specific project as a whole, you can emit the notification to the room associated with that project. This way, all users who are part of that project will receive the notification in real-time.
// each project has a tasks, its the admin that assigns users/members to the specific tasks, so when a notification is created for a specific task, you can emit the notification to the room associated with that task. This way, all users who are assigned to that task will receive the notification in real-time. a notification can be automatically created when a task is assigned to a user, or when a task is updated or completed, also when a comment is added to a task, or when a deadline is approaching. The notification can be created in the backend and then emitted to the specific user or project room using Socket.IO.

/* how do you make it so that the user gets a notification when a new notification is created? To make it so that the user gets a notification when a new notification is created, you can implement real-time notifications using WebSockets or a library like Socket.IO. Here's a basic outline of how you can achieve this: 
1. Set up a WebSocket server using Socket.IO in your backend.
2. When a new notification is created in the `createNotification` function, emit an event through the WebSocket server to notify the recipient user.
3. On the client side, establish a WebSocket connection to listen for incoming notification events.
4. When the client receives a notification event, update the UI to display the new notification to the user in real-time.

This way, users will receive notifications instantly without needing to refresh or make additional requests to check for new notifications.
*/ 
