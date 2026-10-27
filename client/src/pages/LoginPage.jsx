import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await login(email.trim(), password);
      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === 'admin' && redirectPath === '/') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type) => {
    if (type === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('Admin@12345');
    } else {
      setEmail('alex@example.com');
      setPassword('User@12345');
    }
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md bg-[#161F30] rounded-3xl border border-[#222F46] p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              i<span className="text-red-500">Movies</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white pt-2">Sign in to your account</h2>
          <p className="text-xs text-slate-400">
            Access your tickets, favorites, and fast-track reservations.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-sm outline-none transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-sm outline-none transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Show password checkbox */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded accent-red-600"
              />
              <span>Show password</span>
            </label>
            <span className="text-slate-500">Secure JWT Session</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Buttons for Evaluation */}
        <div className="pt-2 border-t border-[#222F46]/70 space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold text-center">
            Demo Credentials (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('user')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-[#222F46] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              Demo User
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-[#222F46] text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              Admin User
            </button>
          </div>
        </div>

        {/* Register Footer */}
        <div className="text-center text-xs text-slate-400 pt-1">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-red-500 hover:text-red-400">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
