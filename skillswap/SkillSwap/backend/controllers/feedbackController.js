const Feedback = require('../models/Feedback');

// Submit feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { userId, message } = req.body;

        // Validate input
        if (!userId || !message) {
            return res.status(400).json({ error: 'User ID and message are required.' });
        }

        // Create new feedback entry
        const feedback = await Feedback.create({ userId, message });

        return res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while submitting feedback.' });
    }
};

// Get all feedback
exports.getAllFeedback = async (req, res) => {
    try {
        const feedbackList = await Feedback.findAll();
        return res.status(200).json(feedbackList);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while retrieving feedback.' });
    }
};