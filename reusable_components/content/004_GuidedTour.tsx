'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface TourStep {
  target: string
  title: string
  description: string
  position: 'bottom' | 'top' | 'left' | 'right' | 'center'
}

interface GuidedTourProps {
  steps: TourStep[]
  storageKey: string
}

function getTargetRect(targetSelector: string): DOMRect | null {
  if (targetSelector === 'center') return null
  const el = document.querySelector(targetSelector)
  return el ? el.getBoundingClientRect() : null
}

function getPopoverStyle(
  targetRect: DOMRect | null,
  position: string,
  windowW: number,
  windowH: number
): React.CSSProperties {
  if (!targetRect || position === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  const gap = 16
  const popoverW = 360
  const popoverH = 220

  let top = 0
  let left = 0

  switch (position) {
    case 'bottom':
      top = targetRect.bottom + gap
      left = targetRect.left + targetRect.width / 2 - popoverW / 2
      break
    case 'top':
      top = targetRect.top - popoverH - gap
      left = targetRect.left + targetRect.width / 2 - popoverW / 2
      break
    case 'left':
      top = targetRect.top + targetRect.height / 2 - popoverH / 2
      left = targetRect.left - popoverW - gap
      break
    case 'right':
      top = targetRect.top + targetRect.height / 2 - popoverH / 2
      left = targetRect.right + gap
      break
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, windowW - popoverW - 12))
  top = Math.max(12, Math.min(top, windowH - popoverH - 12))

  return { top, left }
}

function SpotlightOverlay({ targetRect }: { targetRect: DOMRect | null }) {
  return (
    <svg
      className="fixed inset-0 z-[998] pointer-events-none"
      width="100%"
      height="100%"
    >
      <defs>
        <mask id="tour-spotlight">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {targetRect && (
            <rect
              x={targetRect.left - 4}
              y={targetRect.top - 4}
              width={targetRect.width + 8}
              height={targetRect.height + 8}
              rx="8"
              fill="black"
            />
          )}
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.6)"
        mask="url(#tour-spotlight)"
      />
    </svg>
  )
}

export default function GuidedTour({ steps, storageKey }: GuidedTourProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 })
  const stepRef = useRef<HTMLDivElement>(null)

  // Guard: don't render trigger during SSR to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mounted guard
  useEffect(() => { setMounted(true) }, [])

  // Read localStorage after mount to avoid hydration mismatch
  const [isCompleted, setIsCompleted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe localStorage read
    setIsCompleted(localStorage.getItem(storageKey) === 'true')
  }, [storageKey])

  const openTour = useCallback(() => {
    setCurrentStep(0)
    setIsOpen(true)
  }, [])

  const closeTour = useCallback(() => {
    setIsOpen(false)
    localStorage.setItem(storageKey, 'true')
  }, [storageKey])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      closeTour()
    }
  }, [currentStep, closeTour, steps.length])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  // Update target rect on step change
  useEffect(() => {
    if (!isOpen) return
    const updateRect = () => {
      const step = steps[currentStep]
      setTargetRect(getTargetRect(step.target))
      setWindowSize({ w: window.innerWidth, h: window.innerHeight })
    }
    updateRect()
    // Recalculate on scroll/resize
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [isOpen, currentStep, steps])

  // Scroll target into view
  useEffect(() => {
    if (!isOpen) return
    const step = steps[currentStep]
    if (step.target !== 'center') {
      const el = document.querySelector(step.target)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isOpen, currentStep, steps])

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTour()
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep()
      if (e.key === 'ArrowLeft') prevStep()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, closeTour, nextStep, prevStep])

  // Focus trap for popover
  useEffect(() => {
    if (!isOpen || !stepRef.current) return
    stepRef.current.focus()
  }, [isOpen, currentStep])

  if (steps.length === 0) return null

  if (isCompleted && !isOpen) {
    return null
  }

  const step = steps[currentStep]
  const popoverStyle = getPopoverStyle(targetRect, step.position, windowSize.w, windowSize.h)

  return (
    <>
      {/* Trigger button — only after mount to avoid SSR hydration mismatch */}
      {!isCompleted && !isOpen && mounted && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.3 }}
          onClick={openTour}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200"
          aria-label="Начать обзор"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Начать обзор</span>
        </motion.button>
      )}

      {/* Tour overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <SpotlightOverlay targetRect={targetRect} />
            {/* Highlight ring around target */}
            {targetRect && (
              <div
                className="fixed z-[997] pointer-events-none rounded-lg border-2 border-primary shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                style={{
                  top: targetRect.top - 4,
                  left: targetRect.left - 4,
                  width: targetRect.width + 8,
                  height: targetRect.height + 8,
                  transition: 'all 0.3s ease',
                }}
              />
            )}
            {/* Popover */}
            <motion.div
              ref={stepRef}
              tabIndex={-1}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="fixed z-[999] w-[340px] sm:w-[380px] rounded-xl bg-popover text-popover-foreground border shadow-2xl overflow-hidden outline-none"
              style={popoverStyle}
              role="dialog"
              aria-modal="true"
              aria-label={`Шаг ${currentStep + 1} из ${steps.length}: ${step.title}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{currentStep + 1}</span>
                  </div>
                  <span className="micro-text text-muted-foreground">{currentStep + 1} / {steps.length}</span>
                </div>
                <button
                  onClick={closeTour}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Закрыть обзор"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Content */}
              <div className="px-4 pb-3">
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-4 pb-4 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="h-8 text-xs gap-1"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Назад
                </Button>
                <div className="flex gap-1">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-200',
                        i === currentStep ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="h-8 text-xs gap-1"
                >
                  {currentStep === steps.length - 1 ? 'Завершить' : 'Далее'}
                  {currentStep < steps.length - 1 && <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
