const express = require('express');
const router = express.Router();
const { trips, tripDriverLinks, tripEvents, drivers, trucks, clients, auditLogs, notifications, uuidv4 } = require('../data/db');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

router.get('/', authenticate, (req, res) => {
  const { status, driver_id, truck_id, client_id, search } = req.query;
  let result = [...trips];
  if (status) result = result.filter(t => t.status === status);
  if (driver_id) result = result.filter(t => t.driver_id === driver_id);
  if (truck_id) result = result.filter(t => t.truck_id === truck_id);
  if (client_id) result = result.filter(t => t.client_id === client_id);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(t => t.trip_code.toLowerCase().includes(q) || t.origin.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q));
  }
  // Enrich with client/driver/truck names
  const enriched = result.map(t => ({
    ...t,
    client_name: clients.find(c => c.id === t.client_id)?.company_name || '',
    driver_name: drivers.find(d => d.id === t.driver_id)?.name || '',
    truck_code: trucks.find(tk => tk.id === t.truck_id)?.truck_code || '',
  }));
  res.json({ success: true, data: enriched, total: enriched.length });
});

router.get('/:id', authenticate, (req, res) => {
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
  const events = tripEvents.filter(e => e.trip_id === trip.id);
  const link = tripDriverLinks.find(l => l.trip_id === trip.id && !l.revoked_at);
  res.json({
    success: true,
    data: {
      ...trip,
      client: clients.find(c => c.id === trip.client_id) || null,
      driver: drivers.find(d => d.id === trip.driver_id) || null,
      truck: trucks.find(tk => tk.id === trip.truck_id) || null,
      events,
      has_active_link: !!link,
      driver_link_token: link ? link.token : null,
    },
  });
});

router.post('/', authenticate, (req, res) => {
  const { client_id, driver_id, truck_id, origin, destination, cargo_description, start_at, expected_end_at, notes } = req.body;
  if (!client_id || !origin || !destination) {
    return res.status(400).json({ success: false, message: 'client_id, origin, destination are required' });
  }
  const tripNum = trips.length + 1;
  const year = new Date().getFullYear();
  const newTrip = {
    id: uuidv4(),
    trip_code: `ZA-${year}-${String(tripNum).padStart(3, '0')}`,
    client_id, driver_id: driver_id || null, truck_id: truck_id || null,
    origin, destination,
    cargo_description: cargo_description || '',
    start_at: start_at || null, expected_end_at: expected_end_at || null,
    completed_at: null,
    status: driver_id && truck_id ? 'assigned' : 'draft',
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  trips.push(newTrip);
  tripEvents.push({ id: uuidv4(), trip_id: newTrip.id, event_type: 'created', description: 'Trip created', created_by: req.user.id, created_at: new Date().toISOString() });
  if (driver_id) {
    tripEvents.push({ id: uuidv4(), trip_id: newTrip.id, event_type: 'driver_assigned', description: `Driver assigned`, created_by: req.user.id, created_at: new Date().toISOString() });
    const dIdx = drivers.findIndex(d => d.id === driver_id);
    if (dIdx !== -1) drivers[dIdx].status = 'assigned';
  }
  if (truck_id) {
    const tkIdx = trucks.findIndex(tk => tk.id === truck_id);
    if (tkIdx !== -1) trucks[tkIdx].status = 'assigned';
  }
  auditLogs.push({ id: uuidv4(), user_id: req.user.id, action: 'create', entity_type: 'trip', entity_id: newTrip.id, description: `Created trip ${newTrip.trip_code}`, ip_address: req.ip, created_at: new Date().toISOString() });
  res.status(201).json({ success: true, data: newTrip });
});

router.patch('/:id', authenticate, (req, res) => {
  const idx = trips.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Trip not found' });
  const allowed = ['client_id','driver_id','truck_id','origin','destination','cargo_description','start_at','expected_end_at','status','notes'];
  allowed.forEach(k => { if (req.body[k] !== undefined) trips[idx][k] = req.body[k]; });
  trips[idx].updated_at = new Date().toISOString();
  res.json({ success: true, data: trips[idx] });
});

// POST /api/trips/:id/generate-link
router.post('/:id/generate-link', authenticate, (req, res) => {
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
  if (!trip.driver_id) return res.status(400).json({ success: false, message: 'Assign a driver first' });

  // Revoke old links
  tripDriverLinks.forEach(l => { if (l.trip_id === trip.id) l.revoked_at = new Date().toISOString(); });

  const token = crypto.randomBytes(32).toString('hex');
  const link = {
    id: uuidv4(),
    trip_id: trip.id,
    driver_id: trip.driver_id,
    token,
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    revoked_at: null,
    last_used_at: null,
    created_at: new Date().toISOString(),
  };
  tripDriverLinks.push(link);
  trips.find(t => t.id === trip.id).status = 'driver_link_sent';
  tripEvents.push({ id: uuidv4(), trip_id: trip.id, event_type: 'link_generated', description: 'Driver trip link generated', created_by: req.user.id, created_at: new Date().toISOString() });
  auditLogs.push({ id: uuidv4(), user_id: req.user.id, action: 'generate_link', entity_type: 'trip_driver_link', entity_id: link.id, description: `Generated driver link for ${trip.trip_code}`, ip_address: req.ip, created_at: new Date().toISOString() });

  const driver = drivers.find(d => d.id === trip.driver_id);
  const truck = trucks.find(tk => tk.id === trip.truck_id);
  const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'http://localhost:5173';
  const driverUrl = `${origin}/driver/trip/${token}`;
  const whatsappMsg = `Hello ${driver?.name || 'Driver'}, your Zawaya Alkayan trip has been assigned.\n\nTrip: ${trip.trip_code}\nTruck: ${truck?.truck_code || 'TBD'}\nRoute: ${trip.origin} to ${trip.destination}\n\nPlease open your private trip link:\n${driverUrl}\n\nWhen you start the trip, open the link and tap "Update My Location".`;

  res.json({ success: true, token, driver_url: driverUrl, whatsapp_message: whatsappMsg });
});

// POST /api/trips/:id/complete
router.post('/:id/complete', authenticate, (req, res) => {
  const idx = trips.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Trip not found' });
  trips[idx].status = 'completed';
  trips[idx].completed_at = new Date().toISOString();
  trips[idx].updated_at = new Date().toISOString();

  // Free up driver and truck
  if (trips[idx].driver_id) {
    const dIdx = drivers.findIndex(d => d.id === trips[idx].driver_id);
    if (dIdx !== -1) drivers[dIdx].status = 'available';
  }
  if (trips[idx].truck_id) {
    const tkIdx = trucks.findIndex(tk => tk.id === trips[idx].truck_id);
    if (tkIdx !== -1) trucks[tkIdx].status = 'available';
  }

  tripDriverLinks.forEach(l => { if (l.trip_id === trips[idx].id) l.revoked_at = new Date().toISOString(); });
  tripEvents.push({ id: uuidv4(), trip_id: trips[idx].id, event_type: 'completed', description: 'Trip completed', created_by: req.user.id, created_at: new Date().toISOString() });
  notifications.push({ id: uuidv4(), type: 'success', message: `Trip ${trips[idx].trip_code} completed`, read: false, entity_id: trips[idx].id, created_at: new Date().toISOString() });

  res.json({ success: true, data: trips[idx] });
});

module.exports = router;
