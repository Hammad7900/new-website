// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { RelatedProducts } from '../components/RelatedProducts';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const prod = await fetchProductById(id);
        const catalog = await fetchProducts({ pageSize: 50 });
        if (isMounted) {
          setProduct(prod);
          if (prod && prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
          if (catalog && catalog.data) {
            setAllProducts(catalog.data);
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-stone-200 rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-4 bg-stone-200 rounded w-1/4"></div>
            <div className="h-8 bg-stone-200 rounded w-3/4"></div>
            <div className="h-6 bg-stone-200 rounded w-1/3"></div>
            <div className="h-24 bg-stone-200 rounded"></div>
            <div className="h-12 bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="font-serif text-2xl text-stone-900 mb-4">Product Not Found</h2>
        <p className="text-stone-500 text-xs mb-8">The requested piece may have been archived.</p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-stone-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Collection
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.price;
  const currentSku = selectedVariant?.sku || product.sku;
  const currentStock = selectedVariant?.stock || product.stock || 50;
  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Breadcrumb */}
      <div className="bg-stone-100/60 border-b border-stone-200/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs text-stone-500 font-medium">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link to="/" className="hover:text-stone-900 transition-colors">{product.category}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Gallery */}
          <div className="space-y-4 sticky top-28">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-sm relative group">
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                <div className="absolute top-4 left-4 bg-stone-900 text-gold-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Privilege Saving
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx
                        ? 'border-stone-900 ring-2 ring-stone-900/20 shadow-sm'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="uppercase tracking-widest font-semibold text-stone-400">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center text-gold-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-stone-800 text-xs">{product.rating || '4.9'}</span>
                  <span className="text-stone-400 text-xs">({product.reviewsCount || 48} reviews)</span>
                </div>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 text-xs pb-5 border-b border-stone-200">
                <span className="text-stone-400 font-mono">
                  REF: <strong className="text-stone-700">{currentSku}</strong>
                </span>
                <span className="text-stone-300">•</span>
                <span className="inline-flex items-center text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                  {currentStock <= 10 ? `Only ${currentStock} pieces remaining in atelier` : 'In Stock — Ready for Express Dispatch'}
                </span>
              </div>

              <div className="mt-5 flex items-baseline space-x-3">
                <span className="font-serif text-3xl font-semibold text-stone-950">
                  ${currentPrice.toFixed(2)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-stone-500">USD • Taxes Included</span>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Select Edition: <span className="text-stone-500 font-normal">{selectedVariant?.name}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.vid === v.vid;
                    return (
                      <button
                        key={v.vid}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                        }`}
                      >
                        <div className="font-semibold">{v.name}</div>
                        <div className="flex items-center justify-between mt-1 text-[11px] opacity-80">
                          <span>${v.price.toFixed(2)}</span>
                          <span>Stock: {v.stock}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-stone-300 rounded-full bg-white px-2 py-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-stone-600 hover:text-black transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-semibold text-xs text-stone-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-2 text-stone-600 hover:text-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Bag</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-4 px-6 bg-gold-500 hover:bg-gold-600 text-stone-950 text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Instant Express Checkout
              </button>
            </div>

            {/* Added Toast */}
            {addedToast && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center justify-between animate-slide-up">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Added <strong>{product.name}</strong> to your bag.</span>
                </div>
                <Link to="/cart" className="underline font-bold text-emerald-900 hover:text-black">
                  View Bag & Checkout
                </Link>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200 text-center">
              <div className="p-3 bg-white rounded-2xl border border-stone-200/80">
                <Truck className="w-5 h-5 mx-auto text-stone-700 mb-1" />
                <div className="text-[11px] font-bold uppercase text-stone-800">Priority Courier</div>
                <div className="text-[10px] text-stone-400">4-8 Days Air Priority</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-stone-200/80">
                <ShieldCheck className="w-5 h-5 mx-auto text-stone-700 mb-1" />
                <div className="text-[11px] font-bold uppercase text-stone-800">Secure Vault</div>
                <div className="text-[10px] text-stone-400">100% Encrypted Payment</div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-stone-200/80">
                <RotateCcw className="w-5 h-5 mx-auto text-stone-700 mb-1" />
                <div className="text-[11px] font-bold uppercase text-stone-800">30-Day Returns</div>
                <div className="text-[10px] text-stone-400">Complimentary Return Label</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex border-b border-stone-200 space-x-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
                    activeTab === 'description' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Description
                  {activeTab === 'description' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-stone-900"></span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('features')}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
                    activeTab === 'features' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Specifications
                  {activeTab === 'features' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-stone-900"></span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
                    activeTab === 'shipping' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Shipping & Dispatch
                  {activeTab === 'shipping' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-stone-900"></span>
                  )}
                </button>
              </div>

              <div className="py-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                {activeTab === 'description' && (
                  <p>{product.description}</p>
                )}
                {activeTab === 'features' && (
                  <ul className="space-y-2">
                    {product.features && product.features.length > 0 ? (
                      product.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Master atelier craftsmanship guaranteed.</span>
                      </li>
                    )}
                  </ul>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>
                      Orders placed on AURA are prepared with white-glove care and dispatched from our primary international distribution hubs.
                    </p>
                    <p>
                      • US & Canada Delivery: 3-7 business days via Tracked Priority<br />
                      • UK & Europe Delivery: 4-8 business days via Royal Mail / DHL<br />
                      • Direct tracking code provided via SMS & Email upon courier receipt.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts
          currentProductId={product.id}
          category={product.category}
          allProducts={allProducts}
        />
      </div>
    </div>
  );
};
