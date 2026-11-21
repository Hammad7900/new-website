// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateCoupon } from '../services/couponService';
import { PRICING } from '../config/constants';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aura_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aura_orders') || '[]');
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('aura_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCartItems((prev) => {
      const key = variant ? `${product.id}-${variant.vid}` : product.id;
      const existing = prev.find((i) => i.cartKey === key);

      if (existing) {
        return prev.map((i) =>
          i.cartKey === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }

      return [
        ...prev,
        {
          cartKey: key,
          id: product.id,
          name: product.name,
          price: variant?.price || product.price,
          image: product.images?.[0] || '',
          sku: variant?.sku || product.sku,
          vid: variant?.vid || product.variants?.[0]?.vid || '',
          variant: variant?.name || 'Standard',
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCartItems([]);

  const applyCoupon = (code, currentSubtotal) => {
    const result = validateCoupon(code, currentSubtotal);
    if (result.valid) {
      setCoupon(result);
      return { success: true, discount: result.discount, coupon: result.coupon };
    }
    return { success: false, error: result.error };
  };

  const removeCoupon = () => setCoupon(null);

  const saveOrder = (orderData) => {
    const order = {
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'PAID',
      ...orderData,
    };
    setOrders((prev) => [order, ...prev]);
    clearCart();
    setCoupon(null);
    return order;
  };

  const updateOrderStatus = (orderId, status, cjOrderId = null) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, ...(cjOrderId ? { cjOrderId } : {}) }
          : o
      )
    );
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    subtotal >= PRICING.freeShippingThreshold
      ? 0
      : cartItems.length > 0
      ? PRICING.shippingCost
      : 0;
  const discountAmount = coupon?.discount || 0;
  const total = Math.max(0, subtotal - discountAmount + shipping);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        saveOrder,
        updateOrderStatus,
        subtotal,
        shipping,
        discountAmount,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
