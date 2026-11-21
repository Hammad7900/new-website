// src/components/HeroBanner.jsx
import React from 'react';
import { ArrowRight, Sparkles, Shield, Compass } from 'lucide-react';

export const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden bg-stone-950 text-white py-20 lg:py-32">
      {/* Background Image with luxury dark gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury Store Hero"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Subtle Tag */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-gold-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 Curated Atelier Drop</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08] mb-6">
            Quiet Luxury. <br />
            <span className="italic font-normal text-stone-300">Effortless</span> Precision.
          </h1>

          {/* Description */}
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl font-light">
            Individually sourced goods crafted with exceptional European and Asian craftsmanship. Delivered worldwide with priority express dispatch and secure 256-bit encrypted checkout.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-950 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gold-400 transition-all duration-300 shadow-lg hover:shadow-gold-500/20 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href="#bestsellers"
              className="inline-flex items-center justify-center px-8 py-4 bg-stone-900/80 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-widest rounded-full border border-stone-700 transition-colors"
            >
              <span>View Bestsellers</span>
            </a>
          </div>

          {/* Highlights */}
          <div className="mt-12 pt-8 border-t border-stone-800/80 grid grid-cols-3 gap-6">
            <div>
              <div className="font-serif text-2xl font-semibold text-white">4.9 / 5</div>
              <div className="text-stone-400 text-xs mt-0.5">Verified Reviews</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-white">100%</div>
              <div className="text-stone-400 text-xs mt-0.5">Master Quality</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-white">24-48h</div>
              <div className="text-stone-400 text-xs mt-0.5">Dispatch Target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
