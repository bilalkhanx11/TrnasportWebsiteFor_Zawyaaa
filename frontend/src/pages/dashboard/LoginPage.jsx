import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-[#0f2d4a] to-[#071524] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-brand-secondary/10" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border border-brand-secondary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top bar */}
          <div className="bg-brand-primary px-8 pt-10 pb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-secondary flex items-center justify-center mx-auto mb-4">
              <Truck className="text-brand-primary" size={30} />
            </div>
            <h1 className="text-white font-bold text-xl">ZAWAYA ALKAYAN</h1>
            <p className="text-brand-secondary text-xs tracking-widest font-medium mt-1">OPERATIONS PLATFORM</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-brand-primary font-bold text-lg mb-1">Sign In</h2>
            <p className="text-gray-400 text-sm mb-6">Access the operations dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@zawayaalkayan.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                ) : (
                  <><LogIn size={16} /> Sign In</>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-brand-light rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Demo Credentials</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Super Admin:</span>
                  <span className="font-mono text-brand-primary">admin@zawayaalkayan.com</span>
                </div>
                <div className="flex justify-between">
                  <span>Password:</span>
                  <span className="font-mono text-brand-primary">Admin@2030</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <a href="/" className="text-xs text-gray-400 hover:text-brand-secondary transition-colors">
                Back to website
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
