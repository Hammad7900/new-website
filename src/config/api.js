// src/config/api.js
// CJ credentials remain on the PHP server.
// Whop checkout URL (the amount is configured in Whop).
export const WHOP_CHECKOUT_URL = (import.meta.env.VITE_WHOP_CHECKOUT_URL || import.meta.env.VITE_WHOP_PLAN_ID || '').trim();
