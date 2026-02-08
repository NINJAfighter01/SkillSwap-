const Lecture = require('../models/Lecture');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get all lectures
exports.getAllLectures = async (req, res) => {
    try {
        const lectures = await Lecture.findAll({
            include: [{ model: User, attributes: ['id', 'name', 'avatar'] }],
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(lectures);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving lectures', error });
    }
};

// Get lecture by ID
exports.getLectureById = async (req, res) => {
    const { id } = req.params;
    try {
        const lecture = await Lecture.findByPk(id, {
            include: [{ model: User, attributes: ['id', 'name', 'avatar'] }],
        });
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }
        res.status(200).json(lecture);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving lecture', error });
    }
};

// Create a new lecture
exports.createLecture = async (req, res) => {
    const { title, description, videoUrl, category } = req.body;
    try {
        const newLecture = await Lecture.create({
            title,
            description,
            videoUrl,
            category,
            teacherId: req.user.id,
        });
        res.status(201).json(newLecture);
    } catch (error) {
        res.status(500).json({ message: 'Error creating lecture', error });
    }
};

// Update a lecture
exports.updateLecture = async (req, res) => {
    const { id } = req.params;
    const { title, description, videoUrl, category } = req.body;
    try {
        const [updated] = await Lecture.update(
            { title, description, videoUrl, category },
            { where: { id } }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Lecture not found' });
        }
        res.status(200).json({ message: 'Lecture updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating lecture', error });
    }
};

// Delete a lecture
exports.deleteLecture = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Lecture.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Lecture not found' });
        }
        res.status(204).json({ message: 'Lecture deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lecture', error });
    }
};

// Watch a lecture
exports.watchLecture = async (req, res) => {
    const { id } = req.params;
    try {
        const lecture = await Lecture.findByPk(id);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }
        // Deduct tokens logic here
        // Assuming user has enough tokens
        // Update token balance and transfer tokens to teacher
        res.status(200).json({ message: 'Lecture watched successfully', lecture });
    } catch (error) {
        res.status(500).json({ message: 'Error watching lecture', error });
    }
};