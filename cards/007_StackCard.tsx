// --- source: UI-Stack-Guide / page.tsx (lines 1185-1224) ---
// Indexed recommendation card with type badge, library name, description, and use case.
// De-hardcoded: Russian labels → generic props.

'use client';

import { motion } from 'framer-motion';

interface StackCardProps {
  /** Card index (shown as 01, 02, ...) */
  index: number;
  title: string;
  subtitle?: string;
  description: string;
  useCase: string;
  /** Type badge (e.g. "Headless", "Styled") */
  badge?: string;
  badgeVariant?: 'primary' | 'muted';
  /** Use case label (default "Use case") */
  useCaseLabel?: string;
  /** Subtitle label (default "Library") */
  subtitleLabel?: string;
  variants?: object;
  className?: string;
}

export function StackCard({
  index, title, subtitle, description, useCase,
  badge, badgeVariant = 'primary',
  useCaseLabel = 'Use case', subtitleLabel = 'Library',
  variants = { initial: { opacity: 0 }, animate: { opacity: 1 } },
  className,
}: StackCardProps) {
  return (
    <motion.div
      variants={variants}
      className={`border border-border bg-background p-5 hover:border-foreground/30 transition-colors ${className || ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        {badge && (
          <span
            className={[
              'text-xs uppercase tracking-wider px-2 py-1 border',
              badgeVariant === 'primary'
                ? 'border-foreground/50 text-foreground'
                : 'border-border text-muted-foreground',
            ].join(' ')}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-3 text-sm">
        {subtitle && (
          <div>
            <span className="text-muted-foreground uppercase text-xs tracking-wider">
              {subtitleLabel}
            </span>
            <p className="font-medium">{subtitle}</p>
          </div>
        )}

        <p className="text-muted-foreground leading-relaxed">{description}</p>

        <div className="pt-3 border-t border-border">
          <span className="text-muted-foreground uppercase text-xs tracking-wider">
            {useCaseLabel}
          </span>
          <p>{useCase}</p>
        </div>
      </div>
    </motion.div>
  );
}
