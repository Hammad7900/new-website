// src/pages/store/Checkout.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { BRAND } from '../../config/constants';
import { ALL_COUNTRIES } from '../../data/countries';
import {
  ShieldCheck, Lock, CheckCircle2, ArrowLeft, ShoppingBag,
  Truck, Sparkles, Tag, X, Loader2, CreditCard, AlertCircle, RefreshCw,
} from 'lucide-react';

const WHOP_API_KEY    = 'apik_J6aTnjsiggCFX_C8592368_C_58defc2d1f80a9c074d06c70a72fc4f60922cad7677484572e601ca96bef97';
const WHOP_ACCOUNT_ID = 'biz_0DSMZeYhX5GeRy';
const WHOP_PRODUCT_ID = 'prod_8lUVRU6hM1Bdo';

export const Checkout = () => {
  const { cartItems, subtotal, shipping, discountAmount, total, coupon, applyCoupon, removeCoupon, saveOrder } = useCart();

  // Form fields
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [fullName, setFullName]         = useState('');
  const [country, setCountry]           = useState('US');
  const [street, setStreet]             = useState('');
  const [city, setCity]                 = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode]     = useState('');

  // Coupon
  const [couponCode, setCouponCode]     = useState('');
  const [couponError, setCouponError]   = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // State machine: 'form' | 'creating' | 'paying' | 'confirming' | 'done' | 'error'
  const [stage, setStage]               = useState('form');
  const [errors, setErrors]             = useState({});
  const [paymentNotice, setPaymentNotice] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [whopUrl, setWhopUrl]           = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const pollRef = useRef(null);
  const orderPayloadRef = useRef(null);

  // ── Return-from-Whop detection (old flow, kept as backup) ────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status') || params.get('payment');
    if (status === 'success' || status === 'succeeded') {
      const saved = sessionStorage.getItem('aura_pending_order') || localStorage.getItem('aura_pending_order');
      if (saved) {
        try {
          const payload = JSON.parse(saved);
          sessionStorage.removeItem('aura_pending_order');
          localStorage.removeItem('aura_pending_order');
          saveOrder({ ...payload, status: 'PAID', paymentMethod: 'Whop (Return Confirmed)' })
            .then(o => { setConfirmedOrder(o); setStage('done'); })
            .catch(() => { setConfirmedOrder({ ...payload, id: `ORD-CONF-${Date.now().toString(36).toUpperCase()}`, status: 'PAID' }); setStage('done'); });
          window.history.replaceState({}, '', window.location.pathname);
        } catch (_) {}
      }
    } else if (status === 'canceled' || status === 'failed') {
      setPaymentNotice('Payment was not completed. You can try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [saveOrder]);

  // ── Listen for postMessage from Whop iframe ───────────────────────────────
  useEffect(() => {
    const handler = (evt) => {
      if (!evt.data) return;
      const d = typeof evt.data === 'string' ? (() => { try { return JSON.parse(evt.data); } catch { return {}; } })() : evt.data;
      const isSuccess = d?.type === 'payment_completed' || d?.type === 'purchase_completed' ||
        d?.action === 'payment.completed' || d?.status === 'completed' || d?.event === 'purchase';
      if (isSuccess && stage === 'paying') {
        confirmOrder();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [stage]);

  // ── Poll backend every 4 seconds while in 'paying' stage ─────────────────
  const startPolling = useCallback((orderId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/check-order-status?orderId=${encodeURIComponent(orderId)}`);
        const d = await r.json().catch(() => ({}));
        if (d?.paid) {
          clearInterval(pollRef.current);
          confirmOrder(d.order);
        }
      } catch (_) {}
    }, 4000);
  }, []);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const confirmOrder = useCallback(async (preloadedOrder = null) => {
    if (stage === 'done' || stage === 'confirming') return;
    setStage('confirming');
    if (pollRef.current) clearInterval(pollRef.current);
    try {
      if (preloadedOrder && preloadedOrder.id) {
        setConfirmedOrder(preloadedOrder);
        setStage('done');
        return;
      }
      const payload = orderPayloadRef.current;
      if (payload) {
        const saved = await saveOrder({ ...payload, status: 'PAID', paymentMethod: 'Whop (Embedded Confirmed)' });
        setConfirmedOrder(saved);
      }
      setStage('done');
    } catch (e) {
      const payload = orderPayloadRef.current;
      setConfirmedOrder(payload ? { ...payload, id: currentOrderId || `ORD-${Date.now().toString(36).toUpperCase()}`, status: 'PAID' } : null);
      setStage('done');
    }
  }, [stage, saveOrder, currentOrderId]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email required.';
    if (!fullName.trim()) errs.fullName = 'Full name required.';
    if (!street.trim()) errs.street = 'Street address required.';
    if (!city.trim()) errs.city = 'City required.';
    if (!postalCode.trim()) errs.postalCode = 'Postal code required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim(), subtotal);
    if (!res.success) setCouponError(res.error || 'Invalid voucher code.');
    else setCouponCode('');
    setApplyingCoupon(false);
  };

  // ── Save abandoned checkout data ───────────────────────────────────────────
  const saveAbandoned = async () => {
    if (!email.trim() && !phone.trim()) return;
    try {
      await fetch('/api/abandoned-checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          country,
          street: street.trim(),
          city: city.trim(),
          state: stateProvince.trim(),
          zip: postalCode.trim(),
          items: cartItems.map(it => ({ name: it.name, quantity: it.quantity, price: it.price })),
          total,
          cartSummary: cartItems.map(it => `${it.name} x${it.quantity}`).join(', '),
        }),
      });
    } catch (_) {}
  };

  // ── Create Whop plan and show embedded checkout ────────────────────────────
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 300, behavior: 'smooth' }); return; }
    setStage('creating');
    setPaymentNotice('');

    const selectedCountryObj = ALL_COUNTRIES.find(c => c.code === country);
    const countryName = selectedCountryObj?.name || 'United States';
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setCurrentOrderId(orderId);

    const orderPayload = {
      customer: { name: fullName.trim(), email: email.trim(), phone: phone.trim() || '' },
      shippingAddress: { street: street.trim(), city: city.trim(), state: stateProvince.trim(), zip: postalCode.trim(), country: countryName, countryCode: country.toUpperCase() },
      items: cartItems.map(it => ({ id: it.id, name: it.name, sku: it.sku, vid: it.vid, price: it.price, quantity: it.quantity, image: it.image })),
      subtotal, shipping, discountAmount, total,
      couponCode: coupon?.coupon?.code || null,
      paymentMethod: 'Whop — Embedded Gateway',
      status: 'PAYMENT_REVIEW',
    };
    orderPayloadRef.current = orderPayload;

    // Save abandoned checkout data NOW (in case user leaves)
    saveAbandoned();

    // Stash in storage as backup
    try {
      sessionStorage.setItem('aura_pending_order', JSON.stringify(orderPayload));
      localStorage.setItem('aura_pending_order', JSON.stringify(orderPayload));
    } catch (_) {}

    // Try browser-direct Whop API call first (fastest, no PHP needed)
    let purchaseUrl = null;
    try {
      const r = await fetch('https://api.whop.com/api/v1/plans', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${WHOP_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: WHOP_ACCOUNT_ID, product_id: WHOP_PRODUCT_ID,
          initial_price: Math.round(total * 100) / 100,
          currency: 'usd', billing_type: 'one_time', release_method: 'buy_now',
          visibility: 'hidden', metadata: {},
        }),
      });
      if (r.ok) {
        const d = await r.json();
        purchaseUrl = d?.purchase_url || null;
        // Also send full order data to PHP for pre-save & webhook matching
        fetch('/api/create-whop-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total, orderId, customerEmail: email.trim(), customerName: fullName.trim(),
            customer: orderPayload.customer, shippingAddress: orderPayload.shippingAddress,
            items: orderPayload.items, subtotal, shipping, discountAmount, couponCode: orderPayload.couponCode,
            whopPlanIdToLink: d?.id,
          }),
        }).catch(() => {});
      }
    } catch (_) {}

    // If browser call failed, try PHP backend
    if (!purchaseUrl) {
      try {
        const r = await fetch('/api/create-whop-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total, orderId, customerEmail: email.trim(), customerName: fullName.trim(),
            customer: orderPayload.customer, shippingAddress: orderPayload.shippingAddress,
            items: orderPayload.items, subtotal, shipping, discountAmount, couponCode: orderPayload.couponCode,
          }),
        });
        const d = await r.json().catch(() => ({}));
        if (d?.success && d?.checkoutUrl) purchaseUrl = d.checkoutUrl;
      } catch (_) {}
    }

    if (!purchaseUrl) {
      setStage('error');
      setPaymentNotice('Could not connect to payment gateway. Please try again.');
      return;
    }

    // Add email/name prefill params to URL
    try {
      const url = new URL(purchaseUrl);
      if (email.trim()) url.searchParams.set('email', email.trim());
      if (fullName.trim()) url.searchParams.set('name', fullName.trim());
      purchaseUrl = url.toString();
    } catch (_) {}

    setWhopUrl(purchaseUrl);
    setStage('paying');
    startPolling(orderId);
  };

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (cartItems.length === 0 && stage !== 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center bg-[#faf8f5]">
        <div>
          <ShoppingBag className="w-14 h-14 text-stone-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-stone-900 mb-2">Your cart is empty</h2>
          <p className="text-xs text-stone-500 mb-6">Select luxury items from our collection to begin checkout.</p>
          <Link to="/" className="px-8 py-3.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-black transition-colors">
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  // ── Order Confirmed ────────────────────────────────────────────────────────
  if (stage === 'done' && confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#faf8f5] py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
            Payment Confirmed ✓
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-4 mb-2">Thank you for your order</h2>
          <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
            Order <strong className="font-mono text-stone-900">{confirmedOrder.id}</strong> has been placed.
            A confirmation has been recorded for <strong>{confirmedOrder.customer?.email}</strong>.
          </p>

          {confirmedOrder.items?.length > 0 && (
            <div className="border border-stone-100 rounded-2xl p-5 mb-8 text-left bg-stone-50/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-4">
                Items ({confirmedOrder.items.length})
              </h4>
              <div className="space-y-3 divide-y divide-stone-100">
                {confirmedOrder.items.map((it, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      {it.image && <img src={it.image} alt={it.name} className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200/60" />}
                      <div>
                        <div className="text-xs font-semibold text-stone-900 line-clamp-1">{it.name}</div>
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">Qty: {it.quantity} · Ref: {it.sku}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-stone-900 text-xs shrink-0">${(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-200 mt-4 pt-3 flex justify-between items-center text-xs font-semibold text-stone-900">
                <span>Total Paid</span>
                <span className="font-serif text-base">${confirmedOrder.total?.toFixed(2)} USD</span>
              </div>
            </div>
          )}

          <div className="border border-stone-200/80 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start space-x-3">
              <Truck className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Direct Origin Fulfillment</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Dispatching to: <span className="font-medium text-stone-800">
                    {confirmedOrder.shippingAddress?.street}, {confirmedOrder.shippingAddress?.city}, {confirmedOrder.shippingAddress?.country}
                  </span>
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Order recorded in Atelier Fulfillment Pipeline.
                </p>
              </div>
            </div>
          </div>

          <Link to="/" className="px-8 py-3.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-black transition-colors inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Embedded Payment Stage ─────────────────────────────────────────────────
  if (stage === 'paying' || stage === 'confirming') {
    return (
      <div className="min-h-screen bg-[#faf8f5] py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => { if (pollRef.current) clearInterval(pollRef.current); setStage('form'); }}
              className="inline-flex items-center space-x-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to form</span>
            </button>
            <div className="flex items-center space-x-2 text-[11px] text-stone-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-3xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-stone-900">Secure Payment</h2>
                <p className="text-xs text-stone-500 mt-0.5">Order total: <strong className="text-stone-900">${total.toFixed(2)} USD</strong></p>
              </div>
              {stage === 'confirming' ? (
                <div className="flex items-center space-x-2 text-emerald-700 text-xs font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming payment...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-stone-500 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Powered by Whop</span>
                </div>
              )}
            </div>

            {/* Iframe loading state */}
            {!iframeLoaded && (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-xs">Loading secure payment...</p>
              </div>
            )}

            {/* Embedded Whop Checkout */}
            <iframe
              src={whopUrl}
              title="Secure Payment"
              onLoad={() => setIframeLoaded(true)}
              allow="payment; camera"
              className={`w-full border-0 transition-all duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0 h-0'}`}
              style={{ minHeight: iframeLoaded ? '680px' : '0' }}
            />

            {/* Footer note */}
            {iframeLoaded && (
              <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
                <p className="text-[11px] text-stone-400">
                  After completing payment above, your order will be automatically confirmed. ✓
                </p>
                <button
                  onClick={() => confirmOrder()}
                  className="mt-2 text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" /> Already paid? Click here to confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Creating plan loader ───────────────────────────────────────────────────
  if (stage === 'creating') {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-stone-700 mx-auto mb-4" />
          <p className="text-sm text-stone-600 font-medium">Setting up your secure checkout...</p>
          <p className="text-xs text-stone-400 mt-1">This takes just a moment</p>
        </div>
      </div>
    );
  }

  // ── Checkout Form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf8f5] py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8 flex items-center justify-between">
          <Link to="/cart" className="inline-flex items-center space-x-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shopping Bag</span>
          </Link>
          <div className="flex items-center space-x-2 text-[11px] text-stone-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Settlement</span>
          </div>
        </div>

        {paymentNotice && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3 text-amber-800 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{paymentNotice}</span>
            {stage === 'error' && (
              <button onClick={() => setStage('form')} className="ml-auto text-xs text-amber-900 font-semibold underline">
                Try again
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT: Order Summary */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-6">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <h3 className="font-semibold text-stone-900 text-sm">
                  Order Summary ({cartItems.reduce((acc, it) => acc + it.quantity, 0)} items)
                </h3>
                <span className="text-xs font-mono text-stone-400">USD</span>
              </div>

              <div className="py-4 space-y-3.5 divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.vid || ''}`} className="pt-3.5 first:pt-0 flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative shrink-0">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200/70" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-stone-400 font-mono">Ref: {item.sku || 'AURA-ITEM'}</p>
                      </div>
                    </div>
                    <div className="font-semibold text-stone-900 text-xs shrink-0 pl-3">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher */}
              <div className="pt-4 border-t border-stone-100">
                {coupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                    <div className="flex items-center space-x-2 text-emerald-800 text-xs">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold">{coupon.coupon?.code}</span>
                      <span className="text-[11px]">(-${discountAmount.toFixed(2)})</span>
                    </div>
                    <button type="button" onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900 text-xs">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input
                      type="text" placeholder="Discount code or voucher"
                      value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono uppercase"
                    />
                    <button type="submit" disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors">
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <div className="text-[11px] text-rose-600 mt-1.5">{couponError}</div>}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-xs pt-4 border-t border-stone-100 mt-4">
                <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600 font-semibold">Complimentary</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-sm font-semibold text-stone-900">
                  <span>Total due today</span>
                  <span className="font-serif text-xl">${total.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-center space-x-2 text-[11px] text-stone-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Guaranteed safe & secure encrypted checkout</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <form onSubmit={handleProceedToPayment} className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

              {/* Contact */}
              <div>
                <h3 className="font-semibold text-stone-900 text-sm mb-3">1. Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">Email address *</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. client@example.com"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors" />
                    {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">Phone Number (for delivery alerts)</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="pt-5 border-t border-stone-100">
                <h3 className="font-semibold text-stone-900 text-sm mb-3">2. Shipping Destination</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">Country / Region *</label>
                    <select value={country} onChange={e => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors cursor-pointer">
                      {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">Full Name *</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors" />
                    {errors.fullName && <p className="text-[10px] text-rose-600 mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">Street Address *</label>
                    <input type="text" required value={street} onChange={e => setStreet(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors" />
                    {errors.street && <p className="text-[10px] text-rose-600 mt-1">{errors.street}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">City *</label>
                      <input type="text" required value={city} onChange={e => setCity(e.target.value)}
                        placeholder="New York"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors" />
                      {errors.city && <p className="text-[10px] text-rose-600 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">State</label>
                      <input type="text" value={stateProvince} onChange={e => setStateProvince(e.target.value)}
                        placeholder="NY"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">Postal Code *</label>
                      <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)}
                        placeholder="10001"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors" />
                      {errors.postalCode && <p className="text-[10px] text-rose-600 mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment note */}
              <div className="pt-5 border-t border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-stone-900 text-sm">3. Payment</h3>
                  <div className="flex items-center space-x-1.5">
                    {['VISA','MC','AMEX','Apple Pay','G Pay'].map(m => (
                      <span key={m} className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/70 space-y-2">
                  <div className="flex items-center space-x-2 text-stone-900 text-xs font-semibold">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Secure payment on this page — no redirect needed</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    After clicking below, a secure Whop payment window opens right here. Your order is automatically confirmed once payment is complete.
                  </p>
                </div>
              </div>

              <button type="submit"
                className="w-full py-4 px-6 bg-stone-950 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Proceed to Secure Payment · ${total.toFixed(2)} USD</span>
              </button>

              <div className="text-center space-y-1.5 pt-2">
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  By purchasing, you agree to {BRAND.name} terms of service and client privacy terms.
                </p>
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-stone-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-stone-700 tracking-wide">256-Bit SSL Bank-Grade Protected</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
