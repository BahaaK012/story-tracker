const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

// register a new user
exports.register = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Encrypt password
        
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username already taken.' });
                return res.status(500).json({ error: 'Database error.' });
            }
            res.status(201).json({ message: 'Account created! You can now log in.' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    } 
};

// login into an existing user
exports.login = (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

        // compare typed password with encrypted database password (    I am trying to apply what tugberk taught)
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid username or password.' });

        
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: 'Welcome back!', token, username: user.username });
    });
};