/*
  קובץ זה אחראי על:
  - אתחול שרת האקספרס והגדרת Socket.IO
  - חיבור למסד הנתונים MongoDB
  - רישום כל הנתיבים והראוטרים של האפליקציה
  - הפעלת שירות הניקיון האוטומטי לבקשות ישנות

  הקובץ משמש את:
  - כל הקליינטים המתחברים לשרת
  - כל הנתיבים והשירותים של המערכת

  הקובץ אינו:
  - מטפל בלוגיקה עסקית ספציפית - זה נעשה בקונטרולרים ובשירותים
*/

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/DB');

const userRouter = require('./api/routers/userRouter');
const requestsRouter = require('./api/routers/requestsRouter');
const ratingRouter = require('./api/routers/ratingRouter');
const chatRouter = require('./api/routers/chatRouter');
const paymentRouter = require('./api/routers/paymentRouter');
const reportRouter = require('./api/routers/reportRouter');
const adminRouter = require('./api/routers/adminRouter');
const contactRouter = require('./api/routers/contactRouter');
const initializeChatSockets = require('./api/sockets/chatSockets');
const { initCleanupJob } = require('./api/services/cleanupService');

const cors = require('cors');

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || '').split(',').filter(Boolean);
const corsOptions = {
    origin: allowedOrigins.length ? allowedOrigins : ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
};
const io = new Server(server, { 
    cors: {
        origin: allowedOrigins.length ? allowedOrigins : ['http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ limit: '8mb', extended: true }));

app.use((err, req, res, next) => {
    if (err && err.type === 'entity.too.large') {
        return res.status(413).json({ success: false, message: 'Payload too large. Max 8MB.' });
    }
    next(err);
});

app.set('io', io);

// Health check endpoint for verification
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/users', userRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/chat', chatRouter);
app.use('/api/reports', reportRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/contact', contactRouter);

initializeChatSockets(io);

// Start server after DB connection
const startServer = async () => {
    try {
        await connectDB();
        
        initCleanupJob(io);
        
        const PORT = process.env.PORT || 3001;
        server.listen(PORT, () => {
            console.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();