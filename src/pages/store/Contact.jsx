// src/pages/store/Contact.jsx
import React, { useState } from 'react';
import { BRAND } from '../../config/constants';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#faf8f5]">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-5" />
          <h2 className="font-serif text-3xl text-stone-900 mb-2">Message Received</h2>
          <p className="text-stone-500 text-sm">
            Thank you for reaching out. Our concierge team will respond to your inquiry within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Get in Touch
          </span>
          <h1 className="font-serif text-4xl text-stone-900 mt-2">Atelier Concierge</h1>
          <p className="text-stone-500 text-sm mt-3">
            Our team is available to assist with bespoke orders, styling advice, care, and worldwide courier tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {[
              { Icon: Mail, label: 'Email Concierge', value: BRAND.email },
              { Icon: Phone, label: 'Direct Assistance', value: BRAND.phone },
              { Icon: MapPin, label: 'Operating Hours', value: 'Mon–Fri, 9am–6pm EST' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-stone-700" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    {label}
                  </div>
                  <div className="text-stone-900 font-medium text-sm mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. eleanor@example.com"
                      className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="How may we assist you?"
                    className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Provide details about your query or order..."
                    className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Concierge Message</span>
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
