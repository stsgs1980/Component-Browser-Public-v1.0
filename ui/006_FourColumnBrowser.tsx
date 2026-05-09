// --- source: UI-Stack-Guide / page.tsx (lines 1877-3213) ---
// 4-column component/asset browser: Category → Item → Variant → Preview/Code.
// Includes localStorage-based favorites with Star toggle.
// De-hardcoded: componentsData, renderPreview → generic props with render callbacks.

'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Star } from 'lucide-react';

// ============================================================
//  TYPES
// ============================================================

export interface BrowserCategory {
  id: string;
  name: string;
  icon?: ReactNode;
  items: BrowserItem[];
}

export interface BrowserItem {
  id: string;
  name: string;
  description?: string;
  variants: string[];
}

// ============================================================
//  COMPONENT
// ============================================================

interface FourColumnBrowserProps {
  /** All categories with items */
  categories: BrowserCategory[];
  /** Favorites category label (default "Favorites") */
  favoritesLabel?: string;
  /** localStorage key for persisting favorites (default "browser-favorites") */
  storageKey?: string;
  /** Custom render for the selected variant preview */
  renderPreview?: (item: BrowserItem, variant: string, variantIndex: number) => ReactNode;
  /** Custom render for the code view */
  renderCode?: (item: BrowserItem, variant: string, variantIndex: number) => ReactNode;
  /** Preview/Code tab labels */
  tabLabels?: { preview: string; code: string };
  /** Column header labels */
  columnLabels?: { categories: string; items: string; variants: string };
  /** No variants message */
  noVariantsText?: string;
  /** Browser height (default "h-[600px]") */
  height?: string;
  className?: string;
}

export function FourColumnBrowser({
  categories,
  favoritesLabel = 'Favorites',
  storageKey = 'browser-favorites',
  renderPreview,
  renderCode,
  tabLabels = { preview: 'Preview', code: 'Code' },
  columnLabels = { categories: 'Categories', items: 'Items', variants: 'Variants' },
  noVariantsText = 'No variants',
  height = 'h-[600px]',
  className,
}: FourColumnBrowserProps) {
  const firstCat = categories[0];
  const [selectedCategory, setSelectedCategory] = useState(firstCat?.id || '');
  const [selectedItem, setSelectedItem] = useState(firstCat?.items[0]?.id || '');
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Favorites with localStorage persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  // Find item across all categories (for favorites view)
  const findItem = (id: string): BrowserItem | undefined => {
    for (const cat of categories) {
      const found = cat.items.find((i) => i.id === id);
      if (found) return found;
    }
    return undefined;
  };

  const currentItems =
    selectedCategory === favoritesLabel
      ? favorites.map(findItem).filter(Boolean) as BrowserItem[]
      : currentCategory?.items || [];

  const currentItem =
    selectedCategory === favoritesLabel
      ? findItem(selectedItem)
      : currentItems.find((i) => i.id === selectedItem);

  const currentVariantName = currentItem?.variants[selectedVariant] || '';

  return (
    <div className={`border border-border bg-background ${className || ''}`}>
      {/* Header with tabs */}
      <div className="flex border-b border-border">
        {(Object.keys(tabLabels) as Array<'preview' | 'code'>).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* 4-column grid */}
      <div className={`grid grid-cols-4 divide-x divide-border ${height}`}>
        {/* Column 1: Categories */}
        <div className="bg-muted/30 overflow-y-auto">
          <div className="py-1">
            {/* Favorites pseudo-category */}
            <button
              onClick={() => {
                setSelectedCategory(favoritesLabel);
                if (favorites.length > 0) setSelectedItem(favorites[0]);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                selectedCategory === favoritesLabel
                  ? 'bg-foreground text-background'
                  : 'hover:bg-muted'
              }`}
            >
              <span>{favoritesLabel}</span>
              {favorites.length > 0 && (
                <span className={selectedCategory === favoritesLabel ? 'text-background/60' : 'text-muted-foreground'}>
                  {favorites.length}
                </span>
              )}
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedItem(cat.items[0]?.id || '');
                  setSelectedVariant(0);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  selectedCategory === cat.id
                    ? 'bg-foreground text-background'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className={selectedCategory === cat.id ? 'text-background/60' : 'text-muted-foreground'}>
                  {cat.items.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Items */}
        <div className="bg-background overflow-y-auto">
          <div className="py-1">
            {currentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item.id);
                  setSelectedVariant(0);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  selectedItem === item.id
                    ? 'bg-foreground text-background'
                    : 'hover:bg-muted'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Variants */}
        <div className="bg-background overflow-y-auto">
          <div className="py-1">
            {currentItem?.variants.map((variant, index) => (
              <div
                key={variant}
                onClick={() => setSelectedVariant(index)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer select-none ${
                  selectedVariant === index
                    ? 'bg-foreground text-background'
                    : 'hover:bg-muted'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedVariant(index);
                  }
                }}
              >
                <span className="font-mono">{variant}</span>
                {currentItem && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(currentItem.id);
                    }}
                    className={`p-1 hover:bg-muted/50 rounded transition-colors ${
                      selectedVariant === index ? 'hover:bg-background/20' : ''
                    }`}
                  >
                    <Star
                      className={`w-3 h-3 transition-colors ${
                        favorites.includes(currentItem.id)
                          ? 'fill-current text-yellow-500'
                          : selectedVariant === index
                            ? 'text-background/50 hover:text-background'
                            : 'text-muted-foreground hover:text-foreground'
                      }`}
                    />
                  </button>
                )}
              </div>
            ))}
            {(!currentItem || currentItem.variants.length === 0) && (
              <div className="px-4 py-2.5 text-sm text-muted-foreground">{noVariantsText}</div>
            )}
          </div>
        </div>

        {/* Column 4: Preview / Code */}
        <div className="bg-background overflow-y-auto">
          <div className="p-6">
            {currentItem && (
              <div className="mb-4 pb-4 border-b border-border">
                <h3 className="text-lg font-semibold">{currentItem.name}</h3>
                {currentItem.description && (
                  <p className="text-sm text-muted-foreground mt-1">{currentItem.description}</p>
                )}
              </div>
            )}
            {activeTab === 'preview' && renderPreview && currentItem && (
              <div>
                <div className="pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Selected: </span>
                  <span className="text-xs font-mono font-medium">{currentVariantName}</span>
                </div>
                <div className="mt-4">
                  {renderPreview(currentItem, currentVariantName, selectedVariant)}
                </div>
              </div>
            )}
            {activeTab === 'code' && renderCode && currentItem && (
              renderCode(currentItem, currentVariantName, selectedVariant)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
