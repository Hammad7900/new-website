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
} from 'lucide-react';

export const AdminSecurity = () => {
  const [hasPassword, setHasPassword] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Set Password Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enableProtection, setEnableProtection] = useState(true);
  const [showNewPass, setShowNewPass] = useState(false);

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [showChangePass, setShowChangePass] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await getAdminSecurityStatus();
      setHasPassword(Boolean(res.hasPassword));
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
      setFeedback({ type: 'error', text: 'Enter a valid password.' });
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

    setSaving(true);
    try {
      const res = await updateAdminSecurity({
        action: 'set',
        newPassword: newPassword.trim(),
        requireAuth: enableProtection,
      });

      // Save to session so admin is recognized immediately
      sessionStorage.setItem('aura_admin_password', newPassword.trim());
      sessionStorage.setItem('aura_admin_auth', 'true');

      setHasPassword(true);
      setAuthRequired(enableProtection);
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({
        type: 'success',
        text: 'Administrator password successfully set and stored securely.',
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save password.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword) {
      setFeedback({ type: 'error', text: 'Please enter your current administrator password.' });
      return;
    }
    if (!changeNewPassword.trim()) {
      setFeedback({ type: 'error', text: 'Enter a new password.' });
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
        currentPassword: currentPassword.trim(),
        newPassword: changeNewPassword.trim(),
        requireAuth: true,
      });

      // Update session storage
      sessionStorage.setItem('aura_admin_password', changeNewPassword.trim());
      sessionStorage.setItem('aura_admin_auth', 'true');

      setCurrentPassword('');
      setChangeNewPassword('');
      setChangeConfirmPassword('');
      setFeedback({
        type: 'success',
        text: 'Administrator password updated successfully.',
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Current password incorrect.' });
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
        text: newVal ? 'Password protection enabled for Admin panel.' : 'Admin panel opened for direct access mode.',
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
              <span>Administrative Security</span>
            </div>
            <h2 className="font-serif text-2xl text-stone-900">Admin Password Controls</h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xl">
              Set or update your private store administrator password. This password is owned and managed exclusively by you.
            </p>
          </div>

          {/* Current Status Badge */}
          <div className="flex items-center space-x-3">
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
                  <span>Password Protection Active</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Direct Access Mode (Setup)</span>
                </>
              )}
            </div>
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
          {/* Card 1: Set New Admin Password */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>1. Set Administrator Password</span>
              </div>
              <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                Use this form to set or initialize your master password. You can choose any password you prefer.
              </p>

              <form onSubmit={handleCreatePassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    New Administrator Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
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
                    Confirm New Password *
                  </label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableProtection}
                      onChange={(e) => setEnableProtection(e.target.checked)}
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 w-4 h-4"
                    />
                    <span className="font-medium">Require this password on login</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-5 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm mt-3"
                >
                  {saving ? 'Saving...' : 'Set Admin Password'}
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Change Existing Password */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Change Existing Password</span>
              </div>
              <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                If you already have a password set and wish to change it, enter your current password below followed by the new password.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    New Password *
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

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-5 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm mt-3"
                >
                  {saving ? 'Updating...' : 'Change Password'}
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
              <p className="font-semibold text-stone-900">Administrator Access Policy</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Passwords are never displayed in the storefront and are verified with cryptographic hash comparison.
              </p>
            </div>
          </div>

          {hasPassword && (
            <button
              type="button"
              onClick={() => handleToggleAuthRequirement(!authRequired)}
              disabled={saving}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
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
