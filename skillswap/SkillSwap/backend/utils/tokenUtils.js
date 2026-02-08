module.exports = {
    generateToken: (userId) => {
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        return token;
    },

    verifyToken: (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            return null;
        }
    },

    extractTokenFromHeader: (req) => {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }
        return null;
    },
};