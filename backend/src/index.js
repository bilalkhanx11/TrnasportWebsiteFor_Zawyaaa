require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many login attempts' } });
const locationLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 30 });
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/driver/trip', locationLimiter);

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/trucks', require('./routes/trucks'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/driver', require('./routes/driverTracking'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Zawaya Alkayan API', timestamp: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Zawaya Alkayan API running on http://localhost:${PORT}`);
});
