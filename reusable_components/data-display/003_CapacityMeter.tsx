'use client';

import { memo, useMemo } from 'react';
import { Database } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

export interface CapacityMeterTheme {
  containerBg: string;
  barBg: string;
  iconDefault: string;
  textDefault: string;
  colorNormal: string;
  colorWarning: string;
  colorCritical: string;
}

export const DARK_THEME: CapacityMeterTheme = {
  containerBg: '#313244',
  barBg: '#45475a',
  iconDefault: '#6c7086',
  textDefault: '#6c7086',
  colorNormal: '#a6e3a1',
  colorWarning: '#f9e2af',
  colorCritical: '#f38ba8',
};

export const LIGHT_THEME: CapacityMeterTheme = {
  containerBg: '#f1f5f9',
  barBg: '#e2e8f0',
  iconDefault: '#94a3b8',
  textDefault: '#94a3b8',
  colorNormal: '#22c55e',
  colorWarning: '#f59e0b',
  colorCritical: '#ef4444',
};

export interface CapacityMeterProps {
  /** Current usage value */
  used: number;
  /** Maximum capacity */
  max: number;
  /** Optional reserved amount (subtracted from max) */
  reserved?: number;
  /** Warning threshold as fraction (default 0.8) */
  warningThreshold?: number;
  /** Critical threshold as fraction (default 0.95) */
  criticalThreshold?: number;
  /** Label formatter */
  formatRemaining?: (remaining: number) => string;
  /** Theme */
  theme?: CapacityMeterTheme;
  /** Custom icon */
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Bar width (default 64px) */
  barWidth?: number | string;
  /** Show as compact badge */
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────

const CapacityMeter = memo(function CapacityMeter({
  used,
  max,
  reserved = 0,
  warningThreshold = 0.8,
  criticalThreshold = 0.95,
  formatRemaining = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`,
  theme = DARK_THEME,
  icon: Icon = Database,
  barWidth = 64,
  compact = false,
}: CapacityMeterProps) {
  const available = max - reserved;
  const usagePercent = used / available;
  const remaining = available - used;

  const isWarning = usagePercent >= warningThreshold && usagePercent < criticalThreshold;
  const isCritical = usagePercent >= criticalThreshold;

  const progressColor = isCritical ? theme.colorCritical : isWarning ? theme.colorWarning : theme.colorNormal;
  const displayColor = isCritical ? theme.colorCritical : isWarning ? theme.colorWarning : theme.textDefault;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: theme.containerBg }}>
        <Icon className="w-2.5 h-2.5" style={{ color: displayColor }} />
        <span className="text-[9px]" style={{ color: displayColor }}>
          {formatRemaining(remaining)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded" style={{ backgroundColor: theme.containerBg }}>
      <Icon className="w-3 h-3" style={{ color: displayColor }} />

      <div className="rounded-full overflow-hidden" style={{ width: typeof barWidth === 'number' ? `${barWidth}px` : barWidth, height: '6px', backgroundColor: theme.barBg }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(usagePercent * 100, 100)}%`, backgroundColor: progressColor }}
        />
      </div>

      <span className="text-[9px]" style={{ color: displayColor }}>
        {formatRemaining(remaining)}
      </span>
    </div>
  );
});

export default CapacityMeter;
