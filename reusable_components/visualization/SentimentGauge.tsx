'use client';

/**
 * SentimentGauge — A semicircular SVG gauge that visualizes a single numeric value
 * across configurable zones. Includes animated needle, sparkline of historical
 * readings, and a component breakdown section.
 *
 * @example
 * ```tsx
 * <SentimentGauge
 *   value={42}
 *   zones={[
 *     { label: 'Low', min: -100, max: -25, color: '#ef4444' },
 *     { label: 'Neutral', min: -25, max: 25, color: '#fbbf24' },
 *     { label: 'High', min: 25, max: 100, color: '#22c55e' },
 *   ]}
 *   historicalReadings={[-20, 10, 35, 60, 42]}
 *   components={[
 *     { name: 'Signal A', value: 72 },
 *     { name: 'Signal B', value: 45 },
 *     { name: 'Signal C', value: 58 },
 *   ]}
 * />
 * ```
 */

import { useMemo, useRef, useEffect, useState } from 'react';
// lucide-react dependency: import { Gauge as GaugeIcon } from 'lucide-react'
import { Gauge as GaugeIcon } from 'lucide-react';

/** Definition of a single gauge zone. */
export interface GaugeZone {
  label: string;
  min: number;
  max: number;
  color: string;
}

/** A named component that feeds into the overall sentiment value. */
export interface SentimentComponent {
  name: string;
  value: number;
}

export interface SentimentGaugeProps {
  /** The current sentiment value, typically in the range -100 to +100. */
  value: number;
  /** Configurable zones displayed as coloured arcs on the gauge. Falls back to 5 default zones if omitted. */
  zones?: GaugeZone[];
  /** An array of historical readings rendered as a small sparkline below the gauge. */
  historicalReadings?: number[];
  /** Up to 3 named components shown in the breakdown grid. */
  components?: SentimentComponent[];
}

// Default 5-zone configuration matching the original CHROMEDNA layout
const DEFAULT_ZONES: GaugeZone[] = [
  { label: 'Extreme Fear', min: -100, max: -50, color: '#ef4444' },
  { label: 'Fear', min: -50, max: -15, color: '#f97316' },
  { label: 'Neutral', min: -15, max: 15, color: '#fbbf24' },
  { label: 'Greed', min: 15, max: 50, color: '#4ade80' },
  { label: 'Extreme Greed', min: 50, max: 100, color: '#22c55e' },
];

function getZoneForValue(value: number, zones: GaugeZone[]) {
  for (const zone of zones) {
    if (value >= zone.min && value < zone.max) return zone;
  }
  if (value >= zones[zones.length - 1].min) return zones[zones.length - 1];
  return zones[0];
}

