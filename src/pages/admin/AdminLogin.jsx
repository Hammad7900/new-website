// src/pages/admin/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { verifyAdminPassword, getAdminSecurityStatus } from '../../services/api';
import { BRAND } from '../../config/constants';
import { Shield, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [checking, setChecking] = useState(true);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getAdminSecurityStatus()
      .then((res) => {
        const required = Boolean(res.passwordRequired || res.authRequired);
        setAuthRequired(required);
        // If not required, admin can enter directly
      })
      .catch(() => {
        setAuthRequired(false);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authRequired) {
        await verifyAdminPassword(password.trim());
      }
      await login(password.trim());
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect administrator password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAccess = async () => {
    await login('');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 py-12 text-white">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <span className="font-serif text-3xl tracking-[0.25em] text-white font-semibold block">
              {BRAND.shortName}
            </span>
            <span className="text-[10px] tracking-[0.3em] text-amber-400 uppercase font-medium mt-1 block">
              Admin Portal
            </span>
          </Link>
        </div>

        {/* Login Box */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-stone-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Administrator Access</h2>
              <p className="text-[11px] text-stone-400">
                {authRequired
                  ? 'Enter your administrator password to unlock.'
                  : 'Direct setup mode is active. You can enter or configure a password.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center space-x-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {checking ? (
            <div className="py-8 text-center text-xs text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-stone-500" />
              Verifying security status...
            </div>
          ) : authRequired ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 transition-colors pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white hover:bg-stone-100 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Unlocking...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock Admin Panel</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-stone-400 leading-relaxed">
                Password check is currently optional. You can enter directly to manage orders and products, or configure a password in the Security tab anytime.
              </p>

              <button
                type="button"
                onClick={handleDirectAccess}
                className="w-full py-3.5 bg-white hover:bg-stone-100 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-stone-800 text-center">
            <Link
              to="/"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
