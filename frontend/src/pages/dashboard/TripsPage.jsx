import { useEffect, useState } from 'react';
import { Plus, Search, Link2, CheckCircle, Eye, Copy, MessageCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const STEPS = ['Client', 'Route', 'Vehicle', 'Driver', 'Schedule', 'Cargo', 'Review'];

function TripWizard({ onClose, onCreated, clients, drivers, trucks }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    client_id: '', origin: '', destination: '', truck_id: '', driver_id: '',
    start_at: '', expected_end_at: '', cargo_description: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const valid = [
    form.client_id,
    form.origin && form.destination,
    true,
    true,
    form.start_at,
    true,
    true,
  ][step];

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await api.post('/trips', form);
      toast.success(`Trip ${res.data.data.trip_code} created`);
      onCreated(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create trip');
    } finally { setSaving(false); }
  };

  const client = clients.find(c => c.id === form.client_id);
  const truck = trucks.find(t => t.id === form.truck_id);
  const driver = drivers.find(d => d.id === form.driver_id);

  return (
    <div className="space-y-5">
      {/* Step indicators */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${i === step ? 'bg-brand-primary text-white' : i < step ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
              {i < step ? <CheckCircle size={11} /> : <span>{i + 1}</span>}
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-gray-200 mx-0.5 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Steps */}
      {step === 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Select Client *</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {clients.map(c => (
              <button key={c.id} type="button" onClick={() => setForm({ ...form, client_id: c.id })}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${form.client_id === c.id ? 'border-brand-secondary bg-brand-secondary/5 text-brand-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="font-semibold">{c.company_name}</p>
                <p className="text-xs text-gray-400">{c.contact_person} — {c.industry}</p>
              </button>
            ))}
            {clients.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No clients yet. <Link to="/dashboard/clients" className="text-brand-secondary">Add one first.</Link></p>}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Origin *</label>
            <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Riyadh" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Destination *</label>
            <input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Dammam" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Select Truck (optional)</label>
          <button type="button" onClick={() => setForm({ ...form, truck_id: '' })}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm mb-2 transition-all ${!form.truck_id ? 'border-brand-secondary bg-brand-secondary/5' : 'border-gray-200 hover:border-gray-300'}`}>
            — Assign truck later —
          </button>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {trucks.filter(t => t.status === 'available').map(t => (
              <button key={t.id} type="button" onClick={() => setForm({ ...form, truck_id: t.id })}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${form.truck_id === t.id ? 'border-brand-secondary bg-brand-secondary/5 text-brand-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="font-semibold">{t.truck_code}</p>
                <p className="text-xs text-gray-400">{t.plate_number} — {t.truck_type?.replace('_', ' ')} — {t.capacity}</p>
              </button>
            ))}
            {trucks.filter(t => t.status === 'available').length === 0 && <p className="text-sm text-gray-400 text-center py-3">No available trucks</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Select Driver (optional)</label>
          <button type="button" onClick={() => setForm({ ...form, driver_id: '' })}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm mb-2 transition-all ${!form.driver_id ? 'border-brand-secondary bg-brand-secondary/5' : 'border-gray-200 hover:border-gray-300'}`}>
            — Assign driver later —
          </button>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {drivers.filter(d => d.status === 'available').map(d => (
              <button key={d.id} type="button" onClick={() => setForm({ ...form, driver_id: d.id })}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${form.driver_id === d.id ? 'border-brand-secondary bg-brand-secondary/5 text-brand-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="font-semibold">{d.name}</p>
                <p className="text-xs text-gray-400">{d.driver_code} — Lic: {d.license_number}</p>
              </button>
            ))}
            {drivers.filter(d => d.status === 'available').length === 0 && <p className="text-sm text-gray-400 text-center py-3">No available drivers</p>}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date & Time *</label>
            <input type="datetime-local" value={form.start_at} onChange={e => setForm({ ...form, start_at: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expected Completion</label>
            <input type="datetime-local" value={form.expected_end_at} onChange={e => setForm({ ...form, expected_end_at: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cargo / Load Description</label>
            <textarea rows={3} value={form.cargo_description} onChange={e => setForm({ ...form, cargo_description: e.target.value })} placeholder="Describe the cargo or load..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Internal Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all resize-none" />
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-sm">
          <h3 className="font-semibold text-brand-primary">Trip Summary</h3>
          {[
            ['Client', client?.company_name || '—'],
            ['Route', `${form.origin} → ${form.destination}`],
            ['Truck', truck ? `${truck.truck_code} (${truck.plate_number})` : 'Not assigned'],
            ['Driver', driver?.name || 'Not assigned'],
            ['Start', form.start_at ? new Date(form.start_at).toLocaleString() : '—'],
            ['Expected End', form.expected_end_at ? new Date(form.expected_end_at).toLocaleString() : '—'],
            ['Cargo', form.cargo_description || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-gray-400 shrink-0">{k}</span>
              <span className="text-brand-primary font-medium text-right">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Nav */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button type="button" onClick={back} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Back</button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} disabled={!valid} className="flex-1 bg-brand-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-40">
            Next
          </button>
        ) : (
          <button type="button" onClick={handleCreate} disabled={saving} className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
            {saving ? 'Creating...' : 'Create Trip'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [linkModal, setLinkModal] = useState(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);

  const fetchTrips = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get('/trips', { params }).then(r => setTrips(r.data.data)).catch(() => toast.error('Failed to load trips')).finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Trips — Zawaya Alkayan'; fetchTrips(); }, [search, statusFilter]);

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/drivers'), api.get('/trucks')])
      .then(([c, d, t]) => { setClients(c.data.data); setDrivers(d.data.data); setTrucks(t.data.data); })
      .catch(() => {});
  }, []);

  const handleGenerateLink = async trip => {
    setGeneratingLink(true);
    try {
      const res = await api.post(`/trips/${trip.id}/generate-link`);
      setLinkModal({ trip, ...res.data });
      fetchTrips();
      toast.success('Driver link generated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate link');
    } finally { setGeneratingLink(false); }
  };

  const handleComplete = async () => {
    try {
      await api.post(`/trips/${completeTarget.id}/complete`);
      toast.success('Trip marked as completed');
      setCompleteTarget(null); fetchTrips();
    } catch { toast.error('Failed to complete trip'); }
  };

  const copyLink = url => { navigator.clipboard.writeText(url); toast.success('Link copied'); };
  const openWhatsApp = msg => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Trips</h1>
          <p className="text-sm text-gray-400">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-secondary text-brand-primary text-sm font-semibold rounded-xl hover:bg-amber-400 transition-colors">
          <Plus size={16} /> New Trip
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by trip code, route..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">All Statuses</option>
          {['draft','assigned','driver_link_sent','in_progress','completed','cancelled'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Client</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Truck</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No trips found</td></tr>
                ) : trips.map(trip => (
                  <tr key={trip.id}>
                    <td>
                      <Link to={`/dashboard/trips/${trip.id}`} className="font-bold text-brand-primary hover:text-brand-secondary text-xs transition-colors">
                        {trip.trip_code}
                      </Link>
                      <p className="text-[11px] text-gray-400">{trip.start_at ? new Date(trip.start_at).toLocaleDateString() : '—'}</p>
                    </td>
                    <td className="text-xs text-gray-600">{trip.client_name || '—'}</td>
                    <td className="text-xs text-gray-600">{trip.origin} <span className="text-gray-300">→</span> {trip.destination}</td>
                    <td className="text-xs text-gray-600">{trip.driver_name || <span className="text-gray-300">—</span>}</td>
                    <td className="text-xs text-gray-600">{trip.truck_code || <span className="text-gray-300">—</span>}</td>
                    <td><StatusBadge status={trip.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link to={`/dashboard/trips/${trip.id}`} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye size={13} />
                        </Link>
                        {trip.driver_id && !['completed','cancelled'].includes(trip.status) && (
                          <button onClick={() => handleGenerateLink(trip)} disabled={generatingLink} title="Generate Driver Link" className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40">
                            <Link2 size={13} />
                          </button>
                        )}
                        {['in_progress','assigned','driver_link_sent'].includes(trip.status) && (
                          <button onClick={() => setCompleteTarget(trip)} title="Complete Trip" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <CheckCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create wizard modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create New Trip" size="lg">
        <TripWizard
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); fetchTrips(); }}
          clients={clients} drivers={drivers} trucks={trucks}
        />
      </Modal>

      {/* Driver link modal */}
      <Modal open={!!linkModal} onClose={() => setLinkModal(null)} title="Driver Trip Link Generated" size="lg">
        {linkModal && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
              <CheckCircle className="text-green-500 mx-auto mb-2" size={28} />
              <p className="text-green-800 font-semibold text-sm">Link generated for {linkModal.trip.trip_code}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Driver Trip URL</label>
              <div className="flex gap-2">
                <input readOnly value={linkModal.driver_url} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-600 bg-gray-50" />
                <button onClick={() => copyLink(linkModal.driver_url)} className="px-3 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-dark transition-colors">
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp Message Preview</label>
              <textarea readOnly rows={6} value={linkModal.whatsapp_message} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-600 bg-gray-50 resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => copyLink(linkModal.whatsapp_message)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Copy size={14} /> Copy Message
              </button>
              <button onClick={() => openWhatsApp(linkModal.whatsapp_message)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                <MessageCircle size={14} /> Open WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!completeTarget} onConfirm={handleComplete} onCancel={() => setCompleteTarget(null)} title="Complete Trip" message={`Mark ${completeTarget?.trip_code} as completed? Location updates will stop.`} confirmLabel="Complete Trip" />
    </div>
  );
}
