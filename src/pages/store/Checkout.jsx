// src/pages/store/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { WHOP_PLAN_ID } from '../../config/api';
import { WhopCheckoutEmbed } from '../../components/WhopCheckoutEmbed';
import { Shield, Lock, CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';

const FormField = ({ label, name, type = 'text', value, onChange, required, placeholder, half }) => (
  <div className={half ? 'col-span-1' : 'col-span-2'}>
    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
      {label}{required && ' *'}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder || ''}
      className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
    />
  </div>
);

export const Checkout = () => {
  const { cartItems, subtotal, shipping, discountAmount, total, coupon, saveOrder } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  // All fields initialize completely empty (clean placeholders only)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validateDetails = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.street.trim()) errs.street = 'Street address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.country.trim()) errs.country = 'Country is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (validateDetails()) {
      setStep('payment');
    }
  };

  const handlePaymentComplete = (paymentData = {}) => {
    const order = saveOrder({
      customer: form,
      shippingAddress: {
        street: form.street,
        city: form.city,
        state: form.state,
        zip: form.postalCode,
        country: form.country,
        countryCode: 'US',
      },
      items: cartItems.map((it) => ({
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
      paymentMethod: paymentData.method || 'Encrypted Card Checkout',
    });
    setConfirmedOrderId(order.id);
    setStep('success');
  };

  if (cartItems.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center bg-[#faf8f5]">
        <div>
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-stone-800 mb-3">Your cart is empty</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-black transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#faf8f5]">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="font-serif text-3xl text-stone-900 mb-2">Order Confirmed</h2>
          <p className="text-stone-500 text-sm mb-4">
            Thank you, <strong>{form.name}</strong>. Your order{' '}
            <span className="font-mono font-bold text-stone-900">{confirmedOrderId}</span> has been
            placed successfully.
          </p>
          <p className="text-xs text-stone-400 mb-8">
            An order confirmation and delivery tracking information will be sent to{' '}
            <strong>{form.email}</strong>.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-2xl transition-colors shadow-md"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Secure Settlement
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-3">
            {step === 'details' ? (
              <form
                onSubmit={handleProceedToPayment}
                className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs"
              >
                <h2 className="font-serif text-xl text-stone-900 mb-6">
                  Shipping Destination
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. John Doe"
                  />
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="e.g. john@example.com"
                  />
                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 (555) 012-3456"
                  />
                  <FormField
                    label="Street Address"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 123 Fashion Blvd, Apt 4B"
                  />
                  <FormField
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. New York"
                    half
                  />
                  <FormField
                    label="State / Province"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="e.g. NY"
                    half
                  />
                  <FormField
                    label="Postal / ZIP Code"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="e.g. 10001"
                    half
                  />
                  <FormField
                    label="Country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    placeholder="e.g. United States"
                    half
                  />
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                    {Object.values(errors).join(' • ')}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-6 py-4 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="font-serif text-xl text-stone-900 mb-2">
                  Payment Authorization
                </h2>
                <p className="text-xs text-stone-500 mb-6">
                  Complete your secure transaction to dispatch order #{cartItems.length} items.
                </p>

                <WhopCheckoutEmbed
                  planId={WHOP_PLAN_ID}
                  total={total}
                  onComplete={handlePaymentComplete}
                />

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="mt-6 text-xs text-stone-500 hover:text-stone-900 underline block"
                >
                  ← Edit shipping address
                </button>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs sticky top-6">
              <h3 className="font-serif text-lg text-stone-900 mb-5">
                Summary ({cartItems.length} pieces)
              </h3>
              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 relative">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-stone-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-stone-800 line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-400">{item.variant}</div>
                    </div>
                    <div className="text-xs font-semibold text-stone-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
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
                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-semibold">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                  <span className="font-serif text-base text-stone-900">Total</span>
                  <span className="font-serif text-xl font-semibold text-stone-900">
                    ${total.toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center space-x-1.5 text-[11px] text-stone-400">
                <Shield className="w-3 h-3" />
                <span>256-bit Bank Grade Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
