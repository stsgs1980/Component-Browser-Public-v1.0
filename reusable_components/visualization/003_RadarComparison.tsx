// --- source: UI-Stack-Guide / page.tsx (lines 1567-1725) ---
// Interactive Recharts RadarChart with sidebar selector, score breakdown grid,
// total/average calculation, and technical details panel.
// De-hardcoded: libraries, radar data, all Russian text → generic props.

'use client';

import { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from 'recharts';

// ============================================================
//  TYPES
// ============================================================

interface RadarDataPoint {
  criterion: string;
  [key: string]: string | number; // dynamic library keys
}

interface LibraryEntry {
  id: string;
  name: string;
  /** Optional grouping key (e.g. 'headless', 'styled') */
  group?: string;
  /** Extra metadata to show in the details panel */
  details?: Record<string, string>;
}

interface RadarComparisonProps {
  /** All data points — each has `criterion` + one value per library id */
  data: RadarDataPoint[];
  /** Library list for the selector sidebar */
  libraries: LibraryEntry[];
  /** Group labels for sidebar sections */
  groupLabels?: Record<string, string>;
  /** Title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Detail panel labels */
  detailLabels?: { label: string; value: string };
  /** Score summary labels */
  summaryLabels?: { total: string; average: string };
  /** Height of the radar chart area (default "h-72") */
  chartHeight?: string;
  /** Max radar value (default 100) */
  max?: number;
  className?: string;
}

// ============================================================
//  COMPONENT
// ============================================================

export function RadarComparison({
  data,
  libraries,
  groupLabels,
  title, subtitle,
  detailLabels,
  summaryLabels,
  chartHeight = 'h-72',
  max = 100,
  className,
}: RadarComparisonProps) {
  const [selectedId, setSelectedId] = useState(libraries[0]?.id || '');

  const selected = libraries.find((l) => l.id === selectedId);
  const scores = data.map((item) => ({
    criterion: item.criterion,
    score: item[selectedId] as number,
  }));

  const total = scores.reduce((sum, s) => sum + s.score, 0);
  const maxTotal = scores.length * max;
  const avg = Math.round(total / scores.length);

  // Group libraries for sidebar sections
  const groups: Array<{ key: string; label: string; items: LibraryEntry[] }> = [];
  const seen = new Set<string>();
  for (const lib of libraries) {
    const g = lib.group || '_default';
    if (!seen.has(g)) {
      seen.add(g);
      groups.push({
        key: g,
        label: groupLabels?.[g] || g,
        items: libraries.filter((l) => (l.group || '_default') === g),
      });
    }
  }

  return (
    <div className={`border border-border bg-background ${className || ''}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            {title && <h3 className="font-semibold tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {summaryLabels?.total || 'Total'}:{' '}
              <span className="font-mono font-medium text-foreground">
                {total} / {maxTotal}
              </span>
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {summaryLabels?.average || 'Avg'}:{' '}
              <span className="font-mono font-medium text-foreground">{avg}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Radar + Sidebar */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-px bg-border">
        {/* Radar chart */}
        <div className="bg-background p-6">
          <div className={chartHeight}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid stroke="hsl(var(--border))" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="criterion"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontFamily: 'monospace' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, max]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name={selected?.name}
                  dataKey={selectedId}
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  fill="hsl(var(--foreground))"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar: library selector + details */}
        <div className="bg-background p-4">
          <div className="space-y-1">
            {groups.map((group) => (
              <div key={group.key}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 mt-4 px-2 first:mt-0">
                  {group.label}
                </div>
                {group.items.map((lib) => (
                  <button
                    key={lib.id}
                    onClick={() => setSelectedId(lib.id)}
                    className={[
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      selectedId === lib.id
                        ? 'bg-foreground text-background'
                        : 'hover:bg-muted',
                    ].join(' ')}
                  >
                    {lib.name}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Details panel for selected library */}
          {selected?.details && Object.keys(selected.details).length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                {detailLabels?.label || 'Details'}
              </div>
              <div className="space-y-2 text-sm">
                {Object.entries(selected.details).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-mono">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Score breakdown grid */}
      <div className="border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
          {scores.map((item) => (
            <div key={item.criterion} className="bg-background p-4 text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                {item.criterion}
              </div>
              <div className="text-2xl font-mono font-medium">{item.score}</div>
              <div className="mt-2 h-1 bg-muted">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{ width: `${(item.score / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
