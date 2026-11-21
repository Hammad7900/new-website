// src/pages/store/Cart.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, X, Truck, Shield } from 'lucide-react';

export const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    coupon,
    subtotal,
    shipping,
    discountAmount,
    total,
    itemCount,
  } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    const result = await applyCoupon(couponInput.trim(), subtotal);
    if (result.success) {
      setCouponSuccess(`Coupon applied! You save $${result.discount.toFixed(2)}`);
      setCouponInput('');
    } else {
      setCouponError(result.error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-9 h-9 text-stone-400" />
        </div>
        <h2 className="font-serif text-2xl text-stone-900 mb-2">Your cart is empty</h2>
        <p className="text-xs text-stone-500 mb-8">
          Discover our curated collection and add pieces you love.
        </p>
        <Link
          to="/"
          className="px-8 py-3.5 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-full transition-colors shadow-md"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Your Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1">
            Shopping Cart <span className="text-stone-400 text-2xl">({itemCount})</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartKey}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-center gap-5 shadow-xs"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60 shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-stone-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 text-sm line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {item.variant || 'Variant not specified'}
                  </div>
                  <div className="text-xs font-mono text-stone-400 mt-0.5">
                    SKU: {item.sku}
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-stone-600" />
                    </button>
                    <span className="font-semibold text-stone-900 w-5 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-stone-600" />
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-serif font-semibold text-stone-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    ${item.price.toFixed(2)} each
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartKey)}
                    aria-label="Remove item"
                    className="mt-2 p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="space-y-5">
            {/* Coupon Code Card */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
              <h3 className="font-semibold text-stone-900 text-sm mb-3 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Discount Code</span>
              </h3>
              {coupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div>
                    <span className="font-mono font-bold text-emerald-800 text-xs">
                      {coupon.coupon?.code}
                    </span>
                    <div className="text-[11px] text-emerald-600">
                      -${discountAmount.toFixed(2)} savings applied
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    aria-label="Remove coupon"
                    className="p-1 text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 mt-1.5">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 mt-1.5">{couponSuccess}</p>
                  )}
                </>
              )}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
              <h3 className="font-semibold text-stone-900 text-sm mb-4">
                Order Summary
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Shipping</span>
                  </span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-semibold">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between items-center">
                <span className="font-serif text-lg text-stone-900">Total</span>
                <span className="font-serif text-2xl font-semibold text-stone-900">
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 py-4 bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 mt-3 text-[11px] text-stone-400">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
