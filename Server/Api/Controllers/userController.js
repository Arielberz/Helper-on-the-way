const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function sendResponse(res, status, success, message, data = null) {
	res.status(status).json({ success, message, data });
}

exports.register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        if (!username || !email || !password || !phone) {
            return sendResponse(res, 400, false, "all fields are required");
        }
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(email)) {
            return sendResponse(res, 400, false, "invalid email format");
        }
       if (password.length < 6) {
            return sendResponse(res, 400, false, "password must be at least 6 characters");
        }
        const existingUser = await User.findOne({ $or: [ { username }, { email }, { phone } ] });
        if (existingUser) {
            return sendResponse(res, 400, false, "email already in use");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, phone });
        await newUser.save();
        sendResponse(res, 201, true, "user registered successfully");
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        sendResponse(res, 201, true, "user registered successfully", { token ,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone
            }
        }); 
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, "server error", { error: error.message });
    }};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return sendResponse(res, 400, false, "identifier and password are required");
        }
        const user = await User.findOne({ $or: [ { email: identifier }, { username: identifier }, { phone: identifier } ] });
        if (!user) {
            return sendResponse(res, 400, false, "invalid credentials");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendResponse(res, 400, false, "invalid credentials");
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        sendResponse(res, 200, true, "login successful", { token }, {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, "server error", { error: error.message });
    }
};