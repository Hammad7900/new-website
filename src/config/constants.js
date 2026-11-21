// src/config/constants.js
// Central configuration for brand, pricing formula, and defaults

export const BRAND = {
  name: 'AURA Atelier & Goods',
  shortName: 'AURA',
  tagline: 'Curated Luxury. Direct Origin.',
  email: 'concierge@auraatelier.com',
  phone: '+1 (800) AURA-LUX',
};

export const PRICING = {
  retailMultiplier: 2.5,       // Wholesale cost × 2.5 = retail price
  compareMultiplier: 1.4,      // Retail × 1.4 = compare-at price (slashed)
  minRetailPrice: 25,          // Minimum retail price threshold
  freeShippingThreshold: 150,  // Free shipping above $150
  shippingCost: 12.99,         // Flat shipping below threshold
};

export const DEFAULT_SEARCH_KEYWORD = 'watch'; // High-converting fallback query

export const ADMIN_PASSWORD = 'admin123';
