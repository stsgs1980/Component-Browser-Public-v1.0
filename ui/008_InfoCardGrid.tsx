'use client'

/**
 * InfoCardGrid — Clickable card grid where the active card gets highlighted.
 * Useful for pattern/feature selectors, "pick your workflow", etc.
 *
 * De-hardcoded from: Orchestration-of-AI-Agents (pattern info cards)
 * - Replaced hardcoded pattern data → generic `InfoCard[]` prop
 * - Made card gradient, icon, and active styling configurable
 */

import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export interface InfoCard {
  id: string
  title: string
  description: string
  icon?: React.ReactNode
  /** Gradient class for the icon area (default: "from-cyan-500 to-purple-500") */
  iconGradientClass?: string
}

export interface InfoCardGridProps {
  /** Cards to display */
  cards: InfoCard[]
  /** Currently active card ID */
  activeId: string
  /** Callback when a card is clicked */
  onClick: (cardId: string) => void
  /** Grid columns (default: 3) */
  columns?: number
  /** Active card border color class (default: "border-cyan-500/50") */
  activeBorderColor?: string
  /** Active card background class (default: "bg-slate-800/80") */
  activeBgClass?: string
  /** Container class */
  className?: string
}

export function InfoCardGrid({
  cards,
  activeId,
  onClick,
  columns = 3,
  activeBorderColor = 'border-cyan-500/50',
  activeBgClass = 'bg-slate-800/80',
  className = 'grid gap-4',
}: InfoCardGridProps) {
  return (
    <div
      className={className}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {cards.map((card) => {
        const isActive = card.id === activeId
        return (
          <Card
            key={card.id}
            onClick={() => onClick(card.id)}
            className={cn(
              'cursor-pointer transition-all duration-200 backdrop-blur-sm',
              isActive
                ? cn(activeBorderColor, activeBgClass, 'border-2')
                : 'bg-slate-900/50 border-slate-700 border hover:border-slate-500',
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {card.icon && (
                  <div
                    className={cn(
                      'p-2 rounded-lg bg-gradient-to-br text-white',
                      card.iconGradientClass || 'from-cyan-500 to-purple-500',
                    )}
                  >
                    {card.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm text-white">{card.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {card.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
