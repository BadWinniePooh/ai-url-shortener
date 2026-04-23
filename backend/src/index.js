require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { initDb } = require('./db');
const { scheduleHealthChecks } = require('./jobs/healthCheck');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const statsRoutes = require('./routes/stats');
const redirectRouter = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true,
}));
app.use(express.json());

// Serve static frontend build
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/stats', statsRoutes);

// Short URL redirects (check slug before falling through to SPA)
app.use(redirectRouter);

// SPA fallback — serve index.html for all unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => console.log(`Shortwave backend on port ${PORT}`));
    scheduleHealthChecks();
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
