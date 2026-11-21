// src/components/CategoryPills.jsx
import React from 'react';

const CATEGORIES = [
  { id: 'All', label: 'All Collections' },
  { id: 'Timepieces', label: 'Horology & Timepieces' },
  { id: 'Leather Goods', label: 'Vegetable-Tanned Leather' },
  { id: 'Audio & Tech', label: 'Audio & Acoustics' },
  { id: 'Home & Living', label: 'Sculptural Living' },
];

export const CategoryPills = ({ activeCategory, onSelectCategory, counts = {} }) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-2 no-scrollbar scroll-smooth">
      {CATEGORIES.map((cat) => {
        const isSelected = activeCategory === cat.id;
        const count = counts[cat.id];

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 shrink-0 ${
              isSelected
                ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                : 'bg-white text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            <span>{cat.label}</span>
            {typeof count === 'number' && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
