import { checkCoupon, createAdminCoupon, getAdminCoupons, removeAdminCoupon } from './api';

export const getCoupons = () => getAdminCoupons();
export const addCoupon = (coupon) => createAdminCoupon(coupon);
export const deleteCoupon = (code) => removeAdminCoupon(code);
export const validateCoupon = (code, subtotal) => checkCoupon(code, subtotal);
