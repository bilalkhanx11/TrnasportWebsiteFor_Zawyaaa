import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Truck, Briefcase, Map,
  BarChart2, FileText, LogOut, Bell,
  Menu, X, ChevronRight, Truck as TruckIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/dashboard/tracking', icon: Map, label: 'Live Tracking' },
  { to: '/dashboard/trips', icon: Briefcase, label: 'Trips' },
  { to: '/dashboard/drivers', icon: Users, label: 'Drivers' },
  { to: '/dashboard/fleet', icon: Truck, label: 'Fleet' },
  { to: '/dashboard/clients', icon: Briefcase, label: 'Clients' },
  { to: '/dashboard/reports', icon: BarChart2, label: 'Reports' },
  { to: '/dashboard/audit', icon: FileText, label: 'Audit Logs' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    api.get('/dashboard/notifications').then(r => {
      setNotifs(r.data.data || []);
      setUnread((r.data.data || []).filter(n => !n.read).length);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Signed out');
  };

  const markRead = async (id) => {
    await api.patch(`/dashboard/notifications/${id}/read`);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const roleLabel = {
    super_admin: 'Super Admin',
    operations_manager: 'Operations Manager',
    dispatcher: 'Dispatcher',
  }[user?.role] || user?.role;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-brand-primary z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-secondary flex items-center justify-center">
              <TruckIcon className="text-brand-primary" size={18} />
            </div>
            <div>
              <div className="text-white font-bold text-xs leading-tight">ZAWAYA ALKAYAN</div>
              <div className="text-brand-secondary text-[10px] tracking-wider">OPERATIONS</div>
            </div>
          </div>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              <ChevronRight size={13} className="ml-auto opacity-30" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-brand-primary text-xs font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-gray-400 text-[10px] truncate">{roleLabel}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-400">Welcome back,</p>
              <p className="text-sm font-semibold text-brand-primary leading-tight">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-primary">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {notifs.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-gray-400">No notifications</p>
                    ) : notifs.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                      >
                        <div className="flex gap-2 items-start">
                          <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                          <div>
                            <p className="text-xs text-gray-700">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
