// Project: dev.studio 2 portfolio
// Category: ImageShowcase
// Source: showcases\dev.studio 2 portfolio\src\components\ImageShowcase
// Lines: 156

'use client'

import { useEffect, useRef, useState } from 'react'
import { useInViewSpan } from '@/hooks/useInView'

// Animation constants
const COUNTER_DURATION = 2000
const ANIMATION_DELAY_STEP = 100
const INTERSECTION_THRESHOLD = 0.5

interface StatItem {
  id: string
  value: number
  suffix: string
  label: string
  sublabel: string
  progress: number
  bgClass: string
}

const stats: StatItem[] = [
  { id: 'projects', value: 50, suffix: '+', label: 'Проектов', sublabel: 'завершено', progress: 100, bgClass: 'bg-zinc-900' },
  { id: 'clients', value: 100, suffix: '%', label: 'Довольных клиентов', sublabel: 'рейтинг', progress: 100, bgClass: 'bg-zinc-500' },
  { id: 'experience', value: 3, suffix: '', label: 'Года опыта', sublabel: 'на рынке', progress: 75, bgClass: 'bg-zinc-700' },
  { id: 'support', value: 24, suffix: '/7', label: 'Поддержка', sublabel: 'всегда на связи', progress: 0, bgClass: 'bg-cyan-500' },
]

interface AnimatedCounterProps {
  value: number
  suffix: string
}

function AnimatedCounter({ value, suffix }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const { ref, isVisible } = useInViewSpan({ threshold: INTERSECTION_THRESHOLD })

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    let animationId: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / COUNTER_DURATION, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
    setCount(Math.floor(easeOut * value))

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isVisible, value])

  return (
    <span ref={ref} className="text-xs font-bold text-white">
      {count}{suffix}
    </span>
  )
}

interface AnimatedProgressProps {
  progress: number
  isVisible: boolean
}

function AnimatedProgress({ progress, isVisible }: AnimatedProgressProps) {
  return (
    <div className="h-0.5 bg-zinc-200 rounded-full overflow-hidden mt-1">
      <div 
        className="h-full bg-zinc-900 rounded-full transition-all duration-1000 ease-out"
        style={{ width: isVisible ? `${progress}%` : '0%' }}
      />
    </div>
  )
}

interface AnimatedBarsProps {
  isVisible: boolean
}

function AnimatedBars({ isVisible }: AnimatedBarsProps) {
  return (
    <div className="flex gap-1 mt-1">
      {[...Array(7)].map((_, i) => (
        <div 
          key={i} 
          className="flex-1 h-0.5 bg-zinc-400 rounded transition-all duration-300 ease-out"
          style={{ 
            opacity: isVisible ? 1 : 0, 
            transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
            transitionDelay: `${i * 50}ms`
          }}
        />
      ))}
    </div>
  )
}

export function StatsSection() {
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="grid grid-cols-2 gap-x-8 gap-y-6">
      {stats.map((stat, idx) => (
        <div 
          key={stat.id} 
          className="group"
          style={{ 
            opacity: isInView ? 1 : 0, 
            transform: isInView ? 'translateY(0)' : 'translateY(20px)',
            transition: `all 0.5s ease-out ${idx * ANIMATION_DELAY_STEP}ms`
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 ${stat.bgClass} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700 transition-colors block truncate">{stat.label}</span>
              <span className="text-xs text-zinc-400">{stat.sublabel}</span>
            </div>
          </div>
          {stat.progress > 0 ? (
            <AnimatedProgress progress={stat.progress} isVisible={isInView} />
          ) : (
            <AnimatedBars isVisible={isInView} />
          )}
        </div>
      ))}
    </div>
  )
}
