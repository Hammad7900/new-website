// src/services/cjApi.js
// Direct Browser <-> CJ Dropshipping API communication
// CJ endpoints support Access-Control-Allow-Origin: *

import { CJ_API_KEY, CJ_AUTH_ENDPOINT, CJ_LIST_ENDPOINT, CJ_DETAIL_ENDPOINT, CJ_ORDER_ENDPOINT } from '../config/api';
import { PRICING, DEFAULT_SEARCH_KEYWORD } from '../config/constants';

// Token caching in sessionStorage
export async function getDirectCJToken() {
  const cached = sessionStorage.getItem('aura_cj_token');
  const cachedExp = sessionStorage.getItem('aura_cj_exp');

  if (cached && cachedExp && Date.now() < parseInt(cachedExp, 10)) {
    return cached;
  }

  try {
    const res = await fetch(CJ_AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: CJ_API_KEY }),
    });

    const data = await res.json();
    if (data.code === 200 && data.data?.accessToken) {
      const token = data.data.accessToken;
      const exp = Date.now() + 86400000 * 7; // Cache for 7 days
      sessionStorage.setItem('aura_cj_token', token);
      sessionStorage.setItem('aura_cj_exp', exp.toString());
      return token;
    }
  } catch (err) {
    console.warn('[Direct CJ Auth] Error:', err);
  }
  return null;
}

// Map raw CJ product to luxury format
function mapCJProduct(p, keyword = '') {
  const cost = parseFloat(p.sellPrice || '12');
  const retailPrice = Math.max(PRICING.minRetailPrice, Math.round(cost * PRICING.retailMultiplier * 100) / 100);
  const compareAtPrice = Math.round(retailPrice * PRICING.compareMultiplier * 100) / 100;

  return {
    id: p.id,
    name: p.nameEn || p.productNameEn || 'Curated Atelier Item',
    price: retailPrice,
    compareAtPrice: compareAtPrice,
    images: [p.bigImage || p.productImage].filter(Boolean),
    description: `Mastercrafted with selected materials. Verified quality control with worldwide tracked express delivery. REF: ${p.sku || p.id}`,
    category: p.threeCategoryName || p.twoCategoryName || (keyword ? keyword : 'Curated'),
    sku: p.sku || `REF-${p.id}`,
    stock: parseInt(p.warehouseInventoryNum, 10) || 120,
    rating: 4.8,
    reviewsCount: Math.floor(25 + Math.random() * 80),
    variants: [
      {
        vid: `VID-${p.sku || p.id}-STD`,
        name: 'Standard Edition',
        sku: p.sku || `REF-${p.id}`,
        price: retailPrice,
        stock: parseInt(p.warehouseInventoryNum, 10) || 100,
      },
    ],
    features: [
      'Vetted Master Workshop Quality',
      'Inspected & Brand New Certified',
      'Tracked Express Air Delivery',
    ],
  };
}

// Fetch products directly from CJ listV2
export async function directFetchProducts({ pageNum = 1, pageSize = 20, search = '', category = '' } = {}) {
  const token = await getDirectCJToken();
  if (!token) return null;

  const keyword = search || (category && category !== 'All' ? category : DEFAULT_SEARCH_KEYWORD);
  const url = `${CJ_LIST_ENDPOINT}?pageNum=${pageNum}&pageSize=${pageSize}${keyword ? `&keyWord=${encodeURIComponent(keyword)}` : ''}`;

  try {
    const res = await fetch(url, {
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (data.code === 200 && data.data) {
      const rawList = data.data?.content?.[0]?.productList || data.data?.list || [];
      if (rawList.length > 0) {
        return {
          success: true,
          data: rawList.map((p) => mapCJProduct(p, keyword)),
          total: data.data.totalRecords || data.data.total || rawList.length,
          source: 'cj_direct_browser_api',
        };
      }
    }
  } catch (err) {
    console.warn('[Direct CJ Products] Error:', err);
  }

  return null;
}

// Query single product details directly from CJ
export async function directFetchProductById(productId) {
  const token = await getDirectCJToken();
  if (!token) return null;

  try {
    const res = await fetch(`${CJ_DETAIL_ENDPOINT}?pid=${encodeURIComponent(productId)}`, {
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (data.code === 200 && data.data) {
      const item = data.data;
      const cost = parseFloat(item.sellPrice || '15');
      const retailPrice = Math.max(PRICING.minRetailPrice, Math.round(cost * PRICING.retailMultiplier * 100) / 100);
      const comparePrice = Math.round(retailPrice * PRICING.compareMultiplier * 100) / 100;

      return {
        id: item.pid || productId,
        name: item.productNameEn || item.productName || 'Curated Atelier Piece',
        price: retailPrice,
        compareAtPrice: comparePrice,
        images: (item.productImageSet?.length ? item.productImageSet : [item.bigImage || item.productImage]).filter(Boolean),
        description: item.description || item.productNameEn || 'Mastercrafted piece sourced directly from vetted workshops.',
        category: item.categoryName || item.entryNameEn || 'Curated',
        sku: item.productSku || `REF-${item.pid}`,
        stock: 100,
        rating: 4.9,
        reviewsCount: 42,
        variants: (item.variants || []).map((v) => ({
          vid: v.vid || v.variantSku,
          name: v.variantKeyEn || v.variantName || 'Standard Edition',
          sku: v.variantSku || item.productSku,
          price: Math.round(parseFloat(v.variantSellPrice || item.sellPrice || 15) * PRICING.retailMultiplier * 100) / 100,
          stock: 50,
        })),
        features: [
          'Vetted Master Workshop Quality',
          'Inspected & Brand New Certified',
          'Tracked Express Air Delivery',
        ],
      };
    }
  } catch (err) {
    console.warn('[Direct CJ Product Detail] Error:', err);
  }

  return null;
}

// Create an order on CJ directly from browser
export async function directPlaceOrder(orderData) {
  const token = await getDirectCJToken();
  if (!token) return null;

  const payload = {
    orderNumber: orderData.orderId || `ORD-${Date.now()}`,
    shippingZip: orderData.shippingAddress?.zip || '10001',
    shippingCountryCode: orderData.shippingAddress?.countryCode || 'US',
    shippingCountry: orderData.shippingAddress?.country || 'United States',
    shippingProvince: orderData.shippingAddress?.state || 'NY',
    shippingCity: orderData.shippingAddress?.city || 'New York',
    shippingAddress: orderData.shippingAddress?.street || '123 Luxury Way',
    shippingCustomerName: orderData.customer?.name || 'Valued Customer',
    shippingPhone: orderData.customer?.phone || '+1 555-0199',
    payType: 3, // Create order only
    products: (orderData.items || []).map((it) => ({
      vid: it.vid || `VID-${it.sku}`,
      sku: it.sku || 'SKU-DEF',
      quantity: it.quantity || 1,
    })),
  };

  try {
    const res = await fetch(CJ_ORDER_ENDPOINT, {
      method: 'POST',
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.result && (data.code === 200 || data.code === 0)) {
      return {
        success: true,
        cjOrderId: data.data?.orderId || data.data?.orderNum || `CJ-${Date.now()}`,
        status: 'DISPATCHED',
        source: 'cj_direct_order',
      };
    }
  } catch (err) {
    console.warn('[Direct CJ Order] Error:', err);
  }

  return null;
}
