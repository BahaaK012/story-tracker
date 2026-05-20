const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Look for the keycard in the headers
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied. Please login.' });

    try {
        // Verify the keycard
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach the user's ID to the request
        next(); // Let them pass
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};