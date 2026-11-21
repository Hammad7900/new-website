import React, { useState } from 'react';
import { CreditCard, ExternalLink, ShieldCheck } from 'lucide-react';

export const WhopCheckoutEmbed = ({ checkoutUrl: configuredCheckoutUrl, total, onComplete }) => {
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const rawPlanValue = configuredCheckoutUrl || '';
  const checkoutUrl = (() => {
    try {
      const url = new URL(rawPlanValue);
      return url.protocol === 'https:' && (url.hostname === 'whop.com' || url.hostname.endsWith('.whop.com'))
        ? url.toString()
        : '';
    } catch {
      return '';
    }
  })();

  const submitForReview = async () => {
    setSubmitting(true);
    setError('');
    try {
      await onComplete?.({ method: 'Whop (awaiting manual verification)' });
    } catch (submitError) {
      setError(submitError.message || 'Could not submit the order. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white"><CreditCard className="w-4 h-4" /></div>
        <div><h3 className="font-semibold text-stone-900 text-sm">Whop checkout</h3><p className="text-xs text-stone-500">Your order total is ${total.toFixed(2)} USD.</p></div>
      </div>
      <p className="text-xs text-stone-600 leading-relaxed mb-5">Payment amount is controlled by the Whop product or checkout link. For the requested $1 test, set that Whop checkout product to $1 before testing. This page will not claim payment succeeded; confirm the payment in Whop before dispatching an order.</p>
      {checkoutUrl ? (
        <>
          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => setCheckoutOpened(true)} className="w-full py-4 px-4 bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /><span>Open Whop checkout</span><ExternalLink className="w-4 h-4" />
          </a>
          {checkoutOpened && <button type="button" disabled={submitting} onClick={submitForReview} className="w-full mt-3 py-3 px-4 border border-stone-300 text-stone-800 font-semibold text-xs rounded-xl disabled:opacity-50">{submitting ? 'Submitting order…' : 'I completed payment · Submit order for verification'}</button>}
        </>
      ) : <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">Set VITE_WHOP_PLAN_ID to your full HTTPS Whop checkout URL. Configure that Whop plan to $1 for the test order.</p>}
      {error && <p className="text-xs text-rose-700 mt-3">{error}</p>}
    </div>
  );
};

export default WhopCheckoutEmbed;