export function SentimentGauge(props: SentimentGaugeProps) {
  const { value, zones = DEFAULT_ZONES, historicalReadings = [], components = [] } = props;

  // Animated needle position
  const [displayValue, setDisplayValue] = useState(0);
  const targetValueRef = useRef(0);

  // Smooth needle animation via requestAnimationFrame
  useEffect(() => {
    targetValueRef.current = value;
  }, [value]);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setDisplayValue((prev) => {
        const target = targetValueRef.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.08;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const currentZone = getZoneForValue(value, zones);

  // SVG gauge geometry
  const gaugeWidth = 240;
  const gaugeHeight = 130;
  const cx = gaugeWidth / 2;
  const cy = gaugeHeight - 15;
  const outerR = 95;
  const innerR = 70;

  // Map angle (degrees) to cartesian position on the semicircle
  const polarToCartesian = (angleDeg: number, radius: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
    };
  };

  // Value (-100 to 100) mapped to angle (180° left to 0° right)
  const valueToAngle = (val: number) => 180 - ((val + 100) / 200) * 180;

  // Build SVG arc paths for each zone
  const zoneArcs = zones.map((zone) => {
    const startAngle = valueToAngle(zone.max);
    const endAngle = valueToAngle(zone.min);
    const start = polarToCartesian(startAngle, outerR);
    const end = polarToCartesian(endAngle, outerR);
    const startInner = polarToCartesian(startAngle, innerR);
    const endInner = polarToCartesian(endAngle, innerR);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const path = [
      `M ${start.x} ${start.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ');

    return { path, color: zone.color, label: zone.label };
  });

  // Needle geometry
  const needleAngle = valueToAngle(displayValue);
  const needleTip = polarToCartesian(needleAngle, outerR - 5);
  const needleBase1 = polarToCartesian(needleAngle - 3, 12);
  const needleBase2 = polarToCartesian(needleAngle + 3, 12);

  // Tick marks
  const ticks = [];
  const globalMin = zones[0].min;
  const globalMax = zones[zones.length - 1].max;
  for (let val = globalMin; val <= globalMax; val += 25) {
    const angle = valueToAngle(val);
    const outer = polarToCartesian(angle, outerR + 3);
    const inner = polarToCartesian(angle, outerR - (val % 50 === 0 ? 8 : 4));
    ticks.push({ x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, isMajor: val % 50 === 0 });
  }

  // Sparkline for historical readings
  const sparklineWidth = 200;
  const sparklineHeight = 24;
  const sparklinePoints =
    historicalReadings.length > 1
      ? historicalReadings
          .map((v, i) => {
            const x = (i / (historicalReadings.length - 1)) * sparklineWidth;
            const y = sparklineHeight / 2 - (v / 100) * (sparklineHeight / 2 - 2);
            return `${x},${y}`;
          })
          .join(' ')
      : '';

  const zeroLineColor = '#6b7280';

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <GaugeIcon className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sentiment Gauge</span>
      </div>
      <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] p-3">
        {/* SVG Semicircular Gauge */}
        <svg
          width="100%"
          viewBox={`0 0 ${gaugeWidth} ${gaugeHeight}`}
          className="w-full max-w-[260px] mx-auto"
        >
          {/* Zone arcs */}
          {zoneArcs.map((arc, i) => (
            <path key={i} d={arc.path} fill={arc.color} opacity="0.25" />
          ))}

          {/* Active zone highlight */}
          {(() => {
            const activeArc = zoneArcs.find((a) => a.label === currentZone.label);
            if (!activeArc) return null;
            return <path d={activeArc.path} fill={activeArc.color} opacity="0.55" />;
          })()}

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.isMajor ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}
              strokeWidth={tick.isMajor ? 1.5 : 0.75}
            />
          ))}

          {/* Labels at extremes */}
          <text
            x={polarToCartesian(180, outerR + 14).x}
            y={polarToCartesian(180, outerR + 14).y}
            textAnchor="middle"
            fill="#ef4444"
            fontSize="8"
            fontWeight="bold"
            opacity="0.7"
          >
            {globalMin}
          </text>
          <text
            x={polarToCartesian(90, outerR + 14).x}
            y={polarToCartesian(90, outerR + 14).y}
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="8"
            fontWeight="bold"
            opacity="0.7"
          >
            0
          </text>
          <text
            x={polarToCartesian(0, outerR + 14).x}
            y={polarToCartesian(0, outerR + 14).y}
            textAnchor="middle"
            fill="#22c55e"
            fontSize="8"
            fontWeight="bold"
            opacity="0.7"
          >
            +{globalMax}
          </text>

          {/* Zero line */}
          {(() => {
            const zeroTop = polarToCartesian(90, outerR);
            const zeroBottom = polarToCartesian(90, innerR);
            return (
              <line
                x1={zeroTop.x}
                y1={zeroTop.y}
                x2={zeroBottom.x}
                y2={zeroBottom.y}
                stroke={zeroLineColor}
                strokeWidth="1"
                opacity="0.4"
              />
            );
          })()}

          {/* Needle */}
          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
            fill={currentZone.color}
            opacity="0.9"
            style={{ filter: `drop-shadow(0 0 3px ${currentZone.color}60)` }}
          />

          {/* Center circle */}
          <circle cx={cx} cy={cy} r="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="3" fill={currentZone.color} opacity="0.7" />

          {/* Glow filter */}
          <defs>
            <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Current reading label and value */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentZone.color, boxShadow: `0 0 6px ${currentZone.color}60` }}
            />
            <span className="text-xs font-bold" style={{ color: currentZone.color }}>
              {currentZone.label}
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums" style={{ color: currentZone.color }}>
            {displayValue >= 0 ? '+' : ''}
            {Math.round(displayValue)}
          </span>
        </div>

        {/* Component breakdown */}
        {components.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mt-2.5">
            {components.map((comp) => (
              <div key={comp.name} className="metric-card-enhanced rounded px-2 py-1">
                <div className="data-label">{comp.name}</div>
                <div className="text-[10px] font-semibold tabular-nums text-amber-400">{comp.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Historical sparkline */}
        {historicalReadings.length > 1 && (
          <div className="mt-2.5 pt-2 border-t border-white/[0.04]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-gray-600 uppercase tracking-wider">Historical Trend</span>
              <span className="text-[8px] text-gray-600">Last {historicalReadings.length} readings</span>
            </div>
            <svg
              width="100%"
              height={sparklineHeight + 8}
              viewBox={`0 0 ${sparklineWidth} ${sparklineHeight + 8}`}
              className="w-full"
            >
              {/* Zero line */}
              <line
                x1="0"
                y1={sparklineHeight / 2 + 4}
                x2={sparklineWidth}
                y2={sparklineHeight / 2 + 4}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
              {/* Area fill */}
              {sparklinePoints &&
                (() => {
                  const points = sparklinePoints.split(' ');
                  const firstX = points[0].split(',')[0];
                  const lastX = points[points.length - 1].split(',')[0];
                  const areaPath = `M ${firstX},${sparklineHeight / 2 + 4} ${points.map((p) => `L ${p}`).join(' ')} L ${lastX},${sparklineHeight / 2 + 4} Z`;
                  return <path d={areaPath} fill={currentZone.color} opacity="0.08" />;
                })()}
              {/* Line */}
              {sparklinePoints && (
                <polyline
                  points={sparklinePoints}
                  fill="none"
                  stroke={currentZone.color}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                  transform="translate(0, 4)"
                />
              )}
              {/* Current dot */}
              {historicalReadings.length > 0 &&
                (() => {
                  const lastVal = historicalReadings[historicalReadings.length - 1];
                  const x = sparklineWidth;
                  const y = sparklineHeight / 2 - (lastVal / 100) * (sparklineHeight / 2 - 2) + 4;
                  return <circle cx={x} cy={y} r="2.5" fill={currentZone.color} opacity="0.8" />;
                })()}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
