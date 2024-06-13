// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app and create a HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO and bind it to the HTTP server
const io = socketIo(server);

// Handle incoming socket connections
io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle incoming chat messages
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg); // Broadcast message to everyone
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
const port = process.env.PORT || 3000; // Use the provided port or default to 3000
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});