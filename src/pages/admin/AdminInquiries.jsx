// src/pages/admin/AdminInquiries.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { fetchInquiries, deleteInquiry, fetchStoreSettings, saveStoreSettings } from '../../services/api';
import {
  Mail,
  Phone,
  Clock,
  Trash2,
  Reply,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  MessageSquare,
  Send,
  Save,
} from 'lucide-react';

export const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');

  // Store contact settings
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactHours, setContactHours] = useState('');

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [inqs, settings] = await Promise.all([
        fetchInquiries().catch(() => []),
        fetchStoreSettings().catch(() => ({})),
      ]);
      setInquiries(inqs || []);
      if (settings) {
        setContactEmail(settings.contactEmail || '');
        setContactPhone(settings.contactPhone || '');
        setContactHours(settings.contactHours || '');
      }
    } catch (e) {
      showToast('error', e.message || 'Could not load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveContactSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const adminPass = sessionStorage.getItem('aura_admin_password') || '';
      await saveStoreSettings(
        {
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          contactHours: contactHours.trim(),
        },
        adminPass
      );
      showToast('success', 'Store contact information & notification email saved successfully!');
    } catch (e) {
      showToast('error', e.message || 'Failed to save contact settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry message?')) return;
    try {
      const updated = await deleteInquiry(id);
      setInquiries(updated || inquiries.filter((it) => it.id !== id));
      showToast('success', 'Inquiry deleted.');
    } catch (e) {
      showToast('error', e.message || 'Could not delete inquiry.');
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (inq.name || '').toLowerCase().includes(q) ||
      (inq.email || '').toLowerCase().includes(q) ||
      (inq.subject || '').toLowerCase().includes(q) ||
      (inq.message || '').toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Client Inquiries & Contact Settings">
      {/* Toast */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs font-medium flex items-center space-x-2.5 shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Store Notification Email & Contact Details Form */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center space-x-2 text-amber-600 text-xs font-semibold uppercase tracking-widest mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Store Contact & Notification Hub</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-stone-900 font-medium">
              Concierge Email Configuration
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xl">
              This email receives client messages from the contact page. It is also displayed to customers on the Contact Us page and footer.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-xl flex items-center space-x-1.5 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <form onSubmit={handleSaveContactSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Notification & Inquiry Email *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. yourname@domain.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900 font-medium"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">Where customer messages will be delivered.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Customer Support Phone
            </label>
            <div className="relative">
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (800) AURA-LUX"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900 font-medium"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">Displayed on store contact page.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Operating Hours
            </label>
            <div className="relative">
              <input
                type="text"
                value={contactHours}
                onChange={(e) => setContactHours(e.target.value)}
                placeholder="Mon–Fri, 9am–6pm EST"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900 font-medium"
              />
              <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">Concierge availability schedule.</p>
          </div>

          <div className="md:col-span-3 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Contact Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Client Inquiries List */}
      <div className="bg-white border border-stone-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Customer Inquiries ({inquiries.length})</h3>
              <p className="text-xs text-stone-400">Messages submitted through the store contact form</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search messages by name or text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-stone-400 space-y-3">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-stone-500" />
            <p>Loading client inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-16 text-center text-xs text-stone-400 space-y-2">
            <Mail className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="font-medium text-stone-700">No client messages received yet.</p>
            <p>Inquiries submitted on your store's Contact page will appear right here.</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            No inquiries match your search.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredInquiries.map((inq) => (
              <div key={inq.id} className="p-6 hover:bg-stone-50/70 transition-colors flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-stone-900 text-sm">{inq.name}</span>
                    <a
                      href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || 'Atelier Inquiry')}`}
                      className="text-xs text-amber-700 hover:text-amber-800 font-mono font-medium underline"
                    >
                      {inq.email}
                    </a>
                    <span className="text-[10px] text-stone-400">
                      {new Date(inq.date).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-stone-800">
                    Subject: {inq.subject || 'General Inquiry'}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100 whitespace-pre-wrap">
                    {inq.message}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                  <a
                    href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || 'Atelier Inquiry')}&body=Dear ${encodeURIComponent(inq.name)},%0D%0A%0D%0AThank you for reaching out to AURA Atelier.%0D%0A%0D%0A`}
                    className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteInquiry(inq.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInquiries;
