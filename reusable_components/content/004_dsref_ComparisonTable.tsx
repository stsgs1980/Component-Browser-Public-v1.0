'use client';

import { memo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────

export interface ComparisonMetric {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ScoreCellProps {
  value: number | undefined;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface ComparisonTableProps {
  items: Array<{
    id: string;
    name: string;
    color?: string;
    data: Record<string, number | undefined>;
  }>;
  metrics: ComparisonMetric[];
  onRemove?: (id: string) => void;
  emptyLabel?: string;
  emptyDescription?: string;
  metricColumnLabel?: string;
  className?: string;
}

// ─── Score utilities ──────────────────────────────────────────────────

export function getScoreColorClass(score: number | undefined, light = false): string {
  if (!score) return light ? 'rgba(148,163,184,0.2)' : '#94a3b8';
  if (score >= 4.5) return '#22c55e';
  if (score >= 3.5) return '#eab308';
  if (score >= 2.5) return '#f97316';
  return '#ef4444';
}

export function getScoreBgColor(score: number | undefined, opacity = 0.2): string {
  if (!score) return 'rgba(148,163,184,0.2)';
  if (score >= 4.5) return `rgba(34,197,94,${opacity})`;
  if (score >= 3.5) return `rgba(234,179,8,${opacity})`;
  if (score >= 2.5) return `rgba(249,115,22,${opacity})`;
  return `rgba(239,68,68,${opacity})`;
}

// ─── ScoreCell ────────────────────────────────────────────────────────

export const ScoreCell = memo(function ScoreCell({
  value,
  max = 5,
  size = 'md',
}: ScoreCellProps) {
  if (value === undefined) {
    return <span style={{ color: 'var(--muted-foreground, #94a3b8)' }}>—</span>;
  }

  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-base' };
  const sizeClass = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg font-bold ${sizeClass}`}
      style={{
        backgroundColor: getScoreBgColor(value),
        color: getScoreColorClass(value),
      }}
    >
      {value}<span className="opacity-50">/{max}</span>
    </div>
  );
});

// ─── ComparisonTable ──────────────────────────────────────────────────

export const ComparisonTable = memo(function ComparisonTable({
  items,
  metrics,
  onRemove,
  emptyLabel = 'No items selected',
  emptyDescription = 'Select items to start comparing',
  metricColumnLabel = 'Metric',
  className = '',
}: ComparisonTableProps) {
  if (items.length === 0) {
    return (
      <div className={`border border-border rounded-lg p-20 text-center ${className}`}>
        <p style={{ color: 'var(--muted-foreground, #94a3b8)' }} className="mb-2">{emptyLabel}</p>
        <p className="text-sm" style={{ color: 'var(--muted-foreground, #94a3b8)' }}>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
            <th className="text-left py-4 px-4 font-semibold w-40">{metricColumnLabel}</th>
            {items.map((item) => (
              <th key={item.id} className="text-center py-4 px-4 font-semibold min-w-[120px]">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: item.color || '#339af0' }}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    {onRemove && (
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 rounded transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary, #f1f5f9)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <RemoveIcon />
                      </button>
                    )}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.key} className="border-b" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
              <td className="py-4 px-4 font-medium" style={{ color: 'var(--foreground, #0f172a)' }}>
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span>{metric.label}</span>
                </div>
              </td>
              {items.map((item) => (
                <td key={item.id} className="text-center py-4 px-4">
                  <ScoreCell value={item.data[metric.key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground, #94a3b8)' }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default ComparisonTable;
