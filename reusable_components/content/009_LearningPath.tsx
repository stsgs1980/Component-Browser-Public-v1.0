'use client'

import { useState, useCallback, Fragment, type ComponentType, type SVGProps } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Lock,
  CheckCircle2,
  RotateCcw,
  Clock,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Target,
  Play,
  GraduationCap,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Exported TypeScript Interfaces
   ───────────────────────────────────────────── */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface KeyConcept {
  term: string
  definition: string
}

export interface PracticeOption {
  text: string
  isCorrect: boolean
}

export interface StepPractice {
  instruction: string
  options: PracticeOption[]
  correctExplanation: string
}

export interface LearningPathStep {
  title: string
  time: string
  difficulty: Difficulty
  icon: LucideIcon
  shortDescription: string
  paragraphs: string[]
  keyConcepts: KeyConcept[]
  practice: StepPractice
}

export interface StepColorScheme {
  node: string
  nodeRing: string
  glow: string
  accent: string
  badge: string
  border: string
  dot: string
}

export interface LearningPathProps {
  /** Title displayed in the header card */
  title?: string
  /** Short description under the title */
  description?: string
  /** The ordered list of learning steps */
  steps: LearningPathStep[]
  /** Override per-step color schemes (auto-cycles through defaults if omitted) */
  stepColors?: StepColorScheme[]
  /** Override difficulty badge labels */
  difficultyLabels?: Partial<Record<Difficulty, string>>
  /** Override difficulty badge styles */
  difficultyStyles?: Partial<Record<Difficulty, string>>
  /** Message shown when all steps are completed */
  completionTitle?: string
  completionMessage?: string
  completionHint?: string
  /** Button / badge labels */
  labels?: {
    reset?: string
    progress?: string
    completed?: string
    keyConcepts?: string
    practice?: string
    completeStep?: string
    completedStep?: string
    nextStep?: string
    stepOf?: string // e.g. "Step {0} of {1}" — "{0}" and "{1}" are replaced
    done?: string
  }
  /** Called when a single step is marked complete */
  onStepComplete?: (stepIndex: number) => void
  /** Called when every step has been completed */
  onAllComplete?: () => void
}

/* ─────────────────────────────────────────────
   Internal Defaults
   ───────────────────────────────────────────── */

const DEFAULT_COLORS: StepColorScheme[] = [
  {
    node: 'bg-emerald-500',
    nodeRing: 'ring-emerald-200 dark:ring-emerald-800',
    glow: 'shadow-lg shadow-emerald-500/40',
    accent: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    dot: 'bg-emerald-500',
  },
  {
    node: 'bg-teal-500',
    nodeRing: 'ring-teal-200 dark:ring-teal-800',
    glow: 'shadow-lg shadow-teal-500/40',
    accent: 'text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-700',
    dot: 'bg-teal-500',
  },
  {
    node: 'bg-cyan-500',
    nodeRing: 'ring-cyan-200 dark:ring-cyan-800',
    glow: 'shadow-lg shadow-cyan-500/40',
    accent: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-700',
    dot: 'bg-cyan-500',
  },
  {
    node: 'bg-purple-500',
    nodeRing: 'ring-purple-200 dark:ring-purple-800',
    glow: 'shadow-lg shadow-purple-500/40',
    accent: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700',
    dot: 'bg-purple-500',
  },
  {
    node: 'bg-violet-500',
    nodeRing: 'ring-violet-200 dark:ring-violet-800',
    glow: 'shadow-lg shadow-violet-500/40',
    accent: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    border: 'border-violet-300 dark:border-violet-700',
    dot: 'bg-violet-500',
  },
  {
    node: 'bg-fuchsia-500',
    nodeRing: 'ring-fuchsia-200 dark:ring-fuchsia-800',
    glow: 'shadow-lg shadow-fuchsia-500/40',
    accent: 'text-fuchsia-600 dark:text-fuchsia-400',
    badge: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
    border: 'border-fuchsia-300 dark:border-fuchsia-700',
    dot: 'bg-fuchsia-500',
  },
  {
    node: 'bg-rose-500',
    nodeRing: 'ring-rose-200 dark:ring-rose-800',
    glow: 'shadow-lg shadow-rose-500/40',
    accent: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
    dot: 'bg-rose-500',
  },
  {
    node: 'bg-amber-500',
    nodeRing: 'ring-amber-200 dark:ring-amber-800',
    glow: 'shadow-lg shadow-amber-500/40',
    accent: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    dot: 'bg-amber-500',
  },
]

