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
  const [shippingRules, setShippingRules] = useState({
    baseRate: 1.0,
    additionalItemRate: 1.0,
    tier1: 1.0,
    tier2: 2.0,
    tier3: 3.0,
    tier4: 4.0,
    tier4Plus: 4.0,
    tier5: 5.0,
    tier6: 6.0,
    tier7: 7.0,
    tier8: 8.0,
    tier9: 9.0,
    tier10: 10.0,
    tierBeyond10: 1.0,
  });

  useEffect(() => {
    fetchStoreSettings()
      .then((settings) => {
        const amount = Number(settings.shippingCost);
        if (Number.isFinite(amount) && amount >= 0) setShipping(amount);
        if (settings.shippingRules && typeof settings.shippingRules === 'object') {
          const r = settings.shippingRules;
          const num = (val, fallback) => {
            if (val === undefined || val === null || val === '') return fallback;
            const n = Number(val);
            return Number.isFinite(n) ? n : fallback;
          };
          const base = num(r.tier1 ?? r.baseRate, 1.0);
          const add = num(r.tierBeyond10 ?? r.additionalItemRate, 1.0);
          setShippingRules({
            baseRate: base,
            additionalItemRate: add,
            tier1: num(r.tier1, base),
            tier2: num(r.tier2, base + add),
            tier3: num(r.tier3, base + add * 2),
            tier4: num(r.tier4 ?? r.tier4Plus, base + add * 3),
            tier4Plus: num(r.tier4 ?? r.tier4Plus, base + add * 3),
            tier5: num(r.tier5, base + add * 4),
            tier6: num(r.tier6, base + add * 5),
            tier7: num(r.tier7, base + add * 6),
            tier8: num(r.tier8, base + add * 7),
            tier9: num(r.tier9, base + add * 8),
            tier10: num(r.tier10, base + add * 9),
            tierBeyond10: add,
          });
        }
      })
      .catch((error) => console.error('[Store settings]', error));
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
    const newRules = { ...shippingRules, baseRate: amount, tier1: amount };
    await saveStoreSettings({ shippingCost: amount, shippingRules: newRules }, password);
    setShipping(amount);
    setShippingRules(newRules);
    return true;
  };

  const updateShippingRules = async (rules) => {
    const password = sessionStorage.getItem('aura_admin_password') || '';
    const base = Number(rules.tier1 ?? rules.baseRate ?? 1.0);
    const add = Number(rules.tierBeyond10 ?? rules.additionalItemRate ?? 1.0);

    const cleanRules = {
      baseRate: base,
      additionalItemRate: add,
      tier1: base,
      tier2: Number(rules.tier2) ?? (base + add),
      tier3: Number(rules.tier3) ?? (base + add * 2),
      tier4: Number(rules.tier4 ?? rules.tier4Plus) ?? (base + add * 3),
      tier5: Number(rules.tier5) ?? (base + add * 4),
      tier6: Number(rules.tier6) ?? (base + add * 5),
      tier7: Number(rules.tier7) ?? (base + add * 6),
      tier8: Number(rules.tier8) ?? (base + add * 7),
      tier9: Number(rules.tier9) ?? (base + add * 8),
      tier10: Number(rules.tier10) ?? (base + add * 9),
      tierBeyond10: Number(rules.tierBeyond10) ?? add,
      tier4Plus: Number(rules.tier4 ?? rules.tier4Plus) ?? (base + add * 3),
    };

    await saveStoreSettings({ shippingRules: cleanRules, shippingCost: cleanRules.baseRate }, password);
    setShippingRules(cleanRules);
    setShipping(cleanRules.baseRate);
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

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Dynamic 10-Tier Multi-Item Shipping Calculation
  // 1 Item = tier1 ($1.00)
  // 2 Items = tier2 ($2.00)
  // ...
  // 10 Items = tier10 ($10.00)
  // 11+ Items = tier10 + (count - 10) * tierBeyond10
  const calculateShipping = () => {
    if (itemCount === 0) return 0;
    const base = Number(shippingRules.tier1 ?? shippingRules.baseRate ?? shipping ?? 1.0);
    const extra = Number(shippingRules.tierBeyond10 ?? shippingRules.additionalItemRate ?? 1.0);

    if (itemCount === 1) return Number(shippingRules.tier1 ?? base);
    if (itemCount === 2) return Number(shippingRules.tier2 ?? (base + extra));
    if (itemCount === 3) return Number(shippingRules.tier3 ?? (base + extra * 2));
    if (itemCount === 4) return Number(shippingRules.tier4 ?? shippingRules.tier4Plus ?? (base + extra * 3));
    if (itemCount === 5) return Number(shippingRules.tier5 ?? (base + extra * 4));
    if (itemCount === 6) return Number(shippingRules.tier6 ?? (base + extra * 5));
    if (itemCount === 7) return Number(shippingRules.tier7 ?? (base + extra * 6));
    if (itemCount === 8) return Number(shippingRules.tier8 ?? (base + extra * 7));
    if (itemCount === 9) return Number(shippingRules.tier9 ?? (base + extra * 8));
    if (itemCount === 10) return Number(shippingRules.tier10 ?? (base + extra * 9));

    // 11 or more items:
    const tier10Val = Number(shippingRules.tier10 ?? (base + extra * 9));
    return tier10Val + (itemCount - 10) * extra;
  };

  const shippingTotal = calculateShipping();
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = Math.min(subtotal, coupon?.discount || 0);
  const total = Math.max(0, subtotal - discountAmount + shippingTotal);

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
        updateShippingRules,
        shippingRules,
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
