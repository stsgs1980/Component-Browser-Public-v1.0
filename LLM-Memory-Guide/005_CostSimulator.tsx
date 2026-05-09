'use client';

// ============================================================
// Generic Cost Comparison Simulator
// Compare N methods by cost/savings with interactive sliders,
// period breakdowns, and side-by-side comparison cards.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  DollarSign,
  TrendingDown,
  ArrowRight,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BarChart3,
  PiggyBank,
  CalendarDays,
} from 'lucide-react';

// ============================================================
// Exported Interfaces
// ============================================================

/** A pricing tier / model with per-unit input/output costs */
export interface PricingModel {
  id: string;
  name: string;
  inputPrice: number;   // price per 1M input units
  outputPrice: number;  // price per 1M output units
}

/** A method / technique being compared (one must have reduction 0 = baseline) */
export interface MethodOption {
  id: string;
  name: string;
  description: string;
  /** 0 = no reduction (baseline), 0.85 = 85% reduction */
  reductionFactor: number;
}

/** A context window / sizing option */
export interface ContextOption {
  id: string;
  name: string;
  value: number;   // e.g. token count
  unit?: string;   // e.g. 'tokens'
}

/** A time period for comparison */
export interface PeriodOption {
  name: string;
  days: number;
}

/** Slider configuration */
export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  label: string;
}

/** Result of a cost computation for one scenario */
export interface CostResult {
  inputPerReq: number;
  outputPerReq: number;
  costPerReq: number;
  totalInput: number;
  totalOutput: number;
  totalCost: number;
  totalRequests: number;
}

/** Comparison of two scenarios across a time period */
export interface PeriodComparison {
  name: string;
  days: number;
  without: CostResult;
  withMethod: CostResult;
}

/** All props for the CostSimulator component */
export interface CostSimulatorProps {
  // --- Required data ---
  /** Pricing models to choose from */
  models: PricingModel[];
  /** Methods / techniques to compare (must include at least one with reductionFactor === 0) */
  methods: MethodOption[];
  /** Context window / sizing options */
  contextOptions: ContextOption[];
  /** Time periods for comparison */
  periods: PeriodOption[];

  // --- Labels (all optional with English defaults) ---
  /** Component title */
  title?: string;
  /** Component description */
  description?: string;
  /** Label for the "without optimization" card */
  baselineLabel?: string;
  /** Label template for the "with method" card. Use {method} as placeholder */
  methodLabelTemplate?: string;
  /** Baseline card subtitle */
  baselineSubtitle?: string;
  /** No-method subtitle */
  noMethodTitle?: string;
  /** No-method subtitle */
  noMethodSubtitle?: string;
  /** Reset button label */
  resetLabel?: string;
  /** Label for "Model" selector */
  modelSelectorLabel?: string;
  /** Label for "Method" selector */
  methodSelectorLabel?: string;
  /** Label for "Context" selector */
  contextSelectorLabel?: string;
  /** Context selector hint text */
  contextHint?: string;
  /** Section: Simulation Parameters */
  parametersSectionLabel?: string;
  /** Section: Cost Comparison */
  comparisonSectionLabel?: string;
  /** Section: Savings */
  savingsSectionLabel?: string;
  /** Section: By Period */
  periodSectionLabel?: string;
  /** Section: Detailed Breakdown */
  breakdownSectionLabel?: string;
  /** Button: Pricing & Assumptions */
  assumptionsButtonLabel?: string;
  /** Banner: monthly savings label */
  monthlySavingsLabel?: string;
  /** Banner: annual savings label */
  annualSavingsLabel?: string;
  /** Banner: units saved label */
  unitsSavedLabel?: string;
  /** Savings bar: left label */
  savingsBarBaselineLabel?: string;
  /** Savings bar: right label */
  savingsBarMethodLabel?: string;
  /** Table: Metric column header */
  metricColumnLabel?: string;
  /** Metric labels */
  metricLabels?: {
    inputPerReq?: string;
    outputPerReq?: string;
    costPerReq?: string;
    requestsPerPeriod?: string;
    totalInputTokens?: string;
    totalOutputTokens?: string;
    periodCost?: string;
  };
  /** Assumptions section labels */
  assumptionLabels?: {
    pricingTitle?: string;
    assumptionsTitle?: string;
    contextUtilization?: string;
    outputInputRatio?: string;
    methodReductionNote?: string;
  };

