// src/pages/admin/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  fetchProducts,
  fetchAdminStoreProducts,
  listCJProduct,
  unlistStoreProduct,
  fetchCollections,
  updateStoreProduct,
} from '../../services/api';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ShoppingBag,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  PlusCircle,
  Tag,
  DollarSign,
} from 'lucide-react';

const POPULAR_QUERIES = ['wig', 'human hair', 'hd lace', 'hair bundles', 'lace frontal', 'watch', 'jewelry', 'leather'];

export const AdminProducts = () => {
  const [activeTab, setActiveTab] = useState('listed'); // 'listed' | 'catalog'
  const [products, setProducts] = useState([]);
  const [listedProducts, setListedProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [listedSearch, setListedSearch] = useState('');
  const [listedCollectionFilter, setListedCollectionFilter] = useState('All');
  const [cjKeyword, setCjKeyword] = useState('');
  const [syncMessage, setSyncMessage] = useState(null);
  const [catalogStatus, setCatalogStatus] = useState('loading');
  const [catalogError, setCatalogError] = useState('');
  const [prices, setPrices] = useState({});
  const [newProductCollections, setNewProductCollections] = useState({});
  const [savingIds, setSavingIds] = useState([]);
  const [catalogPage, setCatalogPage] = useState(1);

  const showToast = (type, text) => {
    setSyncMessage({ type, text });
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const loadData = async (keywordToSearch = '', isManualSync = false, pageToLoad = catalogPage) => {
    if (isManualSync) setRefreshing(true);
    else setLoading(true);

    try {
      const q = keywordToSearch === null ? cjKeyword : keywordToSearch;
      const [cjRes, listed, cols] = await Promise.all([
        fetchProducts({
          pageNum: pageToLoad,
          category: selectedCategory === 'All' ? '' : selectedCategory,
          search: q,
          pageSize: 30,
        }).catch((err) => ({ data: [], source: 'cj_error', error: err.message })),
        fetchAdminStoreProducts().catch(() => []),
        fetchCollections().catch(() => []),
      ]);

      setListedProducts(listed || []);
      setCollections(cols || []);

      if (cjRes && Array.isArray(cjRes.data)) {
        setProducts(cjRes.data);
        setCatalogStatus('connected');
      } else {
        setProducts([]);
        setCatalogStatus('error');
        setCatalogError(cjRes.error || 'CJ returned an unexpected response.');
      }

      if (isManualSync || keywordToSearch) {
        showToast(
          cjRes.source === 'cj_error' ? 'error' : 'success',
          cjRes.source === 'cj_error'
            ? `CJ API error: ${cjRes.error || 'Check CJ API key'}`
            : `Retrieved ${cjRes.data?.length || 0} live sourcing items.`
        );
      }
    } catch (e) {
      setCatalogStatus('error');
      setCatalogError(e.message || 'Could not connect to CJ.');
      showToast('error', `Error loading data: ${e.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData('', false);
  }, [selectedCategory]);

  const handleCjSearch = (e) => {
    e.preventDefault();
    setCatalogPage(1);
    setCatalogSearch('');
    loadData(cjKeyword, true, 1);
  };

  const handleListProduct = async (product) => {
    const price = Number(prices[product.id] ?? product.price ?? 0);
    if (!Number.isFinite(price) || price < 0) {
      showToast('error', 'Enter a valid selling price ($0 or more).');
      return;
    }
    const chosenCollection = newProductCollections[product.id] || '';
    const colName = collections.find((c) => c.slug === chosenCollection)?.name;
    setSavingIds((ids) => [...ids, product.id]);
    try {
      const result = await listCJProduct(product.id, price, chosenCollection);
      let updatedProduct = result.product || { ...product, price };
      
      // If a collection was selected during listing, assign it immediately
      if (chosenCollection) {
        try {
          await updateStoreProduct({ id: product.id, collectionSlug: chosenCollection });
          updatedProduct.collectionSlug = chosenCollection;
        } catch (_) {}
      }

      setListedProducts((current) => [
        ...current.filter((item) => item.id !== product.id),
        updatedProduct,
      ]);
      if (chosenCollection) {
        showToast('success', `"${product.name}" added to collection: ${colName || chosenCollection}! (Shows inside this collection)`);
      } else {
        showToast('success', `"${product.name}" listed on Storefront (Home)! (Shows on home highlights)`);
      }
    } catch (error) {
      showToast('error', error.message || 'Could not list this product.');
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== product.id));
    }
  };

  const handleUnlistProduct = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from storefront?`)) return;
    setSavingIds((ids) => [...ids, product.id]);
    try {
      await unlistStoreProduct(product.id);
      setListedProducts((current) => current.filter((item) => item.id !== product.id));
      showToast('success', `"${product.name}" removed from storefront.`);
    } catch (error) {
      showToast('error', error.message || 'Could not remove product.');
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== product.id));
    }
  };

  const handleAssignCollection = async (productId, collectionSlug) => {
    try {
      await updateStoreProduct({ id: productId, collectionSlug });
      setListedProducts((current) =>
        current.map((item) => (item.id === productId ? { ...item, collectionSlug } : item))
      );
      const colName = collections.find((c) => c.slug === collectionSlug)?.name || 'Unassigned';
      showToast('success', `Assigned to collection: ${colName}`);
    } catch (error) {
      showToast('error', error.message || 'Could not assign collection.');
    }
  };

  const handleUpdatePrice = async (productId, newPrice) => {
    const price = Number(newPrice);
    if (!Number.isFinite(price) || price < 0) {
      showToast('error', 'Please enter a valid price.');
      return;
    }
    setSavingIds((ids) => [...ids, productId]);
    try {
      await updateStoreProduct({ id: productId, price });
      setListedProducts((current) =>
        current.map((item) => (item.id === productId ? { ...item, price } : item))
      );
      showToast('success', `Price updated to $${price.toFixed(2)}`);
    } catch (error) {
      showToast('error', error.message || 'Could not update price.');
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== productId));
    }
  };

  const handleMoveProduct = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= listedProducts.length) return;
    const reordered = [...listedProducts];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setListedProducts(reordered);
    showToast('success', 'Product order updated in admin view.');
  };

  const categories = ['All', 'Watch', 'Leather', 'Audio', 'Home', 'Shoes', 'Jewelry'];

  const filteredListedProducts = listedProducts.filter((p) => {
    const matchSearch =
      !listedSearch ||
      (p.name || '').toLowerCase().includes(listedSearch.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(listedSearch.toLowerCase());
    const matchCollection =
      listedCollectionFilter === 'All' ||
      (listedCollectionFilter === 'unassigned' && !p.collectionSlug) ||
      p.collectionSlug === listedCollectionFilter;
    return matchSearch && matchCollection;
  });

  return (
    <AdminLayout title="Product Management & Sourcing">
      {/* Toast Notification */}
      {syncMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs font-medium flex items-center space-x-2.5 transition-all shadow-sm ${
            syncMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {syncMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{syncMessage.text}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-2xl p-2 mb-6 shadow-xs">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('listed')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'listed'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Store Products & Collections</span>
            <span
              className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'listed' ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {listedProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'catalog'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Source New Products (CJ)</span>
          </button>
        </div>

        <button
          type="button"
          disabled={refreshing || loading}
          onClick={() => loadData(null, true)}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Refresh All'}</span>
        </button>
      </div>

      {/* TAB 1: CURRENTLY LISTED STOREFRONT PRODUCTS */}
      {activeTab === 'listed' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Filter:</span>
              <select
                value={listedCollectionFilter}
                onChange={(e) => setListedCollectionFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-stone-900"
              >
                <option value="All">All Collections ({listedProducts.length})</option>
                <option value="unassigned">Unassigned</option>
                {collections.map((col) => (
                  <option key={col.slug} value={col.slug}>
                    {col.name} ({listedProducts.filter((p) => p.collectionSlug === col.slug).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search listed products..."
                  value={listedSearch}
                  onChange={(e) => setListedSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add More</span>
              </button>
            </div>
          </div>

          {/* Table of Listed Products */}
          <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
            {listedProducts.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl text-stone-900 font-medium mb-1">No products listed on storefront yet</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
                  Browse the CJ Sourcing Catalog tab to discover items, set your selling prices, and publish them to your live website.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  Source Products Now
                </button>
              </div>
            ) : filteredListedProducts.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500">
                No listed products match your search or filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-100">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">Order</th>
                      <th className="py-3.5 px-5">Product Details</th>
                      <th className="py-3.5 px-4">Assigned Collection</th>
                      <th className="py-3.5 px-4">Selling Price</th>
                      <th className="py-3.5 px-4">Warehouse Stock</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredListedProducts.map((prod, idx) => {
                      const image = (prod.images && prod.images[0]) || '';
                      const isSaving = savingIds.includes(prod.id);
                      return (
                        <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveProduct(idx, 'up')}
                                className="p-1 hover:bg-stone-200 rounded disabled:opacity-20 text-stone-600"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <span className="text-[10px] font-mono text-stone-400">{idx + 1}</span>
                              <button
                                type="button"
                                disabled={idx === filteredListedProducts.length - 1}
                                onClick={() => handleMoveProduct(idx, 'down')}
                                className="p-1 hover:bg-stone-200 rounded disabled:opacity-20 text-stone-600"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          <td className="py-4 px-5 max-w-sm">
                            <div className="flex items-center space-x-3.5">
                              {image ? (
                                <img
                                  src={image}
                                  alt={prod.name}
                                  className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200/60 shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200/60 shrink-0 flex items-center justify-center text-stone-400">
                                  <Layers className="w-5 h-5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-stone-900 text-xs line-clamp-1">
                                  {prod.name}
                                </div>
                                <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                                  SKU: {prod.sku || prod.id}
                                </div>
                                <a
                                  href={`/product/${prod.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-[11px] text-amber-700 hover:text-amber-800 font-medium mt-1"
                                >
                                  <span>View in Store</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <Tag className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                <select
                                  value={prod.collectionSlug || ''}
                                  onChange={(e) => handleAssignCollection(prod.id, e.target.value)}
                                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white text-stone-800 focus:outline-none focus:border-stone-900 cursor-pointer shadow-2xs font-medium"
                                >
                                  <option value="">-- Unassigned (Home Storefront) --</option>
                                  {collections.map((col) => (
                                    <option key={col.slug} value={col.slug}>
                                      {col.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <span className="text-[10px] pl-5">
                                {prod.collectionSlug ? (
                                  <span className="text-stone-500 font-medium">📁 Shows in Collection Page only</span>
                                ) : (
                                  <span className="text-amber-700 font-semibold">🏠 Shows on Home Page Marquee</span>
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-stone-400 font-bold">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={prod.price || 0}
                                onBlur={(e) => handleUpdatePrice(prod.id, e.target.value)}
                                className="w-24 rounded-xl border border-stone-200 px-2.5 py-1.5 text-stone-900 font-semibold focus:outline-none focus:border-stone-900 bg-white"
                              />
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-medium text-stone-900">
                              {Number.isFinite(prod.stock) ? `${prod.stock.toLocaleString()} units` : 'Available'}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleUnlistProduct(prod)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isSaving ? 'Removing…' : 'Remove from Store'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CJ DROPSHIPPING SOURCING CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Sourcing Banner */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CJ Sourcing Engine</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-white font-normal mb-2">
                Discover & List New Products
              </h3>
              <p className="text-stone-300 text-xs font-light mb-5">
                Search CJ inventory below. Choose selling price and collection before publishing straight to your storefront.
              </p>

              <form onSubmit={handleCjSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. watch, leather wallet, wireless lamp, ring, necklace..."
                  value={cjKeyword}
                  onChange={(e) => setCjKeyword(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={refreshing}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm disabled:opacity-50 shrink-0"
                >
                  {refreshing ? 'Searching...' : 'Search Inventory'}
                </button>
              </form>

              {/* Quick preset chips */}
              <div className="flex items-center gap-2 mt-4 text-xs text-stone-400 flex-wrap">
                <span className="text-[11px]">Popular Queries:</span>
                {POPULAR_QUERIES.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setCjKeyword(chip);
                      setCatalogPage(1);
                      setCatalogSearch('');
                      loadData(chip, true, 1);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sourcing Category Filter Bar */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCatalogPage(1);
                    setCatalogSearch('');
                    if (cat !== 'All') {
                      setCjKeyword('');
                      loadData(cat.toLowerCase(), true, 1);
                    } else {
                      setCjKeyword('');
                      loadData('', true, 1);
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
                placeholder="Filter search results..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Sourcing Products Table */}
          <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-xs text-stone-400 space-y-3">
                <RefreshCw className="w-7 h-7 animate-spin mx-auto text-stone-500" />
                <p>Querying CJ Dropshipping catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-xs text-stone-400">
                {catalogStatus === 'error'
                  ? `CJ product request failed: ${catalogError}`
                  : 'No products returned for this query. Try another keyword.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-100">
                    <tr>
                      <th className="py-3.5 px-5">Product</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Assign Collection</th>
                      <th className="py-3.5 px-4">Selling Price ($)</th>
                      <th className="py-3.5 px-4">Warehouse Stock</th>
                      <th className="py-3.5 px-5 text-right">Storefront Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {products
                      .filter((p) => {
                        if (!catalogSearch) return true;
                        const q = catalogSearch.toLowerCase();
                        return (
                          (p.sku || '').toLowerCase().includes(q) ||
                          (p.name || '').toLowerCase().includes(q)
                        );
                      })
                      .map((prod) => {
                        const image = (prod.images && prod.images[0]) || '';
                        const isListed = listedProducts.some((item) => item.id === prod.id);
                        const isSaving = savingIds.includes(prod.id);

                        return (
                          <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-4 px-5 max-w-xs sm:max-w-md">
                              <div className="flex items-center space-x-3.5">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={prod.name}
                                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200/60 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200/60 shrink-0" />
                                )}
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

                            <td className="py-4 px-4 whitespace-nowrap">
                              <select
                                value={
                                  isListed
                                    ? listedProducts.find((item) => item.id === prod.id)?.collectionSlug || ''
                                    : newProductCollections[prod.id] || ''
                                }
                                onChange={(e) => {
                                  if (isListed) {
                                    handleAssignCollection(prod.id, e.target.value);
                                  } else {
                                    setNewProductCollections((cur) => ({ ...cur, [prod.id]: e.target.value }));
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white text-stone-800 focus:outline-none focus:border-stone-900 font-medium"
                              >
                                <option value="">-- Storefront (No Collection) --</option>
                                {collections.map((col) => (
                                  <option key={col.slug} value={col.slug}>
                                    {col.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-stone-500">
                                <span>$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    prices[prod.id] ??
                                    listedProducts.find((item) => item.id === prod.id)?.price ??
                                    prod.price ??
                                    0
                                  }
                                  onChange={(e) =>
                                    setPrices((current) => ({ ...current, [prod.id]: e.target.value }))
                                  }
                                  className="w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-stone-900 focus:outline-none focus:border-stone-900 font-semibold"
                                />
                              </div>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="font-semibold text-stone-900">
                                {Number.isFinite(prod.stock) ? `${prod.stock.toLocaleString()} units` : 'Available'}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              {isListed ? (
                                <div className="inline-flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                                    Listed
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleListProduct(prod)}
                                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium disabled:opacity-50"
                                  >
                                    {isSaving ? 'Updating...' : 'Update'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleUnlistProduct(prod)}
                                    className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium disabled:opacity-50"
                                  >
                                    Unlist
                                  </button>
                                </div>
                              ) : (() => {
                                const selectedColSlug = newProductCollections[prod.id] || '';
                                const targetCol = collections.find((c) => c.slug === selectedColSlug);
                                return (
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleListProduct(prod)}
                                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 ${
                                      selectedColSlug
                                        ? 'bg-stone-900 hover:bg-black text-amber-400 border border-stone-800'
                                        : 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                                    }`}
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>
                                      {isSaving
                                        ? 'Listing...'
                                        : selectedColSlug
                                        ? `List in ${targetCol?.name || 'Collection'}`
                                        : 'List on Storefront (Home)'}
                                    </span>
                                  </button>
                                );
                              })()}
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
              <span>Page {catalogPage} · Showing {products.length} products</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={catalogPage <= 1 || refreshing}
                  onClick={() => {
                    const page = catalogPage - 1;
                    setCatalogPage(page);
                    loadData(null, true, page);
                  }}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-medium hover:bg-stone-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={products.length < 30 || refreshing}
                  onClick={() => {
                    const page = catalogPage + 1;
                    setCatalogPage(page);
                    loadData(null, true, page);
                  }}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-medium hover:bg-stone-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
