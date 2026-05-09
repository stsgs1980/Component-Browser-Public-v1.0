'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui-button' // shadcn/ui button

/**
 * SelectionActionBar — floating bottom bar for batch actions on selected items.
 * Common pattern: file managers, email clients, data tables with multi-select.
 *
 * Source: Wiki-Codex-v2 /src/components/codex/dictionary-view.tsx (lines 583-614)
 * De-hardcoded:
 *   - Generic actions array instead of hardcoded "Delete"
 *   - Configurable labels, icons, variants
 *   - onCancel callback instead of Russian text
 */

export interface SelectionAction {
  /** Button label */
  label: string
  /** Optional icon element */
  icon?: React.ReactNode
  /** Click handler */
  onClick: () => void
  /** Button variant (default: 'destructive') */
  variant?: 'destructive' | 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** Show label only on sm+ screens (hide on mobile) */
  hideLabelOnMobile?: boolean
}

interface SelectionActionBarProps {
  /** Number of selected items */
  count: number
  /** Action buttons to display */
  actions: SelectionAction[]
  /** Cancel / deselect callback */
  onCancel: () => void
  /** Cancel button label (default: 'Cancel') */
  cancelLabel?: string
}

export function SelectionActionBar({
  count,
  actions,
  onCancel,
  cancelLabel = 'Cancel',
}: SelectionActionBarProps) {
  if (count === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 sm:bottom-6 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-2 sm:gap-3 rounded-xl border bg-background/95 backdrop-blur-sm shadow-lg px-3 sm:px-5 py-2.5 sm:py-3">
          {/* Count badge */}
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
            {count}
          </span>

          {/* Action buttons */}
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant ?? 'destructive'}
              size="sm"
              className={`gap-1.5 sm:gap-2 text-xs sm:text-sm ${action.hideLabelOnMobile ? '' : ''}`}
              onClick={action.onClick}
            >
              {action.icon}
              {action.hideLabelOnMobile && (
                <span className="hidden sm:inline">{action.label}</span>
              )}
              {!action.hideLabelOnMobile && action.label}
            </Button>
          ))}

          {/* Cancel */}
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
