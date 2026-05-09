'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play, Pause, RotateCcw, ChevronRight, Layers, Minimize2, Database,
  FileJson, Zap, ArrowRight, RotateCw,
} from 'lucide-react'

// ──────────────────────────────────────────────
//  Exported Interfaces
// ──────────────────────────────────────────────

/** Generic string literal for item category types */
export type ItemCategory = string

/** Animation phases of the flow visualization */
export type AnimationPhase = 'idle' | 'building' | 'processing' | 'complete'

/** Color palette for a single flow stage */
export interface StageColorScheme {
  /** Tailwind text color class */
  color: string
  /** Tailwind background class (light + dark) */
  colorBg: string
  /** Tailwind border color class (light + dark) */
  colorBorder: string
  /** Tailwind accent text class (light + dark) */
  colorAccent: string
  /** Tailwind badge background + text class */
  colorBadge: string
}

/** Configuration for a single flow / processing stage */
export interface FlowStageConfig extends StageColorScheme {
  /** Unique identifier for this stage */
  id: string
  /** Display label for this stage */
  label: string
  /** Lucide icon component */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  /** Short description of what this stage does */
  description: string
  /** Output/input ratio (1.0 = pass-through, 0.1 = 90% reduction) */
  compressionRatio: number
}

/** Color mapping for item categories */
export type CategoryColorMap = Record<string, string>

/** Label mapping for item categories */
export type CategoryLabelMap = Record<string, string>

/** Configuration for the input sliders */
export interface SliderConfig {
  /** Slider label text */
  label: string
  /** Initial / default value */
  defaultValue: number
  /** Minimum value */
  min: number
  /** Maximum value */
  max: number
  /** Step increment */
  step: number
}

/** Labels used in the progress bar steps */
export interface ProgressStepLabels {
  /** Label for the "building / accumulating" phase */
  building: string
  /** Label for the "processing" phase */
  processing: string
  /** Label for the "complete" phase */
  complete: string
}

/** Labels for the savings meter thresholds */
export interface SavingsLabels {
  /** Label when savings > 80% */
  excellent: string
  /** Label when savings > 50% */
  good: string
  /** Label when savings > 0% */
  some: string
  /** Label when savings = 0% */
  none: string
  /** Generic unit label below the percentage (e.g. "savings") */
  unit: string
}

/** Labels used throughout the UI */
export interface FlowVisualizerLabels {
  /** Card header title */
  title: string
  /** Card header subtitle */
  subtitle: string
  /** Label above the stage tabs */
  stagesLabel: string
  /** Compression ratio badge prefix (e.g. "Compression:") */
  compressionPrefix: string
  /** "Pause" button text */
  pause: string
  /** "Play / Start" button text */
  play: string
  /** "Replay" button text */
  replay: string
  /** "Reset" button text */
  reset: string
  /** Speed label prefix (e.g. "Speed:") */
  speedPrefix: string
  /** Left panel heading (raw items) */
  rawItemsLabel: string
  /** Right panel heading (processed items) */
  processedItemsLabel: string
  /** Right panel label when no processing (pass-through) */
  unmodifiedLabel: string
  /** Placeholder when idle */
  idlePlaceholder: string
  /** Placeholder when building */
  buildingPlaceholder: string
  /** Placeholder when waiting for processing */
  waitingPlaceholder: string
  /** Stats row: total input count label */
  statInput: string
  /** Stats row: output count label */
  statOutput: string
  /** Stats row: saved count label */
  statSaved: string
  /** Stats row: ratio / coefficient label */
  statRatio: string
  /** Baseline bar label (no-processing row) */
  baselineLabel: string
  /** Reduction badge prefix (e.g. "Reduction by") */
  reductionPrefix: string
  /** No-reduction badge text (e.g. "No reduction — 0% savings") */
  noReductionText: string
  /** Token / item unit abbreviation (e.g. "tokens", "items") */
  itemUnitAbbrev: string
}

