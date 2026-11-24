// src/pages/admin/AdminShipping.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCart } from '../../context/CartContext';
import { fetchStoreSettings } from '../../services/api';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Calculator,
} from 'lucide-react';

export const AdminShipping = () => {
  const { updateShippingRules, shippingRules: ctxRules } = useCart();
  const [baseRate, setBaseRate] = useState(1.0);
  const [additionalItemRate, setAdditionalItemRate] = useState(1.0);
  const [tier2, setTier2] = useState(2.0);
  const [tier3, setTier3] = useState(3.0);
  const [tier4Plus, setTier4Plus] = useState(4.0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchStoreSettings()
      .then((settings) => {
        const rules = settings.shippingRules || {};
        const base = Number(rules.baseRate ?? settings.shippingCost ?? 1.0);
        const add = Number(rules.additionalItemRate ?? 1.0);
        setBaseRate(base);
        setAdditionalItemRate(add);
        setTier2(Number(rules.tier2 ?? (base + add)));
        setTier3(Number(rules.tier3 ?? (base + add * 2)));
        setTier4Plus(Number(rules.tier4Plus ?? (base + add * 3)));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Auto-calculate default tiers when base or add changes, unless manually modified
  const handleBaseChange = (val) => {
    const num = Math.max(0, Number(val) || 0);
    setBaseRate(num);
    setTier2(Math.round((num + additionalItemRate) * 100) / 100);
    setTier3(Math.round((num + additionalItemRate * 2) * 100) / 100);
    setTier4Plus(Math.round((num + additionalItemRate * 3) * 100) / 100);
  };

  const handleAddChange = (val) => {
    const num = Math.max(0, Number(val) || 0);
    setAdditionalItemRate(num);
    setTier2(Math.round((baseRate + num) * 100) / 100);
    setTier3(Math.round((baseRate + num * 2) * 100) / 100);
    setTier4Plus(Math.round((baseRate + num * 3) * 100) / 100);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await updateShippingRules({
        baseRate: Number(baseRate),
        additionalItemRate: Number(additionalItemRate),
        tier2: Number(tier2),
        tier3: Number(tier3),
        tier4Plus: Number(tier4Plus),
      });

      setFeedback({
        type: 'success',
        text: 'Tiered multi-item shipping rates saved successfully.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to save shipping rules.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Tiered Shipping & Multi-Item Logistics">
      <div className="space-y-6 max-w-4xl">
        {/* Header summary */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4 text-stone-900" />
            <span>Multi-Item Dispatch Rules</span>
          </div>
          <h2 className="font-serif text-2xl text-stone-900">Tiered Shipping Matrix</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Configure customer shipping fees dynamically based on cart quantity. 1 item pays the base fee, and extra items add incremental fees automatically in the cart and checkout.
          </p>
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Form: Rate inputs */}
          <form
            onSubmit={handleSave}
            className="md:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5"
          >
            <h3 className="font-semibold text-stone-900 text-sm pb-3 border-b border-stone-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              <span>Configure Rate Tiers</span>
            </h3>

            {/* Base Rate (1 Item) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Base Fee for 1st Product ($ USD) *
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-stone-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={baseRate}
                  onChange={(e) => handleBaseChange(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono font-medium"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Applied when the customer has exactly 1 product in cart.
              </p>
            </div>

            {/* Incremental Rate per Extra Item */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Extra Fee per Additional Product ($ USD) *
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-stone-500">+$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={additionalItemRate}
                  onChange={(e) => handleAddChange(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono font-medium"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Added for the 2nd, 3rd, 4th, and each subsequent item.
              </p>
            </div>

            {/* Explicit Tier Overrides */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Specific Tier Overrides (Optional)
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                    2 Items Total
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-stone-400 mr-1">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tier2}
                      onChange={(e) => setTier2(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                    3 Items Total
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-stone-400 mr-1">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tier3}
                      onChange={(e) => setTier3(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                    4+ Items Total
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-stone-400 mr-1">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tier4Plus}
                      onChange={(e) => setTier4Plus(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-6 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {saving ? 'Saving Rules...' : 'Save Shipping Rules'}
            </button>
          </form>

          {/* Right: Live Interactive Customer Preview */}
          <div className="md:col-span-5 bg-stone-950 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">
                <span>Live Storefront Preview</span>
              </div>
              <h3 className="font-serif text-lg text-white">Customer Shipping Rates</h3>
              <p className="text-[11px] text-stone-400 mt-1 mb-5">
                Here is what customers will automatically see at Cart & Checkout:
              </p>

              <div className="space-y-2.5 divide-y divide-stone-800 text-xs">
                <div className="pt-2.5 first:pt-0 flex items-center justify-between">
                  <span className="text-stone-300">1 Item in cart</span>
                  <span className="font-mono font-bold text-amber-300">
                    ${Number(baseRate).toFixed(2)} USD
                  </span>
                </div>

                <div className="pt-2.5 flex items-center justify-between">
                  <span className="text-stone-300">2 Items in cart</span>
                  <span className="font-mono font-bold text-white">
                    ${Number(tier2).toFixed(2)} USD
                  </span>
                </div>

                <div className="pt-2.5 flex items-center justify-between">
                  <span className="text-stone-300">3 Items in cart</span>
                  <span className="font-mono font-bold text-white">
                    ${Number(tier3).toFixed(2)} USD
                  </span>
                </div>

                <div className="pt-2.5 flex items-center justify-between">
                  <span className="text-stone-300">4 Items in cart</span>
                  <span className="font-mono font-bold text-white">
                    ${Number(tier4Plus).toFixed(2)} USD
                  </span>
                </div>

                <div className="pt-2.5 flex items-center justify-between">
                  <span className="text-stone-300">5 Items in cart</span>
                  <span className="font-mono font-bold text-stone-400">
                    ${(Number(tier4Plus) + Number(additionalItemRate)).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 text-[10px] text-stone-400 flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Applied in real-time across shopping bag & checkout.</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminShipping;
