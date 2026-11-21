// src/pages/PrivacyPolicy.jsx
import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Legal & Security
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 mt-2">
            Privacy Policy & Terms
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-3 font-light">
            Effective Date: January 1, 2026 • Last updated: November 2026
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-12 shadow-xs space-y-10 text-stone-700 text-xs sm:text-sm leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-stone-900 font-medium">
              1. Overview & Commitment
            </h2>
            <p>
              At AURA Atelier Essentials ("we", "our", or "us"), we respect your personal privacy. This Privacy Policy discloses our data collection, handling, and security practices for users across our digital storefront and fulfillment operations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-stone-900 font-medium">
              2. Information We Collect
            </h2>
            <p>
              When an acquisition is placed on our storefront, we collect relevant transaction details including customer name, billing and physical delivery addresses, electronic mail, telephone contact, and ordered product specifications.
            </p>
            <p>
              We do <strong>not</strong> store full credit card numbers or sensitive CVV security codes on our internal servers. All transaction billing is securely tokenized and handled through certified PCI-DSS Level 1 compliant financial payment processing gateways.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-stone-900 font-medium">
              3. Order Fulfillment & Logistics
            </h2>
            <p>
              In order to deliver your purchased goods directly from regional craft facilities, order consignment details (recipient name, shipping destination address, contact phone, and item SKU/VID) are securely transmitted via encrypted channels to our vetted international carrier and warehouse distribution network.
            </p>
            <p>
              Our fulfillment partners coordinate customs clearance, packaging, and local courier delivery (USPS, DHL, Royal Mail, FedEx) to ensure safe, expedited arrival at your residence.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-stone-900 font-medium">
              4. Payment Protection
            </h2>
            <p>
              Payments processed on our platform are protected under industry-leading PCI-DSS Level 1 security standards with end-to-end 256-bit SSL encryption. All transactions include automatic fraud screening and buyer protection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-stone-900 font-medium">
              5. Cookies & Local Storage
            </h2>
            <p>
              Our storefront utilizes browser LocalStorage solely to maintain persistent shopping cart items, privilege coupon codes, and recent order history for your personal convenience. We do not sell or monetize personal browsing history to third-party ad brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-stone-900 font-medium">
              6. Your Rights & Inquiries
            </h2>
            <p>
              Under GDPR and CCPA regulations, you hold the right to request access, rectification, or complete deletion of your recorded customer profile. For inquiries regarding data rights, contact our Data Protection Concierge at <span className="font-mono text-stone-900 font-semibold">privacy@aura-atelier.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
