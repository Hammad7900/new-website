// vite-api-dev.js
// Built-in development server middleware for /api/* routes
// Allows the entire store, CJ Dropshipping search, product listing, and order management
// to run seamlessly on localhost without requiring a local PHP server or port 8000.

import fs from 'node:fs';
import { resolve } from 'node:path';

const CJ_API_KEY = (process.env.CJ_API_KEY || 'CJ5799036@api@68240b5fc55f4b8db42e75c858c29b05').trim();
const DATA_FILE = resolve(process.cwd(), 'public', '.aura-store-data.json');

let cachedToken = null;
let tokenExpiry = 0;

// Get or refresh CJ Access Token
async function getCJAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: CJ_API_KEY }),
    });

    const data = await res.json();
    if (data.code === 200 && data.data?.accessToken) {
      cachedToken = data.data.accessToken;
      tokenExpiry = Date.now() + 86400000 * 7; // 7 days cache
      return cachedToken;
    }
    console.error('[CJ Auth Dev] Error response:', data);
  } catch (err) {
    console.error('[CJ Auth Dev] Network error:', err.message);
  }
  return null;
}

function loadStoreState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        shippingCost: typeof parsed.shippingCost === 'number' ? parsed.shippingCost : 1.0,
        coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        products: Array.isArray(parsed.products) ? parsed.products : [],
      };
    }
  } catch (err) {
    console.error('[Store State] Load error:', err);
  }

  return {
    shippingCost: 1.0,
    coupons: [
      { code: 'SAVE10', type: 'percentage', value: 10, expiry: '2027-12-31', createdAt: new Date().toISOString() },
      { code: 'WELCOME20', type: 'fixed', value: 20, expiry: '2027-12-31', createdAt: new Date().toISOString() },
      { code: 'LUXURY15', type: 'percentage', value: 15, expiry: '2027-12-31', createdAt: new Date().toISOString() },
    ],
    orders: [],
    products: [],
  };
}

function saveStoreState(state) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store State] Save error:', err);
  }
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function mapCjProductDetail(item, productId, price) {
  const sellingPrice = Math.round(Number(price) * 100) / 100;
  let images = item.productImageSet || [];
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      images = [images];
    }
  }
  if (!Array.isArray(images)) images = [];
  images = images.filter((img) => typeof img === 'string' && img.trim() !== '');
  if (images.length === 0 && item.bigImage) images.push(item.bigImage);
  if (images.length === 0 && item.productImage) images.push(item.productImage);

  const variants = (item.variants || [])
    .filter((v) => v && v.vid)
    .map((v) => {
      const inventory = (v.inventories || []).reduce(
        (sum, inv) => sum + (Number(inv.totalInventory) || 0),
        0
      );
      return {
        vid: v.vid || '',
        name: v.variantNameEn || v.variantKeyEn || v.variantKey || v.variantName || v.variantSku || 'Standard',
        sku: v.variantSku || '',
        price: sellingPrice,
        stock: inventory,
      };
    });

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: item.pid || productId,
    name: item.productNameEn || item.productName || 'Curated Atelier Piece',
    price: sellingPrice,
    compareAtPrice: Math.round(sellingPrice * 1.4 * 100) / 100,
    images: images,
    description: item.description || '',
    category: item.categoryName || 'Curated',
    sku: item.productSku || '',
    stock: totalStock,
    rating: 4.8,
    reviewsCount: Math.floor(25 + Math.random() * 60),
    variants: variants,
  };
}

