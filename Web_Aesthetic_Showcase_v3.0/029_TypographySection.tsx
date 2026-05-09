// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1103

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline,
  Copy,
  Check,
  Palette,
  Sparkles,
  Eye,
  Code2,
  RotateCcw,
  ArrowDownToLine,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNT HOOK
   ────────────────────────────────────────────── */

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   TYPES & CONSTANTS
   ────────────────────────────────────────────── */

type TextShadowPreset = 'none' | 'subtle' | 'hard' | 'neon' | 'retro';
type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
type TextAlign = 'left' | 'center' | 'right' | 'justify';
type TextDecoration = 'none' | 'underline' | 'line-through' | 'overline';

interface TypoState {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textTransform: TextTransform;
  textAlign: TextAlign;
  textDecoration: TextDecoration;
  textShadow: TextShadowPreset;
  color: string;
  italic: boolean;
}

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Impact', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
];

const WEIGHT_LABELS: Record<number, string> = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black',
};

const SHADOW_MAP: Record<TextShadowPreset, string> = {
  none: 'none',
  subtle: '1px 1px 2px rgba(0,0,0,0.3)',
  hard: '3px 3px 0px rgba(0,0,0,0.8)',
  neon: '0 0 7px #10b981, 0 0 20px #10b981, 0 0 42px #06b6d4',
  retro: '2px 2px 0px #34d399, 4px 4px 0px #06b6d4, 6px 6px 0px #0a0a0a',
};

const DEFAULT_STATE: TypoState = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 32,
  fontWeight: 400,
  lineHeight: 1.6,
  letterSpacing: 0,
  wordSpacing: 0,
  textTransform: 'none',
  textAlign: 'left',
  textDecoration: 'none',
  textShadow: 'none',
  color: '#ffffff',
  italic: false,
};

interface Preset {
  name: string;
  icon: string;
  desc: string;
  state: Partial<TypoState>;
  extraStyle?: React.CSSProperties;
}

const PRESETS: Preset[] = [
  {
    name: 'Hero Heading',
    icon: 'H1',
    desc: 'Bold, tight spacing',
    state: {
      fontSize: 64,
      fontWeight: 800,
      letterSpacing: -1.5,
      lineHeight: 1.1,
      textShadow: 'none',
    },
    extraStyle: {
      background: 'linear-gradient(135deg, #10b981, #06b6d4, #a855f7)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
  {
    name: 'Body Text',
    icon: 'Bd',
    desc: 'Relaxed reading',
    state: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.7,
      letterSpacing: 0,
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#d4d4d8',
    },
  },
  {
    name: 'Code Block',
    icon: '</>',
    desc: 'Monospace, tight',
    state: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0.5,
      fontFamily: '"Courier New", Courier, monospace',
      color: '#34d399',
    },
  },
  {
    name: 'Elegant Serif',
    icon: 'Se',
    desc: 'Classic sophistication',
    state: {
      fontSize: 24,
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: 1.5,
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#f0e6d3',
      italic: true,
    },
  },
  {
    name: 'Neon Glow',
    icon: 'Ne',
    desc: 'Electric emerald',
    state: {
      fontSize: 48,
      fontWeight: 800,
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#10b981',
      textShadow: 'neon',
      letterSpacing: 2,
    },
  },
  {
    name: 'Retro Terminal',
    icon: '>_',
    desc: 'Green on dark',
    state: {
      fontSize: 18,
      fontWeight: 700,
      fontFamily: '"Courier New", Courier, monospace',
      color: '#22c55e',
      lineHeight: 1.4,
      letterSpacing: 1,
    },
    extraStyle: {
      textShadow: '0 0 10px rgba(34,197,94,0.5), 0 0 30px rgba(34,197,94,0.2)',
    },
  },
  {
    name: 'Minimal Caption',
    icon: 'Cp',
    desc: 'Tiny, uppercase',
    state: {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 4,
      textTransform: 'uppercase',
      color: '#737373',
    },
  },
  {
    name: 'Playful',
    icon: 'Pl',
    desc: 'Fun and bouncy',
    state: {
      fontSize: 36,
      fontWeight: 700,
      fontFamily: '"Comic Sans MS", cursive',
      color: '#fb923c',
      letterSpacing: 1,
      lineHeight: 1.3,
    },
    extraStyle: {
      transform: 'rotate(-2deg)',
    },
  },
];

