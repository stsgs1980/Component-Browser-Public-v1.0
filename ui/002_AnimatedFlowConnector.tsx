'use client'

/**
 * AnimatedFlowConnector — Animated directional arrow with a traveling
 * glowing particle. Supports right, down, and up directions.
 *
 * De-hardcoded from: Orchestration-of-AI-Agents (FlowArrow component)
 * - Made color configurable via props
 * - Made arrow dimensions configurable
 * - Already nearly generic, just extracted with proper types
 */

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FlowDirection = 'right' | 'down' | 'up'

export interface AnimatedFlowConnectorProps {
  /** Whether the connector is currently active/flowing */
  isActive?: boolean
  /** Direction of the arrow */
  direction?: FlowDirection
  /** Width when horizontal (default: 60) */
  horizontalWidth?: number
  /** Height when vertical (default: 60) */
  verticalHeight?: number
  /** Base line gradient class (default: from-slate-600 to-slate-500) */
  lineGradientClass?: string
  /** Particle gradient class (default: from-cyan-400 to-purple-500) */
  particleGradientClass?: string
  /** Active arrow color (default: text-cyan-400) */
  activeArrowClass?: string
  /** Inactive arrow color (default: text-slate-500) */
  inactiveArrowClass?: string
  /** Animation duration in seconds (default: 0.8) */
  animationDuration?: number
  /** Custom arrow icon (default: ArrowRight) */
  arrowIcon?: React.ReactNode
}

const rotationMap: Record<FlowDirection, number> = {
  right: 0,
  down: 90,
  up: -90,
}

export function AnimatedFlowConnector({
  isActive = false,
  direction = 'right',
  horizontalWidth = 60,
  verticalHeight = 60,
  lineGradientClass = 'bg-gradient-to-r from-slate-600 to-slate-500',
  particleGradientClass = 'bg-gradient-to-r from-cyan-400 to-purple-500',
  activeArrowClass = 'text-cyan-400',
  inactiveArrowClass = 'text-slate-500',
  animationDuration = 0.8,
  arrowIcon,
}: AnimatedFlowConnectorProps) {
  const isHorizontal = direction === 'right'
  const halfTravel = isHorizontal ? horizontalWidth / 2 : verticalHeight / 2

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{
        width: isHorizontal ? horizontalWidth : 40,
        height: isHorizontal ? 40 : verticalHeight,
      }}
    >
      {/* Base line */}
      <div
        className={cn(
          isHorizontal ? 'w-full h-0.5' : 'h-full w-0.5',
          lineGradientClass,
        )}
      />

      {/* Animated traveling particle */}
      {isActive && (
        <motion.div
          className={cn(
            isHorizontal ? 'w-3 h-1' : 'w-1 h-3',
            'absolute rounded-full',
            particleGradientClass,
          )}
          initial={{
            x: isHorizontal ? -halfTravel : 0,
            y: isHorizontal ? 0 : -halfTravel,
          }}
          animate={{
            x: isHorizontal ? halfTravel : 0,
            y: isHorizontal ? 0 : halfTravel,
          }}
          transition={{ duration: animationDuration, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Arrow head */}
      <motion.div
        style={{ transform: `rotate(${rotationMap[direction]}deg)` }}
        className={cn(
          'absolute',
          isHorizontal ? 'right-0' : '',
          isActive ? activeArrowClass : inactiveArrowClass,
        )}
      >
        {arrowIcon ?? <ArrowRight className="w-4 h-4" />}
      </motion.div>
    </motion.div>
  )
}
