import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Users, Briefcase, CheckCircle, Clock, AlertTriangle, Plus, Map, BarChart2, WifiOff } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        {sub !== undefined && (
          <span className="text-xs text-gray-400">{sub}</span>
        )}
      </div>
      <div className="text-2xl font-bold text-brand-primary mb-0.5">{value ?? '—'}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  );
}

function AlertCard({ alert }) {
  const icons = {
    license_expiry: Users,
    insurance_expiry: Truck,
    registration_expiry: Truck,
  };
  const Icon = icons[alert.type] || AlertTriangle;
  const labels = {
    license_expiry: 'License Expiry',
    insurance_expiry: 'Insurance Expiry',
    registration_expiry: 'Registration Expiry',
  };
  return (
    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
      <Icon size={16} className="text-yellow-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-yellow-800">{alert.entity}</p>
        <p className="text-[11px] text-yellow-600">{labels[alert.type]} — {alert.date}</p>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — Zawaya Alkayan';
    api.get('/dashboard/stats')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const alerts = data?.expiryAlerts || [];
  const recentTrips = data?.recentTrips || [];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Operations Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/trips" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-secondary text-brand-primary text-xs font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <Plus size={14} /> New Trip
          </Link>
          <Link to="/dashboard/tracking" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-dark transition-colors">
            <Map size={14} /> Live Map
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Trips" value={stats.activeTrips} color="bg-blue-500" />
        <StatCard icon={Truck} label="Trucks On Trip" value={stats.trucksOnTrip} color="bg-brand-primary" />
        <StatCard icon={Truck} label="Available Trucks" value={stats.availableTrucks} color="bg-green-500" />
        <StatCard icon={Users} label="Available Drivers" value={stats.availableDrivers} color="bg-purple-500" />
        <StatCard icon={Clock} label="Pending Trips" value={stats.pendingTrips} color="bg-yellow-500" />
        <StatCard icon={CheckCircle} label="Completed Trips" value={stats.completedTrips} color="bg-emerald-500" />
        <StatCard icon={WifiOff} label="No Recent Update" value={stats.noRecentUpdate} color="bg-red-500" />
        <StatCard icon={Users} label="Total Clients" value={stats.totalClients} color="bg-indigo-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent trips */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-brand-primary text-sm">Recent Trips</h2>
            <Link to="/dashboard/trips" className="text-xs text-brand-secondary hover:underline font-medium">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Client</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No trips yet</td></tr>
                ) : recentTrips.map(trip => (
                  <tr key={trip.id}>
                    <td>
                      <Link to={`/dashboard/trips/${trip.id}`} className="text-brand-primary font-semibold hover:text-brand-secondary transition-colors text-xs">
                        {trip.trip_code}
                      </Link>
                    </td>
                    <td className="text-xs text-gray-600">{trip.client_name || '—'}</td>
                    <td className="text-xs text-gray-600">{trip.driver_name || '—'}</td>
                    <td className="text-xs text-gray-500">{trip.origin} &rarr; {trip.destination}</td>
                    <td><StatusBadge status={trip.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts + Quick actions */}
        <div className="space-y-5">
          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-yellow-500" />
              <h2 className="font-semibold text-brand-primary text-sm">Expiry Alerts</h2>
            </div>
            {alerts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No upcoming expiries</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 5).map((a, i) => <AlertCard key={i} alert={a} />)}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-brand-primary rounded-2xl p-5">
            <h2 className="font-semibold text-white text-sm mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/dashboard/trips', icon: Plus, label: 'New Trip' },
                { to: '/dashboard/drivers', icon: Users, label: 'Add Driver' },
                { to: '/dashboard/fleet', icon: Truck, label: 'Add Truck' },
                { to: '/dashboard/tracking', icon: Map, label: 'Live Map' },
                { to: '/dashboard/clients', icon: Briefcase, label: 'Add Client' },
                { to: '/dashboard/reports', icon: BarChart2, label: 'Reports' },
              ].map(a => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl transition-colors text-center"
                >
                  <a.icon size={16} className="text-brand-secondary" />
                  <span className="text-white text-[11px] font-medium">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
