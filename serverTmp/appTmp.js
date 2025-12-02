const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/DB');

const userRouter = require('./api/routers/userRouter');
const requestsRouter = require('./api/routers/requestsRouter');
const ratingRouter = require('./api/routers/ratingRouter');
const chatRouter = require('./api/routers/chatRouter');
const initializeChatSockets = require('./api/sockets/chatSockets');
const reportRouter = require('./api/routers/reportRouter');

const cors = require('cors');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with proper CORS settings
const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || '').split(',').filter(Boolean);
const corsOptions = {
    origin: allowedOrigins.length ? allowedOrigins : ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
};
const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
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

// Initialize chat sockets (handles all socket connections)
initializeChatSockets(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});