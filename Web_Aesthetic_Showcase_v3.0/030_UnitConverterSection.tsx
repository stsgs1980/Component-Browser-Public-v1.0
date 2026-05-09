// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1027

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ruler,
  Copy,
  Check,
  RotateCcw,
  Type,
  Maximize,
  Settings2,
  ArrowRightLeft,
} from 'lucide-react';

// ============================================================
// Types & Constants
// ============================================================

type CSSUnit = 'px' | 'rem' | 'em' | 'vw' | 'vh' | '%' | 'pt' | 'cm' | 'mm' | 'in';

interface ConversionResult {
  unit: CSSUnit;
  value: number;
  formatted: string;
}

const UNITS: { id: CSSUnit; label: string; description: string }[] = [
  { id: 'px', label: 'px', description: 'Pixels' },
  { id: 'rem', label: 'rem', description: 'Root em' },
  { id: 'em', label: 'em', description: 'Em units' },
  { id: 'vw', label: 'vw', description: 'Viewport width' },
  { id: 'vh', label: 'vh', description: 'Viewport height' },
  { id: '%', label: '%', description: 'Percentage' },
  { id: 'pt', label: 'pt', description: 'Points' },
  { id: 'cm', label: 'cm', description: 'Centimeters' },
  { id: 'mm', label: 'mm', description: 'Millimeters' },
  { id: 'in', label: 'in', description: 'Inches' },
];

const PRESETS = [8, 12, 16, 24, 32, 48, 64, 100];

// ============================================================
// Conversion Engine
// ============================================================

function toPx(value: number, fromUnit: CSSUnit, baseFontSize: number, viewportWidth: number, viewportHeight: number): number {
  switch (fromUnit) {
    case 'px':
      return value;
    case 'rem':
      return value * baseFontSize;
    case 'em':
      return value * baseFontSize;
    case 'vw':
      return (value * viewportWidth) / 100;
    case 'vh':
      return (value * viewportHeight) / 100;
    case '%':
      return (value * viewportWidth) / 100;
    case 'pt':
      return value / 0.75;
    case 'cm':
      return value * 37.795;
    case 'mm':
      return value * 3.7795;
    case 'in':
      return value * 96;
    default:
      return value;
  }
}

function fromPx(pxValue: number, toUnit: CSSUnit, baseFontSize: number, viewportWidth: number, viewportHeight: number): number {
  switch (toUnit) {
    case 'px':
      return pxValue;
    case 'rem':
      return pxValue / baseFontSize;
    case 'em':
      return pxValue / baseFontSize;
    case 'vw':
      return (pxValue / viewportWidth) * 100;
    case 'vh':
      return (pxValue / viewportHeight) * 100;
    case '%':
      return (pxValue / viewportWidth) * 100;
    case 'pt':
      return pxValue * 0.75;
    case 'cm':
      return pxValue / 37.795;
    case 'mm':
      return pxValue / 3.7795;
    case 'in':
      return pxValue / 96;
    default:
      return pxValue;
  }
}

function formatValue(value: number, unit: CSSUnit): string {
  if (!isFinite(value)) return '0';
  if (unit === 'cm' || unit === 'mm' || unit === 'in') {
    if (Math.abs(value) < 0.001) return '0';
    return value.toFixed(unit === 'cm' ? 4 : unit === 'mm' ? 3 : 6).replace(/\.?0+$/, '');
  }
  if (Math.abs(value) < 0.001) return '0';
  if (unit === 'vw' || unit === 'vh' || unit === '%') {
    return value.toFixed(4).replace(/\.?0+$/, '');
  }
  return value.toFixed(4).replace(/\.?0+$/, '');
}

