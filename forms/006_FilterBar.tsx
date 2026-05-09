// --- source: Code-Snippets-Gallery / filter-bar.tsx ---
// Search + horizontal multi-pill filter bar with full ARIA accessibility.
// De-hardcoded: filter items passed as props (was LANGUAGES/CATEGORIES constants),
// labels via renderLabel callback (was i18n t()/tCat()), no locale dependency.

'use client';

import { Search, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterGroup<T extends string> {
  /** Unique group key for ARIA */
  key: string;
  /** Group label */
  label: string;
  /** Currently selected value */
  value: T;
  /** All available options */
  options: T[];
  /** Render label for each option (e.g. translate "All" → "Все") */
  renderLabel?: (value: T) => string;
  /** Selection change handler */
  onChange: (value: T) => void;
}

interface FilterBarProps<T extends string = string> {
  /** Current search query */
  searchQuery: string;
  /** Search change handler */
  onSearchChange: (q: string) => void;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Search icon override */
  searchIcon?: LucideIcon;
  /** Filter pill groups (e.g. languages, categories) */
  filterGroups: FilterGroup<T>[];
  /** Additional CSS classes */
  className?: string;
}

export function FilterBar<T extends string = string>({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchIcon: SearchIcon = Search,
  filterGroups,
  className,
}: FilterBarProps<T>) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Filter groups */}
      {filterGroups.map((group) => (
        <div
          key={group.key}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="radiogroup"
          aria-label={`Filter by ${group.label}`}
        >
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap mr-1">
            {group.label}
          </span>
          {group.options.map((option) => {
            const isActive = group.value === option;
            const label = group.renderLabel ? group.renderLabel(option) : option;

            return (
              <button
                key={option}
                onClick={() => group.onChange(option)}
                role="radio"
                aria-checked={isActive}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  'border hover:opacity-90',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
