/**
 * @module ColorPickerPanel
 * @description A self-contained, reusable color picker panel component.
 *
 * Features:
 * - HSL-based color selection with a hue slider and saturation/brightness canvas
 * - HEX and RGB text inputs with bidirectional sync
 * - HTML named color autocomplete search
 * - Five auto-generated color variants (light → deep)
 * - Built-in preset palette groups
 * - Variant correction tab (saturation/brightness multipliers)
 * - Theme preview (scheme strip, light page mockup, dark page mockup)
 * - Internal light/dark theme toggle (no external dependencies)
 * - Copy-to-clipboard export for HEX and CSS custom properties
 * - Fully i18n-ready via the `labels` prop
 *
 * Zero external runtime dependencies — all color math and SVG icons are inlined.
 *
 * @example
 * ```tsx
 * import { ColorPickerPanel } from './010_ColorPickerPanel';
 *
 * <ColorPickerPanel
 *   initialColor="#6366F1"
 *   onColorChange={(hex, [h, s, l]) => console.log(hex, h, s, l)}
 *   labels={{ mainColor: 'Couleur principale', hue: 'Teinte' }}
 * />
 * ```
 */

import { useState, useRef, useCallback, useEffect, type FC } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR UTILITY FUNCTIONS (inlined — no external imports)
// ═══════════════════════════════════════════════════════════════════════════════

