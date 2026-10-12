import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, MapPin, Truck, AlertTriangle, Navigation } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths (must happen before any map init)
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createTruckIcon(status) {
  const colors = {
    on_trip: '#3b82f6',
    in_progress: '#3b82f6',
    available: '#22c55e',
    assigned: '#f59e0b',
    maintenance: '#ef4444',
    inactive: '#94a3b8',
  };
  const color = colors[status] || '#0B1F33';
  return L.divIcon({
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:14px;">&#x1F69B;</div></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

export default function TrackingPage() {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selected, setSelected] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const REFRESH_INTERVAL = 20000;

  const fetchLive = async () => {
    try {
      const res = await api.get('/tracking/live');
      setLiveData(res.data.data || []);
      setLastRefresh(new Date());
    } catch {}
    finally { setLoading(false); }
  };

  // Init Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapContainerRef.current, {
      center: [24.7136, 46.6753],
      zoom: 6,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(mapInstance.current);
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers when liveData changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const activeIds = new Set(liveData.map(d => d.truck_id));

    // Remove markers for trucks no longer in data
    Object.keys(markersRef.current).forEach(id => {
      if (!activeIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    liveData.forEach(truck => {
      if (!truck.latest_location) return;
      const { lat, lng } = truck.latest_location;
      const ageMin = truck.latest_location_at
        ? (Date.now() - new Date(truck.latest_location_at)) / 60000
        : null;
      const stale = ageMin !== null && ageMin > 30;
      const iconStatus = stale ? 'maintenance' : truck.status;

      const updateTime = stale
        ? `Last update: ${Math.round(ageMin)} min ago`
        : 'Recently updated';

      const popupHtml = `
        <div style="min-width:200px;font-family:Inter,sans-serif;padding:2px;">
          <div style="font-weight:700;color:#0B1F33;font-size:14px;margin-bottom:6px;">${truck.truck_code}</div>
          ${truck.driver_name ? `<div style="font-size:12px;color:#667085;margin-bottom:3px;">Driver: ${truck.driver_name}</div>` : ''}
          ${truck.trip_code ? `<div style="font-size:12px;color:#667085;margin-bottom:3px;">Trip: ${truck.trip_code}</div>` : ''}
          <div style="font-size:12px;color:#667085;margin-bottom:6px;">Status: <strong>${truck.status.replace(/_/g, ' ')}</strong></div>
          <div style="font-size:11px;color:${stale ? '#f59e0b' : '#22c55e'};">${truck.latest_location_at ? updateTime : 'No location data'}</div>
          ${truck.trip_id ? `<div style="margin-top:8px;"><a href="/dashboard/trips/${truck.trip_id}" style="color:#C7A45D;font-size:12px;font-weight:600;text-decoration:none;">View Trip &rarr;</a></div>` : ''}
        </div>`;

      if (markersRef.current[truck.truck_id]) {
        markersRef.current[truck.truck_id]
          .setLatLng([lat, lng])
          .setIcon(createTruckIcon(iconStatus));
        markersRef.current[truck.truck_id].getPopup()?.setContent(popupHtml);
      } else {
        const marker = L.marker([lat, lng], { icon: createTruckIcon(iconStatus) })
          .addTo(mapInstance.current)
          .bindPopup(popupHtml);
        marker.on('click', () => setSelected(truck));
        markersRef.current[truck.truck_id] = marker;
      }
    });
  }, [liveData]);

  // Auto-refresh
  useEffect(() => {
    fetchLive();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLive, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    document.title = 'Live Tracking — Zawaya Alkayan';
  }, []);

  const activeTrucks = liveData.filter(t => t.latest_location);
  const staleCount = liveData.filter(t => {
    if (!t.latest_location_at) return false;
    return (Date.now() - new Date(t.latest_location_at)) / 60000 > 30;
  }).length;

  const panTo = truck => {
    if (!truck.latest_location || !mapInstance.current) return;
    mapInstance.current.flyTo([truck.latest_location.lat, truck.latest_location.lng], 12);
    markersRef.current[truck.truck_id]?.openPopup();
    setSelected(truck);
  };

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Live Tracking</h1>
          <p className="text-sm text-gray-400">
            {activeTrucks.length} truck{activeTrucks.length !== 1 ? 's' : ''} with location data
            {lastRefresh && <span className="ml-2">· Updated {lastRefresh.toLocaleTimeString()}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${autoRefresh ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={fetchLive}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-brand-primary hover:border-brand-secondary transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-xs text-blue-700 font-medium">
          <Truck size={12} /> {liveData.length} Total Trucks
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg text-xs text-green-700 font-medium">
          <Navigation size={12} /> {activeTrucks.length} With Location
        </div>
        {staleCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg text-xs text-yellow-700 font-medium">
            <AlertTriangle size={12} /> {staleCount} Stale (&gt;30 min)
          </div>
        )}
      </div>

      {/* Map + list */}
      <div className="grid lg:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        {/* Map */}
        <div className="lg:col-span-3 relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            </div>
          )}
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>

        {/* Fleet status list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <h2 className="font-semibold text-brand-primary text-sm">Fleet Status</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {liveData.map(truck => {
              const ageMin = truck.latest_location_at
                ? (Date.now() - new Date(truck.latest_location_at)) / 60000
                : null;
              const stale = ageMin !== null && ageMin > 30;
              const isSelected = selected?.truck_id === truck.truck_id;
              return (
                <button
                  key={truck.truck_id}
                  onClick={() => panTo(truck)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-brand-secondary/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-brand-primary text-xs">{truck.truck_code}</span>
                    <StatusBadge status={truck.status} />
                  </div>
                  {truck.driver_name && (
                    <p className="text-[11px] text-gray-500 mb-0.5">{truck.driver_name}</p>
                  )}
                  {truck.trip_code && (
                    <p className="text-[11px] text-brand-secondary font-medium">{truck.trip_code}</p>
                  )}
                  {truck.latest_location ? (
                    <div className={`flex items-center gap-1 text-[11px] mt-1 ${stale ? 'text-yellow-600' : 'text-green-600'}`}>
                      <MapPin size={9} />
                      {stale ? `${Math.round(ageMin)} min ago` : 'Recently updated'}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-300 mt-1 flex items-center gap-1">
                      <MapPin size={9} /> No location
                    </p>
                  )}
                </button>
              );
            })}
            {liveData.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400">
                <Truck size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No trucks registered</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
