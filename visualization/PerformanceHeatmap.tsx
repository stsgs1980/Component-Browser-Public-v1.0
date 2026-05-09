'use client';

/**
 * PerformanceHeatmap — A GitHub-style contribution heatmap grid that visualises
 * daily performance (e.g. P&L or returns) over a configurable time window.
 * Includes colour intensity scaling, hover tooltips, and summary statistics
 * (best/worst day, win rate, current streak).
 *
 * @example
 * ```tsx
 * <PerformanceHeatmap
 *   data={[
 *     { date: new Date('2025-01-15'), value: 0.42 },
 *     { date: new Date('2025-01-16'), value: -0.18 },
 *     ...
 *   ]}
 *   decimals={2}
 * />
 * ```
 */

import { useState, useMemo } from 'react';
// lucide-react dependency: import { ChevronDown, ChevronRight, CalendarDays } from 'lucide-react'
import { ChevronDown, ChevronRight, CalendarDays } from 'lucide-react';

export interface PerformanceHeatmapProps {
  /** Array of daily data points. `value` is the change for that day (positive = gain, negative = loss). */
  data: { date: Date; value: number }[];
  /** Number of decimal places for value display. Default: 2. */
  decimals?: number;
}

interface DayCell {
  date: Date;
  pnl: number;
  weekIndex: number;
  dayOfWeek: number; // 0=Sun … 6=Sat
}

function getHeatmapColor(pnl: number, maxAbs: number): string {
  if (pnl === 0) return 'rgba(255,255,255,0.03)';
  const intensity = Math.min(1, Math.abs(pnl) / maxAbs);
  if (pnl > 0) {
    const r = Math.round(22 + (1 - intensity) * 40);
    const g = Math.round(101 + intensity * 121);
    const b = Math.round(52 + (1 - intensity) * 76);
    const a = 0.25 + intensity * 0.65;
    return `rgba(${r},${g},${b},${a})`;
  } else {
    const r = Math.round(185 + intensity * 63);
    const g = Math.round(50 + (1 - intensity) * 63);
    const b = Math.round(50 + (1 - intensity) * 63);
    const a = 0.25 + intensity * 0.65;
    return `rgba(${r},${g},${b},${a})`;
  }
}

function getMonthLabel(weekStartDate: Date): string | null {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[weekStartDate.getMonth()];
}

