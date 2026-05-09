// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1009

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Copy,
  Check,
  Shuffle,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  Code2,
  Paintbrush,
  Download,
  Sparkles,
  Layers,
  RotateCw,
  Type,
  FileCode,
  Eye,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-100
}

type GradientType = 'linear' | 'radial' | 'conic';
type ExportFormat = 'css' | 'tailwind' | 'svg';

interface GradientPreset {
  name: string;
  colors: string[];
  type: GradientType;
  angle?: number;
}

// ============================================================
// Presets
// ============================================================

const PRESETS: GradientPreset[] = [
  { name: 'Sunset', colors: ['#ff6b35', '#f7c948', '#ff006e', '#8338ec'], type: 'linear', angle: 135 },
  { name: 'Ocean', colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'], type: 'linear', angle: 180 },
  { name: 'Aurora', colors: ['#00f5d4', '#00bbf9', '#9b5de5', '#f15bb5'], type: 'linear', angle: 135 },
  { name: 'Neon', colors: ['#ff00ff', '#00ffff', '#ff00ff'], type: 'linear', angle: 90 },
  { name: 'Forest', colors: ['#2d6a4f', '#40916c', '#52b788', '#95d5b2'], type: 'linear', angle: 160 },
  { name: 'Lavender', colors: ['#e0aaff', '#c77dff', '#9d4edd', '#7b2cbf'], type: 'linear', angle: 135 },
  { name: 'Peach', colors: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec'], type: 'radial' },
  { name: 'Midnight', colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9'], type: 'linear', angle: 180 },
];

// ============================================================
// Helpers
// ============================================================

let stopIdCounter = 0;

function createStop(color: string, position: number): ColorStop {
  return { id: `stop-${++stopIdCounter}-${Date.now()}`, color, position };
}

function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const sat = 60 + Math.floor(Math.random() * 40);
  const light = 45 + Math.floor(Math.random() * 25);
  return hslToHex(hue, sat, light);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateRandomGradient(): { colors: string[]; type: GradientType; angle: number } {
  const type: GradientType = ['linear', 'radial', 'conic'][Math.floor(Math.random() * 3)] as GradientType;
  const count = 2 + Math.floor(Math.random() * 3); // 2-4
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(generateRandomColor());
  }
  const angle = Math.floor(Math.random() * 360);
  return { colors, type, angle };
}

function buildGradientCSS(stops: ColorStop[], type: GradientType, angle: number): string {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const colorString = sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');

  switch (type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${colorString})`;
    case 'radial':
      return `radial-gradient(circle, ${colorString})`;
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${colorString})`;
  }
}

function buildTailwindClass(stops: ColorStop[], type: GradientType, angle: number): string {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const colorString = sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');

  // Tailwind doesn't natively support custom gradients in class names,
  // so we output the arbitrary value syntax
  switch (type) {
    case 'linear':
      return `bg-[linear-gradient(${angle}deg,${colorString})]`;
    case 'radial':
      return `bg-[radial-gradient(circle,${colorString})]`;
    case 'conic':
      return `bg-[conic-gradient(from_${angle}deg,${colorString})]`;
  }
}

function buildSVGCode(stops: ColorStop[], type: GradientType, angle: number): string {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const id = type === 'linear' ? 'linearGrad' : type === 'radial' ? 'radialGrad' : 'conicGrad';

  let defs = '';
  let fill = '';

  if (type === 'linear') {
    const rad = ((angle - 90) * Math.PI) / 180;
    const x1 = 50 - Math.cos(rad) * 50;
    const y1 = 50 - Math.sin(rad) * 50;
    const x2 = 50 + Math.cos(rad) * 50;
    const y2 = 50 + Math.sin(rad) * 50;
    defs = `  <linearGradient id="${id}" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${x2.toFixed(1)}%" y2="${y2.toFixed(1)}%">`;
  } else if (type === 'radial') {
    defs = `  <radialGradient id="${id}" cx="50%" cy="50%" r="50%">`;
  } else {
    // Conic not natively supported in SVG, approximate with linear
    defs = `  <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">`;
  }

  const stopElements = sortedStops
    .map(
      (s) =>
        `    <stop offset="${s.position}%" stop-color="${s.color}" />`
    )
    .join('\n');

  fill = `url(#${id})`;

  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
${defs}
${stopElements}
  </${type === 'radial' ? 'radialGradient' : 'linearGradient'}>
  </defs>
  <rect width="400" height="300" fill="${fill}" />
</svg>`;
}

// ============================================================
// Syntax Highlighting for CSS
// ============================================================

function highlightCSS(css: string): React.ReactNode[] {
  const lines = css.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={`css-line-${i}`} className="flex leading-[1.625rem]"><span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{i + 1}</span><span className="whitespace-pre text-xs">&nbsp;</span></div>;

    // Highlight keywords
    let highlighted = line;
    const parts: React.ReactNode[] = [];
    let remaining = line;

    // Check for gradient type keyword
    const gradMatch = remaining.match(/^(.*?)(linear-gradient|radial-gradient|conic-gradient)(.*)$/);
    if (gradMatch) {
      if (gradMatch[1]) parts.push(<span key={`${i}-pre`} className="syn-value">{gradMatch[1]}</span>);
      parts.push(<span key={`${i}-fn`} className="syn-function">{gradMatch[2]}</span>);
      remaining = gradMatch[3];
    }

    // Highlight colors (#xxx, #xxxxxx)
    const colorRegex = /#[0-9a-fA-F]{3,8}/g;
    let lastIndex = 0;
    const colorParts: React.ReactNode[] = [];
    let colorMatch;
    while ((colorMatch = colorRegex.exec(remaining)) !== null) {
      if (colorMatch.index > lastIndex) {
        colorParts.push(<span key={`${i}-c-${lastIndex}`} className="syn-value">{remaining.slice(lastIndex, colorMatch.index)}</span>);
      }
      colorParts.push(<span key={`${i}-ch-${colorMatch.index}`} className="syn-number">{colorMatch[0]}</span>);
      lastIndex = colorMatch.index + colorMatch[0].length;
    }
    if (lastIndex < remaining.length) {
      colorParts.push(<span key={`${i}-c-end`} className="syn-value">{remaining.slice(lastIndex)}</span>);
    }

    if (colorParts.length > 0) {
      parts.push(...colorParts);
    } else if (!gradMatch) {
      // Just wrap in value class
      parts.push(<span key={`${i}-plain`} className="syn-value">{line}</span>);
    }

    return (
      <div key={`css-line-${i}`} className="flex leading-[1.625rem]">
        <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{i + 1}</span>
        <span className="whitespace-pre text-xs">{parts}</span>
      </div>
    );
  });
}

function highlightGeneric(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    // Highlight strings and colors
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIdx = 0;

    const colorRegex = /#[0-9a-fA-F]{3,8}/g;
    let lastIndex = 0;
    let colorMatch;
    while ((colorMatch = colorRegex.exec(remaining)) !== null) {
      if (colorMatch.index > lastIndex) {
        parts.push(<span key={`${i}-${keyIdx++}`}>{remaining.slice(lastIndex, colorMatch.index)}</span>);
      }
      parts.push(<span key={`${i}-${keyIdx++}`} className="syn-number">{colorMatch[0]}</span>);
      lastIndex = colorMatch.index + colorMatch[0].length;
    }
    if (lastIndex < remaining.length) {
      parts.push(<span key={`${i}-${keyIdx++}`}>{remaining.slice(lastIndex)}</span>);
    }

    return (
      <div key={`gen-line-${i}`} className="flex leading-[1.625rem]">
        <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{i + 1}</span>
        <span className="whitespace-pre text-xs">{parts.length > 0 ? parts : <span>&nbsp;</span>}</span>
      </div>
    );
  });
}

// ============================================================
// Floating Decorative Elements
// ============================================================

const FLOATING_SYMBOLS = ['#FFF', 'rgb()', 'hsl()', 'grad', '%', 'deg', 'rad', 'conic', 'linear', '0xFF', 'α', '▲', '◆', '◉'];

function FloatingDecorations() {
  const items = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    symbol: FLOATING_SYMBOLS[i % FLOATING_SYMBOLS.length],
    left: 3 + (i * 6.2) % 94,
    top: 3 + (i * 6.8) % 94,
    size: 9 + (i % 3) * 3,
    duration: 10 + (i * 1.8) % 14,
    delay: (i * 0.5) % 7,
    rotate: -20 + (i * 7) % 40,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <motion.span
          key={item.id}
          className="absolute font-mono select-none"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.size}px`,
            color: 'rgba(255,255,255,0.025)',
          }}
          animate={{
            y: [0, -12, 0, 8, 0],
            x: [0, 6, -4, 2, 0],
            rotate: [item.rotate, item.rotate + 3, item.rotate - 2, item.rotate + 1, item.rotate],
            opacity: [0.02, 0.045, 0.03, 0.04, 0.02],
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
// Color Stop Editor
// ============================================================

function ColorStopEditor({
  stop,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  stop: ColorStop;
  index: number;
  total: number;
  onUpdate: (updated: ColorStop) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <motion.div
      className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] group"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0, padding: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
    >
      {/* Reorder buttons */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <motion.button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-0.5 rounded hover:bg-white/[0.08] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Move color stop up"
        >
          <ChevronUp className="w-3 h-3 text-white/40" />
        </motion.button>
        <motion.button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-0.5 rounded hover:bg-white/[0.08] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Move color stop down"
        >
          <ChevronDown className="w-3 h-3 text-white/40" />
        </motion.button>
      </div>

      {/* Color picker */}
      <div className="relative shrink-0">
        <input
          type="color"
          value={stop.color}
          onChange={(e) => onUpdate({ ...stop, color: e.target.value })}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 border-white/[0.1] cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
          aria-label={`Color for stop ${index + 1}`}
        />
        <span className="font-mono text-[10px] text-white/30 block text-center mt-0.5">{stop.color}</span>
      </div>

      {/* Position slider */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-white/30">Position</span>
          <span className="font-mono text-[10px] text-emerald-400/70">{stop.position}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={stop.position}
          onChange={(e) => onUpdate({ ...stop, position: Number(e.target.value) })}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, ${stop.color}00 ${0}%, ${stop.color} ${stop.position}%, rgba(255,255,255,0.08) ${stop.position}%)`,
          }}
          aria-label={`Position for stop ${index + 1}`}
        />
      </div>

      {/* Remove button */}
      <motion.button
        onClick={onRemove}
        disabled={total <= 2}
        className="p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Remove color stop ${index + 1}`}
      >
        <Minus className="w-3.5 h-3.5 text-red-400/60" />
      </motion.button>
    </motion.div>
  );
}

// ============================================================
// Gradient Preset Button
// ============================================================

function PresetButton({
  preset,
  onClick,
}: {
  preset: GradientPreset;
  onClick: (preset: GradientPreset) => void;
}) {
  const gradientStr = preset.colors.map((c, i) => `${c} ${(i / (preset.colors.length - 1)) * 100}%`).join(', ');
  const bgStyle = preset.type === 'radial'
    ? `radial-gradient(circle, ${gradientStr})`
    : preset.type === 'conic'
      ? `conic-gradient(from 0deg, ${gradientStr})`
      : `linear-gradient(90deg, ${gradientStr})`;

  return (
    <motion.button
      onClick={() => onClick(preset)}
      className="flex flex-col items-center gap-2 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-white/[0.1] shadow-lg transition-shadow group-hover:shadow-xl group-hover:border-white/20"
        style={{ background: bgStyle }}
      />
      <span className="font-mono text-[10px] sm:text-xs text-white/40 group-hover:text-white/60 transition-colors">
        {preset.name}
      </span>
    </motion.button>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function GradientGeneratorSection() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Gradient state
  const [stops, setStops] = useState<ColorStop[]>([
    createStop('#10b981', 0),
    createStop('#06b6d4', 50),
    createStop('#8b5cf6', 100),
  ]);
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');

  // Computed values
  const gradientCSS = useMemo(
    () => buildGradientCSS(stops, gradientType, angle),
    [stops, gradientType, angle]
  );

  const tailwindClass = useMemo(
    () => buildTailwindClass(stops, gradientType, angle),
    [stops, gradientType, angle]
  );

  const svgCode = useMemo(
    () => buildSVGCode(stops, gradientType, angle),
    [stops, gradientType, angle]
  );

  const exportCode = useMemo(() => {
    switch (exportFormat) {
      case 'css': return `background: ${gradientCSS};`;
      case 'tailwind': return tailwindClass;
      case 'svg': return svgCode;
    }
  }, [exportFormat, gradientCSS, tailwindClass, svgCode]);

  // Handlers
  const handleUpdateStop = useCallback((index: number, updated: ColorStop) => {
    setStops((prev) => prev.map((s, i) => (i === index ? updated : s)));
  }, []);

  const handleRemoveStop = useCallback((index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddStop = useCallback(() => {
    setStops((prev) => {
      if (prev.length >= 4) return prev;
      const lastPos = prev[prev.length - 1].position;
      const newPos = Math.min(100, lastPos + 25);
      return [...prev, createStop(generateRandomColor(), newPos)];
    });
  }, []);

  const handleMoveStop = useCallback((index: number, direction: 'up' | 'down') => {
    setStops((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const handleRandomGradient = useCallback(() => {
    const { colors, type, angle: newAngle } = generateRandomGradient();
    const newStops = colors.map((color, i) => {
      const position = colors.length === 1 ? 50 : (i / (colors.length - 1)) * 100;
      return createStop(color, Math.round(position));
    });
    setStops(newStops);
    setGradientType(type);
    setAngle(newAngle);
  }, []);

  const handleApplyPreset = useCallback((preset: GradientPreset) => {
    const newStops = preset.colors.map((color, i) => {
      const position = preset.colors.length === 1 ? 50 : (i / (preset.colors.length - 1)) * 100;
      return createStop(color, Math.round(position));
    });
    setStops(newStops);
    setGradientType(preset.type);
    setAngle(preset.angle ?? 135);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(exportCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = exportCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [exportCode]);

  const handleExport = useCallback(() => {
    const blob = new Blob([exportCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradient.${exportFormat === 'css' ? 'css' : exportFormat === 'tailwind' ? 'txt' : 'svg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportCode, exportFormat]);

  if (!mounted) return null;

  const gradientTypeOptions: { id: GradientType; label: string; icon: React.ElementType }[] = [
    { id: 'linear', label: 'Linear', icon: RotateCw },
    { id: 'radial', label: 'Radial', icon: Layers },
    { id: 'conic', label: 'Conic', icon: Sparkles },
  ];

  const exportFormatOptions: { id: ExportFormat; label: string; icon: React.ElementType; ext: string }[] = [
    { id: 'css', label: 'CSS', icon: Code2, ext: '.css' },
    { id: 'tailwind', label: 'Tailwind', icon: Paintbrush, ext: '.txt' },
    { id: 'svg', label: 'SVG', icon: FileCode, ext: '.svg' },
  ];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0a1a15 50%, #0a0a0a 100%)',
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
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest">
                Design Tool
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
              Gradient Lab
            </h2>

            <p className="font-mono text-sm sm:text-base text-white/30 tracking-wide max-w-lg mx-auto">
              Create, customize, and export beautiful gradients
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
              <Sparkles className="w-4 h-4 text-emerald-400/60" />
              <h3 className="font-mono text-sm text-white/40 tracking-widest uppercase">Presets</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
              <motion.button
                onClick={handleRandomGradient}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Random</span>
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
              {PRESETS.map((preset) => (
                <PresetButton key={preset.name} preset={preset} onClick={handleApplyPreset} />
              ))}
            </div>
          </motion.div>

          {/* --- Two-panel layout: Controls + Preview/Code --- */}
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
                <span className="font-mono text-[11px] text-white/30 ml-2">gradient.config</span>
              </div>

              <div className="p-4 sm:p-5 space-y-5 flex-1">
                {/* Gradient Type Selector */}
                <div>
                  <label className="font-mono text-xs text-white/40 mb-2.5 block">Gradient Type</label>
                  <div className="flex gap-2">
                    {gradientTypeOptions.map((opt) => {
                      const isActive = gradientType === opt.id;
                      const Icon = opt.icon;
                      return (
                        <motion.button
                          key={opt.id}
                          onClick={() => setGradientType(opt.id)}
                          className="relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-mono transition-all"
                          style={{
                            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)',
                            backgroundColor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{opt.label}</span>
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-xl"
                              style={{
                                border: '1px solid rgba(16,185,129,0.2)',
                                boxShadow: '0 0 15px rgba(16,185,129,0.08)',
                              }}
                              layoutId="gradTypeIndicator"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Angle Slider (only for linear and conic) */}
                <AnimatePresence>
                  {(gradientType === 'linear' || gradientType === 'conic') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="font-mono text-xs text-white/40 flex items-center gap-2">
                          <RotateCw className="w-3.5 h-3.5 text-cyan-400/50" />
                          Angle
                        </label>
                        <span className="font-mono text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {angle}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))`,
                        }}
                        aria-label="Gradient angle"
                      />
                      <div className="flex justify-between mt-1.5">
                        <span className="font-mono text-[10px] text-white/20">0°</span>
                        <span className="font-mono text-[10px] text-white/20">360°</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Color Stops */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-mono text-xs text-white/40 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-cyan-400/50" />
                      Color Stops
                      <span className="text-[10px] text-white/20">({stops.length}/4)</span>
                    </label>
                    <motion.button
                      onClick={handleAddStop}
                      disabled={stops.length >= 4}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </motion.button>
                  </div>

                  {/* Gradient preview bar */}
                  <div
                    className="w-full h-3 rounded-full mb-4 border border-white/[0.06]"
                    style={{ background: gradientCSS }}
                  />

                  {/* Stop list */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    <AnimatePresence mode="popLayout">
                      {stops.map((stop, index) => (
                        <ColorStopEditor
                          key={stop.id}
                          stop={stop}
                          index={index}
                          total={stops.length}
                          onUpdate={(updated) => handleUpdateStop(index, updated)}
                          onRemove={() => handleRemoveStop(index)}
                          onMoveUp={() => handleMoveStop(index, 'up')}
                          onMoveDown={() => handleMoveStop(index, 'down')}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Panel footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  <span className="font-mono text-[10px] text-white/20">Live</span>
                </div>
                <span className="font-mono text-[10px] text-white/15">{stops.length} stops</span>
              </div>
            </motion.div>

            {/* ===== Preview + Code Panel ===== */}
            <motion.div
              className="flex flex-col gap-4 lg:gap-5"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {/* Preview */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col" style={{ background: '#0d1117' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="font-mono text-[11px] text-white/30 ml-2 flex items-center gap-1.5">
                    <Eye className="w-3 h-3 text-white/25" />
                    Preview
                  </span>
                </div>
                <div
                  className="w-full h-48 sm:h-56 lg:h-64 relative"
                  style={{ background: gradientCSS }}
                >
                  {/* Checkerboard behind for transparency feel */}
                  <div className="absolute inset-0 -z-10" style={{
                    backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  }} />
                </div>
              </div>

              {/* Code Output */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col" style={{ background: '#0d1117' }}>
                {/* Code header with format tabs + actions */}
                <div className="flex items-center border-b border-white/[0.06]">
                  {/* Format tabs */}
                  <div className="flex items-center">
                    {exportFormatOptions.map((fmt) => {
                      const isActive = exportFormat === fmt.id;
                      const FmtIcon = fmt.icon;
                      return (
                        <button
                          key={fmt.id}
                          onClick={() => setExportFormat(fmt.id)}
                          className="relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-mono transition-colors"
                          style={{
                            color: isActive ? '#f8f8f2' : 'rgba(255,255,255,0.3)',
                          }}
                        >
                          <FmtIcon className="w-3 h-3" style={{ color: isActive ? '#06b6d4' : undefined }} />
                          <span>{fmt.label}</span>
                          {isActive && (
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 h-[2px]"
                              style={{ background: '#06b6d4' }}
                              layoutId="exportTabIndicator"
                              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-1" />

                  {/* Copy + Export buttons */}
                  <div className="flex items-center gap-1 pr-2">
                    <motion.button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Copy to clipboard"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1.5 text-emerald-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copied!</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copy</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <motion.button
                      onClick={handleExport}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors"
                      style={{
                        color: '#ffffff',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                      }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      title={`Export as ${exportFormat.toUpperCase()}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Export</span>
                    </motion.button>
                  </div>
                </div>

                {/* Code display */}
                <div className="p-4 overflow-y-auto custom-scrollbar font-mono max-h-[240px] sm:max-h-[280px]" style={{ color: '#f8f8f2' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={exportFormat}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {exportFormat === 'css' && highlightCSS(`background: ${gradientCSS};`)}
                      {exportFormat === 'tailwind' && highlightGeneric(tailwindClass)}
                      {exportFormat === 'svg' && highlightGeneric(svgCode)}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Code footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                  <span className="font-mono text-[10px] text-white/20 uppercase">{exportFormat}</span>
                  <span className="font-mono text-[10px] text-white/15">{exportCode.split('\n').length} lines</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ===== Info Bar ===== */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            {[
              { icon: Palette, label: '3 Gradient Types', sub: 'LINEAR / RADIAL / CONIC' },
              { icon: Layers, label: '2–4 Color Stops', sub: 'FULL CONTROL' },
              { icon: Type, label: '3 Export Formats', sub: 'CSS / TAILWIND / SVG' },
            ].map((item, i) => (
              <div key={`grad-info-${i}`} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-emerald-400/50" />
                <div>
                  <span className="font-mono text-xs text-white/50">{item.label}</span>
                  <span className="font-mono text-[10px] text-white/15 ml-2 hidden sm:inline">{item.sub}</span>
                </div>
                {i < 2 && (
                  <span className="hidden sm:block w-px h-4 bg-white/10 ml-4 sm:ml-8" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
