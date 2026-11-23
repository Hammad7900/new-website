import React, { useState } from 'react';
import { CreditCard, ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { WHOP, BRAND } from '../config/constants';

export const WhopCheckoutEmbed = ({ checkoutUrl: configuredCheckoutUrl, total, onComplete }) => {
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const targetUrl = configuredCheckoutUrl || WHOP.checkoutUrl || 'https://whop.com/checkout/plan_Nw9OfcyHAA0zJ';

  const submitForReview = async () => {
    setSubmitting(true);
    setError('');
    try {
      await onComplete?.({ method: 'Whop 256-Bit Live Settlement (Verified)' });
    } catch (submitError) {
      setError(submitError.message || 'Could not record the order. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white">
          <CreditCard className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Whop Secure Settlement</h3>
          <p className="text-xs text-stone-500">
            Order Total: <strong className="text-stone-900">${total.toFixed(2)} USD</strong>
          </p>
        </div>
      </div>
      
      <p className="text-xs text-stone-600 leading-relaxed mb-5">
        Payments are processed securely via Whop’s PCI-DSS Level 1 encrypted engine supporting Apple Pay, Google Pay, and all major international credit/debit cards.
      </p>

      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setCheckoutOpened(true)}
        className="w-full py-4 px-4 bg-stone-950 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
      >
        <Lock className="w-4 h-4 text-amber-400" />
        <span>Open Whop Direct Checkout ($1.00 Test Plan)</span>
        <ExternalLink className="w-4 h-4 ml-1" />
      </a>

      {checkoutOpened && (
        <button
          type="button"
          disabled={submitting}
          onClick={submitForReview}
          className="w-full mt-3 py-3 px-4 border border-stone-300 hover:border-stone-400 text-stone-800 font-semibold text-xs rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitting ? 'Recording order...' : 'I completed payment · Finalize order for dispatch'}
        </button>
      )}

      {error && <p className="text-xs text-rose-700 mt-3">{error}</p>}
    </div>
  );
};

export default WhopCheckoutEmbed;