const DEFAULT_DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const DEFAULT_DIFFICULTY_STYLES: Record<Difficulty, string> = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
}

const COLOR_PAIRS: [string, string][] = [
  ['emerald-500', 'teal-500'],
  ['teal-500', 'cyan-500'],
  ['cyan-500', 'purple-500'],
  ['purple-500', 'violet-500'],
  ['violet-500', 'fuchsia-500'],
  ['fuchsia-500', 'rose-500'],
  ['rose-500', 'amber-500'],
]

function getConnectorClasses(
  colors: StepColorScheme[],
  direction: 'h' | 'v',
): string[] {
  return colors.slice(0, -1).map((c, i) => {
    const next = colors[i + 1]
    // Extract base color name from node class (e.g. "bg-emerald-500" → "emerald-500")
    const from = c.node.replace('bg-', '')
    const to = next.node.replace('bg-', '')
    const prefix = direction === 'h'
      ? 'bg-gradient-to-r from-'
      : 'bg-gradient-to-b from-'
    return `${prefix}${from} to-${to}`
  })
}

/* ─────────────────────────────────────────────
   Internal Sub-Components
   ───────────────────────────────────────────── */

function PracticeQuiz({
  practice,
}: {
  practice: StepPractice
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = useCallback((index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)
  }, [answered])

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        <Target className="inline h-4 w-4 mr-1.5" />
        {practice.instruction}
      </p>
      <div className="space-y-2">
        {practice.options.map((option, i) => {
          const isCorrect = option.isCorrect
          const isSelected = selected === i
          const showCorrect = answered && isCorrect
          const showWrong = answered && isSelected && !isCorrect

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              whileHover={!answered ? { scale: 1.01, x: 4 } : undefined}
              whileTap={!answered ? { scale: 0.99 } : undefined}
              disabled={answered}
              className={`
                w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-300 text-sm
                ${answered
                  ? showCorrect
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                    : showWrong
                      ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30'
                      : 'border-muted bg-muted/30 opacity-60'
                  : 'border-muted hover:border-foreground/20 cursor-pointer'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                  ${showCorrect ? 'border-emerald-500 bg-emerald-500' : showWrong ? 'border-rose-500 bg-rose-500' : 'border-muted-foreground/30'}
                `}>
                  {showCorrect && <CheckCircle2 className="h-3 w-3 text-white" />}
                  {showWrong && <span className="text-white text-xs font-bold">x</span>}
                </div>
                <span className={showCorrect ? 'font-semibold text-emerald-700 dark:text-emerald-300' : showWrong ? 'text-rose-600 dark:text-rose-400' : ''}>
                  {option.text}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`
              mt-2 p-3 rounded-lg text-sm
              ${selected !== null && practice.options[selected].isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
              }
            `}>
              <Lightbulb className="inline h-4 w-4 mr-1.5" />
              {practice.correctExplanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type StepStatus = 'locked' | 'unlocked' | 'active' | 'completed'

function DesktopTimelineNode({
  step,
  index,
  status,
  colors,
  diffLabel,
  diffStyle,
  onClick,
}: {
  step: LearningPathStep
  index: number
  status: StepStatus
  colors: StepColorScheme
  diffLabel: string
  diffStyle: string
  onClick: () => void
}) {
  const StepIcon = step.icon
  const isLocked = status === 'locked'
  const isActive = status === 'active'
  const isCompleted = status === 'completed'

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.05, y: -4 } : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      className={`
        flex flex-col items-center gap-2 min-w-[100px] max-w-[130px] text-center
        ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={`Step ${index + 1}: ${step.title}`}
    >
      {/* Circle node */}
      <div className="relative">
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-full ${colors.glow}`}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className={`
          relative z-10 h-12 w-12 rounded-full flex items-center justify-center
          ring-4 ${colors.nodeRing} transition-all duration-300
          ${isCompleted ? colors.node + ' ring-offset-2' : ''}
          ${isActive ? colors.node + ' ring-offset-2' : ''}
          ${isLocked ? 'bg-muted ring-muted' : ''}
          ${status === 'unlocked' ? 'bg-background border-2 border-dashed ' + colors.border : ''}
        `}>
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-6 w-6 text-white" />
            </motion.div>
          ) : isLocked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : isActive ? (
            <StepIcon className="h-6 w-6 text-white" />
          ) : (
            <span className={`text-lg font-bold ${colors.accent}`}>{index + 1}</span>
          )}
        </div>
      </div>

      {/* Title and badges */}
      <div className="space-y-1.5">
        <p className={`text-xs font-semibold leading-tight ${isLocked ? 'text-muted-foreground' : ''}`}>
          {step.title}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <Badge variant="secondary" className="micro-text px-1.5 py-0 gap-1">
            <Clock className="h-3 w-3" />
            {step.time}
          </Badge>
        </div>
        <Badge className={`micro-text px-1.5 py-0 border-0 ${diffStyle}`}>
          {diffLabel}
        </Badge>
      </div>
    </motion.button>
  )
}

