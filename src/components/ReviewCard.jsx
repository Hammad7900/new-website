// src/components/ReviewCard.jsx
import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

export const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between relative hover:shadow-md transition-shadow">
      <Quote className="absolute top-6 right-6 w-8 h-8 text-stone-100 -z-0" />
      
      <div className="relative z-10">
        {/* Rating stars */}
        <div className="flex items-center space-x-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? 'fill-gold-400 text-gold-400' : 'text-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Title & Comment */}
        <h4 className="font-serif font-medium text-stone-900 text-base mb-2">
          "{review.title}"
        </h4>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6 font-light">
          {review.comment}
        </p>
      </div>

      {/* Author Details & Verified Badge */}
      <div className="pt-4 border-t border-stone-100 flex items-center justify-between relative z-10">
        <div>
          <div className="text-xs font-semibold text-stone-900">
            {review.author}
          </div>
          <div className="text-[11px] text-stone-400">
            {review.location} • Purchased <span className="text-stone-600 italic">{review.item}</span>
          </div>
        </div>

        <div className="flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
          Verified
        </div>
      </div>
    </div>
  );
};
