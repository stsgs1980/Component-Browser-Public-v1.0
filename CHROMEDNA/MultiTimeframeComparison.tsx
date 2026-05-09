'use client';

/**
 * MultiTimeframeComparison — A collapsible panel that displays price and
 * percentage change across multiple timeframes (e.g. 1H, 4H, 1D, 1W).
 * Computes a consensus direction from the individual timeframe directions
 * and renders a colour-coded summary.
 *
 * @example
 * ```tsx
 * <MultiTimeframeComparison
 *   timeframes={[
 *     { label: '1H', price: 72.50, changePct: 0.64, direction: 'up' },
 *     { label: '4H', price: 72.18, changePct: -0.12, direction: 'down' },
 *     { label: '1D', price: 72.30, changePct: 0.42, direction: 'up' },
 *     { label: '1W', price: 71.05, changePct: 2.18, direction: 'up' },
 *   ]}
 * />
 * ```
 */

import { useState, useMemo } from 'react';
// lucide-react dependency: import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MultiTimeframeComparisonProps {
  /** Array of timeframe data rows. */
  timeframes: {
    label: string;
    price: number;
    changePct: number;
    direction: 'up' | 'down' | 'flat';
  }[];
}

export function MultiTimeframeComparison(props: MultiTimeframeComparisonProps) {
  const { timeframes } = props;
  const [isOpen, setIsOpen] = useState(true);

  // Consensus: net direction score from all timeframes
  const consensus = useMemo(() => {
    if (timeframes.length === 0) return { direction: 'flat' as const, score: 0 };
    const score = timeframes.reduce((sum, tf) => {
      if (tf.direction === 'up') return sum + 1;
      if (tf.direction === 'down') return sum - 1;
      return sum;
    }, 0);
    if (score > 0) return { direction: 'up' as const, score };
    if (score < 0) return { direction: 'down' as const, score };
    return { direction: 'flat' as const, score: 0 };
  }, [timeframes]);

  const directionIcon = (dir: 'up' | 'down' | 'flat') => {
    if (dir === 'up') return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (dir === 'down') return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-amber-400" />;
  };

  const directionColor = (dir: 'up' | 'down' | 'flat') => {
    if (dir === 'up') return 'text-green-400';
    if (dir === 'down') return 'text-red-400';
    return 'text-amber-400';
  };

  const changeColor = (pct: number) => {
    if (pct > 0.01) return 'text-green-400';
    if (pct < -0.01) return 'text-red-400';
    return 'text-amber-400';
  };

  return (
    <div className="glass-card-enhanced rounded-lg">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.02] transition-colors rounded-t-lg"
      >
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Multi-Timeframe</span>
        <span className="text-[9px] text-gray-600 ml-1">{timeframes.length} TFs</span>
        <div className="ml-auto flex items-center gap-1.5">
          {consensus.direction !== 'flat' && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                consensus.direction === 'up' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
              }`}
            >
              {consensus.direction === 'up' ? 'BULLISH' : 'BEARISH'}
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-1.5">
          {/* Table header */}
          <div className="flex items-center gap-2 text-[8px] text-gray-600 uppercase tracking-wider px-1">
            <span className="w-8">TF</span>
            <span className="flex-1 text-right">Price</span>
            <span className="w-16 text-right">Change</span>
            <span className="w-5 text-center">Dir</span>
          </div>

          {/* Timeframe rows */}
          {timeframes.map((tf, i) => (
            <div
              key={tf.label}
              className="flex items-center gap-2 metric-card-enhanced rounded-md px-2.5 py-1.5"
            >
              <span className="text-[10px] font-bold text-amber-400 w-8 tracking-wide">{tf.label}</span>
              <span className="flex-1 text-right text-[11px] font-semibold tabular-nums text-white">
                {tf.price.toFixed(2)}
              </span>
              <span className={`w-16 text-right text-[10px] font-semibold tabular-nums ${changeColor(tf.changePct)}`}>
                {tf.changePct >= 0 ? '+' : ''}
                {tf.changePct.toFixed(2)}%
              </span>
              <span className="w-5 flex justify-center">{directionIcon(tf.direction)}</span>
            </div>
          ))}

          {/* Consensus row */}
          <div className="flex items-center gap-2 rounded-md px-2.5 py-2 mt-2 border-t border-white/[0.06]">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Consensus</span>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              {/* Mini bar showing up/down/flat count */}
              <div className="flex gap-[2px]">
                {timeframes.map((tf, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-3 rounded-sm"
                    style={{
                      backgroundColor: tf.direction === 'up' ? '#4ade80' : tf.direction === 'down' ? '#f87171' : '#fbbf24',
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
              <span className={`text-[10px] font-bold uppercase ${directionColor(consensus.direction)}`}>
                {consensus.direction === 'up' ? 'Bullish' : consensus.direction === 'down' ? 'Bearish' : 'Neutral'}
              </span>
              {directionIcon(consensus.direction)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export ChevronDown/ChevronRight for this component (they come from lucide-react)
import { ChevronDown, ChevronRight } from 'lucide-react';
