// src/config/api.js
// Whop checkout credentials & endpoints

export const WHOP_PLAN_ID = (import.meta.env.VITE_WHOP_PLAN_ID || 'plan_Nw9OfcyHAA0zJ').trim();
export const WHOP_CHECKOUT_URL = (import.meta.env.VITE_WHOP_CHECKOUT_URL || 'https://whop.com/checkout/plan_Nw9OfcyHAA0zJ').trim();
export const WHOP_PRODUCT_URL = (import.meta.env.VITE_WHOP_PRODUCT_URL || 'https://whop.com/dev-portfolio-services-950777/order-payment-0e/').trim();
