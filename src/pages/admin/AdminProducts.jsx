// src/pages/admin/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { fetchProducts, fetchAdminStoreProducts, listCJProduct, unlistStoreProduct } from '../../services/api';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const POPULAR_QUERIES = ['watch', 'leather', 'headphone', 'lamp', 'ring', 'coffee', 'sunglasses'];

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cjKeyword, setCjKeyword] = useState('');
  const [syncMessage, setSyncMessage] = useState(null);
  const [catalogStatus, setCatalogStatus] = useState('loading');
  const [catalogError, setCatalogError] = useState('');
  const [listedProducts, setListedProducts] = useState([]);
  const [prices, setPrices] = useState({});
  const [savingIds, setSavingIds] = useState([]);
  const [catalogPage, setCatalogPage] = useState(1);

  const loadCatalog = async (keywordToSearch = '', isManualSync = false, pageToLoad = catalogPage) => {
    setCatalogStatus('loading');
    setCatalogError('');
    if (isManualSync) setRefreshing(true);
    else setLoading(true);

    try {
      const q = keywordToSearch === null ? cjKeyword : keywordToSearch;
      const res = await fetchProducts({
        pageNum: pageToLoad,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        search: q,
        pageSize: 30,
      });
      const listed = await fetchAdminStoreProducts();
      setListedProducts(listed);

      if (res && res.data) {
        setProducts(res.data);
        setCatalogStatus('connected');
      } else {
        setProducts([]);
        setCatalogStatus('error');
        setCatalogError('CJ returned an unexpected response.');
      }

      if (isManualSync || keywordToSearch) {
        setSyncMessage({
          type: res.source === 'cj_error' ? 'error' : 'success',
          text: res.source === 'cj_error' ? `CJ API error: ${res.error || 'check server CJ_API_KEY and CJ account access.'}` : `Retrieved ${res.data?.length || 0} live products (${res.source || 'live_api'}).`,
        });
        setTimeout(() => setSyncMessage(null), 5000);
      }
    } catch (e) {
      setProducts([]);
      setCatalogStatus('error');
      setCatalogError(e.message || 'Could not connect to CJ.');
      setSyncMessage({ type: 'error', text: `CJ API error: ${e.message}` });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCatalog('', false);
  }, [selectedCategory]);

  const handleCjSearch = (e) => {
    e.preventDefault();
    setCatalogPage(1);
    setSearch('');
    loadCatalog(cjKeyword, true, 1);
  };

  const handleListProduct = async (product) => {
    const price = Number(prices[product.id] ?? product.price ?? 0);
    if (!Number.isFinite(price) || price < 0) {
      setSyncMessage({ type: 'error', text: 'Enter a valid selling price (zero or more).' });
      return;
    }
    setSavingIds((ids) => [...ids, product.id]);
    try {
      const result = await listCJProduct(product.id, price);
      setListedProducts((current) => [...current.filter((item) => item.id !== product.id), result.product]);
      setSyncMessage({ type: 'success', text: `${product.name} is now listed at $${price.toFixed(2)}.` });
    } catch (error) {
      setSyncMessage({ type: 'error', text: error.message || 'Could not list this product.' });
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== product.id));
    }
  };

  const handleUnlistProduct = async (product) => {
    setSavingIds((ids) => [...ids, product.id]);
    try {
      await unlistStoreProduct(product.id);
      setListedProducts((current) => current.filter((item) => item.id !== product.id));
      setSyncMessage({ type: 'success', text: `${product.name} was removed from the storefront.` });
    } catch (error) {
      setSyncMessage({ type: 'error', text: error.message || 'Could not unlist this product.' });
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== product.id));
    }
  };

  const categories = ['All', 'Watch', 'Leather', 'Audio', 'Home', 'Shoes', 'Jewelry'];

  return (
    <AdminLayout title="Product Sourcing & Live Catalog">
      {/* Connection Status Banner */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${catalogStatus === 'connected' ? 'bg-emerald-50 text-emerald-600' : catalogStatus === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-stone-100 text-stone-500'}`}>
            {catalogStatus === 'connected' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-stone-900 text-sm">CJ Dropshipping Product Search</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                {catalogStatus === 'loading' ? 'Connecting…' : catalogStatus === 'connected' ? 'Connected' : 'Connection error'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Browse CJ products here, choose your selling price, then publish selected products to your storefront.</p>
          </div>
        </div>

        <button
          type="button"
          disabled={refreshing || loading}
          onClick={() => loadCatalog(null, true)}
          className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Querying API...' : 'Sync / Refresh Catalog'}</span>
        </button>
      </div>

      {/* Sync Toast */}
      {syncMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs font-medium flex items-center space-x-2 ${
            syncMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage.text}</span>
        </div>
      )}

      {/* Live Keyword Search Form */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 mb-6 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Sourcing Engine</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-white font-normal mb-2">
            Browse CJ and List Products
          </h3>
          <p className="text-stone-300 text-xs font-light mb-4">
            Search CJ from this admin page. Products stay hidden from the website until you list them below.
          </p>

          <form onSubmit={handleCjSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. watch, leather bag, wireless lamp, sunglasses..."
              value={cjKeyword}
              onChange={(e) => setCjKeyword(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              disabled={refreshing}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm disabled:opacity-50 shrink-0"
            >
              {refreshing ? 'Searching...' : 'Query Inventory'}
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 mt-3 text-xs text-stone-400 flex-wrap">
            <span className="text-[11px]">Popular Queries:</span>
            {POPULAR_QUERIES.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setCjKeyword(chip);
                  setCatalogPage(1);
                  setSearch('');
                  loadCatalog(chip, true, 1);
                }}
                className="px-2.5 py-0.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills & Local Filter */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCatalogPage(1);
                setSearch('');
                if (cat !== 'All') {
                  setCjKeyword('');
                  loadCatalog(cat.toLowerCase(), true, 1);
                } else {
                  setCjKeyword('');
                  loadCatalog('', true, 1);
                }
              }}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Filter current view by title/SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-stone-400 space-y-3">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-stone-500" />
            <p>Fetching real-time inventory from fulfillment API...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            {catalogStatus === 'error' ? `CJ product request failed: ${catalogError}` : 'CJ returned no products for this search. Try another keyword.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-100">
                <tr>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-4">SKU / Ref</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Your Price (USD)</th>
                  <th className="py-3.5 px-4">Warehouse Stock</th>
                  <th className="py-3.5 px-4">Variants</th>
                  <th className="py-3.5 px-5 text-right">Storefront</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {products
                  .filter((p) => {
                    if (!search) return true;
                    const q = search.toLowerCase();
                    const matchSku = (p.sku || '').toLowerCase().includes(q);
                    const matchName = (p.name || '').toLowerCase().includes(q);
                    return matchSku || matchName;
                  })
                  .map((prod) => {
                    const image = (prod.images && prod.images[0]) || '';
                    const isLowStock = (prod.stock || 0) <= 25;

                    return (
                      <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-4 px-5 max-w-xs sm:max-w-md">
                          <div className="flex items-center space-x-3.5">
                            {image ? <img src={image} alt={prod.name} className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200/60 shrink-0" /> : <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200/60 shrink-0" aria-label="No product image" />}
                            <div className="min-w-0">
                              <div className="font-semibold text-stone-900 text-xs line-clamp-1">
                                {prod.name}
                              </div>
                              <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                                {prod.description}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono font-medium text-stone-800">
                          {prod.sku}
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                            {prod.category}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-stone-500">
                            <span>$</span>
                            <input
                              type="number" min="0" step="0.01" aria-label={`Selling price for ${prod.name}`}
                              value={prices[prod.id] ?? listedProducts.find((item) => item.id === prod.id)?.price ?? 0}
                              onChange={(event) => setPrices((current) => ({ ...current, [prod.id]: event.target.value }))}
                              className="w-24 rounded-lg border border-stone-200 px-2 py-1.5 text-stone-900 focus:outline-none focus:border-stone-900"
                            />
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            ></span>
                            <span className={`font-semibold ${isLowStock ? 'text-amber-700' : 'text-stone-900'}`}>
                              {Number.isFinite(prod.stock) ? `${prod.stock.toLocaleString()} units` : 'Not provided'}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            CJ reported inventory
                          </div>
                        </td>

                        <td className="py-4 px-4 text-stone-600 whitespace-nowrap">
                          {prod.variants?.length ? `${prod.variants.length} option(s)` : 'No variants returned'}
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          {listedProducts.some((item) => item.id === prod.id) && <span className="mr-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Listed</span>}
                          <button
                            type="button" disabled={savingIds.includes(prod.id)}
                            onClick={() => handleListProduct(prod)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <span>{savingIds.includes(prod.id) ? 'Saving…' : listedProducts.some((item) => item.id === prod.id) ? 'Update price' : 'List product'}</span>
                          </button>
                          {listedProducts.some((item) => item.id === prod.id) && (
                            <button type="button" disabled={savingIds.includes(prod.id)} onClick={() => handleUnlistProduct(prod)} className="ml-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium disabled:opacity-50">Unlist</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between py-4 text-xs text-stone-600">
          <span>CJ catalog page {catalogPage} · {products.length} products shown</span>
          <div className="flex gap-2">
            <button type="button" disabled={catalogPage <= 1 || refreshing} onClick={() => { const page = catalogPage - 1; setCatalogPage(page); loadCatalog(null, true, page); }} className="rounded-lg border border-stone-200 px-3 py-2 disabled:opacity-40">Previous</button>
            <button type="button" disabled={products.length < 30 || refreshing} onClick={() => { const page = catalogPage + 1; setCatalogPage(page); loadCatalog(null, true, page); }} className="rounded-lg border border-stone-200 px-3 py-2 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
