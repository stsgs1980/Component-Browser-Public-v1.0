// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1526

'use client';

import { useState, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Download,
  Code2,
  Sparkles,
  Film,
  Zap,
  Clock,
  RefreshCw,
  ChevronDown,
  Timer,
  Gauge,
  Eye,
  Layers,
  PenTool,
  Wand2,
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
interface KeyframeStep {
  percentage: number;
  properties: Record<string, string>;
}

interface AnimationPreset {
  name: string;
  category: string;
  keyframes: KeyframeStep[];
  duration: number;
  timingFunction: string;
  iterationCount: string;
  direction: string;
  fillMode: string;
}

interface CustomAnimSettings {
  duration: number;
  timingFunction: string;
  iterationCount: string;
  direction: string;
  fillMode: string;
  delay: number;
}

type PreviewShape = 'square' | 'circle' | 'text' | 'button';

/* ──────────────────────────────────────────────
   TIMING FUNCTION DEFINITIONS (for SVG curves)
   ────────────────────────────────────────────── */
const TIMING_FUNCTIONS = [
  { name: 'linear', label: 'Linear' },
  { name: 'ease', label: 'Ease' },
  { name: 'ease-in', label: 'Ease In' },
  { name: 'ease-out', label: 'Ease Out' },
  { name: 'ease-in-out', label: 'Ease In-Out' },
  { name: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)', label: 'Back Out' },
  { name: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', label: 'Ease Out Quad' },
  { name: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)', label: 'Ease In Quad' },
];

/* Approximate cubic-bezier as SVG path for the easing visualizer */
function timingToSVGPath(name: string): string {
  const w = 80;
  const h = 50;
  const pts: [number, number][] = [];
  const steps = 50;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let y: number;
    switch (name) {
      case 'linear': y = t; break;
      case 'ease': y = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; break;
      case 'ease-in': y = t * t * t; break;
      case 'ease-out': y = 1 - Math.pow(1 - t, 3); break;
      case 'ease-in-out': y = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; break;
      case 'cubic-bezier(0.68, -0.55, 0.27, 1.55)': {
        const cx1 = 0.68, cy1 = -0.55, cx2 = 0.27, cy2 = 1.55;
        const mt = 1 - t;
        y = 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t;
        y = Math.max(0, Math.min(1.15, y));
        break;
      }
      case 'cubic-bezier(0.25, 0.46, 0.45, 0.94)': {
        const cx1 = 0.25, cy1 = 0.46, cx2 = 0.45, cy2 = 0.94;
        const mt = 1 - t;
        y = 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t;
        break;
      }
      case 'cubic-bezier(0.55, 0.06, 0.68, 0.19)': {
        const cx1 = 0.55, cy1 = 0.06, cx2 = 0.68, cy2 = 0.19;
        const mt = 1 - t;
        y = 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t;
        break;
      }
      default: y = t;
    }
    pts.push([t * w, h - y * h]);
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
}

/* ──────────────────────────────────────────────
   PRESET ANIMATIONS (16 presets)
   ────────────────────────────────────────────── */
const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    name: 'Fade In', category: 'Opacity',
    keyframes: [
      { percentage: 0, properties: { opacity: '0' } },
      { percentage: 100, properties: { opacity: '1' } },
    ],
    duration: 1, timingFunction: 'ease-in', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  {
    name: 'Fade Out', category: 'Opacity',
    keyframes: [
      { percentage: 0, properties: { opacity: '1' } },
      { percentage: 100, properties: { opacity: '0' } },
    ],
    duration: 1, timingFunction: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  {
    name: 'Fade Up', category: 'Opacity',
    keyframes: [
      { percentage: 0, properties: { opacity: '0', transform: 'translateY(20px)' } },
      { percentage: 100, properties: { opacity: '1', transform: 'translateY(0)' } },
    ],
    duration: 0.8, timingFunction: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  {
    name: 'Slide Left', category: 'Slide',
    keyframes: [
      { percentage: 0, properties: { transform: 'translateX(100%)', opacity: '0' } },
      { percentage: 100, properties: { transform: 'translateX(0)', opacity: '1' } },
    ],
    duration: 0.6, timingFunction: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  {
    name: 'Slide Right', category: 'Slide',
    keyframes: [
      { percentage: 0, properties: { transform: 'translateX(-100%)', opacity: '0' } },
      { percentage: 100, properties: { transform: 'translateX(0)', opacity: '1' } },
    ],
    duration: 0.6, timingFunction: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  {
    name: 'Bounce', category: 'Transform',
    keyframes: [
      { percentage: 0, properties: { transform: 'translateY(0)' } },
      { percentage: 20, properties: { transform: 'translateY(-30px)' } },
      { percentage: 40, properties: { transform: 'translateY(0)' } },
      { percentage: 50, properties: { transform: 'translateY(-15px)' } },
      { percentage: 65, properties: { transform: 'translateY(0)' } },
      { percentage: 75, properties: { transform: 'translateY(-7px)' } },
      { percentage: 100, properties: { transform: 'translateY(0)' } },
    ],
    duration: 1, timingFunction: 'ease', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  {
    name: 'Pulse', category: 'Transform',
    keyframes: [
      { percentage: 0, properties: { transform: 'scale(1)' } },
      { percentage: 50, properties: { transform: 'scale(1.05)' } },
      { percentage: 100, properties: { transform: 'scale(1)' } },
    ],
    duration: 1.5, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  {
    name: 'Heartbeat', category: 'Transform',
    keyframes: [
      { percentage: 0, properties: { transform: 'scale(1)' } },
      { percentage: 14, properties: { transform: 'scale(1.3)' } },
      { percentage: 28, properties: { transform: 'scale(1)' } },
      { percentage: 42, properties: { transform: 'scale(1.3)' } },
      { percentage: 70, properties: { transform: 'scale(1)' } },
    ],
    duration: 1.3, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  {
    name: 'Spin', category: 'Transform',
    keyframes: [
      { percentage: 0, properties: { transform: 'rotate(0deg)' } },
      { percentage: 100, properties: { transform: 'rotate(360deg)' } },
    ],
    duration: 1, timingFunction: 'linear', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  {
    name: 'Flip', category: 'Transform',
    keyframes: [
      { percentage: 0, properties: { transform: 'perspective(400px) rotateY(0)' } },
      { percentage: 100, properties: { transform: 'perspective(400px) rotateY(360deg)' } },
    ],
    duration: 1, timingFunction: 'ease-in-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  {
    name: 'Scale Up', category: 'Transform',
    keyframes: [
      { percentage: 0, properties: { transform: 'scale(0.3)', opacity: '0' } },
      { percentage: 50, properties: { transform: 'scale(1.05)' } },
      { percentage: 70, properties: { transform: 'scale(0.9)' } },
      { percentage: 100, properties: { transform: 'scale(1)', opacity: '1' } },
    ],
    duration: 0.6, timingFunction: 'ease', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  {
    name: 'Shake', category: 'Transform',
    keyframes: [
      { percentage: 0, properties: { transform: 'translateX(0)' } },
      { percentage: 10, properties: { transform: 'translateX(-10px)' } },
      { percentage: 20, properties: { transform: 'translateX(10px)' } },
      { percentage: 30, properties: { transform: 'translateX(-10px)' } },
      { percentage: 40, properties: { transform: 'translateX(10px)' } },
      { percentage: 50, properties: { transform: 'translateX(-5px)' } },
      { percentage: 60, properties: { transform: 'translateX(5px)' } },
      { percentage: 70, properties: { transform: 'translateX(-5px)' } },
      { percentage: 80, properties: { transform: 'translateX(5px)' } },
      { percentage: 90, properties: { transform: 'translateX(-2px)' } },
      { percentage: 100, properties: { transform: 'translateX(0)' } },
    ],
    duration: 0.6, timingFunction: 'ease', iterationCount: '1', direction: 'normal', fillMode: 'none',
  },
  {
    name: 'Wiggle', category: 'Transform',
    keyframes: [
      { percentage: 0, properties: { transform: 'rotate(0deg)' } },
      { percentage: 25, properties: { transform: 'rotate(5deg)' } },
      { percentage: 50, properties: { transform: 'rotate(-5deg)' } },
      { percentage: 75, properties: { transform: 'rotate(3deg)' } },
      { percentage: 100, properties: { transform: 'rotate(0deg)' } },
    ],
    duration: 0.8, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  {
    name: 'Glow Pulse', category: 'Effects',
    keyframes: [
      { percentage: 0, properties: { 'box-shadow': '0 0 5px rgba(16, 185, 129, 0.3)' } },
      { percentage: 50, properties: { 'box-shadow': '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(6, 182, 212, 0.3)' } },
      { percentage: 100, properties: { 'box-shadow': '0 0 5px rgba(16, 185, 129, 0.3)' } },
    ],
    duration: 2, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  {
    name: 'Float', category: 'Effects',
    keyframes: [
      { percentage: 0, properties: { transform: 'translateY(0px)' } },
      { percentage: 50, properties: { transform: 'translateY(-12px)' } },
      { percentage: 100, properties: { transform: 'translateY(0px)' } },
    ],
    duration: 3, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  {
    name: 'Typewriter', category: 'Effects',
    keyframes: [
      { percentage: 0, properties: { width: '0' } },
      { percentage: 50, properties: { width: '100%' } },
      { percentage: 100, properties: { width: '100%' } },
    ],
    duration: 2, timingFunction: 'steps(20)', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
];

/* ──────────────────────────────────────────────
   PROPERTY OPTIONS FOR CUSTOM BUILDER
   ────────────────────────────────────────────── */
const ANIM_PROPERTIES = [
  { value: 'transform', label: 'Transform' },
  { value: 'opacity', label: 'Opacity' },
  { value: 'background-color', label: 'Background Color' },
  { value: 'box-shadow', label: 'Box Shadow' },
  { value: 'border-radius', label: 'Border Radius' },
  { value: 'filter', label: 'Filter' },
];

const ITERATION_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: 'infinite', label: '∞' },
];

const DIRECTION_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'alternate', label: 'Alternate' },
  { value: 'alternate-reverse', label: 'Alt-Reverse' },
];

const FILL_MODE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'forwards', label: 'Forwards' },
  { value: 'backwards', label: 'Backwards' },
  { value: 'both', label: 'Both' },
];

/* ──────────────────────────────────────────────
   DEFAULT CUSTOM ANIMATION
   ────────────────────────────────────────────── */
function createDefaultCustom(): { keyframes: KeyframeStep[]; settings: CustomAnimSettings } {
  return {
    keyframes: [
      { percentage: 0, properties: { transform: 'translateY(0)', opacity: '1' } },
      { percentage: 50, properties: { transform: 'translateY(-20px)', opacity: '0.5' } },
      { percentage: 100, properties: { transform: 'translateY(0)', opacity: '1' } },
    ],
    settings: {
      duration: 1.5,
      timingFunction: 'ease-in-out',
      iterationCount: 'infinite',
      direction: 'normal',
      fillMode: 'none',
      delay: 0,
    },
  };
}

/* ──────────────────────────────────────────────
   FLOATING DECORATIONS
   ────────────────────────────────────────────── */
function FloatingDecorations() {
  const symbols = [
    { text: '@keyframes', x: 3, y: 8, delay: 0 },
    { text: 'animation:', x: 88, y: 12, delay: 1.4 },
    { text: '∞', x: 92, y: 55, delay: 0.7 },
    { text: 'ease-in-out', x: 6, y: 78, delay: 2.2 },
    { text: '0% → 100%', x: 78, y: 88, delay: 1.6 },
    { text: 'forwards', x: 12, y: 42, delay: 0.3 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {symbols.map((sym, i) => (
        <motion.div
          key={`anim-deco-${i}`}
          className="absolute font-mono text-[10px] whitespace-nowrap select-none"
          style={{ left: `${sym.x}%`, top: `${sym.y}%`, color: 'rgba(16, 185, 129, 0.07)' }}
          animate={{ y: [0, -10, 0], opacity: [0.04, 0.12, 0.04] }}
          transition={{ duration: 7 + i * 1.1, repeatType: "loop", repeat: Infinity, ease: 'easeInOut', delay: sym.delay }}
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
function AnimSlider({
  label, value, min, max, step, unit, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">{label}</span>
        <span className="text-[11px] font-mono text-emerald-400/80 tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #10b981 0%, #06b6d4 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   GENERATE CSS CODE STRING
   ────────────────────────────────────────────── */
function generateKeyframesCSS(name: string, keyframes: KeyframeStep[]): string {
  const sorted = [...keyframes].sort((a, b) => a.percentage - b.percentage);
  const lines = sorted.map((kf) => {
    const props = Object.entries(kf.properties)
      .map(([prop, val]) => `    ${prop}: ${val};`)
      .join('\n');
    return `  ${kf.percentage}% {\n${props}\n  }`;
  }).join('\n');
  return `@keyframes ${name} {\n${lines}\n}`;
}

function generateAnimationCSS(settings: CustomAnimSettings): string {
  const parts = [
    `animation-name: custom-anim`,
    `animation-duration: ${settings.duration}s`,
    `animation-timing-function: ${settings.timingFunction}`,
    `animation-iteration-count: ${settings.iterationCount}`,
    `animation-direction: ${settings.direction}`,
    `animation-fill-mode: ${settings.fillMode}`,
  ];
  if (settings.delay > 0) {
    parts.push(`animation-delay: ${settings.delay}s`);
  }
  return parts.join(';\n') + ';';
}

function generatePresetCSS(preset: AnimationPreset): string {
  const kf = generateKeyframesCSS(preset.name.toLowerCase().replace(/\s+/g, '-'), preset.keyframes);
  const shorthand = [
    `animation-name: ${preset.name.toLowerCase().replace(/\s+/g, '-')}`,
    `animation-duration: ${preset.duration}s`,
    `animation-timing-function: ${preset.timingFunction}`,
    `animation-iteration-count: ${preset.iterationCount}`,
    `animation-direction: ${preset.direction}`,
    `animation-fill-mode: ${preset.fillMode}`,
  ].join(';\n') + ';';
  return `${kf}\n\n/* Animation property */\n${shorthand}`;
}

/* ──────────────────────────────────────────────
   SYNTAX HIGHLIGHT CSS CODE
   ────────────────────────────────────────────── */
function highlightCSSCode(code: string) {
  return code.split('\n').map((line, i) => {
    const parts: { text: string; cls?: string }[] = [];
    // @keyframes keyword
    const kfMatch = line.match(/(@keyframes)\s+([\w-]+)/);
    if (kfMatch) {
      parts.push({ text: '@keyframes', cls: 'syn-keyword' });
      parts.push({ text: ` ${kfMatch[2]}`, cls: 'syn-function' });
      parts.push({ text: ' {', cls: 'syn-bracket' });
      if (line.trim() === `${kfMatch[0]} {`) {
        return { lineNum: i + 1, parts };
      }
    }
    // Closing bracket
    if (line.trim() === '}') {
      return { lineNum: i + 1, parts: [{ text: '}', cls: 'syn-bracket' }] };
    }
    // Percentage
    const pctMatch = line.match(/^\s*(\d+)%\s*\{/);
    if (pctMatch) {
      const rest = line.slice(line.indexOf('{'));
      const innerProps = line.replace(rest, '').trim();
      parts.push({ text: `${pctMatch[1]}%`, cls: 'syn-number' });
      parts.push({ text: ' {', cls: 'syn-bracket' });
      return { lineNum: i + 1, parts };
    }
    // Property: value
    const propMatch = line.match(/^\s{2,4}([\w-]+):\s*(.+);$/);
    if (propMatch) {
      parts.push({ text: `    ${propMatch[1]}`, cls: 'syn-property' });
      parts.push({ text: ': ', cls: 'syn-punctuation' });
      parts.push({ text: propMatch[2], cls: 'syn-value' });
      parts.push({ text: ';', cls: 'syn-punctuation' });
      return { lineNum: i + 1, parts };
    }
    // Comment
    if (line.trim().startsWith('/*')) {
      return { lineNum: i + 1, parts: [{ text: line, cls: 'syn-comment' }] };
    }
    // Default
    return { lineNum: i + 1, parts: [{ text: line }] };
  });
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function AnimationGeneratorSection() {
  const mounted = useIsMounted();
  const previewRef = useRef<HTMLDivElement>(null);
  const animKeyRef = useRef(0);

  // Tab mode: presets vs custom builder
  const [tabMode, setTabMode] = useState<'presets' | 'custom'>('presets');

  // Presets state
  const [activePresetIdx, setActivePresetIdx] = useState(0);
  const [presetCategory, setPresetCategory] = useState<string>('all');

  // Custom builder state
  const [customKeyframes, setCustomKeyframes] = useState<KeyframeStep[]>(createDefaultCustom().keyframes);
  const [customSettings, setCustomSettings] = useState<CustomAnimSettings>(createDefaultCustom().settings);
  const [activeKeyframeIdx, setActiveKeyframeIdx] = useState(0);
  const [editProperty, setEditProperty] = useState('transform');
  const [editValue, setEditValue] = useState('translateY(0)');

  // Preview state
  const [previewShape, setPreviewShape] = useState<PreviewShape>('square');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  // Code state
  const [copied, setCopied] = useState(false);

  // Easing visualizer state
  const [showEasing, setShowEasing] = useState(false);

  // Derived state
  const activePreset = ANIMATION_PRESETS[activePresetIdx];
  const activeKeyframe = customKeyframes[activeKeyframeIdx] || customKeyframes[0];

  // Categories
  const categories = useMemo(() => {
    const cats = new Set(ANIMATION_PRESETS.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredPresets = useMemo(() => {
    if (presetCategory === 'all') return ANIMATION_PRESETS;
    return ANIMATION_PRESETS.filter((p) => p.category === presetCategory);
  }, [presetCategory]);

  // Current animation CSS for preview
  const currentCSS = useMemo(() => {
    if (tabMode === 'presets') {
      const preset = activePreset;
      const kfName = preset.name.toLowerCase().replace(/\s+/g, '-');
      return {
        keyframesCSS: generateKeyframesCSS(kfName, preset.keyframes),
        animName: kfName,
        duration: preset.duration,
        timingFunction: preset.timingFunction,
        iterationCount: preset.iterationCount,
        direction: preset.direction,
        fillMode: preset.fillMode,
      };
    }
    return {
      keyframesCSS: generateKeyframesCSS('custom-anim', customKeyframes),
      animName: 'custom-anim',
      duration: customSettings.duration,
      timingFunction: customSettings.timingFunction,
      iterationCount: customSettings.iterationCount,
      direction: customSettings.direction,
      fillMode: customSettings.fillMode,
      delay: customSettings.delay,
    };
  }, [tabMode, activePreset, customKeyframes, customSettings]);

  // Full CSS code for output
  const fullCSSCode = useMemo(() => {
    if (tabMode === 'presets') {
      return generatePresetCSS(activePreset);
    }
    const kf = generateKeyframesCSS('custom-anim', customKeyframes);
    const anim = generateAnimationCSS(customSettings);
    return `${kf}\n\n.element {\n  ${anim}\n}`;
  }, [tabMode, activePreset, customKeyframes, customSettings]);

  // Highlighted code lines
  const highlightedLines = useMemo(() => highlightCSSCode(fullCSSCode), [fullCSSCode]);

  // Preview animation style
  const previewAnimStyle = useMemo(() => {
    const parts = [
      `${currentCSS.duration}s`,
      currentCSS.timingFunction,
      currentCSS.iterationCount,
      currentCSS.direction,
      currentCSS.fillMode,
    ];
    if (currentCSS.delay) {
      parts.push(`${currentCSS.delay}s`);
    }
    return {
      animation: isPlaying
        ? `${currentCSS.animName} ${parts.join(' ')}`
        : 'none',
      animationPlayState: isPlaying ? 'running' : 'paused',
      animationDuration: isPlaying ? `${currentCSS.duration / playbackSpeed}s` : undefined,
    } as React.CSSProperties;
  }, [currentCSS, isPlaying, playbackSpeed]);

  // Handle play/pause/reset
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setAnimKey((k) => k + 1);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setAnimKey((k) => k + 1);
    setTimeout(() => setIsPlaying(true), 50);
  }, []);

  // Copy to clipboard
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullCSSCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullCSSCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fullCSSCode]);

  // Export CSS file
  const exportCSS = useCallback(() => {
    const blob = new Blob([fullCSSCode], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.css';
    a.click();
    URL.revokeObjectURL(url);
  }, [fullCSSCode]);

  // Apply preset
  const applyPreset = useCallback((idx: number) => {
    setActivePresetIdx(idx);
    setIsPlaying(true);
    setAnimKey((k) => k + 1);
  }, []);

  // Add keyframe step
  const addKeyframeStep = useCallback(() => {
    setCustomKeyframes((prev) => {
      const percentages = prev.map((k) => k.percentage);
      let newPct = 50;
      for (let p = 10; p <= 90; p += 10) {
        if (!percentages.includes(p)) { newPct = p; break; }
      }
      return [...prev, { percentage: newPct, properties: {} }].sort((a, b) => a.percentage - b.percentage);
    });
    setActiveKeyframeIdx((prev) => prev + 1);
    setEditValue('');
  }, []);

  // Remove keyframe step
  const removeKeyframeStep = useCallback((idx: number) => {
    if (customKeyframes.length <= 2) return;
    setCustomKeyframes((prev) => prev.filter((_, i) => i !== idx));
    setActiveKeyframeIdx((prev) => Math.min(prev, customKeyframes.length - 2));
  }, [customKeyframes.length]);

  // Update keyframe property
  const updateKeyframeProperty = useCallback((kfIdx: number, prop: string, value: string) => {
    setCustomKeyframes((prev) => prev.map((kf, i) => {
      if (i !== kfIdx) return kf;
      return { ...kf, properties: { ...kf.properties, [prop]: value } };
    }));
  }, []);

  // Update keyframe percentage
  const updateKeyframePercentage = useCallback((kfIdx: number, pct: number) => {
    setCustomKeyframes((prev) => {
      const updated = prev.map((kf, i) => i === kfIdx ? { ...kf, percentage: pct } : kf);
      return updated.sort((a, b) => a.percentage - b.percentage);
    });
  }, []);

  // Set active keyframe and sync edit fields
  const selectKeyframe = useCallback((idx: number) => {
    setActiveKeyframeIdx(idx);
    const kf = customKeyframes[idx];
    if (kf) {
      const firstProp = Object.keys(kf.properties)[0] || 'transform';
      setEditProperty(firstProp);
      setEditValue(kf.properties[firstProp] || '');
    }
  }, [customKeyframes]);

  // Sync when property changes
  const handlePropertyChange = useCallback((prop: string) => {
    setEditProperty(prop);
    const kf = customKeyframes[activeKeyframeIdx];
    if (kf) {
      setEditValue(kf.properties[prop] || '');
    }
  }, [customKeyframes, activeKeyframeIdx]);

  // Apply edit value to keyframe
  const applyEditValue = useCallback(() => {
    if (editValue.trim()) {
      updateKeyframeProperty(activeKeyframeIdx, editProperty, editValue.trim());
    }
  }, [editValue, editProperty, activeKeyframeIdx, updateKeyframeProperty]);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <section className="relative w-full min-h-screen py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d18] to-[#0a0a0a]" />

      {/* Grid background */}
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
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] mb-4">
            <Film className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400/70">Animation Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span
              className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_100%]"
              style={{ animation: 'gradient-shift 6s ease infinite' }}
            >
              Animation Lab
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-mono text-white/25">
            <span>16 Presets</span>
            <span className="text-emerald-500/40">/</span>
            <span>Custom Builder</span>
            <span className="text-emerald-500/40">/</span>
            <span>Live Preview</span>
            <span className="text-emerald-500/40">/</span>
            <span>Export CSS</span>
          </div>
        </motion.div>

        {/* Tab Toggle: Presets / Custom */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-3 mb-6"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative flex items-center gap-1 p-1 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
            {(['presets', 'custom'] as const).map((m) => (
              <button
                key={`tab-${m}`}
                onClick={() => { setTabMode(m); setIsPlaying(true); setAnimKey((k) => k + 1); }}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  tabMode === m ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                {tabMode === m && (
                  <motion.div
                    layoutId="anim-tab-bg"
                    className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.08]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {m === 'presets' ? (
                  <Sparkles className="w-3.5 h-3.5 relative z-10" />
                ) : (
                  <PenTool className="w-3.5 h-3.5 relative z-10" />
                )}
                <span className="relative z-10">{m === 'presets' ? 'Presets' : 'Custom Builder'}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Easing Visualizer toggle */}
            <motion.button
              onClick={() => setShowEasing((s) => !s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                showEasing ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80 hover:border-white/[0.15]'
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap className="w-3 h-3" />
              Easing
            </motion.button>
            <motion.button
              onClick={exportCSS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/50 hover:text-white/80 hover:border-white/[0.15] transition-colors cursor-pointer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Download className="w-3 h-3" />
              Export
            </motion.button>
          </div>
        </motion.div>

        {/* Easing Curve Visualizer */}
        <AnimatePresence>
          {showEasing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-cyan-400/70" />
                  <span className="text-xs font-mono text-white/50">Timing Function Curves</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TIMING_FUNCTIONS.map((tf) => {
                    const isActive = tabMode === 'custom'
                      ? customSettings.timingFunction === tf.name
                      : activePreset.timingFunction === tf.name;
                    return (
                      <motion.button
                        key={`easing-${tf.name}`}
                        onClick={() => {
                          if (tabMode === 'custom') {
                            setCustomSettings((s) => ({ ...s, timingFunction: tf.name }));
                          } else {
                            // For presets, just visual comparison
                          }
                        }}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                          isActive ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/[0.04] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.04]'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <svg width={80} height={50} className="opacity-80">
                          {/* Grid */}
                          <line x1={0} y1={50} x2={80} y2={50} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                          <line x1={0} y1={0} x2={0} y2={50} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                          {/* Diagonal reference */}
                          <line x1={0} y1={50} x2={80} y2={0} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} strokeDasharray="3,3" />
                          {/* Curve */}
                          <path
                            d={timingToSVGPath(tf.name)}
                            fill="none"
                            stroke={isActive ? '#10b981' : '#06b6d4'}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                          {/* Dot at end */}
                          <circle cx={78} cy={1} r={2.5} fill={isActive ? '#10b981' : '#06b6d4'} />
                        </svg>
                        <span className="text-[9px] font-mono text-white/40">{tf.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ──── LEFT PANEL ──── */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {tabMode === 'presets' ? (
                /* ── PRESETS PANEL ── */
                <motion.div
                  key="presets-panel"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Category filter */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400/70" />
                      <span className="text-xs font-mono text-white/50">Preset Animations</span>
                      <span className="text-[10px] font-mono text-white/20">({filteredPresets.length})</span>
                    </div>
                    {/* Category pills */}
                    <div className="flex flex-wrap gap-1.5 p-3 border-b border-white/[0.04]">
                      {categories.map((cat) => (
                        <motion.button
                          key={`cat-${cat}`}
                          onClick={() => setPresetCategory(cat)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                            presetCategory === cat
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'text-white/35 hover:text-white/55 border border-transparent hover:border-white/[0.08]'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          {cat === 'all' ? 'All' : cat}
                        </motion.button>
                      ))}
                    </div>
                    {/* Preset grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                      {filteredPresets.map((preset) => {
                        const idx = ANIMATION_PRESETS.indexOf(preset);
                        const isActive = idx === activePresetIdx;
                        return (
                          <motion.button
                            key={`preset-${idx}`}
                            onClick={() => applyPreset(idx)}
                            className={`group flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                              isActive
                                ? 'border-emerald-500/40 bg-emerald-500/[0.08]'
                                : 'border-white/[0.04] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.04]'
                            }`}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {/* Mini preview */}
                            <div className="w-full h-12 rounded-md flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#141420] to-[#0f0f1a]">
                              <div
                                className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-cyan-400"
                                style={{
                                  animation: `${preset.name.toLowerCase().replace(/\s+/g, '-')}-mini ${preset.duration}s ${preset.timingFunction} ${preset.iterationCount} ${preset.direction} ${preset.fillMode}`,
                                }}
                              />
                              {/* Inject mini keyframes */}
                              <style>{`
                                @keyframes ${preset.name.toLowerCase().replace(/\s+/g, '-')}-mini {
                                  ${preset.keyframes.map((kf) => `${kf.percentage}% { ${Object.entries(kf.properties).map(([p, v]) => `${p}: ${v}`).join('; ')} }`).join('\n')}
                                }
                              `}</style>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] font-mono text-white/50 group-hover:text-white/70 transition-colors">{preset.name}</div>
                              <div className="text-[9px] font-mono text-white/20">{preset.category}</div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── CUSTOM BUILDER PANEL ── */
                <motion.div
                  key="custom-panel"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Keyframe Steps */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-emerald-400/70" />
                        <span className="text-xs font-mono text-white/50">Keyframes</span>
                        <span className="text-[10px] font-mono text-white/20">({customKeyframes.length}/8)</span>
                      </div>
                      <motion.button
                        onClick={addKeyframeStep}
                        disabled={customKeyframes.length >= 8}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                          customKeyframes.length >= 8
                            ? 'text-white/15 cursor-not-allowed'
                            : 'text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        whileTap={customKeyframes.length < 8 ? { scale: 0.95 } : undefined}
                      >
                        + Add
                      </motion.button>
                    </div>

                    {/* Interactive Timeline */}
                    <div className="px-4 py-3 border-b border-white/[0.04]">
                      <div className="relative h-8 flex items-center">
                        {/* Timeline track */}
                        <div className="absolute left-0 right-0 h-1 rounded-full bg-white/[0.06]">
                          {customKeyframes.map((kf) => (
                            <motion.button
                              key={`kf-dot-${kf.percentage}`}
                              onClick={() => selectKeyframe(customKeyframes.indexOf(kf))}
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 cursor-pointer transition-colors"
                              style={{
                                left: `${kf.percentage}%`,
                                borderColor: customKeyframes.indexOf(kf) === activeKeyframeIdx ? '#10b981' : 'rgba(255,255,255,0.2)',
                                backgroundColor: customKeyframes.indexOf(kf) === activeKeyframeIdx ? '#10b981' : 'transparent',
                              }}
                              whileHover={{ scale: 1.4 }}
                              whileTap={{ scale: 0.9 }}
                            />
                          ))}
                        </div>
                        {/* Percentage labels */}
                        <div className="absolute -bottom-1 left-0 right-0 flex justify-between pointer-events-none">
                          {[0, 25, 50, 75, 100].map((p) => (
                            <span key={`tl-label-${p}`} className="text-[8px] font-mono text-white/15">{p}%</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Keyframe list */}
                    <div className="p-3 space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                      {customKeyframes.map((kf, idx) => (
                        <motion.div
                          key={`kf-step-${idx}`}
                          layout
                          onClick={() => selectKeyframe(idx)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            idx === activeKeyframeIdx
                              ? 'bg-white/[0.06] border border-white/[0.08]'
                              : 'hover:bg-white/[0.03] border border-transparent'
                          }`}
                        >
                          {/* Percentage */}
                          <div className="w-10 text-[11px] font-mono text-emerald-400/80 tabular-nums">
                            {kf.percentage}%
                          </div>
                          {/* Properties preview */}
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-mono text-white/40 truncate">
                              {Object.entries(kf.properties).map(([p, v]) => `${p}: ${v}`).join('; ') || '(empty)'}
                            </div>
                          </div>
                          {/* Active indicator */}
                          {idx === activeKeyframeIdx && (
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"
                              layoutId="active-kf-dot"
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            />
                          )}
                          {/* Delete */}
                          {customKeyframes.length > 2 && (
                            <motion.button
                              onClick={(e) => { e.stopPropagation(); removeKeyframeStep(idx); }}
                              className="w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-red-400/80 hover:bg-red-500/10 transition-colors cursor-pointer"
                              whileTap={{ scale: 0.9 }}
                            >
                              <RotateCcw className="w-3 h-3" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Active Keyframe Editor */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <PenTool className="w-3.5 h-3.5 text-cyan-400/70" />
                      <span className="text-xs font-mono text-white/40">
                        Edit Keyframe @ <span className="text-emerald-400">{activeKeyframe.percentage}%</span>
                      </span>
                    </div>

                    {/* Percentage slider */}
                    <AnimSlider
                      label="Position"
                      value={activeKeyframe.percentage}
                      min={0} max={100} step={1} unit="%"
                      onChange={(v) => updateKeyframePercentage(activeKeyframeIdx, v)}
                    />

                    {/* Property selector */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Property</span>
                      <div className="flex flex-wrap gap-1">
                        {ANIM_PROPERTIES.map((prop) => (
                          <motion.button
                            key={`prop-${prop.value}`}
                            onClick={() => handlePropertyChange(prop.value)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                              editProperty === prop.value
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/35 hover:text-white/55 border border-transparent hover:border-white/[0.08]'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {prop.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Value input */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Value</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={applyEditValue}
                          onKeyDown={(e) => { if (e.key === 'Enter') applyEditValue(); }}
                          className="flex-1 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/70 outline-none focus:border-emerald-500/30 transition-colors"
                          placeholder="e.g., translateY(20px)"
                        />
                        <motion.button
                          onClick={applyEditValue}
                          className="px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                          whileTap={{ scale: 0.95 }}
                        >
                          Set
                        </motion.button>
                      </div>
                    </div>

                    {/* Current properties of this keyframe */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Applied Properties</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(activeKeyframe.properties).map(([prop, val]) => (
                          <div
                            key={`applied-${prop}`}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]"
                          >
                            <span className="text-[9px] font-mono text-cyan-400/70">{prop}:</span>
                            <span className="text-[9px] font-mono text-white/50">{val}</span>
                            <button
                              onClick={() => {
                                setCustomKeyframes((prev) => prev.map((kf, i) => {
                                  if (i !== activeKeyframeIdx) return kf;
                                  const newProps = { ...kf.properties };
                                  delete newProps[prop];
                                  return { ...kf, properties: newProps };
                                }));
                              }}
                              className="text-white/20 hover:text-red-400 transition-colors cursor-pointer ml-0.5"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {Object.keys(activeKeyframe.properties).length === 0 && (
                          <span className="text-[9px] font-mono text-white/15 italic">No properties set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Animation Settings */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Gauge className="w-3.5 h-3.5 text-amber-400/70" />
                      <span className="text-xs font-mono text-white/40">Animation Settings</span>
                    </div>

                    <AnimSlider label="Duration" value={customSettings.duration} min={0.1} max={10} step={0.1} unit="s" onChange={(v) => setCustomSettings((s) => ({ ...s, duration: v }))} />
                    <AnimSlider label="Delay" value={customSettings.delay} min={0} max={5} step={0.1} unit="s" onChange={(v) => setCustomSettings((s) => ({ ...s, delay: v }))} />

                    {/* Timing Function */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Timing</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {TIMING_FUNCTIONS.map((tf) => (
                          <motion.button
                            key={`tf-sel-${tf.name}`}
                            onClick={() => setCustomSettings((s) => ({ ...s, timingFunction: tf.name }))}
                            className={`px-2 py-1 rounded-md text-[9px] font-mono transition-colors cursor-pointer ${
                              customSettings.timingFunction === tf.name
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/30 hover:text-white/50 border border-transparent hover:border-white/[0.08]'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {tf.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Iteration */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Iteration</span>
                      <div className="flex gap-1">
                        {ITERATION_OPTIONS.map((opt) => (
                          <motion.button
                            key={`iter-${opt.value}`}
                            onClick={() => setCustomSettings((s) => ({ ...s, iterationCount: opt.value }))}
                            className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-mono text-center transition-colors cursor-pointer ${
                              customSettings.iterationCount === opt.value
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/30 hover:text-white/50 border border-transparent hover:border-white/[0.08]'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {opt.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Direction */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Direction</span>
                      <div className="flex gap-1">
                        {DIRECTION_OPTIONS.map((opt) => (
                          <motion.button
                            key={`dir-${opt.value}`}
                            onClick={() => setCustomSettings((s) => ({ ...s, direction: opt.value }))}
                            className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-mono text-center transition-colors cursor-pointer ${
                              customSettings.direction === opt.value
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/30 hover:text-white/50 border border-transparent hover:border-white/[0.08]'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {opt.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Fill Mode */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Fill Mode</span>
                      <div className="flex gap-1">
                        {FILL_MODE_OPTIONS.map((opt) => (
                          <motion.button
                            key={`fill-${opt.value}`}
                            onClick={() => setCustomSettings((s) => ({ ...s, fillMode: opt.value }))}
                            className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-mono text-center transition-colors cursor-pointer ${
                              customSettings.fillMode === opt.value
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/30 hover:text-white/50 border border-transparent hover:border-white/[0.08]'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {opt.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ──── RIGHT PANEL ──── */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Preview Panel */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              {/* VS Code chrome */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex items-center gap-1.5 ml-3">
                    <Eye className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] font-mono text-white/25">Live Preview</span>
                  </div>
                </div>
                {/* Shape selector */}
                <div className="flex items-center gap-1 p-0.5 rounded-md border border-white/[0.06] bg-white/[0.02]">
                  {(['square', 'circle', 'text', 'button'] as const).map((shape) => (
                    <motion.button
                      key={`shape-${shape}`}
                      onClick={() => { setPreviewShape(shape); setAnimKey((k) => k + 1); }}
                      className={`px-2 py-1 rounded text-[9px] font-mono transition-colors cursor-pointer capitalize ${
                        previewShape === shape ? 'text-white' : 'text-white/30 hover:text-white/50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {shape}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Preview area */}
              <div
                ref={previewRef}
                className="relative p-8 flex items-center justify-center"
                style={{ minHeight: '260px' }}
              >
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

                {/* Inject keyframes for preview */}
                <style>{currentCSS.keyframesCSS}</style>

                <div key={animKey} className="relative z-10">
                  <AnimatePresence mode="wait">
                    {previewShape === 'square' && (
                      <motion.div
                        key="prev-square"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400"
                          style={previewAnimStyle}
                        />
                      </motion.div>
                    )}
                    {previewShape === 'circle' && (
                      <motion.div
                        key="prev-circle"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400"
                          style={previewAnimStyle}
                        />
                      </motion.div>
                    )}
                    {previewShape === 'text' && (
                      <motion.div
                        key="prev-text"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="text-center"
                      >
                        <div
                          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent"
                          style={previewAnimStyle}
                        >
                          Hello World
                        </div>
                      </motion.div>
                    )}
                    {previewShape === 'button' && (
                      <motion.div
                        key="prev-button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-mono text-sm font-bold shadow-lg shadow-emerald-500/20"
                          style={previewAnimStyle}
                        >
                          Click Me
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </motion.button>
                  <motion.button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[10px] font-mono text-white/40 hover:text-white/70 hover:border-white/[0.15] transition-colors cursor-pointer"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </motion.button>
                </div>

                {/* Speed control */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/25">Speed</span>
                  <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-white/[0.06] bg-white/[0.02]">
                    {([0.25, 0.5, 1, 1.5, 2, 3] as const).map((speed) => (
                      <motion.button
                        key={`speed-${speed}`}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors cursor-pointer ${
                          playbackSpeed === speed ? 'text-emerald-400 bg-emerald-500/15' : 'text-white/25 hover:text-white/50'
                        }`}
                        whileTap={{ scale: 0.9 }}
                      >
                        {speed}x
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CSS Code Output */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400/70" />
                  <span className="text-[10px] font-mono text-white/25">Generated CSS</span>
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
                <pre className="text-xs font-mono leading-relaxed">
                  <code>
                    {highlightedLines.map((line) => (
                      <div key={`anim-code-${line.lineNum}`} className="flex">
                        <span className="text-white/10 w-6 text-right mr-4 select-none">{line.lineNum}</span>
                        <span>
                          {line.parts.map((part, pi) => (
                            <span key={`anim-code-${line.lineNum}-${pi}`} className={part.cls || ''}>{part.text}</span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Bar */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-10 text-[11px] font-mono text-white/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            {[
              { icon: Sparkles, text: '16 Presets' },
              { icon: PenTool, text: 'Custom Builder' },
              { icon: Eye, text: 'Live Preview' },
              { icon: Gauge, text: 'Speed Control' },
            ].map((item, i) => (
              <div key={`anim-info-${i}`} className="flex items-center gap-1.5">
                <item.icon className="w-3 h-3 text-emerald-500/30" />
                <span>{item.text}</span>
                {i < 3 && <span className="text-emerald-500/20 ml-4">/</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
