'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedCard } from './001_AnimatedContainer'

interface Category {
  id: string
  name: string
}

interface FilterableItem {
  id: string
  name: string
  description: string
  category: string
  [key: string]: unknown // allow extra fields for rendering
}

interface SearchableFilterableGridProps<T extends FilterableItem> {
  items: T[]
  categories: Category[]
  searchPlaceholder?: string
  /** Which fields to search through (default: ['name', 'description']) */
  searchKeys?: (keyof T)[]
  /** Render function for each card */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Empty state message */
  emptyMessage?: string
  /** Grid columns class (default: 'md:grid-cols-2') */
  gridClassName?: string
}

/**
 * SearchableFilterableGrid — универсальная сетка с поиском + табами-фильтрами.
 *
 * Обобщён паттерн из ComponentsSection и LibrariesSection:
 *   1. Input с иконкой поиска
 *   2. Tabs для категорий
 *   3. AnimatedCard сетка отфильтрованных элементов
 *   4. Empty state при нулевых результатах
 *
 * Пример использования:
 * ```tsx
 * <SearchableFilterableGrid
 *   items={libraries}
 *   categories={[{ id: 'all', name: 'All' }, { id: 'styling', name: 'Styling' }]}
 *   renderItem={(lib, i) => <Card key={lib.id}>...</Card>}
 * />
 * ```
 */
export function SearchableFilterableGrid<T extends FilterableItem>({
  items,
  categories,
  searchPlaceholder = 'Search...',
  searchKeys = ['name', 'description'],
  renderItem,
  emptyMessage = 'No items found.',
  gridClassName = 'md:grid-cols-2',
}: SearchableFilterableGridProps<T>) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        search === '' ||
        searchKeys.some((key) =>
          String(item[key]).toLowerCase().includes(search.toLowerCase()),
        )
      const matchesCategory = category === 'all' || item.category === category
      return matchesSearch && matchesCategory
    })
  }, [items, search, category, searchKeys])

  return (
    <div className="space-y-6">
      {/* Search + Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-1 gap-6 ${gridClassName}`}>
        {filteredItems.map((item, index) => (
          <AnimatedCard key={item.id} index={index}>
            {renderItem(item, index)}
          </AnimatedCard>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}
