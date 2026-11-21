// src/pages/store/Home.jsx
import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../../components/HeroBanner';
import { CategoryPills } from '../../components/CategoryPills';
import { ProductCard } from '../../components/ProductCard';
import { ReviewCard } from '../../components/ReviewCard';
import { fetchProducts } from '../../services/api';
import { Sparkles, Search } from 'lucide-react';

const REVIEWS = [
  {
    author: 'Julian Thorne',
    location: 'Zurich, Switzerland',
    item: 'ChronoMaster Watch',
    rating: 5,
    title: 'Remarkable horological craftsmanship',
    comment:
      'The weight, brushed steel finishing, and sapphire clarity rival timepieces five times its price point. Dispatched seamlessly and arrived in Zurich in under 5 days.',
  },
  {
    author: 'Camilla Dupont',
    location: 'Paris, France',
    item: 'The Sovereign Weekender',
    rating: 5,
    title: 'Exquisite vegetable-tanned leather',
    comment:
      'The leather aroma and rich grain patina are pure atelier quality. The isolated shoe compartment makes weekend travel to the Riviera effortless.',
  },
  {
    author: 'Marcus Sterling',
    location: 'London, UK',
    item: 'Sonus Pure ANC Headphones',
    rating: 5,
    title: 'Studio acoustic reproduction',
    comment:
      'Pristine sound separation and the lambskin cups are unbelievably comfortable for long flights. Checkout was instantaneous.',
  },
];

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
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
              <span>Curated Atelier Collection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 tracking-tight">
              Featured Luxury Pieces
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
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
            <h3 className="font-serif text-xl text-stone-800 mb-2">No matching pieces found</h3>
            <p className="text-xs text-stone-500 mb-6">Try adjusting your search criteria or clear active category filters.</p>
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
                <span>The Direct Atelier Model</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                Eliminating middlemen. <br />
                <span className="italic text-stone-400">Preserving uncompromising value.</span>
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light">
                Traditional luxury houses mark up goods heavily to offset retail flagships and campaigns. We route orders directly from specialist master workshops to your residence with white-glove courier handling.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-800 text-xs">
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider">Direct Origin Dispatch</h4>
                  <p className="text-stone-400 mt-1">Real-time inventory verification and tracked customs clearance.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider">Encrypted Settlement</h4>
                  <p className="text-stone-400 mt-1">Frictionless authorization with 256-bit bank-grade protection.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80"
                  alt="Leather Craftsmanship"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="bestsellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Client Testimonials
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1.5">
            Endorsed by Discerning Connoisseurs
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-3 leading-relaxed">
            Over 12,000 satisfied collectors worldwide enjoy our bespoke luxury goods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REVIEWS.map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
