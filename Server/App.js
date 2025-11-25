const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/DB');
const userRouter = require('./Api/routers/userRouter');
const requestsRouter = require('./Api/routers/requestsRouter');
const ratingRouter = require('./Api/routers/ratingRouter');
const chatRouter = require('./Api/routers/chatRouter');
const initializeChatSockets = require('./Api/sockets/chatSockets');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with proper CORS settings
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    }
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/users', userRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/chat', chatRouter);

// Initialize chat sockets
initializeChatSockets(io);

// Socket.IO connection handling with authentication
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Store user ID from auth token
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            console.log(`User ${socket.userId} connected with socket ${socket.id}`);
            
            // Join a room for this user
            socket.join(`user:${socket.userId}`);
        } catch (err) {
            console.error('Socket auth error:', err.message);
        }
    }

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Listen for new request clicks
    socket.on('newRequest', (request) => {
        console.log('Broadcasting new request:', request);
        socket.broadcast.emit('requestAdded', request);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.IO is ready for connections`);
    console.log(`Rating system enabled`);
});