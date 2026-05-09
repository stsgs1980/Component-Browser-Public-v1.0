'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Zap,
  BarChart3,
  Table2,
  Filter,
  Search,
} from 'lucide-react'

// ────────────────────────────────────────────────────────────
//  Exported Interfaces
// ────────────────────────────────────────────────────────────

/** Rating level used in cross-reference matrices. */
export type RatingStatus = 'great' | 'partial' | 'limited'

/** A cell value — either a plain number/string, or a structured rating. */
export type CellValue = number | string | RatingValue

/** Structured rating with optional tooltip text. */
export interface RatingValue {
  status: RatingStatus
  tooltip?: string
}

/** A group that owns one or more items (e.g. "OpenAI", "Provider A"). */
export interface ComparisonGroup {
  id: string
  name: string
  initials: string
  gradientFrom: string
  gradientTo: string
  description: string
}

/** A single item being compared (e.g. "GPT-4o", "Product X"). */
export interface ComparisonItem {
  id: string
  name: string
  groupId: string
  tier?: string
  /** Map of featureId → value for this item. */
  values: Record<string, CellValue>
}

/** Determines how a feature column behaves. */
export interface ComparisonFeature {
  id: string
  label: string
  type: 'currency' | 'number' | 'text' | 'percentage'
  /** 'asc' means lower-is-better (prices, latency). 'desc' means higher-is-better (context, savings). */
  sortDirection: 'asc' | 'desc'
  /** Optional unit suffix shown in table headers (e.g. '$/1M', '%'). */
  unit?: string
}

/** A row in the cross-reference matrix. */
export interface CrossReferenceRow {
  id: string
  label: string
  icon?: string
  /** Map of columnId → rating for this row. */
  cells: Record<string, RatingValue>
}

/** A column in the cross-reference matrix. */
export interface CrossReferenceColumn {
  id: string
  label: string
}

/** Optional footer stat shown below the matrix. */
export interface FooterStat {
  label: string
  value: string
  gradient: string
  extractor: (items: ComparisonItem[]) => string
}

/** All supported view modes. */
export type ViewMode = 'cards' | 'table' | 'charts' | 'crossRef'

/** Label overrides for every visible string in the component. */
export interface ComparisonLabels {
  title?: string
  subtitle?: string
  searchPlaceholder?: string
  copy?: string
  copied?: string
  viewCards?: string
  viewTable?: string
  viewCharts?: string
  viewCrossRef?: string
  bestValue?: string
  worstValue?: string
  clickToSort?: string
  items?: string
  context?: string
  input?: string
  output?: string
  latency?: string
  bestTechnique?: string
  savings?: string
  inputVsOutput?: string
  contextWindow?: string
  savingsPotential?: string
  compatTitle?: string
  howToRead?: string
  great?: string
  partial?: string
  limited?: string
  upTo?: string
  per?: string
  of?: string
  tokens?: string
}

/** Top-level props for the ComparisonMatrix component. */
export interface ComparisonMatrixProps {
  /** Matrix title shown in the header. */
  title: string
  /** Optional subtitle (e.g. "4 providers • 8 items"). */
  subtitle?: string
  /** Groups of items. */
  groups: ComparisonGroup[]
  /** Items to compare. */
  items: ComparisonItem[]
  /** Feature columns. */
  features: ComparisonFeature[]
  /** Cross-reference (compatibility-style) matrix config. */
  crossReference?: {
    rows: CrossReferenceRow[]
    columns: CrossReferenceColumn[]
    tooltips?: Record<string, Record<string, string>>
    title?: string
    notes?: Array<{ icon?: boolean; text: string }>
  }
  /** Which views are enabled (default: all four). */
  enabledViews?: ViewMode[]
  /** Initial active view. */
  defaultView?: ViewMode
  /** Optional footer stats row. */
  footerStats?: FooterStat[]
  /** Custom labels to override defaults. */
  labels?: ComparisonLabels
  /** ID of the initially expanded group. */
  defaultExpandedGroup?: string
  /** ID of the first item selected for stat computation. */
  defaultItemId?: string
  /** Additional chart configs (optional custom chart labels). */
  chartLabels?: {
    inputPrice?: string
    inputVsOutput?: string
    contextWindow?: string
    savingsPotential?: string
  }
}

