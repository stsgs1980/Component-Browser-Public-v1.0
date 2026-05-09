// --- source: UI-Stack-Guide / page.tsx (lines 1119-1182) ---
// Entity card with optional logo, type badge, stat grid, feature text, and verdict.
// De-hardcoded: Russian labels (Размер, Компоненты, Совместимость, Особенность, Вердикт)
// → generic stat labels via props.

'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatField {
  label: string;
  value: string | number;
  mono?: boolean;
}

interface EntityCardProps {
  /** Card title */
  title: string;
  /** Optional logo/icon (ReactNode or string) */
  logo?: ReactNode;
  /** Type badge (e.g. "Headless", "Styled") */
  badge?: string;
  /** Badge variant — 'primary' uses foreground fill, 'muted' uses border only */
  badgeVariant?: 'primary' | 'muted';
  /** 2-column stat grid */
  stats?: StatField[];
  /** Additional info fields with label + text */
  fields?: StatField[];
  /** Optional verdict/conclusion section */
  verdict?: string;
  /** Verdict section label (default "Verdict") */
  verdictLabel?: string;
  /** Framer Motion variants (default: fadeIn) */
  variants?: object;
  className?: string;
}

const defaultVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export function EntityCard({
  title, logo, badge, badgeVariant = 'primary',
  stats, fields, verdict, verdictLabel = 'Verdict',
  variants = defaultVariants,
  className,
}: EntityCardProps) {
  return (
    <motion.div
      variants={variants}
      className={`border border-border bg-background p-5 hover:border-foreground/30 transition-colors ${className || ''}`}
    >
      {/* Header: logo + title + badge */}
      <div className="flex items-start gap-3 mb-4">
        {logo && (
          <div className="flex-shrink-0 text-foreground">{logo}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold tracking-tight truncate">{title}</h3>
            {badge && (
              <span
                className={[
                  'text-xs uppercase tracking-wider px-2 py-1 border flex-shrink-0',
                  badgeVariant === 'primary'
                    ? 'border-foreground/50 text-foreground'
                    : 'border-border text-muted-foreground',
                ].join(' ')}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {/* 2-column stat grid */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <span className="text-muted-foreground uppercase text-xs tracking-wider">
                  {stat.label}
                </span>
                <p className={stat.mono !== false ? 'font-mono' : ''}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Info fields */}
        {fields?.map((field) => (
          <div key={field.label}>
            <span className="text-muted-foreground uppercase text-xs tracking-wider">
              {field.label}
            </span>
            <p className={field.mono !== false ? 'font-mono' : ''}>{field.value}</p>
          </div>
        ))}

        {/* Verdict section */}
        {verdict && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              {verdictLabel}
            </p>
            <p className="font-medium">{verdict}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
