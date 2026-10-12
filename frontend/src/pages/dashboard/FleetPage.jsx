import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Truck } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY = { plate_number: '', truck_type: 'heavy_duty', make: '', model: '', year: '', capacity: '', color: 'White', insurance_expiry: '', registration_expiry: '', inspection_date: '', notes: '' };

const TYPE_LABELS = { light_commercial: 'Light Commercial', medium_duty: 'Medium-Duty', heavy_duty: 'Heavy-Duty' };
const TYPE_COLORS = { light_commercial: 'bg-blue-100 text-blue-700', medium_duty: 'bg-amber-100 text-amber-700', heavy_duty: 'bg-slate-100 text-slate-700' };

export default function FleetPage() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTrucks = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (typeFilter) params.truck_type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    api.get('/trucks', { params }).then(r => setTrucks(r.data.data)).catch(() => toast.error('Failed to load fleet')).finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Fleet — Zawaya Alkayan'; fetchTrucks(); }, [search, typeFilter, statusFilter]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setModal(true); };
  const openEdit = t => {
    setEditTarget(t);
    setForm({ plate_number: t.plate_number, truck_type: t.truck_type, make: t.make || '', model: t.model || '', year: t.year || '', capacity: t.capacity || '', color: t.color || 'White', insurance_expiry: t.insurance_expiry || '', registration_expiry: t.registration_expiry || '', inspection_date: t.inspection_date || '', notes: t.notes || '' });
    setModal(true);
  };

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTarget) { await api.patch(`/trucks/${editTarget.id}`, form); toast.success('Truck updated'); }
      else { await api.post('/trucks', form); toast.success('Truck created'); }
      setModal(false); fetchTrucks();
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/trucks/${deleteTarget.id}`); toast.success('Truck deleted'); setDeleteTarget(null); fetchTrucks(); }
    catch { toast.error('Delete failed'); }
  };

  const isExpiringSoon = date => date && new Date(date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Fleet</h1>
          <p className="text-sm text-gray-400">{trucks.length} truck{trucks.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-secondary text-brand-primary text-sm font-semibold rounded-xl hover:bg-amber-400 transition-colors">
          <Plus size={16} /> Add Truck
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, plate, make..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">All Types</option>
          <option value="light_commercial">Light Commercial</option>
          <option value="medium_duty">Medium-Duty</option>
          <option value="heavy_duty">Heavy-Duty</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="on_trip">On Trip</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : trucks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Truck size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No trucks found</p>
          <button onClick={openCreate} className="mt-3 text-brand-secondary text-sm hover:underline">Add the first truck</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trucks.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-primary flex items-center justify-center">
                    <Truck className="text-brand-secondary" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-brand-primary text-sm">{t.truck_code}</p>
                    <p className="text-gray-400 text-xs">{t.plate_number}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(t)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${TYPE_COLORS[t.truck_type] || 'bg-gray-100 text-gray-600'}`}>
                  {TYPE_LABELS[t.truck_type] || t.truck_type}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                {t.make && <div><span className="text-gray-400">Make:</span> {t.make} {t.model} {t.year}</div>}
                {t.capacity && <div><span className="text-gray-400">Capacity:</span> {t.capacity}</div>}
                {t.insurance_expiry && (
                  <div className={isExpiringSoon(t.insurance_expiry) ? 'text-yellow-600 font-medium' : ''}>
                    <span className="text-gray-400">Insurance:</span> {t.insurance_expiry}
                    {isExpiringSoon(t.insurance_expiry) && ' (expiring soon)'}
                  </div>
                )}
                {t.latest_location_at && (
                  <div className="text-green-600">
                    Last update: {new Date(t.latest_location_at).toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50">
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? 'Edit Truck' : 'Add Truck'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Plate Number *</label>
              <input required value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })} placeholder="ABC 1234" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Truck Type *</label>
              <select required value={form.truck_type} onChange={e => setForm({ ...form, truck_type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
                <option value="light_commercial">Light Commercial</option>
                <option value="medium_duty">Medium-Duty</option>
                <option value="heavy_duty">Heavy-Duty</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Make</label>
              <input value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} placeholder="e.g. Mercedes-Benz" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Model</label>
              <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. Actros" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year</label>
              <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="2023" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Capacity</label>
              <input value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 25 Tons" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Insurance Expiry</label>
              <input type="date" value={form.insurance_expiry} onChange={e => setForm({ ...form, insurance_expiry: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Registration Expiry</label>
              <input type="date" value={form.registration_expiry} onChange={e => setForm({ ...form, registration_expiry: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Inspection Date</label>
              <input type="date" value={form.inspection_date} onChange={e => setForm({ ...form, inspection_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            {editTarget && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select value={form.status || editTarget.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="on_trip">On Trip</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : editTarget ? 'Update Truck' : 'Create Truck'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} title="Delete Truck" message={`Remove ${deleteTarget?.truck_code} from the fleet? This cannot be undone.`} confirmLabel="Delete" danger />
    </div>
  );
}
