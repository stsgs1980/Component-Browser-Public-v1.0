/**
 * carbonColorPalette — IBM Carbon Design System color scales.
 * Each color has 10 steps from lightest (10) to darkest (100).
 * Pure design token data — framework-agnostic, drop into any project.
 *
 * Extracted from: carbon-design-system-guide (layout.tsx)
 * - 5 semantic color families × 10 shades each
 * - Blue: Primary actions, links, interactive elements
 * - Gray: Neutral backgrounds, borders, text
 * - Green: Success states, positive indicators
 * - Red: Error states, destructive actions
 * - Yellow: Warning states, attention indicators
 */

export interface CarbonColorScale {
  /** 10 steps: index 0 = shade 10 (lightest), index 9 = shade 100 (darkest) */
  swatches: [string, string, string, string, string, string, string, string, string, string]
  /** Named accessors for key shades */
  10: string  // lightest
  20: string
  30: string
  40: string
  50: string
  60: string  // typically the "main" shade
  70: string
  80: string
  90: string
  100: string // darkest
}

/** Carbon Blue — Primary actions, links, interactive elements */
export const carbonBlue: CarbonColorScale = {
  swatches: ['#edf5ff', '#d0e2ff', '#a6c8ff', '#78a9ff', '#4589ff', '#0f62fe', '#0043ce', '#002d9c', '#001d6c', '#001141'],
  10: '#edf5ff', 20: '#d0e2ff', 30: '#a6c8ff', 40: '#78a9ff', 50: '#4589ff',
  60: '#0f62fe', 70: '#0043ce', 80: '#002d9c', 90: '#001d6c', 100: '#001141',
}

/** Carbon Gray — Neutral backgrounds, borders, text */
export const carbonGray: CarbonColorScale = {
  swatches: ['#f4f4f4', '#e0e0e0', '#c6c6c6', '#a8a8a8', '#8d8d8d', '#6f6f6f', '#525252', '#393939', '#262626', '#161616'],
  10: '#f4f4f4', 20: '#e0e0e0', 30: '#c6c6c6', 40: '#a8a8a8', 50: '#8d8d8d',
  60: '#6f6f6f', 70: '#525252', 80: '#393939', 90: '#262626', 100: '#161616',
}

/** Carbon Green — Success states, positive indicators */
export const carbonGreen: CarbonColorScale = {
  swatches: ['#defbe6', '#a7f0ba', '#6fdc8c', '#42be65', '#24a148', '#198038', '#0e6027', '#054316', '#022d0d', '#071908'],
  10: '#defbe6', 20: '#a7f0ba', 30: '#6fdc8c', 40: '#42be65', 50: '#24a148',
  60: '#198038', 70: '#0e6027', 80: '#054316', 90: '#022d0d', 100: '#071908',
}

/** Carbon Red — Error states, destructive actions */
export const carbonRed: CarbonColorScale = {
  swatches: ['#fff1f1', '#ffd7d9', '#ffb3b8', '#ff8a8f', '#fa4d56', '#da1e28', '#a2191f', '#750e13', '#520408', '#2d0709'],
  10: '#fff1f1', 20: '#ffd7d9', 30: '#ffb3b8', 40: '#ff8a8f', 50: '#fa4d56',
  60: '#da1e28', 70: '#a2191f', 80: '#750e13', 90: '#520408', 100: '#2d0709',
}

/** Carbon Yellow — Warning states, attention indicators */
export const carbonYellow: CarbonColorScale = {
  swatches: ['#fcf4d6', '#fddc69', '#f1c21b', '#d2a106', '#b28600', '#8e6a00', '#684e00', '#483700', '#302400', '#1c1400'],
  10: '#fcf4d6', 20: '#fddc69', 30: '#f1c21b', 40: '#d2a106', 50: '#b28600',
  60: '#8e6a00', 70: '#684e00', 80: '#483700', 90: '#302400', 100: '#1c1400',
}

/** Complete Carbon palette as a flat object with dot-notation keys */
export const carbonPalette = {
  blue: carbonBlue,
  gray: carbonGray,
  green: carbonGreen,
  red: carbonRed,
  yellow: carbonYellow,
} as const

/** Carbon spacing scale: 2px to 64px in 8 steps */
export const carbonSpacing = {
  01: '0.125rem', // 2px
  02: '0.25rem',  // 4px
  03: '0.5rem',   // 8px
  04: '1rem',     // 16px
  05: '1.5rem',   // 24px
  06: '2rem',     // 32px
  07: '2.5rem',   // 40px
  08: '3rem',     // 48px
  09: '4rem',     // 64px
} as const

/** Carbon typography scale */
export const carbonTypography = {
  h1: { fontSize: '2.625rem', lineHeight: '1.19' }, // 42px
  h2: { fontSize: '2rem', lineHeight: '1.25' },     // 32px
  h3: { fontSize: '1.5rem', lineHeight: '1.33' },   // 24px
  h4: { fontSize: '1.25rem', lineHeight: '1.4' },   // 20px
  h5: { fontSize: '1.125rem', lineHeight: '1.44' }, // 18px
  h6: { fontSize: '1rem', lineHeight: '1.5' },      // 16px
  body: { fontSize: '0.875rem', lineHeight: '1.5' }, // 14px
  small: { fontSize: '0.75rem', lineHeight: '1.5' }, // 12px
} as const

/** Carbon motion easing — IBM standard easing curve */
export const carbonMotion = {
  ease: 'cubic-bezier(0.2, 0, 0.38, 0.9)',
  standard: '70ms cubic-bezier(0.2, 0, 0.38, 0.9)',
  enter: '240ms cubic-bezier(0.2, 0, 0.38, 0.9)',
  exit: '100ms cubic-bezier(0.2, 0, 0.38, 0.9)',
} as const
