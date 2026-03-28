const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    // Get token from the header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. Malformed token.' });
    }

    try {
        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Add user payload to request object
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        res.status(400).json({ error: 'Invalid Token.' });
    }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access Denied. Admin privileges required.' });
    }
};

module.exports = { verifyToken, isAdmin };