/** All props for the TokenFlowVisualizer component */
export interface TokenFlowVisualizerProps {
  /** Array of flow stages to display as tabs */
  stages: FlowStageConfig[]
  /** The stage id that means "no processing" (pass-through). Defaults to "none". */
  passthroughStageId?: string
  /** Map from category key → Tailwind bg color class */
  categoryColors: CategoryColorMap
  /** Map from category key → display label */
  categoryLabels: CategoryLabelMap
  /** Function to generate a sequence of category keys for a given count */
  generateCategories: (count: number) => ItemCategory[]
  /** Configuration for the first slider (e.g. message count) */
  sliderA?: SliderConfig
  /** Configuration for the second slider (e.g. items per message) */
  sliderB?: SliderConfig
  /** Labels for the progress steps */
  progressSteps: ProgressStepLabels
  /** Labels for the savings meter */
  savingsLabels: SavingsLabels
  /** All text labels used in the UI */
  labels: FlowVisualizerLabels
  /** Maximum number of items to render in the grid (default 200) */
  maxDisplayItems?: number
  /** Speed multiplier options (default [{label:'0.5x',value:0.5},{label:'1x',value:1},{label:'2x',value:2}]) */
  speedOptions?: { label: string; value: number }[]
}

// ──────────────────────────────────────────────
//  CSS Keyframes
// ──────────────────────────────────────────────

const TOKEN_FLOW_KEYFRAMES = `
  @keyframes tokenFlowRight {
    0% { transform: translateX(0) scale(1); opacity: 1; }
    50% { transform: translateX(30px) scale(0.8); opacity: 0.6; }
    100% { transform: translateX(60px) scale(0); opacity: 0; }
  }
  @keyframes tokenAppear {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes tokenFadeOut {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0.3); opacity: 0; }
  }
  @keyframes savingsPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes flowLine {
    0% { stroke-dashoffset: 20; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  @keyframes mergeFloat {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-20px) scale(0.5); opacity: 0; }
  }
  @keyframes chunkFly {
    0% { transform: translateY(0) translateX(0); opacity: 1; }
    100% { transform: translateY(10px) translateX(30px); opacity: 0; }
  }
  @keyframes jsonFieldPop {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .token-flow-right { animation: tokenFlowRight 0.6s ease-in forwards; }
  .token-appear { animation: tokenAppear 0.35s ease-out forwards; }
  .token-fade-out { animation: tokenFadeOut 0.5s ease-in forwards; }
  .savings-pulse { animation: savingsPulse 2s ease-in-out infinite; }
  .flow-line-anim { animation: flowLine 1s linear infinite; }
  .dot-pulse { animation: dotPulse 1.5s ease-in-out infinite; }
  .merge-float { animation: mergeFloat 0.8s ease-in forwards; }
  .chunk-fly { animation: chunkFly 0.7s ease-in forwards; }
  .json-field-pop { animation: jsonFieldPop 0.4s ease-out forwards; }
`

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// ──────────────────────────────────────────────
//  Sub-Components
// ──────────────────────────────────────────────

function TokenGrid({
  tokens,
  maxVisible,
  phase,
  containerType,
  categoryColors,
  categoryLabels,
  maxDisplay,
}: {
  tokens: ItemCategory[]
  maxVisible: number
  phase: AnimationPhase
  containerType: 'raw' | 'processed'
  categoryColors: CategoryColorMap
  categoryLabels: CategoryLabelMap
  maxDisplay: number
}) {
  const visibleTokens = tokens.slice(0, maxVisible)
  const displayTokens = visibleTokens.slice(0, maxDisplay)
  const overflowCount = Math.max(0, visibleTokens.length - maxDisplay)

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-[3px]">
        <AnimatePresence>
          {displayTokens.map((cat, i) => (
            <motion.div
              key={`${containerType}-${i}`}
              initial={phase === 'building' && containerType === 'raw' ? { scale: 0, opacity: 0 } : undefined}
              animate={
                phase === 'processing' && containerType === 'raw' && i > maxVisible * 0.5
                  ? { opacity: 0.2, scale: 0.6 }
                  : phase === 'complete' && containerType === 'raw' && i > maxVisible * 0.3
                    ? { opacity: 0.15 }
                    : { scale: 1, opacity: 1 }
              }
              transition={{
                duration: 0.25,
                delay: phase === 'building' && containerType === 'raw' ? Math.min(i * 0.008, 1.5) : undefined,
              }}
              className={`w-[10px] h-[14px] rounded-[2px] ${categoryColors[cat] || 'bg-gray-400'} ${
                phase === 'processing' && containerType === 'raw' && i > maxVisible * 0.7
                  ? 'token-fade-out'
                  : ''
              }`}
              title={categoryLabels[cat] || cat}
            />
          ))}
        </AnimatePresence>
      </div>
      {overflowCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 right-0 bg-background/80 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground border"
        >
          +{formatNumber(overflowCount)}
        </motion.div>
      )}
    </div>
  )
}

