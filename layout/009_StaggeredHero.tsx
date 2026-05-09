// --- source: Code-Snippets-Gallery / hero-section.tsx ---
// Staggered Framer Motion entrance hero with animated stats row and dot-grid background.
// De-hardcoded: all text/colors/stats via props, no i18n, no hardcoded API fetch.

'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: number | string;
}

interface StaggeredHeroProps {
  /** Multi-part title with highlighted spans */
  titleParts?: Array<{ text: string; highlight?: boolean; gradient?: string }>;
  /** Simple single-title mode (alternative to titleParts) */
  title?: string;
  /** Subtitle */
  subtitle?: string;
  /** Stat items row (shown when values are truthy) */
  stats?: StatItem[];
  /** Background gradient from/to colors */
  gradientColors?: { from?: string; via?: string; to?: string };
  /** Dot grid opacity (default 0.03 light / 0.05 dark) */
  dotGridOpacity?: number;
  /** Animation stagger delays in seconds (default [0, 0.15, 0.3]) */
  staggerDelays?: number[];
  /** Additional classes */
  className?: string;
}

export function StaggeredHero({
  titleParts, title, subtitle, stats,
  gradientColors,
  dotGridOpacity,
  staggerDelays = [0, 0.15, 0.3],
  className,
}: StaggeredHeroProps) {
  const hasStats = stats?.some((s) => s.value !== 0 && s.value !== '');

  return (
    <section className={cn('relative pt-24 pb-12 sm:pt-32 sm:pb-16 overflow-hidden', className)}>
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            fromColor: gradientColors?.from || 'var(--primary)',
            viaColor: gradientColors?.via || 'transparent',
            toColor: gradientColors?.to || 'var(--primary)',
            opacity: 0.05,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: dotGridOpacity ?? undefined,
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
          // Fallback using Tailwind
          className={[
            'absolute inset-0 opacity-[0.03] dark:opacity-[0.05]',
            dotGridOpacity !== undefined ? 'hidden' : '',
          ].join(' ')}
        />
        {/* Always render the dot grid via Tailwind if no custom opacity */}
        {dotGridOpacity === undefined && (
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: staggerDelays[0], ease: 'easeOut' }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
        >
          {titleParts
            ? titleParts.map((part, i) =>
                part.highlight ? (
                  <span
                    key={i}
                    className={cn(
                      'bg-gradient-to-r bg-clip-text text-transparent',
                      part.gradient || 'from-amber-500 via-orange-500 to-rose-500',
                    )}
                  >
                    {part.text}
                  </span>
                ) : (
                  <span key={i}>{part.text} </span>
                ),
              )
            : title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: staggerDelays[1], ease: 'easeOut' }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Stats */}
        {hasStats && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: staggerDelays[2], ease: 'easeOut' }}
            className="mt-8 sm:mt-10 flex items-center justify-center gap-6 sm:gap-10"
          >
            {stats.filter((s) => s.value !== 0 && s.value !== '').map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <stat.icon className="size-4 text-primary" />
                <span className="font-semibold text-foreground">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// cn helper inline (or import from @/lib/utils)
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
