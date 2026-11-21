// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const image = (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    addToCart(product, 1, defaultVariant);
  };

  return (
    <div className="group relative flex flex-col bg-white border border-stone-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-stone-300 transition-all duration-300">
      {/* Product Image Area */}
      <Link to={`/product/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-stone-100 block">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.stock && product.stock <= 10 && (
            <span className="bg-amber-600/90 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-xs">
              Only {product.stock} Left
            </span>
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="bg-stone-900/90 text-gold-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-xs">
              Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Quick Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 py-2.5 px-3 bg-stone-900/95 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 backdrop-blur-sm shadow-md transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
          <div className="p-2.5 bg-white/95 hover:bg-white text-stone-900 rounded-xl backdrop-blur-sm shadow-md transition-colors">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
          <span className="uppercase tracking-widest text-[10px] font-semibold text-stone-400">
            {product.category || 'Atelier'}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            <span className="text-[11px] font-medium text-stone-700">
              {product.rating || '4.9'}
            </span>
            <span className="text-[10px] text-stone-400">
              ({product.reviewsCount || 42})
            </span>
          </div>
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
            {product.sku ? product.sku.split('-').slice(0, 3).join('-') : 'CJ-AURA'}
          </span>
          <div className="flex items-baseline space-x-2">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span className="font-semibold text-stone-900 text-sm sm:text-base">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
