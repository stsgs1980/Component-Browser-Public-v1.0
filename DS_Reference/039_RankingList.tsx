'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RankingItem {
  id: string
  name: string
  value: number
}

interface RankingListProps {
  title?: string
  description?: string
  items: RankingItem[]
  /** Maximum value for percentage calculation (default: max item value) */
  maxValue?: number
  /** Whether to sort items by value descending (default: true) */
  sortDescending?: boolean
  /** Progress bar color class (default: 'bg-primary') */
  barClassName?: string
  /** Progress bar background class (default: 'bg-muted') */
  trackClassName?: string
  /** Show percentage label (default: true) */
  showPercentage?: boolean
  className?: string
}

/**
 * RankingList — список с рангом и анимированным прогресс-баром.
 *
 * Извлечён из ComparisonSection (рейтинг популярности дизайн-систем).
 * Подходит для:
 *   - таблиц лидеров (leaderboards)
 *   - рейтингов популярности
 *   - результатов голосования
 *   - skill-assessment отображений
 *
 * Пример:
 * ```tsx
 * <RankingList
 *   items={[
 *     { id: 'react', name: 'React', value: 92 },
 *     { id: 'vue', name: 'Vue', value: 74 },
 *   ]}
 * />
 * ```
 */
export function RankingList({
  title,
  description,
  items,
  maxValue,
  sortDescending = true,
  barClassName = 'bg-primary',
  trackClassName = 'bg-muted',
  showPercentage = true,
  className,
}: RankingListProps) {
  const sorted = sortDescending
    ? [...items].sort((a, b) => b.value - a.value)
    : items

  const max = maxValue ?? Math.max(...sorted.map((i) => i.value), 1)

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {sorted.map((item, index) => {
            const percentage = Math.round((item.value / max) * 100)
            return (
              <div key={item.id} className="flex items-center gap-4">
                <span className="w-6 text-sm text-muted-foreground">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{item.name}</span>
                    {showPercentage && (
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                    )}
                  </div>
                  <div className={`h-2 ${trackClassName} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${barClassName} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
