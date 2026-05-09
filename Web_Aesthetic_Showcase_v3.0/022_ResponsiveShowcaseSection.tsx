// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1599

'use client';

import { useState, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowDown,
  Grid3X3,
  LayoutGrid,
  Menu,
  PanelLeft,
  Code2,
  Ruler,
  FlipHorizontal2,
  FlipVertical2,
  Trash2,
  Plus,
  ChevronRight,
  Zap,
  Eye,
  Palette,
  Type,
  Layers,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

interface Breakpoint {
  name: string;
  min: number;
  max: number;
  color: string;
}

interface MediaQueryRule {
  id: string;
  property: string;
  value: string;
  minWidth: string;
  maxWidth: string;
}

type ActiveTab = 'preview' | 'breakpoints' | 'demos' | 'playground' | 'converter' | 'code';

// ============================================================
// Constants
// ============================================================

const DEVICE_PRESETS: DevicePreset[] = [
  { name: 'iPhone', width: 375, height: 812, icon: <Smartphone className="w-3.5 h-3.5" /> },
  { name: 'Galaxy', width: 360, height: 780, icon: <Smartphone className="w-3.5 h-3.5 rotate-6" /> },
  { name: 'iPad', width: 768, height: 1024, icon: <Tablet className="w-3.5 h-3.5" /> },
  { name: 'Laptop', width: 1366, height: 768, icon: <Laptop className="w-3.5 h-3.5" /> },
  { name: 'Desktop', width: 1920, height: 1080, icon: <Monitor className="w-3.5 h-3.5" /> },
];

const BREAKPOINTS: Breakpoint[] = [
  { name: 'xs', min: 0, max: 640, color: '#ef4444' },
  { name: 'sm', min: 640, max: 768, color: '#f97316' },
  { name: 'md', min: 768, max: 1024, color: '#eab308' },
  { name: 'lg', min: 1024, max: 1280, color: '#22c55e' },
  { name: 'xl', min: 1280, max: 1536, color: '#3b82f6' },
  { name: '2xl', min: 1536, max: 2000, color: '#a855f7' },
];

const CSS_PROPERTIES = [
  'font-size',
  'padding',
  'margin',
  'display',
  'flex-direction',
  'background-color',
  'gap',
  'grid-template-columns',
  'width',
  'height',
  'font-weight',
  'line-height',
  'border-radius',
];

const UNIT_OPTIONS = ['px', 'em', 'rem', '%', 'vw', 'vh'];

const FLOATING_SYMBOLS = [
  '@media', '320px', '768px', '1024px', 'vw', 'vh', 'rem',
  'breakpoint', 'responsive', 'em', '%', 'flex-wrap', 'grid',
  'min-width', 'max-width', 'sm:', 'md:', 'lg:', 'xl:',
];

// ============================================================
// Helpers
// ============================================================

let ruleIdCounter = 0;

function createRule(): MediaQueryRule {
  return {
    id: `rule-${++ruleIdCounter}-${Date.now()}`,
    property: 'font-size',
    value: '16px',
    minWidth: '768px',
    maxWidth: '',
  };
}

function getBreakpointForWidth(width: number): string {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}

function getBreakpointColor(width: number): string {
  if (width < 640) return '#ef4444';
  if (width < 768) return '#f97316';
  if (width < 1024) return '#eab308';
  if (width < 1280) return '#22c55e';
  if (width < 1536) return '#3b82f6';
  return '#a855f7';
}

function convertUnit(value: number, fromUnit: string, toUnit: string, baseFontSize: number, viewportWidth: number, viewportHeight: number): number {
  // Convert to px first
  let pxValue = value;
  switch (fromUnit) {
    case 'px': pxValue = value; break;
    case 'em': pxValue = value * baseFontSize; break;
    case 'rem': pxValue = value * baseFontSize; break;
    case '%': pxValue = (value / 100) * baseFontSize; break;
    case 'vw': pxValue = (value / 100) * viewportWidth; break;
    case 'vh': pxValue = (value / 100) * viewportHeight; break;
  }
  // Convert from px to target
  switch (toUnit) {
    case 'px': return pxValue;
    case 'em': return pxValue / baseFontSize;
    case 'rem': return pxValue / baseFontSize;
    case '%': return (pxValue / baseFontSize) * 100;
    case 'vw': return (pxValue / viewportWidth) * 100;
    case 'vh': return (pxValue / viewportHeight) * 100;
  }
  return pxValue;
}

function highlightCSS(css: string): React.ReactNode[] {
  const lines = css.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) {
      return (
        <div key={`rc-css-${i}`} className="flex leading-[1.625rem]">
          <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{i + 1}</span>
          <span className="whitespace-pre text-xs">&nbsp;</span>
        </div>
      );
    }

    const parts: React.ReactNode[] = [];
    let keyIdx = 0;

    // Media query @media line
    const mediaMatch = line.match(/^(\s*)(@media\s*)(\([^)]+\))(\s*\{?)$/);
    if (mediaMatch) {
      parts.push(<span key={`${i}-ws-${keyIdx++}`}>{mediaMatch[1]}</span>);
      parts.push(<span key={`${i}-at-${keyIdx++}`} className="syn-keyword">{mediaMatch[2]}</span>);
      parts.push(<span key={`${i}-cond-${keyIdx++}`} className="syn-function">{mediaMatch[3]}</span>);
      parts.push(<span key={`${i}-brace-${keyIdx++}`} className="syn-bracket">{mediaMatch[4]}</span>);
    } else {
      // Property: value
      const propMatch = line.match(/^(\s*)([\w-]+)(\s*:\s*)(.*)$/);
      if (propMatch) {
        parts.push(<span key={`${i}-ws-${keyIdx++}`}>{propMatch[1]}</span>);
        parts.push(<span key={`${i}-prop-${keyIdx++}`} className="syn-property">{propMatch[2]}</span>);
        parts.push(<span key={`${i}-colon-${keyIdx++}`} className="syn-punctuation">{propMatch[3]}</span>);
        let val = propMatch[4];
        const numRegex = /(\d+(?:\.\d+)?)(px|%|rem|em|fr|vw|vh|deg|ms|s)?/g;
        let lastIdx = 0;
        let numMatch;
        const valParts: React.ReactNode[] = [];
        let valKey = 0;
        while ((numMatch = numRegex.exec(val)) !== null) {
          if (numMatch.index > lastIdx) {
            valParts.push(<span key={`${i}-v-${valKey++}`} className="syn-value">{val.slice(lastIdx, numMatch.index)}</span>);
          }
          valParts.push(<span key={`${i}-n-${valKey++}`} className="syn-number">{numMatch[0]}</span>);
          lastIdx = numMatch.index + numMatch[0].length;
        }
        if (lastIdx < val.length) {
          valParts.push(<span key={`${i}-v-${valKey++}`} className="syn-value">{val.slice(lastIdx)}</span>);
        }
        parts.push(<span key={`${i}-vals-${keyIdx++}`}>{valParts.length > 0 ? valParts : <span className="syn-value">{val}</span>}</span>);
      } else if (line.trim() === '{') {
        parts.push(<span key={`${i}-brace-${keyIdx++}`} className="syn-bracket">{line}</span>);
      } else if (line.trim() === '}') {
        parts.push(<span key={`${i}-brace-${keyIdx++}`} className="syn-bracket">{line}</span>);
      } else {
        parts.push(<span key={`${i}-sel-${keyIdx++}`} className="syn-tag">{line}</span>);
      }
    }

    return (
      <div key={`rc-css-${i}`} className="flex leading-[1.625rem]">
        <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{i + 1}</span>
        <span className="whitespace-pre text-xs">{parts}</span>
      </div>
    );
  });
}

