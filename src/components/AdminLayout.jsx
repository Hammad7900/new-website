// src/components/AdminLayout.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Tag,
  LogOut,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

export const AdminLayout = ({ children, title = 'Dashboard' }) => {
  const { logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Customer Orders', path: '/admin/orders', icon: PackageCheck },
    { label: 'CJ Products Catalog', path: '/admin/products', icon: ShoppingBag },
    { label: 'Discount Coupons', path: '/admin/coupons', icon: Tag },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-stone-950 text-white shrink-0 flex flex-col justify-between p-6">
        <div>
          {/* Brand */}
          <div className="mb-8">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-2xl tracking-[0.2em] text-white font-semibold block">
                A U R A
              </span>
              <span className="text-[9px] tracking-[0.3em] text-gold-400 uppercase block font-medium">
                Admin Management
              </span>
            </Link>
          </div>

          {/* CJ Integration Status Badge */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 mb-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-stone-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>CJ Dropshipping API</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Netlify Functions Active (/api/cj-*)
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-white text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-stone-800 space-y-2 mt-8">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Customer Storefront</span>
            </span>
            <span className="text-[10px] text-stone-500">Live</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200/80 px-6 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-stone-900 font-medium">
              {title}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Netlify Serverless Backend • Whop Checkout • CJ Dropshipping Pipeline
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
              <Shield className="w-3.5 h-3.5 text-stone-900" />
              <span className="hidden sm:inline">Root Administrator</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
