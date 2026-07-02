const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Optional auth for chat route so unauthenticated users can still chat
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // If token is invalid, just proceed as unauthenticated
        req.user = null;
        next();
    }
};

module.exports = authMiddleware;
