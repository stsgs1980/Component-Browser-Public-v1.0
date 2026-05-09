'use client'

// ============================================================
// ArchitectureBuilder — Generic reusable component
// Toggle modules on/off, visualize pipeline with SVG,
// configure parameters, see live metrics, code preview & export.
// ============================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  Minimize2,
  Layers,
  Database,
  FileJson,
  Timer,
  HardDrive,
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  Share2,
  Zap,
  DollarSign,
  Gauge,
  Server,
  Cpu,
  MessageSquare,
  Settings,
  Code,
  LayoutGrid,
  Activity,
  Package,
  Lightbulb,
} from 'lucide-react'

// ============================================================
// Exported Interfaces
// ============================================================

/** A toggleable module/node in the architecture pipeline. */
export interface BuilderModule {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  /** Tailwind color key (used for bg/text/border/glow classes). */
  color: string
  /** Hex color for inline styles and SVG. */
  colorHex: string
  /** [min%, max%] efficiency savings range shown in the builder. */
  savings: [number, number]
  /** Implementation complexity (1–5 scale). */
  complexity: number
  /** One-line description shown under the name. */
  description: string
  /** Infrastructure / dependency label. Leave empty or "None" to hide. */
  infrastructure: string
  /** Milliseconds added to latency when this module is enabled. */
  latencyAdjust?: number
}

/** Option for a single-choice button grid (e.g. "chat type"). */
export interface GridOption {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

/** Option for a labelled button grid with description (e.g. "context depth"). */
export interface DescribedOption {
  id: string
  label: string
  desc: string
}

/** Option for pill-style buttons with a colored active state (e.g. "budget tier"). */
export interface PillOption {
  id: string
  label: string
  /** Tailwind text-color class applied when selected. */
  color: string
}

/** Configuration for a slider control. */
export interface SliderConfig {
  min: number
  max: number
  step: number
  defaultValue: number
  label: string
  /** Unit label shown in the badge (e.g. "tokens", "msg/day"). */
  unit: string
}

/** Pricing info for cost estimation. */
export interface PricingConfig {
  inputPricePerMillion: number
  outputPricePerMillion: number
}

/** Override labels for any visible string in the component. */
export interface ArchitectureBuilderLabels {
  title?: string
  subtitle?: string
  builderTab?: string
  diagramTab?: string
  configTab?: string
  metricsTab?: string
  codeTab?: string
  exportButton?: string
  selectAll?: string
  reset?: string
  noModulesEnabled?: string
  savingsPreview?: string
  pipelinePreview?: string
  input?: string
  output?: string
  type?: string
  depth?: string
  budget?: string
  monthlyCost?: string
  savingsPerMonth?: string
  tokenSavings?: string
  before?: string
  after?: string
  latency?: string
  fast?: string
  medium?: string
  slow?: string
  complexity?: string
  infrastructure?: string
  noInfra?: string
  generatedCode?: string
  copy?: string
  copied?: string
  close?: string
  exportTitle?: string
  combinationOf?: string
  modulesWord?: string
  perMonth?: string
  tokenSavingsShort?: string
  latencyShort?: string
  complexityShort?: string
  overallEfficiency?: string
  usedModules?: string
  recommendedInfra?: string
  copyMarkdown?: string
  copiedMarkdown?: string
  efficiencyPipeline?: string
  savingsLabel?: string
  complexityLabel?: string
  visDiagramDesc?: string
  noProcessing?: string
  enableOneModule?: string
  stagesCount?: string
  exportSuffix?: string
}

/** Main component props. */
export interface ArchitectureBuilderProps {
  // -- Core data --
  /** Available modules to toggle on/off in the pipeline. */
  modules: BuilderModule[]
  /** Pricing for cost estimation (pass zeros to hide cost metrics). */
  pricing: PricingConfig

  // -- Config groups (all optional) --
  /** Single-choice icon grid (e.g. chat types). */
  typeOptions?: GridOption[]
  /** Described button grid (e.g. context depth). */
  depthOptions?: DescribedOption[]
  /** Coloured pill buttons (e.g. budget tier). */
  tierOptions?: PillOption[]
  /** Primary slider configuration. */
  primarySlider?: SliderConfig
  /** Secondary slider configuration. */
  secondarySlider?: SliderConfig

  // -- Presets --
  /** Predefined presets that select certain modules + config values. */
  presets?: { id: string; name: string; description: string; moduleIds: string[]; config?: Record<string, string | number> }[]

  // -- Customisation --
  inputNodeLabel?: string
  outputNodeLabel?: string
  inputNodeIcon?: React.ComponentType<{ className?: string }>
  outputNodeIcon?: React.ComponentType<{ className?: string }>
  inputNodeColor?: string
  inputNodeColorHex?: string
  outputNodeColor?: string
  outputNodeColorHex?: string