function convertAll(
  inputValue: number,
  inputUnit: CSSUnit,
  baseFontSize: number,
  viewportWidth: number,
  viewportHeight: number,
): ConversionResult[] {
  const pxValue = toPx(inputValue, inputUnit, baseFontSize, viewportWidth, viewportHeight);
  return UNITS.map((u) => {
    const converted = fromPx(pxValue, u.id, baseFontSize, viewportWidth, viewportHeight);
    return {
      unit: u.id,
      value: converted,
      formatted: formatValue(converted, u.id),
    };
  });
}

// ============================================================
// Floating Decorations
// ============================================================

const FLOATING_SYMBOLS = ['16px', '1rem', '100%', '10pt', '2.54cm', '96dpi', '0.75pt', '37.8px/cm', 'em', 'vw', '↔', '📏', '📐', '📏', '📏'];

function FloatingDecorations() {
  const items = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    symbol: FLOATING_SYMBOLS[i % FLOATING_SYMBOLS.length],
    left: 2 + (i * 7) % 96,
    top: 5 + (i * 7.3) % 90,
    size: 10 + (i % 3) * 2,
    duration: 12 + (i * 1.9) % 14,
    delay: (i * 0.6) % 8,
    rotate: -15 + (i * 6) % 30,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <motion.span
          key={`float-dec-${item.id}`}
          className="absolute font-mono select-none"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.size}px`,
            color: 'rgba(255,255,255,0.022)',
          }}
          animate={{
            y: [0, -10, 0, 7, 0],
            x: [0, 5, -3, 2, 0],
            rotate: [item.rotate, item.rotate + 2, item.rotate - 1, item.rotate + 1, item.rotate],
            opacity: [0.02, 0.04, 0.025, 0.035, 0.02],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeatType: 'loop',
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
// Visual Ruler Sub-component
// ============================================================

function VisualRuler({ pxValue }: { pxValue: number }) {
  const maxRef = 200;
  const clampedValue = Math.min(Math.max(pxValue, 0), maxRef);
  const percentage = maxRef > 0 ? (clampedValue / maxRef) * 100 : 0;

  // Generate ruler ticks
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const val = i * 10;
    const isMajor = val % 50 === 0;
    const isMid = val % 25 === 0;
    return { val, isMajor, isMid, pos: (val / maxRef) * 100 };
  });

  return (
    <div className="w-full space-y-2">
      {/* Ruler bar */}
      <div className="relative w-full h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        {/* Reference fill (baseline) */}
        <div className="absolute inset-y-0 left-0 right-0 bg-white/[0.02]" />

        {/* Value bar */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-lg"
          style={{
            background: 'linear-gradient(90deg, rgba(16,185,129,0.25), rgba(6,182,212,0.25))',
            borderRight: '2px solid #10b981',
          }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />

        {/* Tick marks */}
        <div className="absolute inset-0 flex items-end">
          {ticks.map((tick) => (
            <div
              key={`tick-${tick.val}`}
              className="absolute bottom-0"
              style={{ left: `${tick.pos}%` }}
            >
              <div
                className="bg-white/[0.12]"
                style={{
                  width: '1px',
                  height: tick.isMajor ? '14px' : tick.isMid ? '10px' : '6px',
                }}
              />
            </div>
          ))}
        </div>

        {/* Value label on bar */}
        {clampedValue > 20 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-white/80 whitespace-nowrap"
            animate={{ left: `${Math.min(percentage, 100) - 2}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            <span
              className="px-1.5 py-0.5 rounded bg-emerald-500/30 border border-emerald-500/40"
              style={{ transform: 'translateX(-100%)' }}
            >
              {formatValue(pxValue, 'px')}px
            </span>
          </motion.div>
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between px-0.5">
        <span className="font-mono text-[10px] text-white/20">0px</span>
        <span className="font-mono text-[10px] text-white/20">50px</span>
        <span className="font-mono text-[10px] text-white/20">100px</span>
        <span className="font-mono text-[10px] text-white/20">150px</span>
        <span className="font-mono text-[10px] text-white/20">200px</span>
      </div>
    </div>
  );
}

