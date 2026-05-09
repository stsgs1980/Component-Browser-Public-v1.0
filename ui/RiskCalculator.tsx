'use client';

/**
 * RiskCalculator — A collapsible panel for computing position size based on
 * account balance, risk-per-trade percentage, and ATR (Average True Range).
 * Calculates dollar risk, stop distance, contract position size, and notional
 * contract value. All inputs are provided via props; ATR is calculated internally
 * from a provided `atr14` value.
 *
 * @example
 * ```tsx
 * <RiskCalculator
 *   currentPrice={72.50}
 *   atr14={1.23}
 *   decimals={2}
 *   balance={100000}
 *   riskPercent={2}
 *   multiplier={1000}
 * />
 * ```
 */

import { useState, useMemo } from 'react';
// lucide-react dependency: import { ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react'
import { ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react';

export interface RiskCalculatorProps {
  /** Current market price. */
  currentPrice: number;
  /** 14-period Average True Range value. */
  atr14: number;
  /** Number of decimal places for price display. Default: 2. */
  decimals?: number;
  /** Starting account balance. Default: 100 000. */
  balance?: number;
  /** Risk per trade as a percentage of account balance. Default: 2. */
  riskPercent?: number;
  /** Contract multiplier (units per contract). Default: 1000. */
  multiplier?: number;
}

const ATR_MULTIPLIERS = [1, 1.5, 2, 2.5, 3] as const;
type ATRMultiple = (typeof ATR_MULTIPLIERS)[number];

function formatWithCommas(n: number): string {
  return n.toLocaleString('en-US');
}

function RiskMetricCard({
  label,
  value,
  color = 'text-white',
  subtext,
}: {
  label: string;
  value: string;
  color?: string;
  subtext?: string;
}) {
  return (
    <div className="metric-card-enhanced rounded-md px-2.5 py-1.5">
      <div className="data-label">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${color}`}>{value}</div>
      {subtext && <div className="text-[9px] text-gray-600 tabular-nums">{subtext}</div>}
    </div>
  );
}

export function RiskCalculator(props: RiskCalculatorProps) {
  const {
    currentPrice,
    atr14,
    decimals = 2,
    balance: initialBalance = 100000,
    riskPercent: initialRisk = 2,
    multiplier = 1000,
  } = props;

  const [collapsed, setCollapsed] = useState(false);
  const [accountBalance, setAccountBalance] = useState(initialBalance);
  const [riskPercent, setRiskPercent] = useState(initialRisk);
  const [atrMultiple, setAtrMultiple] = useState<ATRMultiple>(2);

  // Calculated results
  const calculations = useMemo(() => {
    const dollarRisk = accountBalance * (riskPercent / 100);
    const stopDistance = atr14 * atrMultiple;
    const positionSize = stopDistance > 0 ? Math.max(0, Math.floor(dollarRisk / (stopDistance * multiplier))) : 0;
    const contractValue = positionSize * multiplier * currentPrice;
    return { dollarRisk, stopDistance, positionSize, contractValue };
  }, [accountBalance, riskPercent, atr14, atrMultiple, multiplier, currentPrice]);

  return (
    <div>
      {/* Collapsible Header */}
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-2 mb-2 group">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Risk Calculator</span>
        <span className="text-[8px] text-gray-600 ml-1">CALCULATED</span>
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
        ) : (
          <ChevronDown className="w-3 h-3 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
        )}
      </button>

      {!collapsed && (
        <div className="space-y-3">
          {/* Inputs Section */}
          <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] p-3 space-y-3">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider">Position Sizing Inputs</div>

            {/* Account Balance */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="data-label">Account Balance</span>
                <span className="text-[10px] font-semibold tabular-nums text-amber-400">
                  ${formatWithCommas(accountBalance)}
                </span>
              </div>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-7 rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 text-[11px] font-semibold tabular-nums text-white focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Risk Per Trade Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="data-label">Risk Per Trade</span>
                <span className="text-[10px] font-semibold tabular-nums text-amber-400">{riskPercent}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={riskPercent}
                onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                className="w-full h-1.5 appearance-none bg-white/[0.06] rounded-full outline-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400
                  [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(245,158,11,0.4)]
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(245,158,11,0.6)]"
              />
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[8px] text-gray-600">0.5%</span>
                <span className="text-[8px] text-gray-600">5%</span>
              </div>
            </div>

            {/* ATR Multiple Buttons */}
            <div>
              <span className="data-label">Stop Loss (ATR Multiple)</span>
              <div className="flex gap-1.5 mt-1.5">
                {ATR_MULTIPLIERS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setAtrMultiple(m)}
                    className={`flex-1 h-7 rounded text-[10px] font-semibold transition-all ${
                      atrMultiple === m
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-white/[0.03] text-gray-500 border border-transparent hover:text-gray-300 hover:border-white/[0.06]'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculated Results */}
          <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] p-3 space-y-2">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Calculated Results</div>

            {/* Current ATR */}
            <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-white/[0.03] border border-white/[0.03]">
              <span className="text-[10px] text-gray-400">Current ATR (14)</span>
              <span className="text-[11px] font-bold tabular-nums text-amber-400">
                {atr14 > 0 ? atr14.toFixed(decimals) : '—'}
              </span>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              <RiskMetricCard
                label="Dollar Risk"
                value={`$${formatWithCommas(Math.round(calculations.dollarRisk))}`}
                color="text-red-400"
                subtext={`${riskPercent}% of ${formatWithCommas(accountBalance)}`}
              />
              <RiskMetricCard
                label="Stop Distance"
                value={calculations.stopDistance > 0 ? calculations.stopDistance.toFixed(decimals) : '—'}
                color="text-orange-400"
                subtext={`${atrMultiple}x ATR in price`}
              />
              <RiskMetricCard
                label="Position Size"
                value={calculations.positionSize > 0 ? `${calculations.positionSize} contracts` : '—'}
                color="text-green-400"
                subtext="Rounded down"
              />
              <RiskMetricCard
                label="Contract Value"
                value={calculations.contractValue > 0 ? `$${formatWithCommas(Math.round(calculations.contractValue))}` : '—'}
                color="text-white"
                subtext="Notional value"
              />
            </div>
          </div>

          {/* Quick Reference — Contract Specs */}
          <div className="bg-white/[0.02] rounded-lg border border-white/[0.04] p-3">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Contract Specs</div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-500">Multiplier</span>
                <span className="font-semibold tabular-nums text-gray-300">{formatWithCommas(multiplier)} units/contract</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