  // -- Callbacks --
  /** Called to produce highlighted code. Return a string (HTML with `<span>` wrappers) or a ReactNode. */
  onGenerateCode?: (enabled: BuilderModule[], config: Record<string, string | number>) => string | React.ReactNode
  /** Override the default metrics calculation entirely. */
  onCalculateMetrics?: (enabled: BuilderModule[], config: Record<string, string | number>) => Record<string, number>

  // -- Defaults --
  defaultEnabledIds?: string[]
  defaultType?: string
  defaultDepth?: string
  defaultTier?: string

  // -- Labels --
  labels?: ArchitectureBuilderLabels

  // -- Title --
  title?: string
  description?: string
}

// ============================================================
// Internal helpers
// ============================================================

function formatNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; darkBg: string; glow: string }> = {
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-500',
    border: 'border-emerald-300 dark:border-emerald-700',
    darkBg: 'dark:bg-emerald-900/20',
    glow: 'shadow-emerald-500/20',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-500',
    border: 'border-cyan-300 dark:border-cyan-700',
    darkBg: 'dark:bg-cyan-900/20',
    glow: 'shadow-cyan-500/20',
  },
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    text: 'text-violet-500',
    border: 'border-violet-300 dark:border-violet-700',
    darkBg: 'dark:bg-violet-900/20',
    glow: 'shadow-violet-500/20',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-500',
    border: 'border-rose-300 dark:border-rose-700',
    darkBg: 'dark:bg-rose-900/20',
    glow: 'shadow-rose-500/20',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-500',
    border: 'border-amber-300 dark:border-amber-700',
    darkBg: 'dark:bg-amber-900/20',
    glow: 'shadow-amber-500/20',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-500',
    border: 'border-teal-300 dark:border-teal-700',
    darkBg: 'dark:bg-teal-900/20',
    glow: 'shadow-teal-500/20',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-500',
    border: 'border-blue-300 dark:border-blue-700',
    darkBg: 'dark:bg-blue-900/20',
    glow: 'shadow-blue-500/20',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-500',
    border: 'border-pink-300 dark:border-pink-700',
    darkBg: 'dark:bg-pink-900/20',
    glow: 'shadow-pink-500/20',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-500',
    border: 'border-orange-300 dark:border-orange-700',
    darkBg: 'dark:bg-orange-900/20',
    glow: 'shadow-orange-500/20',
  },
}

function getColorClasses(color: string) {
  return COLOR_CLASSES[color] || COLOR_CLASSES.emerald
}

// ============================================================
// Animated Counter Hook
// ============================================================

