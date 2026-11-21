// src/pages/AdminCoupons.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { getStoredCoupons, addCoupon, deleteCoupon } from '../services/couponService';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Percent,
  DollarSign,
  Info
} from 'lucide-react';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage'); // 'percentage' | 'fixed'
  const [value, setValue] = useState(10);
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [description, setDescription] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  const loadCoupons = () => {
    setCoupons(getStoredCoupons());
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!code.trim()) {
      setStatusMsg({ type: 'error', text: 'Coupon code cannot be empty.' });
      return;
    }

    try {
      addCoupon({
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        expiryDate,
        description: description || `${type === 'percentage' ? `${value}% off` : `$${value} off`} coupon`,
      });

      loadCoupons();
      setStatusMsg({
        type: 'success',
        text: `Coupon "${code.toUpperCase()}" created and active across storefront!`,
      });

      // Reset form
      setCode('');
      setValue(10);
      setDescription('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleDelete = (cCode) => {
    deleteCoupon(cCode);
    loadCoupons();
    setStatusMsg({ type: 'success', text: `Coupon "${cCode}" removed.` });
  };

  return (
    <AdminLayout title="Discount Coupons Management">
      {/* Koia SDK / Discount Architecture banner */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 mb-8 shadow-xs flex items-start space-x-3.5">
        <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center shrink-0 mt-0.5">
          <Tag className="w-4 h-4" />
        </div>
        <div className="text-xs text-stone-600 leading-relaxed">
          <h4 className="font-semibold text-stone-900 mb-0.5">
            Koia E-Shop SDK Coupon Engine Active
          </h4>
          <p>
            Coupons created here are stored in LocalStorage and dynamically validated by the client cart and Whop checkout flow. Customers can apply active codes (like <code className="bg-stone-100 font-mono text-stone-800 px-1 py-0.5 rounded">SAVE10</code> or <code className="bg-stone-100 font-mono text-stone-800 px-1 py-0.5 rounded">WELCOME20</code>) in their bag.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs font-medium flex items-center space-x-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Create Coupon Form */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
            <h3 className="font-serif text-xl text-stone-900 mb-5 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-stone-700" />
              <span>Create New Coupon</span>
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP25, SPRING10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              {/* Discount Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Value {type === 'percentage' ? '(%)' : '($ USD)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max={type === 'percentage' ? 100 : 1000}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    <div className="absolute right-3 top-2.5 text-stone-400">
                      {type === 'percentage' ? (
                        <Percent className="w-4 h-4" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Expiry Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Internal Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP Client 25% Holiday Privilege"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow"
              >
                Publish Coupon Code
              </button>
            </form>
          </div>
        </div>

        {/* Right: Active Coupons List */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-stone-900">Active Coupons</h3>
                <p className="text-xs text-stone-500 mt-0.5">Live promo codes currently valid at checkout</p>
              </div>
              <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                {coupons.length} Active
              </span>
            </div>

            {coupons.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400">
                No active coupon codes. Create your first code using the form.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {coupons.map((c) => {
                  const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();

                  return (
                    <div
                      key={c.code}
                      className="p-5 flex items-center justify-between hover:bg-stone-50/60 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center font-bold text-stone-900 shrink-0">
                          {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-sm text-stone-900">
                              {c.code}
                            </span>
                            {isExpired ? (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                Expired
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{c.description}</p>
                          <div className="text-[10px] text-stone-400 mt-1 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Valid until: {c.expiryDate || 'No Expiry'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(c.code)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-4"
                        title="Delete coupon"
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
