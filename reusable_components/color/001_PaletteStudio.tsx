/**
 * PaletteStudio — Color Harmony Generator
 *
 * A reusable React component for generating harmonious color palettes
 * using color theory algorithms (complementary, analogous, triadic, etc.).
 * Includes HSL sliders, WCAG contrast checking, shade generation,
 * and multi-format export (CSS variables, Tailwind, JSON).
 *
 * @module 001_PaletteStudio
 * @example
 * ```tsx
 * <PaletteStudio
 *   initialColor="#e74c3c"
 *   labels={{ title: "Color Palette Generator" }}
 *   presets={myCustomPresets}
 *   onPaletteChange={(colors) => console.log(colors)}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  useIsMounted,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hslToHex,
  hexToRgba,
  copyToClipboard,
  downloadFile,
  getContrastBadges,
  type RGB,
  type HSL,
  type ContrastResult,
  type GeneratorTheme,
  DEFAULT_THEME,
  nextId,
  IconCopy,
  IconCheck,
  IconLock,
  IconUnlock,
  IconShuffle,
  IconDownload,
  IconEye,
  IconPalette,
  ChromeHeader,
  CodeLine,
  highlightColors,
} from './shared';

// ─── Types ──────────────────────────────────────────────────────

export interface PaletteColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  locked: boolean;
}

export type HarmonyMode =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'monochromatic'
  | 'tetradic'
  | 'random';

export type ExportFormat = 'css' | 'tailwind' | 'json';

export interface PalettePreset {
  name: string;
  colors: string[];
  icon?: string;
}

export interface PaletteStudioLabels {
  title?: string;
  subtitle?: string;
  baseColor?: string;
  harmonyMode?: string;
  presets?: string;
  random?: string;
  shades?: string;
  close?: string;
  copied?: string;
  copy?: string;
  copyAll?: string;
  export?: string;
}

export interface PaletteStudioProps {
  /** Initial base color hex */
  initialColor?: string;
  /** Default harmony mode */
  defaultMode?: HarmonyMode;
  /** Custom presets to show */
  presets?: PalettePreset[];
  /** Color names for export */
  colorNames?: string[];
  /** Number of shades to generate (default: 10) */
  shadeCount?: number;
  /** Labels for all UI text */
  labels?: PaletteStudioLabels;
  /** Theme customization */
  theme?: Partial<GeneratorTheme>;
  /** Called when the palette changes */
  onPaletteChange?: (colors: PaletteColor[]) => void;
  /** Additional CSS class for root element */
  className?: string;
}

// ─── Default Data ───────────────────────────────────────────────