function ProcessingAnimation({
  technique,
  phase,
  progress,
  config,
}: {
  technique: string
  phase: AnimationPhase
  progress: number
  config: FlowStageConfig
}) {
  const Icon = config.icon
  const isActive = phase === 'processing' || phase === 'complete'

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={technique}
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 1 : 0.3 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className={`h-16 w-16 rounded-full ${config.colorBg} flex items-center justify-center border-2 ${config.colorBorder}`}>
              <Icon className={`h-7 w-7 ${config.color} ${phase === 'processing' ? 'animate-pulse' : ''}`} />
            </div>
            {phase === 'processing' && config.compressionRatio < 1 && (
              <motion.div
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white micro-text font-bold flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {Math.round(progress)}%
              </motion.div>
            )}
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium ${config.colorAccent}`}>{config.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
          </div>
          {phase === 'processing' && (
            <div className="flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
                  animate={{
                    x: [0, 20, 40],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function SavingsMeter({
  savings,
  animated,
  labels,
}: {
  savings: number
  animated: boolean
  labels: SavingsLabels
}) {
  const clampedSavings = Math.max(0, Math.min(100, savings))

  const getTier = () => {
    if (clampedSavings > 70) return 'high'
    if (clampedSavings > 40) return 'mid'
    return 'low'
  }

  const tier = getTier()
  const tierClasses: Record<string, { ring: string; text: string; badge: string }> = {
    high: {
      ring: 'text-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    },
    mid: {
      ring: 'text-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    },
    low: {
      ring: 'text-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    },
  }

  const cls = tierClasses[tier]

  const getBadgeText = () => {
    if (clampedSavings > 80) return labels.excellent
    if (clampedSavings > 50) return labels.good
    if (clampedSavings > 0) return labels.some
    return labels.none
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 42 * (1 - clampedSavings / 100),
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={cls.ring}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-lg font-bold ${cls.text} ${animated ? 'savings-pulse' : ''}`}
            key={Math.round(clampedSavings)}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {Math.round(clampedSavings)}%
          </motion.span>
          <span className="micro-text text-muted-foreground">{labels.unit}</span>
        </div>
      </div>
      <Badge variant="secondary" className={`micro-text ${cls.badge}`}>
        <Zap className="h-3 w-3 mr-1" />
        {getBadgeText()}
      </Badge>
    </div>
  )
}

