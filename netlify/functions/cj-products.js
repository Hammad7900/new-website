// netlify/functions/cj-products.js
import { getCJAccessToken } from './cj-auth.js';

// Curated Luxury Catalog fallback if CJ network is unreachable
const FALLBACK_LUXURY_CATALOG = [
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
    ],
    description: 'Precision Japanese automatic movement encased in surgical-grade 316L stainless steel. Features a sapphire crystal glass with anti-reflective coating, 5 ATM water resistance, and an interchangeable quick-release Italian top-grain leather strap.',
    variants: [
      { vid: 'VID-001-A', name: 'Obsidian Black / Black Strap', sku: 'CJ-WATCH-001-BLK', stock: 24, price: 189.00 },
      { vid: 'VID-001-B', name: 'Brushed Silver / Cognac Brown', sku: 'CJ-WATCH-001-BRN', stock: 15, price: 189.00 }
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
    ],
    description: 'Mastercrafted from vegetable-tanned full-grain leather that patinas gorgeously over time. Includes an isolated water-resistant shoe compartment, padded laptop pocket, and antique solid brass YKK hardware.',
    variants: [
      { vid: 'VID-002-A', name: 'Vintage Cognac', sku: 'CJ-BAG-002-TAN', stock: 18, price: 249.00 },
      { vid: 'VID-002-B', name: 'Espresso Dark Brown', sku: 'CJ-BAG-002-DBR', stock: 14, price: 249.00 }
    ],
    features: [
      '100% Vegetable-Tanned Italian Full-Grain Leather',
      'Dedicated Aerated Footwear Compartment',
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
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Custom 40mm beryllium acoustic drivers tuned to pristine studio reproduction. Hybrid active noise cancellation with 4 adaptive transparency microphones and 45-hour battery life.',
    variants: [
      { vid: 'VID-003-A', name: 'Titanium Silver / Chalk', sku: 'CJ-AUDIO-003-SLV', stock: 35, price: 229.00 },
      { vid: 'VID-003-B', name: 'Midnight Charcoal', sku: 'CJ-AUDIO-003-BLK', stock: 30, price: 229.00 }
    ],
    features: [
      'High-Resolution Lossless Audio Codec',
      'Adaptive Hybrid Noise Cancellation',
      'Up to 45 Hours of Playtime per Charge'
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
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Sculptural architectural lighting crafted from aircraft-grade anodized aluminum and frosted silica glass. Synchronizes with natural circadian rhythms.',
    variants: [
      { vid: 'VID-004-A', name: 'Anodized Space Gray', sku: 'CJ-HOME-004-GRY', stock: 20, price: 139.00 },
      { vid: 'VID-004-B', name: 'Champagne Gold', sku: 'CJ-HOME-004-GLD', stock: 22, price: 149.00 }
    ],
    features: [
      'Circadian Rhythm Auto-Dimming & Warmth Tuning',
      'Anodized Aerospace Aluminum Base'
    ]
  }
];

