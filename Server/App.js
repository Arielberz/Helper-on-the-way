const express = require('express');
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

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/requests', requestsRouter);
// app.use('/api/ratings', ratingRouter);
// app.use('/api/chat', chatRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
