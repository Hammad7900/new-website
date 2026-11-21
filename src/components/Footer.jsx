import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="bg-stone-950 text-stone-300 pt-12 pb-8 border-t border-stone-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-10 border-b border-stone-800">
        <div>
          <div className="font-serif text-2xl tracking-[0.25em] text-white font-semibold">A U R A</div>
          <p className="text-stone-400 text-xs leading-relaxed mt-3 max-w-sm">
            Products are free. The store shipping fee is shown in the cart and at checkout.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white mb-3">Store</h2>
          <ul className="space-y-2 text-xs text-stone-400">
            <li><Link to="/#catalog" className="hover:text-white">Browse CJ products</Link></li>
            <li><Link to="/cart" className="hover:text-white">Shopping cart</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy policy</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white mb-3">Help</h2>
          <ul className="space-y-2 text-xs text-stone-400">
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/admin/login" className="hover:text-white">Admin login</Link></li>
          </ul>
        </div>
      </div>
      <div className="pt-6 text-xs text-stone-500">© {new Date().getFullYear()} AURA</div>
    </div>
  </footer>
);

export default Footer;
