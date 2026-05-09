// --- source: Radix-Template / page.tsx (lines 765-815) ---
// CTA banner with gradient background and decorative glow effect.
// De-hardcoded: all text, gradient colors, button labels → props.

'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CTABannerProps {
  /** Main heading */
  title: string;
  /** Description text */
  description?: string;
  /** Primary CTA button */
  primaryAction?: ReactNode;
  /** Secondary CTA button */
  secondaryAction?: ReactNode;
  /** Background gradient class (default "from-purple-600 to-blue-600") */
  gradient?: string;
  /** Glow color (default "bg-purple-500") */
  glowColor?: string;
  className?: string;
}

export function CTABanner({
  title, description,
  primaryAction, secondaryAction,
  gradient = 'from-purple-600 to-blue-600',
  glowColor = 'bg-purple-500',
  className,
}: CTABannerProps) {
  return (
    <section className={cn('py-20 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow effect behind the card */}
          <div className={cn(
            'absolute inset-0 rounded-3xl blur-[80px] opacity-30',
            glowColor,
          )} />

          {/* Card */}
          <div className={cn(
            'relative rounded-3xl p-10 sm:p-14 text-center',
            'bg-gradient-to-r',
            gradient,
            'text-white',
          )}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                {description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {primaryAction}
              {secondaryAction}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
