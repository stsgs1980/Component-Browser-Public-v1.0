'use client';

// ============================================================
// Generic Benchmarks Chart: visual comparison dashboard with
// multiple metrics, datasets, bar/radar/cost charts, and a
// sortable comparison table.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  Zap,
  Gauge,
  Settings2,
  DollarSign,
  ArrowUpDown,
  Trophy,
  Star,
  TrendingDown,
  Clock,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

// ============================================================
// EXPORTED TYPES
// ============================================================

/** A single benchmark entry (dataset item) with arbitrary numeric metrics. */
export interface BenchmarkEntry {
  /** Unique identifier */
  id: string;
  /** Full display name */
  name: string;
  /** Short label for charts & tables */
  shortName: string;
  /** All metric values keyed by MetricDefinition.key */
  values: Record<string, number>;
  /** If true, rendered with a dimmed / baseline style */
  isBaseline?: boolean;
}

/** Describes one metric column used in bar charts, cost chart, and the table. */
export interface MetricDefinition {
  /** Key matching BenchmarkEntry.values */
  key: string;
  /** Display label */
  label: string;
  /** Unit suffix, e.g. '%', 'ms', '$' */
  unit: string;
  /** Optional prefix, e.g. '$', '+' */
  prefix?: string;
  /** Format value for display */
  format: (value: number) => string;
  /** true = higher is better; false = lower is better (for color coding) */
  higherIsBetter: boolean;
  /** Grid col-span in the comparison table (out of 12) */
  colSpan: number;
  /**
   * Thresholds for color coding.
   * For higherIsBetter:  values >= good are green, >= moderate are yellow, else red.
   * For lowerIsBetter:    values <= good are green, <= moderate are yellow, else red.
   */
  thresholds: { good: number; moderate: number };
}

/** One axis of the radar chart. */
export interface RadarDimension {
  /** Key matching BenchmarkEntry.values */
  key: string;
  /** Label shown at the axis tip */
  label: string;
  /** Transform raw value → 0-100 normalised value (default: identity) */
  transform?: (value: number) => number;
}

/** A conclusion item rendered in the footer. */
export interface ConclusionItem {
  title: string;
  text: string;
}

/** Configuration for a summary metric card at the top. */
export interface MetricCardConfig {
  icon: LucideIcon;
  label: string;
  /** Which metric key drives this card */
  metricKey: string;
  /** Higher-is-better for the "best" computation */
  higherIsBetter: boolean;
  /** Custom format for the card value (falls back to metric format) */
  format?: (value: number) => string;
  /** Tailwind color class for the icon background */
  colorClass: string;
}

/** Savings / highlight banner shown under the cost chart. */
export interface SavingsBanner {
  title: string;
  /** Supports {value}, {percent}, {best}, {baseline} placeholders */
  text: string;
}

/** Props for the main BenchmarksChart component. */
export interface BenchmarksChartProps {
  /** Array of benchmark entries to compare */
  benchmarks: BenchmarkEntry[];

  /** Metric column definitions */
  metrics: MetricDefinition[];

  /** Radar chart axis definitions */
  radarDimensions: RadarDimension[];

  /** Chart / panel labels (all optional with sensible defaults) */
  labels?: {
    title?: string;
    description?: string;
    badgeText?: string;
    primaryChartDesc?: string;
    secondaryChartDesc?: string;
    radarChartDesc?: string;
    costChartDesc?: string;
    tableHint?: string;
    conclusionTitle?: string;
    /** Tab labels */
    tabPrimary?: string;
    tabPrimaryShort?: string;
    tabSecondary?: string;
    tabSecondaryShort?: string;
    tabRadar?: string;
    tabRadarShort?: string;
    tabCost?: string;
    tabCostShort?: string;
    tabTable?: string;
    tabTableShort?: string;
  };

  /** Which metric key drives the horizontal bar chart (default: metrics[0].key) */
  primaryMetricKey?: string;

  /** Which metric key drives the vertical bar chart (default: metrics[1]?.key) */
  secondaryMetricKey?: string;

  /** Which metric key drives the cost comparison chart (default: metrics[metrics.length-1].key) */
  costMetricKey?: string;

  /** Benchmark IDs visible on the radar chart by default (default: first 4 non-baseline) */
  defaultRadarIds?: string[];

  /** Summary metric cards at the top (default: auto-generated from first 4 metrics) */
  metricCards?: MetricCardConfig[];

  /** Conclusions rendered at the bottom */
  conclusions?: ConclusionItem[];

