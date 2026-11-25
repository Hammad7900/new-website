// src/components/HeroBanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Award,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Crown,
  Scissors,
  CheckCircle2,
} from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'Haute Horology & Virgin Hair Atelier · Series 2026',
    titleLine1: 'Undetectable HD Lace.',
    titleHighlight: '100% Raw Virgin',
    titleLine2: 'Human Hair Wigs.',
    description:
      'Engineered with Swiss invisible melting HD lace, pre-bleached ultra-fine single knots, and 100% cuticle-aligned raw virgin hair. Ready to wear glueless perfection.',
    specs: [
      { label: 'Hair Grade', val: '12A Single Donor' },
      { label: 'Lace System', val: 'Ultra Swiss HD Lace' },
      { label: 'Density Range', val: '180% – 250% Density' },
      { label: 'Hairline', val: 'Pre-Plucked Baby Hairs' },
    ],
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
    badge: '13x6 HD Frontal',
  },
  {
    id: 2,
    tag: 'Glueless Wear & Go Innovation',
    titleLine1: 'Zero Adhesive Needed.',
    titleHighlight: '30-Second Fit',
    titleLine2: 'Natural Hairline.',
    description:
      'Pre-cut 3D dome cap with upgraded silicone anti-slip grip and adjustable elastic band. Breathable, secure, and gentle on your natural edges.',
    specs: [
      { label: 'Cap Design', val: '3D Ergonomic Dome' },
      { label: 'Knots', val: 'Micro Clean Bleached' },
      { label: 'Longevity', val: '3+ Years with Care' },
      { label: 'Texture', val: 'Silky Bone Straight' },
    ],
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80',
    badge: 'Wear & Go Glueless',
  },
  {
    id: 3,
    tag: 'Bespoke Textures & Horology Curation',
    titleLine1: 'Lustrous Waves.',
    titleHighlight: 'Couture Volumes',
    titleLine2: '& Timepieces.',
    description:
      'From luxurious Deep Wave bundles and Balayage lace wigs to timeless horology timepieces and artisan leather goods. Direct insured origin dispatch.',
    specs: [
      { label: 'Dyeing / Heat', val: 'Bleach up to #613' },
      { label: 'Origins', val: 'Raw Brazilian & Indian' },
      { label: 'Dispatch', val: 'Insured Tracked Courier' },
      { label: 'Checkout', val: '256-Bit Encrypted' },
    ],
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    badge: 'Raw Body Wave',
  },
];

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Auto transition slides every 6.5s
  useEffect(() => {
    if (!isPlaying) return;
    autoPlayTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);

    return () => clearInterval(autoPlayTimerRef.current);
  }, [isPlaying]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative overflow-hidden bg-stone-950 text-white min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center">
      {/* Background Ambience and Video Layer */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Video Background with Luxury Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-stone-950">
          <video
            ref={videoRef}
            key={slide.id}
            src={slide.videoSrc}
            poster={slide.poster}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-25 scale-105 filter blur-xs transition-opacity duration-1000"
          />
        </div>

        {/* Multi-layer luxury overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-900/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/70 z-10" />

        {/* Glowing atmospheric orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow z-10" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-stone-700/20 rounded-full blur-3xl pointer-events-none z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, CTAs, Accents */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest shadow-inner backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{slide.tag}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.12]">
              {slide.titleLine1} <br />
              <span className="italic font-normal bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                {slide.titleHighlight}
              </span>{' '}
              {slide.titleLine2}
            </h1>

            {/* Description */}
            <p className="text-stone-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-light">
              {slide.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <a
                href="#catalog"
                className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-500/30 group"
              >
                <span>Shop Virgin Wigs & Hair</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#collections"
                className="inline-flex items-center justify-center px-8 py-4 bg-stone-900/90 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-widest rounded-full border border-stone-700/80 transition-colors"
              >
                <span>Explore All Collections</span>
              </a>
            </div>

            {/* Trust highlights row */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-800/80">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-semibold text-white uppercase tracking-wider">Fast Courier</div>
                  <div className="text-[9px] text-stone-400">Insured Worldwide</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-semibold text-white uppercase tracking-wider">Lace Melt</div>
                  <div className="text-[9px] text-stone-400">Natural Scalp Finish</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-semibold text-white uppercase tracking-wider">Raw Virgin</div>
                  <div className="text-[9px] text-stone-400">100% Human Hair</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Perspective Floating Luxury Visual Card */}
          <div className="lg:col-span-5 relative perspective-1000 flex flex-col justify-center items-center py-4">
            {/* Primary 3D Floating Showcase Card */}
            <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-stone-900/95 to-stone-950/95 border border-stone-700/80 p-6 card-3d-shadow preserve-3d animate-float-3d">
              {/* Top Accent */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>{slide.badge}</span>
                </span>
                <span className="text-[11px] text-stone-400 font-mono">№ 0{slide.id} / 03</span>
              </div>

              {/* Showcase Image / Poster */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-900 border border-stone-700/60 mb-5 group">
                <img
                  src={slide.poster}
                  alt={slide.titleLine1}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-300">
                      Handcrafted Atelier
                    </div>
                    <div className="font-serif text-base text-white">{slide.titleHighlight}</div>
                  </div>
                  <span className="text-[10px] bg-stone-900/90 text-stone-300 px-2 py-1 rounded-md border border-stone-700 font-mono">
                    HD Pure
                  </span>
                </div>
              </div>

              {/* 4 Technical Specification Chips */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                {slide.specs.map((sp) => (
                  <div key={sp.label} className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
                    <span className="text-[9px] text-stone-400 uppercase tracking-wider block font-semibold">
                      {sp.label}
                    </span>
                    <span className="text-white text-[11px] font-medium mt-0.5 block truncate">
                      {sp.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Controls Bar */}
            <div className="flex items-center justify-between w-full max-w-sm mt-5 px-2">
              <div className="flex items-center space-x-2">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                  className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  title="Previous slide"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                  className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  title="Next slide"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
