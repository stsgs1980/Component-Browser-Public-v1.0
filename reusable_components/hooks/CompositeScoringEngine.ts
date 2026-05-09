/**
 * CompositeScoringEngine.ts
 *
 * A reusable, domain-agnostic multi-component scoring engine.
 *
 * Computes a weighted composite score from 7 sub-scores (Trend, Volume,
 * Delta, Sentiment, Seasonal, External, Momentum). Each sub-score is
 * normalised to 0–100 and classified as BULLISH / NEUTRAL / BEARISH.
 *
 * The engine accepts any candle-shaped data via the `ScoreableCandle`
 * interface and optional extended fields for domain-specific scoring
 * (e.g. delta, sentiment, seasonal factor, etc.).
 *
 * Usage:
 * ```ts
 * import { calculateCompositeScore, type CompositeResult, type ScoreableCandle } from './CompositeScoringEngine';
 *
 * const candles: ScoreableCandle[] = yourData.map(d => ({
 *   close: d.close,
 *   open: d.open,
 *   high: d.high,
 *   low: d.low,
 *   volume: d.volume,
 *   delta: d.buyVolume - d.sellVolume,          // optional
 *   sentiment: d.eiaExpectation,                  // optional
 *   externalFactor: d.weatherImpact ?? 0,         // optional
 *   seasonalFactor: d.seasonalFactor ?? 1,        // optional
 * }));
 *
 * const result: CompositeResult = calculateCompositeScore(candles);
 * // result.score    → 0–100
 * // result.signal   → 'BULLISH' | 'NEUTRAL' | 'BEARISH'
 * // result.confidence → 0–100 (how aligned the components are)
 * // result.components → detailed per-component breakdown
 * ```
 */

// ─── Generic interfaces ────────────────────────────────────────────

export type SignalType = 'BULLISH' | 'NEUTRAL' | 'BEARISH';

/** A single scoring sub-component result */
export interface ScoreItem {
  name: string;
  weight: number;
  value: number; // 0–100
  signal: SignalType;
}

/** The composite output returned by the scoring engine */
export interface CompositeResult {
  score: number;        // weighted average 0–100
  signal: SignalType;
  confidence: number;   // 0–100, how many components agree
  components: ScoreItem[];
}

/**
 * Minimal candle shape required by the engine.
 * Extended fields are optional — when absent, their respective
 * sub-scores default to 50 (neutral).
 */
export interface ScoreableCandle {
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  /** Buy-sell delta (optional) — used by Delta component */
  delta?: number;
  /** Domain-specific sentiment tag (optional) — used by Sentiment component.
   *  Interpretation is up to the caller via `sentimentMap`. */
  sentiment?: string;
  /** Continuous external factor (optional) — e.g. weather impact, news score.
   *  Normalised around 0 (neutral). Positive = bullish. */
  externalFactor?: number;
  /** Seasonal factor (optional). 1 = neutral, >1 = bullish, <1 = bearish. */
  seasonalFactor?: number;
}

/** Configuration for the sentiment sub-score mapper */
export interface SentimentMap {
  /** Map sentiment tag values to a bullish score offset from 50.
   *  Example: { draw: 22, build: -22 }  → draw yields 72, build yields 28. */
  [key: string]: number;
}

/** Optional configuration for the scoring engine */
export interface ScoringConfig {
  /** Custom sentiment tag → offset mapping (default: none) */
  sentimentMap?: SentimentMap;
  /** Bullish/neutral threshold (default 58) */
  bullishThreshold?: number;
  /** Neutral/bearish threshold (default 42) */
  bearishThreshold?: number;
}

// ─── Internal helpers ───────────────────────────────────────────────

function computeSignal(value: number, thresholds: [number, number] = [40, 60]): SignalType {
  if (value >= thresholds[1]) return 'BULLISH';
  if (value <= thresholds[0]) return 'BEARISH';
  return 'NEUTRAL';
}

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

// ─── Sub-score components ──────────────────────────────────────────

