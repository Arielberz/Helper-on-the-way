const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/DB');
const userRouter = require('./api/routers/userRouter');
const requestsRouter = require('./api/routers/requestsRouter');
// const ratingRouter = require('./api/routers/ratingRouter');
const chatRouter = require('./api/routers/chatRouter');
const initializeChatSockets = require('./api/sockets/chatSockets');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
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

app.use('/api/users', userRouter);
app.use('/api/requests', requestsRouter);
// app.use('/api/ratings', ratingRouter);
app.use('/api/chat', chatRouter);

// Initialize chat sockets
initializeChatSockets(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.IO is ready for connections`);
}); 
