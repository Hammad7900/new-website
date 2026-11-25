// src/components/HeroBanner.jsx
import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Clock, Award } from 'lucide-react';

export const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden bg-stone-950 text-white py-16 sm:py-24 lg:py-32">
      {/* Background Ambience and 3D Radial Glow */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-stone-950 via-[#181512] to-stone-900 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-stone-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, CTAs, Accents */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Atelier Curation 2026 · Worldwide Insured</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08]">
              Quiet Luxury. <br />
              <span className="italic font-normal bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                Effortless
              </span>{' '}
              Precision.
            </h1>

            {/* Description */}
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
              Explore our boutique atelier catalog of timeless timepieces, fine leather goods, and refined essentials. Direct origin dispatch with guaranteed 256-bit encrypted checkout.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#catalog"
                className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-500/30 group"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#collections"
                className="inline-flex items-center justify-center px-8 py-4 bg-stone-900/90 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-widest rounded-full border border-stone-700/80 transition-colors"
              >
                <span>Browse Categories</span>
              </a>
            </div>

            {/* Trust highlights row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-800/80">
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-white uppercase tracking-wider">Fast Courier</div>
                  <div className="text-[10px] text-stone-400">Tracked worldwide</div>
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-white uppercase tracking-wider">Protected</div>
                  <div className="text-[10px] text-stone-400">Whop 256-bit SSL</div>
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-white uppercase tracking-wider">Quality Pure</div>
                  <div className="text-[10px] text-stone-400">Verified pieces</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Perspective Floating Luxury Visuals */}
          <div className="lg:col-span-5 relative perspective-1000 flex justify-center items-center py-6">
            {/* Primary 3D Floating Showcase Card */}
            <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-stone-800/90 to-stone-900/95 border border-stone-700/70 p-6 card-3d-shadow preserve-3d animate-float-3d">
              {/* Top Accent */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Featured Atelier
                </span>
                <span className="text-[11px] text-stone-400 font-mono">Series № 2026</span>
              </div>

              {/* Showcase Image Mockup */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-900 border border-stone-700/50 mb-5 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent z-10 opacity-70" />
                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
                  alt="Luxury Timepiece Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="text-xs uppercase tracking-wider font-semibold text-amber-300">Limited Edition</div>
                  <div className="font-serif text-lg text-white">Chronograph Atelier</div>
                </div>
              </div>

              {/* Card Meta */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-700/50 text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Insured Courier</span>
                  <span className="text-white font-semibold">Tiered Dispatch</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Payment</span>
                  <span className="text-amber-400 font-semibold font-mono">Whop Secure</span>
                </div>
              </div>
            </div>

            {/* Floating Satellite 3D Card (Top-Right Badge) */}
            <div className="hidden sm:flex absolute -top-4 -right-4 bg-stone-900/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-xl items-center space-x-3 preserve-3d animate-float-reverse-3d z-20">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Instant Processing</div>
                <div className="text-xs font-bold text-white">24/7 Verified Dispatch</div>
              </div>
            </div>

            {/* Floating Satellite 3D Card (Bottom-Left Badge) */}
            <div className="hidden sm:flex absolute -bottom-6 -left-4 bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-2xl p-4 shadow-xl items-center space-x-3 preserve-3d animate-float-3d z-20">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Authentication</div>
                <div className="text-xs font-bold text-white">100% Quality Inspected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
