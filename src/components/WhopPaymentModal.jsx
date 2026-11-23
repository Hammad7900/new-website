// src/components/WhopPaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { BRAND } from '../config/constants';

export const WhopPaymentModal = ({
  isOpen,
  onClose,
  checkoutUrl,
  total,
  onPaymentSuccess,
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIframeLoading(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
                <span>{BRAND.shortName} Secure Checkout</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  256-Bit SSL
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                Total Due: <strong className="text-stone-900">${total.toFixed(2)} USD</strong> · Powered by Whop
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative flex-1 w-full bg-white overflow-hidden" style={{ minHeight: '520px' }}>
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 space-y-3">
              <RefreshCw className="w-7 h-7 text-stone-800 animate-spin" />
              <p className="text-xs font-semibold text-stone-700">Connecting to secure Whop payment gateway...</p>
              <p className="text-[11px] text-stone-400">Card details & digital wallets are bank-grade encrypted.</p>
            </div>
          )}

          <iframe
            src={checkoutUrl}
            title="Whop Secure Payment Gateway"
            className="w-full h-full border-0"
            style={{ minHeight: '520px', height: '100%' }}
            onLoad={() => setIframeLoading(false)}
            allow="payment *"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center space-x-1.5 text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted PCI-DSS Level 1 Gateway</span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-900 underline flex items-center gap-1 font-medium"
            >
              <span>Open in new window</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={onPaymentSuccess}
              className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-[11px] font-semibold rounded-lg transition-colors"
            >
              Confirm Paid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhopPaymentModal;