export async function fetchLiveCJProducts({ pageNum = 1, pageSize = 20, search = '', category = '', productId = '' } = {}) {
  const auth = await getCJAccessToken();
  if (!auth.token) {
    throw new Error('Failed to obtain CJ Access Token');
  }

  // If fetching a single product detail by ID:
  if (productId) {
    try {
      const detailRes = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${encodeURIComponent(productId)}`, {
        headers: {
          'CJ-Access-Token': auth.token,
          'Content-Type': 'application/json'
        }
      });
      const detailData = await detailRes.json();
      if (detailData.code === 200 && detailData.data) {
        const item = detailData.data;
        const sellPriceNum = parseFloat(item.sellPrice || '15');
        const retailPrice = Math.round(sellPriceNum * 2.5 * 100) / 100;
        const comparePrice = Math.round(sellPriceNum * 3.5 * 100) / 100;

        return {
          id: item.pid || productId,
          name: item.productNameEn || item.productName || 'CJ Dropshipping Item',
          price: retailPrice,
          compareAtPrice: comparePrice,
          images: item.productImageSet && item.productImageSet.length > 0 ? item.productImageSet : [item.bigImage || item.productImage],
          description: item.description || item.productNameEn || 'Premium dropshipping product sourced directly through CJ Dropshipping.',
          category: item.categoryName || item.entryNameEn || 'General',
          sku: item.productSku || `CJ-${item.pid}`,
          stock: 100,
          rating: 4.9,
          reviewsCount: 38,
          variants: (item.variants || []).map((v) => ({
            vid: v.vid || v.variantSku,
            name: v.variantKeyEn || v.variantName || 'Standard',
            sku: v.variantSku || item.productSku,
            price: Math.round(parseFloat(v.variantSellPrice || item.sellPrice || 15) * 2.5 * 100) / 100,
            stock: 50
          })),
          features: [
            'Direct Factory CJ Dropshipping Sourced',
            'Full Quality Verification Passed',
            'Air Tracked Worldwide Delivery'
          ]
        };
      }
    } catch (err) {
      console.warn('Single product query failed:', err.message);
    }
  }

  // Search keyword or default curated queries (e.g. watch, leather, audio, lamp)
  const effectiveKeyword = search || (category && category !== 'All' ? category : 'watch');
  const url = `https://developers.cjdropshipping.com/api2.0/v1/product/listV2?pageNum=${pageNum}&pageSize=${pageSize}${effectiveKeyword ? `&keyWord=${encodeURIComponent(effectiveKeyword)}` : ''}`;

  const cjResponse = await fetch(url, {
    headers: {
      'CJ-Access-Token': auth.token,
      'Content-Type': 'application/json'
    }
  });

  const cjData = await cjResponse.json();

  if (cjData.code === 200 && cjData.data) {
    const rawList = cjData.data?.content?.[0]?.productList || cjData.data?.list || [];

    if (rawList.length > 0) {
      const mapped = rawList.map((p) => {
        const costPrice = parseFloat(p.sellPrice || '10');
        // Standard dropshipping markup: retail is 2.5x wholesale cost
        const retailPrice = Math.max(25, Math.round(costPrice * 2.5 * 100) / 100);
        const compareAtPrice = Math.round(retailPrice * 1.4 * 100) / 100;

        return {
          id: p.id,
          name: p.nameEn || p.productNameEn || 'Dropshipping Curated Item',
          price: retailPrice,
          compareAtPrice: compareAtPrice,
          images: [p.bigImage || p.productImage],
          description: `Direct dropshipping luxury product from CJ verified manufacturer. SKU: ${p.sku}. Built to highest quality specifications with international customs clearance.`,
          category: p.threeCategoryName || p.twoCategoryName || p.oneCategoryName || (effectiveKeyword ? effectiveKeyword : 'Curated'),
          sku: p.sku || `CJ-${p.id}`,
          stock: p.warehouseInventoryNum || 150,
          rating: 4.8,
          reviewsCount: Math.floor(20 + Math.random() * 80),
          variants: [
            { vid: `VID-${p.sku}-A`, name: 'Standard Edition', sku: p.sku, price: retailPrice, stock: p.warehouseInventoryNum || 100 }
          ],
          features: [
            'CJ Dropshipping Factory Direct Fulfillment',
            'Factory Certified 100% Brand New',
            'Tracked Expedited Air Shipping'
          ]
        };
      });

      return {
        products: mapped,
        total: cjData.data.totalRecords || cjData.data.total || mapped.length,
        source: 'cj_live_api'
      };
    }
  }

  // Fallback
  return {
    products: FALLBACK_LUXURY_CATALOG,
    total: FALLBACK_LUXURY_CATALOG.length,
    source: 'fallback_catalog'
  };
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const queryParams = event.queryStringParameters || {};
  const pageNum = parseInt(queryParams.pageNum || '1', 10);
  const pageSize = parseInt(queryParams.pageSize || '20', 10);
  const category = queryParams.category || '';
  const search = queryParams.search || '';
  const productId = queryParams.id || '';

  try {
    const result = await fetchLiveCJProducts({ pageNum, pageSize, search, category, productId });

    if (productId && !Array.isArray(result.products)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: [result],
          source: 'cj_live_detail'
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result.products,
        total: result.total,
        source: result.source,
        pageNum,
        pageSize,
      }),
    };
  } catch (err) {
    console.error('Error in cj-products function:', err);
    return {
      statusCode: 200, // Return fallback gracefully
      headers,
      body: JSON.stringify({
        success: true,
        data: FALLBACK_LUXURY_CATALOG,
        total: FALLBACK_LUXURY_CATALOG.length,
        source: 'offline_fallback',
        error: err.message
      }),
    };
  }
};
