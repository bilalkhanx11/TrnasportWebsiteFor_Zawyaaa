const express = require('express');
const router = express.Router();
const { trucks, drivers, trips, tripLocations } = require('../data/db');
const { authenticate } = require('../middleware/auth');

// GET /api/tracking/live  — all truck latest positions for map
router.get('/live', authenticate, (req, res) => {
  const liveData = trucks.map(truck => {
    const activeTrip = trips.find(t => t.truck_id === truck.id && ['in_progress', 'assigned', 'driver_link_sent'].includes(t.status));
    const driver = drivers.find(d => d.id === truck.assigned_driver_id) || (activeTrip ? drivers.find(d => d.id === activeTrip.driver_id) : null);
    return {
      truck_id: truck.id,
      truck_code: truck.truck_code,
      plate_number: truck.plate_number,
      status: truck.status,
      driver_name: driver?.name || null,
      trip_code: activeTrip?.trip_code || null,
      trip_id: activeTrip?.id || null,
      trip_status: activeTrip?.status || null,
      latest_location: truck.latest_location,
      latest_location_at: truck.latest_location_at,
    };
  });
  res.json({ success: true, data: liveData });
});

// GET /api/tracking/trip/:tripId/history  — all location points for a trip
router.get('/trip/:tripId/history', authenticate, (req, res) => {
  const locs = tripLocations
    .filter(l => l.trip_id === req.params.tripId)
    .sort((a, b) => new Date(a.received_at) - new Date(b.received_at));
  res.json({ success: true, data: locs });
});

module.exports = router;
