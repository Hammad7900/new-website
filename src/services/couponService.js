// src/services/couponService.js
/**
 * Coupon Management & Discount Calculation Engine
 * Inspired by @koia-ai/koia-eshop-sdk discount specifications
 */

const STORAGE_KEY = 'luxury_store_coupons';

const DEFAULT_COUPONS = [
  {
    code: 'SAVE10',
    type: 'percentage', // 'percentage' | 'fixed'
    value: 10, // 10% off
    expiryDate: '2028-12-31',
    description: '10% discount on entire cart',
    active: true,
  },
  {
    code: 'WELCOME20',
    type: 'fixed', // $20 off
    value: 20,
    expiryDate: '2028-12-31',
    description: '$20 off on your first order',
    active: true,
  },
  {
    code: 'LUXURY15',
    type: 'percentage',
    value: 15,
    expiryDate: '2028-12-31',
    description: '15% VIP member privilege',
    active: true,
  }
];

export const getStoredCoupons = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse coupons from localStorage', e);
    return DEFAULT_COUPONS;
  }
};

export const saveCoupons = (coupons) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  } catch (e) {
    console.error('Failed to save coupons to localStorage', e);
  }
};

export const addCoupon = (newCoupon) => {
  const coupons = getStoredCoupons();
  const normalizedCode = newCoupon.code.trim().toUpperCase();
  
  if (coupons.some((c) => c.code.toUpperCase() === normalizedCode)) {
    throw new Error(`Coupon code "${normalizedCode}" already exists.`);
  }

  const updated = [
    ...coupons,
    {
      ...newCoupon,
      code: normalizedCode,
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];
  saveCoupons(updated);
  return updated;
};

export const deleteCoupon = (code) => {
  const coupons = getStoredCoupons();
  const updated = coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
  saveCoupons(updated);
  return updated;
};

export const validateAndCalculateDiscount = (couponCode, subtotal) => {
  if (!couponCode) return { valid: false, discount: 0, error: null };

  const coupons = getStoredCoupons();
  const normalized = couponCode.trim().toUpperCase();
  const found = coupons.find((c) => c.code.toUpperCase() === normalized);

  if (!found) {
    return { valid: false, discount: 0, error: 'Invalid coupon code.' };
  }

  if (found.expiryDate) {
    const expiry = new Date(found.expiryDate);
    // End of expiry day
    expiry.setHours(23, 59, 59, 999);
    if (new Date() > expiry) {
      return { valid: false, discount: 0, error: 'This coupon code has expired.' };
    }
  }

  let discount = 0;
  if (found.type === 'percentage') {
    discount = (subtotal * found.value) / 100;
  } else if (found.type === 'fixed') {
    discount = Math.min(found.value, subtotal);
  }

  return {
    valid: true,
    coupon: found,
    discount: Math.round(discount * 100) / 100,
    error: null,
  };
};