/** Trend Score: moving-average alignment + recent momentum */
function computeTrendScore(candles: ScoreableCandle[]): ScoreItem {
  if (candles.length < 20) {
    return { name: 'Trend', weight: 20, value: 50, signal: 'NEUTRAL' };
  }

  const closes = candles.map((c) => c.close);
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const sma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const sma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const current = closes[closes.length - 1];

  let score = 50;

  if (current > sma10) score += 10;
  if (current > sma20) score += 10;
  if (sma10 > sma20) score += 10;
  if (sma5 > sma10) score += 5;

  if (current < sma10) score -= 10;
  if (current < sma20) score -= 10;
  if (sma10 < sma20) score -= 10;
  if (sma5 < sma10) score -= 5;

  const recentChange = (current - closes[closes.length - 5]) / closes[closes.length - 5];
  score += Math.max(-15, Math.min(15, recentChange * 1000));

  return { name: 'Trend', weight: 20, value: clamp(score), signal: computeSignal(score) };
}

/** Volume Score: recent volume vs average, direction-aware */
function computeVolumeScore(candles: ScoreableCandle[]): ScoreItem {
  if (candles.length < 10) {
    return { name: 'Volume', weight: 15, value: 50, signal: 'NEUTRAL' };
  }

  const volumes = candles.map((c) => c.volume);
  const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumes.length);
  const recentVol = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const volRatio = recentVol / avgVol;

  const recentCandles = candles.slice(-3);
  const isUp =
    recentCandles.filter((c) => c.close > c.open).length >
    recentCandles.filter((c) => c.close < c.open).length;

  let score = 50;
  if (volRatio > 1.5) score += isUp ? 25 : -25;
  else if (volRatio > 1.2) score += isUp ? 15 : -15;
  else if (volRatio < 0.7) score -= 5;

  return { name: 'Volume', weight: 15, value: clamp(score), signal: computeSignal(score) };
}

/** Delta Score: net buy vs sell pressure */
function computeDeltaScore(candles: ScoreableCandle[]): ScoreItem {
  if (candles.length < 5) {
    return { name: 'Delta', weight: 15, value: 50, signal: 'NEUTRAL' };
  }

  const recentCandles = candles.slice(-10);
  const totalDelta = recentCandles.reduce((sum, c) => sum + (c.delta || 0), 0);
  const totalVolume = recentCandles.reduce((sum, c) => sum + c.volume, 0);
  const deltaRatio = totalVolume > 0 ? totalDelta / totalVolume : 0;

  let score = 50 + deltaRatio * 300;
  score = clamp(score, 0, 100);

  return { name: 'Delta', weight: 15, value: Math.round(score), signal: computeSignal(score) };
}

/** Sentiment Score: based on a configurable sentiment tag on candles */
function computeSentimentScore(candles: ScoreableCandle[], sentimentMap?: SentimentMap): ScoreItem {
  if (!sentimentMap) {
    return { name: 'Sentiment', weight: 15, value: 50, signal: 'NEUTRAL' };
  }

  const tagged = candles.filter((c) => c.sentiment && sentimentMap[c.sentiment] !== undefined);

  if (tagged.length === 0) {
    return { name: 'Sentiment', weight: 15, value: 50, signal: 'NEUTRAL' };
  }

  const latest = tagged[tagged.length - 1];
  let score = 50;

  if (latest.sentiment && sentimentMap[latest.sentiment] !== undefined) {
    score += sentimentMap[latest.sentiment];
  }

  // If the candle closed up, boost the signal
  if (latest.close > latest.open) score += 8;
  else score -= 8;

  return { name: 'Sentiment', weight: 15, value: clamp(score), signal: computeSignal(score) };
}

/** External Score: continuous external factor (e.g. weather, news) */
function computeExternalScore(candles: ScoreableCandle[]): ScoreItem {
  const recentCandles = candles.slice(-5);
  const hasExternal = recentCandles.some((c) => c.externalFactor !== undefined);

  if (!hasExternal) {
    return { name: 'External', weight: 10, value: 50, signal: 'NEUTRAL' };
  }

  const avg = recentCandles.reduce((sum, c) => sum + (c.externalFactor || 0), 0) / recentCandles.length;
  let score = 50 + avg * 0.5;
  score = clamp(score, 0, 100);

  return { name: 'External', weight: 10, value: Math.round(score), signal: computeSignal(score, [35, 65]) };
}

