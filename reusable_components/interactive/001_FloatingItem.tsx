'use client';

import React, { memo, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────

export interface FloatingItemProps {
  children: ReactNode;
  actions?: ReactNode;
  /** 'edit' shows action buttons, 'readonly' shows readOnlyLabel */
  mode: 'edit' | 'readonly';
  readOnlyLabel?: string;
  index?: number;
  className?: string;
  hoverBorderColor?: string;
  hoverShadow?: string;
}

export interface ActionButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  tooltip: string;
  danger?: boolean;
  disabled?: boolean;
}

// ─── ActionButton ─────────────────────────────────────────────────────

export const ActionButton = memo(function ActionButton({
  icon,
  onClick,
  tooltip,
  danger = false,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      style={{
        transitionTimingFunction: 'cubic-bezier(0.2, 0, 0.38, 0.9)',
        backgroundColor: 'transparent',
        border: 'none',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (danger) {
          el.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          el.style.color = '#ef4444';
        } else {
          el.style.backgroundColor = 'var(--primary, rgba(59, 130, 246, 0.1))';
          el.style.color = 'var(--primary, #3b82f6)';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = 'transparent';
        el.style.color = 'var(--muted-foreground, #6b7280)';
      }}
    >
      {icon}
    </button>
  );
});

// ─── FloatingItem ─────────────────────────────────────────────────────

export const FloatingItem = memo(function FloatingItem({
  children,
  actions,
  mode,
  readOnlyLabel = 'Read only',
  index,
  className = '',
  hoverBorderColor,
  hoverShadow,
}: FloatingItemProps) {
  return (
    <div
      className={`group relative bg-card p-4 border border-border transition-all duration-150 ${className}`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.2, 0, 0.38, 0.9)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = hoverBorderColor || 'var(--primary, #3b82f6)';
        e.currentTarget.style.boxShadow = hoverShadow || '0 1px 3px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="flex justify-between items-center">
        <div className="pr-20 flex-1">
          {index !== undefined && (
            <span className="font-semibold mr-2 font-mono" style={{ color: 'var(--primary, #3b82f6)' }}>
              {index + 1}.
            </span>
          )}
          {children}
        </div>

        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-150"
        >
          <div className="flex bg-card border border-border shadow-md min-h-10 p-1 gap-0.5">
            {mode === 'edit' && actions}
            {mode === 'readonly' && (
              <span className="text-xs px-3 py-2 cursor-default" style={{ color: 'var(--muted-foreground, #6b7280)' }}>
                {readOnlyLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default FloatingItem;
