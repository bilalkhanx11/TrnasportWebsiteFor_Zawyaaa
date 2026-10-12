import { useEffect, useState } from 'react';
import { Download, BarChart2, Truck, MapPin } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function ReportsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Reports — Zawaya Alkayan';
    api.get('/dashboard/reports/trips').then(r => setTrips(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    const headers = ['Trip Code', 'Client', 'Driver', 'Truck', 'Origin', 'Destination', 'Status', 'Start', 'Completed', 'Location Updates'];
    const rows = trips.map(t => [t.trip_code, t.client, t.driver, t.truck, t.origin, t.destination, t.status, t.start_at, t.completed_at, t.location_updates]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `zawaya-trips-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const TABS = [
    { key: 'trips', label: 'Trip Report', icon: BarChart2 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Reports</h1>
          <p className="text-sm text-gray-400">Operational data and export</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-secondary text-brand-primary text-sm font-semibold rounded-xl hover:bg-amber-400 transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Trips', value: trips.length, icon: BarChart2, color: 'bg-blue-500' },
          { label: 'Completed', value: trips.filter(t => t.status === 'completed').length, icon: BarChart2, color: 'bg-green-500' },
          { label: 'In Progress', value: trips.filter(t => t.status === 'in_progress').length, icon: Truck, color: 'bg-brand-primary' },
          { label: 'Total Location Updates', value: trips.reduce((s, t) => s + (t.location_updates || 0), 0), icon: MapPin, color: 'bg-purple-500' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-brand-primary">{c.value}</div>
            <div className="text-xs text-gray-500 font-medium">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-brand-primary text-sm">Trip Report</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading report...</div>
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Client</th>
                  <th>Driver</th>
                  <th>Truck</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>Completed</th>
                  <th>Updates</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No trip data</td></tr>
                ) : trips.map((t, i) => (
                  <tr key={i}>
                    <td className="font-semibold text-brand-primary text-xs">{t.trip_code}</td>
                    <td className="text-xs text-gray-600">{t.client || '—'}</td>
                    <td className="text-xs text-gray-600">{t.driver || '—'}</td>
                    <td className="text-xs text-gray-600">{t.truck || '—'}</td>
                    <td className="text-xs text-gray-500">{t.origin} → {t.destination}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="text-xs text-gray-500">{t.start_at ? new Date(t.start_at).toLocaleDateString() : '—'}</td>
                    <td className="text-xs text-gray-500">{t.completed_at ? new Date(t.completed_at).toLocaleDateString() : '—'}</td>
                    <td className="text-xs text-center font-semibold text-brand-primary">{t.location_updates || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