  // --- Defaults ---
  /** Default model id */
  defaultModelId?: string;
  /** Default method id */
  defaultMethodId?: string;
  /** Default context id */
  defaultContextId?: string;

  // --- Slider configs ---
  /** Slider config: items per day */
  throughputSlider?: SliderConfig;
  /** Slider config: units per item */
  unitSizeSlider?: SliderConfig;

  // --- Formula parameters ---
  /** How much of the context is typically utilized (default 0.2) */
  contextUtilization?: number;
  /** Output/input unit ratio (default 0.5) */
  outputRatio?: number;

  // --- Period keys ---
  /** Period name used for the primary highlighted view (defaults to middle period) */
  primaryPeriodName?: string;
  /** Period name used for annual savings (defaults to last period) */
  annualPeriodName?: string;
}

// ============================================================
// Internal Types
// ============================================================

// (none needed — all exported above)

// ============================================================
// Style Maps (static Tailwind classes)
// ============================================================

const BASELINE_STYLES = {
  wrapper:
    'rounded-xl border-2 border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 p-4 sm:p-5',
  iconBg: 'bg-red-100 dark:bg-red-500/20',
  iconText: 'text-red-600 dark:text-red-400',
  titleText: 'text-red-700 dark:text-red-300',
  subtitleText: 'text-red-500/70 dark:text-red-400/60',
  costText: 'text-red-600 dark:text-red-400',
  barColor: 'bg-red-500',
};

const METHOD_STYLES = {
  wrapper:
    'rounded-xl border-2 border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 sm:p-5',
  iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
  iconText: 'text-emerald-600 dark:text-emerald-400',
  titleText: 'text-emerald-700 dark:text-emerald-300',
  subtitleText: 'text-emerald-500/70 dark:text-emerald-400/60',
  costText: 'text-emerald-600 dark:text-emerald-400',
  barColor: 'bg-emerald-500',
};

const NEUTRAL_STYLES = {
  wrapper:
    'rounded-xl border-2 border-muted bg-muted/30 p-4 sm:p-5',
  iconBg: 'bg-muted',
  iconText: 'text-muted-foreground',
  titleText: 'text-muted-foreground',
  subtitleText: 'text-muted-foreground/60',
  costText: 'text-muted-foreground',
  barColor: 'bg-muted-foreground/30',
};

const SAVINGS_COLORS = {
  high: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    bar: 'bg-emerald-500',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0',
  },
  medium: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    bar: 'bg-amber-500',
    badge:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0',
  },
  low: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-500/10',
    bar: 'bg-red-500',
    badge:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0',
  },
} as const;

// ============================================================
// Helper Functions
// ============================================================

