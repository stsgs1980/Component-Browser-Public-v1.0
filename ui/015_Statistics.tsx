// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 151

'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Briefcase, Code, Coffee, Cpu, Layers } from 'lucide-react'

interface StatItem {
  label: string
  value: number
  suffix?: string
  icon: React.ReactNode
  description: string
}

const stats: StatItem[] = [
  {
    label: 'Проекты',
    value: 11,
    suffix: '+',
    icon: <Briefcase size={24} />,
    description: 'Реализованных проектов'
  },
  {
    label: 'Опыт',
    value: 5,
    suffix: '+',
    icon: <Code size={24} />,
    description: 'Лет в разработке'
  },
  {
    label: 'Кофе',
    value: 999,
    suffix: '+',
    icon: <Coffee size={24} />,
    description: 'Выпито чашек'
  },
  {
    label: 'Технологии',
    value: 25,
    suffix: '+',
    icon: <Cpu size={24} />,
    description: 'Освоено технологий'
  }
]

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  const displayedValue = isInView ? value : 0

  return (
    <span ref={ref} className="font-mono text-4xl font-bold text-white tabular-nums">
      {displayedValue}
      {suffix}
    </span>
  )
}

export function Statistics() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto bg-neutral-900/50">
      {/* Section Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-sm text-indigo-500 uppercase tracking-wider">
          Статистика
        </span>
        <h2 className="font-mono text-3xl font-bold text-white mt-2">
          Цифры и достижения
        </h2>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg hover:border-indigo-500/50 transition-colors group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {/* Icon */}
            <motion.div
              className="text-indigo-500 mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              {stat.icon}
            </motion.div>

            {/* Counter */}
            <div className="mb-2">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>

            {/* Label */}
            <h3 className="font-mono text-sm text-neutral-400 uppercase tracking-wider mb-1">
              {stat.label}
            </h3>

            {/* Description */}
            <p className="text-xs text-neutral-500">
              {stat.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Additional Stats Bar */}
      <motion.div
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {[
          { label: 'Clients', value: '20+' },
          { label: 'Commits', value: '5000+' },
          { label: 'Reviews', value: '4.9' },
          { label: 'Projects', value: '100%' }
        ].map((item, index) => (
          <div
            key={item.label}
            className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-lg text-center"
          >
            <div className="font-mono text-2xl font-bold text-white mb-1">
              {item.value}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">
              {item.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
