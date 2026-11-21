// src/components/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Award, ArrowRight, Check } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-gold-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Priority Shipping</h4>
              <p className="text-stone-400 text-xs mt-0.5">Tracked express air delivery</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-gold-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Buyer Protection</h4>
              <p className="text-stone-400 text-xs mt-0.5">Encrypted 256-bit checkout</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-gold-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">30-Day Guarantee</h4>
              <p className="text-stone-400 text-xs mt-0.5">Complimentary hassle-free returns</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-gold-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Artisanal Quality</h4>
              <p className="text-stone-400 text-xs mt-0.5">Individually quality-checked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="font-serif text-2xl tracking-[0.25em] text-white font-semibold">
              A U R A
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              A curated luxury atelier designed for connoisseurs of understated elegance. We connect exceptional manufacturing craftsmanship directly to discerning collectors worldwide.
            </p>
            <div className="pt-2 text-xs text-stone-500">
              Global Atelier Logistics: New York & European Centers
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-widest text-white">Collections</h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/" className="hover:text-gold-400 transition-colors">Horology & Timepieces</Link></li>
              <li><Link to="/" className="hover:text-gold-400 transition-colors">Vegetable-Tanned Leather</Link></li>
              <li><Link to="/" className="hover:text-gold-400 transition-colors">Acoustics & Wearables</Link></li>
              <li><Link to="/" className="hover:text-gold-400 transition-colors">Sculptural Home Living</Link></li>
              <li><a href="/#bestsellers" className="hover:text-gold-400 transition-colors">Bestsellers</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-widest text-white">Concierge</h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Client Support</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Track Consignment</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">Privacy & Terms</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Private Advisory</Link></li>
              <li><Link to="/admin" className="text-stone-500 hover:text-stone-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-widest text-white">Privilege Club</h5>
            <p className="text-xs text-stone-400 leading-relaxed">
              Subscribe to receive exclusive access to limited atelier drops and save 10% with code <span className="font-mono text-gold-400 font-semibold">SAVE10</span>.
            </p>
            {subscribed ? (
              <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />
                <span>Welcome to the Atelier. Use code <strong>SAVE10</strong> at checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1.5 p-1.5 bg-stone-800 hover:bg-gold-500 hover:text-stone-950 text-white rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
        <div>
          © {new Date().getFullYear()} AURA Atelier Essentials Inc. All rights reserved.
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <span className="font-medium text-stone-400">256-Bit SSL Encrypted</span>
          <span>•</span>
          <span className="font-medium text-stone-400">Direct Express Delivery</span>
        </div>
      </div>
    </footer>
  );
};
