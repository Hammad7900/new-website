// src/pages/admin/AdminCoupons.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getCoupons, addCoupon, deleteCoupon } from '../../services/couponService';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Percent,
  DollarSign,
} from 'lucide-react';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    expiry: '',
  });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCoupons().then(setCoupons).catch((error) => showToast('error', error.message));
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.code || !form.value || !form.expiry) {
        throw new Error('All fields are required.');
      }
      if (parseFloat(form.value) <= 0) {
        throw new Error('Discount value must be greater than 0.');
      }
      const updated = await addCoupon({
        ...form,
        value: parseFloat(form.value),
      });
      setCoupons(updated);
      setForm({ code: '', type: 'percentage', value: '', expiry: '' });
      showToast('success', `Coupon "${form.code.toUpperCase()}" created successfully.`);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      const updated = await deleteCoupon(code);
      setCoupons(updated);
      showToast('success', `Coupon "${code}" deleted.`);
    } catch (error) {
      showToast('error', error.message);
    }
  };

  return (
    <AdminLayout title="Discount Codes & Promotions">
      {toast && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs font-medium flex items-center justify-between ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)}>
            <X className="w-4 h-4 text-stone-400 hover:text-stone-700" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center space-x-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-serif text-lg text-stone-900">New Coupon</h3>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="e.g. SAVE10, VIP20"
                  maxLength={20}
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'percentage', label: 'Percentage', Icon: Percent },
                    { value: 'fixed', label: 'Fixed ($)', Icon: DollarSign },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: value }))}
                      className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors border ${
                        form.type === value
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Value {form.type === 'percentage' ? '(%)' : '(USD $)'}
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={form.type === 'percentage' ? '100' : undefined}
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === 'percentage' ? '10' : '20.00'}
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={form.expiry}
                  onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </form>
          </div>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-stone-900">Active Coupons</h3>
                <p className="text-xs text-stone-500 mt-0.5">{coupons.length} coupon(s) stored</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                <Tag className="w-4 h-4 text-stone-700" />
              </div>
            </div>
            {coupons.length === 0 ? (
              <div className="py-16 text-center text-xs text-stone-400">
                No coupons yet. Create one using the form on the left.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {coupons.map((c) => {
                  const isExpired = new Date(c.expiry) < new Date();
                  return (
                    <div
                      key={c.code}
                      className="px-6 py-4 flex items-center justify-between hover:bg-stone-50/60 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isExpired ? 'bg-stone-100' : 'bg-amber-50'
                          }`}
                        >
                          {c.type === 'percentage' ? (
                            <Percent
                              className={`w-4 h-4 ${
                                isExpired ? 'text-stone-400' : 'text-amber-600'
                              }`}
                            />
                          ) : (
                            <DollarSign
                              className={`w-4 h-4 ${
                                isExpired ? 'text-stone-400' : 'text-amber-600'
                              }`}
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-stone-900">
                              {c.code}
                            </span>
                            {isExpired ? (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                Expired
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5">
                            {c.type === 'percentage'
                              ? `${c.value}% off`
                              : `$${c.value} off`}{' '}
                            • Expires {new Date(c.expiry).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.code)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
