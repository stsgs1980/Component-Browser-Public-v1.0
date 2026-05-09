'use client';

import { memo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────

export interface FilterOption {
  key: string;
  label: string;
  description?: string;
}

export interface FilterPanelProps {
  options: FilterOption[];
  values: Record<string, boolean>;
  onChange: (values: Record<string, boolean>) => void;
  title?: string;
  resetLabel?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────

export const FilterPanel = memo(function FilterPanel({
  options,
  values,
  onChange,
  title = 'Filters',
  resetLabel = 'Reset',
  className = '',
}: FilterPanelProps) {
  const handleToggle = (key: string) => {
    onChange({ ...values, [key]: !values[key] });
  };

  const handleReset = () => {
    const empty: Record<string, boolean> = {};
    options.forEach(o => { empty[o.key] = false; });
    onChange(empty);
  };

  const hasActive = Object.values(values).some(Boolean);
  const activeCount = Object.values(values).filter(Boolean).length;

  return (
    <div className={`border border-border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        {hasActive && (
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
          >
            <CloseIcon />
            {resetLabel}
          </button>
        )}
      </div>

      {/* Active count */}
      {hasActive && (
        <div className="mb-3 text-xs font-medium px-2 py-1 rounded w-fit" style={{ backgroundColor: 'var(--primary, #3b82f6)20', color: 'var(--primary, #3b82f6)' }}>
          {activeCount} active
        </div>
      )}

      {/* Filter items */}
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.key}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <input
              type="checkbox"
              checked={values[option.key] || false}
              onChange={() => handleToggle(option.key)}
              className="w-4 h-4 rounded cursor-pointer accent-[var(--primary, #3b82f6)]"
            />
            <span className="text-sm flex-1">{option.label}</span>
            {option.description && (
              <span className="text-xs text-muted-foreground">{option.description}</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
});

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default FilterPanel;
