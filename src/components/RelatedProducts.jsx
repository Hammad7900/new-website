// src/components/RelatedProducts.jsx
import React from 'react';
import { ProductCard } from './ProductCard';

export const RelatedProducts = ({ currentProductId, category, allProducts = [] }) => {
  // Filter products by same category, excluding current product
  const related = allProducts
    .filter((p) => p.id !== currentProductId && (category ? p.category === category : true))
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
            Curated Complements
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mt-1">
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
