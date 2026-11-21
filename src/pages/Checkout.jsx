// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { WhopCheckoutEmbed } from '../components/WhopCheckoutEmbed';
import {
  ShieldCheck,
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Lock
} from 'lucide-react';

export const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    discountAmount,
    shippingTotal,
    finalTotal,
    appliedCoupon,
    saveOrder,
  } = useCart();

  const [customer, setCustomer] = useState({
    firstName: 'Harrison',
    lastName: 'Ford',
    email: 'harrison.atelier@example.com',
    phone: '+1 (555) 019-2834',
    street: '450 Park Avenue, Suite 1800',
    city: 'New York',
    state: 'NY',
    postalCode: '10022',
    country: 'United States',
    countryCode: 'US',
  });

  const [isCompleted, setIsCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (cartItems.length === 0 && !isCompleted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center">
        <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-stone-900 mb-2">No Items in Checkout</h2>
        <p className="text-stone-500 text-xs mb-6">Your bag is currently empty. Please add items before checking out.</p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-stone-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentComplete = (paymentResult) => {
    const orderData = {
      customer: {
        ...customer,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
      },
      items: cartItems,
      subtotal,
      discountAmount,
      shippingTotal,
      total: finalTotal,
      paymentMethod: 'Verified Card Gateway',
      paymentDetails: paymentResult,
      shippingAddress: {
        street: customer.street,
        city: customer.city,
        state: customer.state,
        zip: customer.postalCode,
        country: customer.country,
        countryCode: customer.countryCode,
      },
    };

    const newOrder = saveOrder(orderData);
    setCompletedOrder(newOrder);
    setIsCompleted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SUCCESS CONFIRMATION VIEW
  if (isCompleted && completedOrder) {
    return (
      <div className="min-h-screen py-16 sm:py-24 bg-[#faf8f5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-12 shadow-md text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Payment Confirmed & Verified
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-4 mb-2">
              Thank You For Your Order
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm max-w-lg mx-auto mb-8 font-light leading-relaxed">
              We have received your payment. Your receipt and consignment tracking updates will be dispatched to{' '}
              <strong className="text-stone-800">{completedOrder.customer.email}</strong>.
            </p>

            {/* Order Reference Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-8 text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold block">Order Reference</span>
                  <span className="font-mono font-bold text-stone-900 text-sm sm:text-base">{completedOrder.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold block">Fulfillment Status</span>
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Paid (Processing Dispatch)
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-600">
                <span className="font-semibold text-stone-800">Dispatch Address:</span> {completedOrder.customer.street}, {completedOrder.customer.city}, {completedOrder.customer.state} {completedOrder.customer.postalCode}, {completedOrder.customer.country}
              </div>

              <div className="pt-2 text-xs">
                <span className="font-semibold text-stone-800">Ordered Pieces:</span>
                <ul className="mt-1.5 space-y-1">
                  {completedOrder.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between text-stone-600">
                      <span>• {it.name} (Qty: {it.quantity})</span>
                      <span className="font-semibold text-stone-900">${(it.price * it.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between font-serif font-bold text-base text-stone-900">
                <span>Total Paid:</span>
                <span>${completedOrder.total.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-8 py-3.5 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
              >
                Continue Exploring
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Secure Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1">
            Shipping & Payment
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Customer Details & Payment */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="font-serif text-xl text-stone-900 mb-5 flex items-center justify-between">
                <span>1. Contact & Dispatch Address</span>
                <span className="text-xs font-sans font-medium text-stone-400">Step 1 of 2</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={customer.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={customer.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={customer.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Phone Number (For Priority Delivery SMS)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={customer.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Street Address & Suite
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={customer.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={customer.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      State / Region
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={customer.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={customer.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Embed Section */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-stone-900 flex items-center justify-between">
                <span>2. Payment Method</span>
                <span className="text-xs font-sans font-medium text-stone-400">Step 2 of 2</span>
              </h3>

              <WhopCheckoutEmbed
                total={finalTotal}
                customerInfo={customer}
                onComplete={handlePaymentComplete}
              />
            </div>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-xl text-stone-900 pb-4 border-b border-stone-100">
                Consignment Summary ({cartItems.length})
              </h3>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.vid}`} className="flex items-center space-x-3.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200/60"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-stone-900 text-xs truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-mono">
                        Qty: {item.quantity} • REF: {item.sku}
                      </p>
                    </div>
                    <div className="text-right text-xs font-semibold text-stone-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Privilege Code ({appliedCoupon.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Priority Courier Delivery</span>
                  <span className="font-medium text-stone-900">
                    {shippingTotal === 0 ? 'Complimentary' : `$${shippingTotal.toFixed(2)}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="font-bold uppercase tracking-wider text-xs text-stone-900">Total Due</span>
                  <span className="font-serif text-2xl font-bold text-stone-950">${finalTotal.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
