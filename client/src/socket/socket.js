// WebSocket connection setup
import { io } from 'socket.io-client';

const socket = io(window.location.origin || 'http://localhost:5000', {
  autoConnect: false,
});

export default socket;