  /** Savings banner under the cost chart */
  savingsBanner?: SavingsBanner;

  /** Custom color palette (default: built-in palette cycled by index) */
  colorPalette?: Record<string, ColorSet>;
}

// ============================================================
// INTERNAL TYPES
// ============================================================

/** Tailwind color classes for benchmark visualization. */
export interface ColorSet {
  bar: string;
  barLight: string;
  text: string;
  badge: string;
  radar: string;
  radarFill: string;
  dot: string;
}

type ValueCategory = 'good' | 'moderate' | 'bad';
type SortDirection = 'asc' | 'desc';

// ============================================================
// DEFAULT COLOR PALETTE
// ============================================================

const DEFAULT_PALETTE: ColorSet[] = [
  {
    bar: 'bg-gray-400',
    barLight: 'bg-gray-300 dark:bg-gray-600',
    text: 'text-gray-500',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-0',
    radar: 'stroke-gray-400',
    radarFill: 'fill-gray-400/15 dark:fill-gray-400/10',
    dot: 'bg-gray-400',
  },
  {
    bar: 'bg-emerald-500',
    barLight: 'bg-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0',
    radar: 'stroke-emerald-500',
    radarFill: 'fill-emerald-500/15 dark:fill-emerald-500/10',
    dot: 'bg-emerald-500',
  },
  {
    bar: 'bg-cyan-500',
    barLight: 'bg-cyan-400',
    text: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-0',
    radar: 'stroke-cyan-500',
    radarFill: 'fill-cyan-500/15 dark:fill-cyan-500/10',
    dot: 'bg-cyan-500',
  },
  {
    bar: 'bg-violet-500',
    barLight: 'bg-violet-400',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-0',
    radar: 'stroke-violet-500',
    radarFill: 'fill-violet-500/15 dark:fill-violet-500/10',
    dot: 'bg-violet-500',
  },
  {
    bar: 'bg-rose-500',
    barLight: 'bg-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0',
    radar: 'stroke-rose-500',
    radarFill: 'fill-rose-500/15 dark:fill-rose-500/10',
    dot: 'bg-rose-500',
  },
  {
    bar: 'bg-amber-500',
    barLight: 'bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0',
    radar: 'stroke-amber-500',
    radarFill: 'fill-amber-500/15 dark:fill-amber-500/10',
    dot: 'bg-amber-500',
  },
  {
    bar: 'bg-teal-500',
    barLight: 'bg-teal-400',
    text: 'text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-0',
    radar: 'stroke-teal-500',
    radarFill: 'fill-teal-500/15 dark:fill-teal-500/10',
    dot: 'bg-teal-500',
  },
  {
    bar: 'bg-blue-500',
    barLight: 'bg-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0',
    radar: 'stroke-blue-500',
    radarFill: 'fill-blue-500/15 dark:fill-blue-500/10',
    dot: 'bg-blue-500',
  },
  {
    bar: 'bg-pink-500',
    barLight: 'bg-pink-400',
    text: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-0',
    radar: 'stroke-pink-500',
    radarFill: 'fill-pink-500/15 dark:fill-pink-500/10',
    dot: 'bg-pink-500',
  },
  {
    bar: 'bg-indigo-500',
    barLight: 'bg-indigo-400',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-0',
    radar: 'stroke-indigo-500',
    radarFill: 'fill-indigo-500/15 dark:fill-indigo-500/10',
    dot: 'bg-indigo-500',
  },
];

const FALLBACK_COLOR: ColorSet = DEFAULT_PALETTE[0];

/** Category → Tailwind class */
const VALUE_COLORS: Record<ValueCategory, string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  moderate: 'text-amber-600 dark:text-amber-400',
  bad: 'text-red-600 dark:text-red-400',
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getCategory(
  value: number,
  metric: MetricDefinition,
): ValueCategory {
  const { good, moderate } = metric.thresholds;
  if (metric.higherIsBetter) {
    if (value >= good) return 'good';
    if (value >= moderate) return 'moderate';
    return 'bad';
  }
  // lower-is-better
  if (value <= good) return 'good';
  if (value <= moderate) return 'moderate';
  return 'bad';
}

function formatNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Assign colors from the palette to benchmarks by index (baseline always gets index 0). */
function buildColorMap(
  benchmarks: BenchmarkEntry[],
  customPalette?: Record<string, ColorSet>,
): Record<string, ColorSet> {
  const map: Record<string, ColorSet> = {};
  let paletteIdx = 0;
  for (const b of benchmarks) {
    if (customPalette?.[b.id]) {
      map[b.id] = customPalette[b.id];
    } else {
      map[b.id] = DEFAULT_PALETTE[paletteIdx % DEFAULT_PALETTE.length];
      paletteIdx++;
    }
  }
  return map;
}