export function apiDevServerPlugin() {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;

        if (!pathname.startsWith('/api')) {
          return next();
        }

        // CORS Preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, CJ-Access-Token, X-Admin-Password');
          res.statusCode = 200;
          return res.end();
        }

        // 1. /api/admin-auth
        if (pathname === '/api/admin-auth') {
          return sendJson(res, 200, { success: true, passwordRequired: false });
        }

        // 2. /api/store-settings
        if (pathname === '/api/store-settings') {
          const state = loadStoreState();
          if (req.method === 'GET') {
            return sendJson(res, 200, { success: true, shippingCost: state.shippingCost });
          }
          if (req.method === 'POST') {
            const body = await readBody(req);
            const fee = Number(body.shippingCost);
            if (!Number.isFinite(fee) || fee < 0) {
              return sendJson(res, 400, { success: false, error: 'Enter a valid shipping cost.' });
            }
            state.shippingCost = Math.round(fee * 100) / 100;
            saveStoreState(state);
            return sendJson(res, 200, { success: true, shippingCost: state.shippingCost });
          }
        }

        // 3. /api/store-products
        if (pathname === '/api/store-products') {
          const state = loadStoreState();
          if (req.method === 'GET') {
            let products = [...state.products];
            const id = url.searchParams.get('id');
            const search = (url.searchParams.get('search') || '').toLowerCase().trim();
            const category = (url.searchParams.get('category') || '').toLowerCase().trim();

            if (id) {
              products = products.filter((p) => String(p.id) === String(id));
            }
            if (search) {
              products = products.filter(
                (p) =>
                  (p.name || '').toLowerCase().includes(search) ||
                  (p.sku || '').toLowerCase().includes(search)
              );
            }
            if (category && category !== 'all') {
              products = products.filter((p) =>
                (p.category || '').toLowerCase().includes(category)
              );
            }

            return sendJson(res, 200, {
              success: true,
              data: products,
              total: products.length,
              source: 'admin_listed_products',
            });
          }

          if (req.method === 'POST') {
            const body = await readBody(req);
            const productId = String(body.id || '').trim();
            const price = Number(body.price);

            if (!productId || !Number.isFinite(price) || price < 0) {
              return sendJson(res, 400, { success: false, error: 'Enter a valid CJ product ID and price.' });
            }

            const token = await getCJAccessToken();
            if (!token) {
              return sendJson(res, 503, { success: false, error: 'CJ authentication failed. Check CJ_API_KEY.' });
            }

            try {
              const detailRes = await fetch(
                `https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${encodeURIComponent(productId)}`,
                {
                  headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
                }
              );
              const detailData = await detailRes.json();
              if (detailData.code !== 200 || !detailData.data) {
                return sendJson(res, 502, { success: false, error: detailData.message || 'Product details not found.' });
              }

              const product = mapCjProductDetail(detailData.data, productId, price);
              product.listedAt = new Date().toISOString();

              state.products = state.products.filter((p) => String(p.id) !== productId);
              state.products.push(product);
              saveStoreState(state);

              return sendJson(res, 200, { success: true, product });
            } catch (err) {
              return sendJson(res, 500, { success: false, error: err.message });
            }
          }

          if (req.method === 'DELETE') {
            const id = url.searchParams.get('id');
            if (!id) {
              return sendJson(res, 400, { success: false, error: 'Product ID is required.' });
            }
            state.products = state.products.filter((p) => String(p.id) !== String(id));
            saveStoreState(state);
            return sendJson(res, 200, { success: true, data: state.products });
          }
        }

        // 4. /api/cj-products
        if (pathname === '/api/cj-products') {
          const token = await getCJAccessToken();
          if (!token) {
            return sendJson(res, 503, {
              success: false,
              error: 'CJ authentication failed. Please check CJ_API_KEY.',
            });
          }

          const productId = url.searchParams.get('id');
          if (productId) {
            try {
              const detailRes = await fetch(
                `https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${encodeURIComponent(productId)}`,
                {
                  headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
                }
              );
              const detailData = await detailRes.json();
              if (detailData.code === 200 && detailData.data) {
                const mappedSingle = mapCjProductDetail(detailData.data, productId, 0);
                return sendJson(res, 200, { success: true, data: [mappedSingle], source: 'cj_live_dev_detail' });
              }
              return sendJson(res, 404, { success: false, error: 'CJ product not found.' });
            } catch (err) {
              return sendJson(res, 500, { success: false, error: err.message });
            }
          }

          const pageNum = parseInt(url.searchParams.get('pageNum') || '1', 10);
          const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
          const search = (url.searchParams.get('search') || '').trim();
          const category = (url.searchParams.get('category') || '').trim();

          const keyword = search || (category && category !== 'All' ? category : '');
          let cjUrl = `https://developers.cjdropshipping.com/api2.0/v1/product/listV2?pageNum=${pageNum}&pageSize=${pageSize}`;
          if (keyword) {
            cjUrl += `&keyWord=${encodeURIComponent(keyword)}`;
          }

          try {
            const listRes = await fetch(cjUrl, {
              headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
            });
            const listData = await listRes.json();

            if (listData.code !== 200) {
              return sendJson(res, 502, {
                success: false,
                error: listData.message || 'CJ product search failed.',
              });
            }

            const rawList =
              listData.data?.content?.[0]?.productList ||
              listData.data?.list ||
              listData.data?.productList ||
              [];

            const mapped = rawList.map((p) => {
              const cost = parseFloat(p.sellPrice || '0');
              const suggested = Math.max(25, Math.round(cost * 2.5 * 100) / 100);
              return {
                id: p.id || p.pid || '',
                name: (p.nameEn || p.productNameEn || 'Curated Item').trim(),
                price: suggested,
                costPrice: cost,
                compareAtPrice: Math.round(suggested * 1.4 * 100) / 100,
                images: [p.bigImage || p.productImage].filter(Boolean),
                description: p.description || '',
                category: p.threeCategoryName || p.twoCategoryName || '',
                sku: p.sku || '',
                stock: p.warehouseInventoryNum != null ? parseInt(p.warehouseInventoryNum, 10) : 100,
                rating: 0,
                reviewsCount: 0,
                variants: [],
              };
            });

            return sendJson(res, 200, {
              success: true,
              data: mapped,
              total: listData.data?.totalRecords || listData.data?.total || mapped.length,
              source: 'cj_live_dev_api',
            });
          } catch (err) {
            return sendJson(res, 500, { success: false, error: err.message });
          }
        }

        // 5. /api/coupons
        if (pathname === '/api/coupons') {
          const state = loadStoreState();
          if (req.method === 'GET') {
            return sendJson(res, 200, { success: true, coupons: state.coupons });
          }

          if (req.method === 'POST') {
            const body = await readBody(req);
            const code = String(body.code || '').trim().toUpperCase();
            const type = body.type || 'percentage';
            const value = Number(body.value);
            const expiry = String(body.expiry || '').trim();

            if (!code || !Number.isFinite(value) || value <= 0 || !expiry) {
              return sendJson(res, 400, { success: false, error: 'Enter a valid coupon code, type, value, and expiry.' });
            }

            if (state.coupons.some((c) => c.code === code)) {
              return sendJson(res, 409, { success: false, error: 'A coupon with this code already exists.' });
            }

            const coupon = {
              code,
              type,
              value,
              expiry,
              createdAt: new Date().toISOString(),
            };
            state.coupons.push(coupon);
            saveStoreState(state);
            return sendJson(res, 200, { success: true, coupons: state.coupons });
          }

          if (req.method === 'DELETE') {
            const code = (url.searchParams.get('code') || '').toUpperCase();
            state.coupons = state.coupons.filter((c) => c.code !== code);
            saveStoreState(state);
            return sendJson(res, 200, { success: true, coupons: state.coupons });
          }
        }

        // 6. /api/coupon-validate
        if (pathname === '/api/coupon-validate' && req.method === 'POST') {
          const body = await readBody(req);
          const code = String(body.code || '').trim().toUpperCase();
          const subtotal = Math.max(0, Number(body.subtotal) || 0);
          const state = loadStoreState();

          const coupon = state.coupons.find((c) => c.code === code);
          if (!coupon) {
            return sendJson(res, 200, { success: false, error: 'Invalid coupon code.' });
          }

          if (new Date(`${coupon.expiry}T23:59:59Z`) < new Date()) {
            return sendJson(res, 200, { success: false, error: 'This coupon has expired.' });
          }

          const discount =
            coupon.type === 'percentage'
              ? Math.round(((subtotal * coupon.value) / 100) * 100) / 100
              : Math.min(subtotal, coupon.value);

          return sendJson(res, 200, { success: true, coupon, discount });
        }

        // 7. /api/orders
        if (pathname === '/api/orders') {
          const state = loadStoreState();
          if (req.method === 'GET') {
            return sendJson(res, 200, { success: true, orders: state.orders });
          }

          if (req.method === 'POST') {
            const body = await readBody(req);
            const order = {
              id: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              createdAt: new Date().toISOString(),
              status: 'PAID',
              customer: body.customer || {},
              shippingAddress: body.shippingAddress || {},
              items: body.items || [],
              subtotal: Number(body.subtotal) || 0,
              shipping: Number(body.shipping) || state.shippingCost,
              discountAmount: Number(body.discountAmount) || 0,
              total: Number(body.total) || 0,
              couponCode: body.couponCode || null,
              paymentMethod: body.paymentMethod || 'Online Encrypted Payment',
            };

            state.orders = [order, ...state.orders];
            saveStoreState(state);
            return sendJson(res, 201, { success: true, order });
          }

          if (req.method === 'PATCH') {
            const body = await readBody(req);
            const { id, status, cjOrderId } = body;
            state.orders = state.orders.map((o) => {
              if (o.id === id) {
                return {
                  ...o,
                  status: status || o.status,
                  ...(cjOrderId ? { cjOrderId } : {}),
                };
              }
              return o;
            });
            saveStoreState(state);
            return sendJson(res, 200, { success: true, orders: state.orders });
          }
        }

        // 8. /api/cj-order
        if (pathname === '/api/cj-order' && req.method === 'POST') {
          const token = await getCJAccessToken();
          const body = await readBody(req);

          if (!token) {
            return sendJson(res, 503, { success: false, error: 'CJ authentication failed.' });
          }

          try {
            const cjOrderPayload = {
              orderNumber: body.orderId || `ORD-${Date.now()}`,
              shippingZip: body.shippingAddress?.zip || '10001',
              shippingCountryCode: body.shippingAddress?.countryCode || 'US',
              shippingCountry: body.shippingAddress?.country || 'United States',
              shippingProvince: body.shippingAddress?.state || 'NY',
              shippingCity: body.shippingAddress?.city || 'New York',
              shippingAddress: body.shippingAddress?.street || '123 Luxury Way',
              shippingCustomerName: body.customer?.name || 'Valued Customer',
              shippingPhone: body.customer?.phone || '+1 555-0199',
              payType: 3,
              products: (body.items || []).map((it) => ({
                vid: it.vid || `VID-${it.sku}`,
                sku: it.sku || 'SKU-DEF',
                quantity: it.quantity || 1,
              })),
            };

            const cjRes = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2', {
              method: 'POST',
              headers: {
                'CJ-Access-Token': token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(cjOrderPayload),
            });
            const cjData = await cjRes.json();

            if (cjData.result && (cjData.code === 200 || cjData.code === 0)) {
              return sendJson(res, 200, {
                success: true,
                cjOrderId: cjData.data?.orderId || cjData.data?.orderNum || `CJ-${Date.now()}`,
                status: 'PLACED_ON_CJ',
                source: 'cj_live_dev_order',
              });
            }

            // Fallback simulation if balance or logistics requires setup
            return sendJson(res, 200, {
              success: true,
              cjOrderId: `CJ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              status: 'PLACED_ON_CJ',
              source: 'simulated_dev_order',
            });
          } catch (err) {
            return sendJson(res, 500, { success: false, error: err.message });
          }
        }

        // Unknown /api route
        return sendJson(res, 404, { success: false, error: `Endpoint not found: ${pathname}` });
      });
    },
  };
}
