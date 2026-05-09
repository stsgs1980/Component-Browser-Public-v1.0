// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1370

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Copy,
  Check,
  Lock,
  Unlock,
  Shuffle,
  RefreshCw,
  Download,
  Eye,
  Code2,
  Layers,
  Brush,
  Droplets,
  Contrast,
  Sun,
  Moon,
  Pipette,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface PaletteColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  locked: boolean;
}

type HarmonyMode =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'monochromatic'
  | 'tetradic'
  | 'random';

type ExportFormat = 'css' | 'tailwind' | 'json';

interface PalettePreset {
  name: string;
  colors: string[];
  icon: string;
}

// ============================================================
// Color Conversion Functions (from scratch)
// ============================================================

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / d + 2) * 60;
        break;
      case bn:
        h = ((rn - gn) / d + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function makePaletteColor(h: number, s: number, l: number, locked = false): PaletteColor {
  const rgb = hslToRgb(h, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  return {
    hex,
    rgb,
    hsl: { h: ((h % 360) + 360) % 360, s, l },
    locked,
  };
}

// ============================================================
// Color Harmony Algorithms
// ============================================================

function getComplementary(h: number, s: number, l: number): PaletteColor[] {
  const c1 = makePaletteColor(h, s, l);
  const c2 = makePaletteColor(h, s, Math.min(l + 15, 95));
  const c3 = makePaletteColor((h + 180) % 360, s, l);
  const c4 = makePaletteColor((h + 180) % 360, s, Math.min(l + 15, 95));
  const c5 = makePaletteColor(h, s, Math.max(l - 15, 5));
  return [c1, c2, c3, c4, c5];
}

function getAnalogous(h: number, s: number, l: number): PaletteColor[] {
  return [
    makePaletteColor((h - 30 + 360) % 360, s, l),
    makePaletteColor((h - 15 + 360) % 360, s, Math.min(l + 10, 95)),
    makePaletteColor(h, s, l),
    makePaletteColor((h + 15) % 360, s, Math.min(l + 10, 95)),
    makePaletteColor((h + 30) % 360, s, l),
  ];
}

function getTriadic(h: number, s: number, l: number): PaletteColor[] {
  return [
    makePaletteColor(h, s, l),
    makePaletteColor(h, s, Math.min(l + 15, 95)),
    makePaletteColor((h + 120) % 360, s, l),
    makePaletteColor((h + 240) % 360, s, l),
    makePaletteColor((h + 240) % 360, s, Math.min(l + 15, 95)),
  ];
}

function getSplitComplementary(h: number, s: number, l: number): PaletteColor[] {
  return [
    makePaletteColor(h, s, l),
    makePaletteColor(h, s, Math.min(l + 15, 95)),
    makePaletteColor((h + 150) % 360, s, l),
    makePaletteColor((h + 210) % 360, s, l),
    makePaletteColor((h + 180) % 360, s, Math.max(l - 10, 5)),
  ];
}

function getMonochromatic(h: number, s: number, l: number): PaletteColor[] {
  return [
    makePaletteColor(h, s, Math.min(l + 25, 95)),
    makePaletteColor(h, s, Math.min(l + 12, 90)),
    makePaletteColor(h, s, l),
    makePaletteColor(h, s, Math.max(l - 12, 10)),
    makePaletteColor(h, s, Math.max(l - 25, 5)),
  ];
}

function getTetradic(h: number, s: number, l: number): PaletteColor[] {
  return [
    makePaletteColor(h, s, l),
    makePaletteColor((h + 90) % 360, s, l),
    makePaletteColor((h + 180) % 360, s, l),
    makePaletteColor((h + 270) % 360, s, l),
    makePaletteColor((h + 180) % 360, s, Math.min(l + 15, 95)),
  ];
}

function generateRandomPalette(): PaletteColor[] {
  const baseHue = Math.random() * 360;
  const schemes: (() => PaletteColor[])[] = [
    () => getComplementary(baseHue, 60 + Math.random() * 30, 45 + Math.random() * 20),
    () => getAnalogous(baseHue, 55 + Math.random() * 35, 40 + Math.random() * 25),
    () => getTriadic(baseHue, 55 + Math.random() * 35, 45 + Math.random() * 20),
    () => getSplitComplementary(baseHue, 60 + Math.random() * 25, 45 + Math.random() * 20),
    () => getTetradic(baseHue, 50 + Math.random() * 40, 45 + Math.random() * 20),
  ];
  return schemes[Math.floor(Math.random() * schemes.length)]();
}

function generateShades(h: number, s: number, l: number, count = 10): string[] {
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = Math.round(95 - (i / (count - 1)) * 85);
    shades.push(hslToHex(h, s, lightness));
  }
  return shades;
}

// ============================================================
// WCAG Contrast Ratio
// ============================================================

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1: RGB, rgb2: RGB): number {
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getContrastBadges(hex: string): { whiteRatio: number; blackRatio: number; whiteAA: boolean; whiteAAA: boolean; blackAA: boolean; blackAAA: boolean } {
  const rgb = hexToRgb(hex);
  const white: RGB = { r: 255, g: 255, b: 255 };
  const black: RGB = { r: 0, g: 0, b: 0 };
  const wRatio = contrastRatio(rgb, white);
  const bRatio = contrastRatio(rgb, black);
  return {
    whiteRatio: Math.round(wRatio * 100) / 100,
    blackRatio: Math.round(bRatio * 100) / 100,
    whiteAA: wRatio >= 4.5,
    whiteAAA: wRatio >= 7,
    blackAA: bRatio >= 4.5,
    blackAAA: bRatio >= 7,
  };
}

// ============================================================
// Presets
// ============================================================

const PRESETS: PalettePreset[] = [
  { name: 'Sunset', colors: ['#ff6b35', '#f7c948', '#ff006e', '#e63946', '#ffb703'], icon: '🌅' },
  { name: 'Ocean', colors: ['#0077b6', '#00b4d8', '#90e0ef', '#023e8a', '#48cae4'], icon: '🌊' },
  { name: 'Forest', colors: ['#2d6a4f', '#40916c', '#52b788', '#1b4332', '#95d5b2'], icon: '🌲' },
  { name: 'Neon', colors: ['#ff00ff', '#00ffff', '#39ff14', '#ff3131', '#f5ff00'], icon: '💜' },
  { name: 'Pastel', colors: ['#ffc8dd', '#bde0fe', '#a2d2ff', '#cdb4db', '#ffafcc'], icon: '🧁' },
  { name: 'Earth', colors: ['#6b4226', '#d4a373', '#ccd5ae', '#e9edc9', '#a98467'], icon: '🪨' },
  { name: 'Candy', colors: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'], icon: '🍬' },
  { name: 'Midnight', colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'], icon: '🌙' },
];

// ============================================================
// Floating Decorative Elements
// ============================================================

const FLOATING_SYMBOLS = ['#FFF', 'rgb()', 'hsl()', 'hsv()', 'α', 'β', '◆', '◉', '🎨', '⊙', 'hex', '🎨'];

function FloatingDecorations() {
  const items = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    symbol: FLOATING_SYMBOLS[i % FLOATING_SYMBOLS.length],
    left: 3 + (i * 7) % 92,
    top: 5 + (i * 7.2) % 90,
    size: 10 + (i % 3) * 3,
    duration: 10 + (i * 1.7) % 12,
    delay: (i * 0.6) % 6,
    rotate: -15 + (i * 8) % 30,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <motion.span
          key={`pal-float-${item.id}`}
          className="absolute font-mono select-none"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.size}px`,
            color: 'rgba(255,255,255,0.025)',
          }}
          animate={{
            y: [0, -10, 0, 8, 0],
            x: [0, 5, -3, 2, 0],
            rotate: [item.rotate, item.rotate + 4, item.rotate - 2, item.rotate + 1, item.rotate],
            opacity: [0.02, 0.04, 0.025, 0.035, 0.02],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeatType: "loop",
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.symbol}
        </motion.span>
      ))}
    </div>
  );
}

// ============================================================
// HSL Sliders Sub-component
// ============================================================

function HSLSliders({
  hsl,
  onChange,
}: {
  hsl: HSL;
  onChange: (hsl: HSL) => void;
}) {
  const updateH = (val: number) => onChange({ ...hsl, h: val });
  const updateS = (val: number) => onChange({ ...hsl, s: val });
  const updateL = (val: number) => onChange({ ...hsl, l: val });

  return (
    <div className="space-y-3">
      {/* Hue slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-white/30">H (Hue)</span>
          <span className="font-mono text-[10px] text-emerald-400/70">{hsl.h}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={360}
          value={hsl.h}
          onChange={(e) => updateH(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
          }}
          aria-label="Hue"
        />
      </div>
      {/* Saturation slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-white/30">S (Saturation)</span>
          <span className="font-mono text-[10px] text-emerald-400/70">{hsl.s}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={hsl.s}
          onChange={(e) => updateS(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`,
          }}
          aria-label="Saturation"
        />
      </div>
      {/* Lightness slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-white/30">L (Lightness)</span>
          <span className="font-mono text-[10px] text-emerald-400/70">{hsl.l}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={hsl.l}
          onChange={(e) => updateL(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, #000000, ${hslToHex(hsl.h, hsl.s, 50)}, #ffffff)`,
          }}
          aria-label="Lightness"
        />
      </div>
    </div>
  );
}

// ============================================================
// Shades Panel Sub-component
// ============================================================

function ShadesPanel({
  color,
  onClose,
  onCopy,
}: {
  color: PaletteColor;
  onClose: () => void;
  onCopy: (text: string) => void;
}) {
  const shades = generateShades(color.hsl.h, color.hsl.s, color.hsl.l, 10);

  return (
    <motion.div
      className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-3 space-y-2"
      initial={{ opacity: 0, y: -5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] text-white/40">10 Shades</span>
        <button
          onClick={onClose}
          className="font-mono text-[10px] text-white/30 hover:text-white/60 transition-colors"
        >
          ✕ close
        </button>
      </div>
      <div className="flex rounded-lg overflow-hidden border border-white/[0.04]">
        {shades.map((shade, i) => (
          <motion.button
            key={`shade-${i}`}
            className="flex-1 h-10 sm:h-14 relative group cursor-pointer border-0 p-0"
            style={{ backgroundColor: shade }}
            onClick={() => onCopy(shade)}
            whileHover={{ scale: 1.15, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            title={`${shade} — click to copy`}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[8px] text-white/0 group-hover:text-white/60 whitespace-nowrap transition-colors">
              {shade}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================
// Color Card Sub-component
// ============================================================

function ColorCard({
  color,
  index,
  onToggleLock,
  onShowShades,
  onCopy,
  isActiveShade,
}: {
  color: PaletteColor;
  index: number;
  onToggleLock: (index: number) => void;
  onShowShades: (index: number) => void;
  onCopy: (text: string) => void;
  isActiveShade: boolean;
}) {
  const badges = getContrastBadges(color.hex);
  const textColor = (badges.blackRatio > badges.whiteRatio) ? '#000000' : '#ffffff';

  return (
    <motion.div
      className="flex flex-col items-center gap-2 group"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      {/* Large swatch — use div instead of button to allow nested lock button */}
      <motion.div
        className="relative w-full aspect-square rounded-xl border border-white/[0.08] cursor-pointer overflow-hidden"
        style={{ backgroundColor: color.hex }}
        onClick={() => onShowShades(index)}
        whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${color.hex}40` }}
        whileTap={{ scale: 0.97 }}
        title="Click to see shades"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onShowShades(index); } }}
      >
        {/* Lock icon overlay */}
        <motion.button
          className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-0 p-0"
          style={{
            backgroundColor: color.locked ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(index);
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          title={color.locked ? 'Unlock color' : 'Lock color'}
        >
          {color.locked
            ? <Lock className="w-3 h-3" style={{ color: '#fbbf24' }} />
            : <Unlock className="w-3 h-3" style={{ color: textColor, opacity: 0.7 }} />
          }
        </motion.button>

        {/* Hex label */}
        <span
          className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
          style={{ color: textColor, backgroundColor: color.locked ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)' }}
        >
          {color.hex.toUpperCase()}
        </span>
      </motion.div>

      {/* Copy hex button */}
      <motion.button
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer"
        onClick={() => onCopy(color.hex)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Copy className="w-2.5 h-2.5 text-white/30" />
        <span className="font-mono text-[10px] text-white/40">{color.hex}</span>
      </motion.button>

      {/* HSL values */}
      <span className="font-mono text-[9px] text-white/20">
        {color.hsl.h}° {color.hsl.s}% {color.hsl.l}%
      </span>

      {/* WCAG contrast indicators */}
      <div className="flex items-center gap-1.5">
        {/* White contrast */}
        <div className="flex items-center gap-0.5" title={`vs White: ${badges.whiteRatio}:1`}>
          <Sun className="w-2.5 h-2.5 text-white/25" />
          <span className="font-mono text-[9px] text-white/25">{badges.whiteRatio}</span>
          {badges.whiteAAA && <span className="text-[8px] font-mono text-emerald-400/70 font-bold">AAA</span>}
          {!badges.whiteAAA && badges.whiteAA && <span className="text-[8px] font-mono text-cyan-400/60 font-bold">AA</span>}
        </div>
        {/* Black contrast */}
        <div className="flex items-center gap-0.5" title={`vs Black: ${badges.blackRatio}:1`}>
          <Moon className="w-2.5 h-2.5 text-white/25" />
          <span className="font-mono text-[9px] text-white/25">{badges.blackRatio}</span>
          {badges.blackAAA && <span className="text-[8px] font-mono text-emerald-400/70 font-bold">AAA</span>}
          {!badges.blackAAA && badges.blackAA && <span className="text-[8px] font-mono text-cyan-400/60 font-bold">AA</span>}
        </div>
      </div>

      {/* Shades indicator */}
      {isActiveShade && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-1.5 h-1.5 rounded-full bg-cyan-400"
        />
      )}
    </motion.div>
  );
}

// ============================================================
// Export Code Panel
// ============================================================

function ExportCodePanel({
  palette,
  format,
  onCopy,
  copied,
}: {
  palette: PaletteColor[];
  format: ExportFormat;
  onCopy: () => void;
  copied: boolean;
}) {
  const code = useMemo(() => {
    const hexes = palette.map((c) => c.hex);
    switch (format) {
      case 'css':
        return hexes
          .map((hex, i) => `  --color-${i + 1}: ${hex};`)
          .join('\n');
      case 'tailwind': {
        const entries = hexes.map((hex, i) => `      '${['primary', 'secondary', 'accent', 'muted', 'card'][i]}': '${hex}',`);
        return [
          'colors: {',
          ...entries,
          '    },',
        ].join('\n');
      }
      case 'json':
        return JSON.stringify(hexes, null, 2);
    }
  }, [palette, format]);

  const highlighted = useMemo(() => {
    const lines = code.split('\n');
    return lines.map((line, i) => {
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let keyIdx = 0;
      const colorRegex = /#[0-9a-fA-F]{3,8}/g;
      let lastIndex = 0;
      let match;
      while ((match = colorRegex.exec(remaining)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={`ep-${i}-${keyIdx++}`} className="syn-value">{remaining.slice(lastIndex, match.index)}</span>);
        }
        parts.push(<span key={`ep-${i}-${keyIdx++}`} className="syn-number">{match[0]}</span>);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < remaining.length) {
        parts.push(<span key={`ep-${i}-${keyIdx++}`} className="syn-value">{remaining.slice(lastIndex)}</span>);
      }
      return (
        <div key={`ep-line-${i}`} className="flex leading-[1.625rem]">
          <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{i + 1}</span>
          <span className="whitespace-pre text-xs">{parts.length > 0 ? parts : <span>&nbsp;</span>}</span>
        </div>
      );
    });
  }, [code]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col" style={{ background: '#0d1117' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="font-mono text-[11px] text-white/30 ml-2 flex items-center gap-1.5">
            <Code2 className="w-3 h-3 text-white/25" />
            export.{format}
          </span>
        </div>
        <motion.button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copied!</span>
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Code */}
      <div className="p-4 overflow-y-auto custom-scrollbar font-mono max-h-[220px]" style={{ color: '#f8f8f2' }}>
        {highlighted}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
        <span className="font-mono text-[10px] text-white/20 uppercase">{format}</span>
        <span className="font-mono text-[10px] text-white/15">{code.split('\n').length} lines</span>
      </div>
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function ColorPaletteSection() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // State
  const [baseHex, setBaseHex] = useState('#10b981');
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('complementary');
  const [palette, setPalette] = useState<PaletteColor[]>(() => getComplementary(160, 74, 47));
  const [activeShadeIndex, setActiveShadeIndex] = useState<number | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [hexInput, setHexInput] = useState('#10b981');
  const [hexError, setHexError] = useState(false);

  // Derived
  const baseHsl = useMemo(() => {
    const rgb = hexToRgb(baseHex);
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
  }, [baseHex]);

  // Generate palette from base color + harmony mode (respecting locks)
  const generatePalette = useCallback((h: number, s: number, l: number, mode: HarmonyMode) => {
    let newColors: PaletteColor[];
    switch (mode) {
      case 'complementary': newColors = getComplementary(h, s, l); break;
      case 'analogous': newColors = getAnalogous(h, s, l); break;
      case 'triadic': newColors = getTriadic(h, s, l); break;
      case 'split-complementary': newColors = getSplitComplementary(h, s, l); break;
      case 'monochromatic': newColors = getMonochromatic(h, s, l); break;
      case 'tetradic': newColors = getTetradic(h, s, l); break;
      case 'random': newColors = generateRandomPalette(); break;
      default: newColors = getComplementary(h, s, l);
    }
    setPalette((prev) =>
      newColors.map((c, i) => (prev[i]?.locked ? prev[i] : c))
    );
  }, []);

  // Handle base hex change
  const handleHexSubmit = useCallback((val: string) => {
    const clean = val.trim();
    if (/^#?[0-9a-fA-F]{3,6}$/.test(clean)) {
      const hex = clean.startsWith('#') ? clean : `#${clean}`;
      setBaseHex(hex);
      setHexInput(hex);
      setHexError(false);
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      generatePalette(hsl.h, hsl.s, hsl.l, harmonyMode);
    } else {
      setHexError(true);
    }
  }, [harmonyMode, generatePalette]);

  // Handle HSL slider change
  const handleHSLChange = useCallback((hsl: HSL) => {
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    setBaseHex(hex);
    setHexInput(hex);
    generatePalette(hsl.h, hsl.s, hsl.l, harmonyMode);
  }, [harmonyMode, generatePalette]);

  // Handle harmony mode change
  const handleModeChange = useCallback((mode: HarmonyMode) => {
    setHarmonyMode(mode);
    generatePalette(baseHsl.h, baseHsl.s, baseHsl.l, mode);
  }, [baseHsl, generatePalette]);

  // Handle random palette
  const handleRandom = useCallback(() => {
    const newColors = generateRandomPalette();
    setPalette(newColors);
    const base = newColors[0];
    setBaseHex(base.hex);
    setHexInput(base.hex);
  }, []);

  // Toggle lock
  const handleToggleLock = useCallback((index: number) => {
    setPalette((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  }, []);

  // Regenerate (respecting locks)
  const handleRegenerate = useCallback(() => {
    generatePalette(baseHsl.h, baseHsl.s, baseHsl.l, harmonyMode);
  }, [baseHsl, harmonyMode, generatePalette]);

  // Copy single color
  const handleCopyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }, []);

  // Copy all palette hexes
  const handleCopyAll = useCallback(() => {
    const text = palette.map((c) => c.hex).join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  }, [palette]);

  // Copy export code
  const handleCopyExport = useCallback(() => {
    const hexes = palette.map((c) => c.hex);
    let code = '';
    switch (exportFormat) {
      case 'css':
        code = hexes.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n');
        break;
      case 'tailwind':
        code = [
          'colors: {',
          ...hexes.map((hex, i) => `      '${['primary', 'secondary', 'accent', 'muted', 'card'][i]}': '${hex}',`),
          '    },',
        ].join('\n');
        break;
      case 'json':
        code = JSON.stringify(hexes, null, 2);
        break;
    }
    navigator.clipboard.writeText(code).then(() => {
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    });
  }, [palette, exportFormat]);

  // Apply preset
  const handleApplyPreset = useCallback((preset: PalettePreset) => {
    const newPalette = preset.colors.map((hex) => {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return makePaletteColor(hsl.h, hsl.s, hsl.l);
    });
    setPalette(newPalette);
    setBaseHex(newPalette[0].hex);
    setHexInput(newPalette[0].hex);
  }, []);

  // Export file
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
        content = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${hexes.map((hex, i) => `        '${['primary', 'secondary', 'accent', 'muted', 'card'][i]}': '${hex}',`).join('\n')}\n      },\n    },\n  },\n}`;
        ext = 'js';
        break;
      case 'json':
        content = JSON.stringify(hexes, null, 2);
        ext = 'json';
        break;
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [palette, exportFormat]);

  if (!mounted) return null;

  const harmonyModes: { id: HarmonyMode; label: string }[] = [
    { id: 'complementary', label: 'Complementary' },
    { id: 'analogous', label: 'Analogous' },
    { id: 'triadic', label: 'Triadic' },
    { id: 'split-complementary', label: 'Split-Comp' },
    { id: 'monochromatic', label: 'Monochromatic' },
    { id: 'tetradic', label: 'Tetradic' },
    { id: 'random', label: 'Random' },
  ];

  const exportFormats: { id: ExportFormat; label: string }[] = [
    { id: 'css', label: 'CSS Variables' },
    { id: 'tailwind', label: 'Tailwind' },
    { id: 'json', label: 'JSON' },
  ];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #141420 50%, #0a0a0a 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Floating decorations */}
      <FloatingDecorations />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {/* ===== Section Header ===== */}
        <div className="pt-20 sm:pt-28 pb-10 sm:pb-14 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] mb-6">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest">
                Color Tool
              </span>
            </div>

            <h2
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4, #10b981)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 4s ease-in-out infinite',
              }}
            >
              Palette Studio
            </h2>

            <p className="font-mono text-sm sm:text-base text-white/30 tracking-wide max-w-lg mx-auto">
              Generate harmonious color palettes with color theory algorithms
            </p>
          </motion.div>
        </div>

        {/* ===== Main Content ===== */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">

          {/* --- Presets Row --- */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <Brush className="w-4 h-4 text-emerald-400/60" />
              <h3 className="font-mono text-sm text-white/40 tracking-widest uppercase">Presets</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
              <motion.button
                onClick={handleRandom}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Random</span>
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
              {PRESETS.map((preset) => (
                <motion.button
                  key={`preset-${preset.name}`}
                  onClick={() => handleApplyPreset(preset)}
                  className="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-0 p-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-white/[0.1] shadow-lg transition-shadow group-hover:shadow-xl group-hover:border-white/20 overflow-hidden flex"
                  >
                    {preset.colors.map((color, ci) => (
                      <div
                        key={`presetc-${preset.name}-${ci}`}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-white/40 group-hover:text-white/60 transition-colors">
                    {preset.icon} {preset.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* --- Two-panel layout: Controls + Palette Display --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

            {/* ===== Controls Panel ===== */}
            <motion.div
              className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col"
              style={{ background: '#0d1117' }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Panel header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="font-mono text-[11px] text-white/30 ml-2">palette.config</span>
              </div>

              <div className="p-4 sm:p-5 space-y-5 flex-1">
                {/* Base Color Picker */}
                <div>
                  <label className="font-mono text-xs text-white/40 mb-2.5 block flex items-center gap-2">
                    <Pipette className="w-3.5 h-3.5 text-cyan-400/50" />
                    Base Color
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={baseHex}
                        onChange={(e) => {
                          setBaseHex(e.target.value);
                          setHexInput(e.target.value);
                          setHexError(false);
                          const rgb = hexToRgb(e.target.value);
                          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                          generatePalette(hsl.h, hsl.s, hsl.l, harmonyMode);
                        }}
                        className="w-10 h-10 rounded-lg border-2 border-white/[0.1] cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                        aria-label="Base color picker"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-white/30">#</span>
                        <input
                          type="text"
                          value={hexInput.replace('#', '')}
                          onChange={(e) => {
                            setHexInput(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`);
                            setHexError(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleHexSubmit(hexInput);
                            }
                          }}
                          className={`flex-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border font-mono text-xs text-white/80 focus:outline-none focus:ring-1 transition-colors ${
                            hexError
                              ? 'border-red-500/50 focus:ring-red-500/30'
                              : 'border-white/[0.08] focus:ring-emerald-500/30'
                          }`}
                          placeholder="10b981"
                          maxLength={7}
                          aria-label="Hex color input"
                        />
                        {hexError && (
                          <span className="text-[10px] text-red-400/70 font-mono">Invalid</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* HSL Sliders */}
                  <HSLSliders hsl={baseHsl} onChange={handleHSLChange} />
                </div>

                {/* Harmony Mode Selector */}
                <div>
                  <label className="font-mono text-xs text-white/40 mb-2.5 block flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-cyan-400/50" />
                    Harmony Mode
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {harmonyModes.map((mode) => {
                      const isActive = harmonyMode === mode.id;
                      return (
                        <motion.button
                          key={`mode-${mode.id}`}
                          onClick={() => handleModeChange(mode.id)}
                          className="relative px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono transition-all cursor-pointer border-0"
                          style={{
                            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)',
                            backgroundColor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {mode.label}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-lg"
                              style={{
                                border: '1px solid rgba(16,185,129,0.2)',
                                boxShadow: '0 0 12px rgba(16,185,129,0.08)',
                              }}
                              layoutId="harmonyModeIndicator"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Panel footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  <span className="font-mono text-[10px] text-white/20">Live</span>
                </div>
                <span className="font-mono text-[10px] text-white/15">{palette.filter((c) => c.locked).length} locked</span>
              </div>
            </motion.div>

            {/* ===== Palette Display Panel ===== */}
            <motion.div
              className="flex flex-col gap-4 lg:gap-5"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {/* Palette Display */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col" style={{ background: '#0d1117' }}>
                {/* Header with actions */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    <span className="font-mono text-[11px] text-white/30 ml-2 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-white/25" />
                      Palette
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      onClick={handleRegenerate}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Regenerate palette"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Regen</span>
                    </motion.button>
                    <motion.button
                      onClick={handleCopyAll}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Copy all colors"
                    >
                      <AnimatePresence mode="wait">
                        {copiedAll ? (
                          <motion.span key="ca" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1.5 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copied!</span>
                          </motion.span>
                        ) : (
                          <motion.span key="cb" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1.5">
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copy All</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <motion.button
                      onClick={handleRandom}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer"
                      style={{
                        color: '#ffffff',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                      }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      title="Random palette"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Random</span>
                    </motion.button>
                  </div>
                </div>

                {/* Color swatches */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-5 gap-3 sm:gap-4">
                    {palette.map((color, index) => (
                      <ColorCard
                        key={`palcard-${index}`}
                        color={color}
                        index={index}
                        onToggleLock={handleToggleLock}
                        onShowShades={(i) => setActiveShadeIndex(activeShadeIndex === i ? null : i)}
                        onCopy={handleCopyColor}
                        isActiveShade={activeShadeIndex === index}
                      />
                    ))}
                  </div>

                  {/* Shades panel */}
                  <AnimatePresence>
                    {activeShadeIndex !== null && palette[activeShadeIndex] && (
                      <div className="mt-4">
                        <ShadesPanel
                          color={palette[activeShadeIndex]}
                          onClose={() => setActiveShadeIndex(null)}
                          onCopy={handleCopyColor}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Full palette bar preview */}
                <div className="mx-4 mb-4 h-6 rounded-lg overflow-hidden border border-white/[0.04] flex">
                  {palette.map((color, i) => (
                    <div
                      key={`palbar-${i}`}
                      className="flex-1 transition-colors"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>

                {/* Panel footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Contrast className="w-3 h-3 text-white/20" />
                      <span className="font-mono text-[10px] text-white/20">WCAG</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-white/15">{palette.length} colors</span>
                </div>
              </div>

              {/* Export Section */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col" style={{ background: '#0d1117' }}>
                {/* Export header */}
                <div className="flex items-center border-b border-white/[0.06]">
                  <div className="flex items-center">
                    {exportFormats.map((fmt) => {
                      const isActive = exportFormat === fmt.id;
                      return (
                        <button
                          key={`efmt-${fmt.id}`}
                          onClick={() => setExportFormat(fmt.id)}
                          className="relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-mono transition-colors cursor-pointer bg-transparent border-0"
                          style={{
                            color: isActive ? '#f8f8f2' : 'rgba(255,255,255,0.3)',
                          }}
                        >
                          <span>{fmt.label}</span>
                          {isActive && (
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 h-[2px]"
                              style={{ background: '#06b6d4' }}
                              layoutId="paletteExportTab"
                              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-1" />
                  <motion.button
                    onClick={handleExportFile}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors mr-2 cursor-pointer"
                    style={{
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                    }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    title="Export file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </motion.button>
                </div>

                {/* Export code */}
                <ExportCodePanel
                  palette={palette}
                  format={exportFormat}
                  onCopy={handleCopyExport}
                  copied={copiedExport}
                />
              </div>
            </motion.div>
          </div>

          {/* ===== Info Bar ===== */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-4 px-4 rounded-xl border border-white/[0.04] bg-white/[0.01]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { icon: Palette, label: '7 Algorithms' },
              { icon: Layers, label: '5 Colors' },
              { icon: Code2, label: '4 Export Formats' },
              { icon: Contrast, label: 'WCAG Contrast' },
            ].map((item, i) => (
              <div key={`pal-info-${i}`} className="flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5 text-emerald-400/50" />
                <span className="font-mono text-[11px] text-white/30">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
