'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

interface StatItem {
  icon: LucideIcon
  value: string
  label: string
  /** Tailwind gradient classes, e.g. 'from-violet-500 to-purple-600' */
  gradient: string
  /** Optional shadow color for the icon box */
  shadowColor?: string
}

interface StatsGridProps {
  stats: StatItem[]
  /** Grid columns class (default: 'grid-cols-2 lg:grid-cols-4') */
  gridClassName?: string
  /** Animation stagger delay between cards (default: 0.15) */
  staggerDelay?: number
  /** Initial animation delay before first card (default: 0.4) */
  initialDelay?: number
  className?: string
}

/**
 * StatsGrid — сетка карточек с метриками (icon + value + label).
 *
 * Извлечён из HomeSection — glassmorphism-карточки с hover-lift,
 * градиентной иконкой, угловым акцентом и анимацией появления.
 *
 * Пример:
 * ```tsx
 * <StatsGrid
 *   stats={[
 *     { icon: Layers, value: '8+', label: 'Design Systems', gradient: 'from-violet-500 to-purple-600' },
 *     { icon: Puzzle, value: '50+', label: 'Components', gradient: 'from-blue-500 to-cyan-500' },
 *   ]}
 * />
 * ```
 */
export function StatsGrid({
  stats,
  gridClassName = 'grid-cols-2 lg:grid-cols-4',
  staggerDelay = 0.15,
  initialDelay = 0.4,
  className,
}: StatsGridProps) {
  return (
    <section className={className}>
      <div className={`grid gap-4 lg:gap-5 ${gridClassName}`}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: initialDelay + index * staggerDelay,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            {/* Gradient background overlay */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
            />

            {/* Content */}
            <div className="relative p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/80 dark:border-white/10 group-hover:border-white dark:group-hover:border-white/20 transition-all duration-300">
              {/* Icon with gradient background */}
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                style={{
                  boxShadow: stat.shadowColor
                    ? `0 8px 32px -8px ${stat.shadowColor}`
                    : undefined,
                }}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </motion.div>

              {/* Value */}
              <div className="text-3xl font-bold mb-1">{stat.value}</div>

              {/* Label */}
              <div className="text-sm text-muted-foreground">{stat.label}</div>

              {/* Decorative corner accent */}
              <div
                className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
