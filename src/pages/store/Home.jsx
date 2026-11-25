// src/pages/store/Home.jsx
import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../../components/HeroBanner';
import { CategoryPills } from '../../components/CategoryPills';
import { ProductCard } from '../../components/ProductCard';
import { fetchStoreProducts, fetchCollections } from '../../services/api';
import {
  Sparkles,
  Search,
  ArrowRight,
  Star,
  Quote,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from 'lucide-react';

// Curated collection visuals for Shopify-style collection cards
const COLLECTION_PRESETS = [
  {
    slug: 'watches',
    name: 'Timepieces & Horology',
    desc: 'Precision movements, timeless stainless bezels & sapphire glass.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'leather',
    name: 'Artisan Leather Goods',
    desc: 'Full-grain wallets, bespoke messenger bags & handcrafted folios.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'jewelry',
    name: 'Haute Jewelry & Chains',
    desc: 'Pure gold accents, hand-polished chains & radiant pendants.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'home-audio',
    name: 'Atelier Living & Audio',
    desc: 'Sculptural ambient lamps, acoustics & refined tabletop objects.',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
  },
];

const REVIEWS = [
  {
    name: 'Julian Vance',
    location: 'London, UK',
    stars: 5,
    item: 'Chronograph Timepiece',
    quote:
      'The finish and weight of the watch exceeded all expectations. Fast insured delivery to London and the Whop checkout was completely frictionless.',
  },
  {
    name: 'Claire Dupont',
    location: 'Zurich, Switzerland',
    stars: 5,
    item: 'Artisan Leather Cardholder',
    quote:
      'Impeccable stitchwork and rich patina right out of the box. Truly atelier quality at an honest price.',
  },
  {
    name: 'Marcus Sterling',
    location: 'New York, USA',
    stars: 5,
    item: 'Bespoke Body Jewelry',
    quote:
      'Ordered two pieces together — the automated multi-item shipping calculation was completely transparent. Highly recommended store.',
  },
  {
    name: 'Elena Rostova',
    location: 'Dubai, UAE',
    stars: 5,
    item: 'Ambient Sculpture Lamp',
    quote:
      'Flawless packaging and tracked courier update at every step. A true luxury shopping experience on mobile.',
  },
];

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchCollections()
      .then((cols) => setCollections(cols || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setCatalogError('');
      try {
        const res = await fetchStoreProducts({
          category: activeCategory === 'All' ? '' : activeCategory,
          collection: activeCategory === 'All' ? '' : activeCategory,
          search: searchQuery,
        });
        if (isMounted && res.data) {
          setProducts(res.data);
        }
      } catch (e) {
        console.error('Failed to load products', e);
        if (isMounted) setCatalogError(e.message || 'Could not load products from the catalog.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, searchQuery]);

  const collectionCounts = React.useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      const slug = (p.collectionSlug || '').toLowerCase();
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const handleSelectCollectionCard = (slug) => {
    setActiveCategory(slug);
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });

  // Merge dynamic collections with visual presets
  const displayCollections = (collections.length > 0 ? collections : COLLECTION_PRESETS).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* 1. 3D Hero Banner */}
      <HeroBanner />

      {/* 2. Shopify-Style Collections Showcase Section */}
      <section id="collections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Departments</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 tracking-tight">
              Featured Collections
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm">
            Hand-selected luxury departments crafted for discerning collectors and daily elegance.
          </p>
        </div>

        {/* 4-Card Shopify-Style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCollections.map((col, idx) => {
            const preset = COLLECTION_PRESETS[idx % COLLECTION_PRESETS.length];
            const img = col.image || col.bannerImage || preset.image;
            const desc = col.description || preset.desc;
            const count = collectionCounts[col.slug?.toLowerCase()] ?? 0;

            return (
              <div
                key={col.slug || col.id || idx}
                onClick={() => handleSelectCollectionCard(col.slug || col.name)}
                className="group relative rounded-3xl overflow-hidden cursor-pointer bg-stone-900 border border-stone-200/60 shadow-xs hover:shadow-xl transition-all duration-500 h-80 flex flex-col justify-end p-6"
              >
                {/* Background Image with Zoom */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={img}
                    alt={col.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-75 group-hover:opacity-65"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    <span>{count > 0 ? `${count} items` : 'Atelier Curated'}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-white font-medium group-hover:text-amber-300 transition-colors">
                    {col.name}
                  </h3>

                  <p className="text-stone-300 text-xs line-clamp-2 font-light">
                    {desc}
                  </p>

                  <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore Department</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Main Catalog Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header with Search and Sort */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-900"></span>
              <span>Our Collection</span>
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
                placeholder="Search products or SKU..."
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
                className="bg-white border border-stone-200 text-stone-700 text-xs rounded-full px-3.5 py-2.5 focus:outline-none focus:border-stone-900 transition-colors shadow-xs cursor-pointer font-medium"
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
            collections={collections}
            counts={collectionCounts}
          />
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200/60 rounded-3xl p-4 animate-pulse h-96 flex flex-col justify-between"
              >
                <div className="bg-stone-200/80 rounded-2xl aspect-square w-full"></div>
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
            <h3 className="font-serif text-xl text-stone-800 mb-2">Products could not be loaded</h3>
            <p className="text-xs text-rose-700">{catalogError}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
            <h3 className="font-serif text-xl text-stone-800 mb-2">
              {searchQuery || activeCategory !== 'All' ? 'No listed products found' : 'Products are being prepared'}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              {searchQuery || activeCategory !== 'All'
                ? 'Try another search or reset your filters.'
                : 'New products will appear here after they are published from the atelier admin panel.'}
            </p>
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

      {/* 4. Client Testimonials & Reviews Section */}
      <section className="bg-white py-20 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-1 text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 tracking-tight">
              Client Testimonials
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">
              Discover authentic impressions from collectors and patrons worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((rev, i) => (
              <div
                key={i}
                className="bg-[#faf8f5] border border-stone-200/80 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <Quote className="w-8 h-8 text-stone-200 absolute top-5 right-5" />
                <div className="space-y-3 z-10">
                  <div className="flex items-center space-x-1">
                    {[...Array(rev.stars)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-200/60 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-900 text-xs">{rev.name}</div>
                      <div className="text-[10px] text-stone-400">{rev.location}</div>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1 font-mono truncate">
                    Purchased: {rev.item}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Brand Craftsmanship & Atelier Standards Spotlight */}
      <section className="bg-stone-900 text-white py-20 lg:py-28 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atelier Standards</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                Bespoke Curation. <br />
                <span className="italic text-stone-400">Direct global insured dispatch.</span>
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light">
                Each piece in our catalog is rigorously verified for material purity, mechanical precision, and enduring elegance.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-800 text-xs">
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider">Direct Origin</h4>
                  <p className="text-stone-400 mt-1">Dispatched directly from origin master ateliers with trackable transit.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider">Secure Settlement</h4>
                  <p className="text-stone-400 mt-1">Encrypted 256-bit payment authorization powered by Whop.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-700 bg-stone-800/60 p-8 sm:p-12 space-y-4">
              <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">Client Assurance</p>
              <p className="font-serif text-2xl text-white">Worldwide express courier shipping with dedicated concierge support.</p>
              <div className="pt-4 flex items-center space-x-6 text-xs text-stone-400">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Doorstep Courier</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Full Transit Insurance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
