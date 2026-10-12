import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Link2, CheckCircle, Copy, MessageCircle, MapPin, Clock, User, Truck } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const EVENT_ICONS = {
  created: '📋', driver_assigned: '👤', link_generated: '🔗', link_opened: '📱',
  tracking_started: '📍', location_updated: '📍', completed: '✅',
};

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [completeDialog, setCompleteDialog] = useState(false);

  const fetchTrip = () => {
    setLoading(true);
    api.get(`/trips/${id}`).then(r => setTrip(r.data.data)).catch(() => toast.error('Failed to load trip')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrip(); }, [id]);

  const generateLink = async () => {
    setGeneratingLink(true);
    try {
      const res = await api.post(`/trips/${id}/generate-link`);
      setLinkData(res.data); fetchTrip(); toast.success('Link generated');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setGeneratingLink(false); }
  };

  const completeTrip = async () => {
    try {
      await api.post(`/trips/${id}/complete`);
      toast.success('Trip completed'); setCompleteDialog(false); fetchTrip();
    } catch { toast.error('Failed to complete trip'); }
  };

  const copyLink = text => { navigator.clipboard.writeText(text); toast.success('Copied'); };

  if (loading) return <div className="animate-pulse space-y-4"><div className="skeleton h-10 w-48 rounded-xl" /><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!trip) return <div className="text-center py-20 text-gray-400">Trip not found</div>;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back */}
      <Link to="/dashboard/trips" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-primary transition-colors">
        <ArrowLeft size={14} /> Back to Trips
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-brand-primary">{trip.trip_code}</h1>
            <StatusBadge status={trip.status} />
          </div>
          <p className="text-sm text-gray-400">{trip.origin} → {trip.destination}</p>
        </div>
        <div className="flex gap-2">
          {trip.driver_id && !['completed','cancelled'].includes(trip.status) && (
            <button onClick={generateLink} disabled={generatingLink} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50">
              <Link2 size={13} /> {generatingLink ? 'Generating...' : 'Driver Link'}
            </button>
          )}
          {['in_progress','assigned','driver_link_sent'].includes(trip.status) && (
            <button onClick={() => setCompleteDialog(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-colors">
              <CheckCircle size={13} /> Complete Trip
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Trip info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-brand-primary text-sm mb-4">Trip Information</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['Client', trip.client?.company_name],
                ['Origin', trip.origin],
                ['Destination', trip.destination],
                ['Cargo', trip.cargo_description || '—'],
                ['Start', trip.start_at ? new Date(trip.start_at).toLocaleString() : '—'],
                ['Expected End', trip.expected_end_at ? new Date(trip.expected_end_at).toLocaleString() : '—'],
                ['Completed', trip.completed_at ? new Date(trip.completed_at).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="text-sm font-medium text-brand-primary">{v || '—'}</p>
                </div>
              ))}
            </div>
            {trip.notes && (
              <div className="mt-3 bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                <p className="text-sm text-gray-600">{trip.notes}</p>
              </div>
            )}
          </div>

          {/* Driver link section */}
          {linkData && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <h2 className="font-semibold text-green-800 text-sm mb-3 flex items-center gap-2"><Link2 size={14} /> Driver Link</h2>
              <div className="flex gap-2 mb-3">
                <input readOnly value={linkData.driver_url} className="flex-1 px-3 py-2 rounded-xl border border-green-200 text-xs bg-white text-gray-600" />
                <button onClick={() => copyLink(linkData.driver_url)} className="px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"><Copy size={13} /></button>
              </div>
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(linkData.whatsapp_message)}`, '_blank')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                <MessageCircle size={14} /> Send via WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Driver */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-brand-secondary" />
              <h2 className="font-semibold text-brand-primary text-sm">Driver</h2>
            </div>
            {trip.driver ? (
              <div>
                <p className="font-semibold text-brand-primary text-sm">{trip.driver.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{trip.driver.driver_code}</p>
                <p className="text-xs text-gray-500 mt-1">{trip.driver.phone}</p>
                <StatusBadge status={trip.driver.status} />
              </div>
            ) : (
              <p className="text-xs text-gray-400">No driver assigned</p>
            )}
          </div>

          {/* Truck */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={14} className="text-brand-secondary" />
              <h2 className="font-semibold text-brand-primary text-sm">Truck</h2>
            </div>
            {trip.truck ? (
              <div>
                <p className="font-semibold text-brand-primary text-sm">{trip.truck.truck_code}</p>
                <p className="text-xs text-gray-400 mt-0.5">{trip.truck.plate_number}</p>
                <p className="text-xs text-gray-500 mt-1">{trip.truck.make} {trip.truck.model}</p>
                {trip.truck.latest_location_at && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <MapPin size={10} /> Last update: {new Date(trip.truck.latest_location_at).toLocaleTimeString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No truck assigned</p>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-brand-secondary" />
              <h2 className="font-semibold text-brand-primary text-sm">Timeline</h2>
            </div>
            <div className="space-y-3">
              {(trip.events || []).slice(-10).reverse().map(ev => (
                <div key={ev.id} className="flex gap-2.5">
                  <span className="text-sm">{EVENT_ICONS[ev.event_type] || '•'}</span>
                  <div>
                    <p className="text-xs text-gray-700">{ev.description}</p>
                    <p className="text-[10px] text-gray-400">{new Date(ev.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {!trip.events?.length && <p className="text-xs text-gray-400">No events yet</p>}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog open={completeDialog} onConfirm={completeTrip} onCancel={() => setCompleteDialog(false)} title="Complete Trip" message="Mark this trip as completed? Location updates will stop and the driver link will be revoked." confirmLabel="Complete" />
    </div>
  );
}
