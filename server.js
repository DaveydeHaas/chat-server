const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

let chatHistory = []; // Array to store chat messages
let onlineUsers = new Map(); // Map to store online users and their usernames

app.use(cors()); // Enable CORS for all routes

io.on('connection', (socket) => {
    console.log('A user connected');

    // Add user to online users map with a default username
    onlineUsers.set(socket.id, { id: socket.id, username: 'User' + socket.id.slice(0, 5) });

    // Emit chat history to the new client
    socket.emit('chat history', chatHistory);

    // Emit join message to all clients
    io.emit('chat message', {
        user: 'System',
        message: `${onlineUsers.get(socket.id).username} joined the chat`
    });

    // Emit updated online users list to all clients
    io.emit('online users', Array.from(onlineUsers.values()));

    // Listen for typing event
    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('typing', { id: socket.id, isTyping });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');

        // Emit leave message to all clients
        io.emit('chat message', {
            user: 'System',
            message: `${onlineUsers.get(socket.id).username} left the chat`
        });

        // Remove user from online users map
        onlineUsers.delete(socket.id);

        // Emit updated online users list to all clients
        io.emit('online users', Array.from(onlineUsers.values()));
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg.text);
        // Store message in chat history
        chatHistory.push(msg);
        io.emit('chat message', msg); // Broadcast message to everyone
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
