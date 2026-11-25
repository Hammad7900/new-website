async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) throw new Error(data.error || `API request failed (${response.status})`);
  return data;
}

export const fetchProducts = async ({ pageNum = 1, pageSize = 20, category = '', search = '' } = {}) => {
  const params = new URLSearchParams({ pageNum: String(pageNum), pageSize: String(pageSize) });
  if (category && category !== 'All') params.set('category', category);
  if (search) params.set('search', search);
  return request(`/api/cj-products?${params}`, { headers: adminHeaders() });
};

export const fetchProductById = async (id) => {
  const result = await request(`/api/store-products?id=${encodeURIComponent(id)}`);
  return result.data?.[0] || null;
};

export const fetchProductDetail = fetchProductById;

export const fetchStoreProducts = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.set('category', params.category);
  if (params.collection && params.collection !== 'All') query.set('collection', params.collection);
  if (params.search) query.set('search', params.search);
  return request(`/api/store-products${query.size ? `?${query}` : ''}`);
};

export const updateStoreProduct = (data) => request('/api/store-products', {
  method: 'PATCH',
  headers: adminHeaders(),
  body: JSON.stringify(data),
});

export const fetchCollections = async () => (await request('/api/collections')).collections;

export const saveCollection = (collection) => request('/api/collections', {
  method: 'POST',
  headers: adminHeaders(),
  body: JSON.stringify(collection),
});

export const deleteCollection = (id, slug) => {
  const params = new URLSearchParams();
  if (id) params.set('id', id);
  if (slug) params.set('slug', slug);
  return request(`/api/collections?${params}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
};

export const listCJProduct = (id, price, collectionSlug = '') => request('/api/store-products', {
  method: 'POST', headers: adminHeaders(), body: JSON.stringify({ id, price, collectionSlug }),
});

export const unlistStoreProduct = (id) => request(`/api/store-products?id=${encodeURIComponent(id)}`, {
  method: 'DELETE', headers: adminHeaders(),
});

export const fetchAdminStoreProducts = async () => (await request('/api/store-products', { headers: adminHeaders() })).data;

export const placeOrderOnCJ = (orderData) => request('/api/cj-order', {
  method: 'POST',
  headers: adminHeaders(),
  body: JSON.stringify(orderData),
});

export const verifyAdminPassword = (password) => request('/api/admin-auth', {
  method: 'POST',
  body: JSON.stringify({ password }),
});

export const getAdminSecurityStatus = () => request('/api/admin-auth');

export const updateAdminSecurity = (payload) => request('/api/admin-auth', {
  method: 'POST',
  headers: adminHeaders(),
  body: JSON.stringify(payload),
});

export const fetchStoreSettings = () => request('/api/store-settings');

export const saveStoreSettings = (settings, adminPassword) => request('/api/store-settings', {
  method: 'POST',
  headers: { 'X-Admin-Password': adminPassword },
  body: JSON.stringify(settings),
});

const adminHeaders = () => ({ 'X-Admin-Password': sessionStorage.getItem('aura_admin_password') || '' });

export const getAdminCoupons = async () => (await request('/api/coupons', { headers: adminHeaders() })).coupons;
export const createAdminCoupon = async (coupon) => (await request('/api/coupons', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(coupon) })).coupons;
export const removeAdminCoupon = async (code) => (await request(`/api/coupons?code=${encodeURIComponent(code)}`, { method: 'DELETE', headers: adminHeaders() })).coupons;
export const checkCoupon = (code, subtotal) => request('/api/coupon-validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) });
export const createStoreOrder = async (order) => (await request('/api/orders', { method: 'POST', body: JSON.stringify(order) })).order;
export const getAdminOrders = async () => (await request('/api/orders', { headers: adminHeaders() })).orders;
export const updateAdminOrder = (id, status, cjOrderId) => request('/api/orders', {
  method: 'PATCH',
  headers: adminHeaders(),
  body: JSON.stringify({ id, status, cjOrderId }),
});

export const submitInquiry = (inquiry) => request('/api/inquiries', {
  method: 'POST',
  body: JSON.stringify(inquiry),
});

export const fetchInquiries = async () => (await request('/api/inquiries', { headers: adminHeaders() })).inquiries;

export const deleteInquiry = async (id) => (await request(`/api/inquiries?id=${encodeURIComponent(id)}`, {
  method: 'DELETE',
  headers: adminHeaders(),
})).inquiries;