function FlowArrow({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <motion.div
        animate={active ? { x: [0, 6, 0], opacity: [0.5, 1, 0.5] } : { opacity: 0.3 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronRight className={`h-6 w-6 ${color}`} />
      </motion.div>
    </div>
  )
}

function ProgressBar({
  phase,
  progress,
  stepLabels,
}: {
  phase: AnimationPhase
  progress: number
  stepLabels: ProgressStepLabels
}) {
  const steps = [
    { label: stepLabels.building, key: 'building' },
    { label: stepLabels.processing, key: 'processing' },
    { label: stepLabels.complete, key: 'complete' },
  ] as const

  const currentIndex = steps.findIndex(s => s.key === phase)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <motion.div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                i < currentIndex
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : i === currentIndex
                    ? 'bg-primary border-primary text-primary-foreground pulse-ring'
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground'
              }`}
              animate={
                i === currentIndex
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {i < currentIndex ? '\u2713' : i + 1}
            </motion.div>
            <span className={`text-xs hidden sm:inline ${
              i <= currentIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-8 sm:w-16 h-0.5 mx-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    i < currentIndex ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                  }`}
                  animate={{ width: i < currentIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AnimatedCounter({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value)

  useEffect(() => {
    const duration = 600
    const startTime = Date.now()
    const startValue = displayed
    const diff = value - startValue

    function tick() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(startValue + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return <span suppressHydrationWarning>{formatNumber(displayed)}</span>
}

// ──────────────────────────────────────────────
//  Main Component
// ──────────────────────────────────────────────

export default function TokenFlowVisualizer({
  stages,
  passthroughStageId = 'none',
  categoryColors,
  categoryLabels,
  generateCategories,
  sliderA,
  sliderB,
  progressSteps,
  savingsLabels,
  labels,
  maxDisplayItems = 200,
  speedOptions = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
  ],
}: TokenFlowVisualizerProps) {
  const [activeStage, setActiveStage] = useState(stages[0]?.id || 'none')
  const [sliderAValue, setSliderAValue] = useState(sliderA?.defaultValue ?? 50)
  const [sliderBValue, setSliderBValue] = useState(sliderB?.defaultValue ?? 160)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [phase, setPhase] = useState<AnimationPhase>('idle')
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stageConfig = stages.find(s => s.id === activeStage)!

  const totalItems = sliderAValue * sliderBValue
  const outputItems = Math.ceil(totalItems * stageConfig.compressionRatio)
  const savedItems = totalItems - outputItems
  const savingsPercent = totalItems > 0 ? (savedItems / totalItems) * 100 : 0

  const isPassthrough = activeStage === passthroughStageId

  const itemCategories = useMemo(
    () => generateCategories(totalItems),
    [totalItems, generateCategories]
  )

  const outputCategories = useMemo(
    () => (isPassthrough ? itemCategories : itemCategories.slice(0, outputItems)),
    [itemCategories, outputItems, isPassthrough]
  )

  const animatedRawCount = useMemo(() => {
    if (phase === 'idle') return 0
    if (phase === 'building') return Math.ceil((progress / 40) * totalItems)
    return totalItems
  }, [phase, progress, totalItems])

  const animatedOutputCount = useMemo(() => {
    if (phase !== 'complete' && phase !== 'processing') return 0
    if (phase === 'processing') return Math.ceil(((progress - 40) / 60) * outputItems)
    return outputItems
  }, [phase, progress, outputItems])

  const animatedSavings = useMemo(() => {
    if (phase === 'complete') return savingsPercent
    if (phase === 'processing') return savingsPercent * ((progress - 40) / 60)
    return 0
  }, [phase, progress, savingsPercent])

  const currentRawCount = Math.min(animatedRawCount, totalItems)
  const currentOutputCount = Math.min(animatedOutputCount, outputItems)

  const phaseOnPlayRef = useRef<AnimationPhase | null>(null)

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    if (phaseOnPlayRef.current !== phase) {
      phaseOnPlayRef.current = phase
    }

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + speed * 1.2
        if (next >= 40 && prev < 40) {
          setPhase('processing')
        }
        if (next >= 100) {
          setPhase('complete')
          setIsPlaying(false)
          return 100
        }
        return next
      })
    }, 60)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speed])

  const handlePlay = useCallback(() => {
    if (phase === 'complete') {
      setPhase('idle')
      setProgress(0)
      phaseOnPlayRef.current = 'idle'
      setTimeout(() => {
        setPhase('building')
        setIsPlaying(true)
      }, 50)
    } else {
      setPhase('building')
      setProgress(0)
      setIsPlaying(true)
    }
  }, [phase])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setPhase('idle')
    setProgress(0)
  }, [])

  const handleStageChange = useCallback((id: string) => {
    setActiveStage(id)
    setIsPlaying(false)
    setPhase('idle')
    setProgress(0)
  }, [])

  const handleSliderAChange = useCallback((value: number[]) => {
    setSliderAValue(value[0])
    setIsPlaying(false)
    setPhase('idle')
    setProgress(0)
  }, [])

  const handleSliderBChange = useCallback((value: number[]) => {
    setSliderBValue(value[0])
    setIsPlaying(false)
    setPhase('idle')
    setProgress(0)
  }, [])

  const gradientMap: Record<string, string> = {
    'text-rose-500': 'bg-gradient-to-r from-rose-400 to-rose-500',
    'text-emerald-500': 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    'text-cyan-500': 'bg-gradient-to-r from-cyan-400 to-cyan-500',
    'text-violet-500': 'bg-gradient-to-r from-violet-400 to-violet-500',
    'text-amber-500': 'bg-gradient-to-r from-amber-400 to-amber-500',
  }

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="pt-6 space-y-6">
        {/* CSS keyframes */}
        <style>{TOKEN_FLOW_KEYFRAMES}</style>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${stageConfig.colorBg} flex items-center justify-center`}>
            <Zap className={`h-5 w-5 ${stageConfig.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-base">{labels.title}</h3>
            <p className="text-xs text-muted-foreground">{labels.subtitle}</p>
          </div>
        </div>

        {/* Stage Tabs */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {labels.stagesLabel}
          </div>
          <Tabs value={activeStage} onValueChange={handleStageChange} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
              {stages.map(s => {
                const Icon = s.icon
                return (
                  <TabsTrigger
                    key={s.id}
                    value={s.id}
                    className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.label.slice(0, 4)}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Stage description badge */}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={stageConfig.colorBadge}>
                <stageConfig.icon className="h-3 w-3 mr-1" />
                {stageConfig.description}
              </Badge>
              {!isPassthrough && (
                <Badge variant="outline" className="text-xs border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400">
                  {labels.compressionPrefix} {(stageConfig.compressionRatio * 100).toFixed(0)}%
                </Badge>
              )}
            </div>

            {stages.map(s => (
              <TabsContent key={s.id} value={s.id} className="mt-4 space-y-5">
                {/* Interactive Controls */}
                <div className={`grid gap-4 ${sliderA && sliderB ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {sliderA && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                          {sliderA.label}
                        </label>
                        <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded">
                          {sliderAValue}
                        </span>
                      </div>
                      <Slider
                        value={[sliderAValue]}
                        onValueChange={handleSliderAChange}
                        min={sliderA.min}
                        max={sliderA.max}
                        step={sliderA.step}
                        className="w-full"
                      />
                      <div className="flex justify-between micro-text text-muted-foreground">
                        <span>{sliderA.min}</span>
                        <span>{sliderA.max}</span>
                      </div>
                    </div>
                  )}

                  {sliderB && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                          {sliderB.label}
                        </label>
                        <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded">
                          {sliderBValue}
                        </span>
                      </div>
                      <Slider
                        value={[sliderBValue]}
                        onValueChange={handleSliderBChange}
                        min={sliderB.min}
                        max={sliderB.max}
                        step={sliderB.step}
                        className="w-full"
                      />
                      <div className="flex justify-between micro-text text-muted-foreground">
                        <span>{sliderB.min}</span>
                        <span>{sliderB.max}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Play Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isPlaying ? handlePause : handlePlay}
                      className={`gap-1.5 h-9 ${
                        isPlaying
                          ? 'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                          : 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span className="text-xs">{labels.pause}</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span className="text-xs">
                            {phase === 'complete' ? labels.replay : labels.play}
                          </span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-9 gap-1.5"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="text-xs">{labels.reset}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{labels.speedPrefix}</span>
                    {speedOptions.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSpeed(s.value)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          speed === s.value
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-background text-muted-foreground hover:bg-muted border'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Indicator */}
                <ProgressBar phase={phase} progress={progress} stepLabels={progressSteps} />

                {/* Main Visualization - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                  {/* Left: Raw Items */}
                  <div className="lg:col-span-3">
                    <div className="rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/10 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                            <RotateCw className="h-3.5 w-3.5 text-rose-500" />
                          </div>
                          <span className="text-sm font-semibold">{labels.rawItemsLabel}</span>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono border-rose-300 dark:border-rose-700">
                          <AnimatedCounter value={currentRawCount} /> / {formatNumber(totalItems)}
                        </Badge>
                      </div>

                      {/* Category color legend */}
                      <div className="flex items-center gap-3 micro-text">
                        {(Object.entries(categoryLabels) as [string, string][]).map(([cat, catLabel]) => (
                          <div key={cat} className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-sm ${categoryColors[cat] || 'bg-gray-400'}`} />
                            <span className="text-muted-foreground">{catLabel}</span>
                          </div>
                        ))}
                      </div>

                      {/* Raw token grid */}
                      <div className="min-h-[120px] max-h-[200px] overflow-y-auto rounded-lg bg-background/50 p-3 border">
                        <AnimatePresence mode="wait">
                          <TokenGrid
                            key={`raw-${activeStage}-${sliderAValue}-${sliderBValue}`}
                            tokens={itemCategories}
                            maxVisible={currentRawCount}
                            phase={phase}
                            containerType="raw"
                            categoryColors={categoryColors}
                            categoryLabels={categoryLabels}
                            maxDisplay={maxDisplayItems}
                          />
                        </AnimatePresence>
                        {phase === 'idle' && (
                          <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                            {labels.idlePlaceholder}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Processing */}
                  <div className="lg:col-span-1 flex items-center justify-center">
                    <div className="hidden lg:flex flex-col items-center gap-2">
                      <FlowArrow active={phase === 'processing'} color="text-rose-400" />
                      <ProcessingAnimation
                        technique={activeStage}
                        phase={phase}
                        progress={progress}
                        config={stageConfig}
                      />
                      <FlowArrow active={phase === 'complete' || phase === 'processing'} color="text-emerald-400" />
                    </div>
                    <div className="lg:hidden space-y-3 w-full">
                      <FlowArrow active={phase === 'processing'} color="text-rose-400" />
                      <ProcessingAnimation
                        technique={activeStage}
                        phase={phase}
                        progress={progress}
                        config={stageConfig}
                      />
                      <FlowArrow active={phase === 'complete' || phase === 'processing'} color="text-emerald-400" />
                    </div>
                  </div>

                  {/* Right: Processed Items */}
                  <div className="lg:col-span-3">
                    <div className={`rounded-xl border-2 p-4 space-y-3 ${
                      isPassthrough
                        ? 'border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/10'
                        : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded flex items-center justify-center ${
                            isPassthrough
                              ? 'bg-rose-100 dark:bg-rose-900/40'
                              : 'bg-emerald-100 dark:bg-emerald-900/40'
                          }`}>
                            {(() => {
                              const Icon = stageConfig.icon
                              return <Icon className={`h-3.5 w-3.5 ${stageConfig.color}`} />
                            })()}
                          </div>
                          <span className="text-sm font-semibold">
                            {isPassthrough ? labels.unmodifiedLabel : labels.processedItemsLabel}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-mono ${
                            isPassthrough
                              ? 'border-rose-300 dark:border-rose-700'
                              : 'border-emerald-300 dark:border-emerald-700'
                          }`}
                        >
                          <AnimatedCounter value={currentOutputCount} /> / {formatNumber(outputItems)}
                        </Badge>
                      </div>

                      {/* Output item grid */}
                      <div className="min-h-[120px] max-h-[200px] overflow-y-auto rounded-lg bg-background/50 p-3 border">
                        <AnimatePresence mode="wait">
                          <TokenGrid
                            key={`out-${activeStage}-${sliderAValue}-${sliderBValue}`}
                            tokens={outputCategories}
                            maxVisible={currentOutputCount}
                            phase={phase}
                            containerType="processed"
                            categoryColors={categoryColors}
                            categoryLabels={categoryLabels}
                            maxDisplay={maxDisplayItems}
                          />
                        </AnimatePresence>
                        {(phase === 'idle' || phase === 'building') && (
                          <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                            {phase === 'idle'
                              ? labels.waitingPlaceholder
                              : labels.buildingPlaceholder}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <motion.div
                    className="rounded-lg bg-muted/50 p-3 text-center"
                    animate={phase === 'complete' ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="micro-text text-muted-foreground uppercase tracking-wide mb-1">
                      {labels.statInput}
                    </div>
                    <div className="text-lg font-bold font-mono text-rose-500">
                      <AnimatedCounter value={phase === 'complete' ? totalItems : currentRawCount} />
                    </div>
                  </motion.div>

                  <motion.div
                    className="rounded-lg bg-muted/50 p-3 text-center"
                    animate={phase === 'complete' ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="micro-text text-muted-foreground uppercase tracking-wide mb-1">
                      {labels.statOutput}
                    </div>
                    <div className={`text-lg font-bold font-mono ${
                      isPassthrough ? 'text-rose-500' : 'text-emerald-500'
                    }`}>
                      <AnimatedCounter value={phase === 'complete' ? outputItems : currentOutputCount} />
                    </div>
                  </motion.div>

                  <motion.div
                    className="rounded-lg bg-muted/50 p-3 text-center"
                    animate={phase === 'complete' ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="micro-text text-muted-foreground uppercase tracking-wide mb-1">
                      {labels.statSaved}
                    </div>
                    <div className="text-lg font-bold font-mono text-amber-500">
                      <AnimatedCounter value={phase === 'complete' ? savedItems : Math.max(0, currentRawCount - currentOutputCount)} />
                    </div>
                  </motion.div>

                  <motion.div
                    className="rounded-lg bg-muted/50 p-3 text-center"
                    animate={phase === 'complete' ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="micro-text text-muted-foreground uppercase tracking-wide mb-1">
                      {labels.statRatio}
                    </div>
                    <div className="text-lg font-bold font-mono">
                      <AnimatedCounter value={phase === 'complete' ? totalItems : currentRawCount} />
                      <span className="text-xs text-muted-foreground">&rarr;</span>
                      <AnimatedCounter value={phase === 'complete' ? outputItems : currentOutputCount} />
                    </div>
                  </motion.div>
                </div>

                {/* Savings Meter + Reduction Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-xl bg-muted/30 border">
                  <SavingsMeter savings={animatedSavings} animated={phase === 'complete'} labels={savingsLabels} />

                  <div className="flex-1 max-w-sm space-y-3 w-full">
                    {/* Baseline bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{labels.baselineLabel}</span>
                        <span className="font-mono font-medium">{formatNumber(totalItems)} {labels.itemUnitAbbrev}</span>
                      </div>
                      <div className="h-4 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Active stage bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${stageConfig.colorAccent}`}>
                          {stageConfig.label}
                        </span>
                        <span className="font-mono font-medium">{formatNumber(outputItems)} {labels.itemUnitAbbrev}</span>
                      </div>
                      <div className="h-4 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${gradientMap[stageConfig.color] || 'bg-gradient-to-r from-gray-400 to-gray-500'}`}
                          initial={{ width: '0%' }}
                          animate={{ width: `${Math.max(stageConfig.compressionRatio * 100, 2)}%` }}
                          transition={{ duration: 1.2, delay: 0.6 }}
                        />
                      </div>
                    </div>

                    {/* Reduction badge */}
                    <div className="flex items-center justify-center pt-2">
                      <AnimatePresence>
                        {phase === 'complete' && !isPassthrough && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <Badge className="px-4 py-2 text-sm font-bold bg-emerald-500 text-white savings-pulse">
                              <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                              {labels.reductionPrefix} {Math.round(savingsPercent)}%
                            </Badge>
                          </motion.div>
                        )}
                        {phase === 'complete' && isPassthrough && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <Badge className="px-4 py-2 text-sm font-bold bg-rose-500 text-white">
                              <RotateCw className="h-4 w-4 mr-1" />
                              {labels.noReductionText}
                            </Badge>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
