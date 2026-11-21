// src/pages/store/PrivacyPolicy.jsx
import React from 'react';
import { BRAND } from '../../config/constants';

export const PrivacyPolicy = () => (
  <div className="min-h-screen bg-[#faf8f5]">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          Client Transparency
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-2">
          Privacy Policy & Terms
        </h1>
        <p className="text-stone-500 text-xs mt-3">
          Last revised: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="bg-white border border-stone-200/90 rounded-3xl p-8 shadow-xs space-y-8 text-sm text-stone-700 leading-relaxed">
        {[
          {
            title: '1. Information We Collect',
            content:
              'We collect contact and shipping details you voluntarily submit when placing an order, including your full name, electronic mail address, physical shipping destination, and phone number. Credit card and banking transactions are processed via specialized encrypted gateways and are never held or visible on our servers.',
          },
          {
            title: '2. How We Utilize Your Information',
            content: `Your data is utilized solely to process your orders, provide dispatch tracking status, handle customer service requests, and optimize client experience. ${BRAND.name} adheres to strict confidentiality and will never distribute, lease, or monetize your personal information to third-party commercial marketing entities.`,
          },
          {
            title: '3. Data Encryption & Security',
            content:
              'All digital communication passing through our storefront and checkout flows is guarded by 256-bit SSL/TLS protocol standards. Access to administrative controls requires authenticated cryptographic credentials.',
          },
          {
            title: '4. Order Routing & Direct Dispatch',
            content:
              'To fulfill international consignments, destination addresses are securely passed to verified regional fulfillment centers exclusively for courier generation, customs declaration, and delivery tracking.',
          },
          {
            title: '5. Client Rights & Inquiries',
            content: `You maintain complete sovereignty over your data. For inquiries regarding data records, deletion requests, or transaction verification, please communicate directly with our concierge team at ${BRAND.email}.`,
          },
        ].map((sec) => (
          <div key={sec.title}>
            <h2 className="font-serif text-lg text-stone-900 font-semibold mb-2">
              {sec.title}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">{sec.content}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
