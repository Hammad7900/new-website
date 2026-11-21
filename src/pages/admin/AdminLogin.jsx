// src/pages/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { BRAND } from '../../config/constants';
import { Shield, ArrowRight, KeyRound } from 'lucide-react';

export const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(password);
      if (result.success) navigate(from, { replace: true });
      else setError(result.error);
    } catch (err) {
      setError(err.message || 'Unable to verify admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 flex items-center justify-center px-4 bg-[#faf8f5]">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group mb-4">
            <span className="font-serif text-3xl tracking-[0.25em] text-stone-900 font-semibold block">
              {BRAND.shortName}
            </span>
            <span className="text-[10px] tracking-[0.35em] text-stone-400 uppercase font-medium">
              Management Portal
            </span>
          </Link>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-stone-900" />
            <span>Secured Admin Access</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-8 shadow-sm">
          <h2 className="font-serif text-2xl text-stone-900 mb-1 text-center">
            Sign In to Atelier Control
          </h2>
          <p className="text-xs text-stone-500 text-center mb-6">
            Enter the authorized administrator password to access orders and products.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Administrator password"
                  className="w-full pl-4 pr-10 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors font-mono"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Unlock Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-stone-500 hover:text-stone-900 transition-colors">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
