'use client'

import { cn } from 'tailwind-variants'

/**
 * VerticalTimeline — timeline with past/current/future milestone states.
 * Current milestone pulses. Progress line auto-fills to current position.
 *
 * Source: LLM-MEM-GUIDE /src/components/resources/RoadmapSection.tsx (113 lines)
 * De-hardcoded:
 *   - Generic MilestoneItem interface
 *   - Configurable status values (past/current/future)
 *   - Optional "WE ARE HERE" badge for current item
 *   - Configurable dot colors
 */

export type MilestoneStatus = 'past' | 'current' | 'future'

export interface MilestoneItem<T = string> {
  /** Label (e.g. year, version, date) */
  label: string
  /** Title */
  title: string
  /** Description */
  description?: string
  /** Status */
  status: MilestoneStatus
  /** Optional payload */
  payload?: T
}

interface VerticalTimelineProps<T = string> {
  /** Milestones to display */
  milestones: MilestoneItem<T>[]
  /** Custom badge for current milestone (default: "WE ARE HERE") */
  currentBadge?: React.ReactNode
  /** Additional class name */
  className?: string
}

export function VerticalTimeline<T = string>({
  milestones,
  currentBadge = 'WE ARE HERE',
  className,
}: VerticalTimelineProps<T>) {
  const pastCount = milestones.filter(m => m.status === 'past').length
  const progressPercent = milestones.length > 0
    ? (pastCount / milestones.length) * 100
    : 0

  return (
    <div className={cn('relative', className)}>
      {/* Background line */}
      <div className="absolute left-4 md:left-6 top-2 bottom-2 w-px bg-border" />
      {/* Filled progress line */}
      <div
        className="absolute left-4 md:left-6 top-2 w-px"
        style={{
          height: `${progressPercent}%`,
          backgroundColor: 'var(--primary)',
          opacity: 0.4,
        }}
      />

      <div className="space-y-6">
        {milestones.map((milestone, index) => {
          const isCurrent = milestone.status === 'current'
          const isFuture = milestone.status === 'future'

          return (
            <div key={index} className="relative flex gap-4 md:gap-6">
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0 mt-1">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full border-2 flex items-center justify-center',
                    milestone.status === 'past' && 'bg-primary border-primary',
                    isCurrent && 'bg-primary border-primary animate-pulse',
                    isFuture && 'bg-background border-border',
                  )}
                  style={isFuture ? { borderStyle: 'dashed' } : undefined}
                >
                  {isCurrent && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 min-w-0 pb-2">
                <div
                  className={cn(
                    'overflow-hidden rounded-lg border bg-card',
                    isCurrent && 'ring-1 ring-primary/30 shadow-sm',
                    isFuture && 'opacity-60',
                  )}
                >
                  <div className="p-3 md:p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs border rounded-sm px-2 py-0.5 bg-muted text-muted-foreground">
                        {milestone.label}
                      </span>
                      {isCurrent && (
                        <span className="font-mono text-[10px] bg-primary text-primary-foreground px-2 py-0.5 animate-pulse">
                          {currentBadge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-mono text-sm font-medium text-foreground">
                      {milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
