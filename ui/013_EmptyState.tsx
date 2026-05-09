'use client'

/**
 * EmptyState — centered placeholder with icon, message, and optional CTA button.
 * Pattern repeated in dashboard, dictionary, documents, and notes views.
 *
 * Source: Wiki-Codex-v2 /src/components/codex/dashboard-view.tsx, dictionary-view.tsx, etc.
 * De-hardcoded:
 *   - Generic icon, title, description, actionLabel
 *   - Optional action callback
 *   - Configurable sizing and icon color
 */

import { Button } from './ui-button' // shadcn/ui button

interface EmptyStateProps {
  /** Icon element displayed above the text */
  icon?: React.ReactNode
  /** Primary message */
  title: string
  /** Secondary description */
  description?: string
  /** CTA button label */
  actionLabel?: string
  /** CTA button click handler */
  onAction?: () => void
  /** Whether the CTA is disabled */
  actionDisabled?: boolean
  /** Additional class name */
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4 ${className ?? ''}`}>
      {icon && (
        <div className="text-muted-foreground/40 mb-3 sm:mb-4 [&>svg]:size-10 sm:[&>svg]:h-12 sm:[&>svg]:w-12">
          {icon}
        </div>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed">{title}</p>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2"
          onClick={onAction}
          disabled={actionDisabled}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