/** Convert HSL values (h: 0-360, s: 0-100, l: 0-100) to an uppercase HEX string. */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/** Convert a HEX string (#RRGGBB) to HSL tuple [h, s, l]. */
function hexToHsl(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16) / 255;
    g = parseInt(clean.slice(2, 4), 16) / 255;
    b = parseInt(clean.slice(4, 6), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/** Convert a HEX string (#RRGGBB) to an RGB tuple [r, g, b]. */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

/** Convert RGB values to an uppercase HEX string (#RRGGBB). */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Generate five color variants from a base HSL color.
 * Returns [light, mid-light, base, dark, deep] as HEX strings.
 */
function generateColorVariants(h: number, s: number, l: number): string[] {
  return [
    hslToHex(h, Math.min(s * 0.6, 100), Math.min(l + 25, 90)),
    hslToHex(h, Math.min(s * 0.8, 100), Math.min(l + 12, 80)),
    hslToHex(h, s, l),
    hslToHex(h, Math.min(s + 5, 100), Math.max(l - 20, 10)),
    hslToHex(h, Math.min(s + 10, 100), Math.max(l - 35, 5)),
  ];
}

/** Euclidean distance between two HEX colors in RGB space. */
function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HTML NAMED COLORS (CSS Color Level 4 subset)
// ═══════════════════════════════════════════════════════════════════════════════

const HTML_COLORS: readonly { name: string; hex: string }[] = [
  { name: 'AliceBlue', hex: '#F0F8FF' },
  { name: 'AntiqueWhite', hex: '#FAEBD7' },
  { name: 'Aqua', hex: '#00FFFF' },
  { name: 'Aquamarine', hex: '#7FFFD4' },
  { name: 'Azure', hex: '#F0FFFF' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Bisque', hex: '#FFE4C4' },
  { name: 'Black', hex: '#000000' },
  { name: 'BlanchedAlmond', hex: '#FFEBCD' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'BlueViolet', hex: '#8A2BE2' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'BurlyWood', hex: '#DEB887' },
  { name: 'CadetBlue', hex: '#5F9EA0' },
  { name: 'Chartreuse', hex: '#7FFF00' },
  { name: 'Chocolate', hex: '#D2691E' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'CornflowerBlue', hex: '#6495ED' },
  { name: 'Cornsilk', hex: '#FFF8DC' },
  { name: 'Crimson', hex: '#DC143C' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'DarkBlue', hex: '#00008B' },
  { name: 'DarkCyan', hex: '#008B8B' },
  { name: 'DarkGoldenRod', hex: '#B8860B' },
  { name: 'DarkGray', hex: '#A9A9A9' },
  { name: 'DarkGreen', hex: '#006400' },
  { name: 'DarkKhaki', hex: '#BDB76B' },
  { name: 'DarkMagenta', hex: '#8B008B' },
  { name: 'DarkOliveGreen', hex: '#556B2F' },
  { name: 'DarkOrange', hex: '#FF8C00' },
  { name: 'DarkOrchid', hex: '#9932CC' },
  { name: 'DarkRed', hex: '#8B0000' },
  { name: 'DarkSalmon', hex: '#E9967A' },
  { name: 'DarkSeaGreen', hex: '#8FBC8F' },
  { name: 'DarkSlateBlue', hex: '#483D8B' },
  { name: 'DarkSlateGray', hex: '#2F4F4F' },
  { name: 'DarkTurquoise', hex: '#00CED1' },
  { name: 'DarkViolet', hex: '#9400D3' },
  { name: 'DeepPink', hex: '#FF1493' },
  { name: 'DeepSkyBlue', hex: '#00BFFF' },
  { name: 'DimGray', hex: '#696969' },
  { name: 'DodgerBlue', hex: '#1E90FF' },
  { name: 'FireBrick', hex: '#B22222' },
  { name: 'FloralWhite', hex: '#FFFAF0' },
  { name: 'ForestGreen', hex: '#228B22' },
  { name: 'Fuchsia', hex: '#FF00FF' },
  { name: 'Gainsboro', hex: '#DCDCDC' },
  { name: 'GhostWhite', hex: '#F8F8FF' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'GoldenRod', hex: '#DAA520' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Green', hex: '#008000' },
  { name: 'GreenYellow', hex: '#ADFF2F' },
  { name: 'HoneyDew', hex: '#F0FFF0' },
  { name: 'HotPink', hex: '#FF69B4' },
  { name: 'IndianRed', hex: '#CD5C5C' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Khaki', hex: '#F0E68C' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'LavenderBlush', hex: '#FFF0E5' },
  { name: 'LawnGreen', hex: '#7CFC00' },
  { name: 'LemonChiffon', hex: '#FFFACD' },
  { name: 'LightBlue', hex: '#ADD8E6' },
  { name: 'LightCoral', hex: '#F08080' },
  { name: 'LightCyan', hex: '#E0FFFF' },
  { name: 'LightGoldenRodYellow', hex: '#FAFAD2' },
  { name: 'LightGray', hex: '#D3D3D3' },
  { name: 'LightGreen', hex: '#90EE90' },
  { name: 'LightPink', hex: '#FFB6C1' },
  { name: 'LightSalmon', hex: '#FFA07A' },
  { name: 'LightSeaGreen', hex: '#20B2AA' },
  { name: 'LightSkyBlue', hex: '#87CEFA' },
  { name: 'LightSlateGray', hex: '#778899' },
  { name: 'LightSteelBlue', hex: '#B0C4DE' },
  { name: 'LightYellow', hex: '#FFFFE0' },
  { name: 'Lime', hex: '#00FF00' },
  { name: 'LimeGreen', hex: '#32CD32' },
  { name: 'Linen', hex: '#FAF0E6' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'MediumAquaMarine', hex: '#66CDAA' },
  { name: 'MediumBlue', hex: '#0000CD' },
  { name: 'MediumOrchid', hex: '#BA55D3' },
  { name: 'MediumPurple', hex: '#9370DB' },
  { name: 'MediumSeaGreen', hex: '#3CB371' },
  { name: 'MediumSlateBlue', hex: '#7B68EE' },
  { name: 'MediumSpringGreen', hex: '#00FA9A' },
  { name: 'MediumTurquoise', hex: '#48D1CC' },
  { name: 'MediumVioletRed', hex: '#C71585' },
  { name: 'MidnightBlue', hex: '#191970' },
  { name: 'MintCream', hex: '#F5FFFA' },
  { name: 'MistyRose', hex: '#FFE4E1' },
  { name: 'Moccasin', hex: '#FFE4B5' },
  { name: 'NavajoWhite', hex: '#FFDEAD' },
  { name: 'Navy', hex: '#000080' },
  { name: 'OldLace', hex: '#FDF5E6' },
  { name: 'Olive', hex: '#808000' },
  { name: 'OliveDrab', hex: '#6B8E23' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'OrangeRed', hex: '#FF4500' },
  { name: 'Orchid', hex: '#DA70D6' },
  { name: 'PaleGoldenRod', hex: '#EEE8AA' },
  { name: 'PaleGreen', hex: '#98FB98' },
  { name: 'PaleTurquoise', hex: '#AFEEEE' },
  { name: 'PaleVioletRed', hex: '#DB7093' },
  { name: 'PapayaWhip', hex: '#FFEFD5' },
  { name: 'PeachPuff', hex: '#FFDAB9' },
  { name: 'Peru', hex: '#CD853F' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Plum', hex: '#DDA0DD' },
  { name: 'PowderBlue', hex: '#B0E0E6' },
  { name: 'Purple', hex: '#800080' },
  { name: 'RebeccaPurple', hex: '#663399' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'RosyBrown', hex: '#BC8F8F' },
  { name: 'RoyalBlue', hex: '#4169E1' },
  { name: 'SaddleBrown', hex: '#8B4513' },
  { name: 'Salmon', hex: '#FA8072' },
  { name: 'SandyBrown', hex: '#F4A460' },
  { name: 'SeaGreen', hex: '#2E8B57' },
  { name: 'SeaShell', hex: '#FFF5EE' },
  { name: 'Sienna', hex: '#A0522D' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'SkyBlue', hex: '#87CEEB' },
  { name: 'SlateBlue', hex: '#6A5ACD' },
  { name: 'SlateGray', hex: '#708090' },
  { name: 'Snow', hex: '#FFFAFA' },
  { name: 'SpringGreen', hex: '#00FF7F' },
  { name: 'SteelBlue', hex: '#4682B4' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Thistle', hex: '#D8BFD8' },
  { name: 'Tomato', hex: '#FF6347' },
  { name: 'Turquoise', hex: '#40E0D0' },
  { name: 'Violet', hex: '#EE82EE' },
  { name: 'Wheat', hex: '#F5DEB3' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'WhiteSmoke', hex: '#F5F5F5' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'YellowGreen', hex: '#9ACD32' },
] as const;

/** Find the nearest named HTML color to the given HEX value. */
function getHtmlColorName(hex: string): string {
  let best = HTML_COLORS[0];
  let bestDist = colorDistance(hex, best.hex);
  for (const c of HTML_COLORS) {
    const d = colorDistance(hex, c.hex);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best.name;
}

/** Look up a named HTML color by name (case-insensitive). Returns null if not found. */
function getHtmlColorByName(name: string): string | null {
  const found = HTML_COLORS.find(c => c.name.toLowerCase() === name.toLowerCase());
  return found ? found.hex : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESET DATA
// ═══════════════════════════════════════════════════════════════════════════════

/** A single preset color defined by HSL values. */
interface PresetItem {
  name: string;
  h: number;
  s: number;
  l: number;
}

/** A group of related presets, optionally with a group header. */
interface PresetGroup {
  group: string | null;
  items: PresetItem[];
}

const PRESET_GROUPS: PresetGroup[] = [
  {
    group: null,
    items: [{ name: 'Default Scheme', h: 228, s: 100, l: 50 }],
  },
  {
    group: 'Contrast',
    items: [
      { name: 'More Contrast', h: 228, s: 100, l: 38 },
      { name: 'High Contrast', h: 228, s: 95, l: 30 },
      { name: 'Maximum Contrast', h: 228, s: 100, l: 22 },
      { name: 'Less Contrast', h: 228, s: 70, l: 55 },
      { name: 'Low Contrast', h: 228, s: 50, l: 62 },
      { name: 'Minimal Contrast', h: 228, s: 30, l: 70 },
    ],
  },
  {
    group: 'Saturation',
    items: [
      { name: 'Mid-Dark (Saturated)', h: 228, s: 90, l: 35 },
      { name: 'Dark (Saturated)', h: 228, s: 85, l: 25 },
      { name: 'Very Dark (Saturated)', h: 228, s: 80, l: 18 },
    ],
  },
  {
    group: 'Pastel',
    items: [
      { name: 'Pastel', h: 228, s: 45, l: 75 },
      { name: 'Mid-Dark Pastel', h: 228, s: 40, l: 65 },
      { name: 'Dark Pastel', h: 228, s: 35, l: 55 },
      { name: 'Very Dark Pastel', h: 228, s: 30, l: 45 },
      { name: 'Soft Pale Pastel', h: 228, s: 25, l: 85 },
      { name: 'Medium Pale Pastel', h: 228, s: 20, l: 78 },
      { name: 'Dark Pale Pastel', h: 228, s: 18, l: 68 },
      { name: 'Very Dark Pale Pastel', h: 228, s: 15, l: 58 },
    ],
  },
  {
    group: 'Half-Tones',
    items: [
      { name: 'Half-Tone (Light)', h: 228, s: 15, l: 80 },
      { name: 'Gray Half-Tone with Accent (Light)', h: 228, s: 30, l: 78 },
      { name: 'Gray Half-Tone (Medium)', h: 228, s: 10, l: 60 },
      { name: 'Gray Half-Tone with Accent (Medium)', h: 228, s: 25, l: 58 },
      { name: 'Gray Half-Tone (Dark)', h: 228, s: 8, l: 40 },
      { name: 'Gray Half-Tone with Accent (Dark)', h: 228, s: 20, l: 38 },
    ],
  },
];

/** Flat list of all presets for index-based access. */
const PRESETS: PresetItem[] = PRESET_GROUPS.flatMap(g => g.items);

// ═══════════════════════════════════════════════════════════════════════════════
// LABELS (default English strings for i18n)
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_LABELS: Record<string, string> = {
  palettes: 'Palettes',
  correction: 'Correction',
  preset: 'Preset:',
  mainColor: 'Main color:',
  colorNamePlaceholder: 'Color name...',
  base: 'Base',
  variant1: 'Variant 1',
  variant2: 'Variant 2',
  variant3: 'Variant 3',
  variant4: 'Variant 4',
  hue: 'Hue:',
  scheme: 'Chart:',
  saturationBrightness: 'Saturation/Brightness',
  brightness: 'brightness',
  saturation: 'saturation',
  corrSaturation: 'Saturation:',
  corrBrightness: 'Brightness:',
  correctedVariants: 'Corrected variants:',
  contrast: 'Contrast',
  shadow: 'shadow',
  light: 'light',
  themePreview: 'Theme preview',
  schemeView: 'Scheme',
  lightPreview: 'Light',
  darkPreview: 'Dark',
  lightVariant: 'Light',
  midLight: 'Mid-light',
  baseVariant: 'Base',
  darkVariant: 'Dark',
  deepVariant: 'Deep',
  nearestHtmlColors: 'Nearest HTML colors:',
  lightTheme: 'Light',
  darkTheme: 'Dark',
  copy: 'Copy',
  copied: 'Copied!',
  copyCss: 'Copy CSS',
  copyCssCopied: 'CSS Copied!',
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROPS INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

/** Props for the {@link ColorPickerPanel} component. */
export interface ColorPickerPanelProps {
  /** Initial color as a HEX string (e.g. "#6366F1"). Defaults to "#0000FF". */
  initialColor?: string;
  /** Show the copy-to-clipboard export buttons. Defaults to `true`. */
  showExport?: boolean;
  /** Show the preset palette dropdown. Defaults to `true`. */
  showPresets?: boolean;
  /** Show nearest HTML named colors in scheme preview. Defaults to `true`. */
  showHtmlColors?: boolean;
  /** Additional CSS class names for the root element. */
  className?: string;
  /**
   * Override any default label by key for i18n.
   * Keys match {@link DEFAULT_LABELS}. Missing keys fall back to defaults.
   */
  labels?: { [key: string]: string };
  /**
   * Callback fired whenever the main color changes.
   * Receives the HEX string and the HSL tuple `[h, s, l]`.
   */
  onColorChange?: (hex: string, hsl: [number, number, number]) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE SVG ICON COMPONENTS (replacing lucide-react)
// ═══════════════════════════════════════════════════════════════════════════════

/** Chevron-down icon (replaces `ChevronDown` from lucide-react). */
const IconChevronDown: FC<{ size?: number; className?: string }> = ({ size = 12, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/** Sun icon (replaces `Sun` from lucide-react). */
const IconSun: FC<{ size?: number }> = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

/** Moon icon (replaces `Moon` from lucide-react). */
const IconMoon: FC<{ size?: number }> = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/** Checkmark icon (replaces `Check` from lucide-react). */
const IconCheck: FC<{ size?: number; className?: string }> = ({ size = 10, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Hue Slider ─────────────────────────────────────────────────────────────

/** Draggable rainbow hue slider (0-360). */
function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const getHue = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    onChange(Math.round((x / rect.width) * 360));
  }, [onChange]);
  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; getHue(e); };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) getHue(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [getHue]);
  return (
    <div ref={ref} className="relative h-4 rounded-full cursor-pointer select-none"
      style={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
      onMouseDown={onMouseDown}>
      <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ left: `calc(${(hue / 360) * 100}% - 8px)`, background: `hsl(${hue},100%,50%)` }} />
    </div>
  );
}

// ─── SL Canvas ─────────────────────────────────────────────────────────────

/** Saturation/Lightness 2D canvas picker for a given hue. */
function SLCanvas({ hue, saturation, lightness, onChangeSL }: {
  hue: number; saturation: number; lightness: number;
  onChangeSL: (s: number, l: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    const gradH = ctx.createLinearGradient(0, 0, w, 0);
    gradH.addColorStop(0, 'hsl(0,0%,100%)');
    gradH.addColorStop(1, `hsl(${hue},100%,50%)`);
    ctx.fillStyle = gradH; ctx.fillRect(0, 0, w, h);
    const gradV = ctx.createLinearGradient(0, 0, 0, h);
    gradV.addColorStop(0, 'rgba(0,0,0,0)');
    gradV.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gradV; ctx.fillRect(0, 0, w, h);
  }, [hue]);
  const getPos = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const s = Math.round((x / rect.width) * 100);
    const bright = 1 - y / rect.height;
    const l = Math.round(bright * (1 - s / 200) * 100);
    const denom = 1 - Math.abs(2 * l / 100 - 1);
    const sHsl = denom === 0 ? 0 : Math.round(Math.min((s / 100 * bright) / denom * 100, 100));
    onChangeSL(sHsl, l);
  }, [onChangeSL]);
  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; getPos(e); };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) getPos(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [getPos]);
  const bright = lightness / 100 + (saturation / 100) * (lightness / 100) / (1 - Math.abs(2 * lightness / 100 - 1) || 0.001);
  const sbSat = bright === 0 ? 0 : (2 * (bright - lightness / 100)) / bright;
  const cx = Math.min(Math.max(sbSat * 100, 0), 100);
  const cy = Math.min(Math.max((1 - Math.min(bright, 1)) * 100, 0), 100);
  return (
    <div className="relative">
      <canvas ref={ref} width={200} height={150}
        className="rounded cursor-crosshair w-full block" onMouseDown={onMouseDown} />
      <div className="absolute w-4 h-4 rounded-full border-2 border-white shadow pointer-events-none"
        style={{ left: `calc(${cx}% - 8px)`, top: `calc(${cy}% - 8px)`, background: hslToHex(hue, saturation, lightness) }} />
    </div>
  );
}

// ─── SL Canvas + Axis Labels ───────────────────────────────────────────────

/** SL canvas wrapped with labeled axes. */
function SLCanvasWithAxes({ hue, saturation, lightness, onChangeSL, lbl }: {
  hue: number; saturation: number; lightness: number;
  onChangeSL: (s: number, l: number) => void;
  lbl: Record<string, string>;
}) {
  return (
    <div>
      <div className="text-xs mb-1 text-center italic" style={{ color: 'var(--cpp-subtext, #64748b)' }}>
        {lbl.scheme} <span style={{ color: 'var(--cpp-text, #1e293b)' }}>{lbl.saturationBrightness}</span>
      </div>
      <div className="flex items-stretch gap-1">
        <div className="flex flex-col items-center justify-between" style={{ width: 14 }}>
          <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>+</span>
          <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{lbl.brightness}</span>
          <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>−</span>
        </div>
        <div className="flex-1">
          <SLCanvas hue={hue} saturation={saturation} lightness={lightness} onChangeSL={onChangeSL} />
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>−</span>
            <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>{lbl.saturation}</span>
            <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Generic Slider ────────────────────────────────────────────────────────

/** Draggable range slider with optional gradient track and accent color. */
function Slider({ value, min, max, onChange, gradient, accentHex }: {
  value: number; min: number; max: number; onChange: (v: number) => void;
  gradient?: string; accentHex?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const getVal = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    onChange(Math.round(min + (x / rect.width) * (max - min)));
  }, [min, max, onChange]);
  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; getVal(e); };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) getVal(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [getVal]);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div ref={ref} className="relative h-3 rounded-full cursor-pointer select-none"
      style={{ background: gradient || '#374151' }} onMouseDown={onMouseDown}>
      <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ left: `calc(${pct}% - 8px)`, background: accentHex || '#3b82f6' }} />
    </div>
  );
}

