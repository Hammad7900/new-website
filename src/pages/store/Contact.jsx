// src/pages/store/Contact.jsx
import React, { useState, useEffect } from 'react';
import { BRAND } from '../../config/constants';
import { submitInquiry, fetchStoreSettings } from '../../services/api';
import { Mail, Phone, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [contactInfo, setContactInfo] = useState({
    email: BRAND.email,
    phone: BRAND.phone,
    hours: 'Mon–Fri, 9am–6pm EST',
  });

  useEffect(() => {
    fetchStoreSettings()
      .then((settings) => {
        if (settings) {
          setContactInfo({
            email: settings.contactEmail || BRAND.email,
            phone: settings.contactPhone || BRAND.phone,
            hours: settings.contactHours || 'Mon–Fri, 9am–6pm EST',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || 'General Inquiry',
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not send your message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#faf8f5]">
        <div className="text-center max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900">Message Received</h2>
          <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
            Thank you for reaching out, <span className="font-semibold text-stone-800">{form.name}</span>. Your inquiry has been routed to our atelier team and we will respond to <span className="font-mono text-stone-700">{form.email}</span> within 24 hours.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setForm({ name: '', email: '', subject: '', message: '' });
                setSubmitted(false);
              }}
              className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
            >
              Send Another Note
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block mb-3">
            Atelier Client Care
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900">
            Contact Concierge
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-3 leading-relaxed">
            Our atelier specialists are available for custom wig sizing, lace matching, horology consultations, and insured order tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {[
              {
                Icon: Mail,
                label: 'Direct Concierge Email',
                value: contactInfo.email,
                href: `mailto:${contactInfo.email}`,
              },
              {
                Icon: Phone,
                label: 'Direct Client Line',
                value: contactInfo.phone,
                href: `tel:${contactInfo.phone}`,
              },
              {
                Icon: Clock,
                label: 'Operating Hours',
                value: contactInfo.hours,
              },
            ].map(({ Icon, label, value, href }) => (
              <div key={label} className="flex items-start space-x-4 p-5 bg-white border border-stone-200/80 rounded-2xl">
                <div className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-700">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      className="text-stone-900 hover:text-amber-700 font-medium text-xs sm:text-sm mt-0.5 block transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <div className="text-stone-900 font-medium text-xs sm:text-sm mt-0.5">{value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Vanessa Laurent"
                      className="w-full px-4 py-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. vanessa@example.com"
                      className="w-full px-4 py-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Subject / Department
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Custom Wig Lace Sizing, Shipping Inquiry, Bespoke Piece"
                    className="w-full px-4 py-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Your Inquiry or Note *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Please specify cap size, texture, length preferences, or existing order number..."
                    className="w-full px-4 py-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Inquiry to Concierge...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Transmit Message to Atelier</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