// ────────────────────────────────────────────────────────────
//  Internal Helpers
// ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function fmtUSD(n: number): string {
  if (n < 1) return `$${n.toFixed(3)}`
  if (n < 10) return `$${n.toFixed(2)}`
  return `$${n.toFixed(2)}`
}

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtCell(value: CellValue, type: ComparisonFeature['type'], unit?: string): string {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'status' in value) {
    return value.status
  }
  switch (type) {
    case 'currency':
      return fmtUSD(value as number)
    case 'percentage':
      return `${value as number}%`
    case 'number':
      return unit ? `${fmtNumber(value as number)} ${unit}` : fmtNumber(value as number)
    default:
      return String(value)
  }
}

function numericValue(v: CellValue): number {
  if (typeof v === 'number') return v
  return 0
}

type SortDir = 'asc' | 'desc'

function getRatingStyle(
  status: RatingStatus,
): { icon: string; color: string; bg: string; label: string } {
  switch (status) {
    case 'great':
      return {
        icon: '\u2713',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/40',
        label: 'Great',
      }
    case 'partial':
      return {
        icon: '~',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        label: 'Partial',
      }
    case 'limited':
      return {
        icon: '\u2717',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/40',
        label: 'Limited',
      }
  }
}

function renderSortIcon(
  currentKey: string,
  currentDir: SortDir,
  colKey: string,
) {
  if (currentKey !== colKey) return <ArrowUpDown className="h-3 w-3 opacity-30" />
  return currentDir === 'asc' ? (
    <ChevronUp className="h-3 w-3" />
  ) : (
    <ChevronDown className="h-3 w-3" />
  )
}

// ────────────────────────────────────────────────────────────
//  Default Labels
// ────────────────────────────────────────────────────────────

const DEFAULT_LABELS: Required<ComparisonLabels> = {
  title: 'Comparison Matrix',
  subtitle: '',
  searchPlaceholder: 'Search items or groups...',
  copy: 'Copy',
  copied: 'Copied',
  viewCards: 'Groups',
  viewTable: 'Table',
  viewCharts: 'Charts',
  viewCrossRef: 'Matrix',
  bestValue: 'Best value',
  worstValue: 'Worst value',
  clickToSort: 'Click header to sort',
  items: 'items',
  context: 'Context',
  input: 'Input',
  output: 'Output',
  latency: 'Latency',
  bestTechnique: 'Best technique',
  savings: 'Savings',
  inputVsOutput: 'Input vs Output costs',
  contextWindow: 'Context window size',
  savingsPotential: 'Savings potential by group',
  compatTitle: 'Compatibility Matrix',
  howToRead: 'Hover over a cell for an explanation.',
  great: 'Great',
  partial: 'Partial',
  limited: 'Limited',
  upTo: 'Up to',
  per: 'per',
  of: 'of',
  tokens: 'tokens',
}

// ────────────────────────────────────────────────────────────
//  Main Component
// ────────────────────────────────────────────────────────────

