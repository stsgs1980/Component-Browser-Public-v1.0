/**
 * useFilteredSections — Client-side fuzzy search filter for categorized sections.
 * Filters sections and their items by matching query against name, description,
 * and features. Removes empty sections after filtering.
 *
 * De-hardcoded from: carbon-design-system-guide (page.tsx search logic)
 * - Extracted from inline filter logic into a standalone hook
 * - Made searchable fields configurable via `searchableFields`
 * - Returns filtered results + total match count
 */

import { useMemo } from 'react'

export interface FilterableSection<TItem = FilterableItem> {
  id?: string
  title?: string
  description?: string
  items: TItem[]
}

export interface FilterableItem {
  name?: string
  description?: string
  features?: string[]
  [key: string]: unknown
}

export interface UseFilteredSectionsOptions<TItem = FilterableItem> {
  /** Sections to filter */
  sections: FilterableSection<TItem>[]
  /** Current search query */
  query: string
  /** Additional fields on each item to search (default: ["name", "description"]) */
  searchableFields?: (keyof TItem)[]
  /** Whether to search within features array (default: true) */
  searchFeatures?: boolean
  /** Case-insensitive search (default: true) */
  caseInsensitive?: boolean
}

export interface UseFilteredSectionsResult<TItem = FilterableItem> {
  /** Filtered sections (empty sections removed) */
  filteredSections: FilterableSection<TItem>[]
  /** Total number of matching items across all sections */
  totalMatches: number
  /** Whether a filter is currently active */
  isFiltered: boolean
}

export function useFilteredSections<TItem extends Record<string, unknown> = FilterableItem>({
  sections,
  query,
  searchableFields = ['name', 'description'] as (keyof TItem)[],
  searchFeatures = true,
  caseInsensitive = true,
}: UseFilteredSectionsOptions<TItem>): UseFilteredSectionsResult<TItem> {
  return useMemo(() => {
    if (!query.trim()) {
      return {
        filteredSections: sections,
        totalMatches: sections.reduce((acc, s) => acc + s.items.length, 0),
        isFiltered: false,
      }
    }

    const q = caseInsensitive ? query.toLowerCase() : query

    const filtered = sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          // Search configured fields
          for (const field of searchableFields) {
            const value = item[field]
            if (typeof value === 'string') {
              const v = caseInsensitive ? value.toLowerCase() : value
              if (v.includes(q)) return true
            }
          }
          // Search features array
          if (searchFeatures && Array.isArray(item.features)) {
            if (item.features.some((f) => {
              const v = caseInsensitive ? f.toLowerCase() : f
              return v.includes(q)
            })) return true
          }
          return false
        }),
      }))
      .filter((section) => section.items.length > 0)

    return {
      filteredSections: filtered,
      totalMatches: filtered.reduce((acc, s) => acc + s.items.length, 0),
      isFiltered: true,
    }
  }, [sections, query, searchableFields, searchFeatures, caseInsensitive])
}
