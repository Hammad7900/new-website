// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateAndCalculateDiscount } from '../services/couponService';

const CartContext = createContext();

const CART_STORAGE_KEY = 'luxury_store_cart';
const ORDERS_STORAGE_KEY = 'luxury_store_orders';

const SAMPLE_ORDERS = [
  {
    id: 'ORD-78291',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      firstName: 'Eleanor',
      lastName: 'Vance',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '+1 (555) 234-5678',
      street: '742 Evergreen Terrace',
      city: 'Beverly Hills',
      state: 'CA',
      postalCode: '90210',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'cj-prod-001',
        name: 'AURA ChronoMaster Minimalist Automatic Watch',
        price: 189.00,
        quantity: 1,
        sku: 'CJ-WATCH-001-BLK',
        vid: 'VID-001-A',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        variantName: 'Obsidian Black / Black Strap'
      }
    ],
    subtotal: 189.00,
    discountAmount: 18.90,
    shippingTotal: 0.00,
    total: 170.10,
    couponCode: 'SAVE10',
    paymentMethod: 'Whop Checkout',
    paymentStatus: 'PAID',
    status: 'PAID', // 'PAID', 'PLACED_ON_CJ', 'FULFILLED'
    cjOrderId: null,
    cjPlacedAt: null
  },
  {
    id: 'ORD-64902',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    customer: {
      firstName: 'Alexander',
      lastName: 'Wright',
      name: 'Alexander Wright',
      email: 'alex.wright@example.com',
      phone: '+1 (555) 876-5432',
      street: '15 Central Park West, Penthouse B',
      city: 'New York',
      state: 'NY',
      postalCode: '10023',
      country: 'United States',
      countryCode: 'US'
    },
    items: [
      {
        id: 'cj-prod-002',
        name: 'The Sovereign Full-Grain Leather Weekender Bag',
        price: 249.00,
        quantity: 1,
        sku: 'CJ-BAG-002-TAN',
        vid: 'VID-002-A',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
        variantName: 'Vintage Cognac'
      },
      {
        id: 'cj-prod-008',
        name: 'Artisan Vegetable Tanned Cardholder & Money Clip',
        price: 68.00,
        quantity: 1,
        sku: 'CJ-ACC-008-BRN',
        vid: 'VID-008-A',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
        variantName: 'Cognac Saddle Brown'
      }
    ],
    subtotal: 317.00,
    discountAmount: 20.00,
    shippingTotal: 0.00,
    total: 297.00,
    couponCode: 'WELCOME20',
    paymentMethod: 'Whop Checkout',
    paymentStatus: 'PAID',
    status: 'PLACED_ON_CJ',
    cjOrderId: 'CJ9482104882',
    cjPlacedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const CartProvider = ({ children }) => {
  // Load initial cart
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load orders
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!saved) {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
        return SAMPLE_ORDERS;
      }
      return JSON.parse(saved);
    } catch {
      return SAMPLE_ORDERS;
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  // Persist orders
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist orders:', e);
    }
  }, [orders]);

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    setCartItems((prev) => {
      const vid = selectedVariant?.vid || 'default';
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.vid === vid
      );

      const price = selectedVariant?.price || product.price;
      const sku = selectedVariant?.sku || product.sku;
      const variantName = selectedVariant?.name || null;
      const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '';

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: price,
            image: image,
            sku: sku,
            vid: vid,
            variantName: variantName,
            quantity: quantity,
            stock: product.stock || 50,
          },
        ];
      }
    });
  };

  const updateQuantity = (id, vid, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id, vid);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.vid === vid) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id, vid) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.vid === vid)));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Subtotal calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Recalculate coupon discount if subtotal changes
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingTotal = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const finalTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? shippingTotal : 0));
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const applyCouponCode = (code) => {
    setCouponError('');
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return false;
    }

    const result = validateAndCalculateDiscount(code, subtotal);
    if (!result.valid) {
      setCouponError(result.error);
      return false;
    }

    setAppliedCoupon({
      ...result.coupon,
      discount: result.discount,
    });
    return true;
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Save completed order
  const saveOrder = (orderData) => {
    const newOrder = {
      id: orderData.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      customer: orderData.customer,
      items: orderData.items || cartItems,
      subtotal: orderData.subtotal ?? subtotal,
      discountAmount: orderData.discountAmount ?? discountAmount,
      shippingTotal: orderData.shippingTotal ?? shippingTotal,
      total: orderData.total ?? finalTotal,
      couponCode: appliedCoupon?.code || null,
      paymentMethod: orderData.paymentMethod || 'Whop Checkout',
      paymentStatus: 'PAID',
      status: 'PAID',
      cjOrderId: null,
      cjPlacedAt: null,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Update order status (e.g. after placing on CJ)
  const updateOrderStatus = (orderId, newStatus, cjOrderId = null) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            cjOrderId: cjOrderId || order.cjOrderId,
            cjPlacedAt: cjOrderId ? new Date().toISOString() : order.cjPlacedAt,
          };
        }
        return order;
      })
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        discountAmount,
        shippingTotal,
        finalTotal,
        appliedCoupon,
        couponError,
        applyCouponCode,
        removeCouponCode,
        orders,
        saveOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
