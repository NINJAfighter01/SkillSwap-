// userController.js
const User = require('../models/User');
const Progress = require('../models/Progress');
const TokenHistory = require('../models/TokenHistory');

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, bio, profilePicture } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.profilePicture = profilePicture || user.profilePicture;
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user progress
exports.getUserProgress = async (req, res) => {
    try {
        const progress = await Progress.findAll({ where: { userId: req.user.id } });
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user progress
exports.updateUserProgress = async (req, res) => {
    try {
        const { lectureId, completed } = req.body;
        const progress = await Progress.findOne({ where: { userId: req.user.id, lectureId } });
        if (!progress) {
            return res.status(404).json({ message: 'Progress not found' });
        }
        progress.completed = completed;
        await progress.save();
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user token history
exports.getUserTokenHistory = async (req, res) => {
    try {
        const tokenHistory = await TokenHistory.findAll({ where: { userId: req.user.id } });
        res.status(200).json(tokenHistory);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};