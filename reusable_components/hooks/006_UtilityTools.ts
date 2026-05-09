'use client'

import { useMemo } from 'react'

/**
 * DetectLanguage — simple heuristic for detecting text language via character analysis.
 * Returns language label, character ratio, and a token multiplier for estimation.
 *
 * Source: LLM-MEM-GUIDE /src/components/tools/TokenCalculator.tsx (detectLanguage function)
 * De-hardcoded: none — already a pure utility function.
 */

export interface LanguageResult {
  /** Detected language label */
  lang: string
  /** Ratio of the primary script (0-1) */
  ratio: number
  /** Token multiplier (chars → tokens) */
  tokenMultiplier: number
}

/**
 * Simple heuristic language detection based on Unicode character ranges.
 * Currently detects Cyrillic (Russian), Latin (English), and mixed scripts.
 *
 * @param text Input text to analyze
 * @param options Configuration
 * @returns Detection result with language, ratio, and token multiplier
 */
export function detectLanguage(
  text: string,
  options?: {
    /** Label for Cyrillic-dominant text (default: 'Russian') */
    cyrillicLabel?: string
    /** Label for Latin-dominant text (default: 'English') */
    latinLabel?: string
    /** Default token multiplier for unknown scripts (default: 0.4) */
    defaultMultiplier?: number
    /** Cyrillic token multiplier (default: 0.25 — Cyrillic chars use fewer tokens) */
    cyrillicMultiplier?: number
    /** Latin token multiplier (default: 0.4) */
    latinMultiplier?: number
    /** Threshold for considering text as Cyrillic-dominant (default: 0.3) */
    cyrillicThreshold?: number
  },
): LanguageResult {
  const {
    cyrillicLabel = 'Russian',
    latinLabel = 'English',
    defaultMultiplier = 0.4,
    cyrillicMultiplier = 0.25,
    latinMultiplier = 0.4,
    cyrillicThreshold = 0.3,
  } = options ?? {}

  if (!text.trim()) {
    return { lang: 'Unknown', ratio: 0, tokenMultiplier: defaultMultiplier }
  }

  const cyrillic = text.match(/[\u0400-\u04FF]/g)?.length ?? 0
  const latin = text.match(/[a-zA-Z]/g)?.length ?? 0
  const total = cyrillic + latin

  if (total === 0) {
    return { lang: 'Symbols', ratio: 0, tokenMultiplier: defaultMultiplier }
  }

  const cyrillicRatio = cyrillic / total

  if (cyrillicRatio > cyrillicThreshold) {
    return {
      lang: cyrillicLabel,
      ratio: cyrillicRatio,
      tokenMultiplier: cyrillicMultiplier,
    }
  }

  return {
    lang: latinLabel,
    ratio: 1 - cyrillicRatio,
    tokenMultiplier: latinMultiplier,
  }
}

/**
 * ContextUsageBar — a colored progress bar showing context window utilization.
 * Color: green (<50%), amber (50-80%), red (>80%).
 * Optional overflow warning.
 *
 * Source: LLM-MEM-GUIDE /src/components/tools/TokenCalculator.tsx (context bars)
 * De-hardcoded: none — already generic.
 */

export interface ContextUsageBarProps {
  /** Current usage percentage (0-100+) */
  percent: number
  /** Warning threshold (default: 80) */
  warningThreshold?: number
  /** Critical threshold (default: 95) */
  criticalThreshold?: number
  /** Show overflow warning text */
  showWarning?: boolean
  /** Warning text template: receives { remaining, percent } */
  warningText?: string
  /** Critical text template: receives { percent } */
  criticalText?: string
  /** Additional class name for the bar container */
  className?: string
}

export function ContextUsageBar({
  percent,
  warningThreshold = 80,
  criticalThreshold = 95,
  showWarning = false,
  warningText,
  criticalText,
  className,
}: ContextUsageBarProps) {
  const isWarning = percent > warningThreshold && percent <= criticalThreshold
  const isCritical = percent > criticalThreshold
  const clampedPercent = Math.min(percent, 100)

  const barColor = isCritical
    ? 'bg-red-500'
    : isWarning
      ? 'bg-amber-500'
      : 'bg-emerald-500'

  const textColor = isCritical
    ? 'text-red-500'
    : isWarning
      ? 'text-amber-500'
      : 'text-emerald-500'

  return (
    <div className={className}>
      <div className="h-3 bg-muted rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm transition-all duration-300 ${barColor}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showWarning && (isWarning || isCritical) && (
        <div
          className={`flex items-start gap-2 p-2 rounded-sm border mt-2 ${
            isCritical
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}
        >
          <span className={`text-[10px] font-mono ${textColor}`}>
            {isCritical
              ? criticalText ?? `Overflow! ${percent.toFixed(1)}% exceeds limit.`
              : warningText ?? `Approaching limit. ${Math.max(0, 100 - percent).toFixed(0)}% remaining.`}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * CostProjection — displays cost at multiple volume tiers with proportional bars.
 *
 * Source: LLM-MEM-GUIDE /src/components/tools/TokenCalculator.tsx (cost breakdown)
 * De-hardcoded: none — accepts generic cost tiers.
 */

export interface CostTier {
  label: string
  cost: number
}

export interface CostProjectionProps {
  tiers: CostTier[]
  /** Maximum cost for bar width normalization (default: max tier cost) */
  maxCost?: number
  /** Formatter function (default: USD) */
  formatCost?: (cost: number) => string
  /** Additional class name */
  className?: string
}

export function CostProjection({
  tiers,
  maxCost,
  formatCost = (cost) => `$${cost.toFixed(2)}`,
  className,
}: CostProjectionProps) {
  const effectiveMax = maxCost ?? Math.max(...tiers.map(t => t.cost), 0.01)

  return (
    <div className={className}>
      {tiers.map((item) => {
        const barWidth = effectiveMax > 0 ? Math.max((item.cost / effectiveMax) * 100, 1) : 0
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground">{item.label}</span>
              <span className="text-xs font-mono font-semibold text-foreground">{formatCost(item.cost)}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-sm overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-sm transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Format helpers for common number displays.
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

export function formatUSD(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(2)}K`
  return `$${amount.toFixed(2)}`
}