// ============================================================
// Floating Decorations
// ============================================================

function FloatingDecorations() {
  const items = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    symbol: FLOATING_SYMBOLS[i % FLOATING_SYMBOLS.length],
    left: 3 + (i * 7.1) % 94,
    top: 3 + (i * 7.3) % 94,
    size: 9 + (i % 3) * 3,
    duration: 10 + (i * 1.7) % 14,
    delay: (i * 0.6) % 7,
    rotate: -20 + (i * 8) % 40,
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
// Main Export
// ============================================================

export function ResponsiveShowcaseSection() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Preview state
  const [viewportWidth, setViewportWidth] = useState(768);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [activePreset, setActivePreset] = useState<string | null>('iPad');

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');

  // Media query rules
  const [mediaRules, setMediaRules] = useState<MediaQueryRule[]>([createRule()]);

  // Unit converter
  const [convertValue, setConvertValue] = useState(16);
  const [convertFrom, setConvertFrom] = useState('px');
  const [baseFontSize, setBaseFontSize] = useState(16);

  // Copy state
  const [copied, setCopied] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  // Derived: device dimensions based on orientation
  const deviceFrameWidth = useMemo(() => {
    if (orientation === 'landscape' && activePreset) {
      const preset = DEVICE_PRESETS.find((d) => d.name === activePreset);
      if (preset && preset.width > preset.height) return viewportWidth;
      if (preset) return Math.min(viewportWidth, 500);
    }
    return Math.min(viewportWidth, 500);
  }, [viewportWidth, orientation, activePreset]);

  const deviceFrameHeight = useMemo(() => {
    if (activePreset) {
      const preset = DEVICE_PRESETS.find((d) => d.name === activePreset);
      if (preset) {
        if (orientation === 'landscape') {
          return (deviceFrameWidth / preset.width) * preset.height;
        }
        return (deviceFrameWidth / preset.width) * preset.height;
      }
    }
    return deviceFrameWidth * 0.65;
  }, [deviceFrameWidth, activePreset, orientation]);

  // Preview page content adapts to viewportWidth
  const previewCols = useMemo(() => {
    if (viewportWidth >= 1024) return 4;
    if (viewportWidth >= 768) return 3;
    if (viewportWidth >= 640) return 2;
    return 1;
  }, [viewportWidth]);

  const navCollapsed = viewportWidth < 768;
  const sidebarHidden = viewportWidth < 1024;
  const heroFontSize = viewportWidth >= 1024 ? 32 : viewportWidth >= 768 ? 24 : 18;

  // Height for calculation - use a reasonable default since viewport height isn't always available
  const viewportHeight_for_calc = 800;

  // Unit conversions
  const unitConversions = useMemo(() => {
    const results: Record<string, number> = {};
    for (const unit of UNIT_OPTIONS) {
      results[unit] = convertUnit(convertValue, convertFrom, unit, baseFontSize, viewportWidth, viewportHeight_for_calc);
    }
    return results;
  }, [convertValue, convertFrom, baseFontSize, viewportWidth, viewportHeight_for_calc]);

  // Generated CSS code
  const generatedCSS = useMemo(() => {
    let code = '/* Responsive Design — Generated CSS */\n\n';
    code += '/* Base styles (mobile-first) */\n';
    code += `.container {\n  display: grid;\n  gap: 1rem;\n  padding: 1rem;\n  grid-template-columns: 1fr;\n}\n\n`;

    code += '/* Navigation */\n';
    code += `.nav {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n\n`;

    code += '/* Sidebar layout */\n';
    code += `.layout {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n`;

    // Add media query rules
    if (mediaRules.length > 0 && mediaRules.some((r) => r.value.trim())) {
      code += '\n/* Custom media queries */\n';
      for (const rule of mediaRules) {
        if (!rule.value.trim()) continue;
        const conditions: string[] = [];
        if (rule.minWidth.trim()) conditions.push(`(min-width: ${rule.minWidth.trim()})`);
        if (rule.maxWidth.trim()) conditions.push(`(max-width: ${rule.maxWidth.trim()})`);
        if (conditions.length === 0) continue;
        code += `\n@media ${conditions.join(' and ')} {\n`;
        code += `  .element {\n`;
        code += `    ${rule.property}: ${rule.value};\n`;
        code += `  }\n`;
        code += `}\n`;
      }
    }

    code += '\n/* sm: 640px */\n';
    code += `@media (min-width: 640px) {\n  .container { grid-template-columns: repeat(2, 1fr); }\n}\n\n`;

    code += '/* md: 768px */\n';
    code += `@media (min-width: 768px) {\n  .container { grid-template-columns: repeat(3, 1fr); }\n  .nav { flex-direction: row; }\n}\n\n`;

    code += '/* lg: 1024px */\n';
    code += `@media (min-width: 1024px) {\n  .container { grid-template-columns: repeat(4, 1fr); }\n  .layout { flex-direction: row; }\n  .sidebar { width: 250px; flex-shrink: 0; }\n}\n\n`;

    code += '/* xl: 1280px */\n';
    code += `@media (min-width: 1280px) {\n  .container { max-width: 1280px; margin: 0 auto; }\n}\n\n`;

    code += '/* 2xl: 1536px */\n';
    code += `@media (min-width: 1536px) {\n  .container { max-width: 1536px; }\n}\n`;

    return code;
  }, [mediaRules]);

  // Handlers
  const handlePreset = useCallback((preset: DevicePreset) => {
    setActivePreset(preset.name);
    if (orientation === 'landscape') {
      setViewportWidth(preset.height);
    } else {
      setViewportWidth(preset.width);
    }
  }, [orientation]);

  const handleOrientationToggle = useCallback(() => {
    setOrientation((prev) => {
      const next = prev === 'portrait' ? 'landscape' : 'portrait';
      if (activePreset) {
        const preset = DEVICE_PRESETS.find((d) => d.name === activePreset);
        if (preset) {
          if (next === 'landscape') {
            setViewportWidth(preset.height);
          } else {
            setViewportWidth(preset.width);
          }
        }
      }
      return next;
    });
  }, [activePreset]);

  const handleCopy = useCallback((text: string, idx: string | null = null) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setCopiedIdx(idx);
        setTimeout(() => {
          setCopied(false);
          setCopiedIdx(null);
        }, 2000);
      })
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setCopiedIdx(idx);
        setTimeout(() => {
          setCopied(false);
          setCopiedIdx(null);
        }, 2000);
      });
  }, []);

  const handleAddRule = useCallback(() => {
    setMediaRules((prev) => [...prev, createRule()]);
  }, []);

  const handleRemoveRule = useCallback((id: string) => {
    setMediaRules((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const handleUpdateRule = useCallback((id: string, updates: Partial<MediaQueryRule>) => {
    setMediaRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  // Quick reference conversions
  const quickRefConversions = useMemo(() => [
    { from: '1rem', to: '16px', note: 'Default browser' },
    { from: '1em', to: '16px', note: 'Same as rem if base=16' },
    { from: '100vw', to: '100% viewport width', note: '' },
    { from: '100vh', to: '100% viewport height', note: '' },
    { from: '62.5%', to: '10px (base)', note: 'Common 62.5% trick' },
    { from: '0.625rem', to: '10px', note: '' },
    { from: '1.5rem', to: '24px', note: '' },
    { from: '2rem', to: '32px', note: '' },
    { from: '2.5rem', to: '40px', note: '' },
    { from: '3rem', to: '48px', note: '' },
  ], []);

  const currentBreakpoint = getBreakpointForWidth(viewportWidth);
  const currentBreakpointColor = getBreakpointColor(viewportWidth);

  // Breakpoint bar position (0-100% mapped from 0-2000px)
  const breakpointPosition = Math.min((viewportWidth / 2000) * 100, 100);

  if (!mounted) return null;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'preview', label: 'Preview', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'breakpoints', label: 'Breakpoints', icon: <Ruler className="w-3.5 h-3.5" /> },
    { id: 'demos', label: 'Layout Demos', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'playground', label: 'Media Queries', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'converter', label: 'Unit Converter', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'CSS Output', icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <section
      id="responsive-showcase"
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0a0f14 50%, #0a0a0a 100%)',
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] mb-6">
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-widest">Layout Tool</span>
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
              Responsive Lab
            </h2>

            <p className="font-mono text-sm sm:text-base text-white/30 tracking-wide max-w-lg mx-auto mb-6">
              Master responsive design with live previews, breakpoint visualization, and unit conversion
            </p>

            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
                <Smartphone className="w-3 h-3 text-cyan-400/40" /> 6 Device Presets
              </span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
                <Ruler className="w-3 h-3 text-emerald-400/40" /> 5 Breakpoints
              </span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
                <LayoutGrid className="w-3 h-3 text-cyan-400/40" /> 4 Live Demos
              </span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/25">
                <Layers className="w-3 h-3 text-emerald-400/40" /> Unit Converter
              </span>
            </div>
          </motion.div>
        </div>

        {/* ===== Tab Navigation ===== */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex gap-1 p-1 rounded-xl border border-white/[0.06] bg-white/[0.02] max-w-3xl mx-auto overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-mono whitespace-nowrap transition-colors"
                style={{
                  color: activeTab === tab.id ? '#ffffff' : 'rgba(255,255,255,0.35)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.25)',
                    }}
                    layoutId="responsiveTabIndicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ===== Tab Content ===== */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <AnimatePresence mode="wait">
            {/* ─── PREVIEW TAB ─── */}
            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Device Presets */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {DEVICE_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.name}
                      onClick={() => handlePreset(preset)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-mono border transition-all ${
                        activePreset === preset.name
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
                      }`}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {preset.icon}
                      {preset.name}
                      <span className="text-white/20">{orientation === 'portrait' ? preset.width : preset.height}px</span>
                    </motion.button>
                  ))}

                  {/* Orientation toggle */}
                  <motion.button
                    onClick={handleOrientationToggle}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-mono border border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-400/80 hover:bg-cyan-500/10 transition-all"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {orientation === 'portrait' ? <FlipVertical2 className="w-3.5 h-3.5" /> : <FlipHorizontal2 className="w-3.5 h-3.5" />}
                    {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                  </motion.button>
                </div>

                {/* Width slider */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] text-white/40">Viewport Width</span>
                    <span className="font-mono text-sm text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
                      {viewportWidth}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={320}
                    max={1920}
                    value={viewportWidth}
                    onChange={(e) => {
                      setViewportWidth(Number(e.target.value));
                      setActivePreset(null);
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${getBreakpointColor(320)} 0%, ${getBreakpointColor(640)} 16.7%, ${getBreakpointColor(768)} 33.3%, ${getBreakpointColor(1024)} 50%, ${getBreakpointColor(1280)} 66.7%, ${getBreakpointColor(1536)} 83.3%, ${getBreakpointColor(1920)} 100%)`,
                    }}
                    aria-label="Viewport width"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-mono text-white/15">320px</span>
                    <span className="text-[9px] font-mono text-white/15">1920px</span>
                  </div>
                </div>

                {/* Preview frame */}
                <div className="flex justify-center">
                  <div
                    className="rounded-2xl overflow-hidden border-2 border-white/[0.08] relative"
                    style={{
                      width: `${deviceFrameWidth}px`,
                      height: `${deviceFrameHeight}px`,
                      background: '#0d1117',
                      boxShadow: `0 0 40px rgba(${currentBreakpointColor === '#ef4444' ? '239,68,68' : currentBreakpointColor === '#f97316' ? '249,115,22' : currentBreakpointColor === '#eab308' ? '234,179,8' : currentBreakpointColor === '#22c55e' ? '34,197,94' : currentBreakpointColor === '#3b82f6' ? '59,130,246' : '168,85,247'}, 0.08)`,
                    }}
                  >
                    {/* Browser chrome */}
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                      <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                      <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                      <div className="w-2 h-2 rounded-full bg-[#28c840]" />
                      <div className="flex-1 mx-2 px-2 py-0.5 rounded bg-white/[0.04] text-[9px] font-mono text-white/20 text-center truncate">
                        {activePreset ? `${activePreset.toLowerCase()}.dev` : `localhost:${viewportWidth}`}
                      </div>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                          color: currentBreakpointColor,
                          backgroundColor: `${currentBreakpointColor}15`,
                        }}
                      >
                        {currentBreakpoint}
                      </span>
                    </div>

                    {/* Mini webpage preview */}
                    <div className="overflow-auto custom-scrollbar h-[calc(100%-32px)]" style={{ fontSize: `${Math.max(10, viewportWidth / 80)}px` }}>
                      {/* Nav */}
                      <div
                        className="border-b border-white/[0.06] px-3 py-2 flex items-center"
                        style={{
                          flexDirection: navCollapsed ? 'row' : 'row',
                          justifyContent: 'space-between',
                          flexWrap: navCollapsed ? 'wrap' : 'nowrap',
                        }}
                      >
                        <span className="font-mono text-emerald-400/80 font-bold" style={{ fontSize: `${Math.max(10, viewportWidth / 60)}px` }}>
                          DevSite
                        </span>
                        {navCollapsed ? (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="w-4 h-0.5 bg-white/20 rounded" />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {['Home', 'About', 'Blog', 'Contact'].map((item) => (
                              <span key={item} className="font-mono text-white/30 hover:text-white/50 cursor-pointer" style={{ fontSize: `${Math.max(8, viewportWidth / 100)}px` }}>
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Hero */}
                      <div className="px-4 py-6 text-center">
                        <h1 className="font-bold text-white/80 mb-2" style={{ fontSize: `${heroFontSize * (Math.max(10, viewportWidth / 80) / 10)}px` }}>
                          Build Better UIs
                        </h1>
                        <p className="font-mono text-white/25" style={{ fontSize: `${Math.max(8, viewportWidth / 120)}px` }}>
                          Responsive design tools for modern developers
                        </p>
                        <div className="mt-3 inline-flex px-3 py-1.5 rounded-lg text-emerald-400 text-[10px] font-mono border border-emerald-500/20 bg-emerald-500/10">
                          Get Started
                        </div>
                      </div>

                      {/* Card Grid */}
                      <div
                        className="grid gap-2 px-3 pb-4"
                        style={{
                          gridTemplateColumns: `repeat(${previewCols}, 1fr)`,
                        }}
                      >
                        {[
                          { title: 'Design', color: '#10b981' },
                          { title: 'Develop', color: '#06b6d4' },
                          { title: 'Deploy', color: '#a855f7' },
                          { title: 'Scale', color: '#f59e0b' },
                        ].map((card) => (
                          <div
                            key={card.title}
                            className="rounded-lg border border-white/[0.06] p-3 bg-white/[0.02]"
                            style={{ minHeight: '60px' }}
                          >
                            <div className="w-6 h-1 rounded mb-2" style={{ backgroundColor: `${card.color}40` }} />
                            <div className="font-mono text-white/40 text-[9px] font-bold">{card.title}</div>
                            <div className="mt-1.5 space-y-0.5">
                              <div className="h-0.5 bg-white/[0.06] rounded w-full" />
                              <div className="h-0.5 bg-white/[0.06] rounded w-3/4" />
                              <div className="h-0.5 bg-white/[0.06] rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sidebar Layout indicator */}
                      <div className="px-3 pb-3">
                        <div
                          className="flex gap-2 rounded-lg border border-white/[0.06] p-2 bg-white/[0.02]"
                          style={{ flexDirection: sidebarHidden ? 'column' : 'row' }}
                        >
                          {sidebarHidden && (
                            <div className="font-mono text-[8px] text-white/15 text-center">Sidebar hidden</div>
                          )}
                          {!sidebarHidden && (
                            <div className="w-1/4 border-r border-white/[0.06] pr-2">
                              <div className="font-mono text-[8px] text-white/20 mb-1">Sidebar</div>
                              <div className="space-y-1">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="h-0.5 bg-white/[0.06] rounded" style={{ width: `${60 + i * 10}%` }} />
                                ))}
                              </div>
                            </div>
                          )}
                          <div className={sidebarHidden ? 'w-full' : 'flex-1'}>
                            <div className="font-mono text-[8px] text-white/20 mb-1">Content</div>
                            <div className="space-y-0.5">
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-0.5 bg-white/[0.06] rounded" style={{ width: `${90 - i * 10}%` }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Width indicator */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white/40">
                      <Maximize2 className="w-2.5 h-2.5" />
                      {viewportWidth} &times; {orientation === 'portrait' && activePreset ? DEVICE_PRESETS.find((d) => d.name === activePreset)?.height || '---' : '---'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── BREAKPOINTS TAB ─── */}
            {activeTab === 'breakpoints' && (
              <motion.div
                key="breakpoints"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Breakpoint Visualizer */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-mono text-sm text-white/50 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-emerald-400/50" />
                      CSS Breakpoint Map
                    </h3>
                    <span
                      className="font-mono text-xs px-2.5 py-1 rounded-lg"
                      style={{
                        color: currentBreakpointColor,
                        backgroundColor: `${currentBreakpointColor}15`,
                        border: `1px solid ${currentBreakpointColor}30`,
                      }}
                    >
                      Current: {currentBreakpoint} ({viewportWidth}px)
                    </span>
                  </div>

                  {/* Breakpoint bar */}
                  <div className="relative h-10 rounded-lg overflow-hidden border border-white/[0.06]">
                    <div className="flex h-full">
                      {BREAKPOINTS.map((bp) => (
                        <div
                          key={bp.name}
                          className="flex items-center justify-center font-mono text-[10px] font-bold text-white/70"
                          style={{
                            backgroundColor: `${bp.color}25`,
                            width: `${((bp.max - bp.min) / 2000) * 100}%`,
                            borderRight: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {bp.name}
                        </div>
                      ))}
                    </div>
                    {/* Draggable indicator */}
                    <div
                      className="absolute top-0 bottom-0 flex flex-col items-center"
                      style={{ left: `${breakpointPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      <div
                        className="w-0.5 h-full"
                        style={{ backgroundColor: '#ffffff', boxShadow: '0 0 8px rgba(255,255,255,0.3)' }}
                      />
                      <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-white text-black text-[9px] font-mono font-bold whitespace-nowrap">
                        {viewportWidth}px
                      </div>
                    </div>
                  </div>

                  {/* Breakpoint labels */}
                  <div className="flex mt-2">
                    {BREAKPOINTS.map((bp) => (
                      <div
                        key={bp.name}
                        className="font-mono text-[9px] text-white/20"
                        style={{ width: `${((bp.max - bp.min) / 2000) * 100}%` }}
                      >
                        {bp.min}-{bp.max}px
                      </div>
                    ))}
                  </div>

                  {/* Breakpoint slider */}
                  <div className="mt-4">
                    <input
                      type="range"
                      min={320}
                      max={1920}
                      value={viewportWidth}
                      onChange={(e) => {
                        setViewportWidth(Number(e.target.value));
                        setActivePreset(null);
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(90deg, #ef4444 0%, #f97316 32%, #eab308 38.4%, #22c55e 51.2%, #3b82f6 64%, #a855f7 76.8%)`,
                      }}
                      aria-label="Breakpoint position"
                    />
                  </div>

                  {/* Breakpoint cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-5">
                    {BREAKPOINTS.map((bp) => {
                      const isActive = viewportWidth >= bp.min && viewportWidth < bp.max;
                      return (
                        <motion.div
                          key={bp.name}
                          className={`rounded-lg border p-3 text-center transition-all ${
                            isActive
                              ? 'border-opacity-40 bg-opacity-10'
                              : 'border-white/[0.04] bg-white/[0.01]'
                          }`}
                          style={isActive ? {
                            borderColor: `${bp.color}40`,
                            backgroundColor: `${bp.color}10`,
                          } : {}}
                          whileHover={{ scale: 1.03 }}
                        >
                          <div
                            className="font-mono text-lg font-bold mb-1"
                            style={{ color: isActive ? bp.color : 'rgba(255,255,255,0.2)' }}
                          >
                            {bp.name}
                          </div>
                          <div className="font-mono text-[10px] text-white/25">
                            {bp.min}-{bp.max}px
                          </div>
                          {isActive && (
                            <motion.div
                              className="mt-1.5 w-full h-0.5 rounded-full"
                              style={{ backgroundColor: bp.color }}
                              layoutId="breakpoint-active-bar"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── LAYOUT DEMOS TAB ─── */}
            {activeTab === 'demos' && (
              <motion.div
                key="demos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Width control for demos */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="font-mono text-[11px] text-white/40 shrink-0">Demo Width</span>
                  <input
                    type="range"
                    min={320}
                    max={1920}
                    value={viewportWidth}
                    onChange={(e) => {
                      setViewportWidth(Number(e.target.value));
                      setActivePreset(null);
                    }}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer w-full sm:w-auto"
                    style={{
                      background: 'linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))',
                    }}
                    aria-label="Demo viewport width"
                  />
                  <span className="font-mono text-sm text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md shrink-0">
                    {viewportWidth}px &middot; {currentBreakpoint}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Demo 1: Card Grid */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
                      <Grid3X3 className="w-3.5 h-3.5 text-emerald-400/60" />
                      <span className="font-mono text-[11px] text-white/50">Card Grid</span>
                      <span
                        className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ color: currentBreakpointColor, backgroundColor: `${currentBreakpointColor}15` }}
                      >
                        {previewCols} columns
                      </span>
                    </div>
                    <div className="p-4">
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${previewCols}, 1fr)`,
                          width: '100%',
                        }}
                      >
                        {Array.from({ length: Math.min(previewCols * 2, 8) }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="rounded-lg border border-white/[0.06] p-3 bg-white/[0.02] transition-all"
                            style={{ minHeight: '55px' }}
                            layout
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <div className="w-8 h-1.5 rounded mb-2" style={{ backgroundColor: `${['#10b981', '#06b6d4', '#a855f7', '#f59e0b'][i % 4]}40` }} />
                            <div className="space-y-0.5">
                              <div className="h-0.5 bg-white/[0.08] rounded w-full" />
                              <div className="h-0.5 bg-white/[0.06] rounded w-3/4" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-3 font-mono text-[10px] text-white/15 text-center">
                        grid-template-columns: repeat({previewCols}, 1fr)
                      </div>
                    </div>
                  </div>

                  {/* Demo 2: Navigation */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
                      <Menu className="w-3.5 h-3.5 text-cyan-400/60" />
                      <span className="font-mono text-[11px] text-white/50">Navigation</span>
                      <span
                        className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ color: currentBreakpointColor, backgroundColor: `${currentBreakpointColor}15` }}
                      >
                        {navCollapsed ? 'Hamburger' : 'Horizontal'}
                      </span>
                    </div>
                    <div className="p-4">
                      <div
                        className="rounded-lg border border-white/[0.06] p-3 bg-white/[0.02] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                            <Zap className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="font-mono text-[11px] text-white/50 font-bold">Brand</span>
                        </div>
                        <AnimatePresence mode="wait">
                          {navCollapsed ? (
                            <motion.div
                              key="hamburger"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col gap-0.5 p-1.5 rounded border border-white/[0.06] bg-white/[0.02]"
                            >
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="w-4 h-0.5 bg-white/30 rounded" />
                              ))}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="links"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-3"
                            >
                              {['Home', 'About', 'Services', 'Contact'].map((item) => (
                                <span key={item} className="font-mono text-[10px] text-white/30 hover:text-white/50 cursor-pointer">
                                  {item}
                                </span>
                              ))}
                              <div className="px-2 py-1 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/10">
                                CTA
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="mt-3 font-mono text-[10px] text-white/15 text-center">
                        flex-direction: {navCollapsed ? 'column (collapsed)' : 'row (expanded)'}
                      </div>
                    </div>
                  </div>

                  {/* Demo 3: Hero Section */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
                      <Type className="w-3.5 h-3.5 text-emerald-400/60" />
                      <span className="font-mono text-[11px] text-white/50">Hero Section</span>
                      <span
                        className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ color: currentBreakpointColor, backgroundColor: `${currentBreakpointColor}15` }}
                      >
                        {heroFontSize}px title
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="rounded-lg border border-white/[0.06] p-6 bg-white/[0.02] text-center">
                        <motion.h2
                          className="font-bold text-white/70 mb-2"
                          style={{ fontSize: `${heroFontSize}px` }}
                          layout
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                          Hero Title
                        </motion.h2>
                        <motion.p
                          className="font-mono text-white/25 mb-4"
                          style={{ fontSize: `${Math.max(10, heroFontSize * 0.45)}px` }}
                          layout
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                          Subtitle text that adapts to screen size
                        </motion.p>
                        <motion.div
                          className="flex gap-2 justify-center"
                          style={{ flexDirection: viewportWidth < 640 ? 'column' : 'row' }}
                          layout
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                          <div className="px-4 py-2 rounded-lg text-emerald-400 text-[10px] font-mono border border-emerald-500/20 bg-emerald-500/10">
                            Primary CTA
                          </div>
                          <div className="px-4 py-2 rounded-lg text-white/30 text-[10px] font-mono border border-white/[0.06]">
                            Secondary CTA
                          </div>
                        </motion.div>
                      </div>
                      <div className="mt-3 font-mono text-[10px] text-white/15 text-center">
                        font-size: {heroFontSize}px &middot; CTA layout: {viewportWidth < 640 ? 'stacked' : 'inline'}
                      </div>
                    </div>
                  </div>

                  {/* Demo 4: Sidebar Layout */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
                      <PanelLeft className="w-3.5 h-3.5 text-cyan-400/60" />
                      <span className="font-mono text-[11px] text-white/50">Sidebar Layout</span>
                      <span
                        className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ color: currentBreakpointColor, backgroundColor: `${currentBreakpointColor}15` }}
                      >
                        {sidebarHidden ? 'No sidebar' : 'With sidebar'}
                      </span>
                    </div>
                    <div className="p-4">
                      <motion.div
                        className="rounded-lg border border-white/[0.06] p-3 bg-white/[0.02] flex gap-2"
                        style={{ flexDirection: sidebarHidden ? 'column' : 'row' }}
                        layout
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        <AnimatePresence mode="wait">
                          {!sidebarHidden && (
                            <motion.div
                              key="sidebar"
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: '80px' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                              className="shrink-0 border-r border-white/[0.06] pr-2 overflow-hidden"
                            >
                              <div className="font-mono text-[8px] text-white/20 mb-2">Nav</div>
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-0.5 bg-white/[0.06] rounded mb-1" style={{ width: `${50 + i * 10}%` }} />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[8px] text-white/20 mb-2">Content Area</div>
                          <div className="space-y-1.5">
                            <div className="h-3 bg-white/[0.04] rounded" />
                            <div className="h-3 bg-white/[0.04] rounded w-4/5" />
                            <div className="h-3 bg-white/[0.04] rounded w-3/5" />
                            <div className="h-8 bg-white/[0.03] rounded mt-2" />
                          </div>
                        </div>
                      </motion.div>
                      <div className="mt-3 font-mono text-[10px] text-white/15 text-center">
                        flex-direction: {sidebarHidden ? 'column' : 'row'} &middot; sidebar: {sidebarHidden ? 'hidden' : 'visible'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── MEDIA QUERY PLAYGROUND TAB ─── */}
            {activeTab === 'playground' && (
              <motion.div
                key="playground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Rules list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-sm text-white/50 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-400/50" />
                      Media Query Rules
                    </h3>
                    <motion.button
                      onClick={handleAddRule}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400/80 text-[11px] font-mono hover:bg-emerald-500/10 transition-all"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <Plus className="w-3 h-3" />
                      Add Rule
                    </motion.button>
                  </div>

                  {mediaRules.map((rule) => (
                    <motion.div
                      key={rule.id}
                      layout
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-white/20">{rule.id.split('-')[0]}-{rule.id.split('-')[1]}</span>
                        <motion.button
                          onClick={() => handleRemoveRule(rule.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </motion.button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Property */}
                        <div>
                          <label className="font-mono text-[10px] text-white/30 mb-1 block">Property</label>
                          <select
                            value={rule.property}
                            onChange={(e) => handleUpdateRule(rule.id, { property: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[11px] font-mono text-white/60 focus:outline-none focus:border-emerald-500/30 appearance-none cursor-pointer"
                          >
                            {CSS_PROPERTIES.map((prop) => (
                              <option key={prop} value={prop}>{prop}</option>
                            ))}
                          </select>
                        </div>

                        {/* Value */}
                        <div>
                          <label className="font-mono text-[10px] text-white/30 mb-1 block">Value</label>
                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                            placeholder="e.g. 16px, flex, block"
                            className="w-full px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[11px] font-mono text-white/60 placeholder:text-white/15 focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>

                        {/* Min Width */}
                        <div>
                          <label className="font-mono text-[10px] text-white/30 mb-1 block">Min Width</label>
                          <input
                            type="text"
                            value={rule.minWidth}
                            onChange={(e) => handleUpdateRule(rule.id, { minWidth: e.target.value })}
                            placeholder="e.g. 768px"
                            className="w-full px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[11px] font-mono text-white/60 placeholder:text-white/15 focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>

                        {/* Max Width */}
                        <div>
                          <label className="font-mono text-[10px] text-white/30 mb-1 block">Max Width</label>
                          <input
                            type="text"
                            value={rule.maxWidth}
                            onChange={(e) => handleUpdateRule(rule.id, { maxWidth: e.target.value })}
                            placeholder="e.g. 1024px (optional)"
                            className="w-full px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[11px] font-mono text-white/60 placeholder:text-white/15 focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>
                      </div>

                      {/* Generated code preview */}
                      {rule.value.trim() && (rule.minWidth.trim() || rule.maxWidth.trim()) && (
                        <div className="rounded-lg border border-white/[0.04] bg-black/30 p-3 overflow-x-auto custom-scrollbar">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[9px] text-white/20">Generated CSS</span>
                            <motion.button
                              onClick={() => {
                                const conditions: string[] = [];
                                if (rule.minWidth.trim()) conditions.push(`(min-width: ${rule.minWidth.trim()})`);
                                if (rule.maxWidth.trim()) conditions.push(`(max-width: ${rule.maxWidth.trim()})`);
                                const code = `@media ${conditions.join(' and ')} {\n  .element {\n    ${rule.property}: ${rule.value};\n  }\n}`;
                                handleCopy(code, rule.id);
                              }}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono text-white/30 hover:text-white/50 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {copiedIdx === rule.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                            </motion.button>
                          </div>
                          <pre className="font-mono text-[11px] leading-relaxed">
                            <span className="syn-keyword">@media</span>{' '}
                            {rule.minWidth.trim() && <span className="syn-function">(min-width: <span className="syn-number">{rule.minWidth.trim()}</span>)</span>}
                            {rule.minWidth.trim() && rule.maxWidth.trim() && <span className="syn-keyword"> and </span>}
                            {rule.maxWidth.trim() && <span className="syn-function">(max-width: <span className="syn-number">{rule.maxWidth.trim()}</span>)</span>}
                            {' {'}
                            <br />
                            {'  '}<span className="syn-tag">.element</span> {'{'}
                            <br />
                            {'    '}<span className="syn-property">{rule.property}</span><span className="syn-punctuation">: </span><span className="syn-value">{rule.value}</span><span className="syn-punctuation">;</span>
                            <br />
                            {'  }'}
                            <br />
                            {'}'}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── UNIT CONVERTER TAB ─── */}
            {activeTab === 'converter' && (
              <motion.div
                key="converter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Converter panel */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
                      <Layers className="w-3.5 h-3.5 text-emerald-400/60" />
                      <span className="font-mono text-[11px] text-white/50">Responsive Unit Converter</span>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Value input */}
                      <div>
                        <label className="font-mono text-[10px] text-white/30 mb-1.5 block">Value</label>
                        <input
                          type="number"
                          value={convertValue}
                          onChange={(e) => setConvertValue(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-sm font-mono text-white/70 focus:outline-none focus:border-emerald-500/30"
                        />
                      </div>

                      {/* From unit */}
                      <div>
                        <label className="font-mono text-[10px] text-white/30 mb-1.5 block">From Unit</label>
                        <div className="flex gap-1.5">
                          {UNIT_OPTIONS.map((unit) => (
                            <motion.button
                              key={unit}
                              onClick={() => setConvertFrom(unit)}
                              className={`px-3 py-2 rounded-lg text-[11px] font-mono border transition-all ${
                                convertFrom === unit
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                  : 'border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white/50'
                              }`}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {unit}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Base font size */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-mono text-[10px] text-white/30">Base Font Size (for em/rem)</label>
                          <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {baseFontSize}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={24}
                          value={baseFontSize}
                          onChange={(e) => setBaseFontSize(Number(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: 'linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))',
                          }}
                          aria-label="Base font size"
                        />
                      </div>

                      {/* Conversion results */}
                      <div className="rounded-lg border border-white/[0.06] bg-black/20 p-4 space-y-2.5">
                        <div className="font-mono text-[10px] text-white/20 mb-2">Conversions</div>
                        {UNIT_OPTIONS.map((unit) => {
                          const val = convertUnit(convertValue, convertFrom, unit, baseFontSize, viewportWidth, viewportHeight_for_calc);
                          return (
                            <div key={unit} className="flex items-center justify-between">
                              <span className="font-mono text-[11px] text-white/30 w-8">{unit}</span>
                              <span className={`font-mono text-sm ${unit === convertFrom ? 'text-white/20' : 'text-emerald-400/80'}`}>
                                {val.toFixed(unit === '%' || unit === 'vw' || unit === 'vh' ? 2 : 4)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Quick reference */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
                      <Palette className="w-3.5 h-3.5 text-cyan-400/60" />
                      <span className="font-mono text-[11px] text-white/50">Quick Reference</span>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Common conversions */}
                      <div>
                        <div className="font-mono text-[10px] text-white/20 mb-2">Common Conversions (base: 16px)</div>
                        <div className="rounded-lg border border-white/[0.04] overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/[0.04]">
                                <th className="text-left font-mono text-[9px] text-white/25 px-3 py-2 uppercase tracking-wider">From</th>
                                <th className="text-left font-mono text-[9px] text-white/25 px-3 py-2 uppercase tracking-wider">To</th>
                                <th className="text-left font-mono text-[9px] text-white/25 px-3 py-2 uppercase tracking-wider hidden sm:table-cell">Note</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quickRefConversions.map((conv, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-white/[0.02] last:border-0"
                                >
                                  <td className="px-3 py-2 font-mono text-[11px] text-emerald-400/60">{conv.from}</td>
                                  <td className="px-3 py-2 font-mono text-[11px] text-cyan-400/60">{conv.to}</td>
                                  <td className="px-3 py-2 font-mono text-[10px] text-white/15 hidden sm:table-cell">{conv.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Unit explanation */}
                      <div>
                        <div className="font-mono text-[10px] text-white/20 mb-2">Unit Guide</div>
                        <div className="space-y-2">
                          {[
                            { unit: 'px', desc: 'Absolute unit — pixels on screen', color: '#ef4444' },
                            { unit: 'em', desc: 'Relative to parent font size', color: '#f97316' },
                            { unit: 'rem', desc: 'Relative to root (html) font size', color: '#eab308' },
                            { unit: '%', desc: 'Relative to parent element dimension', color: '#22c55e' },
                            { unit: 'vw', desc: 'Relative to 1% viewport width', color: '#3b82f6' },
                            { unit: 'vh', desc: 'Relative to 1% viewport height', color: '#a855f7' },
                          ].map((item) => (
                            <div key={item.unit} className="flex items-start gap-2">
                              <span
                                className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                style={{ color: item.color, backgroundColor: `${item.color}15` }}
                              >
                                {item.unit}
                              </span>
                              <span className="font-mono text-[10px] text-white/25 leading-relaxed">{item.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── CSS CODE OUTPUT TAB ─── */}
            {activeTab === 'code' && (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: '#0d1117' }}>
                  {/* Editor chrome */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      <span className="font-mono text-[11px] text-white/30 ml-2">responsive-styles.css</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleCopy(generatedCSS, 'main')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all border border-white/[0.06]"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {copiedIdx === 'main' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy CSS
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Code content */}
                  <div className="p-4 overflow-x-auto custom-scrollbar max-h-[600px]">
                    {highlightCSS(generatedCSS)}
                  </div>

                  {/* Status bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-white/[0.01]">
                    <span className="font-mono text-[10px] text-white/20">CSS</span>
                    <span className="font-mono text-[10px] text-white/20">{generatedCSS.split('\n').length} lines</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== Section Footer Info ===== */}
        <div className="pb-12 px-4 text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/15">
              <Monitor className="w-3 h-3" /> Responsive Design
            </span>
            <span className="text-white/[0.06]">&bull;</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/15">
              <Code2 className="w-3 h-3" /> Media Queries
            </span>
            <span className="text-white/[0.06]">&bull;</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/15">
              <Ruler className="w-3 h-3" /> Breakpoints
            </span>
            <span className="text-white/[0.06]">&bull;</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/15">
              <Layers className="w-3 h-3" /> Unit Conversion
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
