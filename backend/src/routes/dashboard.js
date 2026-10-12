const express = require('express');
const router = express.Router();
const { drivers, trucks, trips, notifications, auditLogs, clients, tripLocations } = require('../data/db');
const { authenticate } = require('../middleware/auth');

router.get('/stats', authenticate, (req, res) => {
  const now = new Date();
  const thirtyMinsAgo = new Date(now - 30 * 60 * 1000);

  const activeTrips = trips.filter(t => t.status === 'in_progress').length;
  const trucksOnTrip = trucks.filter(t => t.status === 'on_trip' || t.status === 'assigned').length;
  const availableTrucks = trucks.filter(t => t.status === 'available').length;
  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const pendingTrips = trips.filter(t => ['draft', 'assigned', 'driver_link_sent'].includes(t.status)).length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const noRecentUpdate = trucks.filter(t =>
    t.status === 'on_trip' && (!t.latest_location_at || new Date(t.latest_location_at) < thirtyMinsAgo)
  ).length;

  // Expiry alerts
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiryAlerts = [
    ...drivers.filter(d => d.license_expiry && new Date(d.license_expiry) < soon).map(d => ({ type: 'license_expiry', entity: d.name, date: d.license_expiry })),
    ...trucks.filter(t => t.insurance_expiry && new Date(t.insurance_expiry) < soon).map(t => ({ type: 'insurance_expiry', entity: t.truck_code, date: t.insurance_expiry })),
    ...trucks.filter(t => t.registration_expiry && new Date(t.registration_expiry) < soon).map(t => ({ type: 'registration_expiry', entity: t.truck_code, date: t.registration_expiry })),
  ];

  const recentTrips = trips
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 8)
    .map(t => ({
      ...t,
      client_name: clients.find(c => c.id === t.client_id)?.company_name || '',
      driver_name: drivers.find(d => d.id === t.driver_id)?.name || '',
      truck_code: trucks.find(tk => tk.id === t.truck_id)?.truck_code || '',
    }));

  res.json({
    success: true,
    data: {
      stats: { activeTrips, trucksOnTrip, availableTrucks, availableDrivers, pendingTrips, completedTrips, noRecentUpdate, totalClients: clients.length, totalDrivers: drivers.length, totalTrucks: trucks.length },
      expiryAlerts,
      recentTrips,
      unreadNotifications: notifications.filter(n => !n.read).length,
    },
  });
});

router.get('/notifications', authenticate, (req, res) => {
  const sorted = [...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, data: sorted });
});

router.patch('/notifications/:id/read', authenticate, (req, res) => {
  const n = notifications.find(n => n.id === req.params.id);
  if (n) n.read = true;
  res.json({ success: true });
});

router.get('/audit-logs', authenticate, (req, res) => {
  const sorted = [...auditLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, data: sorted.slice(0, 100) });
});

router.get('/reports/trips', authenticate, (req, res) => {
  const report = trips.map(t => ({
    trip_code: t.trip_code,
    client: clients.find(c => c.id === t.client_id)?.company_name || '',
    driver: drivers.find(d => d.id === t.driver_id)?.name || '',
    truck: trucks.find(tk => tk.id === t.truck_id)?.truck_code || '',
    origin: t.origin,
    destination: t.destination,
    status: t.status,
    start_at: t.start_at,
    completed_at: t.completed_at,
    location_updates: tripLocations.filter(l => l.trip_id === t.id).length,
  }));
  res.json({ success: true, data: report });
});

router.post('/contact', (req, res) => {
  const { name, company, email, phone, service, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'name, email, and message are required' });
  res.json({ success: true, message: 'Thank you for your inquiry. The Zawaya Alkayan team will be in touch shortly.' });
});

module.exports = router;
