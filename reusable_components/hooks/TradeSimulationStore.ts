/**
 * TradeSimulationStore.ts
 *
 * A Zustand-based paper trading engine. Tracks positions, trade history,
 * equity curve, and derived statistics (win rate, max drawdown, total P&L).
 *
 * Fully de-hardcoded — no domain-specific types. Uses generic `string` for
 * symbols so it works with equities, crypto, commodities, or any asset class.
 *
 * Usage:
 * ```ts
 * import { createTradeStore, type TradeState, type PaperTrade, type PaperPosition } from './TradeSimulationStore';
 *
 * const useTradeStore = createTradeStore({ startingBalance: 100_000, contractMultiplier: 1000 });
 * const state = useTradeStore.getState();
 * state.openTrade('BUY', 72.50, 5, 'CL');       // buy 5 contracts at 72.50
 * state.closePosition(73.10);                     // close at 73.10
 * const stats = getTradeStats(state);
 * ```
 */

import { create } from 'zustand';

// ─── Type definitions ───────────────────────────────────────────────

export type TradeSide = 'BUY' | 'SELL';
export type PositionSide = 'Long' | 'Short' | 'Flat';

/** A completed (closed) paper trade */
export interface PaperTrade {
  id: string;
  symbol: string;
  side: TradeSide;
  price: number;
  quantity: number;
  pnl: number;
  timestamp: number;
}

/** Current open position */
export interface PaperPosition {
  side: PositionSide;
  entryPrice: number;
  quantity: number;
}

/** Full state shape managed by the store */
export interface TradeState {
  /** Current open position */
  position: PaperPosition;
  /** Completed trade history (most recent first, capped at 50) */
  tradeHistory: PaperTrade[];
  /** Account balances */
  startingBalance: number;
  currentBalance: number;
  /** Last N trade-ending balances for equity curve charting */
  equityCurve: number[];

  // ─── Actions ───
  openTrade: (side: TradeSide, price: number, quantity: number, symbol: string) => void;
  closePosition: (currentPrice: number) => void;
  resetAccount: () => void;
}

/** Configuration passed to the factory function */
export interface TradeStoreConfig {
  /** Starting account balance (default 100 000) */
  startingBalance?: number;
  /** Contract multiplier used for P&L calculation (default 1000) */
  contractMultiplier?: number;
}

// ─── Factory function ───────────────────────────────────────────────

/**
 * Creates a Zustand paper trading store with configurable parameters.
 *
 * @param config - Optional configuration for starting balance and contract multiplier.
 * @returns A Zustand hook (`useTradeStore`) bound to the given config.
 */
export function createTradeStore(config: TradeStoreConfig = {}) {
  const { startingBalance = 100_000, contractMultiplier = 1000 } = config;

  // ─── Internal helpers (scoped to each store instance) ─────────

  function calcUnrealizedPnl(position: PaperPosition, currentPrice: number): number {
    if (position.side === 'Flat') return 0;
    const direction = position.side === 'Long' ? 1 : -1;
    return direction * (currentPrice - position.entryPrice) * position.quantity * contractMultiplier;
  }

  // ─── Zustand store ────────────────────────────────────────────

  const useTradeStore = create<TradeState>((set, get) => ({
    position: { side: 'Flat', entryPrice: 0, quantity: 0 },
    tradeHistory: [],
    startingBalance,
    currentBalance: startingBalance,
    equityCurve: [startingBalance],

    openTrade: (side, price, quantity, symbol) => {
      const state = get();
      const position = state.position;

      // If flat, open new position
      if (position.side === 'Flat') {
        set({
          position: {
            side: side === 'BUY' ? 'Long' : 'Short',
            entryPrice: price,
            quantity,
          },
        });
        return;
      }

      // If same direction, add to position (average entry price)
      const isSameDirection =
        (position.side === 'Long' && side === 'BUY') ||
        (position.side === 'Short' && side === 'SELL');

      if (isSameDirection) {
        const totalQty = position.quantity + quantity;
        const avgPrice = (position.entryPrice * position.quantity + price * quantity) / totalQty;
        set({
          position: {
            ...position,
            entryPrice: avgPrice,
            quantity: totalQty,
          },
        });
        return;
      }

      // Opposite direction: close position and realize P&L
      const pnl = calcUnrealizedPnl(position, price);
      const closeQty = Math.min(position.quantity, quantity);
      const realizedPnl = (pnl / position.quantity) * closeQty;

      const trade: PaperTrade = {
        id: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        symbol,
        side,
        price,
        quantity: closeQty,
        pnl: realizedPnl,
        timestamp: Date.now(),
      };

      const newBalance = state.currentBalance + realizedPnl;
      const remainingQty = position.quantity - closeQty;

      let newPosition: PaperPosition;
      if (remainingQty > 0) {
        // Partial close — keep rest of position
        newPosition = { ...position, quantity: remainingQty };
      } else if (quantity > closeQty) {
        // Reversed — open new position with excess quantity
        const excessQty = quantity - closeQty;
        newPosition = {
          side: side === 'BUY' ? 'Long' : 'Short',
          entryPrice: price,
          quantity: excessQty,
        };
      } else {
        newPosition = { side: 'Flat', entryPrice: 0, quantity: 0 };
      }

      const newEquityCurve = [...state.equityCurve, newBalance].slice(-10);

      set({
        position: newPosition,
        tradeHistory: [trade, ...state.tradeHistory].slice(0, 50),
        currentBalance: newBalance,
        equityCurve: newEquityCurve,
      });
    },

    closePosition: (currentPrice) => {
      const state = get();
      const position = state.position;

      if (position.side === 'Flat') return;

      const pnl = calcUnrealizedPnl(position, currentPrice);

      const trade: PaperTrade = {
        id: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        symbol: '', // can be enriched by the caller
        side: position.side === 'Long' ? 'SELL' : 'BUY',
        price: currentPrice,
        quantity: position.quantity,
        pnl,
        timestamp: Date.now(),
      };

      const newBalance = state.currentBalance + pnl;
      const newEquityCurve = [...state.equityCurve, newBalance].slice(-10);

      set({
        position: { side: 'Flat', entryPrice: 0, quantity: 0 },
        tradeHistory: [trade, ...state.tradeHistory].slice(0, 50),
        currentBalance: newBalance,
        equityCurve: newEquityCurve,
      });
    },

    resetAccount: () => {
      set({
        position: { side: 'Flat', entryPrice: 0, quantity: 0 },
        tradeHistory: [],
        startingBalance,
        currentBalance: startingBalance,
        equityCurve: [startingBalance],
      });
    },
  }));

  return useTradeStore;
}

// ─── Derived statistics helper ──────────────────────────────────────

/**
 * Computes derived trade statistics from a store snapshot.
 *
 * @param state - The current `TradeState` (from `useTradeStore.getState()`)
 * @returns Total P&L, win rate (%), max drawdown (%), and total trade count
 */
export function getTradeStats(state: TradeState) {
  const trades = state.tradeHistory;
  const totalPnl = state.currentBalance - state.startingBalance;
  const wins = trades.filter((t) => t.pnl > 0).length;
  const total = trades.length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  // Max drawdown
  let peak = state.startingBalance;
  let maxDrawdown = 0;
  let runningBalance = state.startingBalance;

  for (const trade of [...trades].reverse()) {
    runningBalance += trade.pnl;
    if (runningBalance > peak) peak = runningBalance;
    const dd = ((peak - runningBalance) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  return { totalPnl, winRate, maxDrawdown, totalTrades: total };
}
