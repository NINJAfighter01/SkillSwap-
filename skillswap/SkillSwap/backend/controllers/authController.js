const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, name });

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Logout user
exports.logout = (req, res) => {
    res.status(200).json({ message: 'User logged out successfully' });
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
};

// Google OAuth login
exports.googleLogin = async (req, res) => {
    // Implement Google OAuth logic here
};

// Facebook OAuth login
exports.facebookLogin = async (req, res) => {
    // Implement Facebook OAuth logic here
};

// Microsoft OAuth login
exports.microsoftLogin = async (req, res) => {
    // Implement Microsoft OAuth logic here
};