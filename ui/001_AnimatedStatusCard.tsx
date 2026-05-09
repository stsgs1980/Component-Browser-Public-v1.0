'use client'

/**
 * AnimatedStatusCard — A card displaying an entity with icon, title, subtitle,
 * and a 3-state status indicator (idle/running/completed) with glow animations
 * and optional result reveal.
 *
 * De-hardcoded from: Orchestration-of-AI-Agents (AgentNode component)
 * - Replaced domain-specific `Agent` type → generic `StatusCardProps`
 * - Replaced hardcoded translation key lookups → plain string props
 * - Made status colors, glow colors configurable via props
 * - Made running icon (Loader2) configurable
 */

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusState = 'idle' | 'running' | 'completed'

export interface AnimatedStatusCardProps {
  /** Entity title */
  title: string
  /** Entity subtitle / description */
  subtitle?: string
  /** Icon element */
  icon: ReactNode
  /** Current status */
  status: StatusState
  /** Optional result text to show when completed */
  result?: string
  /** Whether this card is currently active/highlighted */
  isActive?: boolean
  /** Whether a "flowing" glow animation should play */
  isFlowing?: boolean
  /** Status text for each state (default: idle/running/completed) */
  statusLabels?: Record<StatusState, string>
  /** Custom status gradient colors (Tailwind from-X to-Y classes) */
  statusGradients?: Record<StatusState, string>
  /** Custom status background/border classes */
  statusBgClasses?: Record<StatusState, string>
  /** Custom status badge background classes */
  statusBadgeClasses?: Record<StatusState, string>
  /** Active ring color class (default: ring-purple-500/50) */
  activeRingClass?: string
  /** Active glow shadow (default: purple) */
  activeGlowShadow?: string
  /** Running glow shadow (default: amber) */
  runningGlowShadow?: string
  /** Flowing overlay gradient class (default: from-purple-500/20 to-cyan-500/20) */
  flowGradientClass?: string
  /** Custom running icon (default: Loader2 spinning) */
  runningIcon?: ReactNode
}

const defaultStatusGradients: Record<StatusState, string> = {
  idle: 'from-slate-600 to-slate-700',
  running: 'from-amber-500 to-orange-600',
  completed: 'from-emerald-500 to-green-600',
}

const defaultStatusBg: Record<StatusState, string> = {
  idle: 'bg-slate-800/50 border-slate-600',
  running: 'bg-amber-900/30 border-amber-500/50',
  completed: 'bg-emerald-900/30 border-emerald-500/50',
}

const defaultStatusBadge: Record<StatusState, string> = {
  idle: 'bg-slate-600',
  running: 'bg-amber-600',
  completed: 'bg-emerald-600',
}

const defaultLabels: Record<StatusState, string> = {
  idle: 'idle',
  running: 'running',
  completed: 'completed',
}

export function AnimatedStatusCard({
  title,
  subtitle,
  icon,
  status,
  result,
  isActive = false,
  isFlowing = false,
  statusLabels = defaultLabels,
  statusGradients = defaultStatusGradients,
  statusBgClasses = defaultStatusBg,
  statusBadgeClasses = defaultStatusBadge,
  activeRingClass = 'ring-2 ring-purple-500/50',
  activeGlowShadow = '0 0 30px rgba(139, 92, 246, 0.3)',
  runningGlowShadow = '0 0 20px rgba(245, 158, 11, 0.3)',
  flowGradientClass = 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20',
  runningIcon,
}: AnimatedStatusCardProps) {
  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-300',
        statusBgClasses[status],
        isActive && activeRingClass,
      )}
      animate={{
        scale: isActive ? 1.02 : 1,
        boxShadow: isActive
          ? activeGlowShadow
          : status === 'running'
            ? runningGlowShadow
            : '0 0 0px rgba(0, 0, 0, 0)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect */}
      {isFlowing && (
        <motion.div
          className={cn('absolute inset-0 rounded-xl', flowGradientClass)}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      <div className="flex items-center gap-3 relative z-10">
        <motion.div
          className={cn('p-2 rounded-lg bg-gradient-to-br', statusGradients[status])}
          animate={status === 'running' ? { rotate: [0, 360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          {status === 'running' ? (
            runningIcon ?? <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <div className="text-white">{icon}</div>
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 truncate">{subtitle}</p>
          )}
        </div>

        <Badge
          variant={status === 'completed' ? 'default' : 'secondary'}
          className={cn('text-xs', statusBadgeClasses[status])}
        >
          {statusLabels[status]}
        </Badge>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-xs text-slate-300 bg-slate-800/50 p-2 rounded-lg relative z-10"
        >
          {result}
        </motion.div>
      )}
    </motion.div>
  )
}
