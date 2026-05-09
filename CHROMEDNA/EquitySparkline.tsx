'use client';

/**
 * EquitySparkline — A minimal SVG sparkline that renders an array of numeric
 * values as a line chart with an area fill. Automatically determines colour
 * (green for upward trend, red for downward) and includes an end-point dot
 * with a subtle breathing glow animation.
 *
 * @example
 * ```tsx
 * <EquitySparkline data={[100, 102, 98, 105, 110]} />
 * <EquitySparkline data={equityCurve} width={200} height={40} strokeWidth={2} />
 * ```
 */

import { useMemo } from 'react';

export interface EquitySparklineProps {
  /** Array of numeric data points to plot. */
  data: number[];
  /** SVG width in pixels. Default: 120. */
  width?: number;
  /** SVG height in pixels. Default: 28. */
  height?: number;
  /** Stroke width for the line. Default: 1.5. */
  strokeWidth?: number;
}

export function EquitySparkline(props: EquitySparklineProps) {
  const { data, width: w = 120, height: h = 28, strokeWidth = 1.5 } = props;

  const svgContent = useMemo(() => {
    if (data.length < 2) return null;

    const padding = 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (w - padding * 2);
      const y = h - padding - ((v - min) / range) * (h - padding * 2);
      return { x, y };
    });

    const isPositive = data[data.length - 1] >= data[0];
    const strokeColor = isPositive ? '#4ade80' : '#f87171';
    const fillColor = isPositive ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)';

    // Build fill polygon (close the path to bottom)
    const fillPoints = [
      `${padding},${h - padding}`,
      ...points.map((p) => `${p.x},${p.y}`),
      `${w - padding},${h - padding}`,
    ].join(' ');

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
    const lastPoint = points[points.length - 1];

    return { fillPoints, polylinePoints, strokeColor, fillColor, lastPoint };
  }, [data, w, h]);

  if (!svgContent) return null;

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polygon points={svgContent.fillPoints} fill={svgContent.fillColor} />
      <polyline
        points={svgContent.polylinePoints}
        fill="none"
        stroke={svgContent.strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={svgContent.lastPoint.x}
        cy={svgContent.lastPoint.y}
        r="2"
        fill={svgContent.strokeColor}
        className="animate-glow-breathe"
      />
    </svg>
  );
}
