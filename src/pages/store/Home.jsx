// src/pages/store/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroBanner } from '../../components/HeroBanner';
import { CategoryPills } from '../../components/CategoryPills'; // kept for collection counts
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
  X,
} from 'lucide-react';

// Smart fallback images matched by collection name/slug when admin hasn't uploaded a custom photo
export function getCollectionImage(col) {
  if (col?.image && col.image.trim() !== '') return col.image;
  if (col?.bannerImage && col.bannerImage.trim() !== '') return col.bannerImage;

  const key = `${col?.slug || ''} ${col?.name || ''}`.toLowerCase();
  if (key.includes('curly')) {
    return 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80';
  }
  if (key.includes('wig') || key.includes('hair') || key.includes('lace')) {
    return 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80';
  }
  if (key.includes('jewel') || key.includes('ring') || key.includes('chain') || key.includes('neck') || key.includes('diamond')) {
    return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
  }
  if (key.includes('watch') || key.includes('horology') || key.includes('time')) {
    return 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80';
  }
  if (key.includes('dress') || key.includes('couture') || key.includes('gown')) {
    return 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80';
  }
  if (key.includes('leather') || key.includes('bag') || key.includes('handbag') || key.includes('tote') || key.includes('accessor')) {
    return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';
  }
  if (key.includes('winter') || key.includes('coat') || key.includes('jacket') || key.includes('cashmere')) {
    return 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
  }
  if (key.includes('gym') || key.includes('active') || key.includes('fitness') || key.includes('sport')) {
    return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80';
}

const DEFAULT_COLLECTIONS = [
  {
    slug: 'human-hair-wigs',
    name: 'Human Hair Wigs',
    description: 'Raw Human Hair & HD Lace Wigs — 100% unprocessed, glueless wear & go.',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'curly-wigs',
    name: 'Curly Wigs',
    description: 'Couture Curly & Deep Wave Wigs — bouncy curls, invisible HD lace.',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'dresses',
    name: 'Dresses',
    description: 'Atelier Dresses & Evening Couture — from casual chic to full glamour.',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'bags',
    name: 'Bags',
    description: 'Designer Handbags & Leather Goods — structured luxury for every occasion.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'winter-wear',
    name: 'Winter Wear',
    description: 'Winter Cashmere & Luxury Coats — warmth wrapped in couture.',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'jewelry',
    name: 'Jewelry',
    description: 'Fine Jewelry, Chains & Diamonds — pure gold accents and radiant pendants.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'gym-wear',
    name: 'Gym Wear',
    description: 'Atelier Active & Luxury Gym Wear — performance meets premium fabric.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'watches',
    name: 'Watches',
    description: 'Horology & Precision Watches — timeless movements, sapphire crystal.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  },
];

const REVIEWS = [
  {
    name: 'Serena Sterling',
    location: 'Atlanta, USA',
    stars: 5,
    item: '13x6 HD Lace Raw Virgin Body Wave Wig',
    quote:
      'The HD lace is completely invisible on my skin! Bleached knots were micro-fine and hair was silky with zero shedding. Arrived in a luxury satin bag with tracked dispatch.',
  },
  {
    name: 'Nathalie Mensah',
    location: 'London, UK',
    stars: 5,
    item: 'Glueless 3D Wear & Go Pre-Plucked Wig',
    quote:
      'Literally took 30 seconds to put on with zero glue. The elastic band keeps it snug and the hairline is pre-plucked to absolute perfection. 10/10 quality.',
  },
  {
    name: 'Julian Vance',
    location: 'Zurich, Switzerland',
    stars: 5,
    item: 'Chronograph Timepiece',
    quote:
      'The finish and weight of the watch exceeded all expectations. Fast insured delivery and the encrypted checkout was completely frictionless.',
  },
  {
    name: 'Elena Rostova',
    location: 'Dubai, UAE',
    stars: 5,
    item: 'Pure Gold Accent Body Chain',
    quote:
      'Flawless packaging and tracked courier update at every step. A true luxury shopping experience on mobile.',
  },
];

export const Home = () => {
  const navigate = useNavigate();
  const [allListedProducts, setAllListedProducts] = useState([]);
  const [products, setProducts] = useState([]); // eslint-disable-line
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true); // eslint-disable-line
  const [catalogError, setCatalogError] = useState(''); // eslint-disable-line
  const [activeCategory, setActiveCategory] = useState('All'); // eslint-disable-line
  const [searchQuery, setSearchQuery] = useState(''); // eslint-disable-line
  const [sortBy, setSortBy] = useState('popular'); // eslint-disable-line

  useEffect(() => {
    fetchCollections()
      .then((cols) => setCollections(cols || []))
      .catch(() => {});

    // Load all listed products once for marquee & accurate collection counts
    fetchStoreProducts()
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setAllListedProducts(res.data);
        }
      })
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

  // Accurate counts across all collections
  const collectionCounts = React.useMemo(() => {
    const counts = { All: allListedProducts.length };
    allListedProducts.forEach((p) => {
      const slug = (p.collectionSlug || '').toLowerCase();
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [allListedProducts]);

  // Showcase products for top auto-moving belt: ONLY unassigned / storefront products (bina collection wale)
  // Products assigned to a collection stay inside their dedicated collection page and do NOT clutter the homepage!
  const marqueeProducts = React.useMemo(() => {
    return allListedProducts.filter((p) => {
      const slug = (p.collectionSlug || '').trim().toLowerCase();
      return !slug || slug === 'unassigned' || slug === '--unassigned--' || slug === 'none';
    });
  }, [allListedProducts]);

  const handleSelectCollectionCard = (slug) => {
    if (slug && slug !== 'All') {
      navigate(`/collection/${slug}`);
    } else {
      setActiveCategory('All');
      const catalogElement = document.getElementById('catalog');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });

  // Display ALL collections created by admin (not capped at 4!)
  const displayCollections = collections.length > 0 ? collections : DEFAULT_COLLECTIONS;
  const activeCollectionObj = displayCollections.find(
    (c) => (c.slug || '').toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* 1. 3D & Video Hero Banner */}
      <HeroBanner />

      {/* 2. Auto-Moving Signature Products Carousel (First Showcase Section) */}
      {marqueeProducts.length > 0 && (
        <section className="py-14 sm:py-18 border-b border-stone-200/80 overflow-hidden bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Signature Arrivals</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
                Trending Atelier Highlights
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Hover to pause · Scroll or tap any item to order directly
            </p>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar py-2">
            <div className={marqueeProducts.length >= 3 ? 'animate-marquee flex gap-6 px-4' : 'max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'}>
              {(marqueeProducts.length >= 3 ? [...marqueeProducts, ...marqueeProducts] : marqueeProducts).map((prod, index) => {
                const img = (prod.images && prod.images[0]) || '';
                return (
                  <Link
                    key={`${prod.id}-${index}`}
                    to={`/product/${prod.id}`}
                    className="group w-64 sm:w-72 shrink-0 bg-white border border-stone-200/80 rounded-3xl overflow-hidden hover-3d-card hover:border-amber-300/80 flex flex-col"
                  >
                    <div className="relative aspect-square bg-stone-100 overflow-hidden">
                      {img && (
                        <img
                          src={img}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-3 inset-x-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="block w-full py-2 bg-stone-950/95 text-white text-[10px] font-bold uppercase tracking-widest text-center rounded-xl">
                          Shop Now
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-semibold text-amber-700">
                          {prod.collectionSlug || prod.category || 'Atelier'}
                        </span>
                        <h3 className="font-serif text-sm font-medium text-stone-900 line-clamp-1 mt-0.5 group-hover:text-amber-700 transition-colors">
                          {prod.name}
                        </h3>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                        <span className="font-semibold text-stone-900 text-sm">
                          ${Number(prod.price || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-500 group-hover:text-stone-900 flex items-center">
                          Order <ArrowRight className="w-3 h-3 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Shopify-Style Collections Showcase Section (Shows ALL Admin Collections) */}
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
            Tap any collection below to view all pieces curated inside that department.
          </p>
        </div>

        {/* Dynamic Grid showing every collection with its matched or uploaded photo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCollections.map((col, idx) => {
            const img = getCollectionImage(col);
            const desc = col.description || 'Curated luxury pieces selected for our atelier catalog.';
            const count = collectionCounts[col.slug?.toLowerCase()] ?? 0;
            const isSelected = activeCategory.toLowerCase() === (col.slug || '').toLowerCase();

            return (
              <div
                key={col.slug || col.id || idx}
                onClick={() => handleSelectCollectionCard(col.slug || col.name)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-stone-900 border shadow-xs hover-3d-card h-80 flex flex-col justify-end p-6 ${
                  isSelected ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-stone-200/60'
                }`}
              >
                {/* Background Image with Smooth Zoom */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={img}
                    alt={col.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-65"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-stone-900/85 backdrop-blur-xs border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    <span>{count > 0 ? `${count} item${count === 1 ? '' : 's'}` : 'Atelier Curated'}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-white font-medium group-hover:text-amber-300 transition-colors">
                    {col.name}
                  </h3>

                  <p className="text-stone-300 text-xs line-clamp-2 font-light">
                    {desc}
                  </p>

                  <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-amber-400 group-hover:translate-x-1.5 transition-transform">
                    <span>Open Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>



      {/* 5. Client Testimonials & Reviews Section */}
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
                className="bg-[#faf8f5] border border-stone-200/80 rounded-3xl p-6 flex flex-col justify-between hover-3d-card relative"
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

      {/* 6. Brand Craftsmanship & Atelier Standards Spotlight */}
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
                  <p className="text-stone-400 mt-1">Encrypted 256-bit payment authorization with instant confirmation.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-700 bg-stone-800/60 p-8 sm:p-12 space-y-4 hover-3d-card">
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
