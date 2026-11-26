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
  // Dynamic plan creation is used — these are only kept as reference IDs
  planId: 'plan_Nw9OfcyHAA0zJ',
  checkoutUrl: null, // Always use dynamic plan — never use fixed $1 plan
  productUrl: 'https://whop.com/dev-portfolio-services-950777/order-payment-0e/',
  apiKey: 'apik_J6aTnjsiggCFX_C8592368_C_58defc2d1f80a9c074d06c70a72fc4f60922cad7677484572e601ca96bef97',
  accountId: 'biz_0DSMZeYhX5GeRy',
  productId: 'prod_8lUVRU6hM1Bdo',
};

export const DEFAULT_SEARCH_KEYWORD = '';