export default function ComparisonMatrix({
  title,
  subtitle,
  groups,
  items,
  features,
  crossReference,
  enabledViews,
  defaultView = 'cards',
  footerStats,
  labels: labelOverrides,
  defaultExpandedGroup,
  defaultItemId,
  chartLabels,
}: ComparisonMatrixProps) {
  // ── Merged labels ──────────────────────────────────────────
  const L: Required<ComparisonLabels> = { ...DEFAULT_LABELS, ...labelOverrides }

  // ── View config ────────────────────────────────────────────
  const allViews: ViewMode[] = ['cards', 'table', 'charts', 'crossRef']
  const activeViews: ViewMode[] = enabledViews ?? allViews.filter((v) => {
    if (v === 'crossRef') return !!crossReference
    return true
  })
  const firstView = defaultView && activeViews.includes(defaultView) ? defaultView : activeViews[0]

  // ── State ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string>(features[0]?.id ?? '')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(defaultExpandedGroup ? [defaultExpandedGroup] : groups.length > 0 ? [groups[0].id] : []),
  )
  const [copied, setCopied] = useState(false)
  const [activeView, setActiveView] = useState<ViewMode>(firstView)

  // ── Feature lookup ─────────────────────────────────────────
  const featureMap = useMemo(
    () => new Map(features.map((f) => [f.id, f])),
    [features],
  )
  const groupMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups],
  )

  // ── Filtered groups ────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups
    const q = searchQuery.toLowerCase()
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        items.some((i) => i.groupId === g.id && i.name.toLowerCase().includes(q)),
    )
  }, [groups, items, searchQuery])

  // ── Sorted items ───────────────────────────────────────────
  const sortedItems = useMemo(() => {
    const filtered = searchQuery
      ? items.filter(
          (i) =>
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.groupId.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : items

    return [...filtered].sort((a, b) => {
      const feat = featureMap.get(sortKey)
      if (!feat) return 0

      const va = numericValue(a.values[sortKey])
      const vb = numericValue(b.values[sortKey])

      if (feat.type === 'text') {
        const sa = String(a.values[sortKey] ?? '')
        const sb = String(b.values[sortKey] ?? '')
        const cmp = sa.localeCompare(sb)
        return sortDir === 'asc' ? cmp : -cmp
      }

      const cmp = va - vb
      // sortDir is user's click direction; but the feature may prefer asc or desc
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, searchQuery, sortKey, sortDir, featureMap])

  // ── Chart max values ───────────────────────────────────────
  const numericFeatures = features.filter((f) => f.type !== 'text')
  const chartMaxValues = useMemo(() => {
    const map: Record<string, number> = {}
    for (const f of numericFeatures) {
      const vals = items.map((i) => numericValue(i.values[f.id]))
      map[f.id] = Math.max(...vals, 0.001)
    }
    return map
  }, [items, numericFeatures])

  // ── Handlers ───────────────────────────────────────────────
  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSort = useCallback(
    (key: string) => {
      setSortDir((d) => (sortKey === key ? (d === 'asc' ? 'desc' : 'asc') : 'asc'))
      setSortKey(key)
    },
    [sortKey],
  )

  const copyAsMarkdown = useCallback(() => {
    const header = `| Item | Group | ${features.map((f) => f.label).join(' | ')} |\n`
    const separator = `|${features.map(() => '-----------').join('|')}|\n`
    const rows = sortedItems
      .map((i) => {
        const group = groupMap.get(i.groupId)?.name ?? i.groupId
        const vals = features
          .map((f) => fmtCell(i.values[f.id], f.type, f.unit))
          .join(' | ')
        return `| ${i.name} | ${group} | ${vals} |`
      })
      .join('\n')
    navigator.clipboard.writeText(header + separator + rows)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [sortedItems, features, groupMap])

  const sortIcon = (col: string) => renderSortIcon(sortKey, sortDir, col)

  const isBest = (featId: string, value: number): boolean => {
    const feat = featureMap.get(featId)
    if (!feat) return false
    const vals = sortedItems.map((i) => numericValue(i.values[featId]))
    if (feat.sortDirection === 'desc') return value === Math.max(...vals)
    return value === Math.min(...vals)
  }

  const isWorst = (featId: string, value: number): boolean => {
    const feat = featureMap.get(featId)
    if (!feat) return false
    const vals = sortedItems.map((i) => numericValue(i.values[featId]))
    if (feat.sortDirection === 'desc') return value === Math.min(...vals)
    return value === Math.max(...vals)
  }

  const getGroup = (id: string) => groupMap.get(id)

  // ── Item tier badge colors ─────────────────────────────────
  const tierBadgeClass = (tier?: string) => {
    if (tier === 'premium')
      return 'text-amber-600 border-amber-200 dark:border-amber-800 micro-text'
    return 'text-emerald-600 border-emerald-200 dark:border-emerald-800 micro-text'
  }

  // ── View button config ─────────────────────────────────────
  const viewButtons: { key: ViewMode; label: string; Icon: typeof Cpu }[] = [
    { key: 'cards', label: L.viewCards, Icon: Cpu },
    { key: 'table', label: L.viewTable, Icon: Table2 },
    { key: 'charts', label: L.viewCharts, Icon: BarChart3 },
    { key: 'crossRef', label: L.viewCrossRef, Icon: Zap },
  ].filter((v) => activeViews.includes(v.key))

  // ── Numeric features for charts (first 3 numeric features) ──
  const chartFeatures = numericFeatures.slice(0, 3)
  const chartTitles = [
    chartLabels?.inputPrice ?? `${numericFeatures[0]?.label ?? 'Value'}`,
    chartLabels?.inputVsOutput ?? L.inputVsOutput,
    chartLabels?.contextWindow ?? `${numericFeatures[2]?.label ?? L.contextWindow}`,
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ════════ Header ════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Table2 className="h-5 w-5 text-primary" />
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={L.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-56 pl-9 pr-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAsMarkdown}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? L.copied : L.copy}
            </Button>
          </div>
        </div>

        {/* ════════ View Switcher ════════ */}
        <div className="flex flex-wrap gap-1.5">
          {viewButtons.map(({ key, label, Icon }) => (
            <Button
              key={key}
              variant={activeView === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(key)}
              className="gap-1.5 text-xs"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════════════════
              VIEW 1: Group Cards
             ══════════════════════════════════════════════════════ */}
          {activeView === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.map((group, gi) => {
                  const groupItems = items.filter((i) => i.groupId === group.id)
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: gi * 0.08 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="pt-6">
                          {/* Group header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md"
                              style={{
                                background: `linear-gradient(135deg, ${group.gradientFrom}, ${group.gradientTo})`,
                              }}
                            >
                              {group.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-base">{group.name}</h4>
                                <Badge variant="secondary" className="micro-text px-1.5">
                                  {groupItems.length} {L.items}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {group.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => toggleGroup(group.id)}
                            >
                              {expandedGroups.has(group.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {/* Expandable items */}
                          <AnimatePresence>
                            {expandedGroups.has(group.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-3">
                                  {groupItems.map((item) => (
                                    <div
                                      key={item.id}
                                      className="rounded-lg border p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{item.name}</span>
                                        {item.tier && (
                                          <Badge
                                            variant="outline"
                                            className={tierBadgeClass(item.tier)}
                                          >
                                            {item.tier === 'premium' ? ' Premium' : ' Standard'}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                        {features.slice(0, 4).map((feat) => {
                                          const val = item.values[feat.id]
                                          return (
                                            <div
                                              key={feat.id}
                                              className="flex justify-between"
                                            >
                                              <span className="text-muted-foreground">
                                                {feat.label}
                                              </span>
                                              <span className="font-medium tabular-nums">
                                                {fmtCell(val, feat.type, feat.unit)}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                      {/* Best technique / highlight row */}
                                      {item.values.bestTechnique && (
                                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <Zap className="h-3 w-3 text-emerald-500" />
                                            <span className="text-xs text-muted-foreground">
                                              {L.bestTechnique}:
                                            </span>
                                            <span className="text-xs font-medium">
                                              {String(item.values.bestTechnique)}
                                            </span>
                                          </div>
                                          {typeof item.values.maxSavings === 'number' && (
                                            <Badge className="micro-text bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                              {L.upTo} {item.values.maxSavings as number}%{' '}
                                              {L.savings.toLowerCase()}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Collapsed summary */}
                          {!expandedGroups.has(group.id) && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                              {features.slice(0, 2).map((feat) => {
                                const vals = groupItems.map((i) => numericValue(i.values[feat.id]))
                                const best =
                                  feat.sortDirection === 'desc'
                                    ? Math.max(...vals)
                                    : Math.min(...vals)
                                return (
                                  <span key={feat.id}>
                                    {feat.label}:{' '}
                                    <span className="text-foreground font-medium">
                                      {fmtCell(best, feat.type, feat.unit)}
                                    </span>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════
              VIEW 2: Sortable Table
             ══════════════════════════════════════════════════════ */}
          {activeView === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {/* Item name column */}
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSort('__name')}
                          >
                            <div className="flex items-center gap-1">
                              Item {sortIcon('__name')}
                            </div>
                          </TableHead>
                          {/* Feature columns */}
                          {features.map((feat) => (
                            <TableHead
                              key={feat.id}
                              className="cursor-pointer select-none"
                              onClick={() => handleSort(feat.id)}
                            >
                              <div className="flex items-center gap-1">
                                {feat.label}
                                {feat.unit && (
                                  <span className="text-muted-foreground font-normal">
                                    ({feat.unit})
                                  </span>
                                )}
                                {sortIcon(feat.id)}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedItems.map((item) => (
                          <TableRow key={item.id}>
                            {/* Name + group badge */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-6 w-6 rounded-md flex items-center justify-center micro-text font-bold text-white shrink-0"
                                  style={{
                                    background: `linear-gradient(135deg, ${getGroup(item.groupId)?.gradientFrom}, ${getGroup(item.groupId)?.gradientTo})`,
                                  }}
                                >
                                  {getGroup(item.groupId)?.initials}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{item.name}</div>
                                  <div className="micro-text text-muted-foreground">
                                    {getGroup(item.groupId)?.name ?? item.groupId}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            {/* Feature cells */}
                            {features.map((feat) => {
                              const val = item.values[feat.id]
                              const numVal = numericValue(val)

                              // Text / rating cells
                              if (feat.type === 'text') {
                                return (
                                  <TableCell key={feat.id}>
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                                      {String(val ?? '')}
                                    </Badge>
                                  </TableCell>
                                )
                              }

                              // Rating cell
                              if (typeof val === 'object' && val !== null && 'status' in val) {
                                const rating = getRatingStyle((val as RatingValue).status)
                                return (
                                  <TableCell key={feat.id} className="text-center">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md cursor-default ${rating.bg} ${rating.color} font-bold text-sm transition-transform hover:scale-110`}
                                        >
                                          {rating.icon}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs font-medium">{rating.label}</p>
                                        {(val as RatingValue).tooltip && (
                                          <p className="micro-text text-muted-foreground mt-1">
                                            {(val as RatingValue).tooltip}
                                          </p>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableCell>
                                )
                              }

                              // Numeric cells with best/worst highlighting
                              const best = isBest(feat.id, numVal)
                              const worst = isWorst(feat.id, numVal)
                              return (
                                <TableCell key={feat.id}>
                                  <span
                                    className={`text-sm font-medium tabular-nums ${
                                      best
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : worst
                                          ? 'text-red-500'
                                          : ''
                                    }`}
                                  >
                                    {fmtCell(val, feat.type, feat.unit)}
                                  </span>
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-3 flex items-center gap-3 micro-text text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      {L.bestValue}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                      {L.worstValue}
                    </span>
                    <span>{L.clickToSort}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════
              VIEW 3: Visual Charts
             ══════════════════════════════════════════════════════ */}
          {activeView === 'charts' && (
            <motion.div
              key="charts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Chart A: First numeric feature (sorted ascending) */}
              {chartFeatures[0] && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-500" />
                      {chartTitles[0]}
                    </h4>
                    <div className="space-y-2.5">
                      {[...items]
                        .sort(
                          (a, b) =>
                            numericValue(a.values[chartFeatures[0].id]) -
                            numericValue(b.values[chartFeatures[0].id]),
                        )
                        .map((item, idx) => {
                          const val = numericValue(item.values[chartFeatures[0].id])
                          const max = chartMaxValues[chartFeatures[0].id]
                          const pct = max > 0 ? (val / max) * 100 : 0
                          const group = getGroup(item.groupId)
                          return (
                            <div key={item.id}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium truncate mr-2">
                                  {item.name}
                                </span>
                                <span className="text-xs font-bold tabular-nums">
                                  {fmtCell(item.values[chartFeatures[0].id], chartFeatures[0].type, chartFeatures[0].unit)}
                                </span>
                              </div>
                              <div className="h-5 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.6, delay: idx * 0.06 }}
                                  style={{
                                    background: `linear-gradient(90deg, ${group?.gradientFrom}, ${group?.gradientTo})`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chart B: Stacked bar — first two numeric features */}
              {chartFeatures[1] && chartFeatures[0] && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-amber-500" />
                      {chartTitles[1]}
                    </h4>
                    <div className="flex items-center gap-3 mb-3 micro-text text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-cyan-500" />
                        {chartFeatures[0].label}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-500" />
                        {chartFeatures[1].label}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {[...items]
                        .sort(
                          (a, b) =>
                            numericValue(a.values[chartFeatures[0].id]) +
                            numericValue(a.values[chartFeatures[1].id]) -
                            (numericValue(b.values[chartFeatures[0].id]) +
                              numericValue(b.values[chartFeatures[1].id])),
                        )
                        .map((item, idx) => {
                          const v0 = numericValue(item.values[chartFeatures[0].id])
                          const v1 = numericValue(item.values[chartFeatures[1].id])
                          const total = v0 + v1
                          const max0 = chartMaxValues[chartFeatures[0].id]
                          const max1 = chartMaxValues[chartFeatures[1].id]
                          const maxTotal = max0 + max1
                          const pct0 = maxTotal > 0 ? (v0 / maxTotal) * 100 : 0
                          const pct1 = maxTotal > 0 ? (v1 / maxTotal) * 100 : 0
                          return (
                            <div key={item.id}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium truncate mr-2">
                                  {item.name}
                                </span>
                                <span className="text-xs font-bold tabular-nums">
                                  {fmtCell(total, 'currency')}
                                </span>
                              </div>
                              <div className="flex h-5 rounded-full overflow-hidden bg-muted">
                                <motion.div
                                  className="h-full bg-cyan-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct0}%` }}
                                  transition={{ duration: 0.6, delay: idx * 0.06 }}
                                />
                                <motion.div
                                  className="h-full bg-rose-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct1}%` }}
                                  transition={{ duration: 0.6, delay: idx * 0.06 + 0.1 }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chart C: Third numeric feature (sorted descending) */}
              {chartFeatures[2] && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-violet-500" />
                      {chartTitles[2]}
                    </h4>
                    <div className="space-y-2.5">
                      {[...items]
                        .sort(
                          (a, b) =>
                            numericValue(b.values[chartFeatures[2].id]) -
                            numericValue(a.values[chartFeatures[2].id]),
                        )
                        .map((item, idx) => {
                          const val = numericValue(item.values[chartFeatures[2].id])
                          const max = chartMaxValues[chartFeatures[2].id]
                          const pct = max > 0 ? (val / max) * 100 : 0
                          const group = getGroup(item.groupId)
                          return (
                            <div key={item.id}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium truncate mr-2">
                                  {item.name}
                                </span>
                                <span className="text-xs font-bold tabular-nums">
                                  {fmtCell(item.values[chartFeatures[2].id], chartFeatures[2].type, chartFeatures[2].unit)}
                                </span>
                              </div>
                              <div className="h-5 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: idx * 0.06 }}
                                  style={{
                                    background: `linear-gradient(90deg, ${group?.gradientFrom}80, ${group?.gradientTo})`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chart D: Savings / percentage by group (if percentage feature exists) */}
              {features.find((f) => f.type === 'percentage') && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-500" />
                      {chartLabels?.savingsPotential ?? L.savingsPotential}
                    </h4>
                    <div className="space-y-4">
                      {groups.map((group, gi) => {
                        const groupItems = items.filter((i) => i.groupId === group.id)
                        return (
                          <div key={group.id}>
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="h-5 w-5 rounded flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${group.gradientFrom}, ${group.gradientTo})`,
                                }}
                              >
                                {group.initials}
                              </div>
                              <span className="text-xs font-medium">{group.name}</span>
                              <span className="micro-text text-muted-foreground">
                                {groupItems
                                  .map((i) => {
                                    const pctFeat = features.find((f) => f.type === 'percentage')
                                    return pctFeat
                                      ? `${numericValue(i.values[pctFeat.id])}%`
                                      : ''
                                  })
                                  .join(' / ')}
                              </span>
                            </div>
                            <div className="flex gap-1 h-8">
                              {groupItems.map((item, mi) => {
                                const pctFeat = features.find((f) => f.type === 'percentage')
                                const pctVal = pctFeat
                                  ? numericValue(item.values[pctFeat.id])
                                  : 0
                                return (
                                  <motion.div
                                    key={item.id}
                                    className="flex-1 rounded-md relative overflow-hidden group cursor-default"
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{
                                      duration: 0.4,
                                      delay: gi * 0.1 + mi * 0.05,
                                    }}
                                    style={{
                                      transformOrigin: 'bottom',
                                      background: `linear-gradient(180deg, ${group.gradientTo}, ${group.gradientFrom}60)`,
                                      opacity: 0.4 + (pctVal / 100) * 0.6,
                                    }}
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="micro-text font-bold text-white drop-shadow-sm">
                                        {pctVal}%
                                      </span>
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="absolute inset-0" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs font-medium">{item.name}</p>
                                        <p className="micro-text text-muted-foreground">
                                          {pctVal}% {L.savings.toLowerCase()}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════
              VIEW 4: Cross-Reference (Compatibility) Matrix
             ══════════════════════════════════════════════════════ */}
          {activeView === 'crossRef' && crossReference && (
            <motion.div
              key="crossRef"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Card>
                <CardContent className="pt-6">
                  {/* Header + legend */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      {crossReference.title ?? L.compatTitle}
                    </h4>
                    <div className="flex items-center gap-3 micro-text text-muted-foreground">
                      {(['great', 'partial', 'limited'] as RatingStatus[]).map((s) => {
                        const st = getRatingStyle(s)
                        return (
                          <span key={s} className="flex items-center gap-1">
                            <span
                              className={`inline-flex h-4 w-4 items-center justify-center rounded micro-text font-bold ${st.bg} ${st.color}`}
                            >
                              {st.icon}
                            </span>
                            {s === 'great' ? L.great : s === 'partial' ? L.partial : L.limited}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{L.viewCrossRef}</TableHead>
                          {crossReference.columns.map((col) => (
                            <TableHead key={col.id} className="text-center">
                              {col.label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {crossReference.rows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {row.icon && <span className="text-base">{row.icon}</span>}
                                <span className="text-sm font-medium">{row.label}</span>
                              </div>
                            </TableCell>
                            {crossReference.columns.map((col) => {
                              const cell = row.cells[col.id]
                              const status = cell?.status ?? 'limited'
                              const st = getRatingStyle(status)
                              const tooltip =
                                cell?.tooltip ??
                                crossReference.tooltips?.[row.id]?.[col.key] ??
                                crossReference.tooltips?.[row.id]?.[col.id] ??
                                ''
                              return (
                                <TableCell key={col.id} className="text-center">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={`inline-flex h-7 w-7 items-center justify-center rounded-md cursor-default ${st.bg} ${st.color} font-bold text-sm transition-transform hover:scale-110`}
                                      >
                                        {st.icon}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="text-xs font-medium">{st.label}</p>
                                      {tooltip && (
                                        <p className="micro-text text-muted-foreground mt-1">
                                          {tooltip}
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile card view */}
                  <div className="md:hidden space-y-4">
                    {crossReference.rows.map((row) => (
                      <div key={row.id} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-3">
                          {row.icon && <span className="text-base">{row.icon}</span>}
                          <span className="text-sm font-medium">{row.label}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {crossReference.columns.map((col) => {
                            const cell = row.cells[col.id]
                            const status = cell?.status ?? 'limited'
                            const st = getRatingStyle(status)
                            const tooltip =
                              cell?.tooltip ??
                              crossReference.tooltips?.[row.id]?.[col.id] ??
                              ''
                            return (
                              <Tooltip key={col.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`flex flex-col items-center gap-1 p-2 rounded-md cursor-default ${st.bg} transition-transform active:scale-95`}
                                  >
                                    <span className={`text-sm font-bold ${st.color}`}>
                                      {st.icon}
                                    </span>
                                    <span className="micro-text text-muted-foreground text-center leading-tight">
                                      {col.label}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs font-medium">{st.label}</p>
                                  {tooltip && (
                                    <p className="micro-text text-muted-foreground mt-1">
                                      {tooltip}
                                    </p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend & notes */}
                  {(crossReference.notes || true) && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">How to read:</span>{' '}
                        {L.howToRead}
                      </p>
                      {crossReference.notes && (
                        <div className="flex flex-wrap gap-2">
                          {crossReference.notes.map((note, ni) => (
                            <Badge key={ni} variant="outline" className="micro-text">
                              {note.icon !== false && (
                                <ExternalLink className="h-3 w-3 mr-1" />
                              )}
                              {note.text}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════ Footer Stats ════════ */}
        {footerStats && footerStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {footerStats.map((stat, idx) => (
              <Card key={idx} className={`bg-gradient-to-br ${stat.gradient} to-transparent`}>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-lg font-bold tabular-nums">{stat.extractor(items)}</div>
                  <div className="micro-text text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
