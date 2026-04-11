import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-ink-50 via-white to-saffron-50">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-700 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-saffron-400" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-ink-300" />
        </div>
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-6">📒</div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">SmartKhata</h1>
          <p className="text-ink-200 text-xl mb-8">Digital Udhaar Book</p>
          <div className="grid grid-cols-1 gap-4 text-left">
            {['Track customer credit easily', 'Send WhatsApp reminders', 'Voice entry support', 'Works on any device'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-ink-100">
                <span className="text-emerald-400 text-lg">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="text-5xl mb-3">📒</div>
            <h1 className="font-display text-3xl font-bold text-ink-700">SmartKhata</h1>
            <p className="text-slate-500 text-sm mt-1">Digital Udhaar Book</p>
          </div>

          <div className="card shadow-xl border-0">
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in to your shop account</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              New shop?{' '}
              <Link to="/register" className="text-ink-600 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
