'use client'

/**
 * AmbientBackground — Animated gradient orbs for dark-themed pages.
 * Positions 3 blurred circles with staggered pulse animations.
 *
 * De-hardcoded from: Orchestration-of-AI-Agents (main page background)
 * - Extracted from inline JSX into reusable component
 * - Made orb colors, positions, and sizes configurable via props
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface GradientOrb {
  /** Tailwind background class (e.g. "bg-cyan-500/20") */
  colorClass: string
  /** Position class (e.g. "top-20 -left-20") */
  positionClass: string
  /** Size in rem (default: 72) */
  size?: number
  /** Blur in pixels (default: 128) */
  blur?: number
  /** Animation delay in seconds (default: 0) */
  delay?: number
}

export interface AmbientBackgroundProps {
  /** Orb configurations (default: 3 preset orbs) */
  orbs?: GradientOrb[]
  /** Container class */
  className?: string
}

const defaultOrbs: GradientOrb[] = [
  { colorClass: 'bg-cyan-500/20', positionClass: 'top-20 -left-20', size: 72, blur: 128, delay: 0 },
  { colorClass: 'bg-purple-500/20', positionClass: 'top-40 right-10', size: 96, blur: 128, delay: 2 },
  { colorClass: 'bg-blue-500/20', positionClass: 'bottom-20 left-1/3', size: 80, blur: 128, delay: 4 },
]

export function AmbientBackground({
  orbs = defaultOrbs,
  className = 'fixed inset-0 -z-10 overflow-hidden pointer-events-none',
}: AmbientBackgroundProps) {
  return (
    <div className={className}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={cn(orb.colorClass, orb.positionClass, 'absolute rounded-full')}
          style={{
            width: `${orb.size ?? 72}rem`,
            height: `${orb.size ?? 72}rem`,
            filter: `blur(${orb.blur ?? 128}px)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay ?? i * 2,
          }}
        />
      ))}
    </div>
  )
}
