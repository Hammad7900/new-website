// src/config/constants.js
// Central configuration for brand, pricing formula, Whop payment, and defaults

export const BRAND = {
  name: 'AURA Atelier & Goods',
  shortName: 'AURA',
  tagline: 'Curated Luxury. Direct Origin.',
  email: 'concierge@auraatelier.com',
  phone: '+1 (800) AURA-LUX',
};

export const PRICING = {
  retailMultiplier: 0,
  compareMultiplier: 1.4,
  minRetailPrice: 0,
  shippingCost: 1.00,
};

export const WHOP = {
  planId: 'plan_Nw9OfcyHAA0zJ',
  checkoutUrl: 'https://whop.com/checkout/plan_Nw9OfcyHAA0zJ',
  productUrl: 'https://whop.com/dev-portfolio-services-950777/order-payment-0e/',
};

export const DEFAULT_SEARCH_KEYWORD = '';