// ============================================================
// Conversion Row Sub-component
// ============================================================

function ConversionRow({
  result,
  isInput,
  pxValue,
  onCopy,
}: {
  result: ConversionResult;
  isInput: boolean;
  pxValue: number;
  onCopy: (text: string, unit: CSSUnit) => void;
}) {
  const unitInfo = UNITS.find((u) => u.id === result.unit)!;
  const displayText = `${result.formatted}${result.unit}`;
  const cssText = isInput ? displayText : displayText;

  return (
    <motion.div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
        isInput
          ? 'bg-emerald-500/[0.08] border border-emerald-500/20'
          : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
      }`}
      whileHover={!isInput ? { x: 2 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Unit badge */}
      <div
        className={`shrink-0 w-12 text-center font-mono text-xs font-bold px-2 py-1 rounded-md ${
          isInput
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-white/[0.05] text-white/50 group-hover:text-white/70'
        }`}
      >
        {result.unit}
      </div>

      {/* Value */}
      <div className="flex-1 min-w-0">
        <div className={`font-mono text-sm truncate ${isInput ? 'text-white font-bold' : 'text-white/70'}`}>
          {result.formatted}
        </div>
        <div className="font-mono text-[10px] text-white/25 mt-0.5">
          {unitInfo.description}
        </div>
      </div>

      {/* PX equivalent hint */}
      {!isInput && (
        <div className="hidden sm:block shrink-0">
          <span className="font-mono text-[10px] text-white/20 px-2 py-0.5 rounded bg-white/[0.03]">
            ≈ {formatValue(pxValue, 'px')}px
          </span>
        </div>
      )}

      {/* Copy button */}
      <motion.button
        onClick={() => onCopy(cssText, result.unit)}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors opacity-0 group-hover:opacity-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Copy ${displayText}`}
      >
        <CopyIcon unit={result.unit} />
      </motion.button>
    </motion.div>
  );
}

// ============================================================
// Copy Icon Sub-component (with feedback)
// ============================================================

function CopyIcon({ unit }: { unit: CSSUnit }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    // This is called from the parent - we just show the icon state
  }, []);

  // Listen for parent-triggered copy events via a key trick
  // Instead, the parent passes the copiedUnit state
  return copied ? (
    <Check className="w-3.5 h-3.5 text-emerald-400" />
  ) : (
    <Copy className="w-3.5 h-3.5 text-white/30" />
  );
}

// ============================================================
// Typography Scale Sub-component
// ============================================================

