const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id);
        if (!req.user) {
            return res.status(401).json({ message: 'Token is not valid, authorization denied.' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is not valid, authorization denied.' });
    }
};

module.exports = authMiddleware;