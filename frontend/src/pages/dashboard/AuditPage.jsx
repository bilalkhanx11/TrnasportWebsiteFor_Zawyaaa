import { useEffect, useState } from 'react';
import { FileText, Shield } from 'lucide-react';
import api from '../../lib/api';

const ACTION_COLORS = {
  login: 'bg-blue-100 text-blue-700',
  logout: 'bg-gray-100 text-gray-600',
  create: 'bg-green-100 text-green-700',
  update: 'bg-yellow-100 text-yellow-700',
  delete: 'bg-red-100 text-red-700',
  assign: 'bg-purple-100 text-purple-700',
  generate_link: 'bg-indigo-100 text-indigo-700',
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Audit Logs — Zawaya Alkayan';
    api.get('/dashboard/audit-logs').then(r => setLogs(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
          <Shield size={20} className="text-brand-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Audit Logs</h1>
          <p className="text-sm text-gray-400">Immutable record of all admin actions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-brand-primary text-sm">Recent Actions</h2>
          <span className="text-xs text-gray-400">{logs.length} entries</span>
        </div>
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No audit entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Description</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-xs text-gray-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="text-xs text-gray-600">{log.user_id || 'System'}</td>
                    <td>
                      <span className={`badge ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500">{log.entity_type || '—'}</td>
                    <td className="text-xs text-gray-700">{log.description}</td>
                    <td className="text-xs text-gray-400 font-mono">{log.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