function TypographyScale({ pxValue }: { pxValue: number }) {
  const clamped = Math.min(Math.max(pxValue, 1), 200);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Font-size preview */}
        <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-3.5 h-3.5 text-emerald-400/60" />
            <span className="font-mono text-[11px] text-white/35 uppercase tracking-wider">Font Size</span>
          </div>
          <div
            className="text-white/80 font-medium leading-tight overflow-hidden"
            style={{ fontSize: `${clamped}px` }}
          >
            Aa Bb Cc
          </div>
          <div className="font-mono text-[10px] text-white/20 mt-2">
            font-size: {formatValue(clamped, 'px')}px
          </div>
        </div>

        {/* Padding preview */}
        <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <Maximize className="w-3.5 h-3.5 text-cyan-400/60" />
            <span className="font-mono text-[11px] text-white/35 uppercase tracking-wider">Padding</span>
          </div>
          <div className="flex items-center justify-center">
            <div
              className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center min-h-[40px] transition-all duration-300"
              style={{ padding: `${Math.min(clamped, 48)}px` }}
            >
              <div className="w-6 h-6 rounded bg-white/10" />
            </div>
          </div>
          <div className="font-mono text-[10px] text-white/20 mt-2">
            padding: {formatValue(clamped, 'px')}px
          </div>
        </div>

        {/* Margin preview */}
        <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400/60" />
            <span className="font-mono text-[11px] text-white/35 uppercase tracking-wider">Margin</span>
          </div>
          <div className="flex items-center justify-center">
            <div
              className="relative"
              style={{ margin: `${Math.min(clamped, 48)}px` }}
            >
              <div className="w-10 h-10 rounded bg-emerald-500/20 border border-emerald-500/20" />
              {/* Margin visualization lines */}
              <div className="absolute inset-0 -z-10 border border-dashed border-white/[0.08] rounded" />
            </div>
          </div>
          <div className="font-mono text-[10px] text-white/20 mt-2">
            margin: {formatValue(clamped, 'px')}px
          </div>
        </div>

        {/* Border-radius preview */}
        <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <Settings2 className="w-3.5 h-3.5 text-cyan-400/60" />
            <span className="font-mono text-[11px] text-white/35 uppercase tracking-wider">Border Radius</span>
          </div>
          <div className="flex items-center justify-center">
            <div
              className="w-16 h-16 bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-emerald-500/25 transition-all duration-300"
              style={{ borderRadius: `${Math.min(clamped, 80)}px` }}
            />
          </div>
          <div className="font-mono text-[10px] text-white/20 mt-2">
            border-radius: {formatValue(clamped, 'px')}px
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function UnitConverterSection() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Input state
  const [inputValue, setInputValue] = useState('16');
  const [inputUnit, setInputUnit] = useState<CSSUnit>('px');

  // Settings state
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [showSettings, setShowSettings] = useState(false);

  // Copy state
  const [copiedUnit, setCopiedUnit] = useState<CSSUnit | null>(null);

  // Parse input value
  const numericValue = useMemo(() => {
    const parsed = parseFloat(inputValue);
    return isNaN(parsed) ? 0 : parsed;
  }, [inputValue]);

  // Convert all units
  const conversions = useMemo(
    () => convertAll(numericValue, inputUnit, baseFontSize, viewportWidth, viewportHeight),
    [numericValue, inputUnit, baseFontSize, viewportWidth, viewportHeight],
  );

  // Get px value for visual ruler
  const pxValue = useMemo(
    () => toPx(numericValue, inputUnit, baseFontSize, viewportWidth, viewportHeight),
    [numericValue, inputUnit, baseFontSize, viewportWidth, viewportHeight],
  );

  // Copy handler
  const handleCopy = useCallback((text: string, unit: CSSUnit) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedUnit(unit);
      setTimeout(() => setCopiedUnit(null), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedUnit(unit);
      setTimeout(() => setCopiedUnit(null), 2000);
    });
  }, []);

  // Preset handler
  const handlePreset = useCallback((value: number) => {
    setInputValue(String(value));
    setInputUnit('px');
  }, []);

  // Reset handler
  const handleReset = useCallback(() => {
    setInputValue('16');
    setInputUnit('px');
    setBaseFontSize(16);
    setViewportWidth(1920);
    setViewportHeight(1080);
  }, []);

  if (!mounted) return null;

  const inputText = `${inputValue || '0'}${inputUnit}`;

  return (
    <section
      id="units"
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0a1418 50%, #0a0a0a 100%)',
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] mb-6 section-badge-glow">
              <Ruler className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest">
                CSS Tool
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
              Unit Converter
            </h2>

            <p className="font-mono text-sm sm:text-base text-white/30 tracking-wide max-w-lg mx-auto">
              Convert between CSS units with live preview and visual context
            </p>
          </motion.div>
        </div>

        {/* ===== Main Content ===== */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">

          {/* --- Presets Row --- */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-4 h-4 text-emerald-400/60" />
              <h3 className="font-mono text-sm text-white/40 tracking-widest uppercase">Quick Presets</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
              <motion.button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Reset all values"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((val) => (
                <motion.button
                  key={`preset-${val}`}
                  onClick={() => handlePreset(val)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                    inputValue === String(val) && inputUnit === 'px'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60 hover:border-white/[0.12]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {val}px
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* --- Two-panel layout: Input + Conversions | Visual Preview --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

            {/* ===== Left Panel: Input & Conversions ===== */}
            <motion.div
              className="flex flex-col gap-4 lg:gap-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Input Panel */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col bg-white/[0.03] backdrop-blur-xl">
                {/* Panel header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="font-mono text-[11px] text-white/30 ml-2 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3 h-3 text-white/25" />
                    Input
                  </span>

                  <div className="flex-1" />

                  {/* Settings toggle */}
                  <motion.button
                    onClick={() => setShowSettings((p) => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                      showSettings
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-white/30 hover:text-white/50 hover:bg-white/[0.06]'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Toggle settings"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Settings</span>
                  </motion.button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Settings Panel (collapsible) */}
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] space-y-4 mb-4">
                          <div className="font-mono text-[11px] text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Settings2 className="w-3 h-3 text-cyan-400/50" />
                            Base Settings
                          </div>

                          {/* Base Font Size */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="font-mono text-xs text-white/40 flex items-center gap-1.5">
                                <Type className="w-3 h-3 text-emerald-400/50" />
                                Base Font Size
                              </label>
                              <span className="font-mono text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                {baseFontSize}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min={8}
                              max={32}
                              step={1}
                              value={baseFontSize}
                              onChange={(e) => setBaseFontSize(Number(e.target.value))}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))`,
                              }}
                              aria-label="Base font size"
                            />
                            <div className="flex justify-between mt-1">
                              <span className="font-mono text-[10px] text-white/20">8px</span>
                              <span className="font-mono text-[10px] text-white/20">32px</span>
                            </div>
                          </div>

                          {/* Viewport Width */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="font-mono text-xs text-white/40 flex items-center gap-1.5">
                                <Maximize className="w-3 h-3 text-cyan-400/50" />
                                Viewport Width
                              </label>
                              <span className="font-mono text-xs text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                                {viewportWidth}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min={320}
                              max={3840}
                              step={10}
                              value={viewportWidth}
                              onChange={(e) => setViewportWidth(Number(e.target.value))}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(90deg, rgba(6,182,212,0.3), rgba(16,185,129,0.3))`,
                              }}
                              aria-label="Viewport width"
                            />
                            <div className="flex justify-between mt-1">
                              <span className="font-mono text-[10px] text-white/20">320px</span>
                              <span className="font-mono text-[10px] text-white/20">3840px</span>
                            </div>
                          </div>

                          {/* Viewport Height */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="font-mono text-xs text-white/40 flex items-center gap-1.5">
                                <Maximize className="w-3 h-3 text-emerald-400/50" />
                                Viewport Height
                              </label>
                              <span className="font-mono text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                {viewportHeight}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min={240}
                              max={2160}
                              step={10}
                              value={viewportHeight}
                              onChange={(e) => setViewportHeight(Number(e.target.value))}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))`,
                              }}
                              aria-label="Viewport height"
                            />
                            <div className="flex justify-between mt-1">
                              <span className="font-mono text-[10px] text-white/20">240px</span>
                              <span className="font-mono text-[10px] text-white/20">2160px</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Value Input + Unit Selector */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="font-mono text-[11px] text-white/30 uppercase tracking-wider mb-2 block">
                        Value
                      </label>
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-mono text-lg focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-white/15"
                        placeholder="Enter value..."
                        aria-label="Value to convert"
                      />
                    </div>

                    <div className="w-[140px]">
                      <label className="font-mono text-[11px] text-white/30 uppercase tracking-wider mb-2 block">
                        Unit
                      </label>
                      <select
                        value={inputUnit}
                        onChange={(e) => setInputUnit(e.target.value as CSSUnit)}
                        className="w-full px-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-mono text-sm focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                        aria-label="Input unit"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                        }}
                      >
                        {UNITS.map((u) => (
                          <option key={u.id} value={u.id} className="bg-[#0d1117] text-white">
                            {u.label} — {u.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Copy input value button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      <span className="font-mono text-[10px] text-white/20">Live conversion</span>
                    </div>
                    <motion.button
                      onClick={() => handleCopy(inputText, inputUnit)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AnimatePresence mode="wait">
                        {copiedUnit === inputUnit ? (
                          <motion.span
                            key={`copy-check-input-${inputUnit}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1.5 text-emerald-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Copied!
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy-input"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Conversion Results */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col bg-white/[0.03] backdrop-blur-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="font-mono text-[11px] text-white/30 ml-2 flex items-center gap-1.5">
                    <Ruler className="w-3 h-3 text-white/25" />
                    Conversions
                  </span>
                </div>

                <div className="p-3 sm:p-4 space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar">
                  {conversions.map((result) => (
                    <div
                      key={`conv-row-${result.unit}`}
                      onClick={() => handleCopy(`${result.formatted}${result.unit}`, result.unit)}
                      className="cursor-pointer"
                    >
                      <ConversionRow
                        result={result}
                        isInput={result.unit === inputUnit}
                        pxValue={pxValue}
                        onCopy={handleCopy}
                      />
                      {/* Show copy feedback */}
                      <AnimatePresence>
                        {copiedUnit === result.unit && result.unit !== inputUnit && (
                          <motion.div
                            key={`copied-toast-${result.unit}`}
                            initial={{ opacity: 0, y: -4, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -4, height: 0 }}
                            className="ml-[60px] mt-1 mb-1"
                          >
                            <span className="font-mono text-[10px] text-emerald-400/70 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Copied {result.formatted}{result.unit}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Panel footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                    <span className="font-mono text-[10px] text-white/20">10 units</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/15">Click to copy</span>
                </div>
              </div>
            </motion.div>

            {/* ===== Right Panel: Visual Ruler & Typography Scale ===== */}
            <motion.div
              className="flex flex-col gap-4 lg:gap-5"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {/* Visual Ruler */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col bg-white/[0.03] backdrop-blur-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="font-mono text-[11px] text-white/30 ml-2 flex items-center gap-1.5">
                    <Ruler className="w-3 h-3 text-white/25" />
                    Visual Ruler
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <VisualRuler pxValue={pxValue} />

                  {/* Size comparison info */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="font-mono text-lg font-bold text-emerald-400/80 counter-glow">
                        {formatValue(pxValue, 'px')}
                      </div>
                      <div className="font-mono text-[10px] text-white/25 mt-0.5">pixels</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="font-mono text-lg font-bold text-cyan-400/80 counter-glow">
                        {formatValue(pxValue / baseFontSize, 'rem')}
                      </div>
                      <div className="font-mono text-[10px] text-white/25 mt-0.5">rems</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="font-mono text-lg font-bold text-white/50 counter-glow">
                        {formatValue(pxValue * 0.75, 'pt')}
                      </div>
                      <div className="font-mono text-[10px] text-white/25 mt-0.5">points</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Scale */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col bg-white/[0.03] backdrop-blur-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="font-mono text-[11px] text-white/30 ml-2 flex items-center gap-1.5">
                    <Type className="w-3 h-3 text-white/25" />
                    Typography Scale
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <TypographyScale pxValue={pxValue} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ===== Info Bar ===== */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 rounded-xl border border-white/[0.04] bg-white/[0.02]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {[
              { icon: Ruler, text: '10 Units' },
              { icon: Type, text: 'Typography Scale' },
              { icon: Ruler, text: 'Visual Preview' },
            ].map((item, i) => (
              <div
                key={`info-${i}`}
                className="flex items-center gap-2"
              >
                {i > 0 && (
                  <div className="w-1 h-1 rounded-full bg-white/10 mr-2" />
                )}
                <item.icon className="w-3.5 h-3.5 text-white/20" />
                <span className="font-mono text-[11px] text-white/30">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
