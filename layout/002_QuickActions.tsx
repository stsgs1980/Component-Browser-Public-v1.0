'use client';

import React, { memo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────

export interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  tooltip?: string;
}

export interface ToolbarLabels {
  run?: string;
  save?: string;
  clear?: string;
}

// ─── QuickActions Toolbar ─────────────────────────────────────────────

interface QuickActionsProps {
  onRun: () => void;
  onSave?: () => void;
  onClear: () => void;
  canRun?: boolean;
  labels?: ToolbarLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<ToolbarLabels> = {
  run: 'Run',
  save: 'Save',
  clear: 'Clear',
};

export const QuickActions = memo(function QuickActions({
  onRun,
  onSave,
  onClear,
  canRun = true,
  labels = DEFAULT_LABELS,
  className = '',
}: QuickActionsProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={onRun}
        disabled={!canRun}
        title={t.run}
        className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        style={{ backgroundColor: 'var(--primary, #3b82f6)' }}
        onMouseEnter={(e) => { if (canRun) e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        <PlayIcon className="w-4 h-4" />
        {t.run}
      </button>

      {onSave && (
        <button
          onClick={onSave}
          title={t.save}
          className="flex items-center gap-2 px-4 py-2 border border-border text-sm rounded transition-colors duration-150"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--muted, #f1f5f9)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <CopyIcon className="w-4 h-4" />
          {t.save}
        </button>
      )}

      <button
        onClick={onClear}
        title={t.clear}
        className="flex items-center gap-2 px-4 py-2 border border-border text-sm rounded transition-colors duration-150"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
          e.currentTarget.style.borderColor = '#ef4444';
          e.currentTarget.style.color = '#ef4444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.color = '';
        }}
      >
        <CloseIcon className="w-4 h-4" />
        {t.clear}
      </button>
    </div>
  );
});

// ─── NodePalette ───────────────────────────────────────────────────────

export interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface NodePaletteProps {
  items: PaletteItem[];
  onSelect: (id: string) => void;
  className?: string;
}

import React from 'react';

export const NodePalette = memo(function NodePalette({
  items,
  onSelect,
  className = '',
}: NodePaletteProps) {
  return (
    <div className={`flex flex-wrap gap-2 p-2 bg-card border border-border rounded ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          title={item.description || item.label}
          className="flex items-center gap-2 px-3 py-2 rounded border border-border text-xs font-medium transition-colors duration-150"
          style={{ background: 'transparent', cursor: 'pointer' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary, #3b82f6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '';
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
});

// ─── Inline SVG icons (avoid external deps) ───────────────────────────

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default QuickActions;
