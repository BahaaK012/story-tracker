require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// inistal database connection
require('./backend/database/db');

// basic health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Story Tracker API is running', 
        db: 'connected' 
    });
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});