export function PerformanceHeatmap(props: PerformanceHeatmapProps) {
  const { data, decimals = 2 } = props;

  const [collapsed, setCollapsed] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<DayCell | null>(null);

  // Build heatmap grid from data
  const { cells, weekColumns, maxAbsPnl, stats, monthLabels } = useMemo(() => {
    if (data.length < 2) {
      return { cells: [] as DayCell[], weekColumns: 13, maxAbsPnl: 0, stats: null, monthLabels: [] as (string | null)[] };
    }

    // Build daily P&L map
    const dailyPnl = new Map<string, { date: Date; pnl: number }>();
    for (const entry of data) {
      const d = new Date(entry.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const existing = dailyPnl.get(key);
      if (existing) {
        existing.pnl += entry.value;
      } else {
        dailyPnl.set(key, { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), pnl: entry.value });
      }
    }

    // Determine the date range — last 13 weeks
    const today = new Date();
    const thirteenWeeksAgo = new Date(today);
    thirteenWeeksAgo.setDate(thirteenWeeksAgo.getDate() - 13 * 7);
    const startOfWeek = new Date(thirteenWeeksAgo);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const cellsList: DayCell[] = [];
    const numWeeks = 13;

    for (let w = 0; w < numWeeks; w++) {
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startOfWeek);
        cellDate.setDate(startOfWeek.getDate() + w * 7 + d);
        const key = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
        const dayData = dailyPnl.get(key);
        if (cellDate <= today) {
          cellsList.push({
            date: cellDate,
            pnl: dayData ? dayData.pnl : 0,
            weekIndex: w,
            dayOfWeek: d,
          });
        }
      }
    }

    // Fallback: if no real-date cells were generated, map data directly
    if (cellsList.length === 0 && data.length > 0) {
      const totalItems = Math.min(data.length, 91);
      const recentItems = data.slice(-totalItems);
      for (let i = 0; i < recentItems.length; i++) {
        cellsList.push({
          date: new Date(recentItems[i].date),
          pnl: recentItems[i].value,
          weekIndex: Math.floor(i / 7),
          dayOfWeek: i % 7,
        });
      }
    }

    // Normalisation
    const pnlValues = cellsList.filter((c) => c.pnl !== 0).map((c) => Math.abs(c.pnl));
    const maxAbs = pnlValues.length > 0 ? Math.max(...pnlValues) : 1;

    // Statistics
    const pnls = cellsList.map((c) => c.pnl).filter((v) => v !== 0);
    const positiveDays = pnls.filter((v) => v > 0).length;
    const totalActiveDays = pnls.length;
    const bestDay = totalActiveDays > 0 ? Math.max(...pnls) : 0;
    const worstDay = totalActiveDays > 0 ? Math.min(...pnls) : 0;
    const avgChange = totalActiveDays > 0 ? pnls.reduce((a, b) => a + b, 0) / totalActiveDays : 0;
    const winRate = totalActiveDays > 0 ? (positiveDays / totalActiveDays) * 100 : 0;

    // Current streak
    let streak = 0;
    let streakDirection: 'up' | 'down' | 'none' = 'none';
    for (let i = cellsList.length - 1; i >= 0; i--) {
      const pnl = cellsList[i].pnl;
      if (pnl === 0) continue;
      if (streakDirection === 'none') {
        streakDirection = pnl > 0 ? 'up' : 'down';
        streak = 1;
      } else if ((streakDirection === 'up' && pnl > 0) || (streakDirection === 'down' && pnl < 0)) {
        streak++;
      } else {
        break;
      }
    }

    // Month labels
    const mLabels: (string | null)[] = [];
    const seenMonths = new Set<string>();
    for (let w = 0; w < numWeeks; w++) {
      const weekStart = new Date(startOfWeek);
      weekStart.setDate(startOfWeek.getDate() + w * 7);
      const monthKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}`;
      const monthName = getMonthLabel(weekStart);
      if (monthName && !seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        mLabels.push(monthName);
      } else {
        mLabels.push(null);
      }
    }

    return {
      cells: cellsList,
      weekColumns: numWeeks,
      maxAbsPnl: maxAbs,
      stats: { bestDay, worstDay, avgChange, winRate, streak, streakDirection, totalActiveDays },
      monthLabels: mLabels,
    };
  }, [data]);

  const dayLabelMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const displayRows = [1, 2, 3, 4, 5, 6, 0]; // Mon … Sun

  return (
    <div>
      {/* Collapsible Header */}
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-2 mb-2 group">
        <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Performance Heatmap</span>
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
        ) : (
          <ChevronDown className="w-3 h-3 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
        )}
      </button>

      {!collapsed && (
        <div className="glass-card-enhanced rounded-lg border border-white/[0.04] p-3 space-y-3">
          {/* Month Labels */}
          <div className="flex" style={{ paddingLeft: '20px' }}>
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-[8px] text-gray-500 font-medium"
                style={{ width: '14px', flexShrink: 0, marginRight: '1px' }}
              >
                {label || ''}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-0">
            {/* Day labels column */}
            <div className="flex flex-col gap-[2px] mr-1" style={{ width: '20px' }}>
              {displayRows.map((dayNum) => (
                <div
                  key={dayNum}
                  className="text-[8px] text-gray-500 font-medium flex items-center justify-end pr-1"
                  style={{ height: '12px' }}
                >
                  {dayNum === 1 || dayNum === 3 || dayNum === 5 ? dayLabelMap[dayNum].charAt(0) : ''}
                </div>
              ))}
            </div>

            {/* Grid cells */}
            <div className="flex-1">
              {displayRows.map((dayNum) => (
                <div key={dayNum} className="flex gap-[2px] mb-[2px]">
                  {Array.from({ length: weekColumns }, (_, w) => {
                    const cell = cells.find((c) => c.weekIndex === w && c.dayOfWeek === dayNum);
                    const pnl = cell ? cell.pnl : 0;
                    const color = cell ? getHeatmapColor(pnl, maxAbsPnl) : 'rgba(255,255,255,0.03)';
                    return (
                      <div
                        key={w}
                        className="rounded-[2px] cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-white/20"
                        style={{ width: '12px', height: '12px', backgroundColor: color, flexShrink: 0 }}
                        onMouseEnter={() => cell && setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Hover Tooltip */}
          {hoveredCell && (
            <div className="text-[9px] text-gray-400 tabular-nums flex items-center gap-2">
              <span>{hoveredCell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className={hoveredCell.pnl >= 0 ? 'text-green-400' : 'text-red-400'} style={{ fontWeight: 600 }}>
                {hoveredCell.pnl >= 0 ? '+' : ''}
                {hoveredCell.pnl.toFixed(decimals)}
              </span>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-[2px]">
                <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: 'rgba(185,50,50,0.6)' }} />
                <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: 'rgba(185,50,50,0.3)' }} />
                <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: 'rgba(22,101,52,0.3)' }} />
                <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: 'rgba(22,101,52,0.6)' }} />
              </div>
              <span className="text-[8px] text-gray-600">Loss → Gain</span>
            </div>
            <span className="text-[8px] text-gray-600">{stats?.totalActiveDays || 0} days</span>
          </div>

          {/* Summary Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/[0.04]">
              <div className="metric-card-enhanced rounded-md px-2.5 py-1.5">
                <div className="data-label">Best Day</div>
                <div className="text-[11px] font-semibold tabular-nums text-green-400">+{stats.bestDay.toFixed(decimals)}</div>
              </div>
              <div className="metric-card-enhanced rounded-md px-2.5 py-1.5">
                <div className="data-label">Worst Day</div>
                <div className="text-[11px] font-semibold tabular-nums text-red-400">{stats.worstDay.toFixed(decimals)}</div>
              </div>
              <div className="metric-card-enhanced rounded-md px-2.5 py-1.5">
                <div className="data-label">Avg Daily Change</div>
                <div className={`text-[11px] font-semibold tabular-nums ${stats.avgChange >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  {stats.avgChange >= 0 ? '+' : ''}
                  {stats.avgChange.toFixed(decimals)}
                </div>
              </div>
              <div className="metric-card-enhanced rounded-md px-2.5 py-1.5">
                <div className="data-label">Win Rate</div>
                <div className="text-[11px] font-semibold tabular-nums text-amber-400">{stats.winRate.toFixed(0)}%</div>
              </div>
              <div className="metric-card-enhanced rounded-md px-2.5 py-1.5 col-span-2">
                <div className="flex items-center justify-between">
                  <div className="data-label">Current Streak</div>
                  <div
                    className={`text-[11px] font-semibold tabular-nums ${
                      stats.streakDirection === 'up' ? 'text-green-400' : stats.streakDirection === 'down' ? 'text-red-400' : 'text-gray-500'
                    }`}
                  >
                    {stats.streak > 0 ? `${stats.streak} ${stats.streakDirection === 'up' ? '▲ Up' : '▼ Down'}` : '—'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
