// src/pages/admin/AdminShipping.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCart } from '../../context/CartContext';
import { fetchStoreSettings } from '../../services/api';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Sparkles,
  Zap,
} from 'lucide-react';

export const AdminShipping = () => {
  const { updateShippingRules } = useCart();
  const [baseRate, setBaseRate] = useState(1.0);
  const [incrementalRate, setIncrementalRate] = useState(1.0);

  // 10 Individual Tiers
  const [tier1, setTier1] = useState(1.0);
  const [tier2, setTier2] = useState(2.0);
  const [tier3, setTier3] = useState(3.0);
  const [tier4, setTier4] = useState(4.0);
  const [tier5, setTier5] = useState(5.0);
  const [tier6, setTier6] = useState(6.0);
  const [tier7, setTier7] = useState(7.0);
  const [tier8, setTier8] = useState(8.0);
  const [tier9, setTier9] = useState(9.0);
  const [tier10, setTier10] = useState(10.0);
  const [tierBeyond10, setTierBeyond10] = useState(1.0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchStoreSettings()
      .then((settings) => {
        const rules = settings.shippingRules || {};
        const b = Number(rules.tier1 ?? rules.baseRate ?? settings.shippingCost ?? 1.0);
        const add = Number(rules.tierBeyond10 ?? rules.additionalItemRate ?? 1.0);

        setBaseRate(b);
        setIncrementalRate(add);
        setTier1(Number(rules.tier1 ?? b));
        setTier2(Number(rules.tier2 ?? (b + add)));
        setTier3(Number(rules.tier3 ?? (b + add * 2)));
        setTier4(Number(rules.tier4 ?? rules.tier4Plus ?? (b + add * 3)));
        setTier5(Number(rules.tier5 ?? (b + add * 4)));
        setTier6(Number(rules.tier6 ?? (b + add * 5)));
        setTier7(Number(rules.tier7 ?? (b + add * 6)));
        setTier8(Number(rules.tier8 ?? (b + add * 7)));
        setTier9(Number(rules.tier9 ?? (b + add * 8)));
        setTier10(Number(rules.tier10 ?? (b + add * 9)));
        setTierBeyond10(Number(rules.tierBeyond10 ?? add));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAutoFill = () => {
    const b = Math.max(0, Number(baseRate) || 0);
    const inc = Math.max(0, Number(incrementalRate) || 0);

    setTier1(b);
    setTier2(Math.round((b + inc) * 100) / 100);
    setTier3(Math.round((b + inc * 2) * 100) / 100);
    setTier4(Math.round((b + inc * 3) * 100) / 100);
    setTier5(Math.round((b + inc * 4) * 100) / 100);
    setTier6(Math.round((b + inc * 5) * 100) / 100);
    setTier7(Math.round((b + inc * 6) * 100) / 100);
    setTier8(Math.round((b + inc * 7) * 100) / 100);
    setTier9(Math.round((b + inc * 8) * 100) / 100);
    setTier10(Math.round((b + inc * 9) * 100) / 100);
    setTierBeyond10(inc);

    setFeedback({
      type: 'success',
      text: `Auto-populated all 10 tiers starting from $${b.toFixed(2)} with +$${inc.toFixed(2)} increment. Click "Save Shipping Rules" to apply.`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await updateShippingRules({
        baseRate: Number(tier1),
        additionalItemRate: Number(tierBeyond10),
        tier1: Number(tier1),
        tier2: Number(tier2),
        tier3: Number(tier3),
        tier4: Number(tier4),
        tier5: Number(tier5),
        tier6: Number(tier6),
        tier7: Number(tier7),
        tier8: Number(tier8),
        tier9: Number(tier9),
        tier10: Number(tier10),
        tierBeyond10: Number(tierBeyond10),
      });

      setFeedback({
        type: 'success',
        text: '10-Tier multi-item shipping rates saved and active across your store!',
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

  const tiersList = [
    { label: '1 Product', val: tier1, setVal: setTier1 },
    { label: '2 Products', val: tier2, setVal: setTier2 },
    { label: '3 Products', val: tier3, setVal: setTier3 },
    { label: '4 Products', val: tier4, setVal: setTier4 },
    { label: '5 Products', val: tier5, setVal: setTier5 },
    { label: '6 Products', val: tier6, setVal: setTier6 },
    { label: '7 Products', val: tier7, setVal: setTier7 },
    { label: '8 Products', val: tier8, setVal: setTier8 },
    { label: '9 Products', val: tier9, setVal: setTier9 },
    { label: '10 Products', val: tier10, setVal: setTier10 },
  ];

  return (
    <AdminLayout title="10-Tier Shipping & Multi-Product Logistics">
      <div className="space-y-6 max-w-5xl">
        {/* Header summary */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4 text-stone-900" />
              <span>Multi-Item Dispatch Engine</span>
            </div>
            <h2 className="font-serif text-2xl text-stone-900">10-Product Shipping Matrix</h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
              Set precise shipping fees for 1 product up to 10 products. Customers will be charged based on their exact cart item quantity.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-900 hover:bg-amber-500/20 text-xs font-semibold rounded-2xl flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Auto-Fill 10 Tiers</span>
            </button>
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* Quick Config Bar */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Base Rate (1st Product) $
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-stone-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseRate}
                  onChange={(e) => setBaseRate(Number(e.target.value))}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Extra per additional product $
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-stone-500">+$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={incrementalRate}
                  onChange={(e) => setIncrementalRate(Number(e.target.value))}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* 10 Tiers Grid */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs">
            <h3 className="font-semibold text-stone-900 text-sm mb-4 pb-3 border-b border-stone-100 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-amber-500" />
                <span>Exact Rates for 1 to 10 Items</span>
              </span>
              <span className="text-xs text-stone-400 font-normal">
                Customize any tier individually
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {tiersList.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-stone-400 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                      {tier.label}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">Tier {idx + 1}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono text-stone-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={tier.val}
                      onChange={(e) => tier.setVal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-mono font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Beyond 10 items rate */}
            <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-stone-800">
                  Orders with more than 10 products:
                </p>
                <p className="text-[11px] text-stone-400">
                  Adds this incremental fee for item 11, item 12, etc. on top of Tier 10 rate.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-stone-500 font-medium">+$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tierBeyond10}
                  onChange={(e) => setTierBeyond10(Number(e.target.value))}
                  className="w-28 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono font-semibold"
                />
                <span className="text-xs text-stone-400 font-mono">per extra item</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 px-6 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50 cursor-pointer shadow-md"
          >
            {saving ? 'Saving 10 Shipping Tiers...' : 'Save & Publish All 10 Shipping Tiers'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminShipping;
