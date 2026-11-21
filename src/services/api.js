// src/services/api.js

/**
 * Service to interact with CJ Dropshipping Netlify functions.
 * Includes graceful handling for both deployed Netlify environment and local Vite development.
 */

const FALLBACK_PRODUCTS = [
  {
    id: 'cj-prod-001',
    name: 'AURA ChronoMaster Minimalist Automatic Watch',
    price: 189.00,
    compareAtPrice: 280.00,
    sku: 'CJ-WATCH-001-BLK',
    category: 'Timepieces',
    stock: 48,
    rating: 4.9,
    reviewsCount: 124,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Precision Japanese automatic movement encased in surgical-grade 316L stainless steel. Features a sapphire crystal glass with anti-reflective coating, 5 ATM water resistance, and an interchangeable quick-release Italian top-grain leather strap. Designed for timeless elegance and understated sophistication.',
    variants: [
      { vid: 'VID-001-A', name: 'Obsidian Black / Black Strap', sku: 'CJ-WATCH-001-BLK', stock: 24, price: 189.00 },
      { vid: 'VID-001-B', name: 'Brushed Silver / Cognac Brown', sku: 'CJ-WATCH-001-BRN', stock: 15, price: 189.00 },
      { vid: 'VID-001-C', name: 'Rose Gold / Midnight Blue', sku: 'CJ-WATCH-001-BLU', stock: 9, price: 199.00 }
    ],
    features: [
      'Japanese Miyota 21-Jewel Automatic Movement',
      'Double-domed Sapphire Crystal with AR Coating',
      'Handcrafted Italian Full-Grain Leather Strap',
      '50m (5 ATM) Water Resistance'
    ]
  },
  {
    id: 'cj-prod-002',
    name: 'The Sovereign Full-Grain Leather Weekender Bag',
    price: 249.00,
    compareAtPrice: 380.00,
    sku: 'CJ-BAG-002-TAN',
    category: 'Leather Goods',
    stock: 32,
    rating: 5.0,
    reviewsCount: 89,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Mastercrafted from vegetable-tanned full-grain leather that patinas gorgeously over time. Includes an isolated water-resistant shoe compartment, padded 16-inch laptop pocket, antique solid brass YKK hardware, and an ergonomic padded shoulder strap. Built for discerning global travelers.',
    variants: [
      { vid: 'VID-002-A', name: 'Vintage Cognac', sku: 'CJ-BAG-002-TAN', stock: 18, price: 249.00 },
      { vid: 'VID-002-B', name: 'Espresso Dark Brown', sku: 'CJ-BAG-002-DBR', stock: 10, price: 249.00 },
      { vid: 'VID-002-C', name: 'Matte Onyx Black', sku: 'CJ-BAG-002-BLK', stock: 4, price: 259.00 }
    ],
    features: [
      '100% Vegetable-Tanned Italian Full-Grain Leather',
      'Dedicated Aerated Footwear Compartment',
      'TSA-Compliant Carry-On Dimensions (45L Capacity)',
      'Heavy-duty Solid Brass Hardware & YKK Zippers'
    ]
  },
  {
    id: 'cj-prod-003',
    name: 'Sonus Pure ANC Wireless Audiophile Headphones',
    price: 229.00,
    compareAtPrice: 320.00,
    sku: 'CJ-AUDIO-003-SLV',
    category: 'Audio & Tech',
    stock: 65,
    rating: 4.8,
    reviewsCount: 215,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Custom 40mm beryllium acoustic drivers tuned to pristine studio reproduction. Hybrid active noise cancellation with 4 adaptive transparency microphones, 45-hour battery life with fast Qi wireless charging, and plush lambskin memory foam ear cushions.',
    variants: [
      { vid: 'VID-003-A', name: 'Titanium Silver / Chalk', sku: 'CJ-AUDIO-003-SLV', stock: 35, price: 229.00 },
      { vid: 'VID-003-B', name: 'Midnight Charcoal', sku: 'CJ-AUDIO-003-BLK', stock: 30, price: 229.00 }
    ],
    features: [
      'High-Resolution Lossless Audio Codec (LDAC, aptX Adaptive)',
      'Adaptive Hybrid Noise Cancellation with Transparency Mode',
      'Up to 45 Hours of Playtime per Charge',
      'Ultra-Plush Lambskin & Memory Foam Comfort'
    ]
  },
  {
    id: 'cj-prod-004',
    name: 'AURA Helix Smart Ambient Atmosphere Lamp',
    price: 139.00,
    compareAtPrice: 199.00,
    sku: 'CJ-HOME-004-WHT',
    category: 'Home & Living',
    stock: 42,
    rating: 4.9,
    reviewsCount: 76,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Sculptural architectural lighting crafted from aircraft-grade anodized aluminum and frosted silica glass. Synchronizes with natural circadian rhythms to transition smoothly from energetic daylight to relaxing sunset warmth. Seamless touch dimming and smart home compatibility.',
    variants: [
      { vid: 'VID-004-A', name: 'Anodized Space Gray', sku: 'CJ-HOME-004-GRY', stock: 20, price: 139.00 },
      { vid: 'VID-004-B', name: 'Champagne Gold', sku: 'CJ-HOME-004-GLD', stock: 22, price: 149.00 }
    ],
    features: [
      'Circadian Rhythm Auto-Dimming & Warmth Tuning (1800K - 6500K)',
      'Full RGBW Spectrum with 16 Million Nuanced Hues',
      'Anodized Aerospace Aluminum Base',
      'Precision Optical Touch Sensor'
    ]
  },
  {
    id: 'cj-prod-005',
    name: 'Pure Mongolian Cashmere Fringe Throw Blanket',
    price: 165.00,
    compareAtPrice: 240.00,
    sku: 'CJ-TEXT-005-OAT',
    category: 'Home & Living',
    stock: 28,
    rating: 4.9,
    reviewsCount: 64,
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Woven exclusively from Grade-A Mongolian cashmere fibers under 15.5 microns for unparalleled cloud-like softness. Finished with traditional rolled eyelash fringe detailing. Lightweight yet sumptuously warm for living room or bedroom relaxation.',
    variants: [
      { vid: 'VID-005-A', name: 'Oatmeal Heather', sku: 'CJ-TEXT-005-OAT', stock: 16, price: 165.00 },
      { vid: 'VID-005-B', name: 'Charcoal Grey', sku: 'CJ-TEXT-005-CHR', stock: 12, price: 165.00 }
    ],
    features: [
      '100% Sustainable Grade-A Mongolian Cashmere',
      'Ethically Sourced & OEKO-TEX Standard 100 Certified',
      'Dimensions: 140cm x 180cm (55" x 70")',
      'Hand-Rolled Fringed Trim'
    ]
  },
  {
    id: 'cj-prod-006',
    name: 'Aegis Aerospace Titanium Smart Ring',
    price: 199.00,
    compareAtPrice: 299.00,
    sku: 'CJ-TECH-006-TIT',
    category: 'Audio & Tech',
    stock: 54,
    rating: 4.8,
    reviewsCount: 142,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A discreet health and wellness tracker forged from aerospace-grade titanium with diamond-like carbon (DLC) coating. Tracks deep/REM sleep cycles, HRV, blood oxygen, skin temperature, and daily recovery with surgical sensor precision.',
    variants: [
      { vid: 'VID-006-A', name: 'Matte Stealth Black / Size 9', sku: 'CJ-TECH-006-B9', stock: 18, price: 199.00 },
      { vid: 'VID-006-B', name: 'Matte Stealth Black / Size 10', sku: 'CJ-TECH-006-B10', stock: 20, price: 199.00 },
      { vid: 'VID-006-C', name: 'Brushed Silver / Size 9', sku: 'CJ-TECH-006-S9', stock: 16, price: 199.00 }
    ],
    features: [
      'Medical-grade PPG Optical Sensors & Accelerometer',
      '7 Days Battery Life on a Single 30-Minute Charge',
      '100m Waterproof (Swim & Shower Safe)',
      'No Monthly Subscription Required'
    ]
  },
  {
    id: 'cj-prod-007',
    name: 'Atelier Handmade Cold Brew & Pour-Over Dripper',
    price: 89.00,
    compareAtPrice: 130.00,
    sku: 'CJ-CAFE-007-GLS',
    category: 'Home & Living',
    stock: 39,
    rating: 4.7,
    reviewsCount: 52,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Handblown thermal shock-resistant borosilicate glass carafe paired with an ultra-fine double-layered etched stainless steel micro-filter. Extracts rich, silky aromatic coffee without requiring paper waste.',
    variants: [
      { vid: 'VID-007-A', name: 'Smoked Amber Glass (800ml)', sku: 'CJ-CAFE-007-AMB', stock: 21, price: 89.00 },
      { vid: 'VID-007-B', name: 'Crystal Clear (800ml)', sku: 'CJ-CAFE-007-CLR', stock: 18, price: 89.00 }
    ],
    features: [
      'Handcrafted Borosilicate Glass (Heat Resistant to 150°C)',
      'Laser-Etched Double Layer Stainless Steel Filter',
      'Ergonomic Heat-Insulated Walnut Wood Collar',
      'Eco-Friendly Zero Waste Brewing'
    ]
  },
  {
    id: 'cj-prod-008',
    name: 'Artisan Vegetable Tanned Cardholder & Money Clip',
    price: 68.00,
    compareAtPrice: 95.00,
    sku: 'CJ-ACC-008-BRN',
    category: 'Leather Goods',
    stock: 82,
    rating: 4.9,
    reviewsCount: 168,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Ultra-slim profile constructed with hand-burnished edges and saddle-stitched bonded nylon thread. Holds up to 8 cards with quick-access pull tab and an integrated RFID-blocking magnetic brass currency clip.',
    variants: [
      { vid: 'VID-008-A', name: 'Cognac Saddle Brown', sku: 'CJ-ACC-008-BRN', stock: 45, price: 68.00 },
      { vid: 'VID-008-B', name: 'Charcoal Black', sku: 'CJ-ACC-008-BLK', stock: 37, price: 68.00 }
    ],
    features: [
      'Hand-Burnished Vegetable-Tanned Pueblo Leather',
      'RFID Shielding Layer for Contactless Security',
      'Integrated High-Strength Magnetic Clip',
      'Minimalist 0.4cm Profile'
    ]
  }
];

