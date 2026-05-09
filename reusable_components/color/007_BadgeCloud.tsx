'use client'

/**
 * BadgeCloud — Staggered animated badges with icon + label + colored border.
 * Useful for "tech stack", "powered by", or "features" displays.
 *
 * De-hardcoded from: Orchestration-of-AI-Agents (tech stack banner)
 * - Replaced hardcoded Next.js/Tailwind/Framer items → generic `BadgeItem[]` prop
 * - Made border colors configurable per-item
 * - Stagger animation configurable via delay multiplier
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface BadgeItem {
  label: string
  icon?: React.ReactNode
  /** Border color class (default: "border-slate-600") */
  borderColorClass?: string
}

export interface BadgeCloudProps {
  /** Badge items to display */
  items: BadgeItem[]
  /** Stagger delay between each badge in seconds (default: 0.1) */
  staggerDelay?: number
  /** Container class */
  className?: string
  /** Badge base class */
  badgeClass?: string
}

export function BadgeCloud({
  items,
  staggerDelay = 0.1,
  className = 'flex flex-wrap items-center justify-center gap-3',
  badgeClass = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs text-slate-300 bg-slate-800/50 backdrop-blur-sm',
}: BadgeCloudProps) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * staggerDelay,
            ease: 'easeOut',
          }}
          className={cn(
            badgeClass,
            item.borderColorClass || 'border-slate-600',
          )}
        >
          {item.icon}
          {item.label}
        </motion.div>
      ))}
    </div>
  )
}
