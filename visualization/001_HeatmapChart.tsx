// --- source: UI-Stack-Guide / page.tsx (lines 1784-1874) ---
// Pure-CSS heatmap chart with intensity levels, no charting library needed.
// De-hardcoded: matrix data and column headers → props, Russian labels → props.

interface HeatmapRow {
  label: string;
  values: number[];
}

interface HeatmapChartProps {
  title?: string;
  subtitle?: string;
  /** Column headers */
  columns: string[];
  /** Row data: each row has a label and numeric values (0-100) */
  rows: HeatmapRow[];
  /** Optional intensity threshold overrides */
  thresholds?: {
    high?: number;    // default 90
    medium?: number;  // default 70
    low?: number;     // default 50
    minimal?: number; // default 30
  };
  /** Scale labels (default: Низкая/Средняя/Высокая) */
  scaleLabels?: { low: string; medium: string; high: string };
  /** Cell width class (default "w-12") */
  cellSize?: string;
  className?: string;
}

export function HeatmapChart({
  title, subtitle,
  columns, rows,
  thresholds = {},
  scaleLabels,
  cellSize = 'w-12',
  className,
}: HeatmapChartProps) {
  const {
    high = 90, medium = 70, low = 50, minimal = 30,
  } = thresholds;

  const labels = scaleLabels || { low: 'Low', medium: 'Medium', high: 'High' };

  const getIntensity = (value: number) => {
    if (value >= high) return 'bg-foreground text-background';
    if (value >= medium) return 'bg-foreground/70 text-background';
    if (value >= low) return 'bg-foreground/40 text-foreground';
    if (value >= minimal) return 'bg-foreground/20 text-muted-foreground';
    return 'bg-muted/30 text-muted-foreground';
  };

  return (
    <div className={`border border-border bg-background ${className || ''}`}>
      {title && (
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pb-3 uppercase text-xs tracking-wider font-medium text-muted-foreground">
                  {/* Row label column header — leave blank or pass first column name */}
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-center pb-3 uppercase text-xs tracking-wider font-medium text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'}>
                  <td className="py-2 pr-4 font-medium">{row.label}</td>
                  {row.values.map((value, j) => (
                    <td key={j} className="p-1">
                      <div className={`mx-auto ${cellSize} h-8 flex items-center justify-center font-mono text-xs ${getIntensity(value)}`}>
                        {value}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scale legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">Scale:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-muted/30" />
              <span>{labels.low}</span>
            </div>
            <span className="text-border">--</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-foreground/40" />
              <span>{labels.medium}</span>
            </div>
            <span className="text-border">--</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-foreground" />
              <span>{labels.high}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