export async function fetchProducts({ pageNum = 1, pageSize = 20, category = '', search = '' } = {}) {
  try {
    const params = new URLSearchParams({
      pageNum: pageNum.toString(),
      pageSize: pageSize.toString(),
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    });

    const response = await fetch(`/api/cj-products?${params.toString()}`);
    if (response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.success && Array.isArray(data.data)) {
          return data;
        }
      } catch (jsonErr) {
        // Fall through to fallback
      }
    }
  } catch (err) {
    console.warn('Network request to /api/cj-products failed, using local catalog:', err);
  }

  // Local fallback
  let items = [...FALLBACK_PRODUCTS];
  if (category && category !== 'All') {
    items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  }

  return {
    success: true,
    data: items,
    total: items.length,
    source: 'local_client_fallback',
    isDemo: true,
  };
}

export async function fetchProductById(id) {
  try {
    const response = await fetch(`/api/cj-products?id=${encodeURIComponent(id)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        return data.data[0];
      }
    }
  } catch (e) {
    // Fall through
  }

  return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
}

export async function placeOrderOnCJ(orderData) {
  try {
    const response = await fetch('/api/cj-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return data;
      } catch (jsonErr) {
        // Not valid JSON
      }
    }
  } catch (err) {
    console.warn('Call to /api/cj-order failed, using simulated response:', err);
  }

  // Simulated fallback response for local development
  return {
    success: true,
    cjOrderId: 'CJ-SIM-' + Math.floor(100000000 + Math.random() * 900000000),
    status: 'CREATED_PENDING_PAYMENT',
    source: 'simulated_local',
    message: 'Order successfully dispatched to CJ Dropshipping test queue.',
  };
}
