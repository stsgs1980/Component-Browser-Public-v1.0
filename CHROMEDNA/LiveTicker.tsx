'use client';

/**
 * LiveTicker — A horizontally scrolling ticker bar that displays a list of
 * symbol/price items with change arrows and percentage moves. Items are
 * quadrupled for seamless infinite-scroll CSS animation. Includes optional
 * live indicator dot.
 *
 * @example
 * ```tsx
 * <LiveTicker
 *   items={[
 *     { symbol: 'AAPL', price: 195.83, change: 1.24, changePercent: 0.64, isUp: true },
 *     { symbol: 'TSLA', price: 248.50, change: -3.12, changePercent: -1.24, isUp: false },
 *   ]}
 *   isLive={true}
 *   decimals={2}
 * />
 * ```
 */

import { useMemo } from 'react';
// lucide-react dependency: import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/** A single item shown in the scrolling ticker. */
export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  isUp: boolean;
}

export interface LiveTickerProps {
  /** Items to display in the ticker. */
  items: TickerItem[];
  /** Whether to show a pulsing green "LIVE" indicator dot. Default: false. */
  isLive?: boolean;
  /** Number of decimal places for price and change values. Default: 2. */
  decimals?: number;
}

export function LiveTicker(props: LiveTickerProps) {
  const { items, isLive = false, decimals = 2 } = props;

  // Quadruple items for seamless CSS scroll animation
  const scrollItems = useMemo(() => [...items, ...items, ...items, ...items], [items]);

  if (items.length === 0) return null;

  return (
    <div
      className="relative h-7 overflow-hidden select-none"
      style={{
        background: 'rgba(3, 3, 8, 0.75)',
        backdropFilter: 'blur(16px) saturate(1.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      {/* Gradient fades on edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(3,3,8,0.95), transparent)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(3,3,8,0.95), transparent)' }}
      />

      {/* Scrolling content — uses CSS animation class `animate-ticker-scroll` */}
      <div className="flex items-center h-full animate-ticker-scroll">
        {scrollItems.map((item, idx) => {
          const isNeutral = Math.abs(item.change) <= 0.00001;
          return (
            <div key={`${item.symbol}-${idx}`} className="flex items-center gap-1.5 px-3 flex-shrink-0">
              {/* Symbol */}
              <span className="text-[11px] font-bold text-amber-400/90 tracking-wide">{item.symbol}</span>

              {/* Price */}
              <span className="text-[11px] font-semibold text-gray-200 tabular-nums number-transition">
                {item.price.toFixed(decimals)}
              </span>

              {/* Change arrow + value */}
              <div
                className={`flex items-center gap-0.5 ${
                  item.isUp ? 'text-green-400' : isNeutral ? 'text-gray-500' : 'text-red-400'
                }`}
              >
                {item.isUp ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : isNeutral ? (
                  <Minus className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                <span className="text-[10px] font-medium tabular-nums number-transition">
                  {item.isUp ? '+' : ''}
                  {item.change.toFixed(decimals)}
                </span>
                <span className="text-[9px] font-medium tabular-nums number-transition opacity-70">
                  ({item.isUp ? '+' : ''}
                  {item.changePercent.toFixed(2)}%)
                </span>
              </div>

              {/* Separator dot */}
              <span className="text-amber-500/40 text-[8px] ml-1.5">●</span>
            </div>
          );
        })}
      </div>

      {/* Live indicator */}
      {isLive && (
        <div className="absolute left-14 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse glow-dot-green" />
        </div>
      )}
    </div>
  );
}