/** Compute SVG polygon points for the radar chart. */
function computeRadarPoints(
  entry: BenchmarkEntry,
  dimensions: RadarDimension[],
  centerX: number,
  centerY: number,
  maxRadius: number,
): string {
  const count = dimensions.length;
  return dimensions.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const raw = entry.values[dim.key] ?? 0;
    const value = dim.transform ? dim.transform(raw) : raw;
    const normalized = Math.min(value / 100, 1);
    const r = normalized * maxRadius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/** Compute SVG polygon points for the radar grid at a given level. */
function computeGridPoints(
  level: number,
  dimensions: RadarDimension[],
  centerX: number,
  centerY: number,
  maxRadius: number,
): string {
  const count = dimensions.length;
  const r = (level / 100) * maxRadius;
  return dimensions.map((_, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/** Find the best entry for a given metric. */
function findBest(
  entries: BenchmarkEntry[],
  metricKey: string,
  higherIsBetter: boolean,
): BenchmarkEntry {
  return entries.reduce((best, t) => {
    const bv = best.values[metricKey] ?? 0;
    const tv = t.values[metricKey] ?? 0;
    if (higherIsBetter) return tv > bv ? t : best;
    return tv < bv ? t : best;
  });
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  colorClass,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext: string;
  colorClass: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60 ${colorClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground font-medium mb-0.5">
                {label}
              </div>
              <div className="text-lg sm:text-xl font-bold leading-tight">
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                {subtext}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// CHART 1: PRIMARY METRIC — horizontal bars (higher is better)
// ============================================================

function PrimaryMetricChart({
  benchmarks,
  metric,
  colorMap,
  description,
}: {
  benchmarks: BenchmarkEntry[];
  metric: MetricDefinition;
  colorMap: Record<string, ColorSet>;
  description?: string;
}) {
  const sorted = useMemo(
    () =>
      [...benchmarks].sort((a, b) => {
        const va = a.values[metric.key] ?? 0;
        const vb = b.values[metric.key] ?? 0;
        return metric.higherIsBetter ? vb - va : va - vb;
      }),
    [benchmarks, metric],
  );
  const maxVal = Math.max(...sorted.map((b) => b.values[metric.key] ?? 0), 1);

  return (
    <div className="space-y-4">
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
      <div className="space-y-3">
        {sorted.map((entry, idx) => {
          const colors = colorMap[entry.id] || FALLBACK_COLOR;
          const val = entry.values[metric.key] ?? 0;
          const pct = (val / maxVal) * 100;
          const isBaseline = !!entry.isBaseline;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {!isBaseline && (
                    <Badge
                      variant="outline"
                      className={`micro-text shrink-0 px-1.5 py-0 font-bold ${colors.text}`}
                    >
                      #{idx}
                    </Badge>
                  )}
                  <span className="text-sm font-medium truncate">
                    {entry.shortName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {val > 0 && (
                    <Badge
                      variant="secondary"
                      className={`text-[11px] px-1.5 py-0 ${colors.badge}`}
                    >
                      {metric.prefix}{metric.format(val)}
                    </Badge>
                  )}
                  {isBaseline && (
                    <span className="text-xs text-muted-foreground">
                      baseline
                    </span>
                  )}
                </div>
              </div>

              {/* Horizontal bar */}
              <div className="relative h-7 rounded-lg bg-muted/50 overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-lg ${
                    isBaseline ? colors.barLight : colors.bar
                  }`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.max(pct, isBaseline ? 3 : 5)}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: idx * 0.07,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
                <AnimatePresence>
                  {pct > 15 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.07 }}
                      className="absolute inset-0 flex items-center pl-3"
                    >
                      <span className="text-xs font-semibold text-white drop-shadow-sm">
                        {metric.format(val)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// CHART 2: SECONDARY METRIC — vertical bars
// ============================================================

function SecondaryMetricChart({
  benchmarks,
  metric,
  colorMap,
  description,
}: {
  benchmarks: BenchmarkEntry[];
  metric: MetricDefinition;
  colorMap: Record<string, ColorSet>;
  description?: string;
}) {
  const nonBaseline = useMemo(
    () => benchmarks.filter((b) => !b.isBaseline),
    [benchmarks],
  );
  const sorted = useMemo(
    () =>
      [...nonBaseline].sort((a, b) => {
        const va = a.values[metric.key] ?? 0;
        const vb = b.values[metric.key] ?? 0;
        return metric.higherIsBetter ? vb - va : va - vb;
      }),
    [nonBaseline, metric],
  );
  const maxVal = Math.max(...sorted.map((b) => b.values[metric.key] ?? 0), 1);

  // Build legend thresholds
  const { good, moderate } = metric.thresholds;

  return (
    <div className="space-y-4">
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}

      <div className="flex items-end gap-2 sm:gap-3 h-56 sm:h-64 px-1">
        {sorted.map((entry, idx) => {
          const colors = colorMap[entry.id] || FALLBACK_COLOR;
          const val = entry.values[metric.key] ?? 0;
          const heightPct = (val / maxVal) * 100;
          const cat = getCategory(val, metric);

          return (
            <motion.div
              key={entry.id}
              className="flex-1 flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              {/* Value above bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.08 }}
                className="text-xs font-semibold tabular-nums"
              >
                {metric.prefix}{metric.format(val)}{metric.unit}
              </motion.div>

              {/* Bar */}
              <div className="w-full flex items-end h-44 sm:h-52">
                <motion.div
                  className={`w-full rounded-t-md ${colors.bar} min-h-[4px]`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, 2)}%` }}
                  transition={{
                    duration: 0.7,
                    delay: idx * 0.08,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>

              {/* Label */}
              <div
                className={`text-[11px] text-center leading-tight font-medium ${VALUE_COLORS[cat]}`}
              >
                {entry.shortName}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs pt-2">
        <span className="text-muted-foreground">Best:</span>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">
            {metric.higherIsBetter ? `>=${good}` : `<=${good}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
          <span className="text-amber-600 dark:text-amber-400">
            {metric.higherIsBetter
              ? `${moderate}-${good - 1}`
              : `${good + 1}-${moderate}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          <span className="text-red-600 dark:text-red-400">
            {metric.higherIsBetter ? `<${moderate}` : `>${moderate}`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHART 3: RADAR CHART (SVG)
// ============================================================

function RadarChart({
  benchmarks,
  dimensions,
  colorMap,
  description,
  defaultVisibleIds,
}: {
  benchmarks: BenchmarkEntry[];
  dimensions: RadarDimension[];
  colorMap: Record<string, ColorSet>;
  description?: string;
  defaultVisibleIds?: string[];
}) {
  const nonBaseline = useMemo(
    () => benchmarks.filter((b) => !b.isBaseline),
    [benchmarks],
  );

  const defaultSet = useMemo(() => {
    if (defaultVisibleIds) return new Set(defaultVisibleIds);
    return new Set(nonBaseline.slice(0, 4).map((b) => b.id));
  }, [defaultVisibleIds, nonBaseline]);

  const [visibleIds, setVisibleIds] = useState<Set<string>>(defaultSet);

  const toggleEntry = useCallback((id: string, checked: boolean) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const svgSize = 320;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const maxRadius = 120;

  const activeEntries = nonBaseline.filter((b) => visibleIds.has(b.id));

  return (
    <div className="space-y-4">
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-3">
        {nonBaseline.map((entry) => {
          const colors = colorMap[entry.id] || FALLBACK_COLOR;
          const isChecked = visibleIds.has(entry.id);

          return (
            <div key={entry.id} className="flex items-center gap-2">
              <Checkbox
                id={`radar-${entry.id}`}
                checked={isChecked}
                onCheckedChange={(v) => toggleEntry(entry.id, !!v)}
                className={`border-current ${isChecked ? colors.text : 'text-muted-foreground'}`}
              />
              <Label
                htmlFor={`radar-${entry.id}`}
                className={`text-xs cursor-pointer select-none ${
                  isChecked ? colors.text : 'text-muted-foreground'
                }`}
              >
                {entry.shortName}
              </Label>
            </div>
          );
        })}
      </div>

      {/* SVG Radar */}
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-full max-w-[380px] sm:max-w-[420px]"
          role="img"
          aria-label="Radar comparison chart"
        >
          {/* Grid: 5 levels */}
          {[20, 40, 60, 80, 100].map((level) => (
            <polygon
              key={`grid-${level}`}
              points={computeGridPoints(
                level,
                dimensions,
                centerX,
                centerY,
                maxRadius,
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-border"
              opacity={0.6}
            />
          ))}

          {/* Axes */}
          {dimensions.map((_, i) => {
            const angle =
              (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
            const x = centerX + maxRadius * Math.cos(angle);
            const y = centerY + maxRadius * Math.sin(angle);
            return (
              <line
                key={`axis-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                className="stroke-border"
                strokeWidth={0.5}
                opacity={0.4}
              />
            );
          })}

          {/* Labels */}
          {dimensions.map((dim, i) => {
            const angle =
              (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
            const labelR = maxRadius + 24;
            const x = centerX + labelR * Math.cos(angle);
            const y = centerY + labelR * Math.sin(angle);
            const mid = Math.floor(dimensions.length / 2);
            const textAnchor =
              i === 0
                ? 'middle'
                : i <= mid
                  ? 'start'
                  : i === dimensions.length - 1
                    ? 'end'
                    : 'end';
            const dominantBaseline =
              i === 0 ? 'auto' : i === dimensions.length - 1 ? 'hanging' : 'central';

            return (
              <text
                key={`label-${dim.key}`}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                className="fill-muted-foreground"
                fontSize={11}
                fontWeight={500}
              >
                {dim.label}
              </text>
            );
          })}

          {/* Data polygons */}
          <AnimatePresence>
            {activeEntries.map((entry) => {
              const colors = colorMap[entry.id] || FALLBACK_COLOR;
              return (
                <motion.polygon
                  key={entry.id}
                  points={computeRadarPoints(
                    entry,
                    dimensions,
                    centerX,
                    centerY,
                    maxRadius,
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className={`${colors.radar} ${colors.radarFill}`}
                  strokeWidth={2}
                  fillRule="nonzero"
                />
              );
            })}
          </AnimatePresence>

          {/* Dots on polygon vertices */}
          {activeEntries.map((entry) => {
            const colors = colorMap[entry.id] || FALLBACK_COLOR;
            return dimensions.map((dim, i) => {
              const angle =
                (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
              const raw = entry.values[dim.key] ?? 0;
              const value = dim.transform ? dim.transform(raw) : raw;
              const normalized = Math.min(value / 100, 1);
              const r = normalized * maxRadius;
              const x = centerX + r * Math.cos(angle);
              const y = centerY + r * Math.sin(angle);

              return (
                <circle
                  key={`dot-${entry.id}-${dim.key}`}
                  cx={x}
                  cy={y}
                  r={3}
                  className={colors.dot}
                />
              );
            });
          })}
        </svg>
      </div>

      {/* Mini legend */}
      <div className="flex flex-wrap justify-center gap-3 pt-1">
        {activeEntries.map((entry) => {
          const colors = colorMap[entry.id] || FALLBACK_COLOR;
          return (
            <div key={entry.id} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-sm ${colors.dot}`} />
              <span className={`text-xs font-medium ${colors.text}`}>
                {entry.shortName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// CHART 4: COST COMPARISON — horizontal bars with scale
// ============================================================

function CostMetricChart({
  benchmarks,
  metric,
  colorMap,
  description,
  savingsBanner,
}: {
  benchmarks: BenchmarkEntry[];
  metric: MetricDefinition;
  colorMap: Record<string, ColorSet>;
  description?: string;
  savingsBanner?: SavingsBanner;
}) {
  const sorted = useMemo(
    () =>
      [...benchmarks].sort((a, b) => {
        const va = a.values[metric.key] ?? 0;
        const vb = b.values[metric.key] ?? 0;
        return va - vb;
      }),
    [benchmarks, metric],
  );
  const maxVal = Math.max(...sorted.map((b) => b.values[metric.key] ?? 0), 1);

  // Build scale ticks (5 ticks from 0 to maxVal)
  const scaleTicks = useMemo(() => {
    const step = maxVal / 5;
    return Array.from({ length: 6 }, (_, i) => Math.round(step * i));
  }, [maxVal]);

  return (
    <div className="space-y-4">
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}

      <div className="relative space-y-2">
        {/* Scale */}
        <div className="flex justify-between text-xs text-muted-foreground px-2 mb-1">
          {scaleTicks.map((tick) => (
            <span key={tick}>
              {metric.prefix}{formatNum(tick)}{metric.unit}
            </span>
          ))}
        </div>

        <div className="space-y-1.5">
          {sorted.map((entry, idx) => {
            const colors = colorMap[entry.id] || FALLBACK_COLOR;
            const val = entry.values[metric.key] ?? 0;
            const widthPct = (val / maxVal) * 100;
            const cat = getCategory(val, metric);
            const isBaseline = !!entry.isBaseline;

            return (
              <motion.div
                key={entry.id}
                className="group flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
              >
                {/* Label */}
                <div className="w-20 sm:w-28 shrink-0 text-right">
                  <span className="text-xs font-medium text-muted-foreground">
                    {entry.shortName}
                  </span>
                </div>

                {/* Bar */}
                <div className="flex-1 relative h-8 rounded-md bg-muted/40 overflow-hidden">
                  {[20, 40, 60, 80].map((pct) => (
                    <div
                      key={pct}
                      className="absolute top-0 bottom-0 w-px bg-border/40"
                      style={{ left: `${pct}%` }}
                    />
                  ))}

                  <motion.div
                    className={`absolute inset-y-0 left-0 rounded-md ${
                      isBaseline
                        ? 'bg-red-400/60 dark:bg-red-500/40'
                        : colors.bar
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(widthPct, 2)}%` }}
                    transition={{
                      duration: 0.7,
                      delay: idx * 0.06,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    {widthPct > 10 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + idx * 0.06 }}
                        className="absolute inset-0 flex items-center pl-2.5"
                      >
                        <span className="text-[11px] font-semibold text-white drop-shadow-sm tabular-nums">
                          {metric.prefix}{formatNum(val)}{metric.unit}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Value right */}
                <div className="w-14 sm:w-20 shrink-0">
                  <span
                    className={`text-xs font-semibold tabular-nums ${VALUE_COLORS[cat]}`}
                  >
                    {metric.prefix}{metric.format(val)}{metric.unit}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Savings banner */}
      {savingsBanner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <TrendingDown className="h-4 w-4" />
            {savingsBanner.title}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {savingsBanner.text}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
// COMPARISON TABLE (sortable)
// ============================================================

function SortIcon({ active }: { active: boolean }) {
  return (
    <ArrowUpDown
      className={`h-3 w-3 ml-1 inline-block ${
        active ? 'text-foreground' : 'text-muted-foreground/40'
      }`}
    />
  );
}

function ComparisonTable({
  benchmarks,
  metrics,
  colorMap,
  hint,
}: {
  benchmarks: BenchmarkEntry[];
  metrics: MetricDefinition[];
  colorMap: Record<string, ColorSet>;
  hint?: string;
}) {
  const sortFields = ['name', ...metrics.map((m) => m.key)];
  const [sortField, setSortField] = useState<string>(metrics[0]?.key ?? 'name');
  const [sortDir, setSortDir] = useState<SortDirection>(
    metrics[0]?.higherIsBetter ? 'desc' : 'asc',
  );

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        const m = metrics.find((m) => m.key === field);
        setSortDir(m && !m.higherIsBetter ? 'asc' : 'desc');
      }
    },
    [sortField, metrics],
  );

  const sorted = useMemo(() => {
    return [...benchmarks].sort((a, b) => {
      if (sortField === 'name') {
        const diff = a.name.localeCompare(b.name);
        return sortDir === 'asc' ? diff : -diff;
      }
      const va = a.values[sortField] ?? 0;
      const vb = b.values[sortField] ?? 0;
      const diff = va - vb;
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [benchmarks, sortField, sortDir]);

  // Compute ranks based on the first metric
  const ranks = useMemo(() => {
    const rankKey = metrics[0]?.key;
    if (!rankKey) return new Map<string, number>();
    const higherBetter = metrics[0].higherIsBetter;
    const map = new Map<string, number>();
    benchmarks
      .filter((b) => !b.isBaseline)
      .sort((a, b) => {
        const va = a.values[rankKey] ?? 0;
        const vb = b.values[rankKey] ?? 0;
        return higherBetter ? vb - va : va - vb;
      })
      .forEach((b, i) => map.set(b.id, i + 1));
    return map;
  }, [benchmarks, metrics]);

  // Total colSpan must = 12
  const nameColSpan = 12 - metrics.reduce((sum, m) => sum + (m.colSpan || 2), 0);

  return (
    <div className="space-y-4">
      {hint && (
        <div className="text-sm text-muted-foreground">{hint}</div>
      )}

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[580px]">
          {/* Header */}
          <div className="grid grid-cols-12 gap-1 text-xs font-semibold text-muted-foreground pb-2 border-b">
            <button
              onClick={() => handleSort('name')}
              className={`${nameColSpan > 0 ? `col-span-${nameColSpan}` : 'col-span-3'} text-left flex items-center hover:text-foreground transition-colors`}
            >
              Item
              <SortIcon active={sortField === 'name'} />
            </button>
            {metrics.map((m) => (
              <button
                key={m.key}
                onClick={() => handleSort(m.key)}
                className={`col-span-${m.colSpan || 2} text-right flex items-center justify-end hover:text-foreground transition-colors`}
              >
                {m.label}
                <SortIcon active={sortField === m.key} />
              </button>
            ))}
          </div>

          {/* Rows */}
          {sorted.map((entry) => {
            const colors = colorMap[entry.id] || FALLBACK_COLOR;
            const isBaseline = !!entry.isBaseline;
            const rank = ranks.get(entry.id);

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`grid grid-cols-12 gap-1 items-center py-2.5 border-b border-border/40 text-sm ${
                  isBaseline ? 'opacity-60' : ''
                }`}
              >
                {/* Name + rank */}
                <div className={`${nameColSpan > 0 ? `col-span-${nameColSpan}` : 'col-span-3'} flex items-center gap-2 min-w-0`}>
                  {!isBaseline && rank !== undefined && rank <= 3 ? (
                    <Badge
                      variant="outline"
                      className={`micro-text shrink-0 px-1.5 py-0 font-bold border-0 ${colors.badge}`}
                    >
                      #{rank}
                    </Badge>
                  ) : (
                    <span className="w-6 shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">
                    {entry.shortName}
                  </span>
                </div>

                {/* Metric cells */}
                {metrics.map((m) => {
                  const val = entry.values[m.key] ?? 0;
                  const cat = getCategory(val, m);
                  return (
                    <div
                      key={m.key}
                      className={`col-span-${m.colSpan || 2} text-right text-sm tabular-nums ${VALUE_COLORS[cat]}`}
                    >
                      {isBaseline && m.key !== metrics[metrics.length - 1]?.key
                        ? '\u2014'
                        : `${m.prefix ?? ''}${m.format(val)}${m.unit}`}
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-3 text-xs pt-1">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">Best</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="text-amber-600 dark:text-amber-400">Average</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <span className="text-red-600 dark:text-red-400">Worst</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function BenchmarksChart({
  benchmarks,
  metrics,
  radarDimensions,
  labels = {},
  primaryMetricKey,
  secondaryMetricKey,
  costMetricKey,
  defaultRadarIds,
  metricCards,
  conclusions,
  savingsBanner,
  colorPalette,
}: BenchmarksChartProps) {
  // Derived metric lookups
  const primaryMetric = useMemo(
    () =>
      metrics.find((m) => m.key === primaryMetricKey) ??
      metrics[0],
    [metrics, primaryMetricKey],
  );
  const secondaryMetric = useMemo(
    () =>
      metrics.find((m) => m.key === secondaryMetricKey) ??
      metrics[1],
    [metrics, secondaryMetricKey],
  );
  const costMetric = useMemo(
    () =>
      metrics.find((m) => m.key === costMetricKey) ??
      metrics[metrics.length - 1],
    [metrics, costMetricKey],
  );

  // Color map
  const colorMap = useMemo(
    () => buildColorMap(benchmarks, colorPalette),
    [benchmarks, colorPalette],
  );

  // Auto-generate metric cards if not provided
  const cards = useMemo<MetricCardConfig[]>(() => {
    if (metricCards) return metricCards;
    const icons: LucideIcon[] = [TrendingDown, Clock, Star, DollarSign];
    const colorClasses = [
      'text-emerald-500',
      'text-amber-500',
      'text-cyan-500',
      'text-teal-500',
    ];
    return metrics.slice(0, 4).map((m, i) => ({
      icon: icons[i % icons.length],
      label: m.label,
      metricKey: m.key,
      higherIsBetter: m.higherIsBetter,
      format: (v: number) => `${m.prefix ?? ''}${m.format(v)}${m.unit}`,
      colorClass: colorClasses[i % colorClasses.length],
    }));
  }, [metricCards, metrics]);

  // Compute best entries for metric cards
  const bestEntries = useMemo(() => {
    const nonBaseline = benchmarks.filter((b) => !b.isBaseline);
    const map = new Map<string, BenchmarkEntry>();
    for (const card of cards) {
      map.set(
        card.metricKey,
        findBest(nonBaseline, card.metricKey, card.higherIsBetter),
      );
    }
    return map;
  }, [benchmarks, cards]);

  // Label defaults
  const lbl = {
    title: labels.title ?? 'Benchmarks Overview',
    description:
      labels.description ??
      `Comparing ${benchmarks.filter((b) => !b.isBaseline).length} items across key metrics`,
    badgeText: labels.badgeText ?? `${benchmarks.length} items`,
    primaryChartDesc:
      labels.primaryChartDesc ?? 'Ranked by performance (higher is better)',
    secondaryChartDesc:
      labels.secondaryChartDesc ?? 'Ranked by response overhead (lower is better)',
    radarChartDesc:
      labels.radarChartDesc ??
      `${radarDimensions.length} parameters: ${radarDimensions.map((d) => d.label).join(', ')}`,
    costChartDesc:
      labels.costChartDesc ?? 'Comparison of costs at average load',
    tableHint:
      labels.tableHint ?? 'Click a column header to sort. Green = best value.',
    conclusionTitle: labels.conclusionTitle ?? 'Key Takeaways',
    tabPrimary: labels.tabPrimary ?? 'Performance',
    tabPrimaryShort: labels.tabPrimaryShort ?? 'Perf',
    tabSecondary: labels.tabSecondary ?? 'Latency',
    tabSecondaryShort: labels.tabSecondaryShort ?? 'Ms',
    tabRadar: labels.tabRadar ?? 'Radar',
    tabRadarShort: labels.tabRadarShort ?? 'Radar',
    tabCost: labels.tabCost ?? 'Cost',
    tabCostShort: labels.tabCostShort ?? '$',
    tabTable: labels.tabTable ?? 'Table',
    tabTableShort: labels.tabTableShort ?? '#',
  };

  return (
    <Card className="border-2">
      {/* Header */}
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BarChart3 className="h-5 w-5 text-primary shrink-0" />
              <span>{lbl.title}</span>
            </CardTitle>
            <CardDescription className="mt-1.5">
              {lbl.description}
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="shrink-0 bg-primary/10 text-primary border-0"
          >
            {lbl.badgeText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1. Summary metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((card) => {
            const best = bestEntries.get(card.metricKey);
            const val = best?.values[card.metricKey] ?? 0;
            return (
              <MetricCard
                key={card.metricKey}
                icon={card.icon}
                label={card.label}
                value={card.format ? card.format(val) : `${val}`}
                subtext={best?.name ?? '-'}
                colorClass={card.colorClass}
              />
            );
          })}
        </div>

        <Separator />

        {/* 2. Tabbed charts */}
        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 mb-5">
            <TabsTrigger
              value="primary"
              className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lbl.tabPrimary}</span>
              <span className="sm:hidden">{lbl.tabPrimaryShort}</span>
            </TabsTrigger>
            <TabsTrigger
              value="secondary"
              className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <Gauge className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lbl.tabSecondary}</span>
              <span className="sm:hidden">{lbl.tabSecondaryShort}</span>
            </TabsTrigger>
            <TabsTrigger
              value="radar"
              className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lbl.tabRadar}</span>
              <span className="sm:hidden">{lbl.tabRadarShort}</span>
            </TabsTrigger>
            <TabsTrigger
              value="cost"
              className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lbl.tabCost}</span>
              <span className="sm:hidden">{lbl.tabCostShort}</span>
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lbl.tabTable}</span>
              <span className="sm:hidden">{lbl.tabTableShort}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="primary">
            {primaryMetric && (
              <PrimaryMetricChart
                benchmarks={benchmarks}
                metric={primaryMetric}
                colorMap={colorMap}
                description={lbl.primaryChartDesc}
              />
            )}
          </TabsContent>

          <TabsContent value="secondary">
            {secondaryMetric && (
              <SecondaryMetricChart
                benchmarks={benchmarks}
                metric={secondaryMetric}
                colorMap={colorMap}
                description={lbl.secondaryChartDesc}
              />
            )}
          </TabsContent>

          <TabsContent value="radar">
            <RadarChart
              benchmarks={benchmarks}
              dimensions={radarDimensions}
              colorMap={colorMap}
              description={lbl.radarChartDesc}
              defaultVisibleIds={defaultRadarIds}
            />
          </TabsContent>

          <TabsContent value="cost">
            {costMetric && (
              <CostMetricChart
                benchmarks={benchmarks}
                metric={costMetric}
                colorMap={colorMap}
                description={lbl.costChartDesc}
                savingsBanner={savingsBanner}
              />
            )}
          </TabsContent>

          <TabsContent value="table">
            <ComparisonTable
              benchmarks={benchmarks}
              metrics={metrics}
              colorMap={colorMap}
              hint={lbl.tableHint}
            />
          </TabsContent>
        </Tabs>

        <Separator />

        {/* 3. Conclusions */}
        {conclusions && conclusions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg bg-muted/40 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" />
              {lbl.conclusionTitle}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              {conclusions.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">{c.title}</strong> — {c.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