function MobileTimelineNode({
  step,
  index,
  status,
  colors,
  diffLabel,
  diffStyle,
  doneLabel,
  onClick,
}: {
  step: LearningPathStep
  index: number
  status: StepStatus
  colors: StepColorScheme
  diffLabel: string
  diffStyle: string
  doneLabel: string
  onClick: () => void
}) {
  const StepIcon = step.icon
  const isLocked = status === 'locked'
  const isActive = status === 'active'
  const isCompleted = status === 'completed'

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      className={`
        w-full flex items-start gap-4 p-3 rounded-xl text-left transition-all
        ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}
        ${isActive ? 'bg-muted/70 border-2 ' + colors.border : ''}
        ${isCompleted ? 'hover:bg-muted/30' : ''}
      `}
    >
      {/* Circle */}
      <div className="relative shrink-0 mt-0.5">
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-full ${colors.glow}`}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <div className={`
          relative z-10 h-10 w-10 rounded-full flex items-center justify-center
          ring-3 ${colors.nodeRing} transition-all duration-300
          ${isCompleted ? colors.node : ''}
          ${isActive ? colors.node : ''}
          ${isLocked ? 'bg-muted ring-muted' : ''}
          ${status === 'unlocked' ? 'bg-background border-2 border-dashed ' + colors.border : ''}
        `}>
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-white" />
          ) : isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : isActive ? (
            <StepIcon className="h-5 w-5 text-white" />
          ) : (
            <span className={`text-sm font-bold ${colors.accent}`}>{index + 1}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-sm font-semibold truncate ${isLocked ? 'text-muted-foreground' : ''}`}>
            {step.title}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {step.shortDescription}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="micro-text px-1.5 py-0 gap-1">
            <Clock className="h-3 w-3" />
            {step.time}
          </Badge>
          <Badge className={`micro-text px-1.5 py-0 border-0 ${diffStyle}`}>
            {diffLabel}
          </Badge>
          {isCompleted && (
            <Badge className="micro-text px-1.5 py-0 border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3 mr-0.5" />
              {doneLabel}
            </Badge>
          )}
        </div>
      </div>
    </motion.button>
  )
}

