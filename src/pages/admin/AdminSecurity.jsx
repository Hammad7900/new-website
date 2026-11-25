// src/pages/admin/AdminSecurity.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getAdminSecurityStatus, updateAdminSecurity } from '../../services/api';
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
} from 'lucide-react';

export const AdminSecurity = () => {
  const [hasPassword, setHasPassword] = useState(false);
  const [hasMasterKey, setHasMasterKey] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Set Initial Security Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [confirmMasterKey, setConfirmMasterKey] = useState('');
  const [enableProtection, setEnableProtection] = useState(true);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);

  // Change Password Form (Protected by Master Security Key)
  const [authMasterKey, setAuthMasterKey] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [updateMasterKeyOption, setUpdateMasterKeyOption] = useState('');
  const [showChangePass, setShowChangePass] = useState(false);
  const [showAuthMaster, setShowAuthMaster] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await getAdminSecurityStatus();
      setHasPassword(Boolean(res.hasPassword));
      setHasMasterKey(Boolean(res.hasMasterKey));
      setAuthRequired(Boolean(res.passwordRequired || res.authRequired));
    } catch (err) {
      console.error('Failed to load admin security status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!newPassword.trim()) {
      setFeedback({ type: 'error', text: 'Enter a valid administrator password.' });
      return;
    }
    if (newPassword.length < 4) {
      setFeedback({ type: 'error', text: 'Password must be at least 4 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (masterKey.trim() && masterKey !== confirmMasterKey) {
      setFeedback({ type: 'error', text: 'Master Security Key and confirmation do not match.' });
      return;
    }

    setSaving(true);
    try {
      const res = await updateAdminSecurity({
        action: 'set',
        newPassword: newPassword.trim(),
        masterKey: masterKey.trim(),
        requireAuth: enableProtection,
      });

      // Save to session so admin is recognized immediately
      sessionStorage.setItem('aura_admin_password', newPassword.trim());
      sessionStorage.setItem('aura_admin_auth', 'true');

      setHasPassword(true);
      if (masterKey.trim()) setHasMasterKey(true);
      setAuthRequired(enableProtection);
      setNewPassword('');
      setConfirmPassword('');
      setMasterKey('');
      setConfirmMasterKey('');
      setFeedback({
        type: 'success',
        text: 'Administrator password & Master Security Key successfully configured!',
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save security settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (hasMasterKey && !authMasterKey.trim()) {
      setFeedback({
        type: 'error',
        text: 'Master Security Key is required to authorize changing the password.',
      });
      return;
    }
    if (!changeNewPassword.trim()) {
      setFeedback({ type: 'error', text: 'Enter a replacement password.' });
      return;
    }
    if (changeNewPassword.length < 4) {
      setFeedback({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }
    if (changeNewPassword !== changeConfirmPassword) {
      setFeedback({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setSaving(true);
    try {
      await updateAdminSecurity({
        action: 'change',
        masterKey: authMasterKey.trim(),
        newPassword: changeNewPassword.trim(),
        newMasterKey: updateMasterKeyOption.trim() || undefined,
        requireAuth: true,
      });

      // Update session storage
      sessionStorage.setItem('aura_admin_password', changeNewPassword.trim());
      sessionStorage.setItem('aura_admin_auth', 'true');

      setAuthMasterKey('');
      setChangeNewPassword('');
      setChangeConfirmPassword('');
      setUpdateMasterKeyOption('');
      if (updateMasterKeyOption.trim()) setHasMasterKey(true);

      setFeedback({
        type: 'success',
        text: 'Admin password updated securely with Master Security authorization!',
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Master Security Key incorrect. Password change denied.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAuthRequirement = async (newVal) => {
    setSaving(true);
    try {
      await updateAdminSecurity({
        action: 'set',
        newPassword: sessionStorage.getItem('aura_admin_password') || '',
        requireAuth: newVal,
      });
      setAuthRequired(newVal);
      setFeedback({
        type: 'success',
        text: newVal
          ? 'Password protection activated. Login required for Admin area.'
          : 'Direct setup mode enabled. Password check temporarily paused.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not update protection status.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Security & Admin Password Management">
      <div className="space-y-6 max-w-4xl">
        {/* Status header banner */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4 text-stone-900" />
              <span>Two-Tier Admin Protection</span>
            </div>
            <h2 className="font-serif text-2xl text-stone-900">Security & Master Key</h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
              Set your private store password, plus an exclusive <strong>Master Security Key</strong> to prevent unauthorized password tampering.
            </p>
          </div>

          {/* Current Status Badges */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <div
              className={`px-4 py-2 rounded-2xl flex items-center space-x-2 text-xs font-semibold ${
                authRequired && hasPassword
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {authRequired && hasPassword ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Protection Active</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Direct Access Mode (Setup)</span>
                </>
              )}
            </div>
            {hasMasterKey && (
              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full flex items-center space-x-1">
                <Key className="w-3 h-3 text-amber-600" />
                <span>Master Security Key Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center space-x-3 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Set Initial Admin Password & Master Key */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>1. Set Admin Password & Master Key</span>
              </div>
              <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                Choose your store admin password. You can also define a secret Master Security Key that will be required whenever someone attempts to change this password.
              </p>

              <form onSubmit={handleCreatePassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Administrator Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="e.g. MyStorePass2026"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Confirm Login Password *
                  </label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat login password"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                {/* Master Security Key Input */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-700 mb-1 flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5" />
                    <span>Master Security Key (Tamper Protection)</span>
                  </label>
                  <p className="text-[10px] text-stone-400 mb-1.5">
                    No one can change your admin password without this secret key.
                  </p>
                  <div className="relative">
                    <input
                      type={showMasterKey ? 'text' : 'password'}
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      placeholder="e.g. SecretPin#992"
                      className="w-full px-4 py-2.5 text-xs bg-amber-50/40 border border-amber-200/80 rounded-xl focus:outline-none focus:border-stone-900 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMasterKey(!showMasterKey)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showMasterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {masterKey && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Confirm Master Security Key *
                    </label>
                    <input
                      type={showMasterKey ? 'text' : 'password'}
                      required
                      value={confirmMasterKey}
                      onChange={(e) => setConfirmMasterKey(e.target.value)}
                      placeholder="Repeat Master Security Key"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
                    />
                  </div>
                )}

                <div className="pt-1">
                  <label className="flex items-center space-x-2.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableProtection}
                      onChange={(e) => setEnableProtection(e.target.checked)}
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 w-4 h-4"
                    />
                    <span className="font-medium">Require login password on entry</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-5 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm mt-2"
                >
                  {saving ? 'Saving...' : 'Set Admin Credentials'}
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Change Password (GATED by Master Security Key) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Change Admin Password</span>
              </div>
              <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                To prevent unauthorized changes, modifying the password requires your <strong>Master Security Key</strong> authorization.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-800 mb-1 flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Master Security Key (Authorization) *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAuthMaster ? 'text' : 'password'}
                      required
                      value={authMasterKey}
                      onChange={(e) => setAuthMasterKey(e.target.value)}
                      placeholder="Enter Master Security Key"
                      className="w-full px-4 py-2.5 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:outline-none focus:border-stone-900 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthMaster(!showAuthMaster)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showAuthMaster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    New Administrator Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showChangePass ? 'text' : 'password'}
                      required
                      value={changeNewPassword}
                      onChange={(e) => setChangeNewPassword(e.target.value)}
                      placeholder="Enter new replacement password"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangePass(!showChangePass)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showChangePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type={showChangePass ? 'text' : 'password'}
                    required
                    value={changeConfirmPassword}
                    onChange={(e) => setChangeConfirmPassword(e.target.value)}
                    placeholder="Repeat replacement password"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    Optional: Update Master Key Too
                  </label>
                  <input
                    type="password"
                    value={updateMasterKeyOption}
                    onChange={(e) => setUpdateMasterKeyOption(e.target.value)}
                    placeholder="Leave blank to keep existing master key"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-5 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm mt-3"
                >
                  {saving ? 'Verifying...' : 'Authorize & Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Access Mode Toggle & Guidance Notice */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-stone-700 shrink-0" />
            <div>
              <p className="font-semibold text-stone-900">Security Architecture</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Your Admin Login Password protects the storefront backend, while your Master Security Key ensures no one else can overwrite your credentials.
              </p>
            </div>
          </div>

          {hasPassword && (
            <button
              type="button"
              onClick={() => handleToggleAuthRequirement(!authRequired)}
              disabled={saving}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                authRequired
                  ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {authRequired ? 'Switch to Direct Access Mode' : 'Enable Required Password Check'}
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;
