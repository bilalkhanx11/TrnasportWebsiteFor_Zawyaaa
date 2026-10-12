const express = require('express');
const router = express.Router();
const { drivers, auditLogs, uuidv4 } = require('../data/db');
const { authenticate } = require('../middleware/auth');

// GET /api/drivers
router.get('/', authenticate, (req, res) => {
  const { status, search } = req.query;
  let result = [...drivers];
  if (status) result = result.filter(d => d.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.driver_code.toLowerCase().includes(q) ||
      d.phone.includes(q)
    );
  }
  res.json({ success: true, data: result, total: result.length });
});

// GET /api/drivers/:id
router.get('/:id', authenticate, (req, res) => {
  const driver = drivers.find(d => d.id === req.params.id);
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
  res.json({ success: true, data: driver });
});

// POST /api/drivers
router.post('/', authenticate, (req, res) => {
  const { name, phone, whatsapp, license_number, license_expiry, notes } = req.body;
  if (!name || !phone || !license_number) {
    return res.status(400).json({ success: false, message: 'name, phone, and license_number are required' });
  }
  const newDriver = {
    id: uuidv4(),
    driver_code: `D-${String(drivers.length + 1).padStart(3, '0')}`,
    name, phone,
    whatsapp: whatsapp || phone,
    license_number,
    license_expiry: license_expiry || null,
    status: 'available',
    assigned_truck_id: null,
    notes: notes || '',
    created_at: new Date().toISOString(),
  };
  drivers.push(newDriver);
  auditLogs.push({
    id: uuidv4(), user_id: req.user.id, action: 'create',
    entity_type: 'driver', entity_id: newDriver.id,
    description: `Created driver ${newDriver.name}`,
    ip_address: req.ip, created_at: new Date().toISOString(),
  });
  res.status(201).json({ success: true, data: newDriver });
});

// PATCH /api/drivers/:id
router.patch('/:id', authenticate, (req, res) => {
  const idx = drivers.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Driver not found' });
  const allowed = ['name','phone','whatsapp','license_number','license_expiry','status','notes','assigned_truck_id'];
  allowed.forEach(k => { if (req.body[k] !== undefined) drivers[idx][k] = req.body[k]; });
  drivers[idx].updated_at = new Date().toISOString();
  auditLogs.push({
    id: uuidv4(), user_id: req.user.id, action: 'update',
    entity_type: 'driver', entity_id: drivers[idx].id,
    description: `Updated driver ${drivers[idx].name}`,
    ip_address: req.ip, created_at: new Date().toISOString(),
  });
  res.json({ success: true, data: drivers[idx] });
});

// DELETE /api/drivers/:id
router.delete('/:id', authenticate, (req, res) => {
  const idx = drivers.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Driver not found' });
  const [removed] = drivers.splice(idx, 1);
  auditLogs.push({
    id: uuidv4(), user_id: req.user.id, action: 'delete',
    entity_type: 'driver', entity_id: removed.id,
    description: `Deleted driver ${removed.name}`,
    ip_address: req.ip, created_at: new Date().toISOString(),
  });
  res.json({ success: true, message: 'Driver deleted' });
});

module.exports = router;
