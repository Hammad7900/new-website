// src/pages/store/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { fetchProductDetail } from '../../services/api';
import { RelatedProducts } from '../../components/RelatedProducts';
import {
  Star,
  Check,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  Sparkles,
  Lock,
  Zap,
  ArrowRight,
} from 'lucide-react';

function formatDescription(desc) {
  if (!desc) return '';
  let cleaned = String(desc);

  // Decode escaped HTML tags first if any (e.g. &lt;p&gt; -> <p>)
  cleaned = cleaned
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ');

  // Strip all images, script, style tags and URLs
  cleaned = cleaned
    .replace(/<img[^>]*>/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/https?:\/\/[^\s"'<>]+(?:jpg|jpeg|png|gif|webp)[^\s"'<>]*/gi, '')
    .replace(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?cjdropshipping\.com[^\s"'<>]*/gi, '');

  // Convert line breaks and paragraph tags into clean newlines
  cleaned = cleaned
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ''); // strip any remaining tags

  // Second pass decode for any remaining entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  // Split, trim, remove empty lines
  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('src=') && !line.startsWith('http'));

  return lines.join('\n\n');
}

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
    let isMounted = true;
    setLoading(true);
    setSelectedImage(0);
    setError(null);

    fetchProductDetail(id)
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
        if (data?.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        } else if (data) {
          setSelectedVariant({ vid: data.id || 'default', name: 'Standard Edition', price: data.price || 0 });
        }
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(e.message || 'Could not load item details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const variantToUse =
      selectedVariant || { vid: product.id || 'default', name: 'Standard Edition', price: product.price || 0 };
    addToCart(product, quantity, variantToUse);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const variantToUse =
      selectedVariant || { vid: product.id || 'default', name: 'Standard Edition', price: product.price || 0 };
    addToCart(product, quantity, variantToUse);
    navigate('/checkout');
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
        <h2 className="font-serif text-2xl text-stone-800 mb-4">{error || 'Item not found'}</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-black transition-colors"
        >
          Return to Collection
        </button>
      </div>
    );
  }

  const images = (product.images || []).filter(Boolean);
  const price = selectedVariant?.price ?? product.price;
  const descriptionParagraphs = formatDescription(product.description).split('\n\n');

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
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/60 shadow-xs">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-stone-700" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((i) => (i + 1) % images.length)
                    }
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
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
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === i
                        ? 'border-stone-900 ring-2 ring-stone-900/10'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="py-2 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 inline-block mb-3">
                {product.category || 'Atelier Goods'}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-stone-900 leading-tight">
                {product.name}
              </h1>
              {product.rating > 0 && product.reviewsCount > 0 && (
                <div className="flex items-center space-x-3 mt-3">
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
                    ({product.reviewsCount} verified client reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price Area */}
            <div className="flex items-baseline space-x-4 pb-4 border-b border-stone-200/80">
              <span className="font-serif text-3xl sm:text-4xl text-stone-900 font-semibold">
                ${price.toFixed(2)} USD
              </span>
              {product.compareAtPrice && product.compareAtPrice > price && (
                <span className="text-base sm:text-lg text-stone-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Cleaned Description (No raw HTML tags!) */}
            {descriptionParagraphs.length > 0 && (
              <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed max-h-56 overflow-y-auto pr-2">
                {descriptionParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            )}

            {/* Smart Variant Selector (Image 3 fix) */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Specification Variant ({product.variants.length} available)
                  </label>
                  {selectedVariant && (
                    <span className="text-[11px] text-stone-400 font-mono">
                      Ref: {selectedVariant.sku || selectedVariant.vid}
                    </span>
                  )}
                </div>

                {product.variants.length <= 6 ? (
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.vid}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedVariant?.vid === v.vid
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedVariant?.vid || ''}
                      onChange={(e) => {
                        const chosen = product.variants.find((v) => v.vid === e.target.value);
                        if (chosen) setSelectedVariant(chosen);
                      }}
                      className="w-full px-4 py-3 text-xs bg-white border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-stone-900 cursor-pointer appearance-none shadow-xs pr-10"
                    >
                      {product.variants.map((v) => (
                        <option key={v.vid} value={v.vid}>
                          {v.name} {v.price ? `— $${v.price.toFixed(2)}` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                      ▼
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4 text-stone-600" />
                </button>
                <span className="font-serif text-lg font-semibold text-stone-900 w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            </div>

            {/* Direct Order & Cart Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!product}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 group"
              >
                <Zap className="w-4 h-4 fill-stone-950" />
                <span>Shop Now · Direct Order (${(price * quantity).toFixed(2)})</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product}
                  className={`flex-1 py-3.5 px-6 rounded-2xl font-semibold text-xs uppercase tracking-wider transition-all shadow-sm hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer ${
                    addedToCart
                      ? 'bg-emerald-600 text-white'
                      : product
                      ? 'bg-stone-900 hover:bg-black text-white'
                      : 'bg-stone-300 text-stone-600 cursor-not-allowed'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Shopping Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
                <Link
                  to="/cart"
                  className="py-3.5 px-6 rounded-2xl border border-stone-300 hover:border-stone-900 bg-white text-stone-800 font-semibold text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5 flex items-center justify-center"
                >
                  View Bag
                </Link>
              </div>
            </div>

            {/* 3 Balanced Luxury Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
              {[
                { Icon: Truck, label: 'Global Insured Delivery' },
                { Icon: Lock, label: '256-Bit SSL Settlement' },
                { Icon: ShieldCheck, label: 'Verified Atelier Goods' },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-white border border-stone-200/70 hover-3d-card"
                >
                  <Icon className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <RelatedProducts
            currentProductId={product.id}
            category={product.category}
            collectionSlug={product.collectionSlug}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
