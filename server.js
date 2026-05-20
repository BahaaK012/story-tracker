require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

require('./backend/database/db');

// --- Import our Routes ---
const authRoutes = require('./backend/routes/authRoutes');
const storyRoutes = require('./backend/routes/storyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: 'connected' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});