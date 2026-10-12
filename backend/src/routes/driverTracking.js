const express = require('express');
const router = express.Router();
const { tripDriverLinks, trips, drivers, trucks, tripLocations, tripEvents, notifications, uuidv4 } = require('../data/db');

// GET /api/driver/trip/:token  — driver opens their private link
router.get('/trip/:token', (req, res) => {
  const { token } = req.params;
  const link = tripDriverLinks.find(l => l.token === token && !l.revoked_at);
  if (!link) return res.status(404).json({ success: false, error_code: 'LINK_INVALID', message: 'This trip link is not valid or has been revoked.' });

  if (new Date(link.expires_at) < new Date()) {
    return res.status(410).json({ success: false, error_code: 'LINK_EXPIRED', message: 'This trip link has expired. Please contact Zawaya Alkayan operations.' });
  }

  const trip = trips.find(t => t.id === link.trip_id);
  if (!trip) return res.status(404).json({ success: false, error_code: 'TRIP_NOT_FOUND', message: 'Trip not found.' });
  if (trip.status === 'completed') return res.status(410).json({ success: false, error_code: 'TRIP_COMPLETED', message: 'This trip has been completed. Location updates are no longer required.' });
  if (trip.status === 'cancelled') return res.status(410).json({ success: false, error_code: 'TRIP_CANCELLED', message: 'This trip has been cancelled.' });

  const driver = drivers.find(d => d.id === link.driver_id);
  const truck = trucks.find(tk => tk.id === trip.truck_id);

  // Record link opened
  link.last_used_at = new Date().toISOString();
  if (!tripEvents.find(e => e.trip_id === trip.id && e.event_type === 'link_opened')) {
    tripEvents.push({ id: uuidv4(), trip_id: trip.id, event_type: 'link_opened', description: 'Driver opened private trip link', created_by: 'system', created_at: new Date().toISOString() });
  }

  res.json({
    success: true,
    data: {
      trip_code: trip.trip_code,
      origin: trip.origin,
      destination: trip.destination,
      status: trip.status,
      cargo_description: trip.cargo_description,
      start_at: trip.start_at,
      driver_name: driver?.name || '',
      truck_code: truck?.truck_code || '',
      plate_number: truck?.plate_number || '',
    },
  });
});

// POST /api/driver/trip/:token/location  — driver sends GPS coordinates
router.post('/trip/:token/location', (req, res) => {
  const { token } = req.params;
  const { latitude, longitude, accuracy, device_timestamp } = req.body;

  const link = tripDriverLinks.find(l => l.token === token && !l.revoked_at);
  if (!link) return res.status(404).json({ success: false, error_code: 'LINK_INVALID', message: 'Invalid or revoked trip link.' });
  if (new Date(link.expires_at) < new Date()) return res.status(410).json({ success: false, error_code: 'LINK_EXPIRED', message: 'Link expired.' });

  const trip = trips.find(t => t.id === link.trip_id);
  if (!trip || ['completed', 'cancelled'].includes(trip.status)) {
    return res.status(410).json({ success: false, error_code: 'TRIP_INACTIVE', message: 'This trip is no longer active.' });
  }

  // Validate coordinates
  if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ success: false, message: 'Invalid coordinates.' });
  }

  const received_at = new Date().toISOString();
  const locRecord = {
    id: uuidv4(),
    trip_id: trip.id,
    driver_id: link.driver_id,
    truck_id: trip.truck_id,
    latitude, longitude,
    accuracy: accuracy || null,
    device_timestamp: device_timestamp || received_at,
    received_at,
    source: 'browser_gps',
  };
  tripLocations.push(locRecord);

  // Update latest location on truck
  const truck = trucks.find(tk => tk.id === trip.truck_id);
  if (truck) {
    truck.latest_location = { lat: latitude, lng: longitude };
    truck.latest_location_at = received_at;
  }

  // Update trip status to in_progress if it's not already
  const tripIdx = trips.findIndex(t => t.id === trip.id);
  if (trips[tripIdx].status !== 'in_progress') {
    trips[tripIdx].status = 'in_progress';
    tripEvents.push({ id: uuidv4(), trip_id: trip.id, event_type: 'tracking_started', description: 'Driver started sharing location', created_by: 'system', created_at: received_at });
  }
  tripEvents.push({ id: uuidv4(), trip_id: trip.id, event_type: 'location_updated', description: `Location updated (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, created_by: 'system', created_at: received_at });

  link.last_used_at = received_at;

  res.json({ success: true, message: 'Location updated successfully', server_time: received_at });
});

// POST /api/driver/trip/:token/complete  — driver marks trip complete
router.post('/trip/:token/complete', (req, res) => {
  const { token } = req.params;
  const link = tripDriverLinks.find(l => l.token === token && !l.revoked_at);
  if (!link) return res.status(404).json({ success: false, message: 'Invalid link.' });

  const tripIdx = trips.findIndex(t => t.id === link.trip_id);
  if (tripIdx === -1) return res.status(404).json({ success: false, message: 'Trip not found.' });

  trips[tripIdx].status = 'completed';
  trips[tripIdx].completed_at = new Date().toISOString();
  link.revoked_at = new Date().toISOString();

  const driver = drivers.find(d => d.id === link.driver_id);
  if (driver) driver.status = 'available';
  const truck = trucks.find(tk => tk.id === trips[tripIdx].truck_id);
  if (truck) truck.status = 'available';

  tripEvents.push({ id: uuidv4(), trip_id: trips[tripIdx].id, event_type: 'completed', description: 'Trip completed by driver', created_by: 'system', created_at: new Date().toISOString() });
  notifications.push({ id: uuidv4(), type: 'success', message: `Trip ${trips[tripIdx].trip_code} completed by driver`, read: false, entity_id: trips[tripIdx].id, created_at: new Date().toISOString() });

  res.json({ success: true, message: 'Trip marked as completed.' });
});

module.exports = router;
