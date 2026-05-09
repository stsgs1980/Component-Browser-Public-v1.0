/**
 * HelixMath.ts
 *
 * A reusable 3D double-helix data visualisation engine.
 *
 * Transforms time-series data (candles, ticks, or any sequential records)
 * into a pair of interleaved 3D spirals — one for "buyers" and one for
 * "sellers". Also generates smooth tube-style spline curves for each
 * spiral for use with Three.js TubeGeometry or similar renderers.
 *
 * Completely de-hardcoded from the original CHROMEDNA energy-trading
 * codebase. Accepts any candle-shaped data and configurable colour options
 * instead of domain-specific symbol look-ups.
 *
 * Usage:
 * ```ts
 * import { generateHelixData, generateSpiralCurve, type HelixData, type HelixOptions } from './HelixMath';
 *
 * const data = generateHelixData(candles, {
 *   buyerColor: '#4ade80',
 *   sellerColor: '#f87171',
 *   radius: 2.2,
 * });
 *
 * const curves = generateSpiralCurve(candles, { turnsPerCandle: 0.12 });
 * ```
 */

// ─── Generic interfaces ────────────────────────────────────────────

/** A single point in 3D space on one spiral strand */
export interface HelixPoint {
  /** [x, y, z] position in 3D space */
  position: [number, number, number];
  /** Hex colour string (e.g. '#4ade80') */
  color: string;
  /** Visual scale of the node (driven by volume) */
  scale: number;
  /** Index of the source candle this point represents */
  index: number;
}

/** Complete output from the helix generator */
export interface HelixData {
  buyers: HelixPoint[];
  sellers: HelixPoint[];
  /** Pairs of indices linking buyer[i] ↔ seller[i] for a given candle */
  connections: [number, number][];
}

/** Minimal candle shape accepted by the helix functions */
export interface HelixCandle {
  close: number;
  volume: number;
  /** Buyer-specific volume (optional — falls back to volume * 0.5) */
  buyVolume?: number;
  /** Seller-specific volume (optional — falls back to volume * 0.5) */
  sellVolume?: number;
}

/** Configuration for helix generation */
export interface HelixOptions {
  /** Vertical distance between consecutive candles on the helix (default 0.22) */
  heightPerCandle?: number;
  /** Radius of the double helix from the centre axis (default 2.2) */
  radius?: number;
  /** Radians of rotation per candle (default 0.1) */
  turnsPerCandle?: number;
  /** Z-axis (depth) price scaling range (default 3) */
  priceScale?: number;
  /** Colour for the buyer strand (default '#4ade80') */
  buyerColor?: string;
  /** Colour for the seller strand (default '#f87171') */
  sellerColor?: string;
}

/** Curve output for tube rendering */
export interface SpiralCurveData {
  buyerCurve: [number, number, number][];
  sellerCurve: [number, number, number][];
}

// ─── Helix generation ───────────────────────────────────────────────

/**
 * Generates buyer/seller helix point data from candle-like input.
 *
 * The Y-axis represents time (helix extends upward), the X-axis forms
 * the spiral radius, and the Z-axis maps price → depth.
 *
 * @param candles - Array of `HelixCandle` objects (sequential time-series).
 * @param options - Optional configuration overrides.
 * @returns A `HelixData` object with buyer/seller points and connections.
 */
export function generateHelixData(
  candles: HelixCandle[],
  options: HelixOptions = {}
): HelixData {
  const {
    heightPerCandle = 0.22,
    radius = 2.2,
    turnsPerCandle = 0.1,
    priceScale = 3,
    buyerColor = '#4ade80',
    sellerColor = '#f87171',
  } = options;

  const buyers: HelixPoint[] = [];
  const sellers: HelixPoint[] = [];
  const connections: [number, number][] = [];

  // Normalise prices to Z-axis range (depth)
  const prices = candles.map((c) => c.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const targetZRange = priceScale;

  // Normalise volume for node scale
  const volumes = candles.map((c) => c.volume);
  const maxVolume = Math.max(...volumes, 1); // avoid division by zero

  candles.forEach((candle, i) => {
    const angle = i * turnsPerCandle * Math.PI * 2;
    const y = i * heightPerCandle;
    const z = ((candle.close - minPrice) / priceRange) * targetZRange - targetZRange / 2;
    const volumeScale = 0.12 + (candle.volume / maxVolume) * 0.3;

    // Buyer node (one spiral arm)
    buyers.push({
      position: [
        Math.cos(angle) * radius,
        y,
        z + 0.15,
      ],
      color: buyerColor,
      scale:
        volumeScale *
        (1 + ((candle.buyVolume ?? candle.volume * 0.5) / candle.volume) * 0.3),
      index: i,
    });

    // Seller node (opposite spiral arm, offset by π)
    sellers.push({
      position: [
        Math.cos(angle + Math.PI) * radius,
        y,
        z - 0.15,
      ],
      color: sellerColor,
      scale:
        volumeScale *
        (1 + ((candle.sellVolume ?? candle.volume * 0.5) / candle.volume) * 0.3),
      index: i,
    });

    connections.push([i, i]);
  });

  return { buyers, sellers, connections };
}

// ─── Spiral curve generation ────────────────────────────────────────

/**
 * Generates smooth 3D curve points for tube / ribbon rendering.
 *
 * Returns two arrays of `[x, y, z]` tuples — one for each spiral arm —
 * suitable for passing to `THREE.CatmullRomCurve3` or similar.
 *
 * @param candles - Array of `HelixCandle` objects.
 * @param options - Optional configuration overrides.
 * @returns `SpiralCurveData` with buyer and seller curve point arrays.
 */
export function generateSpiralCurve(
  candles: HelixCandle[],
  options: HelixOptions = {}
): SpiralCurveData {
  const {
    heightPerCandle = 0.22,
    radius = 2.2,
    turnsPerCandle = 0.1,
    priceScale = 3,
  } = options;

  const prices = candles.map((c) => c.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const targetZRange = priceScale;

  const buyerCurve: [number, number, number][] = [];
  const sellerCurve: [number, number, number][] = [];

  candles.forEach((candle, i) => {
    const angle = i * turnsPerCandle * Math.PI * 2;
    const y = i * heightPerCandle;
    const z = ((candle.close - minPrice) / priceRange) * targetZRange - targetZRange / 2;

    buyerCurve.push([Math.cos(angle) * radius, y, z + 0.15]);
    sellerCurve.push([Math.cos(angle + Math.PI) * radius, y, z - 0.15]);
  });

  return { buyerCurve, sellerCurve };
}
