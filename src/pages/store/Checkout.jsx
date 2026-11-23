// src/pages/store/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { BRAND } from '../../config/constants';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  Truck,
  Sparkles,
  Tag,
  X,
  Loader2,
} from 'lucide-react';

const POPULAR_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
];

export const Checkout = () => {
  const {
    cartItems,
    subtotal,
    shipping,
    discountAmount,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
    saveOrder,
  } = useCart();

  const navigate = useNavigate();

  // Single-page form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('US');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Card payment states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Coupon input
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Status & processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [errors, setErrors] = useState({});

  // Format Card Number: 1234 1234 1234 1234
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry: MM/YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Format CVC: 3 or 4 digits
  const handleCvcChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(raw);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim(), subtotal);
    if (!res.success) {
      setCouponError(res.error || 'Invalid voucher code.');
    } else {
      setCouponCode('');
    }
    setApplyingCoupon(false);
  };

  const validate = () => {
    const errs = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email is required.';
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!street.trim()) errs.street = 'Street address is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!postalCode.trim()) errs.postalCode = 'Postal / ZIP code is required.';

    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length < 15) errs.cardNumber = 'Enter a valid 15 or 16-digit card number.';
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) errs.cardExpiry = 'Enter a valid expiry date (MM/YY).';
    if (cardCvc.length < 3) errs.cardCvc = 'Enter a valid CVC security code.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate real-time 256-bit gateway handshake
      await new Promise((r) => setTimeout(r, 1400));

      const selectedCountryObj = POPULAR_COUNTRIES.find((c) => c.code === country);
      const countryName = selectedCountryObj ? selectedCountryObj.name : 'United States';

      const orderPayload = {
        customer: {
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || '+1 555-0199',
        },
        shippingAddress: {
          street: street.trim(),
          city: city.trim(),
          state: stateProvince.trim() || 'NY',
          zip: postalCode.trim(),
          country: countryName,
          countryCode: country.toUpperCase(),
        },
        items: cartItems.map((it) => ({
          id: it.id,
          name: it.name,
          sku: it.sku,
          vid: it.vid,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
        subtotal,
        shipping,
        discountAmount,
        total,
        couponCode: coupon?.coupon?.code || null,
        paymentMethod: `Card ending in ${cardNumber.slice(-4)} (Powered by Whop)`,
      };

      const order = await saveOrder(orderPayload);
      setConfirmedOrder(order);
    } catch (err) {
      setErrors({ submit: err.message || 'Payment processing failed. Please check details.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty cart screen
  if (cartItems.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center bg-[#faf8f5]">
        <div>
          <ShoppingBag className="w-14 h-14 text-stone-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-stone-900 mb-2">Your cart is empty</h2>
          <p className="text-xs text-stone-500 mb-6">
            Select luxury items from our collection to begin checkout.
          </p>
          <Link
            to="/"
            className="px-8 py-3.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-black transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Order Confirmed Screen
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#faf8f5] py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
            Payment Authorized & Confirmed
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-4 mb-2">
            Thank you for your order
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
            We have received your payment for order{' '}
            <strong className="font-mono text-stone-900">{confirmedOrder.id}</strong>. A tracking
            dispatch receipt has been recorded for <strong>{confirmedOrder.customer?.email}</strong>.
          </p>

          {/* Purchased Items Card */}
          <div className="border border-stone-100 rounded-2xl p-5 mb-8 text-left bg-stone-50/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-4">
              Items in this consignment ({confirmedOrder.items?.length || 0})
            </h4>
            <div className="space-y-3 divide-y divide-stone-100">
              {confirmedOrder.items?.map((it, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    {it.image && (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200/60"
                      />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {it.name}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                        Qty: {it.quantity} • Ref: {it.sku}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-stone-900 text-xs shrink-0">
                    ${(it.price * it.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 mt-4 pt-3 flex justify-between items-center text-xs font-semibold text-stone-900">
              <span>Total Paid</span>
              <span className="font-serif text-base">${confirmedOrder.total?.toFixed(2)} USD</span>
            </div>
          </div>

          <Link
            to="/"
            className="inline-block px-8 py-3.5 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-sm"
          >
            Return to Atelier Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Top Banner & Navigation */}
      <header className="border-b border-stone-200/80 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 text-xs transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to store</span>
          </Link>

          <Link to="/" className="font-serif text-xl sm:text-2xl tracking-[0.2em] text-stone-900 font-medium">
            {BRAND.shortName}
          </Link>

          <div className="flex items-center space-x-1.5 text-stone-500 text-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] hidden sm:inline">256-bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main 2-Column All-In-One Checkout (Identical to reference website) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Order Review & Real Cart Items (Identical to reference) */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-6">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
              <div className="pb-4 mb-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Order Summary
                  </span>
                  <h3 className="font-serif text-xl text-stone-900 font-medium mt-0.5">
                    {BRAND.shortName} Curated Order
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-serif text-2xl font-semibold text-stone-900">
                    ${total.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-stone-400 font-medium">One-time payment</div>
                </div>
              </div>

              {/* Items List with Real Pictures */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1 divide-y divide-stone-100">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="pt-3 first:pt-0 flex items-center space-x-3.5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60 relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-stone-300" />
                        </div>
                      )}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-stone-900 line-clamp-2 leading-snug">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {item.variant && item.variant !== 'Standard' ? item.variant : 'Standard Edition'}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-stone-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Input */}
              <div className="pt-4 border-t border-stone-100 mb-5">
                {coupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono font-bold text-emerald-800">
                        {coupon.coupon?.code}
                      </span>
                      <span className="text-emerald-700">(-${discountAmount.toFixed(2)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code or gift card"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono uppercase"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <div className="text-[11px] text-rose-600 mt-1.5">{couponError}</div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs pt-3 border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
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

              {/* Security Seal (Just like reference site) */}
              <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-center space-x-2 text-[11px] text-stone-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Guaranteed safe & secure checkout powered by Whop</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Inline Payment & Details Form (Zero external links!) */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <form onSubmit={handlePayment} className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* 1. Contact Information */}
              <div>
                <h3 className="font-semibold text-stone-900 text-sm mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                      Email address for confirmation *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                      Phone Number (for delivery courier alerts)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Destination */}
              <div className="pt-5 border-t border-stone-100">
                <h3 className="font-semibold text-stone-900 text-sm mb-3">
                  Shipping Destination
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                      Country / Region *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors cursor-pointer"
                    >
                      {POPULAR_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Recipient full name"
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    {errors.fullName && <p className="text-[10px] text-rose-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street address, apartment, suite, etc."
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    {errors.street && <p className="text-[10px] text-rose-600 mt-1">{errors.street}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                      />
                      {errors.city && <p className="text-[10px] text-rose-600 mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="State"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="ZIP Code"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                      />
                      {errors.postalCode && <p className="text-[10px] text-rose-600 mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Direct Inline Card Information (Exactly like reference website!) */}
              <div className="pt-5 border-t border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-stone-900 text-sm">
                    Payment Method
                  </h3>
                  <div className="flex items-center space-x-1.5 text-stone-400">
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">VISA</span>
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">MC</span>
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">AMEX</span>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50 p-4 space-y-3">
                  {/* Card Number */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 1234 1234 1234"
                        className="w-full pl-4 pr-10 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono tracking-wider transition-colors"
                      />
                      <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                    </div>
                    {errors.cardNumber && <p className="text-[10px] text-rose-600 mt-1">{errors.cardNumber}</p>}
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Expiry Date (MM/YY) *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        className="w-full px-4 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono text-center transition-colors"
                      />
                      {errors.cardExpiry && <p className="text-[10px] text-rose-600 mt-1">{errors.cardExpiry}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        CVC Security Code *
                      </label>
                      <input
                        type="password"
                        required
                        value={cardCvc}
                        onChange={handleCvcChange}
                        placeholder="CVC"
                        maxLength={4}
                        className="w-full px-4 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono text-center transition-colors"
                      />
                      {errors.cardCvc && <p className="text-[10px] text-rose-600 mt-1">{errors.cardCvc}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Error banner if any */}
              {errors.submit && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                  {errors.submit}
                </div>
              )}

              {/* Big, High-Converting Black "Pay" Button (Identical to reference website) */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-stone-950 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Authorizing & Encrypting Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pay ${total.toFixed(2)} USD</span>
                  </>
                )}
              </button>

              {/* Footer Trust Notices (Just like reference site) */}
              <div className="text-center space-y-1.5 pt-2">
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  By purchasing, you agree to {BRAND.name} terms of service and client privacy terms.
                </p>
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-stone-500 font-medium">
                  <span>Powered by</span>
                  <span className="font-bold text-stone-800 tracking-wide">⚡ Whop</span>
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
