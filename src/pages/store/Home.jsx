// src/pages/store/Home.jsx
import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../../components/HeroBanner';
import { CategoryPills } from '../../components/CategoryPills';
import { ProductCard } from '../../components/ProductCard';
import { fetchProducts } from '../../services/api';
import { Sparkles, Search } from 'lucide-react';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setCatalogError('');
      try {
        const res = await fetchProducts({
          category: activeCategory === 'All' ? '' : activeCategory,
          search: searchQuery,
        });
        if (isMounted && res.data) {
          setProducts(res.data);
        }
      } catch (e) {
        console.error('Failed to load products', e);
        if (isMounted) setCatalogError(e.message || 'Could not load products from CJ.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, searchQuery]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Catalog Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header with Search and Sort */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-900"></span>
              <span>Live CJ Catalog</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 tracking-tight">
              Products
            </h2>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search collection or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 text-xs bg-white border border-stone-200 rounded-full focus:outline-none focus:border-stone-900 transition-colors shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3" />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="bg-white border border-stone-200 text-stone-700 text-xs rounded-full px-3.5 py-2.5 focus:outline-none focus:border-stone-900 transition-colors shadow-xs cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-10">
          <CategoryPills
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200/60 rounded-2xl p-4 animate-pulse h-96 flex flex-col justify-between"
              >
                <div className="bg-stone-200/80 rounded-xl aspect-square w-full"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-stone-200/80 rounded w-1/3"></div>
                  <div className="h-4 bg-stone-200/80 rounded w-4/5"></div>
                  <div className="h-3 bg-stone-200/80 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : catalogError ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-rose-200">
            <h3 className="font-serif text-xl text-stone-800 mb-2">CJ products could not be loaded</h3>
            <p className="text-xs text-rose-700">{catalogError}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
            <h3 className="font-serif text-xl text-stone-800 mb-2">No CJ products found</h3>
            <p className="text-xs text-stone-500 mb-6">There are no products to show for this search.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-black transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Craftsmanship Spotlight */}
      <section className="bg-stone-900 text-white py-20 lg:py-28 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5" />
              <span>Shipping and checkout</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                Free products. <br />
                <span className="italic text-stone-400">One shipping fee per order.</span>
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light">
                Product prices are set to zero. The current store shipping fee is added once at checkout and can be changed by the administrator.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-800 text-xs">
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider">CJ catalog</h4>
                  <p className="text-stone-400 mt-1">Only items returned by the live CJ API appear in the catalog.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider">Payment review</h4>
                  <p className="text-stone-400 mt-1">An administrator verifies Whop payment before sending an order to CJ.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-700 bg-stone-800/60 p-8 sm:p-12">
              <p className="text-xs uppercase tracking-widest text-stone-400">Order flow</p>
              <p className="font-serif text-2xl text-white mt-3">Choose a CJ item, pay the displayed shipping fee, then complete checkout.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
