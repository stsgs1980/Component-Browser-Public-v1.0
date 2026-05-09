/**
 * MetricBar — before/after comparison bars with percentage change indicator.
 *
 * Source: LLM-MEM-GUIDE /src/components/resources/CaseStudies.tsx (MetricBar, lines 271-332)
 * De-hardcoded: none — already fully generic with configurable props.
 * The "before" / "after" labels and color logic are universal.
 */

export interface MetricBarData {
  label: string
  before: number
  after: number
  /** Unit string (e.g. '%', 'min', '$') */
  unit?: string
  /** When true, lower "after" value = improvement (default: higher = improvement) */
  lowerIsBetter?: boolean
}

interface MetricBarProps {
  metric: MetricBarData
}

export function MetricBar({ metric }: MetricBarProps) {
  const { label, before, after, unit = '', lowerIsBetter = false } = metric

  const maxVal = Math.max(before, after)
  const beforePct = maxVal > 0 ? (before / maxVal) * 100 : 0
  const afterPct = maxVal > 0 ? (after / maxVal) * 100 : 0
  const improved = lowerIsBetter
    ? after < before
    : after > before

  // Calculate percentage change
  const changePercent = before !== 0
    ? Math.abs(Math.round(((after - before) / before) * 100))
    : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
        <span
          className={`text-[11px] font-mono font-medium ${
            improved
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-400'
          }`}
        >
          {improved ? '' : ''}
          {lowerIsBetter ? '-' : '+'}{changePercent}%
        </span>
      </div>
      <div className="space-y-1">
        {/* Before bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/70 w-12 shrink-0">
            Before
          </span>
          <div className="flex-1 h-2.5 bg-muted/50 rounded-sm overflow-hidden">
            <div
              className="h-full bg-muted-foreground/30 rounded-sm transition-all duration-700"
              style={{ width: `${Math.max(beforePct, 3)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground w-16 text-right shrink-0">
            {before}{unit}
          </span>
        </div>
        {/* After bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-primary/70 w-12 shrink-0">
            After
          </span>
          <div className="flex-1 h-2.5 bg-primary/5 rounded-sm overflow-hidden">
            <div
              className={`h-full rounded-sm transition-all duration-700 ${
                improved
                  ? 'bg-primary/70'
                  : 'bg-red-400/50 dark:bg-red-500/40'
              }`}
              style={{ width: `${Math.max(afterPct, 3)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-primary w-16 text-right shrink-0 font-medium">
            {after}{unit}
          </span>
        </div>
      </div>
    </div>
  )
}
