# WebSocket Patterns

This template provides patterns for implementing real-time communication using WebSockets and Socket.io.

## Basic Socket.io Setup

### 1. Server Setup
```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };
```

### 2. Client Setup (React)
```javascript
// hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function useSocket(url) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  return { socket, connected };
}

export default useSocket;
```

## Real-Time Chat Pattern

### 1. Server-Side Chat Implementation
```javascript
// sockets/chatSocket.js
const chatSocket = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);

    // Join a room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user_joined', {
        userId: socket.id,
        timestamp: new Date()
      });
    });

    // Leave a room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', {
        userId: socket.id,
        timestamp: new Date()
      });
    });

    // Send message
    socket.on('send_message', async (data) => {
      const { roomId, message, userId } = data;

      // Save message to database
      const savedMessage = await saveMessage({
        roomId,
        userId,
        message,
        timestamp: new Date()
      });

      // Broadcast to room
      chatNamespace.to(roomId).emit('receive_message', savedMessage);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user_typing', {
        userId: socket.id,
        username: data.username
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.roomId).emit('user_stop_typing', {
        userId: socket.id
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from chat:', socket.id);
    });
  });
};

module.exports = chatSocket;
```

### 2. Client-Side Chat Component
```javascript
// components/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function Chat({ roomId, userId, username }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3001/chat');

    socketInstance.on('connect', () => {
      socketInstance.emit('join_room', roomId);
    });

    socketInstance.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socketInstance.on('user_typing', (data) => {
      setTyping(data.username);
    });

    socketInstance.on('user_stop_typing', () => {
      setTyping(null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leave_room', roomId);
      socketInstance.disconnect();
    };
  }, [roomId]);

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('typing', { roomId, username });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId });
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !socket) return;

    socket.emit('send_message', {
      roomId,
      userId,
      message: message.trim()
    });

    setMessage('');
    socket.emit('stop_typing', { roomId });
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
        {typing && <div className="typing">{typing} is typing...</div>}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
```

## Authentication with Socket.io

### 1. Server-Side Authentication
```javascript
// middleware/socketAuth.js
const jwt = require('jsonwebtoken');

function socketAuth(socket, next) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
}

// Apply middleware
io.use(socketAuth);

io.on('connection', (socket) => {
  console.log('Authenticated user connected:', socket.userId);
});
```

### 2. Client-Side Authentication
```javascript
// hooks/useAuthSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function useAuthSocket(url, token) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const socketInstance = io(url, {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      setError(err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url, token]);

  return { socket, connected, error };
}

export default useAuthSocket;
```

## Room Management Pattern

```javascript
// sockets/roomManager.js
class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  createRoom(roomId, metadata = {}) {
    this.rooms.set(roomId, {
      id: roomId,
      users: new Set(),
      createdAt: new Date(),
      ...metadata
    });
  }

  joinRoom(socket, roomId, userData) {
    socket.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.createRoom(roomId);
    }

    const room = this.rooms.get(roomId);
    room.users.add(socket.id);

    // Notify others in room
    socket.to(roomId).emit('user_joined', {
      userId: socket.id,
      ...userData
    });

    // Send room info to user
    socket.emit('room_joined', {
      roomId,
      userCount: room.users.size
    });
  }

  leaveRoom(socket, roomId) {
    socket.leave(roomId);

    const room = this.rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);

      // Notify others
      socket.to(roomId).emit('user_left', {
        userId: socket.id
      });

      // Delete room if empty
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  getRoomUsers(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users) : [];
  }

  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }
}

module.exports = RoomManager;
```

## Presence/Online Status Pattern

```javascript
// sockets/presenceSocket.js
const presenceSocket = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    // User comes online
    socket.on('user_online', (userData) => {
      onlineUsers.set(socket.userId, {
        socketId: socket.id,
        ...userData,
        lastSeen: new Date()
      });

      // Broadcast to all clients
      io.emit('user_status_changed', {
        userId: socket.userId,
        status: 'online'
      });
    });

    // User goes offline
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        io.emit('user_status_changed', {
          userId: socket.userId,
          status: 'offline',
          lastSeen: new Date()
        });
      }
    });

    // Get online users
    socket.on('get_online_users', () => {
      const users = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
        userId,
        status: 'online'
      }));

      socket.emit('online_users', users);
    });
  });
};

module.exports = presenceSocket;
```

## Broadcasting Patterns

```javascript
// Broadcast to all clients
io.emit('notification', { message: 'Server announcement' });

// Broadcast to all except sender
socket.broadcast.emit('notification', { message: 'New user joined' });

// Broadcast to specific room
io.to('room1').emit('message', { text: 'Room message' });

// Broadcast to multiple rooms
io.to('room1').to('room2').emit('message', { text: 'Multi-room message' });

// Broadcast to specific socket
io.to(socketId).emit('private_message', { text: 'Private message' });

// Broadcast to all in room except sender
socket.to('room1').emit('message', { text: 'Message to others in room' });
```

## Notification System Pattern

```javascript
// services/notificationService.js
class NotificationService {
  constructor(io) {
    this.io = io;
  }

  sendToUser(userId, notification) {
    this.io.to(userId).emit('notification', {
      id: Date.now(),
      ...notification,
      timestamp: new Date()
    });
  }

  sendToMultipleUsers(userIds, notification) {
    userIds.forEach(userId => {
      this.sendToUser(userId, notification);
    });
  }

  broadcast(notification) {
    this.io.emit('notification', {
      id: Date.now(),
      ...notification,
      timestamp: new Date()
    });
  }
}

// Usage
const notificationService = new NotificationService(io);

// Send notification to specific user
notificationService.sendToUser('user123', {
  type: 'message',
  title: 'New Message',
  body: 'You have a new message'
});
```

## Error Handling Pattern

```javascript
// Server-side error handling
io.on('connection', (socket) => {
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    socket.emit('error_response', {
      message: 'An error occurred',
      code: 'SOCKET_ERROR'
    });
  });

  // Wrap event handlers with try-catch
  socket.on('send_message', async (data) => {
    try {
      // Process message
      const result = await processMessage(data);
      socket.emit('message_sent', result);
    } catch (error) {
      socket.emit('error_response', {
        message: error.message,
        code: 'MESSAGE_ERROR'
      });
    }
  });
});

// Client-side error handling
socket.on('error_response', (error) => {
  console.error('Server error:', error);
  // Show error to user
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Attempt reconnection or show error
});
```

## Heartbeat/Ping Pattern

```javascript
// Server-side heartbeat
io.on('connection', (socket) => {
  let isAlive = true;

  socket.on('pong', () => {
    isAlive = true;
  });

  const interval = setInterval(() => {
    if (!isAlive) {
      socket.disconnect();
      clearInterval(interval);
      return;
    }

    isAlive = false;
    socket.emit('ping');
  }, 30000); // 30 seconds

  socket.on('disconnect', () => {
    clearInterval(interval);
  });
});

// Client-side heartbeat response
socket.on('ping', () => {
  socket.emit('pong');
});
```
