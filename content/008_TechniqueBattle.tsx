'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Trophy,
  Zap,
  Shield,
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  ChevronDown,
  Play,
  RotateCcw,
  History,
  Crown,
  Medal,
  Timer,
  DollarSign,
  Gauge,
  Star,
  Layers,
  Database,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  SkipForward,
  Activity,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

// ════════════════════════════════════════════════════════════════
//  Exported Interfaces
// ════════════════════════════════════════════════════════════════

/** A single item that can be selected for battle. */
export interface BattleItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  badges: BattleItemBadge[];
  /** 0-100 complexity rating displayed as stars. */
  complexity?: number;
}

/** Badge shown on an item card (e.g. "75% savings", "Vector DB"). */
export interface BattleItemBadge {
  icon?: React.ReactNode;
  label: string;
  variant?: 'outline' | 'secondary';
}

/** Scenario parameters as arbitrary key-value pairs. */
export type BattleScenario = Record<string, string | number>;

/** Computed metrics for a single item. Arbitrary numeric key-value. */
export type BattleMetrics = Record<string, number>;

/** Result of a single battle comparison. */
export interface BattleResult {
  leftId: string;
  rightId: string;
  leftScore: number;
  rightScore: number;
  winner: 'left' | 'right' | 'tie';
  leftMetrics: BattleMetrics;
  rightMetrics: BattleMetrics;
  timestamp: Date;
}

/** A single entry in battle history. */
export interface BattleHistoryEntry {
  id: string;
  leftId: string;
  rightId: string;
  leftName: string;
  rightName: string;
  winner: 'left' | 'right' | 'tie';
  winnerName: string;
  timestamp: Date;
}

/** Configuration for a stat shown in the result panel (animated counter). */
export interface ResultStatConfig {
  /** Key into BattleMetrics. */
  key: string;
  icon: React.ReactNode;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/** Configuration for a progress-bar metric in the result panel. */
export interface BarMetricConfig {
  /** Key into BattleMetrics (value treated as 0-100 percentage). */
  key: string;
  label: string;
}

/** Configuration for a radar-chart dimension. */
export interface RadarDimensionConfig {
  key: string;
  label: string;
  /** Optional transform (e.g. invert latency to a "speed" score). */
  transform?: (value: number) => number;
}

/** Configuration for a detailed comparison row. */
export interface ComparisonRowConfig {
  key: string;
  label: string;
  lowerBetter?: boolean;
  unit?: string;
  transform?: (value: number) => number;
}

/** A field in the scenario configuration panel. */
export interface ScenarioFieldConfig {
  key: string;
  label: string;
  type: 'select' | 'slider';
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

/** A quick-preset battle pair. */
export interface BattlePreset {
  leftId: string;
  rightId: string;
  label: string;
  description: string;
}

/** Configuration for the cost-over-time bar chart. */
export interface CostTimeConfig {
  periods: { label: string; multiplier: number }[];
  metricKey: string;
  formatValue: (value: number) => string;
  title: string;
}

/** Configuration for the donut chart. */
export interface DonutConfig {
  metricKey: string;
  totalLabel: string;
}

/** Overridable UI labels. */
export interface BattleLabels {
  title: string;
  subtitle: string;
  arena: string;
  results: string;
  details: string;
  history: string;
  leftFighter: string;
  rightFighter: string;
  selectFighters: string;
  scenarioParams: string;
  startBattle: string;
  battling: string;
  newBattle: string;
  quickBattles: string;
  tournamentMode: string;
  tournament: string;
  stop: string;
  allItems: string;
  winner: string;
  tie: string;
  selectDifferent: string;
  noBattlesYet: string;
  goArena: string;
  clearHistory: string;
  clickToReplay: string;
  runBattleFirst: string;
  battleForDetails: string;
  satisfaction: string;
  contextUsage: string;
  detailedComparison: string;
  metric: string;
  left: string;
  right: string;
  battle: string;
  battleHistory: string;
  messages: string;
}

/** Props for the main TechniqueBattle component. */
export interface TechniqueBattleProps {
  // ── Required ──
  items: BattleItem[];
  computeMetrics: (itemId: string, scenario: BattleScenario) => BattleMetrics;
  scoreMetrics: (metrics: BattleMetrics) => number;

  // ── Result display ──
  resultStats?: ResultStatConfig[];
  barMetrics?: BarMetricConfig[];
  radarDimensions?: RadarDimensionConfig[];
  comparisonRows?: ComparisonRowConfig[];

  // ── Scenario ──
  scenarioFields?: ScenarioFieldConfig[];
  initialScenario?: BattleScenario;

  // ── Presets & tournament ──
  presets?: BattlePreset[];
  tournamentPairs?: [string, string][];

  // ── Optional charts ──
  costTimeConfig?: CostTimeConfig;
  donutConfig?: DonutConfig;