const FONT_PAIRINGS = [
  {
    heading: 'Inter',
    headingFont: 'Inter, system-ui, sans-serif',
    body: 'Inter',
    bodyFont: 'Inter, system-ui, sans-serif',
    desc: 'Modern & clean — tech/SaaS',
  },
  {
    heading: 'Georgia',
    headingFont: 'Georgia, "Times New Roman", serif',
    body: 'Verdana',
    bodyFont: 'Verdana, Geneva, sans-serif',
    desc: 'Classic & readable — editorial',
  },
  {
    heading: 'Impact',
    headingFont: 'Impact, "Arial Black", sans-serif',
    body: 'Trebuchet MS',
    bodyFont: '"Trebuchet MS", Helvetica, sans-serif',
    desc: 'Bold & friendly — media/posters',
  },
  {
    heading: 'Courier New',
    headingFont: '"Courier New", Courier, monospace',
    body: 'Verdana',
    bodyFont: 'Verdana, Geneva, sans-serif',
    desc: 'Technical & clean — docs/code',
  },
  {
    heading: 'Trebuchet MS',
    headingFont: '"Trebuchet MS", Helvetica, sans-serif',
    body: 'Georgia',
    bodyFont: 'Georgia, "Times New Roman", serif',
    desc: 'Balanced & professional — blogs',
  },
  {
    heading: 'Verdana',
    headingFont: 'Verdana, Geneva, sans-serif',
    body: 'Georgia',
    bodyFont: 'Georgia, "Times New Roman", serif',
    desc: 'Friendly & elegant — magazines',
  },
];

/* ──────────────────────────────────────────────
   HELPER: Generate CSS output
   ────────────────────────────────────────────── */

function generateCSS(state: TypoState, extraStyle?: React.CSSProperties): string {
  const lines: string[] = ['.typography {'];
  lines.push(`  font-family: ${state.fontFamily};`);
  lines.push(`  font-size: ${state.fontSize}px;`);
  lines.push(`  font-weight: ${state.fontWeight};`);
  lines.push(`  line-height: ${state.lineHeight};`);
  if (state.letterSpacing !== 0) lines.push(`  letter-spacing: ${state.letterSpacing}px;`);
  if (state.wordSpacing !== 0) lines.push(`  word-spacing: ${state.wordSpacing}px;`);
  if (state.textTransform !== 'none') lines.push(`  text-transform: ${state.textTransform};`);
  lines.push(`  text-align: ${state.textAlign};`);
  if (state.textDecoration !== 'none') lines.push(`  text-decoration: ${state.textDecoration};`);
  if (state.textShadow !== 'none') lines.push(`  text-shadow: ${SHADOW_MAP[state.textShadow]};`);
  lines.push(`  color: ${state.color};`);
  if (state.italic) lines.push(`  font-style: italic;`);
  if (extraStyle) {
    if (extraStyle.background) lines.push(`  background: ${extraStyle.background};`);
    if (extraStyle.WebkitBackgroundClip) lines.push(`  -webkit-background-clip: text;`);
    if (extraStyle.WebkitTextFillColor) lines.push(`  -webkit-text-fill-color: transparent;`);
    if (extraStyle.transform) lines.push(`  transform: ${extraStyle.transform};`);
    if (extraStyle.textShadow) lines.push(`  text-shadow: ${extraStyle.textShadow};`);
  }
  lines.push('}');
  return lines.join('\n');
}

/* ──────────────────────────────────────────────
   HELPER: Syntax highlight CSS
   ────────────────────────────────────────────── */