function useAnimatedNumber(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const startValueRef = useRef<number>(0)

  useEffect(() => {
    startValueRef.current = value
    startTimeRef.current = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValueRef.current + (target - startValueRef.current) * eased
      setValue(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

// ============================================================
// SVG Arrow Component
// ============================================================

function FlowArrow({ x1, y1, x2, y2, color, active }: {
  x1: number; y1: number; x2: number; y2: number; color: string; active: boolean
}) {
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  return (
    <g>
      <defs>
        <marker id={`arrowhead-${color.replace('#', '')}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={active ? color : '#94a3b8'} />
        </marker>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={active ? 0.8 : 0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={active ? 1 : 0.3} />
        </linearGradient>
      </defs>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={`url(#grad-${color.replace('#', '')})`}
        strokeWidth={active ? 2 : 1.5}
        strokeDasharray={active ? '8 4' : '4 4'}
        markerEnd={`url(#arrowhead-${color.replace('#', '')})`}
        className={active ? 'flow-arrow-active' : ''}
      />
      {active && (
        <circle cx={midX} cy={midY} r={3} fill={color} opacity={0.6}>
          <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  )
}

// ============================================================
// Main Component
// ============================================================

export default function ArchitectureBuilder({
  modules,
  pricing,
  typeOptions = [],
  depthOptions = [],
  tierOptions = [],
  primarySlider,
  secondarySlider,
  presets = [],
  inputNodeLabel: inputLabelProp,
  outputNodeLabel: outputLabelProp,
  inputNodeIcon: InputIconProp,
  outputNodeIcon: OutputIconProp,
  inputNodeColor: inputColorProp,
  inputNodeColorHex: inputColorHexProp,
  outputNodeColor: outputColorProp,
  outputNodeColorHex: outputColorHexProp,
  onGenerateCode,
  onCalculateMetrics,
  defaultEnabledIds = [],
  defaultType,
  defaultDepth,
  defaultTier,
  labels: lbl = {},
  title,
  description,
}: ArchitectureBuilderProps) {
  // -- Resolved label defaults --
  const L: Required<ArchitectureBuilderLabels> = {
    title: lbl.title ?? title ?? 'Architecture Builder',
    subtitle: lbl.subtitle ?? description ?? 'Build a processing pipeline by toggling modules and configure parameters',
    builderTab: lbl.builderTab ?? 'Builder',
    diagramTab: lbl.diagramTab ?? 'Diagram',
    configTab: lbl.configTab ?? 'Settings',
    metricsTab: lbl.metricsTab ?? 'Metrics',
    codeTab: lbl.codeTab ?? 'Code',
    exportButton: lbl.exportButton ?? 'Export',
    selectAll: lbl.selectAll ?? 'All',
    reset: lbl.reset ?? 'Reset',
    noModulesEnabled: lbl.noModulesEnabled ?? 'Enable modules to build the pipeline',
    savingsPreview: lbl.savingsPreview ?? 'Savings ~{percent}%',
    pipelinePreview: lbl.pipelinePreview ?? 'Quick pipeline preview',
    input: lbl.input ?? 'Input',
    output: lbl.output ?? 'Output',
    type: lbl.type ?? 'Type',
    depth: lbl.depth ?? 'Depth',
    budget: lbl.budget ?? 'Budget',
    monthlyCost: lbl.monthlyCost ?? 'Monthly cost',
    savingsPerMonth: lbl.savingsPerMonth ?? 'Savings / month',
    tokenSavings: lbl.tokenSavings ?? 'Token savings',
    before: lbl.before ?? 'Before',
    after: lbl.after ?? 'After',
    latency: lbl.latency ?? 'Latency',
    fast: lbl.fast ?? 'Fast',
    medium: lbl.medium ?? 'Medium',
    slow: lbl.slow ?? 'Slow',
    complexity: lbl.complexity ?? 'Complexity',
    infrastructure: lbl.infrastructure ?? 'Infrastructure',
    noInfra: lbl.noInfra ?? 'API calls only',
    generatedCode: lbl.generatedCode ?? 'Generated Code',
    copy: lbl.copy ?? 'Copy',
    copied: lbl.copied ?? 'Copied',
    close: lbl.close ?? 'Close',
    exportTitle: lbl.exportTitle ?? '{name}',
    combinationOf: lbl.combinationOf ?? 'Combination of {count} {word}',
    modulesWord: lbl.modulesWord ?? 'modules',
    perMonth: lbl.perMonth ?? 'per month',
    tokenSavingsShort: lbl.tokenSavingsShort ?? 'token savings',
    latencyShort: lbl.latencyShort ?? 'latency',
    complexityShort: lbl.complexityShort ?? 'complexity',
    overallEfficiency: lbl.overallEfficiency ?? 'Overall pipeline efficiency',
    usedModules: lbl.usedModules ?? 'Modules used:',
    recommendedInfra: lbl.recommendedInfra ?? 'Recommended infrastructure:',
    copyMarkdown: lbl.copyMarkdown ?? 'Copy Markdown',
    copiedMarkdown: lbl.copiedMarkdown ?? 'Copied!',
    efficiencyPipeline: lbl.efficiencyPipeline ?? 'Pipeline efficiency',
    savingsLabel: lbl.savingsLabel ?? 'Savings',
    complexityLabel: lbl.complexityLabel ?? 'Complexity',
    visDiagramDesc: lbl.visDiagramDesc ?? 'Visual message processing diagram',
    noProcessing: lbl.noProcessing ?? 'No processing',
    enableOneModule: lbl.enableOneModule ?? 'Enable at least one module to see the pipeline diagram',
    stagesCount: lbl.stagesCount ?? '{count} stages',
    exportSuffix: lbl.exportSuffix ?? '.py',
  }

  // -- Resolved input/output node defaults --
  const InputIcon = InputIconProp ?? MessageSquare
  const OutputIcon = OutputIconProp ?? Brain
  const inputColor = inputColorProp ?? 'emerald'
  const inputColorHex = inputColorHexProp ?? '#10b981'
  const outputColor = outputColorProp ?? 'emerald'
  const outputColorHex = outputColorHexProp ?? '#10b981'

  // -- Slider defaults --
  const pSlider = primarySlider ?? { min: 1, max: 100, step: 1, defaultValue: 20, label: 'Frequency', unit: 'msg/day' }
  const sSlider = secondarySlider ?? { min: 50, max: 2000, step: 50, defaultValue: 200, label: 'Avg. item length', unit: 'units' }

  // -- State --
  const [enabledIds, setEnabledIds] = useState<Set<string>>(new Set(defaultEnabledIds))
  const [selectedType, setSelectedType] = useState(defaultType ?? typeOptions[0]?.id ?? '')
  const [primaryVal, setPrimaryVal] = useState(pSlider.defaultValue)
  const [secondaryVal, setSecondaryVal] = useState(sSlider.defaultValue)
  const [selectedDepth, setSelectedDepth] = useState(defaultDepth ?? depthOptions[0]?.id ?? '')
  const [selectedTier, setSelectedTier] = useState(defaultTier ?? tierOptions[0]?.id ?? '')
  const [showExport, setShowExport] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedExport, setCopiedExport] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('builder')

  // -- Toggle module --
  const toggleModule = useCallback((id: string) => {
    setEnabledIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // -- Toggle section collapse --
  const toggleSection = useCallback((id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // -- Derived: enabled modules list --
  const enabledList = useMemo(
    () => modules.filter(m => enabledIds.has(m.id)),
    [modules, enabledIds]
  )

  // -- Build config object --
  const config = useMemo(() => ({
    type: selectedType,
    primaryVal,
    secondaryVal,
    depth: selectedDepth,
    tier: selectedTier,
  }), [selectedType, primaryVal, secondaryVal, selectedDepth, selectedTier])

  /* --------------------------------------------------------
     Metrics Calculations
     -------------------------------------------------------- */

  const metrics = useMemo(() => {
    // Allow full override via callback
    if (onCalculateMetrics) {
      return onCalculateMetrics(enabledList, config)
    }

    const count = enabledList.length

    /* Compound efficiency savings */
    let totalSavingsFactor = 1
    for (const mod of enabledList) {
      const avgSaving = (mod.savings[0] + mod.savings[1]) / 2 / 100
      totalSavingsFactor *= (1 - avgSaving * 0.6)
    }
    const savingsPercent = Math.round((1 - totalSavingsFactor) * 100)

    /* Base tokens per request */
    const baseTokens = secondaryVal * Math.min(primaryVal * 10, 100)
    const afterTokens = Math.round(baseTokens * totalSavingsFactor)

    /* Cost estimation */
    const inputCost = (afterTokens * primaryVal * 30) / 1_000_000 * pricing.inputPricePerMillion
    const outputCost = (secondaryVal * 2 * primaryVal * 30) / 1_000_000 * pricing.outputPricePerMillion
    const totalMonthlyCost = inputCost + outputCost
    const baseCost = ((baseTokens * primaryVal * 30) / 1_000_000 * pricing.inputPricePerMillion) +
      ((secondaryVal * 2 * primaryVal * 30) / 1_000_000 * pricing.outputPricePerMillion)
    const monthlySavings = baseCost - totalMonthlyCost

    /* Latency estimate */
    let latencyMs = 800
    for (const mod of enabledList) {
      latencyMs += mod.latencyAdjust ?? 0
    }
    latencyMs = Math.max(300, latencyMs)

    /* Complexity score */
    const complexityScore = enabledList.reduce((acc, m) => acc + m.complexity, 0)

    /* Efficiency score (0–100) */
    const efficiencyScore = Math.min(100, Math.round(
      savingsPercent * 0.4 +
      (count > 0 ? 100 / count : 0) * 0.2 +
      Math.max(0, 100 - latencyMs / 20) * 0.2 +
      (count > 0 ? Math.min(count, 4) / 4 * 100 : 0) * 0.2
    ))

    /* Infrastructure requirements */
    const infra: string[] = []
    if (count === 0) {
      infra.push(L.noInfra)
    } else {
      for (const mod of enabledList) {
        if (mod.infrastructure && mod.infrastructure !== 'None') {
          infra.push(mod.infrastructure)
        }
      }
    }

    return {
      savingsPercent,
      baseTokens,
      afterTokens,
      totalMonthlyCost,
      monthlySavings,
      latencyMs,
      complexityScore,
      efficiencyScore,
      infra,
    }
  }, [enabledList, config, onCalculateMetrics, pricing, secondaryVal, primaryVal, L.noInfra])

  /* Animated metric values */
  const animCost = useAnimatedNumber(metrics.totalMonthlyCost ?? 0, 600)
  const animSavings = useAnimatedNumber(metrics.monthlySavings ?? 0, 600)
  const animEfficiency = useAnimatedNumber(metrics.efficiencyScore ?? 0, 600)
  const animLatency = useAnimatedNumber(metrics.latencyMs ?? 0, 600)

  /* --------------------------------------------------------
     Generated Code
     -------------------------------------------------------- */

  const generatedCode = useMemo(() => {
    if (onGenerateCode) return onGenerateCode(enabledList, config)
    if (enabledList.length === 0) {
      return 'No modules enabled — nothing to generate.'
    }
    return `${L.exportTitle.replace('{name', archName)}\nModules: ${enabledList.map(m => m.name).join(', ')}`
  }, [enabledList, config, onGenerateCode, archName, L.exportTitle])

  /* Architecture name */
  const archName = useMemo(() => {
    if (enabledList.length === 0) return 'Basic'
    if (enabledList.length === 1) return `${enabledList[0].name} Architecture`
    return `${enabledList.slice(0, -1).map(m => m.name.split(' ')[0]).join(' + ')} + ${enabledList[enabledList.length - 1].name}`
  }, [enabledList])

  /* --------------------------------------------------------
     Copy handlers
     -------------------------------------------------------- */

  const copyCode = useCallback(() => {
    const text = typeof generatedCode === 'string'
      ? generatedCode.replace(/<[^>]*>/g, '')
      : ''
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }, [generatedCode])

  const copyExport = useCallback(() => {
    const md = `# ${L.exportTitle.replace('{name}', archName)}

## Metrics
- **Token savings:** ${metrics.savingsPercent ?? 0}%
- **Monthly cost:** $${(metrics.totalMonthlyCost ?? 0).toFixed(2)}
- **Monthly savings:** $${(metrics.monthlySavings ?? 0).toFixed(2)}
- **Latency:** ${metrics.latencyMs ?? 0}ms
- **Complexity:** ${metrics.complexityScore ?? 0}/10
- **Efficiency:** ${metrics.efficiencyScore ?? 0}%

## Modules: ${enabledList.map(m => m.name).join(', ') || 'None'}

## Infrastructure
${(metrics.infra ?? []).map(i => `- ${i}`).join('\n')}`
    navigator.clipboard.writeText(md).catch(() => {})
    setCopiedExport(true)
    setTimeout(() => setCopiedExport(false), 2000)
  }, [archName, metrics, enabledList, L.exportTitle])

  /* --------------------------------------------------------
     Render: Module Block
     -------------------------------------------------------- */

  const renderModuleBlock = (mod: BuilderModule, index: number) => {
    const isActive = enabledIds.has(mod.id)
    const colors = getColorClasses(mod.color)
    const Icon = mod.icon

    return (
      <motion.div
        key={mod.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card
          className={`relative overflow-hidden transition-all duration-300 ${
            isActive
              ? `border-2 ${colors.border} shadow-lg ${colors.glow} ${colors.bg}`
              : 'border border-border/50 opacity-60 hover:opacity-80'
          }`}
        >
          {/* Gradient top line */}
          <div
            className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg, transparent, ${mod.colorHex}, transparent)`,
              opacity: isActive ? 1 : 0.2,
            }}
          />
          {/* Glow effect when active */}
          {isActive && (
            <motion.div
              layoutId={`glow-${mod.id}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 30px ${mod.colorHex}15, 0 0 15px ${mod.colorHex}10`,
              }}
              transition={{ duration: 0.4 }}
            />
          )}
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`h-10 w-10 rounded-lg ${colors.bg} ${colors.darkBg} flex items-center justify-center shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{mod.name}</h4>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: mod.colorHex }}
                      >
                        <motion.span
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: mod.colorHex }}
                          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-muted-foreground">
                      {L.savingsLabel}:{' '}
                      <span className={`font-semibold ${isActive ? colors.text : ''}`}>
                        {mod.savings[0]}-{mod.savings[1]}%
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {L.complexityLabel}:{' '}
                      <span className="font-semibold">{mod.complexity}/5</span>
                    </span>
                  </div>
                  {mod.infrastructure && mod.infrastructure !== 'None' && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <Server className="h-3 w-3" />
                      <span>{mod.infrastructure}</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={() => toggleModule(mod.id)}
                className="shrink-0"
                aria-label={`Toggle ${mod.name}`}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  /* --------------------------------------------------------
     Render: Pipeline Diagram
     -------------------------------------------------------- */

  const renderPipelineDiagram = () => {
    const nodes: {
      id: string; label: string; x: number; y: number;
      color: string; colorHex: string;
      icon: React.ComponentType<{ className?: string }>
    }[] = [
      { id: 'input', label: L.input, x: 80, y: 100, color: inputColor, colorHex: inputColorHex, icon: InputIcon },
    ]

    const stepCount = enabledList.length
    const spacing = stepCount > 0 ? Math.min(130, 600 / (stepCount + 2)) : 140

    enabledList.forEach((mod, i) => {
      nodes.push({
        id: mod.id,
        label: mod.name,
        x: 80 + (i + 1) * spacing,
        y: 100,
        color: mod.color,
        colorHex: mod.colorHex,
        icon: mod.icon,
      })
    })

    nodes.push({
      id: 'output',
      label: L.output,
      x: 80 + (stepCount + 1) * spacing + 20,
      y: 100,
      color: outputColor,
      colorHex: outputColorHex,
      icon: OutputIcon,
    })

    const svgWidth = Math.max(700, nodes[nodes.length - 1].x + 120)

    return (
      <div className="overflow-x-auto pb-2">
        <svg
          viewBox={`0 0 ${svgWidth} 200`}
          className="w-full min-w-[500px]"
          style={{ minHeight: '180px' }}
        >
          {/* Background grid dots */}
          <pattern id="pipeline-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="currentColor" className="text-muted-foreground/20" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pipeline-dots)" />

          {/* Flow arrows between nodes */}
          {nodes.slice(0, -1).map((node, i) => {
            const next = nodes[i + 1]
            return (
              <FlowArrow
                key={`arrow-${node.id}-${next.id}`}
                x1={node.x + 55}
                y1={node.y}
                x2={next.x - 5}
                y2={next.y}
                color={next.colorHex}
                active={enabledIds.has(next.id) || next.id === 'input' || next.id === 'output'}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isEndpoint = node.id === 'input' || node.id === 'output'
            const isActive = isEndpoint || enabledIds.has(node.id)
            const Icon = node.icon
            const isLast = node.id === 'output'

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                {/* Node background */}
                <rect
                  x="0" y="-35" width="110" height="70" rx="12"
                  fill={isActive ? `${node.colorHex}15` : 'transparent'}
                  stroke={isActive ? node.colorHex : '#94a3b8'}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isEndpoint ? 'none' : '4 2'}
                  className="transition-all duration-300"
                />
                {/* Icon */}
                <foreignObject x="10" y="-20" width="24" height="24">
                  <div className="flex items-center justify-center">
                    <div style={{ color: isActive ? node.colorHex : '#94a3b8' }}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </foreignObject>
                {/* Label */}
                <text
                  x="40" y="-2"
                  fill={isActive ? node.colorHex : '#94a3b8'}
                  fontSize="10"
                  fontWeight="600"
                  className="transition-all duration-300"
                >
                  {node.label.length > 14 ? node.label.slice(0, 13) + '\u2026' : node.label}
                </text>
                {/* Status indicator */}
                {isActive && !isEndpoint && (
                  <circle cx="95" cy="-25" r="4" fill={node.colorHex}>
                    <animate
                      attributeName="opacity"
                      values="1;0.4;1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Value estimate */}
                {isEndpoint && (
                  <text
                    x="55" y="20"
                    fill="#94a3b8"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {isLast
                      ? `~${formatNum(metrics.afterTokens ?? 0)} units`
                      : `~${formatNum(metrics.baseTokens ?? 0)} units`}
                  </text>
                )}
                {/* Savings badge for technique nodes */}
                {!isEndpoint && isActive && (
                  <text x="55" y="20" fill={node.colorHex} fontSize="8" textAnchor="middle" opacity="0.7">
                    {node.label.length > 14 ? '' : `-${modules.find(m => m.id === node.id)?.savings[0]}%`}
                  </text>
                )}
              </g>
            )
          })}

          {/* Animated data flow particles */}
          {nodes.slice(0, -1).map((node, i) => {
            const next = nodes[i + 1]
            const isActive = enabledIds.has(next.id) || next.id === 'output'
            if (!isActive) return null
            return (
              <circle key={`particle-${node.id}`} r="2" fill={next.colorHex} opacity="0.8">
                <animateMotion
                  dur={`${1.5 + i * 0.3}s`}
                  repeatCount="indefinite"
                  path={`M${node.x + 55},${node.y} L${next.x - 5},${next.y}`}
                />
              </circle>
            )
          })}
        </svg>
      </div>
    )
  }

  /* --------------------------------------------------------
     Render: Configuration Panel
     -------------------------------------------------------- */

  const renderConfigPanel = () => (
    <div className="space-y-5">
      {/* Preset selector (if provided) */}
      {presets.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            Presets
          </h4>
          <div className="flex flex-wrap gap-2">
            {presets.map(preset => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  setEnabledIds(new Set(preset.moduleIds))
                  if (preset.config) {
                    if (preset.config.type) setSelectedType(String(preset.config.type))
                    if (preset.config.primaryVal !== undefined) setPrimaryVal(Number(preset.config.primaryVal))
                    if (preset.config.secondaryVal !== undefined) setSecondaryVal(Number(preset.config.secondaryVal))
                    if (preset.config.depth) setSelectedDepth(String(preset.config.depth))
                    if (preset.config.tier) setSelectedTier(String(preset.config.tier))
                  }
                }}
                className="text-xs gap-1.5"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Type Options grid */}
      {typeOptions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            {L.type}
          </h4>
          <div className={`grid gap-2 ${typeOptions.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {typeOptions.map(opt => {
              const Icon = opt.icon ?? Settings
              const isSelected = selectedType === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedType(opt.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Primary Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            {pSlider.label}
          </h4>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {primaryVal} {pSlider.unit}
          </Badge>
        </div>
        <Slider
          value={[primaryVal]}
          onValueChange={([v]) => setPrimaryVal(v)}
          min={pSlider.min}
          max={pSlider.max}
          step={pSlider.step}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{pSlider.min}</span>
          <span>{Math.round((pSlider.min + pSlider.max) / 2)}</span>
          <span>{pSlider.max}</span>
        </div>
      </div>

      {/* Secondary Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            {sSlider.label}
          </h4>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {formatNum(secondaryVal)} {sSlider.unit}
          </Badge>
        </div>
        <Slider
          value={[secondaryVal]}
          onValueChange={([v]) => setSecondaryVal(v)}
          min={sSlider.min}
          max={sSlider.max}
          step={sSlider.step}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{sSlider.min}</span>
          <span>{Math.round((sSlider.min + sSlider.max) / 2)}</span>
          <span>{sSlider.max}</span>
        </div>
      </div>

      {/* Depth Options grid */}
      {depthOptions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            {L.depth}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {depthOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedDepth(opt.id)}
                className={`p-3 rounded-lg border text-left text-sm transition-all duration-200 ${
                  selectedDepth === opt.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <div className="font-medium text-xs">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tier Options pills */}
      {tierOptions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            {L.budget}
          </h4>
          <div className="flex flex-wrap gap-2">
            {tierOptions.map(tier => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  selectedTier === tier.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <span className={selectedTier === tier.id ? tier.color : ''}>{tier.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  /* --------------------------------------------------------
     Render: Metrics Dashboard
     -------------------------------------------------------- */

  const renderMetricsDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Monthly Cost */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{L.monthlyCost}</div>
                <div className="text-xl font-bold tabular-nums text-emerald-600">
                  ${animCost.toFixed(2)}
                </div>
              </div>
            </div>
            {(metrics.monthlySavings ?? 0) > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100 border-0">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  -${animSavings.toFixed(2)}
                </Badge>
                <span className="text-muted-foreground">{L.savingsPerMonth}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Token Efficiency */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{L.tokenSavings}</div>
                <div className="text-xl font-bold tabular-nums text-cyan-600">
                  {Math.round(animEfficiency)}%
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{L.before}: {formatNum(metrics.baseTokens ?? 0)}</span>
                <span>{L.after}: {formatNum(metrics.afterTokens ?? 0)}</span>
              </div>
              <Progress value={metrics.savingsPercent ?? 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Response Latency */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Gauge className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{L.latency}</div>
                <div className="text-xl font-bold tabular-nums text-amber-600">
                  {Math.round(animLatency)}ms
                </div>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className={`text-xs ${
                (metrics.latencyMs ?? 0) < 500
                  ? 'border-emerald-200 text-emerald-600 dark:border-emerald-800'
                  : (metrics.latencyMs ?? 0) < 1000
                    ? 'border-amber-200 text-amber-600 dark:border-amber-800'
                    : 'border-rose-200 text-rose-600 dark:border-rose-800'
              }`}>
                {(metrics.latencyMs ?? 0) < 500 ? L.fast : (metrics.latencyMs ?? 0) < 1000 ? L.medium : L.slow}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Complexity Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{L.complexity}</div>
                <div className="text-xl font-bold tabular-nums text-violet-600">
                  {metrics.complexityScore ?? 0}/10
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(metrics.complexityScore ?? 0) * 10} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Infrastructure Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="sm:col-span-2"
      >
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{L.infrastructure}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {(metrics.infra ?? []).map((item, i) => (
                <Badge key={i} variant="secondary" className="text-xs gap-1.5">
                  <Package className="h-3 w-3" />
                  {item}
                </Badge>
              ))}
              {(metrics.infra ?? []).length === 0 && (
                <span className="text-xs text-muted-foreground">Enable modules to determine requirements</span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  /* --------------------------------------------------------
     Render: Code Preview
     -------------------------------------------------------- */

  const renderCodePreview = () => {
    const codeStr = typeof generatedCode === 'string' ? generatedCode : ''
    const codeLines = codeStr.split('\n')
    const isCollapsed = collapsedSections.has('code')
    const isHtml = codeStr.includes('<span')

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">{L.generatedCode}</h4>
            {onGenerateCode && <Badge variant="outline" className="text-xs">Custom</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-8 gap-1.5 text-xs"
            >
              {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedCode ? L.copied : L.copy}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('code')}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="bg-zinc-950 dark:bg-zinc-900 border-zinc-800">
                <CardContent className="p-0">
                  {/* macOS-style code header */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs text-zinc-500 ml-2">{archName}{L.exportSuffix}</span>
                  </div>
                  {/* Code content */}
                  <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
                    {isHtml ? (
                      <pre className="text-sm leading-relaxed font-mono">
                        {codeLines.map((line, i) => (
                          <div key={i} className="flex">
                            <span className="select-none text-zinc-600 w-8 text-right mr-4 shrink-0 text-xs leading-relaxed">{i + 1}</span>
                            {/* Safe: generatedCode comes from onGenerateCode or static templates, no raw user input */}
                            <span dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                          </div>
                        ))}
                      </pre>
                    ) : (
                      <pre className="text-sm leading-relaxed font-mono text-zinc-300 whitespace-pre-wrap">{codeStr}</pre>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  /* --------------------------------------------------------
     Render: Export Summary
     -------------------------------------------------------- */

  const renderExportSummary = () => (
    <AnimatePresence>
      {showExport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <Card className="border-2 border-primary/20 dark:border-primary/10 animated-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                    {archName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {L.combinationOf
                      .replace('{count}', String(enabledList.length))
                      .replace('{word}', L.modulesWord)}
                  </p>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-emerald-600">${(metrics.totalMonthlyCost ?? 0).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{L.perMonth}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-cyan-600">{metrics.savingsPercent ?? 0}%</div>
                      <div className="text-xs text-muted-foreground">{L.tokenSavingsShort}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-amber-600">{metrics.latencyMs ?? 0}ms</div>
                      <div className="text-xs text-muted-foreground">{L.latencyShort}</div>
                    </div>
                  </div>

                  {/* Modules Used */}
                  {enabledList.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-2">{L.usedModules}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {enabledList.map(mod => (
                          <Badge
                            key={mod.id}
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: mod.colorHex, color: mod.colorHex }}
                          >
                            {mod.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Infrastructure */}
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-2">{L.recommendedInfra}</div>
                    <ul className="space-y-1">
                      {(metrics.infra ?? []).map((item, i) => (
                        <li key={i} className="text-xs flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Efficiency Score */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{L.overallEfficiency}</span>
                      <span className="text-xs font-bold">{metrics.efficiencyScore ?? 0}/100</span>
                    </div>
                    <Progress value={metrics.efficiencyScore ?? 0} className="h-3" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyExport}
                  className="gap-1.5 text-xs"
                >
                  {copiedExport ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                  {copiedExport ? L.copiedMarkdown : L.copyMarkdown}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExport(false)}
                  className="text-xs"
                >
                  {L.close}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )

  /* --------------------------------------------------------
     Main Render
     -------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            {L.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {L.subtitle}
          </p>
        </div>
        <Button
          onClick={() => setShowExport(true)}
          disabled={enabledList.length === 0}
          className="gap-2 shrink-0"
        >
          <Download className="h-4 w-4" />
          {L.exportButton}
        </Button>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 mb-4 w-fit">
          <TabsTrigger value="builder" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background">
            <LayoutGrid className="h-4 w-4" />
            {L.builderTab}
          </TabsTrigger>
          <TabsTrigger value="diagram" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background">
            <Activity className="h-4 w-4" />
            {L.diagramTab}
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background">
            <Settings className="h-4 w-4" />
            {L.configTab}
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background">
            <Gauge className="h-4 w-4" />
            {L.metricsTab}
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background">
            <Code className="h-4 w-4" />
            {L.codeTab}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Builder — Module Blocks */}
        <TabsContent value="builder">
          <div className="space-y-4">
            {/* Enabled count and summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">
                  {enabledList.length} / {modules.length}
                </Badge>
                <span className="text-muted-foreground">
                  {enabledList.length === 0
                    ? L.noModulesEnabled
                    : L.savingsPreview.replace('{percent}', String(metrics.savingsPercent ?? 0))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnabledIds(new Set(modules.map(m => m.id)))}
                  className="text-xs h-7"
                >
                  {L.selectAll}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnabledIds(new Set())}
                  className="text-xs h-7"
                >
                  {L.reset}
                </Button>
              </div>
            </div>

            {/* Module blocks grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modules.map((mod, i) => renderModuleBlock(mod, i))}
            </div>

            {/* Quick pipeline preview */}
            {enabledList.length > 0 && (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <ArrowRight className="h-4 w-4" />
                    {L.pipelinePreview}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <InputIcon className="h-3 w-3" />
                      {L.input}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    {enabledList.map((mod, i) => (
                      <div key={mod.id} className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="gap-1 transition-all"
                          style={{ borderColor: mod.colorHex, color: mod.colorHex }}
                        >
                          <mod.icon className="h-3 w-3" />
                          {mod.name}
                        </Badge>
                        {i < enabledList.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="gap-1">
                      <OutputIcon className="h-3 w-3" />
                      {L.output}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Live Architecture Diagram */}
        <TabsContent value="diagram">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium">{archName}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {L.visDiagramDesc}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {enabledList.length > 0
                      ? L.stagesCount.replace('{count}', String(enabledList.length))
                      : L.noProcessing}
                  </Badge>
                </div>
                {renderPipelineDiagram()}
                {enabledList.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {L.enableOneModule}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pipeline efficiency indicator */}
            {enabledList.length > 0 && (
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{L.efficiencyPipeline}</span>
                    <span className="text-lg font-bold tabular-nums" style={{
                      color: (metrics.efficiencyScore ?? 0) >= 70 ? '#10b981'
                        : (metrics.efficiencyScore ?? 0) >= 40 ? '#f59e0b'
                          : '#f43f5e'
                    }}>
                      {metrics.efficiencyScore ?? 0}%
                    </span>
                  </div>
                  <Progress
                    value={metrics.efficiencyScore ?? 0}
                    className="h-3"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{L.savingsLabel}: {metrics.savingsPercent ?? 0}%</span>
                    <span>{L.latencyShort}: {metrics.latencyMs ?? 0}ms</span>
                    <span>{L.complexityShort}: {metrics.complexityScore ?? 0}/10</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Configuration Panel */}
        <TabsContent value="config">
          <Card>
            <CardContent className="pt-6">
              {renderConfigPanel()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Metrics Dashboard */}
        <TabsContent value="metrics">
          {renderMetricsDashboard()}
        </TabsContent>

        {/* Tab 5: Generated Code Preview */}
        <TabsContent value="code">
          {renderCodePreview()}
        </TabsContent>
      </Tabs>

      {/* Export Summary (shown below all tabs) */}
      {renderExportSummary()}
    </div>
  )
}
