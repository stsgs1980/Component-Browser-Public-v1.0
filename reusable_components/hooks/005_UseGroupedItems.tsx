'use client'

import { useMemo } from 'react'

/**
 * useGroupedItems — groups an array of items by the first character of a key.
 * Returns sorted groups for rendering alphabet navigation bars.
 *
 * Common in: contacts apps, dictionaries, glossaries, any large sorted list.
 *
 * Source: Wiki-Codex-v2 /src/components/codex/dictionary-view.tsx (lines 120-128)
 * De-hardcoded:
 *   - Generic <T> with keyExtractor callback
 *   - Configurable groupKey function (first char, custom logic)
 *   - Sort comparator is configurable
 */

export interface GroupedItems<T> {
  key: string
  items: T[]
}

interface UseGroupedItemsOptions<T> {
  /** Extract the grouping key from each item */
  keyExtractor: (item: T) => string
  /** Optional custom group key logic (default: uppercase first char, '#' for non-alpha) */
  getGroupKey?: (key: string) => string
  /** Optional sort comparator for group keys (default: localeCompare) */
  sortGroups?: (a: string, b: string) => number
}

export function useGroupedItems<T>(
  items: T[],
  options: UseGroupedItemsOptions<T>,
): GroupedItems<T>[] {
  const { keyExtractor, getGroupKey, sortGroups } = options

  return useMemo(() => {
    const groups: Record<string, T[]> = {}

    for (const item of items) {
      const key = keyExtractor(item)
      const groupKey = getGroupKey
        ? getGroupKey(key)
        : defaultGetGroupKey(key)

      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(item)
    }

    const comparator = sortGroups ?? ((a: string, b: string) => a.localeCompare(b))

    return Object.entries(groups)
      .sort(([a], [b]) => comparator(a, b))
      .map(([key, items]) => ({ key, items }))
  }, [items, keyExtractor, getGroupKey, sortGroups])
}

/** Default grouping: uppercase first letter, '#' for non-alphabetic characters */
function defaultGetGroupKey(key: string): string {
  const letter = key.charAt(0).toUpperCase()
  if (/[A-Z]/.test(letter)) return letter
  if (/[А-ЯЁ]/.test(letter)) return letter
  return '#'
}

/**
 * AlphabetNav — horizontal letter navigation bar with scrollIntoView.
 * Pairs with useGroupedItems for instant jump-to-group behavior.
 */
interface AlphabetNavProps<T> {
  /** Grouped items from useGroupedItems */
  groups: GroupedItems<T>[]
  /** ID prefix for scroll targets (elements must have id={prefix + group.key}) */
  idPrefix?: string
  /** Additional class name */
  className?: string
}

export function AlphabetNav<T>({
  groups,
  idPrefix = 'group-',
  className,
}: AlphabetNavProps<T>) {
  const scrollToGroup = (key: string) => {
    const el = document.getElementById(`${idPrefix}${key}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`hidden md:flex gap-1 ${className ?? ''}`}>
      {groups.map(({ key }) => (
        <button
          key={key}
          className="w-7 h-7 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
          onClick={() => scrollToGroup(key)}
        >
          {key}
        </button>
      ))}
    </div>
  )
}
