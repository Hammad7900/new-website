// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const image = (product.images && product.images[0]) || '';

  return (
    <div className="group relative flex flex-col bg-white border border-stone-200/80 rounded-3xl overflow-hidden hover-3d-card hover:border-amber-300/60">
      {/* Product Image Area */}
      <Link to={`/product/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-stone-100 block">
        {image && (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        )}

        {/* Subtle Dark Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {Number.isFinite(product.stock) && product.stock > 0 && product.stock <= 10 && (
            <span className="bg-amber-600/95 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-xs">
              Only {product.stock} Left
            </span>
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="bg-stone-900/95 text-amber-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-xs">
              Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Quick Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <span className="py-2.5 px-4 bg-stone-950/95 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg backdrop-blur-md">
            <span>Shop Now & Options</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </span>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
          <span className="uppercase tracking-widest text-[10px] font-semibold text-stone-400">
            {product.category || 'Atelier Goods'}
          </span>
          <span className="text-[10px] text-stone-400">{product.stock ? `${product.stock} in stock` : 'Availability on request'}</span>
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`} className="block flex-1">
          <h3 className="font-serif font-medium text-stone-900 text-sm sm:text-base leading-snug hover:text-stone-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* SKU & Price */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-stone-400">
            {product.sku || 'SKU unavailable'}
          </span>
          <div className="flex items-baseline space-x-2">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span className="font-semibold text-stone-900 text-sm sm:text-base">
              {product.price === 0 ? 'FREE' : `$${product.price.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
