// --- source: Radix-Template / page.tsx (lines 491-512) ---
// Reusable section header with animated badge, title, and subtitle.
// Used 4 times in the original page. De-hardcoded: all text + badge style → props.

'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Small badge text above the title */
  badge?: string;
  /** Badge gradient classes (default "from-purple-600/20 to-blue-600/20") */
  badgeGradient?: string;
  /** Badge text color class (default "text-purple-400") */
  badgeTextClass?: string;
  /** Badge border class (default "border-purple-500/30") */
  badgeBorderClass?: string;
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Center alignment (default true) */
  centered?: boolean;
  /** Bottom margin (default "mb-16") */
  marginBottom?: string;
  className?: string;
}

export function SectionHeader({
  badge, title, subtitle,
  badgeGradient = 'from-purple-600/20 to-blue-600/20',
  badgeTextClass = 'text-purple-400',
  badgeBorderClass = 'border-purple-500/30',
  centered = true,
  marginBottom = 'mb-16',
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(centered && 'text-center', marginBottom, className)}
    >
      {badge && (
        <Badge
          className={cn(
            'bg-gradient-to-r border mb-4',
            badgeGradient,
            badgeTextClass,
            badgeBorderClass,
          )}
        >
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
      {subtitle && (
        <p className="text-lg max-w-2xl mx-auto text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}