function formatMoney(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 100) {
    return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  if (value >= 0.001) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(6)}`;
}

function formatTokens(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function getSavingsCategory(percent: number): 'high' | 'medium' | 'low' {
  if (percent >= 50) return 'high';
  if (percent >= 20) return 'medium';
  return 'low';
}

/** Compute cost for a given scenario */
function computeCost(
  throughputPerDay: number,
  unitsPerItem: number,
  contextValue: number,
  reduction: number,
  model: PricingModel,
  days: number,
  ctxUtilization: number,
  outRatio: number,
): CostResult {
  const historyUnits = contextValue * ctxUtilization;
  const effectiveHistory = historyUnits * (1 - reduction);

  const inputPerReq = unitsPerItem + effectiveHistory;
  const outputPerReq = Math.round(unitsPerItem * outRatio);

  const totalRequests = throughputPerDay * days;
  const totalInput = inputPerReq * totalRequests;
  const totalOutput = outputPerReq * totalRequests;

  const inputCost = (totalInput / 1_000_000) * model.inputPrice;
  const outputCost = (totalOutput / 1_000_000) * model.outputPrice;

  return {
    inputPerReq,
    outputPerReq,
    costPerReq: totalRequests > 0 ? (inputCost + outputCost) / totalRequests : 0,
    totalInput,
    totalOutput,
    totalCost: inputCost + outputCost,
    totalRequests,
  };
}

// ============================================================
// Sub-components
// ============================================================

/** Animated monetary value display */
function AnimatedMoney({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={`tabular-nums ${className}`}>{formatMoney(value)}</span>
  );
}

/** Animated percentage display */
function AnimatedPercent({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={`tabular-nums ${className}`}>{value.toFixed(1)}%</span>
  );
}

/** Horizontal animated cost bar */
function CostBar({
  percentage,
  colorClass,
  savingsPct,
}: {
  percentage: number;
  colorClass: string;
  savingsPct?: number;
}) {
  const clampedPct = Math.max(percentage, 1.5);

  return (
    <div className="relative h-4 rounded-full bg-muted/60 overflow-hidden">
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full ${colorClass}`}
        initial={false}
        animate={{ width: `${clampedPct}%` }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      {savingsPct !== undefined && savingsPct > 3 && (
        <div className="absolute inset-0 flex items-center justify-end pr-2">
          <span className="micro-text font-semibold text-white drop-shadow-sm tabular-nums">
            -{savingsPct.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}

/** Mini stat cell for the comparison cards */
function MiniStatCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2">
      <div className="micro-text sm:text-xs text-muted-foreground leading-tight">
        {label}
      </div>
      <div className="text-xs sm:text-sm font-semibold tabular-nums mt-0.5">
        {value}
      </div>
    </div>
  );
}

/** Single row in the detailed breakdown table */
function TableDataRow({
  label,
  left,
  right,
  highlight,
  isAlt = false,
  isBold = false,
}: {
  label: string;
  left: string;
  right: string;
  highlight: boolean;
  isAlt?: boolean;
  isBold?: boolean;
}) {
  return (
    <div
      role="row"
      className={`grid grid-cols-3 text-xs sm:text-sm ${
        isAlt ? 'bg-muted/20' : 'bg-background'
      } border-t`}
    >
      <div
        role="cell"
        className={`px-3 py-2.5 ${
          isBold ? 'font-semibold' : 'text-muted-foreground'
        }`}
      >
        {label}
      </div>
      <div
        role="cell"
        className="px-3 py-2.5 text-center tabular-nums font-medium text-red-600 dark:text-red-400"
      >
        {left}
      </div>
      <div
        role="cell"
        className={`px-3 py-2.5 text-center tabular-nums ${
          isBold ? 'font-bold' : 'font-medium'
        } ${
          highlight
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-muted-foreground'
        }`}
      >
        {right}
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function CostSimulator({
  models,
  methods,
  contextOptions,
  periods,

  // --- Labels with English defaults ---
  title = 'Cost Comparison Simulator',
  description = 'Configure parameters and see how much you can save with optimization',
  baselineLabel = 'Without Optimization',
  methodLabelTemplate = 'With {method}',
  baselineSubtitle = 'Full context each request',
  noMethodTitle = 'No method selected',
  noMethodSubtitle = 'Select a method to calculate',
  resetLabel = 'Reset',
  modelSelectorLabel = 'Model',
  methodSelectorLabel = 'Method',
  contextSelectorLabel = 'Context',
  contextHint = 'Max context size',
  parametersSectionLabel = 'Simulation Parameters',
  comparisonSectionLabel = 'Cost Comparison',
  savingsSectionLabel = 'Savings Overview',
  periodSectionLabel = 'Comparison by Period',
  breakdownSectionLabel = 'Detailed Breakdown',
  assumptionsButtonLabel = 'Pricing & Assumptions',
  monthlySavingsLabel = 'Monthly savings',
  annualSavingsLabel = 'Annual savings',
  unitsSavedLabel = 'Units saved',
  savingsBarBaselineLabel = 'Without optimization',
  savingsBarMethodLabel = 'With optimization',
  metricColumnLabel = 'Metric',
  metricLabels: labels = {},
  assumptionLabels: assumpLabels = {},

  // --- Defaults ---
  defaultModelId,
  defaultMethodId,
  defaultContextId,

  // --- Slider configs ---
  throughputSlider: tpSlider,
  unitSizeSlider: usSlider,

  // --- Formula params ---
  contextUtilization = 0.2,
  outputRatio = 0.5,

  // --- Period keys ---
  primaryPeriodName: primaryPeriodProp,
  annualPeriodName: annualPeriodProp,
}: CostSimulatorProps) {
  // Merge slider defaults
  const tp = {
    min: 1,
    max: 500,
    step: 1,
    defaultValue: 100,
    label: 'Items per day',
    ...tpSlider,
  };
  const us = {
    min: 10,
    max: 2000,
    step: 10,
    defaultValue: 200,
    label: 'Units per item',
    ...usSlider,
  };

  // Resolve baseline method (reduction === 0)
  const baselineMethod = methods.find((m) => m.reductionFactor === 0) || methods[0];
  const activeDefault = defaultMethodId
    ? methods.find((m) => m.id === defaultMethodId)
    : methods.find((m) => m.reductionFactor > 0) || methods[1];

  // --- State ---
  const [modelId, setModelId] = useState(defaultModelId || models[0]?.id || '');
  const [methodId, setMethodId] = useState(
    activeDefault?.id || baselineMethod?.id || methods[0]?.id || ''
  );
  const [contextId, setContextId] = useState(defaultContextId || contextOptions[0]?.id || '');
  const [throughput, setThroughput] = useState(tp.defaultValue);
  const [unitSize, setUnitSize] = useState(us.defaultValue);
  const [expandedBreakdown, setExpandedBreakdown] = useState(false);

  // --- Derived selections ---
  const model = useMemo(
    () => models.find((m) => m.id === modelId) || models[0]!,
    [modelId, models]
  );
  const method = useMemo(
    () => methods.find((m) => m.id === methodId) || methods[0]!,
    [methodId, methods]
  );
  const contextOpt = useMemo(
    () => contextOptions.find((c) => c.id === contextId) || contextOptions[0]!,
    [contextId, contextOptions]
  );

  const isMethodActive = method.reductionFactor > 0;

  // --- Reset handler ---
  const handleReset = useCallback(() => {
    setModelId(defaultModelId || models[0]?.id || '');
    setMethodId(activeDefault?.id || baselineMethod?.id || methods[0]?.id || '');
    setContextId(defaultContextId || contextOptions[0]?.id || '');
    setThroughput(tp.defaultValue);
    setUnitSize(us.defaultValue);
  }, [defaultModelId, models, activeDefault, baselineMethod, methods, defaultContextId, contextOptions, tp.defaultValue, us.defaultValue]);

  // --- Period comparisons ---
  const periodComparisons: PeriodComparison[] = useMemo(
    () =>
      periods.map((period) => ({
        name: period.name,
        days: period.days,
        without: computeCost(
          throughput,
          unitSize,
          contextOpt.value,
          0,
          model,
          period.days,
          contextUtilization,
          outputRatio,
        ),
        withMethod: computeCost(
          throughput,
          unitSize,
          contextOpt.value,
          method.reductionFactor,
          model,
          period.days,
          contextUtilization,
          outputRatio,
        ),
      })),
    [throughput, unitSize, contextOpt.value, method.reductionFactor, model, periods, contextUtilization, outputRatio]
  );

  // --- Primary & annual periods ---
  const primaryName = primaryPeriodProp || periods[Math.floor(periods.length / 2)]?.name || periods[0]?.name || '';
  const annualName = annualPeriodProp || periods[periods.length - 1]?.name || '';

  const primary = periodComparisons.find((p) => p.name === primaryName) || periodComparisons[0];
  const annual = periodComparisons.find((p) => p.name === annualName) || periodComparisons[periodComparisons.length - 1];

  // --- Savings calculations ---
  const savings = primary.without.totalCost - primary.withMethod.totalCost;
  const savingsPct =
    primary.without.totalCost > 0
      ? (savings / primary.without.totalCost) * 100
      : 0;
  const annualSavings = annual.without.totalCost - annual.withMethod.totalCost;
  const savingsCategory = getSavingsCategory(savingsPct);
  const savingsColors = SAVINGS_COLORS[savingsCategory];
  const withCardStyles = isMethodActive ? METHOD_STYLES : NEUTRAL_STYLES;

  const unitsSaved =
    primary.without.totalInput +
    primary.without.totalOutput -
    (primary.withMethod.totalInput + primary.withMethod.totalOutput);

  // --- Metric labels with defaults ---
  const lbl = {
    inputPerReq: 'Input / request',
    outputPerReq: 'Output / request',
    costPerReq: 'Cost / request',
    requestsPerPeriod: `Requests / ${primaryName.toLowerCase()}`,
    totalInputTokens: 'Total input units',
    totalOutputTokens: 'Total output units',
    periodCost: `Cost per ${primaryName.toLowerCase()}`,
    ...labels,
  };

  // --- Assumption labels with defaults ---
  const aLbl = {
    pricingTitle: `${model.name} pricing (per 1M units):`,
    assumptionsTitle: 'Assumptions:',
    contextUtilization: 'Context utilization',
    outputInputRatio: 'Output/input ratio',
    methodReductionNote: 'The selected method reduces only context units, not current message units',
    ...assumpLabels,
  };

  return (
    <div className="space-y-6">
      {/* ================================================ */}
      {/* Header                                           */}
      {/* ================================================ */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
            <Calculator className="h-5 w-5 text-primary shrink-0" />
            <span>{title}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          <span className="hidden sm:inline">{resetLabel}</span>
        </Button>
      </div>

      {/* ================================================ */}
      {/* 1. Simulation Parameters                        */}
      {/* ================================================ */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Zap className="h-4 w-4" />
          {parametersSectionLabel}
        </div>

        {/* Selectors: Model, Method, Context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Model */}
          <div className="space-y-1.5">
            <label htmlFor="cs-model" className="text-sm font-medium">
              {modelSelectorLabel}
            </label>
            <Select value={modelId} onValueChange={(v) => setModelId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="font-medium">{m.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ${m.inputPrice}/${m.outputPrice}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Price per 1M units: in ${model.inputPrice}, out ${model.outputPrice}
            </p>
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <label htmlFor="cs-method" className="text-sm font-medium">
              {methodSelectorLabel}
            </label>
            <Select value={methodId} onValueChange={(v) => setMethodId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {methods.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="font-medium">{m.name}</span>
                    {m.reductionFactor > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 micro-text px-1.5 py-0 border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      >
                        -{Math.round(m.reductionFactor * 100)}%
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {method.description}
            </p>
          </div>

          {/* Context */}
          <div className="space-y-1.5">
            <label htmlFor="cs-context" className="text-sm font-medium">
              {contextSelectorLabel}
            </label>
            <Select value={contextId} onValueChange={(v) => setContextId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contextOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatTokens(c.value)} {c.unit || ''}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">{contextHint}</p>
          </div>
        </div>

        {/* Sliders: Throughput & Unit Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* Throughput slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cs-throughput" className="text-sm font-medium flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                {tp.label}
              </label>
              <Badge
                variant="outline"
                className="tabular-nums font-mono text-xs"
              >
                {throughput}
              </Badge>
            </div>
            <Slider
              id="cs-throughput"
              value={[throughput]}
              onValueChange={([v]) => setThroughput(v)}
              min={tp.min}
              max={tp.max}
              step={tp.step}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{tp.min}</span>
              <span>{Math.round((tp.min + tp.max) / 2)}</span>
              <span>{tp.max}</span>
            </div>
          </div>

          {/* Unit size slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cs-units" className="text-sm font-medium flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                {us.label}
              </label>
              <Badge
                variant="outline"
                className="tabular-nums font-mono text-xs"
              >
                {unitSize}
              </Badge>
            </div>
            <Slider
              id="cs-units"
              value={[unitSize]}
              onValueChange={([v]) => setUnitSize(v)}
              min={us.min}
              max={us.max}
              step={us.step}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{us.min}</span>
              <span>{Math.round((us.min + us.max) / 2)}</span>
              <span>{us.max}</span>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ================================================ */}
      {/* 2. Cost Comparison: Baseline vs Method           */}
      {/* ================================================ */}
      <section>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
          <TrendingDown className="h-4 w-4" />
          {comparisonSectionLabel}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* --- Baseline card --- */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={BASELINE_STYLES.wrapper}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${BASELINE_STYLES.iconBg}`}
              >
                <XCircle className={`h-4 w-4 ${BASELINE_STYLES.iconText}`} />
              </div>
              <div>
                <div className={`font-semibold text-sm ${BASELINE_STYLES.titleText}`}>
                  {baselineLabel}
                </div>
                <div className={`text-xs ${BASELINE_STYLES.subtitleText}`}>
                  {baselineSubtitle}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Period cost */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {lbl.periodCost}
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${BASELINE_STYLES.costText}`}>
                  <AnimatedMoney value={primary.without.totalCost} />
                </div>
              </div>

              {/* Bar (100% baseline) */}
              <CostBar percentage={100} colorClass={BASELINE_STYLES.barColor} />

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-2">
                <MiniStatCell
                  label={lbl.inputPerReq}
                  value={formatTokens(primary.without.inputPerReq)}
                />
                <MiniStatCell
                  label={lbl.outputPerReq}
                  value={formatTokens(primary.without.outputPerReq)}
                />
                <MiniStatCell
                  label={lbl.costPerReq}
                  value={formatMoney(primary.without.costPerReq)}
                />
                <MiniStatCell
                  label={lbl.requestsPerPeriod}
                  value={formatNumber(primary.without.totalRequests)}
                />
              </div>
            </div>
          </motion.div>

          {/* --- Method card --- */}
          <motion.div
            key={`method-${methodId}`}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={withCardStyles.wrapper}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${withCardStyles.iconBg}`}
              >
                <CheckCircle2 className={`h-4 w-4 ${withCardStyles.iconText}`} />
              </div>
              <div>
                <div className={`font-semibold text-sm ${withCardStyles.titleText}`}>
                  {isMethodActive
                    ? methodLabelTemplate.replace('{method}', method.name)
                    : noMethodTitle}
                </div>
                <div className={`text-xs ${withCardStyles.subtitleText}`}>
                  {isMethodActive
                    ? `Reduction: ${Math.round(method.reductionFactor * 100)}%`
                    : noMethodSubtitle}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Period cost */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {lbl.periodCost}
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${withCardStyles.costText}`}>
                  <AnimatedMoney value={primary.withMethod.totalCost} />
                </div>
              </div>

              {/* Proportional bar */}
              <CostBar
                percentage={
                  primary.without.totalCost > 0
                    ? (primary.withMethod.totalCost / primary.without.totalCost) * 100
                    : 100
                }
                colorClass={withCardStyles.barColor}
                savingsPct={isMethodActive ? savingsPct : undefined}
              />

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-2">
                <MiniStatCell
                  label={lbl.inputPerReq}
                  value={formatTokens(primary.withMethod.inputPerReq)}
                />
                <MiniStatCell
                  label={lbl.outputPerReq}
                  value={formatTokens(primary.withMethod.outputPerReq)}
                />
                <MiniStatCell
                  label={lbl.costPerReq}
                  value={formatMoney(primary.withMethod.costPerReq)}
                />
                <MiniStatCell
                  label={lbl.requestsPerPeriod}
                  value={formatNumber(primary.withMethod.totalRequests)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================ */}
      {/* 3. Savings Banner                                */}
      {/* ================================================ */}
      {isMethodActive && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`rounded-xl ${savingsColors.bg} p-4 sm:p-5 space-y-4`}
        >
          <div className="flex items-center gap-2">
            <PiggyBank className={`h-5 w-5 ${savingsColors.text}`} />
            <span className={`font-semibold text-sm ${savingsColors.text}`}>
              {savingsSectionLabel}
            </span>
          </div>

          {/* Key savings numbers */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">
                {monthlySavingsLabel}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl sm:text-4xl font-bold ${savingsColors.text}`}>
                  <AnimatedMoney value={savings} />
                </span>
                <span className={`text-lg font-semibold ${savingsColors.text}`}>
                  (<AnimatedPercent value={savingsPct} />)
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-border" />

            <div>
              <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {annualSavingsLabel}
              </div>
              <div className={`text-xl font-bold ${savingsColors.text}`}>
                <AnimatedMoney value={annualSavings} />
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-border" />

            <div>
              <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {unitsSavedLabel} / {primaryName.toLowerCase()}
              </div>
              <div className={`text-xl font-bold tabular-nums ${savingsColors.text}`}>
                {formatTokens(unitsSaved)}
              </div>
            </div>
          </div>

          {/* Visual savings bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{savingsBarBaselineLabel}</span>
              <span>{savingsBarMethodLabel}</span>
            </div>
            <div className="relative h-5 rounded-full bg-muted/50 overflow-hidden">
              {/* Full cost — background */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-red-400/20 dark:bg-red-500/15"
                style={{ width: '100%' }}
              />
              {/* Optimized cost — foreground */}
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${savingsColors.bar}`}
                initial={false}
                animate={{ width: `${Math.max(100 - savingsPct, 2)}%` }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            </div>
          </div>
        </motion.section>
      )}

      <Separator />

      {/* ================================================ */}
      {/* 4. Comparison by Period                          */}
      {/* ================================================ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          {periodSectionLabel}
        </div>

        <div className="space-y-3">
          {periodComparisons.map((p, idx) => {
            const pSavings = p.without.totalCost - p.withMethod.totalCost;
            const pSavingsPct =
              p.without.totalCost > 0
                ? (pSavings / p.without.totalCost) * 100
                : 0;
            const withPct =
              p.without.totalCost > 0
                ? (p.withMethod.totalCost / p.without.totalCost) * 100
                : 100;

            return (
              <motion.div
                key={p.name}
                initial={false}
                className="space-y-2"
              >
                {/* Row header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium w-16 shrink-0">
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm flex-1 justify-end">
                    <span className="text-red-500 dark:text-red-400 tabular-nums font-medium">
                      {formatMoney(p.without.totalCost)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span
                      className={`tabular-nums font-medium ${
                        isMethodActive ? savingsColors.text : 'text-muted-foreground'
                      }`}
                    >
                      {formatMoney(p.withMethod.totalCost)}
                    </span>
                    {isMethodActive && pSavingsPct > 0.5 && (
                      <Badge
                        variant="secondary"
                        className={`micro-text px-1.5 py-0 ml-1 border-0 ${savingsColors.badge}`}
                      >
                        -{pSavingsPct.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Comparison bar */}
                <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden">
                  {/* Background = baseline */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-red-400/15 dark:bg-red-500/10"
                    style={{ width: '100%' }}
                  />
                  {/* Foreground = with method */}
                  <motion.div
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      isMethodActive ? savingsColors.bar : 'bg-muted-foreground/30'
                    }`}
                    initial={false}
                    animate={{ width: `${Math.max(withPct, 1.5)}%` }}
                    transition={{
                      duration: 0.6,
                      delay: idx * 0.05,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ================================================ */}
      {/* 5. Detailed Breakdown                            */}
      {/* ================================================ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          {breakdownSectionLabel} ({primaryName})
        </div>

        {/* Comparison table */}
        <div role="table" className="rounded-lg border overflow-hidden">
          {/* Table header */}
          <div role="row" className="grid grid-cols-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
            <div role="columnheader" className="px-3 py-2.5">{metricColumnLabel}</div>
            <div role="columnheader" className="px-3 py-2.5 text-center text-red-600 dark:text-red-400">
              {baselineLabel}
            </div>
            <div
              role="columnheader"
              className={`px-3 py-2.5 text-center ${
                isMethodActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
              }`}
            >
              {isMethodActive ? method.name : 'None selected'}
            </div>
          </div>

          {/* Table rows */}
          <TableDataRow
            label={lbl.inputPerReq}
            left={formatTokens(primary.without.inputPerReq)}
            right={formatTokens(primary.withMethod.inputPerReq)}
            highlight={isMethodActive}
          />
          <TableDataRow
            label={lbl.outputPerReq}
            left={formatTokens(primary.without.outputPerReq)}
            right={formatTokens(primary.withMethod.outputPerReq)}
            highlight={false}
            isAlt
          />
          <TableDataRow
            label={lbl.costPerReq}
            left={formatMoney(primary.without.costPerReq)}
            right={formatMoney(primary.withMethod.costPerReq)}
            highlight={isMethodActive}
          />
          <TableDataRow
            label={lbl.totalInputTokens}
            left={formatTokens(primary.without.totalInput)}
            right={formatTokens(primary.withMethod.totalInput)}
            highlight={isMethodActive}
            isAlt
          />
          <TableDataRow
            label={lbl.totalOutputTokens}
            left={formatTokens(primary.without.totalOutput)}
            right={formatTokens(primary.withMethod.totalOutput)}
            highlight={false}
          />
          <TableDataRow
            label={lbl.periodCost}
            left={formatMoney(primary.without.totalCost)}
            right={formatMoney(primary.withMethod.totalCost)}
            highlight={isMethodActive}
            isAlt
            isBold
          />
        </div>

        {/* Expandable: Pricing & Assumptions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedBreakdown(!expandedBreakdown)}
          className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
        >
          <Info className="h-3 w-3 mr-1.5" />
          {assumptionsButtonLabel}
          <motion.span
            animate={{ rotate: expandedBreakdown ? 180 : 0 }}
            className="ml-1 inline-block"
          >
            {'\u25BE'}
          </motion.span>
        </Button>

        <AnimatePresence>
          {expandedBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Model pricing */}
              <div className="rounded-lg bg-muted/40 p-4 text-xs space-y-2.5">
                <div className="font-medium text-foreground">
                  {aLbl.pricingTitle}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Input units:</span>
                    <span className="font-mono tabular-nums">
                      ${model.inputPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output units:</span>
                    <span className="font-mono tabular-nums">
                      ${model.outputPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assumptions */}
              <div className="rounded-lg bg-muted/40 p-4 text-xs space-y-2">
                <div className="font-medium text-foreground">
                  {aLbl.assumptionsTitle}
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5">&bull;</span>
                    <span>
                      {aLbl.contextUtilization}:{' '}
                      <strong className="text-foreground">
                        {(contextUtilization * 100).toFixed(0)}%
                      </strong>{' '}
                      ({formatTokens(contextOpt.value * contextUtilization)}{' '}
                      units)
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5">&bull;</span>
                    <span>
                      {aLbl.outputInputRatio}:{' '}
                      <strong className="text-foreground">
                        {(outputRatio * 100).toFixed(0)}%
                      </strong>{' '}
                      of input units
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5">&bull;</span>
                    <span>
                      {aLbl.methodReductionNote}
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