function highlightCSS(css: string) {
  return css.split('\n').map((line, i) => {
    const parts: JSX.Element[] = [];
    let remaining = line;
    let keyIdx = 0;

    if (line.trim().startsWith('.typography')) {
      parts.push(<span key={`css-sel-${i}`} className="syn-tag">{remaining}</span>);
    } else if (line.trim() === '}') {
      parts.push(<span key={`css-bk-${i}`} className="syn-bracket">{remaining}</span>);
    } else {
      const colonIdx = remaining.indexOf(':');
      if (colonIdx !== -1) {
        const prop = remaining.slice(0, colonIdx).trim();
        const val = remaining.slice(colonIdx + 1).replace(';', '').trim();
        parts.push(
          <span key={`css-prop-${i}-${keyIdx++}`} className="syn-property">{prop}</span>,
          <span key={`css-punc-${i}-${keyIdx++}`} className="syn-punctuation">: </span>,
          <span key={`css-val-${i}-${keyIdx++}`} className="syn-value">{val}</span>,
          <span key={`css-semi-${i}-${keyIdx++}`} className="syn-punctuation">;</span>,
        );
      } else {
        parts.push(<span key={`css-raw-${i}`}>{remaining}</span>);
      }
    }
    return (
      <div key={`css-line-ty-${i}`}>
        <span className="syn-comment select-none">{String(i + 1).padStart(2, ' ')}</span>
        {'  '}
        {parts}
      </div>
    );
  });
}

/* ──────────────────────────────────────────────
   SUB-COMPONENTS (declared outside render)
   ────────────────────────────────────────────── */

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  iconMap,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  iconMap?: Record<string, React.ReactNode>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <motion.button
          key={`tog-${opt.value}`}
          onClick={() => onChange(opt.value)}
          className={`relative px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors duration-200 cursor-pointer ${
            value === opt.value
              ? 'text-emerald-300'
              : 'text-white/40 hover:text-white/60'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {value === opt.value && (
            <motion.div
              layoutId="typo-toggle-bg"
              className="absolute inset-0 rounded-lg bg-emerald-500/15 border border-emerald-500/30"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {iconMap?.[opt.value]}
            {opt.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  display?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-white/50">{label}</span>
        <span className="text-xs font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">
          {display ?? `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(16,185,129,0.4)]
          [&::-webkit-slider-thumb]:hover:bg-emerald-300 [&::-webkit-slider-thumb]:transition-colors"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */

export function TypographySection() {
  const mounted = useIsMounted();

  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [state, setState] = useState<TypoState>({ ...DEFAULT_STATE });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [extraStyle, setExtraStyle] = useState<React.CSSProperties | undefined>();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'presets' | 'pairings'>('controls');

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const updateState = useCallback((partial: Partial<TypoState>) => {
    setState((prev) => ({ ...prev, ...partial }));
    setActivePreset(null);
    setExtraStyle(undefined);
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setState((prev) => ({ ...prev, ...preset.state }));
    setExtraStyle(preset.extraStyle);
    setActivePreset(preset.name);
  }, []);

  const resetAll = useCallback(() => {
    setState({ ...DEFAULT_STATE });
    setText('The quick brown fox jumps over the lazy dog');
    setActivePreset(null);
    setExtraStyle(undefined);
  }, []);

  const cssCode = useMemo(() => generateCSS(state, extraStyle), [state, extraStyle]);

  const copyCSS = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: textarea trick */
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0a0a12]" />
    );
  }

  return (
    <div className="relative min-h-screen" id="typography-content">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-subtle" />
        <div className="glowing-orb" style={{ top: '10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', animationDelay: '-3s' }} />
        <div className="glowing-orb" style={{ bottom: '20%', left: '5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)', animationDelay: '-8s' }} />
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-4">
            <Type className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400/80">Design Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Typography</span>
            <span className="text-white"> Playground</span>
          </h2>
          <p className="text-sm text-white/40 font-mono max-w-xl mx-auto">
            Experiment with CSS typography properties in real-time. Type, style, preview, and export.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {[
              { id: 'controls' as const, label: 'Controls', icon: <Palette className="w-3.5 h-3.5" /> },
              { id: 'presets' as const, label: 'Presets', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'pairings' as const, label: 'Font Pairings', icon: <Eye className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={`typo-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors duration-200 cursor-pointer ${
                  activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="typo-tab-bg"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main layout: Controls/Presets/Pairings on left, Preview + Code on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── LEFT PANEL ─── */}
          <AnimatePresence mode="wait">
            {/* Controls Tab */}
            {activeTab === 'controls' && (
              <motion.div
                key="controls-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card-premium p-5 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar"
              >
                {/* Reset button */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono text-white/60 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    Typography Controls
                  </h3>
                  <motion.button
                    onClick={resetAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-white/40 hover:text-white/70 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </motion.button>
                </div>

                {/* Text editor */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/50 flex items-center gap-1.5">
                    <ArrowDownToLine className="w-3 h-3" />
                    Preview Text
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/[0.08] text-white/80 text-sm font-mono resize-y focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors placeholder:text-white/20"
                    placeholder="Type your text here..."
                  />
                  <div className="flex gap-3 text-[10px] font-mono text-white/30">
                    <span>{charCount} chars</span>
                    <span>{wordCount} words</span>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-white/50">Font Family</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FONT_OPTIONS.map((font) => (
                      <motion.button
                        key={`font-opt-${font.label}`}
                        onClick={() => updateState({ fontFamily: font.value })}
                        className={`px-2.5 py-2 rounded-lg text-left text-xs font-mono transition-colors cursor-pointer ${
                          state.fontFamily === font.value
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/70 hover:border-white/[0.1]'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <SliderControl
                  label="Font Size"
                  value={state.fontSize}
                  min={8}
                  max={120}
                  step={1}
                  unit="px"
                  onChange={(v) => updateState({ fontSize: v })}
                />

                {/* Font Weight */}
                <SliderControl
                  label="Font Weight"
                  value={state.fontWeight}
                  min={100}
                  max={900}
                  step={100}
                  unit=""
                  display={`${state.fontWeight} ${WEIGHT_LABELS[state.fontWeight]}`}
                  onChange={(v) => updateState({ fontWeight: v })}
                />

                {/* Italic toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50">Italic</span>
                  <button
                    onClick={() => updateState({ italic: !state.italic })}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      state.italic ? 'bg-emerald-500/30' : 'bg-white/10'
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-4 h-4 rounded-full"
                      animate={{
                        left: state.italic ? '22px' : '2px',
                        backgroundColor: state.italic ? '#34d399' : 'rgba(255,255,255,0.3)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    />
                  </button>
                </div>

                {/* Line Height */}
                <SliderControl
                  label="Line Height"
                  value={state.lineHeight}
                  min={0.8}
                  max={3.0}
                  step={0.1}
                  unit=""
                  display={String(state.lineHeight.toFixed(1))}
                  onChange={(v) => updateState({ lineHeight: v })}
                />

                {/* Letter Spacing */}
                <SliderControl
                  label="Letter Spacing"
                  value={state.letterSpacing}
                  min={-5}
                  max={20}
                  step={0.5}
                  unit="px"
                  onChange={(v) => updateState({ letterSpacing: v })}
                />

                {/* Word Spacing */}
                <SliderControl
                  label="Word Spacing"
                  value={state.wordSpacing}
                  min={-5}
                  max={20}
                  step={0.5}
                  unit="px"
                  onChange={(v) => updateState({ wordSpacing: v })}
                />

                {/* Text Transform */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-white/50">Text Transform</span>
                  <ToggleGroup<TextTransform>
                    options={[
                      { label: 'None', value: 'none' },
                      { label: 'Upper', value: 'uppercase' },
                      { label: 'Lower', value: 'lowercase' },
                      { label: 'Cap', value: 'capitalize' },
                    ]}
                    value={state.textTransform}
                    onChange={(v) => updateState({ textTransform: v })}
                  />
                </div>

                {/* Text Alignment */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-white/50">Text Alignment</span>
                  <ToggleGroup<TextAlign>
                    options={[
                      { label: 'Left', value: 'left' },
                      { label: 'Center', value: 'center' },
                      { label: 'Right', value: 'right' },
                      { label: 'Justify', value: 'justify' },
                    ]}
                    value={state.textAlign}
                    onChange={(v) => updateState({ textAlign: v })}
                    iconMap={{
                      left: <AlignLeft className="w-3 h-3" />,
                      center: <AlignCenter className="w-3 h-3" />,
                      right: <AlignRight className="w-3 h-3" />,
                      justify: <AlignJustify className="w-3 h-3" />,
                    }}
                  />
                </div>

                {/* Text Decoration */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-white/50">Text Decoration</span>
                  <ToggleGroup<TextDecoration>
                    options={[
                      { label: 'None', value: 'none' },
                      { label: 'Underline', value: 'underline' },
                      { label: 'Strike', value: 'line-through' },
                      { label: 'Overline', value: 'overline' },
                    ]}
                    value={state.textDecoration}
                    onChange={(v) => updateState({ textDecoration: v })}
                    iconMap={{
                      underline: <Underline className="w-3 h-3" />,
                    }}
                  />
                </div>

                {/* Text Shadow */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-white/50">Text Shadow</span>
                  <ToggleGroup<TextShadowPreset>
                    options={[
                      { label: 'None', value: 'none' },
                      { label: 'Subtle', value: 'subtle' },
                      { label: 'Hard', value: 'hard' },
                      { label: 'Neon', value: 'neon' },
                      { label: 'Retro', value: 'retro' },
                    ]}
                    value={state.textShadow}
                    onChange={(v) => updateState({ textShadow: v })}
                  />
                </div>

                {/* Color picker */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/50 flex items-center gap-1.5">
                      <Palette className="w-3 h-3" />
                      Text Color
                    </span>
                    <span className="text-xs font-mono text-white/40">{state.color}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={state.color}
                      onChange={(e) => updateState({ color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/[0.1] cursor-pointer bg-transparent"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {['#ffffff', '#d4d4d8', '#737373', '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#f87171', '#a78bfa', '#22c55e'].map((c) => (
                        <button
                          key={`color-swatch-${c}`}
                          onClick={() => updateState({ color: c })}
                          className={`w-6 h-6 rounded-md border transition-transform cursor-pointer hover:scale-110 ${
                            state.color === c ? 'border-white scale-110' : 'border-white/10'
                          }`}
                          style={{ backgroundColor: c }}
                          aria-label={`Set color to ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <motion.div
                key="presets-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card-premium p-5 max-h-[80vh] overflow-y-auto custom-scrollbar"
              >
                <h3 className="text-sm font-mono text-white/60 flex items-center gap-2 mb-5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Preset Gallery
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {PRESETS.map((preset) => (
                      <motion.button
                        key={`preset-${preset.name}`}
                        onClick={() => applyPreset(preset)}
                        className={`relative group text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                          activePreset === preset.name
                            ? 'border-emerald-500/40 bg-emerald-500/[0.08]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        layout
                      >
                        {activePreset === preset.name && (
                          <motion.div
                            layoutId="preset-active-border"
                            className="absolute inset-0 rounded-xl border-2 border-emerald-400/50"
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          />
                        )}
                        {/* Preset preview text */}
                        <div className="mb-3 overflow-hidden h-16 flex items-center">
                          <span
                            className="w-full truncate"
                            style={{
                              fontFamily: preset.state.fontFamily ?? DEFAULT_STATE.fontFamily,
                              fontSize: Math.min((preset.state.fontSize ?? DEFAULT_STATE.fontSize), 24),
                              fontWeight: preset.state.fontWeight ?? DEFAULT_STATE.fontWeight,
                              color: preset.state.color ?? '#ffffff',
                              letterSpacing: `${(preset.state.letterSpacing ?? 0)}px`,
                              fontStyle: (preset.state.italic) ? 'italic' : 'normal',
                              textTransform: (preset.state.textTransform as 'uppercase' | 'lowercase' | 'capitalize') ?? 'none',
                              textShadow: SHADOW_MAP[preset.state.textShadow ?? 'none'] ?? 'none',
                              ...(preset.extraStyle ?? {}),
                            }}
                          >
                            {text.slice(0, 30)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                          <span className="text-[10px] font-mono font-bold text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {preset.icon}
                          </span>
                          <div>
                            <div className="text-xs font-mono text-white/70 font-medium">{preset.name}</div>
                            <div className="text-[10px] font-mono text-white/30">{preset.desc}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Font Pairings Tab */}
            {activeTab === 'pairings' && (
              <motion.div
                key="pairings-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card-premium p-5 max-h-[80vh] overflow-y-auto custom-scrollbar"
              >
                <h3 className="text-sm font-mono text-white/60 flex items-center gap-2 mb-5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Font Pairing Suggestions
                </h3>
                <div className="space-y-3">
                  {FONT_PAIRINGS.map((pairing, i) => (
                    <motion.button
                      key={`pairing-${i}`}
                      onClick={() => updateState({ fontFamily: pairing.headingFont })}
                      className="w-full text-left p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group"
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="mb-3 space-y-1.5">
                        {/* Heading preview */}
                        <div
                          className="text-lg font-bold text-white/80 truncate"
                          style={{ fontFamily: pairing.headingFont }}
                        >
                          {text.slice(0, 35)}{text.length > 35 ? '...' : ''}
                        </div>
                        {/* Body preview */}
                        <div
                          className="text-xs text-white/40 truncate"
                          style={{ fontFamily: pairing.bodyFont }}
                        >
                          {text.slice(0, 60)}{text.length > 60 ? '...' : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {pairing.heading}
                        </span>
                        <span className="text-[10px] font-mono text-white/20">+</span>
                        <span className="text-[10px] font-mono text-cyan-400/70 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {pairing.body}
                        </span>
                        <span className="text-[10px] font-mono text-white/25 ml-auto">{pairing.desc}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── RIGHT PANEL: Preview + CSS Code ─── */}
          <div className="space-y-6">
            {/* Live Preview */}
            <motion.div
              className="glass-card-premium p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-mono text-white/60 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Live Preview
                </h3>
                <div className="flex gap-2 text-[10px] font-mono text-white/30">
                  <span>{charCount} chars</span>
                  <span>·</span>
                  <span>{wordCount} words</span>
                </div>
              </div>
              {/* Preview area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`preview-${activePreset ?? 'custom'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="relative min-h-[200px] max-h-[400px] overflow-y-auto p-6 rounded-xl bg-[#0d0d14] border border-white/[0.05] custom-scrollbar"
                  style={{
                    /* Retro Terminal scanlines overlay */
                    ...(activePreset === 'Retro Terminal' ? { overflow: 'hidden' } : {}),
                  }}
                >
                  {activePreset === 'Retro Terminal' && (
                    <div
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
                      }}
                    />
                  )}
                  <div
                    className="break-words transition-all duration-300"
                    style={{
                      fontFamily: state.fontFamily,
                      fontSize: `${state.fontSize}px`,
                      fontWeight: state.fontWeight,
                      lineHeight: state.lineHeight,
                      letterSpacing: `${state.letterSpacing}px`,
                      wordSpacing: `${state.wordSpacing}px`,
                      textTransform: state.textTransform,
                      textAlign: state.textAlign,
                      textDecoration: state.textDecoration,
                      textShadow: extraStyle?.textShadow ?? SHADOW_MAP[state.textShadow],
                      color: extraStyle?.background ? state.color : state.color,
                      fontStyle: state.italic ? 'italic' : 'normal',
                      ...extraStyle,
                    }}
                  >
                    {text || <span className="text-white/20 italic">Start typing to preview...</span>}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* CSS Code Output */}
            <motion.div
              className="glass-card-premium p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-mono text-white/60 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  CSS Output
                </h3>
                <motion.button
                  onClick={copyCSS}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-white/40 hover:text-white/70 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
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
                      Copy CSS
                    </>
                  )}
                </motion.button>
              </div>
              {/* Code display */}
              <div className="p-4 rounded-xl bg-[#0d1117] border border-white/[0.05] font-mono text-xs leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-[10px] text-white/20">typography.css</span>
                </div>
                <div className="space-y-0.5">
                  {highlightCSS(cssCode)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Info bar */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs font-mono text-white/25">
            {[
              '8 Font Families',
              '11 Controls',
              '8 Presets',
              '6 Font Pairings',
              'Live CSS Export',
            ].map((info, i) => (
              <div key={`typo-info-${i}`} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                {info}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Floating decorations */}
        <div className="absolute pointer-events-none inset-0 overflow-hidden -z-10">
          {[
            { symbol: 'Aa', x: 5, y: 15, delay: 0 },
            { symbol: ' ff', x: 90, y: 25, delay: 1.2 },
            { symbol: '0.5em', x: 8, y: 80, delay: 2.4 },
            { symbol: 'font-w', x: 85, y: 75, delay: 0.8 },
            { symbol: 'Kern', x: 92, y: 50, delay: 3.0 },
          ].map((item) => (
            <motion.div
              key={`typo-deco-${item.symbol}`}
              className="absolute font-mono text-[10px] text-white/[0.06] select-none"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              animate={{ y: [0, -8, 0], opacity: [0.04, 0.1, 0.04] }}
              transition={{ duration: 5 + item.delay, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
            >
              {item.symbol}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
