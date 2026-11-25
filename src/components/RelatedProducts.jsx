// src/components/RelatedProducts.jsx
import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { fetchStoreProducts } from '../services/api';

export const RelatedProducts = ({ currentProductId, category, collectionSlug, allProducts = [] }) => {
  const [items, setItems] = useState(allProducts);

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      setItems(allProducts);
      return;
    }

    let isMounted = true;
    async function loadRelated() {
      try {
        const res = await fetchStoreProducts();
        if (isMounted && res && Array.isArray(res.data)) {
          setItems(res.data);
        }
      } catch (err) {
        console.warn('Failed to load related store products:', err);
      }
    }

    loadRelated();
    return () => {
      isMounted = false;
    };
  }, [currentProductId, category, collectionSlug, allProducts]);

  // Priority 1: same collection
  // Priority 2: same category
  // Priority 3: other listed products
  const otherProducts = items.filter((p) => String(p.id) !== String(currentProductId));

  const sameCollection = collectionSlug
    ? otherProducts.filter((p) => p.collectionSlug === collectionSlug)
    : [];

  const sameCategory = category
    ? otherProducts.filter(
        (p) =>
          (p.category || '').toLowerCase() === category.toLowerCase() &&
          !sameCollection.some((sc) => sc.id === p.id)
      )
    : [];

  const remaining = otherProducts.filter(
    (p) =>
      !sameCollection.some((sc) => sc.id === p.id) &&
      !sameCategory.some((cat) => cat.id === p.id)
  );

  const related = [...sameCollection, ...sameCategory, ...remaining].slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            Curated Complements
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mt-2">
            You May Also Admire
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
