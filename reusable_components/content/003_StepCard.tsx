'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

/**
 * StepCard — expandable numbered step with vertical timeline connector.
 * Used in tutorials, wizards, instructions, changelogs.
 *
 * Source: Wiki-Codex-v2 /src/components/codex/instructions-view.tsx (lines 434-470)
 * De-hardcoded:
 *   - Accepts generic ReactNode children instead of hardcoded CodeBlock[]
 *   - Configurable defaultExpanded state
 *   - Optional description rendered via prop
 */

interface StepCardProps {
  /** Step number displayed in the badge */
  stepNumber: number
  /** Step title */
  title: string
  /** Optional description text below the title */
  description?: string
  /** Content rendered when expanded (code blocks, details, etc.) */
  children?: React.ReactNode
  /** Whether the step is expanded by default (default: true) */
  defaultExpanded?: boolean
}

export function StepCard({
  stepNumber,
  title,
  description,
  children,
  defaultExpanded = true,
}: StepCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="relative pl-8">
      {/* Vertical timeline connector */}
      <div className="absolute left-3 top-6 bottom-0 w-px border-l border-dashed" />
      {/* Numbered badge */}
      <div className="absolute left-1 top-1.5 size-[22px] rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-mono font-bold ring-4 ring-background">
        {stepNumber}
      </div>

      <div className="pb-6 last:pb-0">
        {/* Toggle button */}
        <button
          className="flex items-center gap-2 text-left w-full group/step"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? <ChevronDown className="size-3 text-muted-foreground shrink-0 transition-transform" />
            : <ChevronRight className="size-3 text-green-600 dark:text-green-400 shrink-0 transition-transform" />
          }
          <h3 className="text-xs font-mono font-semibold text-foreground leading-tight group-hover/step:text-primary transition-colors">
            {title}
          </h3>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 flex flex-col gap-3">
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            )}
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
