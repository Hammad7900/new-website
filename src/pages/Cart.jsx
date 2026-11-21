// src/pages/Cart.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag, Check } from 'lucide-react';

export const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    shippingTotal,
    finalTotal,
    appliedCoupon,
    couponError,
    applyCouponCode,
    removeCouponCode,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setIsApplying(true);
    setTimeout(() => {
      applyCouponCode(inputCode);
      setIsApplying(false);
      setInputCode('');
    }, 400);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl text-stone-900 mb-3">Your Bag is Empty</h2>
        <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-8 font-light">
          Your shopping bag currently contains no pieces. Explore our curated drop to discover handcrafted timepieces, leather goods, and acoustics.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-8 py-4 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md hover:shadow-lg"
        >
          <span>Discover Collection</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Shopping Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1">
            Review Your Selection ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xs divide-y divide-stone-100">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.vid}`} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-center space-x-4 flex-1">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-200/60"
                    />
                    <div>
                      <Link to={`/product/${item.id}`} className="font-serif font-medium text-stone-900 text-sm sm:text-base hover:text-stone-600 transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <div className="text-xs text-stone-500 mt-0.5">
                          Edition: {item.variantName}
                        </div>
                      )}
                      <div className="text-[11px] font-mono text-stone-400 mt-1">
                        REF: {item.sku}
                      </div>
                      <div className="text-xs font-semibold text-stone-900 sm:hidden mt-2">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto">
                    <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.vid, item.quantity - 1)}
                        className="p-1.5 text-stone-500 hover:text-black transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.vid, item.quantity + 1)}
                        className="p-1.5 text-stone-500 hover:text-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="hidden sm:block text-right min-w-[5rem]">
                      <div className="font-semibold text-stone-900 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id, item.vid)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Privilege Coupon Input Section */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center space-x-2 text-stone-900 font-semibold text-xs uppercase tracking-wider mb-3">
                <Tag className="w-4 h-4 text-gold-500" />
                <span>Apply Privilege Code / Voucher</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Privilege code <strong className="font-mono">{appliedCoupon.code}</strong> applied ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% OFF` : `$${appliedCoupon.value} OFF`})!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCouponCode}
                    className="text-stone-500 hover:text-rose-600 font-medium underline text-xs ml-4"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (e.g. SAVE10)"
                      className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isApplying ? 'Verifying...' : 'Apply Code'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-rose-600 font-medium">{couponError}</p>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-xl text-stone-900 pb-4 border-b border-stone-100">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Privilege Discount ({appliedCoupon.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Priority Delivery</span>
                  <span className="font-semibold text-stone-900">
                    {shippingTotal === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase tracking-wide">Complimentary</span>
                    ) : (
                      `$${shippingTotal.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Estimated Sales Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              {/* Final Total */}
              <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-900">Total</div>
                  <div className="text-[10px] text-stone-400">Includes all duties & charges</div>
                </div>
                <div className="font-serif text-2xl font-bold text-stone-950">
                  ${finalTotal.toFixed(2)} <span className="text-xs font-sans font-normal text-stone-500">USD</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-4 px-6 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-center text-[11px] text-stone-400 flex items-center justify-center space-x-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted 256-Bit SSL Payment Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
