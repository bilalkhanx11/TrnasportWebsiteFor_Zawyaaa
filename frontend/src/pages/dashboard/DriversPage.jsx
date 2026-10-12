import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, User } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY = { name: '', phone: '', whatsapp: '', license_number: '', license_expiry: '', notes: '' };

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDrivers = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get('/drivers', { params }).then(r => setDrivers(r.data.data)).catch(() => toast.error('Failed to load drivers')).finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Drivers — Zawaya Alkayan'; fetchDrivers(); }, [search, statusFilter]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setModal(true); };
  const openEdit = d => { setEditTarget(d); setForm({ name: d.name, phone: d.phone, whatsapp: d.whatsapp, license_number: d.license_number, license_expiry: d.license_expiry || '', notes: d.notes || '' }); setModal(true); };

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTarget) {
        await api.patch(`/drivers/${editTarget.id}`, form);
        toast.success('Driver updated');
      } else {
        await api.post('/drivers', form);
        toast.success('Driver created');
      }
      setModal(false); fetchDrivers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/drivers/${deleteTarget.id}`);
      toast.success('Driver deleted');
      setDeleteTarget(null); fetchDrivers();
    } catch { toast.error('Delete failed'); }
  };

  const statusBg = { available: 'bg-green-400', on_trip: 'bg-blue-400', assigned: 'bg-yellow-400', off_duty: 'bg-gray-400', inactive: 'bg-red-400' };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Drivers</h1>
          <p className="text-sm text-gray-400">{drivers.length} driver{drivers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-secondary text-brand-primary text-sm font-semibold rounded-xl hover:bg-amber-400 transition-colors">
          <Plus size={16} /> Add Driver
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, phone..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="on_trip">On Trip</option>
          <option value="off_duty">Off Duty</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No drivers found</p>
          <button onClick={openCreate} className="mt-3 text-brand-secondary text-sm hover:underline">Add the first driver</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drivers.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-base">
                      {d.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusBg[d.status] || 'bg-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-primary text-sm">{d.name}</p>
                    <p className="text-gray-400 text-xs">{d.driver_code}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(d)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={11} className="shrink-0" />
                  {d.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-gray-400">Lic:</span>
                  {d.license_number}
                </div>
                {d.license_expiry && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-gray-400">Exp:</span>
                    <span className={new Date(d.license_expiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-600 font-medium' : ''}>
                      {d.license_expiry}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50">
                <StatusBadge status={d.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Driver full name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone *</label>
              <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+966 5XX XXX XXXX" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp</label>
              <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="+966 5XX XXX XXXX" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">License Number *</label>
              <input required value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} placeholder="SA-LIC-XXXXX" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">License Expiry</label>
              <input type="date" value={form.license_expiry} onChange={e => setForm({ ...form, license_expiry: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all resize-none" />
          </div>
          {editTarget && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select value={form.status || editTarget.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="on_trip">On Trip</option>
                <option value="off_duty">Off Duty</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : editTarget ? 'Update Driver' : 'Create Driver'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Driver"
        message={`Remove ${deleteTarget?.name} from the system? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
