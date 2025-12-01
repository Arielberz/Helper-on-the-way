const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/DB');
const userRouter = require('./Api/routers/userRouter');
const requestsRouter = require('./Api/routers/requestsRouter');
const ratingRouter = require('./Api/routers/ratingRouter');
const chatRouter = require('./Api/routers/chatRouter');
const reportRouter = require('./Api/routers/reportRouter');
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/users', userRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/chat', chatRouter);
app.use('/api/reports', reportRouter);

// Initialize chat sockets
initializeChatSockets(io);

// Socket.IO connection handling with authentication
io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);
    
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.join(`user:${socket.userId}`);
            console.log(`User ${socket.userId} joined their room`);
        } catch (err) {
            console.error('Socket auth error:', err.message);
        }
    }

    // Manual join for user-specific room (for clients that send explicit join event)
    socket.on('join', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} manually joined their room`);
    });

    socket.on('newRequest', (request) => {
        socket.broadcast.emit('requestAdded', request);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});