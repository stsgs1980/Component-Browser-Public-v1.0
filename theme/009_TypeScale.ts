/**
 * 009_TypeScale — Opinionated typographic scale constants and helpers
 *
 * Pure TypeScript — no React, no runtime overhead beyond a tiny helper
 * function.  Import the `TYPE_SCALE` object for direct use, or call
 * `typeScaleStyle('h1')` to get a ready-to-spread `React.CSSProperties`
 * object.
 *
 * @example
 * ```tsx
 * import { TYPE_SCALE, typeScaleStyle, FONT_STACKS } from './009_TypeScale';
 *
 * // Direct usage
 * <h1 style={typeScaleStyle('display')}>Hello</h1>
 *
 * // Named usage with overrides
 * <p style={{ ...typeScaleStyle('bodyLg'), color: '#ccc' }}>Text</p>
 *
 * // Font stacks
 * <span style={FONT_STACKS.mono}>code</span>
 * ```
 */

import React from "react";

// ---------------------------------------------------------------------------
// Type-scale entries
// ---------------------------------------------------------------------------

export interface TypeScaleEntry {
  /** CSS font-size value (supports `clamp()`, `rem`, `px`, etc.). */
  size: string;
  /** Numeric font-weight (100–900). */
  weight: number;
  /** Unitless line-height. */
  lineHeight: number;
  /** CSS letter-spacing (supports `em`, `px`, etc.). */
  letterSpacing: string;
}

/** All available type-scale keys. */
export type TypeScaleKey = keyof typeof TYPE_SCALE;

// ---------------------------------------------------------------------------
// The scale
// ---------------------------------------------------------------------------

/**
 * A complete, opinionated type scale designed for UI-heavy sites.
 *
 * Each entry contains everything needed to render text at that level:
 * `size`, `weight`, `lineHeight`, and `letterSpacing`.
 */
export const TYPE_SCALE = {
  display: {
    size: "clamp(3rem, 6vw, 5rem)",
    weight: 700,
    lineHeight: 1.05,
    letterSpacing: "-0.035em",
  },
  h1: {
    size: "clamp(2rem, 4vw, 3.5rem)",
    weight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
  },
  h2: {
    size: "1.125rem",
    weight: 600,
    lineHeight: 1.3,
    letterSpacing: "0.04em",
  },
  bodyLg: {
    size: "1rem",
    weight: 400,
    lineHeight: 1.65,
    letterSpacing: "-0.01em",
  },
  body: {
    size: "0.875rem",
    weight: 400,
    lineHeight: 1.6,
    letterSpacing: "-0.005em",
  },
  caption: {
    size: "0.75rem",
    weight: 400,
    lineHeight: 1.55,
    letterSpacing: "0.005em",
  },
  micro: {
    size: "0.625rem",
    weight: 500,
    lineHeight: 1.5,
    letterSpacing: "0.06em",
  },
  label: {
    size: "0.6875rem",
    weight: 500,
    lineHeight: 1.4,
    letterSpacing: "0.08em",
  },
} as const;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Returns a `React.CSSProperties` object for the given type-scale key.
 * Safe to spread directly into a `style` prop.
 *
 * @param key - One of the keys in `TYPE_SCALE`.
 * @returns CSS properties for fontSize, fontWeight, lineHeight, letterSpacing.
 *
 * @example
 * ```tsx
 * <p style={typeScaleStyle('bodyLg')}>Large body text</p>
 * ```
 */
export function typeScaleStyle(key: TypeScaleKey): React.CSSProperties {
  const entry = TYPE_SCALE[key];
  return {
    fontSize: entry.size,
    fontWeight: entry.weight,
    lineHeight: entry.lineHeight,
    letterSpacing: entry.letterSpacing,
  };
}

// ---------------------------------------------------------------------------
// Font stacks
// ---------------------------------------------------------------------------

/**
 * Pre-built font-family stacks for monospace and sans-serif text.
 * Spread directly into a `style` prop.
 *
 * @example
 * ```tsx
 * <code style={FONT_STACKS.mono}>x = 42;</code>
 * <p style={FONT_STACKS.sans}>Hello world</p>
 * ```
 */
export const FONT_STACKS = {
  mono: {
    fontFamily:
      "'Geist Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  },
  sans: {
    fontFamily:
      "'Geist Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  },
} as const;
