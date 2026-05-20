require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB - Ensure this path is correct relative to server.js
require('./backend/database/db');

// Import Routes
const authRoutes = require('./backend/routes/authRoutes');
const storyRoutes = require('./backend/routes/storyRoutes');

// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes); 

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));