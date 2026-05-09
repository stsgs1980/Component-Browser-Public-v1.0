// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1329

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Eye,
  Code2,
  Palette,
  Link2,
  Unlink2,
  ChevronDown,
  RotateCw,
  Sparkles,
  Layers,
  Type,
  MousePointer2,
  Square,
  ArrowDownToLine,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNT HOOK
   ────────────────────────────────────────────── */
const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */
type BorderSide = 'top' | 'right' | 'bottom' | 'left';
type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none' | 'hidden';
type BoxSize = 'small' | 'medium' | 'large';

interface BorderConfig {
  width: number;
  style: BorderStyle;
  color: string;
  perSide: boolean;
  topWidth: number;
  rightWidth: number;
  bottomWidth: number;
  leftWidth: number;
  topColor: string;
  rightColor: string;
  bottomColor: string;
  leftColor: string;
  topStyle: BorderStyle;
  rightStyle: BorderStyle;
  bottomStyle: BorderStyle;
  leftStyle: BorderStyle;
}

interface RadiusConfig {
  linked: boolean;
  all: number;
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

interface OutlineConfig {
  enabled: boolean;
  width: number;
  style: BorderStyle;
  color: string;
  offset: number;
}

interface GradientBorderConfig {
  enabled: boolean;
  angle: number;
  stop1: string;
  stop2: string;
  stop3: string;
  useThreeStops: boolean;
}

interface Preset {
  name: string;
  icon: string;
  border: Partial<BorderConfig>;
  radius: Partial<RadiusConfig>;
  outline?: Partial<OutlineConfig>;
  gradient?: Partial<GradientBorderConfig>;
  extraStyle?: React.CSSProperties;
}

/* ──────────────────────────────────────────────
   BORDER STYLES
   ────────────────────────────────────────────── */
const BORDER_STYLES: BorderStyle[] = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'];

/* ──────────────────────────────────────────────
   DEFAULT CONFIGS
   ────────────────────────────────────────────── */
const defaultBorder: BorderConfig = {
  width: 2,
  style: 'solid',
  color: '#10b981',
  perSide: false,
  topWidth: 2,
  rightWidth: 2,
  bottomWidth: 2,
  leftWidth: 2,
  topColor: '#10b981',
  rightColor: '#10b981',
  bottomColor: '#10b981',
  leftColor: '#10b981',
  topStyle: 'solid',
  rightStyle: 'solid',
  bottomStyle: 'solid',
  leftStyle: 'solid',
};

const defaultRadius: RadiusConfig = {
  linked: true,
  all: 12,
  topLeft: 12,
  topRight: 12,
  bottomRight: 12,
  bottomLeft: 12,
};

const defaultOutline: OutlineConfig = {
  enabled: false,
  width: 2,
  style: 'solid',
  color: '#06b6d4',
  offset: 4,
};

const defaultGradient: GradientBorderConfig = {
  enabled: false,
  angle: 90,
  stop1: '#10b981',
  stop2: '#06b6d4',
  stop3: '#8b5cf6',
  useThreeStops: false,
};

/* ──────────────────────────────────────────────
   PRESETS
   ────────────────────────────────────────────── */
const PRESETS: Preset[] = [
  {
    name: 'Card',
    icon: '□',
    border: { width: 1, style: 'solid', color: 'rgba(255,255,255,0.1)' },
    radius: { all: 16 },
    outline: { enabled: false },
  },
  {
    name: 'Neon Glow',
    icon: '✦',
    border: { width: 2, style: 'solid', color: '#10b981' },
    radius: { all: 12 },
    outline: { enabled: false },
    extraStyle: { boxShadow: '0 0 10px #10b981, 0 0 20px #10b98140, 0 0 40px #10b98120' },
  },
  {
    name: 'Dashed Tag',
    icon: '﹏',
    border: { width: 2, style: 'dashed', color: '#f59e0b' },
    radius: { all: 8 },
  },
  {
    name: 'Double Frame',
    icon: '▤',
    border: { width: 4, style: 'double', color: '#06b6d4' },
    radius: { all: 12 },
  },
  {
    name: 'Gradient',
    icon: '◈',
    border: { width: 3, style: 'solid', color: '#10b981' },
    radius: { all: 16 },
    gradient: { enabled: true, angle: 135, stop1: '#10b981', stop2: '#06b6d4', stop3: '#8b5cf6', useThreeStops: true },
  },
  {
    name: 'Dotted Circle',
    icon: '○',
    border: { width: 3, style: 'dotted', color: '#ec4899' },
    radius: { all: 100 },
  },
  {
    name: 'Groove Panel',
    icon: '▽',
    border: { width: 4, style: 'groove', color: '#64748b' },
    radius: { all: 8 },
  },
  {
    name: 'Ridge Badge',
    icon: '△',
    border: { width: 4, style: 'ridge', color: '#a855f7' },
    radius: { all: 24 },
  },
  {
    name: 'Glassmorphism',
    icon: '◇',
    border: { width: 1, style: 'solid', color: 'rgba(255,255,255,0.18)' },
    radius: { all: 16 },
    extraStyle: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  },
  {
    name: 'Underline',
    icon: '▁',
    border: { width: 0, style: 'none', color: '#10b981', perSide: true, topWidth: 0, rightWidth: 0, bottomWidth: 3, leftWidth: 0, topStyle: 'none', rightStyle: 'none', bottomStyle: 'solid', leftStyle: 'none', topColor: '#10b981', rightColor: '#10b981', bottomColor: '#10b981', leftColor: '#10b981' },
    radius: { all: 4 },
  },
];

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function highlightCSSLine(line: string, lineNum: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let keyIdx = 0;

  // Match selector
  if (remaining.includes('.element')) {
    const idx = remaining.indexOf('.element');
    if (idx > 0) parts.push(<span key={`${lineNum}-${keyIdx++}`} className="syn-value">{remaining.slice(0, idx)}</span>);
    parts.push(<span key={`${lineNum}-${keyIdx++}`} className="syn-tag">.element</span>);
    remaining = remaining.slice(idx + 8);
  }

  // Match { and }
  const braceMatch = remaining.match(/^(\s*)(\{|\})/);
  if (braceMatch) {
    if (braceMatch[1]) parts.push(<span key={`${lineNum}-${keyIdx++}`}>{braceMatch[1]}</span>);
    parts.push(<span key={`${lineNum}-${keyIdx++}`} className="syn-bracket">{braceMatch[2]}</span>);
    remaining = remaining.slice(braceMatch[0].length);
  }

  // Match property: value pattern
  const propMatch = remaining.match(/^(\s*)([\w-]+)(\s*:\s*)(.*)$/);
  if (propMatch && !remaining.includes('{')) {
    if (propMatch[1]) parts.push(<span key={`${lineNum}-${keyIdx++}`}>{propMatch[1]}</span>);
    parts.push(<span key={`${lineNum}-${keyIdx++}`} className="syn-property">{propMatch[2]}</span>);
    parts.push(<span key={`${lineNum}-${keyIdx++}`} className="syn-punctuation">{propMatch[3]}</span>);

    const valueStr = propMatch[4];
    // Highlight values
    const colorRegex = /#[0-9a-fA-F]{3,8}/g;
    const numRegex = /(\d+(?:\.\d+)?)(px|%|deg|em|rem|vh|vw)/g;
    let lastIdx = 0;
    let match;

    // First find colors
    const valueParts: React.ReactNode[] = [];
    while ((match = colorRegex.exec(valueStr)) !== null) {
      if (match.index > lastIdx) valueParts.push(<span key={`${lineNum}-v-${keyIdx++}`} className="syn-value">{valueStr.slice(lastIdx, match.index)}</span>);
      valueParts.push(<span key={`${lineNum}-c-${keyIdx++}`} className="syn-number">{match[0]}</span>);
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < valueStr.length) {
      const rest = valueStr.slice(lastIdx);
      // Highlight numbers with units
      let numLastIdx = 0;
      const numParts: React.ReactNode[] = [];
      while ((match = numRegex.exec(rest)) !== null) {
        if (match.index > numLastIdx) numParts.push(<span key={`${lineNum}-n-${keyIdx++}`} className="syn-value">{rest.slice(numLastIdx, match.index)}</span>);
        numParts.push(<span key={`${lineNum}-nu-${keyIdx++}`} className="syn-number">{match[0]}</span>);
        numLastIdx = match.index + match[0].length;
      }
      if (numLastIdx < rest.length) numParts.push(<span key={`${lineNum}-nr-${keyIdx++}`} className="syn-value">{rest.slice(numLastIdx)}</span>);
      valueParts.push(...numParts);
    }
    parts.push(...valueParts);
  } else if (remaining && !braceMatch) {
    // Plain line - highlight colors and numbers
    const colorRegex2 = /#[0-9a-fA-F]{3,8}/g;
    let lastI = 0;
    let m;
    while ((m = colorRegex2.exec(remaining)) !== null) {
      if (m.index > lastI) parts.push(<span key={`${lineNum}-r-${keyIdx++}`}>{remaining.slice(lastI, m.index)}</span>);
      parts.push(<span key={`${lineNum}-rc-${keyIdx++}`} className="syn-number">{m[0]}</span>);
      lastI = m.index + m[0].length;
    }
    if (lastI < remaining.length) parts.push(<span key={`${lineNum}-re-${keyIdx++}`} className="syn-value">{remaining.slice(lastI)}</span>);
  }

  if (parts.length === 0) parts.push(<span key={`${lineNum}-plain`}>&nbsp;</span>);

  return (
    <div key={`css-${lineNum}`} className="flex leading-[1.625rem]">
      <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{lineNum}</span>
      <span className="whitespace-pre text-xs">{parts}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   FLOATING DECORATIONS
   ────────────────────────────────────────────── */
function FloatingDecorations() {
  const symbols = [
    { text: 'border:', x: 5, y: 8, delay: 0 },
    { text: '2px solid', x: 88, y: 12, delay: 1.5 },
    { text: 'radius()', x: 90, y: 55, delay: 0.8 },
    { text: 'outline', x: 6, y: 78, delay: 2.2 },
    { text: 'border-image', x: 78, y: 88, delay: 1.0 },
    { text: '▪', x: 18, y: 42, delay: 0.3 },
    { text: 'groove', x: 50, y: 6, delay: 1.8 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {symbols.map((sym, i) => (
        <motion.div
          key={`border-deco-${i}`}
          className="absolute font-mono text-[10px] whitespace-nowrap select-none"
          style={{
            left: `${sym.x}%`,
            top: `${sym.y}%`,
            color: 'rgba(245, 158, 11, 0.07)',
          }}
          animate={{ y: [0, -10, 0], opacity: [0.04, 0.12, 0.04] }}
          transition={{ duration: 7 + i * 1.1, repeatType: 'loop', repeat: Infinity, ease: 'easeInOut', delay: sym.delay }}
        >
          {sym.text}
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SLIDER COMPONENT
   ────────────────────────────────────────────── */
function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  accentColor,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  accentColor?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = accentColor || '#f59e0b';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">{label}</span>
        <span className="text-[11px] font-mono text-emerald-400/80 tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color}88 ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function BorderGeneratorSection() {
  const mounted = useIsMounted();
  const [border, setBorder] = useState<BorderConfig>({ ...defaultBorder });
  const [radius, setRadius] = useState<RadiusConfig>({ ...defaultRadius });
  const [outline, setOutline] = useState<OutlineConfig>({ ...defaultOutline });
  const [gradient, setGradient] = useState<GradientBorderConfig>({ ...defaultGradient });
  const [boxSize, setBoxSize] = useState<BoxSize>('medium');
  const [hoverPreview, setHoverPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePanel, setActivePanel] = useState<'border' | 'radius' | 'outline' | 'gradient'>('border');

  // ── Computed border style for preview ──
  const previewBorderStyle = useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (border.perSide) {
      style.borderTop = `${border.topWidth}px ${border.topStyle} ${border.topColor}`;
      style.borderRight = `${border.rightWidth}px ${border.rightStyle} ${border.rightColor}`;
      style.borderBottom = `${border.bottomWidth}px ${border.bottomStyle} ${border.bottomColor}`;
      style.borderLeft = `${border.leftWidth}px ${border.leftStyle} ${border.leftColor}`;
    } else {
      if (border.style === 'none' || border.style === 'hidden') {
        style.border = `${border.width}px ${border.style}`;
      } else {
        style.border = `${border.width}px ${border.style} ${border.color}`;
      }
    }

    if (gradient.enabled && border.style !== 'none' && border.style !== 'hidden') {
      const stops = gradient.useThreeStops
        ? `${gradient.stop1}, ${gradient.stop2}, ${gradient.stop3}`
        : `${gradient.stop1}, ${gradient.stop2}`;
      style.borderImage = `linear-gradient(${gradient.angle}deg, ${stops}) 1`;
      style.borderStyle = border.style;
      style.borderWidth = border.perSide ? `${border.topWidth}px ${border.rightWidth}px ${border.bottomWidth}px ${border.leftWidth}px` : `${border.width}px`;
    }

    if (radius.linked) {
      style.borderRadius = `${radius.all}px`;
    } else {
      style.borderRadius = `${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`;
    }

    if (outline.enabled) {
      style.outline = `${outline.width}px ${outline.style} ${outline.color}`;
      style.outlineOffset = `${outline.offset}px`;
    }

    return style;
  }, [border, radius, outline, gradient]);

  // ── Find active preset extraStyle ──
  const [activePresetIdx, setActivePresetIdx] = useState<number>(-1);
  const extraStyle = useMemo(() => {
    if (activePresetIdx >= 0 && PRESETS[activePresetIdx]) {
      return PRESETS[activePresetIdx].extraStyle || {};
    }
    return {};
  }, [activePresetIdx]);

  // ── CSS code output ──
  const cssCode = useMemo(() => {
    const lines: string[] = ['.element {'];

    if (gradient.enabled && border.style !== 'none' && border.style !== 'hidden') {
      const stops = gradient.useThreeStops
        ? `${gradient.stop1}, ${gradient.stop2}, ${gradient.stop3}`
        : `${gradient.stop1}, ${gradient.stop2}`;
      if (border.perSide) {
        lines.push(`  border-width: ${border.topWidth}px ${border.rightWidth}px ${border.bottomWidth}px ${border.leftWidth}px;`);
        lines.push(`  border-style: ${border.topStyle} ${border.rightStyle} ${border.bottomStyle} ${border.leftStyle};`);
        lines.push(`  border-image: linear-gradient(${gradient.angle}deg, ${stops}) 1;`);
      } else {
        lines.push(`  border: ${border.width}px ${border.style};`);
        lines.push(`  border-image: linear-gradient(${gradient.angle}deg, ${stops}) 1;`);
      }
    } else if (border.perSide) {
      if (border.topWidth > 0 || border.topStyle !== 'none') lines.push(`  border-top: ${border.topWidth}px ${border.topStyle} ${border.topColor};`);
      if (border.rightWidth > 0 || border.rightStyle !== 'none') lines.push(`  border-right: ${border.rightWidth}px ${border.rightStyle} ${border.rightColor};`);
      if (border.bottomWidth > 0 || border.bottomStyle !== 'none') lines.push(`  border-bottom: ${border.bottomWidth}px ${border.bottomStyle} ${border.bottomColor};`);
      if (border.leftWidth > 0 || border.leftStyle !== 'none') lines.push(`  border-left: ${border.leftWidth}px ${border.leftStyle} ${border.leftColor};`);
    } else if (border.style !== 'none' && border.style !== 'hidden') {
      lines.push(`  border: ${border.width}px ${border.style} ${border.color};`);
    }

    if (radius.linked) {
      if (radius.all > 0) lines.push(`  border-radius: ${radius.all}px;`);
    } else {
      lines.push(`  border-radius: ${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px;`);
    }

    if (outline.enabled) {
      lines.push(`  outline: ${outline.width}px ${outline.style} ${outline.color};`);
      lines.push(`  outline-offset: ${outline.offset}px;`);
    }

    lines.push('}');
    return lines.join('\n');
  }, [border, radius, outline, gradient]);

  // ── Copy handler ──
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = cssCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [cssCode]);

  // ── Apply preset ──
  const applyPreset = useCallback((preset: Preset, idx: number) => {
    setActivePresetIdx(idx);
    const newBorder = { ...defaultBorder };
    if (preset.border) {
      Object.keys(preset.border).forEach((key) => {
        const k = key as keyof BorderConfig;
        (newBorder as Record<string, unknown>)[k] = preset.border[k];
      });
    }
    setBorder(newBorder);

    const newRadius = { ...defaultRadius };
    if (preset.radius) {
      Object.keys(preset.radius).forEach((key) => {
        const k = key as keyof RadiusConfig;
        (newRadius as Record<string, unknown>)[k] = preset.radius[k];
      });
    }
    if (preset.radius && (preset.radius.topLeft !== undefined || preset.radius.topRight !== undefined)) {
      newRadius.linked = false;
    }
    setRadius(newRadius);

    const newOutline = { ...defaultOutline };
    if (preset.outline) {
      Object.keys(preset.outline).forEach((key) => {
        const k = key as keyof OutlineConfig;
        (newOutline as Record<string, unknown>)[k] = preset.outline[k];
      });
    }
    setOutline(newOutline);

    const newGradient = { ...defaultGradient };
    if (preset.gradient) {
      Object.keys(preset.gradient).forEach((key) => {
        const k = key as keyof GradientBorderConfig;
        (newGradient as Record<string, unknown>)[k] = preset.gradient[k];
      });
    }
    setGradient(newGradient);
  }, []);

  // ── Update radius (linked) ──
  const updateRadiusAll = useCallback((val: number) => {
    setRadius({ linked: true, all: val, topLeft: val, topRight: val, bottomRight: val, bottomLeft: val });
  }, []);

  // ── Update single border side ──
  const updateBorderSide = useCallback((side: BorderSide, field: 'width' | 'color' | 'style', value: number | string) => {
    setBorder((prev) => {
      const next = { ...prev, perSide: true };
      const key = `${side}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof BorderConfig;
      (next as Record<string, unknown>)[key] = value;
      return next;
    });
  }, []);

  // ── Box size dimensions ──
  const boxDimensions = useMemo(() => {
    switch (boxSize) {
      case 'small': return { w: 'w-24 h-24', text: 'text-xs' };
      case 'medium': return { w: 'w-36 h-36 sm:w-44 sm:h-44', text: 'text-sm' };
      case 'large': return { w: 'w-44 h-44 sm:w-56 sm:h-56', text: 'text-base' };
    }
  }, [boxSize]);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <section className="relative w-full min-h-screen py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#14100a] to-[#0a0a0a]" />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <FloatingDecorations />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
      />

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6">
        {/* ── Section Header ── */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.06] mb-4">
            <Square className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400/70">Style Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span
              className="bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #10b981)',
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 6s ease infinite',
              }}
            >
              Border Lab
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-mono text-white/25">
            <span>10 Presets</span>
            <span className="text-amber-500/40">/</span>
            <span>Per-Side Control</span>
            <span className="text-amber-500/40">/</span>
            <span>Border-Image</span>
            <span className="text-amber-500/40">/</span>
            <span>Outline</span>
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ═══ LEFT PANEL: Controls ═══ */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Panel Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
              {([
                { id: 'border' as const, label: 'Border', icon: Square },
                { id: 'radius' as const, label: 'Radius', icon: RotateCw },
                { id: 'outline' as const, label: 'Outline', icon: Layers },
                { id: 'gradient' as const, label: 'Gradient', icon: Sparkles },
              ]).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`relative flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      activePanel === tab.id ? 'text-white' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {activePanel === tab.id && (
                      <motion.div
                        layoutId="border-panel-bg"
                        className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.08]"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Border Panel ── */}
            <AnimatePresence mode="wait">
              {activePanel === 'border' && (
                <motion.div
                  key="border-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 space-y-4"
                >
                  {/* Per-side toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/40">Per-Side Control</span>
                    <motion.button
                      onClick={() => setBorder((p) => {
                        const next = { ...p, perSide: !p.perSide };
                        if (!next.perSide) {
                          next.topWidth = next.width;
                          next.rightWidth = next.width;
                          next.bottomWidth = next.width;
                          next.leftWidth = next.width;
                          next.topColor = next.color;
                          next.rightColor = next.color;
                          next.bottomColor = next.color;
                          next.leftColor = next.color;
                          next.topStyle = next.style;
                          next.rightStyle = next.style;
                          next.bottomStyle = next.style;
                          next.leftStyle = next.style;
                        } else {
                          next.topWidth = next.width;
                          next.rightWidth = next.width;
                          next.bottomWidth = next.width;
                          next.leftWidth = next.width;
                          next.topColor = next.color;
                          next.rightColor = next.color;
                          next.bottomColor = next.color;
                          next.leftColor = next.color;
                          next.topStyle = next.style;
                          next.rightStyle = next.style;
                          next.bottomStyle = next.style;
                          next.leftStyle = next.style;
                        }
                        return next;
                      })}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"
                      style={{
                        color: border.perSide ? '#f59e0b' : 'rgba(255,255,255,0.35)',
                        backgroundColor: border.perSide ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${border.perSide ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {border.perSide ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
                      {border.perSide ? 'Linked' : 'Unified'}
                    </motion.button>
                  </div>

                  {!border.perSide ? (
                    <>
                      {/* Unified controls */}
                      <ControlSlider label="Width" value={border.width} min={0} max={20} step={1} unit="px" onChange={(v) => setBorder((p) => ({ ...p, width: v }))} />
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Style</span>
                        <div className="grid grid-cols-5 gap-1">
                          {BORDER_STYLES.map((s) => (
                            <button
                              key={s}
                              onClick={() => setBorder((p) => ({ ...p, style: s }))}
                              className={`px-1.5 py-1.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                                border.style === s
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-white/[0.03] text-white/40 border border-white/[0.04] hover:text-white/60 hover:border-white/[0.1]'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Color</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={border.color}
                            onChange={(e) => setBorder((p) => ({ ...p, color: e.target.value }))}
                            className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer appearance-none bg-transparent"
                            style={{ padding: 0 }}
                          />
                          <input
                            type="text"
                            value={border.color}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setBorder((p) => ({ ...p, color: val }));
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/70 outline-none focus:border-amber-500/30 transition-colors"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Per-side controls */}
                      {(['top', 'right', 'bottom', 'left'] as BorderSide[]).map((side) => (
                        <div key={side} className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 space-y-2">
                          <span className="text-[11px] font-mono text-white/50 capitalize flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: border[`${side}Color` as keyof BorderConfig] as string }} />
                            {side}
                          </span>
                          <ControlSlider
                            label="Width"
                            value={border[`${side}Width` as keyof BorderConfig] as number}
                            min={0}
                            max={20}
                            step={1}
                            unit="px"
                            onChange={(v) => updateBorderSide(side, 'width', v)}
                          />
                          <div className="grid grid-cols-5 gap-1">
                            {BORDER_STYLES.map((s) => (
                              <button
                                key={`${side}-${s}`}
                                onClick={() => updateBorderSide(side, 'style', s)}
                                className={`px-1 py-1 rounded text-[9px] font-mono transition-all cursor-pointer ${
                                  border[`${side}Style` as keyof BorderConfig] === s
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : 'bg-white/[0.03] text-white/35 border border-white/[0.04] hover:text-white/55'
                                }`}
                              >
                                {s.slice(0, 4)}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={border[`${side}Color` as keyof BorderConfig] as string}
                              onChange={(e) => updateBorderSide(side, 'color', e.target.value)}
                              className="w-6 h-6 rounded border border-white/10 cursor-pointer appearance-none bg-transparent"
                              style={{ padding: 0 }}
                            />
                            <input
                              type="text"
                              value={border[`${side}Color` as keyof BorderConfig] as string}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) updateBorderSide(side, 'color', val);
                              }}
                              className="flex-1 px-2 py-1 rounded border border-white/[0.06] bg-white/[0.02] text-[10px] font-mono text-white/60 outline-none focus:border-amber-500/30 transition-colors"
                              maxLength={7}
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              )}

              {/* ── Radius Panel ── */}
              {activePanel === 'radius' && (
                <motion.div
                  key="radius-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 space-y-4"
                >
                  {/* Link/Unlink toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/40">Per-Corner Control</span>
                    <motion.button
                      onClick={() => setRadius((p) => ({ ...p, linked: !p.linked }))}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"
                      style={{
                        color: radius.linked ? '#10b981' : 'rgba(255,255,255,0.35)',
                        backgroundColor: radius.linked ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${radius.linked ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {radius.linked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
                      {radius.linked ? 'Linked' : 'Independent'}
                    </motion.button>
                  </div>

                  {radius.linked ? (
                    <ControlSlider label="Border Radius" value={radius.all} min={0} max={100} step={1} unit="px" onChange={updateRadiusAll} accentColor="#10b981" />
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <ControlSlider label="Top Left" value={radius.topLeft} min={0} max={100} step={1} unit="px" onChange={(v) => setRadius((p) => ({ ...p, topLeft: v }))} accentColor="#10b981" />
                      <ControlSlider label="Top Right" value={radius.topRight} min={0} max={100} step={1} unit="px" onChange={(v) => setRadius((p) => ({ ...p, topRight: v }))} accentColor="#06b6d4" />
                      <ControlSlider label="Bottom Left" value={radius.bottomLeft} min={0} max={100} step={1} unit="px" onChange={(v) => setRadius((p) => ({ ...p, bottomLeft: v }))} accentColor="#f59e0b" />
                      <ControlSlider label="Bottom Right" value={radius.bottomRight} min={0} max={100} step={1} unit="px" onChange={(v) => setRadius((p) => ({ ...p, bottomRight: v }))} accentColor="#ec4899" />
                    </div>
                  )}

                  {/* Visual radius map */}
                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 128 128" className="w-full h-full">
                        <rect
                          x="8"
                          y="8"
                          width="112"
                          height="112"
                          rx={radius.linked ? Math.min(radius.all, 56) : 0}
                          ry={radius.linked ? Math.min(radius.all, 56) : 0}
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="1"
                          style={radius.linked ? {} : {
                            borderTopLeftRadius: `${Math.min(radius.topLeft, 56)}px`,
                            borderTopRightRadius: `${Math.min(radius.topRight, 56)}px`,
                            borderBottomRightRadius: `${Math.min(radius.bottomRight, 56)}px`,
                            borderBottomLeftRadius: `${Math.min(radius.bottomLeft, 56)}px`,
                          }}
                        />
                        {/* Corner labels */}
                        {!radius.linked && (
                          <>
                            <text x="16" y="22" fill="rgba(16,185,129,0.6)" fontSize="8" fontFamily="monospace">{radius.topLeft}</text>
                            <text x="96" y="22" fill="rgba(6,182,212,0.6)" fontSize="8" fontFamily="monospace" textAnchor="end">{radius.topRight}</text>
                            <text x="16" y="122" fill="rgba(245,158,11,0.6)" fontSize="8" fontFamily="monospace">{radius.bottomLeft}</text>
                            <text x="96" y="122" fill="rgba(236,72,153,0.6)" fontSize="8" fontFamily="monospace" textAnchor="end">{radius.bottomRight}</text>
                          </>
                        )}
                        {radius.linked && (
                          <text x="64" y="68" fill="rgba(16,185,129,0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle">{radius.all}px</text>
                        )}
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Outline Panel ── */}
              {activePanel === 'outline' && (
                <motion.div
                  key="outline-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 space-y-4"
                >
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/40">Enable Outline</span>
                    <label className="relative flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={outline.enabled}
                          onChange={(e) => setOutline((p) => ({ ...p, enabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 rounded-full bg-white/[0.08] peer-checked:bg-cyan-500/30 transition-colors" />
                        <motion.div
                          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40 peer-checked:bg-cyan-400 shadow-sm"
                          animate={{ x: outline.enabled ? 16 : 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
                        {outline.enabled ? 'On' : 'Off'}
                      </span>
                    </label>
                  </div>

                  {outline.enabled && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <ControlSlider label="Width" value={outline.width} min={0} max={20} step={1} unit="px" onChange={(v) => setOutline((p) => ({ ...p, width: v }))} accentColor="#06b6d4" />
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Style</span>
                        <div className="grid grid-cols-5 gap-1">
                          {(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'] as BorderStyle[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => setOutline((p) => ({ ...p, style: s }))}
                              className={`px-1.5 py-1.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                                outline.style === s
                                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-white/[0.03] text-white/40 border border-white/[0.04] hover:text-white/60'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Color</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={outline.color}
                            onChange={(e) => setOutline((p) => ({ ...p, color: e.target.value }))}
                            className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer appearance-none bg-transparent"
                            style={{ padding: 0 }}
                          />
                          <input
                            type="text"
                            value={outline.color}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setOutline((p) => ({ ...p, color: val }));
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/70 outline-none focus:border-cyan-500/30 transition-colors"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <ControlSlider label="Offset" value={outline.offset} min={-20} max={20} step={1} unit="px" onChange={(v) => setOutline((p) => ({ ...p, offset: v }))} accentColor="#06b6d4" />
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── Gradient Border Panel ── */}
              {activePanel === 'gradient' && (
                <motion.div
                  key="gradient-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 space-y-4"
                >
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/40">Gradient Border</span>
                    <label className="relative flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={gradient.enabled}
                          onChange={(e) => setGradient((p) => ({ ...p, enabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 rounded-full bg-white/[0.08] peer-checked:bg-purple-500/30 transition-colors" />
                        <motion.div
                          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40 peer-checked:bg-purple-400 shadow-sm"
                          animate={{ x: gradient.enabled ? 16 : 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
                        {gradient.enabled ? 'On' : 'Off'}
                      </span>
                    </label>
                  </div>

                  {gradient.enabled && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {/* Gradient preview bar */}
                      <div
                        className="w-full h-4 rounded-lg border border-white/[0.06]"
                        style={{
                          background: `linear-gradient(${gradient.angle}deg, ${gradient.stop1}${gradient.useThreeStops ? `, ${gradient.stop2}, ${gradient.stop3}` : `, ${gradient.stop2}`})`,
                        }}
                      />

                      <ControlSlider
                        label="Angle"
                        value={gradient.angle}
                        min={0}
                        max={360}
                        step={1}
                        unit="°"
                        onChange={(v) => setGradient((p) => ({ ...p, angle: v }))}
                        accentColor="#a855f7"
                      />

                      {/* Color stops */}
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Stop 1</span>
                          <div className="flex items-center gap-3">
                            <input type="color" value={gradient.stop1} onChange={(e) => setGradient((p) => ({ ...p, stop1: e.target.value }))} className="w-7 h-7 rounded border border-white/10 cursor-pointer appearance-none bg-transparent" style={{ padding: 0 }} />
                            <input type="text" value={gradient.stop1} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setGradient((p) => ({ ...p, stop1: e.target.value })); }} className="flex-1 px-2 py-1 rounded border border-white/[0.06] bg-white/[0.02] text-[10px] font-mono text-white/60 outline-none focus:border-purple-500/30 transition-colors" maxLength={7} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Stop 2</span>
                          <div className="flex items-center gap-3">
                            <input type="color" value={gradient.stop2} onChange={(e) => setGradient((p) => ({ ...p, stop2: e.target.value }))} className="w-7 h-7 rounded border border-white/10 cursor-pointer appearance-none bg-transparent" style={{ padding: 0 }} />
                            <input type="text" value={gradient.stop2} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setGradient((p) => ({ ...p, stop2: e.target.value })); }} className="flex-1 px-2 py-1 rounded border border-white/[0.06] bg-white/[0.02] text-[10px] font-mono text-white/60 outline-none focus:border-purple-500/30 transition-colors" maxLength={7} />
                          </div>
                        </div>

                        {/* Third stop toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-white/40">Third Stop</span>
                          <label className="relative flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={gradient.useThreeStops}
                                onChange={(e) => setGradient((p) => ({ ...p, useThreeStops: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 rounded-full bg-white/[0.08] peer-checked:bg-purple-500/30 transition-colors" />
                              <motion.div
                                className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white/40 peer-checked:bg-purple-400 shadow-sm"
                                animate={{ x: gradient.useThreeStops ? 14 : 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              />
                            </div>
                          </label>
                        </div>

                        <AnimatePresence>
                          {gradient.useThreeStops && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-1.5 overflow-hidden"
                            >
                              <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Stop 3</span>
                              <div className="flex items-center gap-3">
                                <input type="color" value={gradient.stop3} onChange={(e) => setGradient((p) => ({ ...p, stop3: e.target.value }))} className="w-7 h-7 rounded border border-white/10 cursor-pointer appearance-none bg-transparent" style={{ padding: 0 }} />
                                <input type="text" value={gradient.stop3} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setGradient((p) => ({ ...p, stop3: e.target.value })); }} className="flex-1 px-2 py-1 rounded border border-white/[0.06] bg-white/[0.02] text-[10px] font-mono text-white/60 outline-none focus:border-purple-500/30 transition-colors" maxLength={7} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* border-image CSS */}
                      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                        <span className="text-[10px] font-mono text-white/25 block mb-1">border-image output:</span>
                        <code className="text-[10px] font-mono text-purple-400/80 break-all">
                          border-image: linear-gradient({gradient.angle}deg, {gradient.stop1}{gradient.useThreeStops ? `, ${gradient.stop2}, ${gradient.stop3}` : `, ${gradient.stop2}`}) 1;
                        </code>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Presets ── */}
            <motion.div
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <Palette className="w-3.5 h-3.5 text-amber-400/70" />
                <span className="text-xs font-mono text-white/50">Presets</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3">
                {PRESETS.map((preset, i) => (
                  <motion.button
                    key={`preset-${i}`}
                    onClick={() => applyPreset(preset, i)}
                    className={`group flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activePresetIdx === i
                        ? 'border-amber-500/30 bg-amber-500/[0.08]'
                        : 'border-white/[0.04] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.04]'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Mini preview */}
                    <div className="w-full h-10 rounded-md flex items-center justify-center bg-[#1a1a2e] overflow-hidden">
                      <div
                        className="w-8 h-8 flex items-center justify-center text-[14px]"
                        style={{
                          border: `${preset.border?.width || 2}px ${preset.border?.style || 'solid'} ${preset.border?.color || '#10b981'}`,
                          borderRadius: `${preset.radius?.all || 4}px`,
                          ...(preset.gradient?.enabled ? {
                            borderImage: `linear-gradient(${preset.gradient.angle || 90}deg, ${preset.gradient.stop1 || '#10b981'}, ${preset.gradient.stop2 || '#06b6d4'}${preset.gradient.useThreeStops ? `, ${preset.gradient.stop3}` : ''}) 1`,
                          } : {}),
                          ...(preset.extraStyle || {}),
                        }}
                      >
                        {preset.icon}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-white/30 group-hover:text-white/50 transition-colors truncate w-full text-center">
                      {preset.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ═══ RIGHT PANEL: Preview + Code ═══ */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* ── Preview Panel ── */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              {/* VS Code chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <Eye className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] font-mono text-white/25">Live Preview</span>
                </div>
                {/* Size buttons */}
                <div className="ml-auto flex items-center gap-1">
                  {(['small', 'medium', 'large'] as BoxSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setBoxSize(size)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                        boxSize === size
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'text-white/30 hover:text-white/50 border border-transparent'
                      }`}
                    >
                      {size.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview area */}
              <div
                className="relative p-6 sm:p-8 flex items-center justify-center"
                style={{ minHeight: '300px' }}
              >
                {/* Checkerboard */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #111 25%, transparent 25%),
                      linear-gradient(-45deg, #111 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #111 75%),
                      linear-gradient(-45deg, transparent 75%, #111 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    opacity: 0.3,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f1117] to-[#1a1a2e]" />

                {/* Preview box */}
                <motion.div
                  className={`relative z-10 ${boxDimensions.w} flex flex-col items-center justify-center gap-2 bg-white/90 transition-all duration-300 ${
                    hoverPreview ? 'bg-white' : ''
                  }`}
                  style={{
                    ...previewBorderStyle,
                    ...extraStyle,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={() => setHoverPreview(true)}
                  onMouseLeave={() => setHoverPreview(false)}
                >
                  <Type className={`w-5 h-5 text-gray-700 ${boxDimensions.text}`} />
                  <span className={`font-mono font-medium text-gray-700 ${boxDimensions.text}`}>
                    Border Lab
                  </span>
                  <span className="text-[9px] font-mono text-gray-400">
                    {hoverPreview ? 'hover' : 'preview'}
                  </span>
                </motion.div>

                {/* Hover label */}
                <AnimatePresence>
                  {hoverPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]"
                    >
                      <MousePointer2 className="w-3 h-3 text-amber-400/60" />
                      <span className="text-[9px] font-mono text-white/40">Hover State</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── CSS Output ── */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400/70" />
                  <span className="text-[10px] font-mono text-white/25">Output — CSS</span>
                </div>
                <motion.button
                  onClick={copyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono text-white/40 hover:text-white/70 border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>

              {/* Code display */}
              <div className="p-4 custom-scrollbar max-h-64 overflow-y-auto">
                <pre className="font-mono leading-[1.625rem]">
                  {cssCode.split('\n').map((line, i) => highlightCSSLine(line, i + 1))}
                </pre>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  <span className="font-mono text-[10px] text-white/20">Live</span>
                </div>
                <span className="font-mono text-[10px] text-white/15">{cssCode.split('\n').length} lines</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
