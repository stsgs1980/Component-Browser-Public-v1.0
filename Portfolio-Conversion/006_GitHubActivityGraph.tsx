// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 171

'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

interface ActivityLevel {
  date: string
  level: number // 0-4: 0=no activity, 1-4=activity levels
}

// Generate mock activity data for last 52 weeks (deterministic)
function generateActivityData(): ActivityLevel[] {
  const data: ActivityLevel[] = []
  const now = new Date()
  const seed = 42 // Fixed seed for deterministic results

  // Seeded random function
  const seededRandom = (index: number) => {
    const x = Math.sin(index * seed) * 10000
    return Math.floor(Math.abs(Math.sin(x) * 10000) % 5)
  }

  for (let i = 0; i < 52; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - (i * 7))
    const level = seededRandom(i)
    data.push({
      date: date.toISOString().split('T')[0],
      level
    })
  }

  return data.reverse()
}

const activityColors = [
  'bg-neutral-800', // Level 0
  'bg-indigo-900/30', // Level 1
  'bg-indigo-800/50', // Level 2
  'bg-indigo-700/70', // Level 3
  'bg-indigo-600'      // Level 4
]

const levelLabels = ['Нет активности', 'Низкая', 'Средняя', 'Высокая', 'Очень высокая']

export function GitHubActivityGraph() {
  const activityData = useMemo(() => generateActivityData(), [])

  const getActivityCount = () => {
    return activityData.filter(d => d.level > 0).length
  }

  const getStreak = () => {
    let streak = 0
    for (let i = activityData.length - 1; i >= 0; i--) {
      if (activityData[i].level > 0) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-sm text-indigo-500 uppercase tracking-wider">
          Активность
        </span>
        <h2 className="font-mono text-3xl font-bold text-white mt-2">
          GitHub Contribution Graph
        </h2>
        <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">
          Визуализация продуктивности за последний год
        </p>
      </motion.div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-12">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{getActivityCount()}</div>
          <div className="text-sm text-neutral-500 font-mono mt-1">недель с активностью</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{getStreak()}</div>
          <div className="text-sm text-neutral-500 font-mono mt-1">текущий стрик</div>
        </div>
      </div>

      {/* Activity Graph */}
      <motion.div
        className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="min-w-[700px]">
          {/* Grid */}
          <div className="grid grid-rows-7 gap-1 mb-2">
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {Array.from({ length: 52 }).map((_, colIndex) => {
                  const dataIndex = rowIndex * 52 + colIndex
                  const activity = activityData[dataIndex]
                  if (!activity) return null

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-3 h-3 rounded-sm ${activityColors[activity.level]} transition-transform hover:scale-125 cursor-pointer`}
                      title={`${activity.date}: ${levelLabels[activity.level]}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-end items-center gap-2 text-xs text-neutral-500 font-mono mt-4">
            <span>Меньше</span>
            {activityColors.map((color, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-sm ${color}`}
                title={levelLabels[index]}
              />
            ))}
            <span>Больше</span>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        className="mt-8 max-w-2xl mx-auto bg-neutral-900/50 border border-neutral-800 rounded-lg p-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600/20 rounded-lg">
            <Activity className="text-indigo-500" size={24} />
          </div>
          <div>
            <h3 className="font-mono text-white font-semibold mb-2">
              О графике активности
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Этот график визуализирует активность разработки за последние 52 недели.
              Каждый квадрат представляет неделю, а цвет интенсивность работы.
              Зеленые/индиго квадраты показывают продуктивные недели.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
