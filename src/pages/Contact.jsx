// src/pages/Contact.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    orderNumber: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Client Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 mt-2">
            Private Client Relations
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-3 font-light leading-relaxed">
            Our atelier concierge team is dedicated to assisting you with order tracking, custom requests, and bespoke acquisitions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-stone-200/80 rounded-3xl p-8 shadow-xs space-y-8">
              <div>
                <h3 className="font-serif text-xl text-stone-900 mb-2">Atelier Locations</h3>
                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Headquartered in New York with dedicated distribution hubs across North America, Europe, and Asia.
                </p>
              </div>

              <div className="space-y-6 text-xs text-stone-600">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Atelier Studio</h4>
                    <p className="text-stone-500 mt-0.5">767 Fifth Avenue, New York, NY 10153</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Electronic Mail</h4>
                    <p className="text-stone-500 mt-0.5">concierge@aura-atelier.com</p>
                    <p className="text-[11px] text-stone-400">Response within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Direct Telephone</h4>
                    <p className="text-stone-500 mt-0.5">+1 (800) 849-AURA</p>
                    <p className="text-[11px] text-stone-400">Mon - Fri, 9am - 8pm EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Dispatch Timelines</h4>
                    <p className="text-stone-500 mt-0.5">Orders dispatched within 24-48 business hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-10 shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl text-stone-900">Inquiry Received</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Thank you, {formData.name}. Our concierge team has been notified and will reply to <strong>{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-serif text-2xl text-stone-900 mb-6">
                    Direct Inquiry Form
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Order Tracking">Consignment Tracking</option>
                        <option value="Payment Inquiry">Payment & Billing</option>
                        <option value="Product Sourcing">Custom Acquisition Request</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Order # (If applicable)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ORD-78291"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How may our concierge assist you today?"
                      className="w-full px-4 py-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry to Concierge</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
