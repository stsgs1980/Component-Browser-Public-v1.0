'use client'

import { useCallback, useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui-command' // shadcn/ui command
import { Search } from 'lucide-react'

/**
 * CommandPalette — ⌘K-activated global search dialog with multi-category entries.
 *
 * Source: LLM-MEM-GUIDE /src/components/overlay/GlobalSearch.tsx (434 lines)
 * De-hardcoded:
 *   - Generic SearchEntry type instead of domain data
 *   - Configurable entry providers via `entries` prop
 *   - Category grouping via `categoryOrder` and `categoryLabels`
 *   - Keyboard hints footer is generic
 *   - `open`/`onOpenChange` controlled state (no store dependency)
 */

export interface SearchEntry<T = void> {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Secondary description */
  description: string
  /** Category key for grouping */
  categoryKey: string
  /** Icon component */
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  /** Optional payload attached to this entry */
  payload?: T
  /** Action callback when entry is selected */
  action: () => void
}

export interface CategoryConfig {
  key: string
  label: string
  /** Display order (lower = first) */
  order: number
}

interface CommandPaletteProps<T = void> {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Searchable entries to display */
  entries: SearchEntry<T>[]
  /** Category display order (lower = first) */
  categoryOrder?: string[]
  /** Category display labels */
  categoryLabels?: Record<string, string>
  /** Placeholder text for search input */
  placeholder?: string
  /** Empty state text */
  emptyText?: string
  /** Empty state description */
  emptyDescription?: string
  /** Dialog title */
  title?: string
  /** Dialog max width class */
  maxWidthClass?: string
  /** Additional class name for the dialog */
  className?: string
  /** Called when an entry is selected */
  onSelect?: (entry: SearchEntry<T>) => void
  /** Show keyboard hints footer (default: true) */
  showKeyboardHints?: boolean
}

export function CommandPalette<T = void>({
  open,
  onOpenChange,
  entries,
  categoryOrder,
  categoryLabels,
  placeholder = 'Search...',
  emptyText = 'No results found',
  emptyDescription = 'Try a different query',
  title = 'Search',
  maxWidthClass = 'sm:max-w-xl',
  className,
  onSelect,
  showKeyboardHints = true,
}: CommandPaletteProps<T>) {
  const handleSelect = useCallback(
    (entry: SearchEntry<T>) => {
      entry.action()
      onSelect?.(entry)
    },
    [onSelect],
  )

  // Group entries by categoryKey, preserving configured order
  const effectiveOrder = categoryOrder ?? [...new Set(entries.map(e => e.categoryKey))]
  const effectiveLabels = categoryLabels ?? {}

  const grouped = effectiveOrder
    .map(key => ({
      key,
      label: effectiveLabels[key] ?? key,
      items: entries.filter(e => e.categoryKey === key),
    }))
    .filter(g => g.items.length > 0)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={title} className={maxWidthClass}>
      <CommandInput placeholder={placeholder} className="font-mono text-sm h-12" />
      <CommandList className="max-h-[420px] overflow-y-auto">
        <CommandEmpty className="py-8">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Search className="size-6 opacity-30" />
            <p className="font-mono text-sm">{emptyText}</p>
            <p className="font-mono text-xs opacity-60">{emptyDescription}</p>
          </div>
        </CommandEmpty>

        {grouped.map((group, gi) => (
          <div key={group.key}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={group.label}>
              {group.items.map((entry) => {
                const Icon = entry.icon
                return (
                  <CommandItem
                    key={entry.id}
                    value={`${entry.label} ${entry.description}`}
                    onSelect={() => handleSelect(entry)}
                    className="font-mono text-xs gap-3 px-3 py-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="size-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{entry.label}</div>
                      <div className="text-muted-foreground truncate mt-0.5 opacity-70">{entry.description}</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50 shrink-0 uppercase tracking-wider font-mono">
                      {group.label}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>

      {/* Keyboard hints footer */}
      {showKeyboardHints && (
        <div className="border-t border-border px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-mono">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex h-4 select-none items-center rounded border bg-muted px-1 font-mono text-[9px] text-muted-foreground">↑↓</kbd>
              navigate
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex h-4 select-none items-center rounded border bg-muted px-1 font-mono text-[9px] text-muted-foreground">↵</kbd>
              select
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex h-4 select-none items-center rounded border bg-muted px-1 font-mono text-[9px] text-muted-foreground">esc</kbd>
              close
            </span>
          </span>
        </div>
      )}
    </CommandDialog>
  )
}
