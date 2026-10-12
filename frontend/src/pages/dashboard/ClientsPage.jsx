import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Briefcase } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY = { company_name: '', contact_person: '', email: '', phone: '', whatsapp: '', address: '', industry: '', contract_type: 'long_term', notes: '' };
const CONTRACT_LABELS = { short_term: 'Short-Term', project_based: 'Project-Based', long_term: 'Long-Term' };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchClients = () => {
    setLoading(true);
    api.get('/clients', { params: search ? { search } : {} })
      .then(r => setClients(r.data.data))
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Clients — Zawaya Alkayan'; fetchClients(); }, [search]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setModal(true); };
  const openEdit = c => {
    setEditTarget(c);
    setForm({ company_name: c.company_name, contact_person: c.contact_person || '', email: c.email || '', phone: c.phone || '', whatsapp: c.whatsapp || '', address: c.address || '', industry: c.industry || '', contract_type: c.contract_type || 'long_term', notes: c.notes || '' });
    setModal(true);
  };

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTarget) { await api.patch(`/clients/${editTarget.id}`, form); toast.success('Client updated'); }
      else { await api.post('/clients', form); toast.success('Client created'); }
      setModal(false); fetchClients();
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/clients/${deleteTarget.id}`); toast.success('Client deleted'); setDeleteTarget(null); fetchClients(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Clients</h1>
          <p className="text-sm text-gray-400">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-secondary text-brand-primary text-sm font-semibold rounded-xl hover:bg-amber-400 transition-colors">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No clients found</p>
          <button onClick={openCreate} className="mt-3 text-brand-secondary text-sm hover:underline">Add the first client</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Industry</th>
                <th>Contract</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td>
                    <div>
                      <p className="font-semibold text-brand-primary text-xs">{c.company_name}</p>
                      <p className="text-gray-400 text-xs">{c.client_code}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-xs text-gray-700">{c.contact_person || '—'}</p>
                      <p className="text-xs text-gray-400">{c.phone || c.email || '—'}</p>
                    </div>
                  </td>
                  <td className="text-xs text-gray-600">{c.industry || '—'}</td>
                  <td className="text-xs text-gray-600">{CONTRACT_LABELS[c.contract_type] || c.contract_type}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? 'Edit Client' : 'Add Client'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Company Name *</label>
              <input required value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="Company name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Person</label>
              <input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="Full name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+966 1X XXX XXXX" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Industry</label>
              <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Construction" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contract Type</label>
              <select value={form.contract_type} onChange={e => setForm({ ...form, contract_type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
                <option value="short_term">Short-Term</option>
                <option value="project_based">Project-Based</option>
                <option value="long_term">Long-Term</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Company address" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm transition-all resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : editTarget ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} title="Delete Client" message={`Remove ${deleteTarget?.company_name}?`} confirmLabel="Delete" danger />
    </div>
  );
}