// ─── Contrast Canvas + Axis Labels ────────────────────────────────────────

/** Decorative contrast visualization canvas with labeled axes. */
function ContrastCanvasWithAxes({ mainHex, corrSaturation, corrLightness, lbl }: {
  mainHex: string; corrSaturation: number; corrLightness: number;
  lbl: Record<string, string>;
}) {
  return (
    <div>
      <div className="text-xs mb-1 text-center italic" style={{ color: 'var(--cpp-subtext, #64748b)' }}>
        {lbl.scheme} <span style={{ color: 'var(--cpp-text, #1e293b)' }}>{lbl.contrast}</span>
      </div>
      <div className="flex items-stretch gap-1">
        <div className="flex flex-col items-center justify-between" style={{ width: 14 }}>
          <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>+</span>
          <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{lbl.shadow}</span>
          <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>−</span>
        </div>
        <div className="flex-1">
          <div className="relative rounded overflow-hidden" style={{ width: '100%', height: 150 }}>
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #533483 100%)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.5) 100%)' }} />
            <div className="absolute w-5 h-5 rounded-full border-2 border-white"
              style={{
                left: `calc(${corrSaturation / 150 * 100}% - 10px)`,
                top: `calc(${(1 - corrLightness / 150) * 100}% - 10px)`,
                background: mainHex, boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
              }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>−</span>
            <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>{lbl.light}</span>
            <span className="text-xs" style={{ color: 'var(--cpp-subtext, #64748b)' }}>+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Theme Preview Mockup ─────────────────────────────────────────────────

/** A miniature UI mockup showing how the five color variants look in a theme context. */
function ThemePreview({ variants, isDark }: { variants: string[]; isDark: boolean }) {
  const bg = isDark ? '#0f172a' : '#ffffff';
  const surface = isDark ? '#1e293b' : '#f8fafc';
  const text = isDark ? '#e2e8f0' : '#1e293b';
  const subtext = isDark ? '#94a3b8' : '#64748b';
  const accent = variants[2];
  const accentLight = variants[0];
  const accentDark = variants[3];
  return (
    <div className="rounded-lg overflow-hidden text-sm" style={{ background: bg, color: text, border: `1px solid ${accentDark}` }}>
      <div className="px-4 py-3 flex justify-between items-start" style={{ background: accent }}>
        <span className="italic text-white" style={{ fontSize: 16 }}>lorem ipsum</span>
        <div className="text-right text-white text-xs opacity-90"><div>DUIS AUTE</div><div>IRURE DOLOR</div></div>
      </div>
      <div className="flex gap-1 px-3 py-1" style={{ background: accentDark }}>
        {variants.map((c, i) => <div key={i} className="h-1.5 flex-1 rounded-sm" style={{ background: c }} />)}
      </div>
      <div className="flex gap-3 p-3" style={{ background: bg }}>
        <div className="flex-1 space-y-2">
          <div>
            <div className="mb-0.5 text-xs" style={{ color: accent }}>Mollit Anim</div>
            <p className="text-xs leading-relaxed" style={{ color: text }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <div>
            <div className="mb-0.5 text-xs" style={{ color: subtext }}>Lorem</div>
            <p className="text-xs" style={{ color: text }}>Duis aute irure dolor in reprehenderit in voluptate velit.</p>
          </div>
          <div className="rounded p-2 flex gap-2 items-start" style={{ border: `1px solid ${accentLight}`, background: surface }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs" style={{ border: `1px solid ${accent}`, color: accent }}>&#9200;</div>
            <div className="text-xs" style={{ color: subtext }}>
              <div className="mb-0.5">Duis aute irure dolor</div>
              <div style={{ color: text }}>&#8226; Lorem ipsum<br />&#8226; Dolor sit amet<br />&#8226; Consectetur adipiscing</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-2">
              <div className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 rounded-sm" style={{ background: accentDark }} />
              <div className="text-xs">
                <div className="mb-0.5" style={{ color: accent }}>Lorem ipsum dolor sit amet</div>
                <div className="text-xs mb-0.5" style={{ color: subtext }}>Duis aute</div>
                <p style={{ color: text }}>Lorem ipsum dolor sit amet, sed do eiusmod.</p>
                {i === 2 && <div className="mt-1 px-2 py-1 rounded text-xs text-white" style={{ background: accentDark }}>Adipiscing elit sed do eiusmod tempor.</div>}
                <div className="mt-0.5 text-xs" style={{ color: accent }}>ut labore &raquo;</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-1.5" style={{ background: accent }} />
    </div>
  );
}

// ─── Color Name Autocomplete ──────────────────────────────────────────────

/** Autocomplete input that searches HTML named colors by name. */
function ColorNameInput({ value, onChange, lbl }: {
  value: string; onChange: (hex: string) => void;
  lbl: Record<string, string>;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  useEffect(() => { setQuery(value); }, [value]);
  const filtered = query.length >= 2
    ? HTML_COLORS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={lbl.colorNamePlaceholder}
        className="w-full px-2 py-1.5 rounded text-xs outline-none"
        style={{
          background: 'var(--cpp-input, #f1f5f9)',
          border: '1px solid var(--cpp-inputBorder, #cbd5e1)',
          color: 'var(--cpp-text, #1e293b)',
        }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 rounded shadow-xl z-20 overflow-hidden"
          style={{
            background: 'var(--cpp-input, #f1f5f9)',
            border: '1px solid var(--cpp-inputBorder, #cbd5e1)',
          }}>
          {filtered.map(c => (
            <button key={c.name} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left hover:opacity-80"
              style={{ color: 'var(--cpp-text, #1e293b)' }}
              onMouseDown={() => { onChange(c.hex); setQuery(c.name); setOpen(false); }}>
              <div className="w-4 h-4 rounded-sm flex-shrink-0 border"
                style={{ background: c.hex, borderColor: 'var(--cpp-inputBorder, #cbd5e1)' }} />
              {c.name}
              <span className="ml-auto font-mono" style={{ color: 'var(--cpp-subtext, #64748b)' }}>{c.hex}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────

/** A small button that copies text to clipboard and shows feedback. */
function CopyButton({ text, lbl }: { text: string; lbl: Record<string, string> }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback: no-op if clipboard API unavailable
    }
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-0.5 rounded transition-colors hover:opacity-80"
      style={{
        background: 'var(--cpp-surface, #f8fafc)',
        border: '1px solid var(--cpp-border, #dde3ee)',
        color: 'var(--cpp-subtext, #64748b)',
      }}
    >
      {copied ? lbl.copyCssCopied : lbl.copyCss}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * `ColorPickerPanel` — a fully self-contained color picker with preset palettes,
 * variant generation, theme preview, and export capabilities.
 *
 * @param props - See {@link ColorPickerPanelProps}.
 * @returns A React component that renders the complete color picker panel.
 */
export const ColorPickerPanel: FC<ColorPickerPanelProps> = ({
  initialColor = '#0000FF',
  showExport = true,
  showPresets = true,
  showHtmlColors = true,
  className,
  labels,
  onColorChange,
}) => {
  // ── Merged labels ──
  const lbl: Record<string, string> = { ...DEFAULT_LABELS, ...labels };

  // ── Internal state ──
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('light');
  const [tab, setTab] = useState<'palettes' | 'correction'>('palettes');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [presetOpen, setPresetOpen] = useState(false);
  const [hexInput, setHexInput] = useState(initialColor);
  const [rgbInput, setRgbInput] = useState('');
  const [corrSaturation, setCorrSaturation] = useState(75);
  const [corrLightness, setCorrLightness] = useState(75);
  const [previewMode, setPreviewMode] = useState<'scheme' | 'light' | 'dark'>('dark');
  const [copiedHex, setCopiedHex] = useState(false);

  // Parse initial color to HSL
  const initialHsl = (() => {
    try {
      const clean = initialColor.startsWith('#') ? initialColor : '#' + initialColor;
      if (/^#[0-9A-Fa-f]{6}$/.test(clean)) return hexToHsl(clean);
    } catch { /* ignore */ }
    return [228, 100, 50] as [number, number, number];
  })();

  const [hue, setHue] = useState(initialHsl[0]);
  const [saturation, setSaturation] = useState(initialHsl[1]);
  const [lightness, setLightness] = useState(initialHsl[2]);

  // ── Derived values ──
  const variants = generateColorVariants(hue, saturation, lightness);
  const mainHex = hslToHex(hue, saturation, lightness);
  const htmlColorName = getHtmlColorName(mainHex);

  const isDark = appTheme === 'dark';
  const panelBg = isDark ? '#1a2235' : '#ffffff';
  const panelSurface = isDark ? '#1e2d42' : '#f8fafc';
  const panelBorder = isDark ? '#2d3f55' : '#dde3ee';
  const panelText = isDark ? '#e2e8f0' : '#1e293b';
  const panelSubtext = isDark ? '#8899aa' : '#64748b';
  const panelInput = isDark ? '#253347' : '#f1f5f9';
  const panelInputBorder = isDark ? '#3a4f66' : '#cbd5e1';
  const tabActive = isDark ? '#e2e8f0' : '#1e293b';
  const tabInactive = isDark ? '#5a7088' : '#94a3b8';

  // CSS custom properties for child components
  const cssVars: React.CSSProperties = {
    '--cpp-bg': panelBg,
    '--cpp-surface': panelSurface,
    '--cpp-border': panelBorder,
    '--cpp-text': panelText,
    '--cpp-subtext': panelSubtext,
    '--cpp-input': panelInput,
    '--cpp-inputBorder': panelInputBorder,
  } as React.CSSProperties;

  // ── Sync hex/rgb inputs when main color changes ──
  useEffect(() => {
    setHexInput(mainHex);
    const [r, g, b] = hexToRgb(mainHex);
    setRgbInput(`${r}, ${g}, ${b}`);
  }, [mainHex]);

  // ── Notify parent on color change ──
  useEffect(() => {
    onColorChange?.(mainHex, [hue, saturation, lightness]);
  }, [mainHex, hue, saturation, lightness, onColorChange]);

  // ── Handlers ──
  const applyHex = (val: string) => {
    const clean = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      const [h, s, l] = hexToHsl(clean);
      setHue(h); setSaturation(s); setLightness(l);
    }
  };

  const applyRgb = (val: string) => {
    const parts = val.split(',').map(s => parseInt(s.trim()));
    if (parts.length === 3 && parts.every(p => !isNaN(p))) {
      const hex = rgbToHex(parts[0], parts[1], parts[2]);
      const [h, s, l] = hexToHsl(hex);
      setHue(h); setSaturation(s); setLightness(l);
    }
  };

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx];
    setSelectedPreset(idx);
    setHue(p.h); setSaturation(p.s); setLightness(p.l);
    setPresetOpen(false);
  };

  const handleCopyHex = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mainHex);
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 1500);
    } catch { /* no-op */ }
  }, [mainHex]);

  const corrVariants = variants.map(hex => {
    const [h, s, l] = hexToHsl(hex);
    return hslToHex(h, Math.round(s * corrSaturation / 100), Math.min(Math.round(l * corrLightness / 75), 95));
  });

  /** CSS custom properties string for the current palette. */
  const cssExport = `:root {\n${variants.map((v, i) => {
    const names = ['--color-light', '--color-mid-light', '--color-base', '--color-dark', '--color-deep'] as const;
    return `  ${names[i]}: ${v};`;
  }).join('\n')}\n}`;

  // ── Variant label array ──
  const variantLabels = [lbl.base, lbl.variant1, lbl.variant2, lbl.variant3, lbl.variant4];
  const schemeLabels = [lbl.lightVariant, lbl.midLight, lbl.baseVariant, lbl.darkVariant, lbl.deepVariant];

  // ── Render ──
  return (
    <div
      className={`color-picker-panel ${className ?? ''}`}
      style={{ ...cssVars, color: panelText }}
    >
      {/* Theme toggle bar */}
      <div className="flex items-center justify-end mb-3 gap-1 rounded-lg p-1" style={{ background: panelBg, border: `1px solid ${panelBorder}` }}>
        <button onClick={() => setAppTheme('light')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
          style={{ background: appTheme === 'light' ? mainHex : 'transparent', color: appTheme === 'light' ? '#fff' : panelSubtext }}>
          <IconSun size={12} /> {lbl.lightTheme}
        </button>
        <button onClick={() => setAppTheme('dark')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
          style={{ background: appTheme === 'dark' ? mainHex : 'transparent', color: appTheme === 'dark' ? '#fff' : panelSubtext }}>
          <IconMoon size={12} /> {lbl.darkTheme}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4 items-start">

        {/* ── LEFT: Picker Panel ── */}
        <div className="flex-1 min-w-0 rounded-xl overflow-hidden" style={{ background: panelBg, border: `1px solid ${panelBorder}` }}>
          {/* Tabs */}
          <div className="flex border-b px-4" style={{ borderColor: panelBorder }}>
            {[{ id: 'palettes' as const, label: lbl.palettes }, { id: 'correction' as const, label: lbl.correction }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-4 py-2.5 text-xs relative transition-colors"
                style={{ color: tab === t.id ? tabActive : tabInactive }}>
                {t.label}
                {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: mainHex }} />}
              </button>
            ))}
          </div>

          {/* Tab: Palettes */}
          {tab === 'palettes' && (
            <div className="p-4 space-y-3">
              <div className="flex gap-4">
                {/* Left column */}
                <div className="flex-1 min-w-0 space-y-3">

                  {/* Preset selector */}
                  {showPresets && (
                    <div>
                      <div className="text-xs mb-1" style={{ color: panelSubtext }}>{lbl.preset}</div>
                      <div className="relative">
                        <button onClick={() => setPresetOpen(!presetOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                          style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, color: panelText }}>
                          {PRESETS[selectedPreset].name}
                          <IconChevronDown size={12} className={`flex-shrink-0 transition-transform ${presetOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {presetOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg z-20 shadow-xl overflow-y-auto"
                            style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, maxHeight: 280 }}>
                            {PRESET_GROUPS.map((group, gi) => {
                              const offset = PRESET_GROUPS.slice(0, gi).reduce((acc, g) => acc + g.items.length, 0);
                              return (
                                <div key={gi}>
                                  {group.group && (
                                    <div className="px-3 pt-2 pb-0.5 text-xs" style={{ color: panelText }}>{group.group}</div>
                                  )}
                                  {group.items.map((p, ii) => {
                                    const idx = offset + ii;
                                    return (
                                      <button key={idx} onClick={() => applyPreset(idx)}
                                        className="w-full flex items-center py-1.5 text-xs text-left hover:opacity-80 transition-opacity"
                                        style={{
                                          paddingLeft: group.group ? 20 : 12, paddingRight: 12,
                                          color: idx === selectedPreset ? mainHex : panelSubtext,
                                          background: idx === selectedPreset ? `${panelBorder}55` : 'transparent',
                                        }}>
                                        {p.name}
                                        {idx === selectedPreset && <IconCheck size={10} className="ml-auto flex-shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Main color display */}
                  <div>
                    <div className="text-xs mb-1" style={{ color: panelSubtext }}>
                      {lbl.mainColor} <span style={{ color: panelText }}>{htmlColorName}</span>
                    </div>

                    {/* Color swatch row */}
                    <div className="flex gap-2 mb-2">
                      <div className="w-10 h-10 rounded-lg flex-shrink-0 border" style={{ background: mainHex, borderColor: panelBorder }} />
                      <div className="flex-1 space-y-1.5">
                        {/* HEX input */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs w-8 flex-shrink-0" style={{ color: panelSubtext }}>HEX</span>
                          <input type="text" value={hexInput}
                            onChange={e => setHexInput(e.target.value)}
                            onBlur={e => applyHex(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyHex(hexInput)}
                            className="flex-1 px-2 py-1 rounded text-xs font-mono outline-none"
                            style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, color: panelText }} />
                          {showExport && (
                            <button onClick={handleCopyHex}
                              className="text-xs px-1.5 py-1 rounded transition-colors hover:opacity-80 flex-shrink-0"
                              style={{ background: panelSurface, border: `1px solid ${panelBorder}`, color: panelSubtext }}>
                              {copiedHex ? lbl.copied : lbl.copy}
                            </button>
                          )}
                        </div>
                        {/* RGB input */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs w-8 flex-shrink-0" style={{ color: panelSubtext }}>RGB</span>
                          <input type="text" value={rgbInput}
                            onChange={e => setRgbInput(e.target.value)}
                            onBlur={e => applyRgb(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyRgb(rgbInput)}
                            className="flex-1 px-2 py-1 rounded text-xs font-mono outline-none"
                            style={{ background: panelInput, border: `1px solid ${panelInputBorder}`, color: panelText }} />
                        </div>
                      </div>
                    </div>

                    {/* Color name autocomplete */}
                    <ColorNameInput value={htmlColorName} onChange={applyHex} lbl={lbl} />
                  </div>

                  {/* Color variants list */}
                  <div className="space-y-1">
                    {variantLabels.map((name, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex-shrink-0" style={{ background: variants[i] }} />
                        <span className="text-xs" style={{ color: panelSubtext }}>{name}</span>
                        <span className="text-xs ml-auto font-mono" style={{ color: panelSubtext }}>{variants[i]}</span>
                      </div>
                    ))}
                  </div>

                  {/* CSS export */}
                  {showExport && (
                    <CopyButton text={cssExport} lbl={lbl} />
                  )}

                  {/* Hue slider */}
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: panelSubtext }}>
                      {lbl.hue} <span style={{ color: panelText }}>{hue}&deg;</span>
                    </div>
                    <HueSlider hue={hue} onChange={h => setHue(h)} />
                  </div>
                </div>

                {/* Right column: SL Canvas */}
                <div className="w-48 flex-shrink-0">
                  <SLCanvasWithAxes
                    hue={hue} saturation={saturation} lightness={lightness}
                    onChangeSL={(s, l) => { setSaturation(s); setLightness(l); }}
                    lbl={lbl}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Correction */}
          {tab === 'correction' && (
            <div className="p-4 space-y-3">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: panelSubtext }}>
                      {lbl.corrSaturation} <span style={{ color: panelText }}>{corrSaturation}%</span>
                    </div>
                    <Slider value={corrSaturation} min={0} max={150} onChange={setCorrSaturation}
                      gradient={`linear-gradient(to right, hsl(${hue},0%,${lightness}%), hsl(${hue},100%,${lightness}%))`}
                      accentHex={mainHex} />
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: panelSubtext }}>
                      {lbl.corrBrightness} <span style={{ color: panelText }}>{corrLightness}%</span>
                    </div>
                    <Slider value={corrLightness} min={0} max={150} onChange={setCorrLightness}
                      gradient={`linear-gradient(to right, #000, hsl(${hue},${saturation}%,50%), #fff)`}
                      accentHex={mainHex} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs mb-1" style={{ color: panelSubtext }}>{lbl.correctedVariants}</div>
                    {variantLabels.map((name, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex-shrink-0" style={{ background: corrVariants[i] }} />
                        <span className="text-xs" style={{ color: panelSubtext }}>{name}</span>
                        <span className="text-xs ml-auto font-mono" style={{ color: panelSubtext }}>{corrVariants[i]}</span>
                      </div>
                    ))}
                  </div>
                  {showExport && (
                    <CopyButton text={cssExport} lbl={lbl} />
                  )}
                </div>
                <div className="w-48 flex-shrink-0">
                  <ContrastCanvasWithAxes
                    mainHex={mainHex} corrSaturation={corrSaturation} corrLightness={corrLightness}
                    lbl={lbl}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Preview Panel ── */}
        <div className="w-96 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: panelBg, border: `1px solid ${panelBorder}` }}>
          {/* Preview header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: panelBorder }}>
            <span className="text-sm" style={{ color: panelText }}>{lbl.themePreview}</span>
            <div className="flex gap-1">
              {[
                { id: 'scheme' as const, label: lbl.schemeView },
                { id: 'light' as const, label: lbl.lightPreview },
                { id: 'dark' as const, label: lbl.darkPreview },
              ].map(m => (
                <button key={m.id} onClick={() => setPreviewMode(m.id)}
                  className="px-2 py-1 text-xs rounded transition-colors"
                  style={{
                    background: previewMode === m.id ? panelText : 'transparent',
                    color: previewMode === m.id ? (isDark ? '#0f172a' : '#fff') : panelSubtext,
                  }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            {previewMode === 'scheme' && (
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {variants.map((c, i) => (
                    <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{ border: `1px solid ${panelBorder}` }}>
                      <div style={{ height: 60, background: c }} />
                      <div className="p-1.5" style={{ background: panelInput }}>
                        <div className="text-xs font-mono truncate" style={{ color: panelText }}>{c}</div>
                        <div className="text-xs" style={{ color: panelSubtext }}>
                          {schemeLabels[i]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* HTML color row */}
                {showHtmlColors && (
                  <div className="rounded-lg p-2 space-y-1" style={{ background: panelInput, border: `1px solid ${panelBorder}` }}>
                    <div className="text-xs mb-1" style={{ color: panelSubtext }}>{lbl.nearestHtmlColors}</div>
                    <div className="flex flex-wrap gap-1">
                      {variants.map((c, i) => {
                        const name = getHtmlColorName(c);
                        const nc = HTML_COLORS.find(h => h.name === name)?.hex || c;
                        return (
                          <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ background: panelSurface, border: `1px solid ${panelBorder}` }}>
                            <div className="w-3 h-3 rounded-sm" style={{ background: nc }} />
                            <span style={{ color: panelSubtext }}>{name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {previewMode === 'light' && <ThemePreview variants={variants} isDark={false} />}
            {previewMode === 'dark' && <ThemePreview variants={variants} isDark={true} />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ColorPickerPanel;
