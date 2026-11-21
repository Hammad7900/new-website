// src/services/couponService.js
// Client-side discount code manager backed by localStorage

const STORAGE_KEY = 'aura_coupons';

const DEFAULT_COUPONS = [
  { code: 'SAVE10', type: 'percentage', value: 10, expiry: '2027-12-31', createdAt: new Date().toISOString() },
  { code: 'WELCOME20', type: 'fixed', value: 20, expiry: '2027-12-31', createdAt: new Date().toISOString() },
  { code: 'LUXURY15', type: 'percentage', value: 15, expiry: '2027-12-31', createdAt: new Date().toISOString() },
];

function loadCoupons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COUPONS));
  return DEFAULT_COUPONS;
}

function saveCoupons(coupons) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
}

export function getCoupons() {
  return loadCoupons();
}

export function addCoupon(coupon) {
  const coupons = loadCoupons();
  if (coupons.some((c) => c.code.toUpperCase() === coupon.code.toUpperCase())) {
    throw new Error('A coupon with this code already exists.');
  }
  const updated = [
    ...coupons,
    {
      ...coupon,
      code: coupon.code.toUpperCase().trim(),
      createdAt: new Date().toISOString(),
    },
  ];
  saveCoupons(updated);
  return updated;
}

export function deleteCoupon(code) {
  const updated = loadCoupons().filter((c) => c.code !== code);
  saveCoupons(updated);
  return updated;
}

export function validateCoupon(code, subtotal) {
  const coupons = loadCoupons();
  const found = coupons.find((c) => c.code === code.trim().toUpperCase());

  if (!found) {
    return { valid: false, error: 'Invalid coupon code.' };
  }

  if (new Date(found.expiry) < new Date()) {
    return { valid: false, error: 'This coupon has expired.' };
  }

  let discount = 0;
  if (found.type === 'percentage') {
    discount = Math.round(((subtotal * found.value) / 100) * 100) / 100;
  } else {
    discount = Math.min(found.value, subtotal);
  }

  return {
    valid: true,
    coupon: found,
    discount,
  };
}
