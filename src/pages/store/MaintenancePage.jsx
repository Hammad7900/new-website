// src/pages/store/MaintenancePage.jsx
// Beautiful maintenance mode page shown when store is under maintenance
import React, { useState, useEffect } from 'react';
import { fetchStoreSettings, saveStoreSettings } from '../../services/api';
import { BRAND } from '../../config/constants';
import { Wrench, Lock, ShieldCheck, ArrowRight, Star } from 'lucide-react';

export const MaintenancePage = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [maintenancePassword, setMaintenancePassword] = useState('');

  useEffect(() => {
    fetchStoreSettings()
      .then((s) => setMaintenancePassword(s.maintenancePassword || ''))
      .catch(() => {});
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      // Check maintenance password OR admin password
      const adminPwd = sessionStorage.getItem('aura_admin_password') || '';
      if (
        (maintenancePassword && password === maintenancePassword) ||
        (adminPwd && password === adminPwd)
      ) {
        sessionStorage.setItem('aura_maintenance_unlocked', 'true');
        if (onUnlock) onUnlock();
      } else {
        setError('Incorrect preview password. Please try again.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-stone-200/60 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 mb-5 shadow-lg">
            <Wrench className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 tracking-tight mb-1">
            {BRAND.name}
          </h1>
          <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">
            Atelier &amp; Goods
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-8 sm:p-10">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Temporarily Offline</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mb-3 leading-snug">
            We'll Be Back<br />
            <span className="text-amber-600">Very Soon</span>
          </h2>

          <p className="text-sm text-stone-500 leading-relaxed mb-6">
            Our atelier is currently undergoing scheduled maintenance to bring you an even better luxury shopping experience. We appreciate your patience.
          </p>

          {/* Stars decoration */}
          <div className="flex items-center space-x-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-stone-400 ml-2 font-medium">Back shortly</span>
          </div>

          {/* Divider */}
          <div className="border-t border-stone-100 mb-6" />

          {/* Preview unlock form */}
          <div>
            <p className="text-xs text-stone-500 mb-3 font-medium flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Have a preview password? Enter it below to access the store.</span>
            </p>
            <form onSubmit={handleUnlock} className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Preview password"
                className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
              />
              <button
                type="submit"
                disabled={loading || !password}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>...</span>
                ) : (
                  <>
                    <span>Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
            {error && (
              <p className="text-rose-600 text-[11px] mt-2 font-medium">{error}</p>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-stone-400 mt-6">
          Questions? Contact us at{' '}
          <a href="mailto:concierge@auraatelier.com" className="text-stone-600 hover:underline">
            concierge@auraatelier.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
