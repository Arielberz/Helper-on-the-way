const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/DB');
const userRouter = require('./Api/routers/userRouter');
const locationRouter = require('./Api/routers/locationRouter');
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
app.use('/api/locations', locationRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
