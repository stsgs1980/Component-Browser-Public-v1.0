'use client'

/**
 * EventLogPanel — Auto-scrolling event log with animated entries.
 * Shows a header with title + running indicator, and a scrollable list
 * of timestamped log entries with animated enter/exit.
 *
 * De-hardcoded from: Orchestration-of-AI-Agents (LogPanel component)
 * - Replaced hardcoded translation strings → generic props
 * - Made log height, styling, and empty state text configurable
 * - Generic `LogEntry` type replaces domain-specific `Message`
 */

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface LogEntry {
  id: string
  from: string
  content: string
  timestamp?: number
}

export interface EventLogPanelProps {
  /** Log entries to display */
  entries: LogEntry[]
  /** Whether a process is currently running */
  isRunning?: boolean
  /** Panel title (default: "Execution Log") */
  title?: string
  /** Empty state text (default: "No events yet") */
  emptyText?: string
  /** Running indicator text (default: "Running...") */
  runningText?: string
  /** Panel container class */
  containerClass?: string
  /** Scrollable area height (default: "h-48") */
  scrollHeight?: string
  /** Whether to show timestamps (default: true) */
  showTimestamps?: boolean
  /** Entry animation direction (default: "x") */
  animateAxis?: 'x' | 'y'
}

export function EventLogPanel({
  entries,
  isRunning = false,
  title = 'Execution Log',
  emptyText = 'No events yet',
  runningText = 'Running...',
  containerClass = 'bg-slate-900/50 rounded-xl border border-slate-700 backdrop-blur-sm',
  scrollHeight = 'h-48',
  showTimestamps = true,
  animateAxis = 'x',
}: EventLogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  const initialOffset = animateAxis === 'x' ? -20 : -10
  const exitOffset = animateAxis === 'x' ? 20 : 10

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-200">{title}</span>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            </motion.div>
            <span className="text-xs text-amber-400">{runningText}</span>
          </div>
        )}
      </div>

      {/* Scrollable log */}
      <div
        ref={scrollRef}
        className={cn(
          'overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800',
          scrollHeight,
        )}
      >
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">
              {emptyText}
            </div>
          ) : (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, [animateAxis]: initialOffset }}
                animate={{ opacity: 1, [animateAxis]: 0 }}
                exit={{ opacity: 0, [animateAxis]: exitOffset }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2 text-sm"
              >
                <Badge
                  variant="outline"
                  className="text-xs bg-slate-800 border-slate-600 shrink-0"
                >
                  {entry.from}
                </Badge>
                <span className="text-slate-300 flex-1">{entry.content}</span>
                {showTimestamps && entry.timestamp && (
                  <span className="text-xs text-slate-500 shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