const DEFAULT_PRESETS: PalettePreset[] = [
  { name: 'Sunset', colors: ['#ff6b35', '#f7c948', '#ff006e', '#e63946', '#ffb703'], icon: '🌅' },
  { name: 'Ocean', colors: ['#0077b6', '#00b4d8', '#90e0ef', '#023e8a', '#48cae4'], icon: '🌊' },
  { name: 'Forest', colors: ['#2d6a4f', '#40916c', '#52b788', '#1b4332', '#95d5b2'], icon: '🌲' },
  { name: 'Neon', colors: ['#ff00ff', '#00ffff', '#39ff14', '#ff3131', '#f5ff00'], icon: '💜' },
  { name: 'Pastel', colors: ['#ffc8dd', '#bde0fe', '#a2d2ff', '#cdb4db', '#ffafcc'], icon: '🧁' },
  { name: 'Earth', colors: ['#6b4226', '#d4a373', '#ccd5ae', '#e9edc9', '#a98467'], icon: '🪨' },
  { name: 'Candy', colors: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'], icon: '🍬' },
  { name: 'Midnight', colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'], icon: '🌙' },
];

const DEFAULT_LABELS: Required<PaletteStudioLabels> = {
  title: 'Palette Studio',
  subtitle: 'Generate harmonious color palettes with color theory algorithms',
  baseColor: 'Base Color',
  harmonyMode: 'Harmony Mode',
  presets: 'Presets',
  random: 'Random',
  shades: 'Shades',
  close: 'Close',
  copied: 'Copied!',
  copy: 'Copy',
  copyAll: 'Copy All',
  export: 'Export',
};

const DEFAULT_COLOR_NAMES = ['primary', 'secondary', 'accent', 'muted', 'card'];

const HARMONY_MODES: { id: HarmonyMode; label: string }[] = [
  { id: 'complementary', label: 'Complementary' },
  { id: 'analogous', label: 'Analogous' },
  { id: 'triadic', label: 'Triadic' },
  { id: 'split-complementary', label: 'Split-Comp' },
  { id: 'monochromatic', label: 'Monochromatic' },
  { id: 'tetradic', label: 'Tetradic' },
  { id: 'random', label: 'Random' },
];

const EXPORT_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS Variables' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'json', label: 'JSON' },
];

// ─── Color Harmony Algorithms ───────────────────────────────────

function makeColor(h: number, s: number, l: number, locked = false): PaletteColor {
  const rgb = hslToRgb(h, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  return { hex, rgb, hsl: { h: ((h % 360) + 360) % 360, s, l }, locked };
}

export function getComplementary(h: number, s: number, l: number): PaletteColor[] {
  return [
    makeColor(h, s, l),
    makeColor(h, s, Math.min(l + 15, 95)),
    makeColor((h + 180) % 360, s, l),
    makeColor((h + 180) % 360, s, Math.min(l + 15, 95)),
    makeColor(h, s, Math.max(l - 15, 5)),
  ];
}

export function getAnalogous(h: number, s: number, l: number): PaletteColor[] {
  return [
    makeColor((h - 30 + 360) % 360, s, l),
    makeColor((h - 15 + 360) % 360, s, Math.min(l + 10, 95)),
    makeColor(h, s, l),
    makeColor((h + 15) % 360, s, Math.min(l + 10, 95)),
    makeColor((h + 30) % 360, s, l),
  ];
}

export function getTriadic(h: number, s: number, l: number): PaletteColor[] {
  return [
    makeColor(h, s, l),
    makeColor(h, s, Math.min(l + 15, 95)),
    makeColor((h + 120) % 360, s, l),
    makeColor((h + 240) % 360, s, l),
    makeColor((h + 240) % 360, s, Math.min(l + 15, 95)),
  ];
}

export function getSplitComplementary(h: number, s: number, l: number): PaletteColor[] {
  return [
    makeColor(h, s, l),
    makeColor(h, s, Math.min(l + 15, 95)),
    makeColor((h + 150) % 360, s, l),
    makeColor((h + 210) % 360, s, l),
    makeColor((h + 180) % 360, s, Math.max(l - 10, 5)),
  ];
}

export function getMonochromatic(h: number, s: number, l: number): PaletteColor[] {
  return [
    makeColor(h, s, Math.min(l + 25, 95)),
    makeColor(h, s, Math.min(l + 12, 90)),
    makeColor(h, s, l),
    makeColor(h, s, Math.max(l - 12, 10)),
    makeColor(h, s, Math.max(l - 25, 5)),
  ];
}

export function getTetradic(h: number, s: number, l: number): PaletteColor[] {
  return [
    makeColor(h, s, l),
    makeColor((h + 90) % 360, s, l),
    makeColor((h + 180) % 360, s, l),
    makeColor((h + 270) % 360, s, l),
    makeColor((h + 180) % 360, s, Math.min(l + 15, 95)),
  ];
}

export function generateRandomPalette(): PaletteColor[] {
  const baseHue = Math.random() * 360;
  const schemes: ((h: number) => PaletteColor[])[] = [
    (h) => getComplementary(h, 60 + Math.random() * 30, 45 + Math.random() * 20),
    (h) => getAnalogous(h, 55 + Math.random() * 35, 40 + Math.random() * 25),
    (h) => getTriadic(h, 55 + Math.random() * 35, 45 + Math.random() * 20),
    (h) => getSplitComplementary(h, 60 + Math.random() * 25, 45 + Math.random() * 20),
    (h) => getTetradic(h, 50 + Math.random() * 40, 45 + Math.random() * 20),
  ];
  return schemes[Math.floor(Math.random() * schemes.length)](baseHue);
}

export function generateShades(h: number, s: number, l: number, count = 10): string[] {
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = Math.round(95 - (i / (count - 1)) * 85);
    shades.push(hslToHex(h, s, lightness));
  }
  return shades;
}

function generateByMode(h: number, s: number, l: number, mode: HarmonyMode): PaletteColor[] {
  switch (mode) {
    case 'complementary': return getComplementary(h, s, l);
    case 'analogous': return getAnalogous(h, s, l);
    case 'triadic': return getTriadic(h, s, l);
    case 'split-complementary': return getSplitComplementary(h, s, l);
    case 'monochromatic': return getMonochromatic(h, s, l);
    case 'tetradic': return getTetradic(h, s, l);
    case 'random': return generateRandomPalette();
    default: return getComplementary(h, s, l);
  }
}

// ─── Sub-components ─────────────────────────────────────────────

/** HSL color sliders */
function HSLSliders({
  hsl,
  onChange,
  theme,
}: {
  hsl: HSL;
  onChange: (hsl: HSL) => void;
  theme: GeneratorTheme;
}) {
  const update = (key: keyof HSL, val: number) => onChange({ ...hsl, [key]: val });

  return (
    <div className="space-y-3">
      {[
        {
          key: 'h' as const,
          label: 'H (Hue)',
          min: 0, max: 360,
          bg: `linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
          unit: '°',
        },
        {
          key: 's' as const,
          label: 'S (Saturation)',
          min: 0, max: 100,
          bg: `linear-gradient(90deg, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`,
          unit: '%',
        },
        {
          key: 'l' as const,
          label: 'L (Lightness)',
          min: 0, max: 100,
          bg: `linear-gradient(90deg, #000000, ${hslToHex(hsl.h, hsl.s, 50)}, #ffffff)`,
          unit: '%',
        },
      ].map((slider) => (
        <div key={slider.key}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>
              {slider.label}
            </span>
            <span className="font-mono text-[10px]" style={{ color: theme.accent }}>
              {hsl[slider.key]}{slider.unit}
            </span>
          </div>
          <input
            type="range"
            min={slider.min}
            max={slider.max}
            value={hsl[slider.key]}
            onChange={(e) => update(slider.key, Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: slider.bg }}
            aria-label={slider.label}
          />
        </div>
      ))}
    </div>
  );
}

/** Shades panel for a single color */
function ShadesPanel({
  color,
  onClose,
  onCopy,
  count,
  theme,
}: {
  color: PaletteColor;
  onClose: () => void;
  onCopy: (text: string) => void;
  count: number;
  theme: GeneratorTheme;
}) {
  const shades = generateShades(color.hsl.h, color.hsl.s, color.hsl.l, count);

  return (
    <div
      className="rounded-xl border p-3 space-y-2"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.panelBg,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>
          {count} {theme.panelBg === DEFAULT_THEME.panelBg ? 'Shades' : 'Shades'}
        </span>
        <button
          onClick={onClose}
          className="font-mono text-[10px] hover:opacity-80 transition-colors cursor-pointer"
          style={{ color: `${theme.textMuted}99` }}
        >
          ✕ {DEFAULT_LABELS.close}
        </button>
      </div>
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: theme.border }}>
        {shades.map((shade, i) => (
          <button
            key={`shade-${i}`}
            className="flex-1 h-10 sm:h-14 relative group cursor-pointer border-0 p-0 transition-transform hover:scale-110"
            style={{ backgroundColor: shade }}
            onClick={() => onCopy(shade)}
            title={`${shade} — click to copy`}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[8px] text-white/0 group-hover:text-white/80 whitespace-nowrap transition-colors">
              {shade}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Individual color card in the palette */
function ColorCard({
  color,
  index,
  onToggleLock,
  onShowShades,
  onCopy,
  isActiveShade,
  theme,
}: {
  color: PaletteColor;
  index: number;
  onToggleLock: (index: number) => void;
  onShowShades: (index: number) => void;
  onCopy: (text: string) => void;
  isActiveShade: boolean;
  theme: GeneratorTheme;
}) {
  const badges = getContrastBadges(color.hex);
  const textColor = badges.blackRatio > badges.whiteRatio ? '#000000' : '#ffffff';

  return (
    <div
      className="flex flex-col items-center gap-2 group"
      style={{ opacity: 0, animation: 'fadeInUp 0.3s ease forwards', animationDelay: `${index * 0.06}s` }}
    >
      {/* Swatch */}
      <div
        className="relative w-full aspect-square rounded-xl border cursor-pointer overflow-hidden transition-all hover:scale-[1.04]"
        style={{
          backgroundColor: color.hex,
          borderColor: theme.border,
          boxShadow: `0 0 30px ${color.hex}40`,
        }}
        onClick={() => onShowShades(index)}
        title="Click to see shades"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onShowShades(index); } }}
      >
        {/* Lock button */}
        <button
          className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-0 p-0"
          style={{
            backgroundColor: color.locked ? 'rgba(0,0,0,0.5)' : 'rgba(26,26,26,0.15)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { e.stopPropagation(); onToggleLock(index); }}
          title={color.locked ? 'Unlock color' : 'Lock color'}
        >
          {color.locked ? (
            <IconLock size={12} style={{ color: theme.accent }} />
          ) : (
            <IconUnlock size={12} style={{ color: textColor, opacity: 0.7 }} />
          )}
        </button>

        {/* Hex label */}
        <span
          className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
          style={{
            color: textColor,
            backgroundColor: color.locked ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
          }}
        >
          {color.hex.toUpperCase()}
        </span>
      </div>

      {/* Copy button */}
      <button
        className="flex items-center gap-1 px-2 py-1 rounded-md border cursor-pointer transition-all hover:scale-105"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        onClick={() => onCopy(color.hex)}
      >
        <IconCopy size={10} style={{ color: `${theme.textMuted}99` }} />
        <span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>
          {color.hex}
        </span>
      </button>

      {/* HSL values */}
      <span className="font-mono text-[9px]" style={{ color: `${theme.textMuted}80` }}>
        {color.hsl.h}° {color.hsl.s}% {color.hsl.l}%
      </span>

      {/* WCAG contrast */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5" title={`vs White: ${badges.whiteRatio}:1`}>
          <span className="text-[9px]" style={{ color: `${theme.textMuted}66` }}>☀</span>
          <span className="font-mono text-[9px]" style={{ color: `${theme.textMuted}66` }}>
            {badges.whiteRatio}
          </span>
          {badges.whiteAAA && <span className="text-[8px] font-mono font-bold" style={{ color: theme.accent }}>AAA</span>}
          {!badges.whiteAAA && badges.whiteAA && <span className="text-[8px] font-mono font-bold" style={{ color: theme.accentSecondary }}>AA</span>}
        </div>
        <div className="flex items-center gap-0.5" title={`vs Black: ${badges.blackRatio}:1`}>
          <span className="text-[9px]" style={{ color: `${theme.textMuted}66` }}>☾</span>
          <span className="font-mono text-[9px]" style={{ color: `${theme.textMuted}66` }}>
            {badges.blackRatio}
          </span>
          {badges.blackAAA && <span className="text-[8px] font-mono font-bold" style={{ color: theme.accent }}>AAA</span>}
          {!badges.blackAAA && badges.blackAA && <span className="text-[8px] font-mono font-bold" style={{ color: theme.accentSecondary }}>AA</span>}
        </div>
      </div>

      {isActiveShade && (
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentSecondary }} />
      )}
    </div>
  );
}

/** Export code panel */
function ExportCodePanel({
  palette,
  format,
  onCopy,
  copied,
  colorNames,
  theme,
  labels,
}: {
  palette: PaletteColor[];
  format: ExportFormat;
  onCopy: () => void;
  copied: boolean;
  colorNames: string[];
  theme: GeneratorTheme;
  labels: Required<PaletteStudioLabels>;
}) {
  const code = useMemo(() => {
    const hexes = palette.map((c) => c.hex);
    switch (format) {
      case 'css':
        return hexes.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n');
      case 'tailwind': {
        const entries = hexes.map(
          (hex, i) => `      '${colorNames[i] || `color-${i + 1}`}': '${hex}',`
        );
        return ['colors: {', ...entries, '    },'].join('\n');
      }
      case 'json':
        return JSON.stringify(hexes, null, 2);
    }
  }, [palette, format, colorNames]);

  return (
    <div
      className="rounded-2xl overflow-hidden border flex flex-col"
      style={{ backgroundColor: theme.panelBg, borderColor: theme.border }}
    >
      <ChromeHeader filename={`export.${format}`} theme={theme} />

      <div
        className="p-4 overflow-y-auto font-mono max-h-[220px]"
        style={{ color: '#f8f8f2' }}
      >
        {code.split('\n').map((line, i) => (
          <CodeLine key={`ep-${i}`} lineNum={i + 1}>
            {highlightColors(line)}
          </CodeLine>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <span className="font-mono text-[10px] uppercase" style={{ color: theme.textMuted }}>
          {format}
        </span>
        <span className="font-mono text-[10px]" style={{ color: `${theme.textMuted}4d` }}>
          {code.split('\n').length} lines
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

/**
 * PaletteStudio — Color Harmony Generator
 *
 * Generate harmonious color palettes with HSL sliders, WCAG contrast checking,
 * shade generation, and multi-format export.
 */
export function PaletteStudio({
  initialColor = '#d4a017',
  defaultMode = 'complementary',
  presets = DEFAULT_PRESETS,
  colorNames = DEFAULT_COLOR_NAMES,
  shadeCount = 10,
  labels: labelOverrides,
  theme: themeOverrides,
  onPaletteChange,
  className,
}: PaletteStudioProps) {
  const mounted = useIsMounted();
  const t = useMemo(() => ({ ...DEFAULT_THEME, ...themeOverrides }), [themeOverrides]);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);

  // State
  const [baseHex, setBaseHex] = useState(initialColor);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>(defaultMode);
  const [palette, setPalette] = useState<PaletteColor[]>(() => getComplementary(160, 74, 47));
  const [activeShadeIndex, setActiveShadeIndex] = useState<number | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [hexInput, setHexInput] = useState(initialColor);
  const [hexError, setHexError] = useState(false);

  // Derived
  const baseHsl = useMemo(() => {
    const rgb = hexToRgb(baseHex);
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
  }, [baseHex]);

  // Generate palette respecting locks
  const generate = useCallback((h: number, s: number, l: number, mode: HarmonyMode) => {
    const newColors = generateByMode(h, s, l, mode);
    setPalette((prev) =>
      newColors.map((c, i) => (prev[i]?.locked ? prev[i] : c))
    );
  }, []);

  // Notify parent
  const updatePalette = useCallback((newPalette: PaletteColor[]) => {
    setPalette(newPalette);
    onPaletteChange?.(newPalette);
  }, [onPaletteChange]);

  const handleHexSubmit = useCallback((val: string) => {
    const clean = val.trim();
    if (/^#?[0-9a-fA-F]{3,6}$/.test(clean)) {
      const hex = clean.startsWith('#') ? clean : `#${clean}`;
      setBaseHex(hex);
      setHexInput(hex);
      setHexError(false);
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      generate(hsl.h, hsl.s, hsl.l, harmonyMode);
    } else {
      setHexError(true);
    }
  }, [harmonyMode, generate]);

  const handleHSLChange = useCallback((hsl: HSL) => {
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    setBaseHex(hex);
    setHexInput(hex);
    generate(hsl.h, hsl.s, hsl.l, harmonyMode);
  }, [harmonyMode, generate]);

  const handleModeChange = useCallback((mode: HarmonyMode) => {
    setHarmonyMode(mode);
    generate(baseHsl.h, baseHsl.s, baseHsl.l, mode);
  }, [baseHsl, generate]);

  const handleRandom = useCallback(() => {
    const newColors = generateRandomPalette();
    updatePalette(newColors);
    setBaseHex(newColors[0].hex);
    setHexInput(newColors[0].hex);
  }, [updatePalette]);

  const handleToggleLock = useCallback((index: number) => {
    setPalette((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  }, []);

  const handleRegenerate = useCallback(() => {
    generate(baseHsl.h, baseHsl.s, baseHsl.l, harmonyMode);
  }, [baseHsl, harmonyMode, generate]);

  const handleCopyColor = useCallback(async (hex: string) => {
    await copyToClipboard(hex);
  }, []);

  const handleCopyAll = useCallback(async () => {
    const text = palette.map((c) => c.hex).join(', ');
    await copyToClipboard(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [palette]);

  const handleCopyExport = useCallback(async () => {
    const hexes = palette.map((c) => c.hex);
    let code = '';
    switch (exportFormat) {
      case 'css':
        code = `:root {\n${hexes.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n')}\n}`;
        break;
      case 'tailwind':
        code = [
          '// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n',
          ...hexes.map((hex, i) => `        '${colorNames[i]}': '${hex}',`),
          '\n      },\n    },\n  },\n}',
        ].join('\n');
        break;
      case 'json':
        code = JSON.stringify(hexes, null, 2);
        break;
    }
    await copyToClipboard(code);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  }, [palette, exportFormat, colorNames]);

  const handleApplyPreset = useCallback((preset: PalettePreset) => {
    const newPalette = preset.colors.map((hex) => {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return makeColor(hsl.h, hsl.s, hsl.l);
    });
    updatePalette(newPalette);
    setBaseHex(newPalette[0].hex);
    setHexInput(newPalette[0].hex);
  }, [updatePalette]);

  const handleExportFile = useCallback(() => {
    const hexes = palette.map((c) => c.hex);
    let content = '';
    let ext = 'txt';
    switch (exportFormat) {
      case 'css':
        content = `:root {\n${hexes.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n')}\n}`;
        ext = 'css';
        break;
      case 'tailwind':
        content = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${hexes.map((hex, i) => `        '${colorNames[i]}': '${hex}',`).join('\n')}\n      },\n    },\n  },\n}`;
        ext = 'js';
        break;
      case 'json':
        content = JSON.stringify(hexes, null, 2);
        ext = 'json';
        break;
    }
    downloadFile(content, `palette.${ext}`);
  }, [palette, exportFormat, colorNames]);

  if (!mounted) return null;

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Global keyframe for fade-in animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Title */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
          style={{ borderColor: `${t.accentSecondary}33`, backgroundColor: `${t.accentSecondary}1a` }}
        >
          <IconPalette size={14} style={{ color: t.accentSecondary }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: t.accentSecondary }}>
            Color Tool
          </span>
        </div>
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4"
          style={{
            background: `linear-gradient(135deg, ${t.accentSecondary}, ${t.accent}, ${t.accentSecondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {labels.title}
        </h2>
        <p className="font-mono text-sm sm:text-base max-w-lg mx-auto" style={{ color: `${t.textMuted}b3` }}>
          {labels.subtitle}
        </p>
      </div>

      {/* Presets Row */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[10px]" style={{ color: t.textMuted }}>🎨</span>
          <h3 className="font-mono text-sm tracking-widest uppercase" style={{ color: t.textMuted }}>
            {labels.presets}
          </h3>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${t.accent}33, transparent)` }} />
          <button
            onClick={handleRandom}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all hover:scale-105"
            style={{ backgroundColor: t.surface, borderColor: t.border, color: t.textMuted }}
          >
            <IconShuffle size={14} />
            <span className="hidden sm:inline text-xs font-mono">{labels.random}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
          {presets.map((preset) => (
            <button
              key={`preset-${preset.name}`}
              onClick={() => handleApplyPreset(preset)}
              className="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-0 p-0 transition-transform hover:scale-105"
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border shadow-lg flex overflow-hidden transition-shadow"
                style={{ borderColor: t.border }}
              >
                {preset.colors.map((color, ci) => (
                  <div
                    key={`${preset.name}-${ci}`}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] sm:text-xs transition-colors" style={{ color: t.textMuted }}>
                {preset.icon} {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Controls Panel */}
        <div
          className="rounded-2xl overflow-hidden border flex flex-col"
          style={{ backgroundColor: t.panelBg, borderColor: t.border }}
        >
          <ChromeHeader filename="palette.config" theme={t} />

          <div className="p-4 sm:p-5 space-y-5 flex-1">
            {/* Base Color Picker */}
            <div>
              <label className="font-mono text-xs mb-2.5 block flex items-center gap-2" style={{ color: t.textMuted }}>
                <span style={{ color: `${t.accentSecondary}b3` }}>◆</span>
                {labels.baseColor}
              </label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={baseHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBaseHex(val);
                    setHexInput(val);
                    setHexError(false);
                    const rgb = hexToRgb(val);
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    generate(hsl.h, hsl.s, hsl.l, harmonyMode);
                  }}
                  className="w-10 h-10 rounded-lg border-2 cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                  style={{ borderColor: t.border }}
                  aria-label="Base color picker"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px]" style={{ color: `${t.textMuted}b3` }}>#</span>
                    <input
                      type="text"
                      value={hexInput.replace('#', '')}
                      onChange={(e) => {
                        setHexInput(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`);
                        setHexError(false);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleHexSubmit(hexInput); }}
                      className={`flex-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs focus:outline-none focus:ring-1 transition-colors ${
                        hexError ? 'border-red-500/50' : ''
                      }`}
                      style={{
                        backgroundColor: t.surface,
                        color: '#1a1a1a',
                        borderColor: hexError ? undefined : t.border,
                      }}
                    />
                  </div>
                </div>
              </div>

              <HSLSliders hsl={baseHsl} onChange={handleHSLChange} theme={t} />
            </div>

            {/* Harmony Mode */}
            <div>
              <label className="font-mono text-xs mb-2.5 block" style={{ color: t.textMuted }}>
                {labels.harmonyMode}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HARMONY_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className="px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer"
                    style={{
                      color: harmonyMode === mode.id ? '#1a1a1a' : `${t.textMuted}80`,
                      backgroundColor: harmonyMode === mode.id ? `${t.accent}1a` : 'rgba(26,26,26,0.05)',
                      border: `1px solid ${harmonyMode === mode.id ? `${t.accent}4d` : 'rgba(26,26,26,0.08)'}`,
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono cursor-pointer transition-all hover:scale-[1.02]"
                style={{ backgroundColor: t.surface, borderColor: t.border, border: `1px solid ${t.border}`, color: t.textMuted }}
              >
                <span style={{ color: `${t.accentSecondary}b3` }}>🔄</span>
                Regenerate
              </button>
              <button
                onClick={handleCopyAll}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: copiedAll ? `${t.accent}1a` : t.surface,
                  border: `1px solid ${copiedAll ? `${t.accent}4d` : t.border}`,
                  color: copiedAll ? t.accent : t.textMuted,
                }}
              >
                {copiedAll ? <IconCheck size={14} /> : <IconCopy size={14} />}
                {copiedAll ? labels.copied : labels.copyAll}
              </button>
            </div>
          </div>

          {/* Panel footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${t.accent}b3` }} />
              <span className="font-mono text-[10px]" style={{ color: `${t.textMuted}80` }}>Live</span>
            </div>
            <span className="font-mono text-[10px]" style={{ color: `${t.textMuted}4d` }}>
              5 colors
            </span>
          </div>
        </div>

        {/* Palette Display + Export */}
        <div className="flex flex-col gap-4 lg:gap-5">
          {/* Palette swatches */}
          <div className="grid grid-cols-5 gap-3">
            {palette.map((color, i) => (
              <React.Fragment key={`color-${i}`}>
                <ColorCard
                  color={color}
                  index={i}
                  onToggleLock={handleToggleLock}
                  onShowShades={setActiveShadeIndex}
                  onCopy={handleCopyColor}
                  isActiveShade={activeShadeIndex === i}
                  theme={t}
                />
                {/* Shades panel */}
                {activeShadeIndex === i && (
                  <div className="col-span-5">
                    <ShadesPanel
                      color={color}
                      onClose={() => setActiveShadeIndex(null)}
                      onCopy={handleCopyColor}
                      count={shadeCount}
                      theme={t}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Export format selector + code */}
          <ExportCodePanel
            palette={palette}
            format={exportFormat}
            onCopy={handleCopyExport}
            copied={copiedExport}
            colorNames={colorNames}
            theme={t}
            labels={labels}
          />

          {/* Export format tabs */}
          <div className="flex gap-2">
            {EXPORT_FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setExportFormat(fmt.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all"
                style={{
                  backgroundColor: exportFormat === fmt.id ? `${t.accent}1a` : t.surface,
                  border: `1px solid ${exportFormat === fmt.id ? `${t.accent}4d` : t.border}`,
                  color: exportFormat === fmt.id ? t.accent : t.textMuted,
                }}
              >
                {fmt.label}
              </button>
            ))}
            <button
              onClick={handleExportFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all hover:scale-105 ml-auto"
              style={{
                color: '#1a1a1a',
                background: `linear-gradient(135deg, ${t.accentSecondary}, ${t.accent})`,
              }}
            >
              <IconDownload size={14} />
              {labels.export}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaletteStudio;
