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

let chatHistory = []; 
let onlineUsers = new Map(); 

app.use(cors()); 

io.on('connection', (socket) => {
    console.log('A user connected');

    // Add user to online users map with a default name
    onlineUsers.set(socket.id, { id: socket.id, name: socket.name });

    // Emit chat history to the new client
    socket.emit('chat history', chatHistory);

    // Emit join message to all clients
    io.emit('chat message', {
        name: 'System',
        text: `${onlineUsers.get(socket.id).name} joined the chat`,
        userId: 0
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
            name: 'System',
            text: `${onlineUsers.get(socket.id).name} left the chat`,
            userId: 0
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
        io.emit('chat message', msg);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
