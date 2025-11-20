const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/DB');
const userRouter = require('./api/routers/userRouter');
const requestsRouter = require('./api/routers/requestsRouter');
// const ratingRouter = require('./api/routers/ratingRouter');
// const chatRouter = require('./api/routers/chatRouter');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
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

app.use('/api/users', userRouter);
app.use('/api/requests', requestsRouter);
// app.use('/api/ratings', ratingRouter);
// app.use('/api/chat', chatRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Listen for new request clicks
    socket.on('newRequest', (request) => {
        console.log('Broadcasting new request:', request);
        // Broadcast to all other clients
        socket.broadcast.emit('requestAdded', request);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.IO ready for real-time updates`);
}); 
