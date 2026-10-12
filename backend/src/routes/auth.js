const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, auditLogs, uuidv4 } = require('../data/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ success: false, message: 'Account is inactive' });
  }
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
  auditLogs.push({
    id: uuidv4(),
    user_id: user.id,
    action: 'login',
    entity_type: 'auth',
    entity_id: null,
    description: `${user.name} logged in`,
    ip_address: req.ip,
    created_at: new Date().toISOString(),
  });
  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
  auditLogs.push({
    id: uuidv4(),
    user_id: req.user.id,
    action: 'logout',
    entity_type: 'auth',
    entity_id: null,
    description: `${req.user.name} logged out`,
    ip_address: req.ip,
    created_at: new Date().toISOString(),
  });
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
