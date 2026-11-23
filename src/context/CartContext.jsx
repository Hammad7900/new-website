// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateCoupon } from '../services/couponService';
import { PRICING } from '../config/constants';
import { createStoreOrder, fetchStoreSettings, getAdminOrders, saveStoreSettings, updateAdminOrder } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aura_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState([]);

  const [coupon, setCoupon] = useState(null);
  const [shipping, setShipping] = useState(PRICING.shippingCost);

  useEffect(() => {
    fetchStoreSettings().then((settings) => {
      const amount = Number(settings.shippingCost);
      if (Number.isFinite(amount) && amount >= 0) setShipping(amount);
    }).catch((error) => console.error('[Store settings]', error));
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
          price: variant?.price ?? product.price,
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

  const applyCoupon = async (code, currentSubtotal) => {
    try {
      const result = await validateCoupon(code, currentSubtotal);
      setCoupon(result);
      return { success: true, discount: result.discount, coupon: result.coupon };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeCoupon = () => setCoupon(null);
  const updateShippingCost = async (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) throw new Error('Enter a valid shipping fee.');
    const password = sessionStorage.getItem('aura_admin_password') || '';
    await saveStoreSettings({ shippingCost: amount }, password);
    setShipping(amount);
    return true;
  };

  const saveOrder = async (orderData) => {
    const order = await createStoreOrder(orderData);
    setOrders((prev) => [order, ...prev]);
    clearCart();
    setCoupon(null);
    return order;
  };

  const refreshOrders = async () => {
    const current = await getAdminOrders();
    setOrders(current);
    return current;
  };

  const updateOrderStatus = async (orderId, status, cjOrderId = null) => {
    await updateAdminOrder(orderId, status, cjOrderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, ...(cjOrderId ? { cjOrderId } : {}) }
          : o
      )
    );
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingTotal = cartItems.length ? shipping : 0;
  const discountAmount = Math.min(subtotal, coupon?.discount || 0);
  const total = Math.max(0, subtotal - discountAmount + shippingTotal);
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
        updateShippingCost,
        saveOrder,
        refreshOrders,
        updateOrderStatus,
        subtotal,
        shipping: shippingTotal,
        shippingRate: shipping,
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