  // ── Display overrides ──
  title?: string;
  subtitle?: string;
  leftColor?: string;
  rightColor?: string;
  labels?: Partial<BattleLabels>;
}

// ════════════════════════════════════════════════════════════════
//  Default Labels
// ════════════════════════════════════════════════════════════════

const DEFAULT_LABELS: BattleLabels = {
  title: 'Battle Arena',
  subtitle: 'Compare items head-to-head and find the winner',
  arena: 'Arena',
  results: 'Results',
  details: 'Details',
  history: 'History',
  leftFighter: 'Left fighter',
  rightFighter: 'Right fighter',
  selectFighters: 'Select fighters',
  scenarioParams: 'Scenario parameters',
  startBattle: 'Start battle!',
  battling: 'Battle in progress...',
  newBattle: 'New battle',
  quickBattles: 'Quick battles',
  tournamentMode: 'Tournament mode',
  tournament: 'Tournament',
  stop: 'Stop',
  allItems: 'All items',
  winner: 'Winner!',
  tie: 'Tie!',
  selectDifferent: 'Select different items to battle',
  noBattlesYet: 'No battles yet',
  goArena: 'Go to the arena to start',
  clearHistory: 'Clear',
  clickToReplay: 'Click on a battle to replay its configuration',
  runBattleFirst: 'Run a battle first to see results',
  battleForDetails: 'Run a battle to view details',
  satisfaction: 'Satisfaction',
  contextUsage: 'Context usage',
  detailedComparison: 'Detailed comparison',
  metric: 'Metric',
  left: 'Left',
  right: 'Right',
  battle: 'Battle',
  battleHistory: 'Battle history',
  messages: 'messages',
};

// ════════════════════════════════════════════════════════════════
//  Helper Functions
// ════════════════════════════════════════════════════════════════

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return Math.round(num).toLocaleString('en-US');
}

function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

function renderStars(count: number, max: number = 100): React.ReactNode {
  const filled = Math.round((count / max) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

function determineBattleWinner(
  left: BattleMetrics,
  right: BattleMetrics,
  scoreFn: (m: BattleMetrics) => number
): { winner: 'left' | 'right' | 'tie'; leftScore: number; rightScore: number } {
  const lScore = scoreFn(left);
  const rScore = scoreFn(right);
  const diff = Math.abs(lScore - rScore);
  if (diff < 2) return { winner: 'tie', leftScore: lScore, rightScore: rScore };
  return { winner: lScore > rScore ? 'left' : 'right', leftScore: lScore, rightScore: rScore };
}

// ════════════════════════════════════════════════════════════════
//  Animated Number Counter
// ════════════════════════════════════════════════════════════════

function AnimatedCounter({ target, prefix = '', suffix = '', decimals = 0, duration = 1200 }: {
  target: number; prefix?: string; suffix?: string; decimals?: number; duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const prevTarget = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevTarget.current;
    const startTime = performance.now();
    const diff = target - start;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <span className="font-mono tabular-nums counter-glow">
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════
//  Battle Item Selector Card
// ════════════════════════════════════════════════════════════════

function BattleItemCard({ item, side, selected, onSelect, leftColor, rightColor }: {
  item: BattleItem; side: 'left' | 'right'; selected: boolean; onSelect: (id: string) => void;
  leftColor: string; rightColor: string;
}) {
  const sideColor = side === 'left' ? leftColor : rightColor;
  const borderColor = selected
    ? side === 'left' ? 'border-emerald-500/60' : 'border-violet-500/60'
    : 'border-transparent';
  const glowClass = selected
    ? side === 'left' ? 'neon-glow-emerald' : 'neon-glow-violet'
    : '';

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 glass-card hover-lift card-shine ${borderColor} ${glowClass}`}
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <span style={{ color: item.color }}>{item.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {item.badges.map((badge, i) => (
            <Badge key={i} variant={badge.variant || 'outline'} className="micro-text px-1.5 py-0">
              {badge.icon}{badge.label}
            </Badge>
          ))}
        </div>
        {item.complexity != null && <div>{renderStars(item.complexity)}</div>}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
//  VS Badge
// ════════════════════════════════════════════════════════════════

function VsBadge({ animate = false }: { animate?: boolean }) {
  return (
    <motion.div
      className="relative flex h-16 w-16 shrink-0 items-center justify-center"
      animate={animate ? {
        scale: [1, 1.3, 1],
        rotate: [0, 5, -5, 0],
      } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-violet-500/20 pulse-ring" />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-violet-600 shadow-lg">
        <span className="text-lg font-black text-white tracking-tighter">VS</span>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Result Panel
// ════════════════════════════════════════════════════════════════

function ResultPanel({ item, metrics, side, isWinner, isTie, animateIn, statConfigs, barConfigs, labels }: {
  item: BattleItem; metrics: BattleMetrics; side: 'left' | 'right';
  isWinner: boolean; isTie: boolean; animateIn: boolean;
  statConfigs: ResultStatConfig[]; barConfigs: BarMetricConfig[]; labels: BattleLabels;
}) {
  const dimClass = !isWinner && !isTie ? 'opacity-60' : '';
  const glowClass = isWinner ? (side === 'left' ? 'neon-glow-emerald' : 'neon-glow-violet') : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -40 : 40 }}
      animate={animateIn ? { opacity: dimClass ? 0.6 : 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: side === 'right' ? 0.2 : 0 }}
      className={`flex-1 ${dimClass} ${glowClass} rounded-xl border border-border/50 p-4 glass-card`}
    >
      {isWinner && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.6 }}
          className="mb-3 flex items-center gap-2"
        >
          <Trophy className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-bold text-amber-400">{labels.winner}</span>
          <motion.div
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {['✨', '✨', '✨'].map((s, i) => (
              <motion.span
                key={i}
                className="text-amber-400"
                animate={{ y: [0, -8, 0], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
              >
                {s}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
      {isTie && (
        <div className="mb-3 flex items-center gap-2">
          <Medal className="h-5 w-5 text-sky-400" />
          <span className="text-sm font-bold text-sky-400">{labels.tie}</span>
        </div>
      )}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <span style={{ color: item.color }}>{item.icon}</span>
        </div>
        <span className="font-bold text-sm">{item.name}</span>
      </div>
      <div className="space-y-3">
        {statConfigs.map((stat) => (
          <div key={stat.key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {stat.icon}
              <span className="text-xs">{stat.label}</span>
            </div>
            <span className="text-sm font-semibold">
              <AnimatedCounter
                target={metrics[stat.key] ?? 0}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals ?? 0}
              />
            </span>
          </div>
        ))}
        <div className="space-y-1.5">
          {barConfigs.map((bar, i) => (
            <MetricBar
              key={bar.key}
              label={bar.label}
              value={metrics[bar.key] ?? 0}
              color={side === 'left' ? 'emerald' : 'violet'}
              delay={0.3 + i * 0.1}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Metric Bar
// ════════════════════════════════════════════════════════════════

function MetricBar({ label, value, color, delay = 0 }: {
  label: string; value: number; color: 'emerald' | 'violet'; delay?: number;
}) {
  const gradient = color === 'emerald'
    ? 'from-emerald-500 to-teal-400'
    : 'from-violet-500 to-purple-400';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Detailed Comparison Row
// ════════════════════════════════════════════════════════════════

function ComparisonRow({ label, leftVal, rightVal, lowerBetter = false, unit = '', delay = 0 }: {
  label: string; leftVal: number; rightVal: number; lowerBetter?: boolean; unit?: string; delay?: number;
}) {
  const maxVal = Math.max(leftVal, rightVal, 1);
  const leftWins = lowerBetter ? leftVal <= rightVal : leftVal >= rightVal;
  const rightWins = lowerBetter ? rightVal <= leftVal : rightVal >= leftVal;
  const isTie = Math.abs(leftVal - rightVal) < 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {isTie ? (
          <Badge variant="secondary" className="micro-text px-1.5 py-0">
            <span className="text-sky-400">=</span> Tie
          </Badge>
        ) : (
          <Badge variant="outline" className="micro-text px-1.5 py-0">
            {leftWins ? (
              <><CheckCircle2 className="h-3 w-3 mr-0.5 text-emerald-500" />{formatNumber(leftVal)}{unit}</>
            ) : (
              <><span className="text-muted-foreground mr-0.5">{formatNumber(leftVal)}{unit}</span></>
            )}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${(leftVal / maxVal) * 100}%` }}
            transition={{ duration: 0.6, delay: delay + 0.1 }}
          />
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="ml-auto h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${(rightVal / maxVal) * 100}%` }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
            style={{ float: 'right' }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-medium ${leftWins && !isTie ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
          {formatNumber(leftVal)}{unit}
        </span>
        <span className={`text-[11px] font-medium ${rightWins && !isTie ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}`}>
          {formatNumber(rightVal)}{unit}
        </span>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Radar Chart (SVG)
// ════════════════════════════════════════════════════════════════

function RadarChart({ leftMetrics, rightMetrics, dimensions, labels }: {
  leftMetrics: BattleMetrics; rightMetrics: BattleMetrics;
  dimensions: RadarDimensionConfig[]; labels: BattleLabels;
}) {
  if (dimensions.length === 0) return null;

  const dimData = dimensions.map(d => ({
    label: d.label,
    left: d.transform ? d.transform(leftMetrics[d.key] ?? 0) : (leftMetrics[d.key] ?? 0),
    right: d.transform ? d.transform(rightMetrics[d.key] ?? 0) : (rightMetrics[d.key] ?? 0),
  }));

  const cx = 150;
  const cy = 130;
  const maxR = 90;
  const n = dimData.length;
  const angleStep = (Math.PI * 2) / n;

  function getPoint(index: number, value: number): string {
    const angle = angleStep * index - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, value)) / 100) * maxR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }

  const leftPoints = dimData.map((d, i) => getPoint(i, d.left)).join(' ');
  const rightPoints = dimData.map((d, i) => getPoint(i, d.right)).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 280" className="w-full max-w-xs">
        {/* Grid */}
        {[20, 40, 60, 80, 100].map((pct) => {
          const r = (pct / 100) * maxR;
          const pts = Array.from({ length: n }, (_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          }).join(' ');
          return <polygon key={pct} points={pts} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />;
        })}
        {/* Axes */}
        {Array.from({ length: n }, (_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)}
              stroke="currentColor" strokeOpacity={0.1} strokeWidth={1}
            />
          );
        })}
        {/* Labels */}
        {dimData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const lx = cx + (maxR + 22) * Math.cos(angle);
          const ly = cy + (maxR + 22) * Math.sin(angle);
          return (
            <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground micro-text">
              {d.label}
            </text>
          );
        })}
        {/* Right area (violet, behind) */}
        <motion.polygon
          points={rightPoints}
          fill="oklch(0.55 0.22 280 / 0.15)"
          stroke="oklch(0.55 0.22 280)"
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        {/* Left area (emerald, on top) */}
        <motion.polygon
          points={leftPoints}
          fill="oklch(0.7 0.17 160 / 0.15)"
          stroke="oklch(0.7 0.17 160)"
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
        {/* Left dots */}
        {dimData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (Math.max(0, Math.min(100, d.left)) / 100) * maxR;
          return (
            <motion.circle
              key={`ld-${i}`}
              cx={cx + r * Math.cos(angle)}
              cy={cy + r * Math.sin(angle)}
              r={4}
              fill="oklch(0.7 0.17 160)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            />
          );
        })}
        {/* Right dots */}
        {dimData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (Math.max(0, Math.min(100, d.right)) / 100) * maxR;
          return (
            <motion.circle
              key={`rd-${i}`}
              cx={cx + r * Math.cos(angle)}
              cy={cy + r * Math.sin(angle)}
              r={4}
              fill="oklch(0.55 0.22 280)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span className="text-muted-foreground">{labels.left}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-violet-500" />
          <span className="text-muted-foreground">{labels.right}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Cost / Time Bar Chart
// ════════════════════════════════════════════════════════════════

function CostTimeChart({ leftMetrics, rightMetrics, config }: {
  leftMetrics: BattleMetrics; rightMetrics: BattleMetrics; config: CostTimeConfig;
}) {
  const maxCost = Math.max(
    ...config.periods.map(p => (leftMetrics[config.metricKey] ?? 0) * p.multiplier),
    ...config.periods.map(p => (rightMetrics[config.metricKey] ?? 0) * p.multiplier),
    1
  );

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-center">{config.title}</h4>
      {config.periods.map((period, pi) => {
        const leftCost = (leftMetrics[config.metricKey] ?? 0) * period.multiplier;
        const rightCost = (rightMetrics[config.metricKey] ?? 0) * period.multiplier;
        return (
          <div key={period.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{period.label}</span>
              <div className="flex gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{config.formatValue(leftCost)}</span>
                <span className="text-violet-600 dark:text-violet-400 font-medium">{config.formatValue(rightCost)}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
                <motion.div
                  className="h-full rounded bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(leftCost / maxCost) * 100}%` }}
                  transition={{ duration: 0.6, delay: pi * 0.15 }}
                />
              </div>
              <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
                <motion.div
                  className="ml-auto h-full rounded bg-gradient-to-r from-violet-500 to-purple-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(rightCost / maxCost) * 100}%` }}
                  transition={{ duration: 0.6, delay: pi * 0.15 + 0.05 }}
                  style={{ float: 'right' }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Donut Chart
// ════════════════════════════════════════════════════════════════

function DonutChart({ leftMetrics, rightMetrics, leftName, rightName, config }: {
  leftMetrics: BattleMetrics; rightMetrics: BattleMetrics;
  leftName: string; rightName: string; config: DonutConfig;
}) {
  const leftVal = leftMetrics[config.metricKey] ?? 0;
  const rightVal = rightMetrics[config.metricKey] ?? 0;
  const total = leftVal + rightVal || 1;
  const leftPct = (leftVal / total) * 100;
  const rightPct = (rightVal / total) * 100;

  const r = 60;
  const circumference = 2 * Math.PI * r;
  const leftLen = (leftPct / 100) * circumference;
  const rightLen = (rightPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <h4 className="text-sm font-semibold text-center">{config.totalLabel}</h4>
      <div className="relative">
        <svg viewBox="0 0 160 160" className="w-40 h-40">
          <circle cx="80" cy="80" r={r} fill="none" stroke="currentColor" strokeOpacity={0.06} strokeWidth={20} />
          <motion.circle
            cx="80" cy="80" r={r}
            fill="none"
            stroke="oklch(0.7 0.17 160)"
            strokeWidth={20}
            strokeDasharray={`${leftLen} ${circumference}`}
            strokeDashoffset={0}
            transform="rotate(-90 80 80)"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${leftLen} ${circumference}` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.circle
            cx="80" cy="80" r={r}
            fill="none"
            stroke="oklch(0.55 0.22 280)"
            strokeWidth={20}
            strokeDasharray={`${rightLen} ${circumference}`}
            strokeDashoffset={-leftLen}
            transform="rotate(-90 80 80)"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${rightLen} ${circumference}` }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{formatNumber(total)}</span>
          <span className="micro-text text-muted-foreground">total</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span className="text-muted-foreground">{leftName}: {leftPct.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-violet-500" />
          <span className="text-muted-foreground">{rightName}: {rightPct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Confetti Particles
// ════════════════════════════════════════════════════════════════

function ConfettiBurst({ show }: { show: boolean }) {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: -(Math.random() * 60 + 20),
      rotate: Math.random() * 360,
      color: ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'][i % 6],
      size: Math.random() * 6 + 4,
    })),
    []
  );

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-1/2"
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y + 80,
                opacity: 0,
                rotate: p.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <div
                className="rounded-sm"
                style={{ width: p.size, height: p.size, backgroundColor: p.color }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ════════════════════════════════════════════════════════════════
//  Winner Banner (shared between arena and results tab)
// ════════════════════════════════════════════════════════════════

function WinnerBanner({ result, leftItem, rightItem, labels }: {
  result: BattleResult; leftItem: BattleItem; rightItem: BattleItem; labels: BattleLabels;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-4 text-center"
    >
      {result.winner === 'tie' ? (
        <div className="flex items-center justify-center gap-2">
          <Medal className="h-6 w-6 text-sky-400" />
          <span className="text-lg font-bold text-sky-500">{labels.tie}</span>
          <Medal className="h-6 w-6 text-sky-400" />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-amber-400" />
          <span className="text-lg font-bold">
            {result.winner === 'left' ? leftItem.name : rightItem.name}
          </span>
          <span className="text-lg font-bold text-amber-500">wins!</span>
        </div>
      )}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════════════════════

export default function TechniqueBattle({
  items,
  computeMetrics,
  scoreMetrics,
  resultStats = [],
  barMetrics = [],
  radarDimensions = [],
  comparisonRows = [],
  scenarioFields = [],
  initialScenario = {},
  presets = [],
  tournamentPairs = [],
  costTimeConfig,
  donutConfig,
  title,
  subtitle,
  leftColor,
  rightColor,
  labels: labelOverrides,
}: TechniqueBattleProps) {
  // ── Resolved labels ──
  const L = useMemo<BattleLabels>(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);

  // ── Resolved default item IDs ──
  const defaultLeft = items[0]?.id ?? '';
  const defaultRight = items.length > 1 ? items[1].id : defaultLeft;

  // ── State ──
  const [leftId, setLeftId] = useState(defaultLeft);
  const [rightId, setRightId] = useState(defaultRight);
  const [scenario, setScenario] = useState<BattleScenario>(initialScenario);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [battleHistory, setBattleHistory] = useState<BattleHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState('arena');
  const [showConfetti, setShowConfetti] = useState(false);
  const [tournamentMode, setTournamentMode] = useState(false);
  const [tournamentStep, setTournamentStep] = useState(0);
  const [leftDropdownOpen, setLeftDropdownOpen] = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const battleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Item lookups ──
  const leftItem = useMemo(() => items.find(i => i.id === leftId) ?? items[0], [items, leftId]);
  const rightItem = useMemo(() => items.find(i => i.id === rightId) ?? items[items.length - 1], [items, rightId]);

  // ── Handlers ──
  const runBattle = useCallback((lId: string, rId: string, scen: BattleScenario) => {
    if (isBattling || lId === rId) return;

    setIsBattling(true);
    setShowResults(false);
    setShowConfetti(false);
    setActiveTab('results');

    setTimeout(() => {
      const leftMetrics = computeMetrics(lId, scen);
      const rightMetrics = computeMetrics(rId, scen);
      const { winner, leftScore, rightScore } = determineBattleWinner(leftMetrics, rightMetrics, scoreMetrics);

      const result: BattleResult = {
        leftId: lId, rightId: rId, leftScore, rightScore, winner,
        leftMetrics, rightMetrics,
        timestamp: new Date(),
      };
      setBattleResult(result);
      setShowResults(true);
      setIsBattling(false);

      if (winner !== 'tie') {
        setTimeout(() => setShowConfetti(true), 400);
        setTimeout(() => setShowConfetti(false), 2500);
      }

      const lName = items.find(i => i.id === lId)?.name ?? lId;
      const rName = items.find(i => i.id === rId)?.name ?? rId;
      const winnerName = winner === 'tie' ? L.tie : (winner === 'left' ? lName : rName);

      setBattleHistory(prev => {
        const entry: BattleHistoryEntry = {
          id: `${Date.now()}`,
          leftId: lId, rightId: rId,
          leftName: lName, rightName: rName,
          winner, winnerName,
          timestamp: new Date(),
        };
        return [entry, ...prev.slice(0, 9)];
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }, 1200);
  }, [isBattling, computeMetrics, scoreMetrics, items, L.tie]);

  const handleRunBattle = useCallback(() => {
    runBattle(leftId, rightId, scenario);
  }, [runBattle, leftId, rightId, scenario]);

  const resetBattle = useCallback(() => {
    setBattleResult(null);
    setShowResults(false);
    setShowConfetti(false);
    setTournamentMode(false);
    setTournamentStep(0);
    if (battleTimeoutRef.current) clearTimeout(battleTimeoutRef.current);
    setActiveTab('arena');
  }, []);

  const replayBattle = useCallback((entry: BattleHistoryEntry) => {
    setLeftId(entry.leftId);
    setRightId(entry.rightId);
    setBattleResult(null);
    setShowResults(false);
    setShowConfetti(false);
    setActiveTab('arena');
  }, []);

  const runPreset = useCallback((preset: BattlePreset) => {
    setLeftId(preset.leftId);
    setRightId(preset.rightId);
    setBattleResult(null);
    setShowResults(false);
    setActiveTab('arena');
  }, []);

  const startTournament = useCallback(() => {
    if (tournamentPairs.length === 0) return;
    setTournamentMode(true);
    setTournamentStep(0);
    setBattleResult(null);
    setShowResults(false);
    setActiveTab('results');
  }, [tournamentPairs]);

  // ── Tournament Mode ──
  useEffect(() => {
    if (!tournamentMode || tournamentPairs.length === 0) return;

    if (tournamentStep >= tournamentPairs.length) {
      setTimeout(() => {
        setTournamentMode(false);
        setTournamentStep(0);
        setActiveTab('history');
      }, 0);
      return;
    }

    const [l, r] = tournamentPairs[tournamentStep];
    requestAnimationFrame(() => {
      setLeftId(l);
      setRightId(r);
    });

    battleTimeoutRef.current = setTimeout(() => {
      runBattle(l, r, scenario);
      battleTimeoutRef.current = setTimeout(() => {
        setTournamentStep(prev => prev + 1);
      }, 2500);
    }, 800);

    return () => {
      if (battleTimeoutRef.current) clearTimeout(battleTimeoutRef.current);
    };
  }, [tournamentMode, tournamentStep, tournamentPairs, scenario, runBattle]);

  // ── Dropdown click-away ──
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-dropdown]')) {
        setLeftDropdownOpen(false);
        setRightDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Resolved display configs ──
  const statConfigs: ResultStatConfig[] = resultStats.length > 0 ? resultStats : (
    battleResult ? Object.keys(battleResult.leftMetrics).slice(0, 4).map(key => ({
      key,
      icon: <BarChart3 className="h-4 w-4" />,
      label: key,
    })) : []
  );
  const barConfigs: BarMetricConfig[] = barMetrics.length > 0 ? barMetrics : [];
  const radarConfigs: RadarDimensionConfig[] = radarDimensions.length > 0 ? radarDimensions : [];
  const comparisonConfigs: ComparisonRowConfig[] = comparisonRows.length > 0 ? comparisonRows : [];

  const hasCharts = radarConfigs.length > 0 || costTimeConfig != null || donutConfig != null;

  // ── Render ──
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl orb-1" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl orb-2" />

      <div className="relative p-4 sm:p-6 lg:p-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold animated-gradient-text">{title ?? L.title}</h2>
              <p className="text-xs text-muted-foreground">{subtitle ?? L.subtitle}</p>
            </div>
          </div>
          {tournamentMode && (
            <Badge className="w-fit text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              {L.tournament}: {tournamentStep + 1}/{tournamentPairs.length}
            </Badge>
          )}
        </motion.div>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="arena">
              <Swords className="h-4 w-4 mr-1.5" />
              {L.arena}
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!showResults}>
              <Trophy className="h-4 w-4 mr-1.5" />
              {L.results}
            </TabsTrigger>
            {hasCharts && (
              <TabsTrigger value="details" disabled={!showResults}>
                <BarChart3 className="h-4 w-4 mr-1.5" />
                {L.details}
              </TabsTrigger>
            )}
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1.5" />
              {L.history}
            </TabsTrigger>
          </TabsList>

          {/* ══════ TAB: Arena ══════ */}
          <TabsContent value="arena" className="space-y-6">
            {/* Item Selector */}
            <div>
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                {L.selectFighters}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {/* Left Fighter */}
                <div>
                  <p className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> {L.leftFighter}
                  </p>
                  <div data-dropdown className="relative">
                    <button
                      className="w-full flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm hover:bg-emerald-500/10 transition-colors"
                      onClick={() => { setLeftDropdownOpen(!leftDropdownOpen); setRightDropdownOpen(false); }}
                    >
                      <span style={{ color: leftItem.color }}>{leftItem.icon}</span>
                      <span className="font-medium">{leftItem.name}</span>
                      <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                    </button>
                    <AnimatePresence>
                      {leftDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card p-2 shadow-xl max-h-80 overflow-y-auto scrollbar-thin"
                        >
                          <div className="space-y-2 stagger-scale-in">
                            {items.map(item => (
                              <BattleItemCard
                                key={item.id}
                                item={item}
                                side="left"
                                selected={leftId === item.id}
                                onSelect={(id) => { setLeftId(id); setLeftDropdownOpen(false); }}
                                leftColor={leftColor ?? '#10b981'}
                                rightColor={rightColor ?? '#8b5cf6'}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* VS Badge */}
                <div className="flex justify-center py-2 md:py-0">
                  <VsBadge />
                </div>

                {/* Right Fighter */}
                <div>
                  <p className="mb-2 text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> {L.rightFighter}
                  </p>
                  <div data-dropdown className="relative">
                    <button
                      className="w-full flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/5 px-3 py-2 text-sm hover:bg-violet-500/10 transition-colors"
                      onClick={() => { setRightDropdownOpen(!rightDropdownOpen); setLeftDropdownOpen(false); }}
                    >
                      <span style={{ color: rightItem.color }}>{rightItem.icon}</span>
                      <span className="font-medium">{rightItem.name}</span>
                      <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                    </button>
                    <AnimatePresence>
                      {rightDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card p-2 shadow-xl max-h-80 overflow-y-auto scrollbar-thin"
                        >
                          <div className="space-y-2 stagger-scale-in">
                            {items.map(item => (
                              <BattleItemCard
                                key={item.id}
                                item={item}
                                side="right"
                                selected={rightId === item.id}
                                onSelect={(id) => { setRightId(id); setRightDropdownOpen(false); }}
                                leftColor={leftColor ?? '#10b981'}
                                rightColor={rightColor ?? '#8b5cf6'}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario Configuration */}
            {scenarioFields.length > 0 && (
              <Card className="py-4">
                <CardContent className="space-y-5">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-sky-500" />
                    {L.scenarioParams}
                  </h3>

                  {scenarioFields.map((field) => {
                    if (field.type === 'select' && field.options) {
                      const currentVal = scenario[field.key];
                      return (
                        <div key={field.key}>
                          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{field.label}</label>
                          <div className="flex flex-wrap gap-2">
                            {field.options.map(opt => (
                              <button
                                key={String(opt.value)}
                                onClick={() => setScenario(s => ({ ...s, [field.key]: opt.value }))}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                  currentVal === opt.value
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (field.type === 'slider') {
                      const numVal = Number(scenario[field.key] ?? field.min ?? 0);
                      const fmt = field.formatValue ?? formatNumber;
                      return (
                        <div key={field.key}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                            <span className="text-xs font-semibold">{fmt(numVal)}{field.unit ? ` ${field.unit}` : ''}</span>
                          </div>
                          <Slider
                            value={[numVal]}
                            onValueChange={([v]) => setScenario(s => ({ ...s, [field.key]: v }))}
                            min={field.min ?? 0}
                            max={field.max ?? 100}
                            step={field.step ?? 1}
                          />
                          <div className="mt-1 flex justify-between micro-text text-muted-foreground">
                            <span>{fmt(field.min ?? 0)}</span>
                            <span>{fmt(field.max ?? 100)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </CardContent>
              </Card>
            )}

            {/* Battle Button */}
            <div className="flex flex-col items-center gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  onClick={handleRunBattle}
                  disabled={isBattling || leftId === rightId}
                  className="glow-button relative gap-2 bg-gradient-to-r from-emerald-600 to-violet-600 text-white hover:from-emerald-500 hover:to-violet-500 px-8 text-base font-bold"
                >
                  {isBattling ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      {L.battling}
                    </>
                  ) : (
                    <>
                      <Swords className="h-5 w-5" />
                      {L.startBattle}
                    </>
                  )}
                </Button>
              </motion.div>
              {leftId === rightId && (
                <p className="text-xs text-destructive">{L.selectDifferent}</p>
              )}
            </div>

            {/* Quick Presets */}
            {(presets.length > 0 || tournamentPairs.length > 0) && (
              <div>
                <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  {L.quickBattles}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {presets.map((preset, i) => (
                    <Button
                      key={preset.leftId + preset.rightId}
                      variant="outline"
                      size="sm"
                      onClick={() => runPreset(preset)}
                      className="h-auto flex-col gap-1 py-3 hover-lift card-shine"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        {i % 3 === 0 ? <Swords className="h-3 w-3 text-emerald-500" /> :
                         i % 3 === 1 ? <Trophy className="h-3 w-3 text-amber-500" /> :
                         <Play className="h-3 w-3 text-cyan-500" />}
                        {preset.label}
                      </div>
                      <span className="micro-text text-muted-foreground">{preset.description}</span>
                    </Button>
                  ))}
                  {tournamentPairs.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startTournament}
                      disabled={tournamentMode}
                      className="h-auto flex-col gap-1 py-3 hover-lift card-shine"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3 text-violet-500" />
                        {L.allItems}
                      </div>
                      <span className="micro-text text-muted-foreground">{L.tournamentMode}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Tournament Progress */}
            <AnimatePresence>
              {tournamentMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="py-4 border-amber-500/30">
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{L.tournamentMode}</span>
                        <Button variant="ghost" size="sm" onClick={resetBattle} className="ml-auto text-xs h-7">
                          <XCircle className="h-3 w-3 mr-1" /> {L.stop}
                        </Button>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-violet-500"
                          animate={{ width: `${((tournamentStep + 1) / tournamentPairs.length) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="mt-1 micro-text text-muted-foreground">
                        {L.battle} {tournamentStep + 1} of {tournamentPairs.length}: {leftItem.name} vs {rightItem.name}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline Results (when battling in arena) */}
            <AnimatePresence>
              {showResults && battleResult && (
                <motion.div
                  ref={resultRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-emerald-500/5 via-transparent to-violet-500/5 p-4"
                >
                  <ConfettiBurst show={showConfetti} />
                  <WinnerBanner result={battleResult} leftItem={leftItem} rightItem={rightItem} labels={L} />

                  {/* Side by Side Results */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <ResultPanel
                      item={leftItem}
                      metrics={battleResult.leftMetrics}
                      side="left"
                      isWinner={battleResult.winner === 'left'}
                      isTie={battleResult.winner === 'tie'}
                      animateIn={true}
                      statConfigs={statConfigs}
                      barConfigs={barConfigs}
                      labels={L}
                    />
                    <div className="hidden sm:flex items-center justify-center">
                      <VsBadge animate={true} />
                    </div>
                    <ResultPanel
                      item={rightItem}
                      metrics={battleResult.rightMetrics}
                      side="right"
                      isWinner={battleResult.winner === 'right'}
                      isTie={battleResult.winner === 'tie'}
                      animateIn={true}
                      statConfigs={statConfigs}
                      barConfigs={barConfigs}
                      labels={L}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={resetBattle}>
                      <RotateCcw className="h-4 w-4 mr-1.5" /> {L.newBattle}
                    </Button>
                    {hasCharts && (
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('details')}>
                        <BarChart3 className="h-4 w-4 mr-1.5" /> {L.details}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ══════ TAB: Results (standalone) ══════ */}
          <TabsContent value="results">
            {battleResult && showResults ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-emerald-500/5 via-transparent to-violet-500/5 p-4">
                  <ConfettiBurst show={showConfetti} />
                  <WinnerBanner result={battleResult} leftItem={leftItem} rightItem={rightItem} labels={L} />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <ResultPanel
                      item={leftItem}
                      metrics={battleResult.leftMetrics}
                      side="left"
                      isWinner={battleResult.winner === 'left'}
                      isTie={battleResult.winner === 'tie'}
                      animateIn={true}
                      statConfigs={statConfigs}
                      barConfigs={barConfigs}
                      labels={L}
                    />
                    <div className="hidden sm:flex items-center justify-center">
                      <VsBadge animate={true} />
                    </div>
                    <ResultPanel
                      item={rightItem}
                      metrics={battleResult.rightMetrics}
                      side="right"
                      isWinner={battleResult.winner === 'right'}
                      isTie={battleResult.winner === 'tie'}
                      animateIn={true}
                      statConfigs={statConfigs}
                      barConfigs={barConfigs}
                      labels={L}
                    />
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={resetBattle}>
                      <RotateCcw className="h-4 w-4 mr-1.5" /> {L.newBattle}
                    </Button>
                    {hasCharts && (
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('details')}>
                        <BarChart3 className="h-4 w-4 mr-1.5" /> {L.details}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Swords className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">{L.runBattleFirst}</p>
              </div>
            )}
          </TabsContent>

          {/* ══════ TAB: Details ══════ */}
          <TabsContent value="details">
            {battleResult && showResults ? (
              <div className="space-y-6">
                {/* Detailed Comparison Table */}
                {comparisonConfigs.length > 0 && (
                  <Card className="py-4">
                    <CardContent>
                      <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        {L.detailedComparison}
                      </h3>

                      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs font-medium text-muted-foreground">
                        <span className="text-emerald-600 dark:text-emerald-400">{leftItem.name}</span>
                        <span className="text-muted-foreground/60">{L.metric}</span>
                        <span className="text-violet-600 dark:text-violet-400">{rightItem.name}</span>
                      </div>

                      <div className="space-y-4">
                        {comparisonConfigs.map((row, i) => {
                          const lv = row.transform
                            ? row.transform(battleResult.leftMetrics[row.key] ?? 0)
                            : (battleResult.leftMetrics[row.key] ?? 0);
                          const rv = row.transform
                            ? row.transform(battleResult.rightMetrics[row.key] ?? 0)
                            : (battleResult.rightMetrics[row.key] ?? 0);
                          return (
                            <ComparisonRow
                              key={row.key}
                              label={row.label}
                              leftVal={lv}
                              rightVal={rv}
                              lowerBetter={row.lowerBetter}
                              unit={row.unit}
                              delay={0.1 + i * 0.1}
                            />
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Charts Section */}
                {(radarConfigs.length > 0 || costTimeConfig != null || donutConfig != null) && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {radarConfigs.length > 0 && (
                      <Card className="py-4">
                        <CardContent>
                          <RadarChart
                            leftMetrics={battleResult.leftMetrics}
                            rightMetrics={battleResult.rightMetrics}
                            dimensions={radarConfigs}
                            labels={L}
                          />
                        </CardContent>
                      </Card>
                    )}
                    {costTimeConfig && (
                      <Card className="py-4">
                        <CardContent>
                          <CostTimeChart
                            leftMetrics={battleResult.leftMetrics}
                            rightMetrics={battleResult.rightMetrics}
                            config={costTimeConfig}
                          />
                        </CardContent>
                      </Card>
                    )}
                    {donutConfig && (
                      <Card className="py-4">
                        <CardContent>
                          <DonutChart
                            leftMetrics={battleResult.leftMetrics}
                            rightMetrics={battleResult.rightMetrics}
                            leftName={leftItem.name}
                            rightName={rightItem.name}
                            config={donutConfig}
                          />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Action */}
                <div className="flex justify-center">
                  <Button variant="outline" onClick={resetBattle}>
                    <RotateCcw className="h-4 w-4 mr-1.5" /> {L.newBattle}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">{L.battleForDetails}</p>
              </div>
            )}
          </TabsContent>

          {/* ══════ TAB: History ══════ */}
          <TabsContent value="history">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {L.battleHistory}
                </h3>
                {battleHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setBattleHistory([])} className="text-xs h-7">
                    <RotateCcw className="h-3 w-3 mr-1" /> {L.clearHistory}
                  </Button>
                )}
              </div>

              {battleHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">{L.noBattlesYet}</p>
                  <p className="text-xs mt-1">{L.goArena}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                  <AnimatePresence>
                    {battleHistory.map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 rounded-xl border border-border/50 p-3 glass-card hover-lift cursor-pointer"
                        onClick={() => replayBattle(entry)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="font-medium truncate">{entry.leftName}</span>
                            <Swords className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="font-medium truncate">{entry.rightName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant={entry.winner === 'tie' ? 'secondary' : 'default'}
                              className={`micro-text px-1.5 py-0 ${
                                entry.winner !== 'tie'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : ''
                              }`}
                            >
                              {entry.winner === 'tie' ? (
                                <><Medal className="h-3 w-3 mr-0.5" /> {L.tie}</>
                              ) : (
                                <><Trophy className="h-3 w-3 mr-0.5" /> {entry.winnerName}</>
                              )}
                            </Badge>
                            <span className="micro-text text-muted-foreground">
                              {entry.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {battleHistory.length > 0 && (
                <div className="text-center">
                  <p className="micro-text text-muted-foreground">{L.clickToReplay}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
