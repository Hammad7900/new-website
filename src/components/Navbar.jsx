// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Shield, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { itemCount, shippingRate } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Announcement Bar - Clean white-label */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
        <span>CURATED CJ PRODUCTS · ${Number(shippingRate || 0).toFixed(2)} SHIPPING PER ORDER</span>
        <span className="hidden md:inline text-stone-500">•</span>
              <span className="hidden md:inline text-stone-400">FINAL TOTAL AT CHECKOUT</span>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-700 hover:text-black focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8 text-xs font-semibold tracking-widest uppercase">
              <Link
                to="/"
                className={`transition-colors py-1 relative ${
                  isActive('/') ? 'text-stone-950 font-bold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Collection
                {isActive('/') && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-stone-900"></span>
                )}
              </Link>
              <a
                href="/#catalog"
                className="text-stone-600 hover:text-stone-950 transition-colors py-1"
              >
                Best Sellers
              </a>
              <Link
                to="/contact"
                className={`transition-colors py-1 relative ${
                  isActive('/contact') ? 'text-stone-950 font-bold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Concierge
                {isActive('/contact') && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-stone-900"></span>
                )}
              </Link>
              <Link
                to="/privacy-policy"
                className="text-stone-600 hover:text-stone-950 transition-colors py-1"
              >
                Heritage
              </Link>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-none text-center">
              <Link to="/" className="inline-block group">
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-stone-900 font-semibold block transition-transform group-hover:scale-[1.01]">
                  A U R A
                </span>
                <span className="text-[9px] tracking-[0.35em] text-stone-400 uppercase -mt-0.5 block font-medium">
                  Atelier & Goods
                </span>
              </Link>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Admin Portal Shortcut */}
              <Link
                to="/admin"
                title="Management Portal"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-stone-900" />
                <span className="hidden sm:inline">Admin</span>
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full text-stone-800 hover:text-black hover:bg-stone-100 transition-colors"
                title="View Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#faf8f5] border-b border-stone-200 px-6 py-6 space-y-4 animate-fade-in">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold tracking-wider uppercase text-stone-900 py-2 border-b border-stone-100"
            >
              Collection
            </Link>
            <a
              href="/#catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold tracking-wider uppercase text-stone-700 py-2 border-b border-stone-100"
            >
              Best Sellers
            </a>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold tracking-wider uppercase text-stone-700 py-2 border-b border-stone-100"
            >
              Customer Concierge
            </Link>
            <Link
              to="/privacy-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold tracking-wider uppercase text-stone-700 py-2 border-b border-stone-100"
            >
              Privacy Policy & Terms
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold tracking-wider uppercase text-stone-800 py-2"
            >
              Admin Dashboard
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
