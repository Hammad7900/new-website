// src/pages/store/CollectionPage.jsx
// Dedicated page for a single collection: /collection/:slug
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCollections, fetchStoreProducts } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { ArrowLeft, Package, Grid3X3, ChevronRight, Loader2 } from 'lucide-react';
import { BRAND } from '../../config/constants';
import { getCollectionImage } from './Home';

export const CollectionPage = () => {
  const { slug } = useParams();
  const [collections, setCollections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetchCollections().catch(() => []),
      fetchStoreProducts({ limit: 200 }).then((r) => r.data || []).catch(() => []),
    ]).then(([cols, prods]) => {
      if (mounted) {
        setCollections(Array.isArray(cols) ? cols : []);
        setAllProducts(Array.isArray(prods) ? prods : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [slug]);

  const collection = useMemo(() => {
    const s = (slug || '').trim().toLowerCase();
    return collections.find(
      (c) =>
        (c.slug || '').trim().toLowerCase() === s ||
        (c.id || '').trim().toLowerCase() === s ||
        (c.name || '').trim().toLowerCase() === s
    );
  }, [collections, slug]);

  const products = useMemo(() => {
    const s = (slug || '').trim().toLowerCase();
    const cSlug = (collection?.slug || '').trim().toLowerCase();
    const cId = (collection?.id || '').trim().toLowerCase();
    const cName = (collection?.name || '').trim().toLowerCase();

    return allProducts.filter((p) => {
      const pCol = (p.collectionSlug || '').trim().toLowerCase();
      if (!pCol) return false;
      return pCol === s || pCol === cSlug || pCol === cId || pCol === cName;
    });
  }, [allProducts, slug, collection]);

  const otherCollections = useMemo(
    () =>
      collections
        .filter(
          (c) =>
            (c.slug || '').toLowerCase() !== (slug || '').toLowerCase() &&
            (c.id || '').toLowerCase() !== (slug || '').toLowerCase()
        )
        .slice(0, 6),
    [collections, slug]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4 text-center">
        <Package className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="font-serif text-2xl text-stone-900 mb-2">Collection Not Found</h2>
        <p className="text-sm text-stone-500 mb-6">
          The department you are looking for does not exist or may have moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-widest rounded-full hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>
    );
  }

  const heroImage = collection.image || getCollectionImage(collection, products);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden bg-stone-900">
        {heroImage ? (
          <img
            src={heroImage}
            alt={collection.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/30 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-6">
          <nav className="flex items-center gap-2 text-stone-300 text-xs">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-stone-500" />
            <span className="text-amber-400 font-semibold uppercase tracking-wider">
              {collection.name}
            </span>
          </nav>
        </div>

        {/* Collection Title */}
        <div className="absolute bottom-8 left-6 right-6">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">
            {BRAND.shortName} · Atelier Curated
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-2 leading-tight">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-stone-300 text-sm max-w-2xl leading-relaxed">
              {collection.description}
            </p>
          )}
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
            <Grid3X3 className="w-3 h-3 text-amber-400" />
            {products.length} {products.length === 1 ? 'piece' : 'pieces'} available
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-stone-500 text-xs hover:text-stone-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to All Collections
        </Link>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Package className="w-14 h-14 text-stone-200 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-stone-700 mb-2">
              Atelier pieces coming soon
            </h3>
            <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
              Our curators are hand-selecting the finest pieces for this department.
              Check back shortly or browse another collection below.
            </p>
          </div>
        )}

        {/* Other Collections */}
        {otherCollections.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-100">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-1">
              Continue Exploring
            </p>
            <h2 className="font-serif text-2xl text-stone-900 mb-6">Other Departments</h2>
            <div className="flex flex-wrap gap-3">
              {otherCollections.map((col) => (
                <Link
                  key={col.id || col.slug}
                  to={`/collection/${col.slug}`}
                  className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-full text-sm text-stone-700 hover:border-stone-800 hover:text-stone-900 hover:bg-stone-50 transition-all"
                >
                  <img
                    src={col.image || getCollectionImage(col, allProducts)}
                    alt={col.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  {col.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
