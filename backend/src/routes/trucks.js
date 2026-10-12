const express = require('express');
const router = express.Router();
const { trucks, auditLogs, uuidv4 } = require('../data/db');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  const { status, truck_type, search } = req.query;
  let result = [...trucks];
  if (status) result = result.filter(t => t.status === status);
  if (truck_type) result = result.filter(t => t.truck_type === truck_type);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(t =>
      t.truck_code.toLowerCase().includes(q) ||
      t.plate_number.toLowerCase().includes(q) ||
      (t.make && t.make.toLowerCase().includes(q))
    );
  }
  res.json({ success: true, data: result, total: result.length });
});

router.get('/:id', authenticate, (req, res) => {
  const truck = trucks.find(t => t.id === req.params.id);
  if (!truck) return res.status(404).json({ success: false, message: 'Truck not found' });
  res.json({ success: true, data: truck });
});

router.post('/', authenticate, (req, res) => {
  const { plate_number, truck_type, make, model, year, capacity, color, notes, insurance_expiry, registration_expiry, inspection_date } = req.body;
  if (!plate_number || !truck_type) {
    return res.status(400).json({ success: false, message: 'plate_number and truck_type are required' });
  }
  const newTruck = {
    id: uuidv4(),
    truck_code: `ZA-TR-${String(trucks.length + 1).padStart(3, '0')}`,
    plate_number, truck_type,
    make: make || '', model: model || '', year: year || null,
    capacity: capacity || '', color: color || 'White',
    status: 'available', assigned_driver_id: null,
    insurance_expiry: insurance_expiry || null,
    registration_expiry: registration_expiry || null,
    inspection_date: inspection_date || null,
    latest_location: null, latest_location_at: null,
    notes: notes || '',
    created_at: new Date().toISOString(),
  };
  trucks.push(newTruck);
  auditLogs.push({
    id: uuidv4(), user_id: req.user.id, action: 'create',
    entity_type: 'truck', entity_id: newTruck.id,
    description: `Created truck ${newTruck.truck_code}`,
    ip_address: req.ip, created_at: new Date().toISOString(),
  });
  res.status(201).json({ success: true, data: newTruck });
});

router.patch('/:id', authenticate, (req, res) => {
  const idx = trucks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Truck not found' });
  const allowed = ['plate_number','truck_type','make','model','year','capacity','color','status','assigned_driver_id','insurance_expiry','registration_expiry','inspection_date','notes'];
  allowed.forEach(k => { if (req.body[k] !== undefined) trucks[idx][k] = req.body[k]; });
  trucks[idx].updated_at = new Date().toISOString();
  auditLogs.push({
    id: uuidv4(), user_id: req.user.id, action: 'update',
    entity_type: 'truck', entity_id: trucks[idx].id,
    description: `Updated truck ${trucks[idx].truck_code}`,
    ip_address: req.ip, created_at: new Date().toISOString(),
  });
  res.json({ success: true, data: trucks[idx] });
});

router.delete('/:id', authenticate, (req, res) => {
  const idx = trucks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Truck not found' });
  const [removed] = trucks.splice(idx, 1);
  auditLogs.push({
    id: uuidv4(), user_id: req.user.id, action: 'delete',
    entity_type: 'truck', entity_id: removed.id,
    description: `Deleted truck ${removed.truck_code}`,
    ip_address: req.ip, created_at: new Date().toISOString(),
  });
  res.json({ success: true, message: 'Truck deleted' });
});

module.exports = router;