/** Seasonal Score: based on a seasonal factor per candle */
function computeSeasonalScore(candles: ScoreableCandle[]): ScoreItem {
  const recentCandles = candles.slice(-5);
  const hasSeasonal = recentCandles.some((c) => c.seasonalFactor !== undefined);

  if (!hasSeasonal) {
    return { name: 'Seasonal', weight: 10, value: 50, signal: 'NEUTRAL' };
  }

  const avgSeasonal =
    recentCandles.reduce((sum, c) => sum + (c.seasonalFactor || 1), 0) / recentCandles.length;

  let score = 50 + (avgSeasonal - 1) * 150;
  score = clamp(score, 0, 100);

  return { name: 'Seasonal', weight: 10, value: Math.round(score), signal: computeSignal(score, [35, 65]) };
}

/** Momentum Score: rate of change (ROC) */
function computeMomentumScore(candles: ScoreableCandle[]): ScoreItem {
  if (candles.length < 11) {
    return { name: 'Momentum', weight: 15, value: 50, signal: 'NEUTRAL' };
  }

  const closes = candles.map((c) => c.close);
  const roc5 = (closes[closes.length - 1] - closes[closes.length - 6]) / closes[closes.length - 6];
  const roc10 = (closes[closes.length - 1] - closes[closes.length - 11]) / closes[closes.length - 11];

  let score = 50 + roc5 * 800 + roc10 * 400;
  score = clamp(score, 0, 100);

  return { name: 'Momentum', weight: 15, value: Math.round(score), signal: computeSignal(score) };
}

// ─── Main entry point ───────────────────────────────────────────────

/**
 * Calculates a composite score from an array of candle-shaped data.
 *
 * @param candles  - Array of `ScoreableCandle` objects (OHLCV + optional extended fields).
 * @param config   - Optional configuration (sentiment mapping, thresholds).
 * @returns A `CompositeResult` with overall score, signal, confidence, and per-component breakdown.
 */
export function calculateCompositeScore(
  candles: ScoreableCandle[],
  config: ScoringConfig = {}
): CompositeResult {
  const {
    sentimentMap,
    bullishThreshold = 58,
    bearishThreshold = 42,
  } = config;

  // Not enough data — return neutral
  if (candles.length < 5) {
    return {
      score: 50,
      signal: 'NEUTRAL',
      confidence: 20,
      components: [
        { name: 'Trend', weight: 20, value: 50, signal: 'NEUTRAL' },
        { name: 'Volume', weight: 15, value: 50, signal: 'NEUTRAL' },
        { name: 'Delta', weight: 15, value: 50, signal: 'NEUTRAL' },
        { name: 'Sentiment', weight: 15, value: 50, signal: 'NEUTRAL' },
        { name: 'External', weight: 10, value: 50, signal: 'NEUTRAL' },
        { name: 'Seasonal', weight: 10, value: 50, signal: 'NEUTRAL' },
        { name: 'Momentum', weight: 15, value: 50, signal: 'NEUTRAL' },
      ],
    };
  }

  const components: ScoreItem[] = [
    computeTrendScore(candles),
    computeVolumeScore(candles),
    computeDeltaScore(candles),
    computeSentimentScore(candles, sentimentMap),
    computeExternalScore(candles),
    computeSeasonalScore(candles),
    computeMomentumScore(candles),
  ];

  // Weighted average
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const weightedScore =
    components.reduce((sum, c) => sum + c.value * c.weight, 0) / totalWeight;
  const score = Math.round(weightedScore);

  // Confidence: how many components agree on direction?
  const bullishCount = components.filter((c) => c.signal === 'BULLISH').length;
  const bearishCount = components.filter((c) => c.signal === 'BEARISH').length;
  const maxAgreement = Math.max(bullishCount, bearishCount);
  const confidence = Math.round((maxAgreement / components.length) * 100);

  const signal: SignalType =
    score >= bullishThreshold ? 'BULLISH' : score <= bearishThreshold ? 'BEARISH' : 'NEUTRAL';

  return { score, signal, confidence, components };
}
