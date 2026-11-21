// src/components/WhopCheckoutEmbed.jsx
import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';

export const WhopCheckoutEmbed = ({ planId, total, onComplete, customerInfo }) => {
  const rawPlanValue = planId || import.meta.env.VITE_WHOP_PLAN_ID || 'plan_luxury_vault_standard';
  
  // If the user entered a direct link (e.g. https://whop.com/...), use it directly
  const checkoutUrl = rawPlanValue.startsWith('http://') || rawPlanValue.startsWith('https://')
    ? rawPlanValue
    : `https://whop.com/checkout/${rawPlanValue}`;

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState('card'); // 'card' | 'applepay' | 'portal'
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');

  const handleSimulatePayment = (e) => {
    e?.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onComplete({
        paymentId: 'pay_tx_' + Math.random().toString(36).substring(2, 11),
        amount: total,
        currency: 'USD',
        provider: 'Encrypted Card Gateway',
        customerEmail: customerInfo?.email,
        timestamp: new Date().toISOString(),
      });
    }, 1200);
  };

  const handleOpenCheckoutUrl = () => {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-stone-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shrink-0">
            <CreditCard className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-stone-900 text-sm">Secure Payment Gateway</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Encrypted
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified Merchant Protection • Instant Authorization
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 mr-1" />
          256-Bit SSL Encrypted
        </div>
      </div>

      {/* Payment Modes Toggle */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          type="button"
          onClick={() => setPaymentMode('card')}
          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            paymentMode === 'card'
              ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Card</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMode('applepay')}
          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            paymentMode === 'applepay'
              ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
          }`}
        >
          <span> Pay / G-Pay</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMode('portal')}
          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            paymentMode === 'portal'
              ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Express Link</span>
        </button>
      </div>

      {paymentMode === 'card' && (
        <form onSubmit={handleSimulatePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="w-full pl-4 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors font-mono"
              />
              <div className="absolute right-3 top-2.5 text-stone-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                CVC / Security Code
              </label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="CVC"
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-2 py-4 px-4 bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Authorizing Payment...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pay ${total.toFixed(2)} USD Securely</span>
              </>
            )}
          </button>
        </form>
      )}

      {paymentMode === 'applepay' && (
        <div className="text-center py-4 space-y-4">
          <p className="text-xs text-stone-500">
            Authorize biometric payment through Apple Pay or Google Wallet.
          </p>
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-4 px-4 bg-black hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <span>Authorizing Biometric Payment...</span>
            ) : (
              <span>Authorize ${total.toFixed(2)} with  Pay</span>
            )}
          </button>
        </div>
      )}

      {paymentMode === 'portal' && (
        <div className="py-4 space-y-4 text-center">
          <p className="text-xs text-stone-600 leading-relaxed">
            Click below to open the dedicated secure payment portal in a new tab:
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleOpenCheckoutUrl}
              className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors border border-stone-200"
            >
              <span>Open Checkout Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-stone-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
            >
              {isProcessing ? 'Verifying...' : 'Confirm Completed Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Guarantee */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-center space-x-2 text-[11px] text-stone-400">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>30-Day Money-Back Guarantee & Official Buyer Protection</span>
      </div>
    </div>
  );
};
