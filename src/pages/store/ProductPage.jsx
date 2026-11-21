// src/pages/store/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { fetchProductById } from '../../services/api';
import { RelatedProducts } from '../../components/RelatedProducts';
import {
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  Minus,
  Plus,
  Check,
  ArrowLeft,
} from 'lucide-react';

export const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchProductById(id)
      .then((p) => {
        if (p) {
          setProduct(p);
          setSelectedVariant(p.variants?.[0] || null);
        } else {
          setError('Product not found.');
        }
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedVariant?.vid) return;
    addToCart(product, quantity, selectedVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-stone-200 rounded-3xl aspect-square"></div>
          <div className="space-y-4 py-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-stone-200 rounded w-3/4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="font-serif text-2xl text-stone-800 mb-4">{error || 'Product not found'}</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-black transition-colors"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const images = (product.images || []).filter(Boolean);
  const price = selectedVariant?.price ?? product.price;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collection</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/60">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <ShoppingBag className="w-20 h-20" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((i) => (i - 1 + images.length) % images.length)
                    }
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-stone-700" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((i) => (i + 1) % images.length)
                    }
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-stone-700" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-stone-900'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="py-4 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              {product.category || 'CJ Product'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-2 leading-tight">
                {product.name}
              </h1>
              {product.rating > 0 && product.reviewsCount > 0 && <div className="flex items-center space-x-3 mt-3">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-stone-500">
                  ({product.reviewsCount} reviews)
                </span>
              </div>}
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-serif text-4xl text-stone-900">
                {price === 0 ? 'FREE' : `$${price.toFixed(2)}`}
              </span>
              {product.compareAtPrice && product.compareAtPrice > price && (
                <span className="text-lg text-stone-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-stone-600 text-sm leading-relaxed">
              {product.description}
            </p>

            {product.features && (
              <ul className="space-y-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center space-x-2 text-xs text-stone-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {product.variants && product.variants.length > 1 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.vid}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        selectedVariant?.vid === v.vid
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                >
                  <Minus className="w-4 h-4 text-stone-600" />
                </button>
                <span className="font-serif text-xl font-semibold text-stone-900 w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                >
                  <Plus className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant?.vid}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : selectedVariant?.vid ? 'bg-stone-900 hover:bg-black text-white' : 'bg-stone-300 text-stone-600 cursor-not-allowed'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>{selectedVariant?.vid ? 'Add to Cart' : 'Not orderable'}</span>
                  </>
                )}
              </button>
              <Link
                to="/cart"
                className="py-4 px-5 rounded-2xl border border-stone-200 hover:border-stone-400 text-stone-700 font-semibold text-sm uppercase tracking-wider transition-colors flex items-center justify-center"
              >
                Cart
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
              {[
                { Icon: Shield, label: 'Whop checkout' },
                { Icon: Truck, label: 'Shipping fee shown at checkout' },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-xl bg-stone-50"
                >
                  <Icon className="w-5 h-5 text-stone-600" />
                  <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-wide">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <RelatedProducts currentProductId={product.id} category={product.category} />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
