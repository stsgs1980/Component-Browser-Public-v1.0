// Project: dev.studio 2 portfolio
// Category: ImageShowcase
// Source: showcases\dev.studio 2 portfolio\src\components\ImageShowcase
// Lines: 209

'use client'

import { useEffect, useRef, useState, memo } from 'react'
import { timelineSteps } from '@/data/skills'

// Animation constants
const ANIMATION_DELAY_STEP = 100
const INTERSECTION_THRESHOLD = 0.15

// Gantt data - start position and duration (in weeks, 5 weeks max for visual)
interface GanttDataItem {
  id: string
  start: number
  duration: number
}

const ganttData: GanttDataItem[] = [
  { id: '01', start: 0, duration: 1 },
  { id: '02', start: 0.5, duration: 1.5 },
  { id: '03', start: 1.5, duration: 2 },
  { id: '04', start: 3, duration: 1 },
  { id: '05', start: 4, duration: 1 }
]

// Single step component
interface ProcessStepProps {
  number: string
  title: string
  description: string
  ganttLine: GanttDataItem
  index: number
  isVisible: boolean
  isLast: boolean
}

const ProcessStep = memo(function ProcessStep({ 
  number, 
  title, 
  description, 
  ganttLine,
  index, 
  isVisible,
  isLast
}: ProcessStepProps) {
  return (
    <div 
      className="relative"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s ease-out ${index * ANIMATION_DELAY_STEP}ms`
      }}
    >
      <div className="flex items-start gap-4">
        {/* Left: Number badge with vertical connector */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div 
            className="w-10 h-10 rounded-full bg-white border-2 border-zinc-300 flex items-center justify-center transition-all duration-500 hover:border-zinc-400 hover:bg-zinc-50 relative z-10"
            style={{
              transform: isVisible ? 'scale(1)' : 'scale(0)',
              transitionDelay: `${index * ANIMATION_DELAY_STEP}ms`
            }}
          >
            <span className="text-sm font-bold text-zinc-600">{number}</span>
          </div>
          
          {/* Vertical connector line to next step */}
          {!isLast && (
            <div 
              className="w-0.5 flex-1 min-h-[24px] bg-zinc-200 transition-all duration-500"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                transformOrigin: 'top',
                transitionDelay: `${index * ANIMATION_DELAY_STEP + 300}ms`
              }}
            />
          )}
        </div>
        
        {/* Right: Text + Full width Gantt line */}
        <div className="flex-1 pb-4">
          {/* Title & Description */}
          <h3 className="font-semibold text-zinc-900 mb-1 transition-colors">
            {title}
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed mb-3">{description}</p>
          
          {/* Gantt line - full width */}
          <div 
            className="relative h-0.5 w-full"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: `opacity 0.4s ease-out ${index * ANIMATION_DELAY_STEP + 200}ms`
            }}
          >
            {/* Active line from start position */}
            <div 
              className="absolute top-0 h-full bg-zinc-400 rounded-full transition-all duration-700 ease-out"
              style={{ 
                left: `${ganttLine.start * 20}%`,
                width: isVisible ? `${ganttLine.duration * 20}%` : '0%',
                transitionDelay: `${index * ANIMATION_DELAY_STEP + 300}ms`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())

  // Single IntersectionObserver for both container and steps
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Check if it's the container or a step item
            const target = entry.target as HTMLElement
            const isContainer = target === element
            
            if (isContainer) {
              setIsVisible(true)
            } else {
              const index = Number(target.dataset.index)
              if (!isNaN(index)) {
                setVisibleSteps(prev => {
                  // Don't update if already has this index (prevent unnecessary re-renders)
                  if (prev.has(index)) return prev
                  return new Set([...prev, index])
                })
              }
            }
          }
        })
      },
      { threshold: INTERSECTION_THRESHOLD, rootMargin: '0px 0px -50px 0px' }
    )

    // Observe container
    observer.observe(element)
    
    // Observe individual steps
    const items = element.querySelectorAll('[data-step-item]')
    items.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  // Combine timeline steps with gantt data
  const combinedSteps = timelineSteps.map((step, idx) => ({
    ...step,
    ganttLine: ganttData[idx]
  }))

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Header */}
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease-out'
        }}
      >
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">Как мы работаем</h2>
        <p className="text-zinc-500 mb-4">От идеи до запуска — прозрачный процесс</p>
      </div>

      {/* Steps with full-width Gantt lines */}
      <div className="pt-2">
        {combinedSteps.map((step, idx) => (
          <div key={step.number} data-step-item data-index={idx}>
            <ProcessStep 
              number={step.number}
              title={step.title}
              description={step.description}
              ganttLine={step.ganttLine}
              index={idx}
              isVisible={visibleSteps.has(idx)}
              isLast={idx === combinedSteps.length - 1}
            />
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div 
        className="pt-2"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-out 800ms'
        }}
      >
        <p className="text-sm text-zinc-400">2-4 недели • 5 этапов</p>
      </div>
    </div>
  )
}
