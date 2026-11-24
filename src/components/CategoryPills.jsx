// src/components/CategoryPills.jsx
import React from 'react';

const DEFAULT_COLLECTIONS = [
  { id: 'All', label: 'All Collections', slug: 'All' },
  { id: 'jewelry', label: 'Fine Jewelry', slug: 'jewelry' },
  { id: 'accessories', label: 'Designer Accessories', slug: 'accessories' },
  { id: 'watches', label: 'Horology & Watches', slug: 'watches' },
  { id: 'wigs', label: 'Virgin Hair & Wigs', slug: 'wigs' },
];

export const CategoryPills = ({
  activeCategory = 'All',
  onSelectCategory,
  collections = [],
  counts = {},
}) => {
  const items = React.useMemo(() => {
    if (Array.isArray(collections) && collections.length > 0) {
      return [
        { id: 'All', label: 'All Collections', slug: 'All' },
        ...collections.map((col) => ({
          id: col.slug || col.id,
          label: col.name,
          slug: col.slug || col.id,
        })),
      ];
    }
    return DEFAULT_COLLECTIONS;
  }, [collections]);

  return (
    <div className="flex items-center space-x-2.5 overflow-x-auto py-2 no-scrollbar scroll-smooth">
      {items.map((cat) => {
        const isSelected =
          (activeCategory || 'All').toLowerCase() === cat.slug.toLowerCase();
        const count = counts[cat.slug] ?? counts[cat.id];

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.slug)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                : 'bg-white text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            <span>{cat.label}</span>
            {typeof count === 'number' && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
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

export default CategoryPills;
