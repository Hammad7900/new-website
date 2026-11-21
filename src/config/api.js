// src/config/api.js
// API Endpoints and API Key Configuration

export const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
export const CJ_AUTH_ENDPOINT = `${CJ_BASE}/authentication/getAccessToken`;
export const CJ_LIST_ENDPOINT = `${CJ_BASE}/product/listV2`;
export const CJ_DETAIL_ENDPOINT = `${CJ_BASE}/product/query`;
export const CJ_ORDER_ENDPOINT = `${CJ_BASE}/shopping/order/createOrderV2`;

// CJ API Key (Included for client-side CORS direct fallback + server proxy)
export const CJ_API_KEY = (import.meta.env.VITE_CJ_API_KEY || 'CJ5799036@api@68240b5fc55f4b8db42e75c858c29b05').trim();

// Whop checkout plan link
export const WHOP_PLAN_ID = (import.meta.env.VITE_WHOP_PLAN_ID || 'https://whop.com/dev-portfolio-services-950777/order-payment-0e').trim();
