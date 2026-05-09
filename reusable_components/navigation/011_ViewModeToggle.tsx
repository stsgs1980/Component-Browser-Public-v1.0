'use client'

/**
 * ViewModeToggle — compact grid/list view switcher button group.
 * Repeated in dictionary-view and documents-view with identical markup.
 *
 * Source: Wiki-Codex-v2 /src/components/codex/dictionary-view.tsx (lines 441-458)
 * De-hardcoded:
 *   - Generic mode type <M extends string>
 *   - Configurable icons per mode
 *   - Controlled component (value + onChange)
 */

import { Grid, List } from 'lucide-react'
import { Button } from './ui-button' // shadcn/ui button

export interface ViewModeOption<M extends string> {
  value: M
  icon: React.ReactNode
  label?: string
}

interface ViewModeToggleProps<M extends string> {
  /** Current active mode */
  value: M
  /** Called when user clicks a mode */
  onChange: (mode: M) => void
  /** Available modes (default: grid + list) */
  modes?: ViewModeOption<M>[]
  /** Additional class name */
  className?: string
}

/** Default grid/list mode options */
const DEFAULT_MODES: ViewModeOption<'grid' | 'list'>[] = [
  { value: 'grid', icon: <Grid className="size-3.5 sm:size-4" /> },
  { value: 'list', icon: <List className="size-3.5 sm:size-4" /> },
]

export function ViewModeToggle<M extends string = 'grid' | 'list'>({
  value,
  onChange,
  modes,
  className,
}: ViewModeToggleProps<M>) {
  const resolvedModes = modes ?? (DEFAULT_MODES as unknown as ViewModeOption<M>[])

  return (
    <div className={`flex border rounded-md ${className ?? ''}`}>
      {resolvedModes.map((mode, idx) => (
        <Button
          key={mode.value}
          variant={value === mode.value ? 'secondary' : 'ghost'}
          size="icon"
          className={`size-7 sm:size-8 ${
            idx === 0 ? 'rounded-r-none' : idx === resolvedModes.length - 1 ? 'rounded-l-none' : 'rounded-none'
          }`}
          onClick={() => onChange(mode.value)}
          title={mode.label ?? mode.value}
        >
          {mode.icon}
        </Button>
      ))}
    </div>
  )
}
