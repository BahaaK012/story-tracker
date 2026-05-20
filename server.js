require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB and auto-create tables
require('./backend/database/db');

// Routes
const authRoutes    = require('./backend/routes/authRoutes');
const storyRoutes   = require('./backend/routes/storyRoutes');
const searchRoutes  = require('./backend/routes/searchRoutes');
const docsRoutes    = require('./backend/routes/docsRoutes');

app.use('/api/auth',    authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/search',  searchRoutes);
app.use('/api/docs',    docsRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 for unknown API routes
app.use('/api/*path', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Story Tracker running at http://localhost:${PORT}`);
    console.log(`API Docs: http://localhost:${PORT}/api/docs`);
});

module.exports = app;