function ExpandedContentPanel({
  step,
  index,
  totalSteps,
  colors,
  diffLabel,
  diffStyle,
  isCompleted,
  onComplete,
  onNext,
  isLastStep,
  labels,
}: {
  step: LearningPathStep
  index: number
  totalSteps: number
  colors: StepColorScheme
  diffLabel: string
  diffStyle: string
  isCompleted: boolean
  onComplete: () => void
  onNext: () => void
  isLastStep: boolean
  labels: NonNullable<LearningPathProps['labels']>
}) {
  const StepIcon = step.icon

  return (
    <Card className={`border-2 ${colors.border} overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-4 ${colors.badge} border-b ${colors.border}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              key={index}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`h-11 w-11 rounded-xl ${colors.node} flex items-center justify-center shadow-md`}
            >
              <StepIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold">
                Step {index + 1}. {step.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="micro-text px-1.5 py-0 gap-1">
                  <Clock className="h-3 w-3" />
                  {step.time}
                </Badge>
                <Badge className={`micro-text px-1.5 py-0 border-0 ${diffStyle}`}>
                  {diffLabel}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="pt-6 space-y-6">
        {/* Explanation */}
        <div className="space-y-3">
          {step.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-sm text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Key Concepts */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {labels.keyConcepts}
          </h4>
          <ul className="space-y-2">
            {step.keyConcepts.map((concept, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${colors.dot} shrink-0`} />
                <span>
                  <span className="font-semibold">{concept.term}</span>
                  {' - '}
                  <span className="text-muted-foreground">{concept.definition}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Practice */}
        <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Play className="h-4 w-4" />
            {labels.practice}
          </h4>
          <PracticeQuiz practice={step.practice} />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {labels.stepOf.replace('{0}', String(index + 1)).replace('{1}', String(totalSteps))}
          </div>
          <div className="flex items-center gap-3">
            {!isCompleted ? (
              <Button
                onClick={onComplete}
                className={`gap-2 ${colors.node} hover:opacity-90 text-white border-0`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {labels.completeStep}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0 gap-1 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {labels.completedStep}
                </Badge>
                {!isLastStep && (
                  <Button onClick={onNext} variant="outline" className="gap-2">
                    {labels.nextStep}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompletionCard({
  steps,
  colors,
  title,
  message,
  hint,
}: {
  steps: LearningPathStep[]
  colors: StepColorScheme[]
  title: string
  message: string
  hint: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="relative rounded-xl p-[2px] bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500">
        <Card className="rounded-[10px] overflow-hidden">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
              className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-xl shadow-amber-500/30"
            >
              <Trophy className="h-10 w-10 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">{message}</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              {steps.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`
                      h-8 w-8 rounded-full flex items-center justify-center
                      ${colors[i]?.node ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length].node} shadow-md
                    `}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </motion.div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              <GraduationCap className="inline h-3.5 w-3.5 mr-1" />
              {hint}
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Main Component: LearningPath
   ───────────────────────────────────────────── */

export default function LearningPath({
  title = 'Learning Path',
  description = 'A step-by-step interactive roadmap. Study concepts sequentially from basics to advanced topics.',
  steps,
  stepColors,
  difficultyLabels: diffLabelsOverride,
  difficultyStyles: diffStylesOverride,
  completionTitle = 'Congratulations!',
  completionMessage = 'You have completed the entire learning path and mastered all the topics. You are now ready to apply this knowledge in real projects.',
  completionHint = 'Keep improving - explore the interactive demos!',
  labels = {},
  onStepComplete,
  onAllComplete,
}: LearningPathProps) {
  /* Resolve color schemes — cycle through defaults if fewer provided */
  const resolvedColors: StepColorScheme[] = steps.map((_, i) => {
    if (stepColors && stepColors[i]) return stepColors[i]
    return DEFAULT_COLORS[i % DEFAULT_COLORS.length]
  })

  /* Resolve difficulty labels & styles */
  const diffLabels: Record<Difficulty, string> = {
    beginner: diffLabelsOverride?.beginner ?? DEFAULT_DIFFICULTY_LABELS.beginner,
    intermediate: diffLabelsOverride?.intermediate ?? DEFAULT_DIFFICULTY_LABELS.intermediate,
    advanced: diffLabelsOverride?.advanced ?? DEFAULT_DIFFICULTY_LABELS.advanced,
  }
  const diffStyles: Record<Difficulty, string> = {
    beginner: diffStylesOverride?.beginner ?? DEFAULT_DIFFICULTY_STYLES.beginner,
    intermediate: diffStylesOverride?.intermediate ?? DEFAULT_DIFFICULTY_STYLES.intermediate,
    advanced: diffStylesOverride?.advanced ?? DEFAULT_DIFFICULTY_STYLES.advanced,
  }

  /* Resolve UI labels */
  const ui = {
    reset: labels.reset ?? 'Reset',
    progress: labels.progress ?? 'Progress',
    completed: labels.completed ?? 'completed',
    keyConcepts: labels.keyConcepts ?? 'Key Concepts',
    practice: labels.practice ?? 'Practice',
    completeStep: labels.completeStep ?? 'Complete Step',
    completedStep: labels.completedStep ?? 'Completed',
    nextStep: labels.nextStep ?? 'Next Step',
    stepOf: labels.stepOf ?? 'Step {0} of {1}',
    done: labels.done ?? 'Done',
  }

  /* Connector gradients */
  const connectorH = getConnectorClasses(resolvedColors, 'h')
  const connectorV = getConnectorClasses(resolvedColors, 'v')

  /* State */
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [activeStep, setActiveStep] = useState<number | null>(null)

  /* Step status logic */
  const getStepStatus = useCallback((index: number): StepStatus => {
    if (completedSteps.has(index)) return 'completed'
    if (activeStep === index) return 'active'
    if (index === 0 || completedSteps.has(index - 1)) return 'unlocked'
    return 'locked'
  }, [completedSteps, activeStep])

  /* Complete current step */
  const completeStep = useCallback(() => {
    if (activeStep === null) return
    const next = new Set(completedSteps)
    next.add(activeStep)
    setCompletedSteps(next)
    onStepComplete?.(activeStep)
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    } else {
      setActiveStep(null)
      if (next.size === steps.length) onAllComplete?.()
    }
  }, [activeStep, completedSteps, steps.length, onStepComplete, onAllComplete])

  /* Go to next step */
  const goNextStep = useCallback(() => {
    if (activeStep === null || activeStep >= steps.length - 1) return
    setActiveStep(activeStep + 1)
  }, [activeStep, steps.length])

  /* Reset progress */
  const resetProgress = useCallback(() => {
    setCompletedSteps(new Set())
    setActiveStep(null)
  }, [])

  const allCompleted = completedSteps.size === steps.length
  const progressPercent = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 via-violet-500 to-amber-500 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetProgress}
              className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">{ui.reset}</span>
            </Button>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{ui.progress}</span>
              <span className="font-semibold">
                {completedSteps.size} / {steps.length} {ui.completed}
              </span>
            </div>
            <div className="relative">
              <Progress value={progressPercent} className="h-2.5" />
              <motion.div
                className="absolute inset-0 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-500 pointer-events-none"
                initial={{ scaleX: 0, transformOrigin: 'left' }}
                animate={{ scaleX: progressPercent / 100 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop timeline (horizontal, lg+) */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start min-w-[900px]">
            {steps.map((step, i) => {
              const status = getStepStatus(i)
              const isLeftCompleted = completedSteps.has(i)
              return (
                <Fragment key={i}>
                  <DesktopTimelineNode
                    step={step}
                    index={i}
                    status={status}
                    colors={resolvedColors[i]}
                    diffLabel={diffLabels[step.difficulty]}
                    diffStyle={diffStyles[step.difficulty]}
                    onClick={() => {
                      if (status !== 'locked') {
                        setActiveStep(activeStep === i ? null : i)
                      }
                    }}
                  />
                  {/* Horizontal connector line */}
                  {i < steps.length - 1 && (
                    <div className="flex-1 min-w-[24px] mt-6">
                      <div className="relative h-0.5 w-full rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-muted rounded-full" />
                        {isLeftCompleted && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                            className={`absolute inset-0 rounded-full ${connectorH[i]}`}
                            style={{ transformOrigin: 'left' }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile timeline (vertical) */}
      <div className="lg:hidden">
        <div className="space-y-1">
          {steps.map((step, i) => {
            const status = getStepStatus(i)
            const isLeftCompleted = completedSteps.has(i)
            return (
              <Fragment key={i}>
                <MobileTimelineNode
                  step={step}
                  index={i}
                  status={status}
                  colors={resolvedColors[i]}
                  diffLabel={diffLabels[step.difficulty]}
                  diffStyle={diffStyles[step.difficulty]}
                  doneLabel={ui.done}
                  onClick={() => {
                    if (status !== 'locked') {
                      setActiveStep(activeStep === i ? null : i)
                    }
                  }}
                />
                {/* Vertical connector line */}
                {i < steps.length - 1 && (
                  <div className="relative h-6 ml-[33px] w-0.5 my-0.5">
                    <div className="absolute inset-0 bg-muted rounded-full" />
                    {isLeftCompleted && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
                        className={`absolute inset-0 rounded-full ${connectorV[i]}`}
                        style={{ transformOrigin: 'top' }}
                      />
                    )}
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      {/* Expanded content panel */}
      <AnimatePresence mode="wait">
        {activeStep !== null && (
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <ExpandedContentPanel
              step={steps[activeStep]}
              index={activeStep}
              totalSteps={steps.length}
              colors={resolvedColors[activeStep]}
              diffLabel={diffLabels[steps[activeStep].difficulty]}
              diffStyle={diffStyles[steps[activeStep].difficulty]}
              isCompleted={completedSteps.has(activeStep)}
              onComplete={completeStep}
              onNext={goNextStep}
              isLastStep={activeStep === steps.length - 1}
              labels={ui}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* All-steps completion card */}
      {allCompleted && activeStep === null && (
        <CompletionCard
          steps={steps}
          colors={resolvedColors}
          title={completionTitle}
          message={completionMessage}
          hint={completionHint}
        />
      )}
    </div>
  )
}
