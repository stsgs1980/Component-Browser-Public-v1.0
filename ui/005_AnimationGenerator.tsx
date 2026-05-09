/**
 * AnimationGenerator — CSS Animation Keyframe Builder
 *
 * A reusable React component for building CSS @keyframes animations
 * with preset animations, a custom keyframe builder, timing function
 * visualization, and live preview with playback controls.
 *
 * @module 005_AnimationGenerator
 * @example
 * ```tsx
 * <AnimationGenerator
 *   labels={{ title: "Animation Builder" }}
 *   presets={myPresets}
 *   onAnimationChange={(css) => console.log(css)}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  useIsMounted,
  copyToClipboard,
  downloadFile,
  type GeneratorTheme,
  DEFAULT_THEME,
  IconCopy,
  IconCheck,
  IconDownload,
  ChromeHeader,
  CodeLine,
} from './shared';

// ─── Types ──────────────────────────────────────────────────────

export interface KeyframeStep {
  percentage: number;
  properties: Record<string, string>;
}

export interface AnimationPreset {
  name: string;
  category: string;
  keyframes: KeyframeStep[];
  duration: number;
  timingFunction: string;
  iterationCount: string;
  direction: string;
  fillMode: string;
}

export interface AnimationSettings {
  duration: number;
  timingFunction: string;
  iterationCount: string;
  direction: string;
  fillMode: string;
  delay: number;
}

export type PreviewShape = 'square' | 'circle' | 'text';
export type TabMode = 'presets' | 'custom';

export interface AnimationGeneratorLabels {
  title?: string;
  subtitle?: string;
  presets?: string;
  customBuilder?: string;
  all?: string;
  play?: string;
  pause?: string;
  reset?: string;
  export?: string;
  copied?: string;
  copy?: string;
  easing?: string;
  timingCurves?: string;
  keyframes?: string;
  properties?: string;
  duration?: string;
  delay?: string;
  direction?: string;
  fillMode?: string;
  iteration?: string;
  addKeyframe?: string;
  removeKeyframe?: string;
  property?: string;
  value?: string;
  apply?: string;
}

export interface AnimationGeneratorProps {
  /** Custom presets */
  presets?: AnimationPreset[];
  /** Available CSS properties for custom builder */
  animatableProperties?: { value: string; label: string }[];
  /** Labels */
  labels?: AnimationGeneratorLabels;
  /** Theme */
  theme?: Partial<GeneratorTheme>;
  /** Called when CSS code changes */
  onAnimationChange?: (css: string) => void;
  /** Additional CSS class */
  className?: string;
}

// ─── Defaults ───────────────────────────────────────────────────

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

const DEFAULT_ANIM_PROPERTIES = [
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

const DEFAULT_PRESETS: AnimationPreset[] = [
  { name: 'Fade In', category: 'Opacity', keyframes: [{ percentage: 0, properties: { opacity: '0' } }, { percentage: 100, properties: { opacity: '1' } }], duration: 1, timingFunction: 'ease-in', iterationCount: '1', direction: 'normal', fillMode: 'forwards' },
  { name: 'Fade Out', category: 'Opacity', keyframes: [{ percentage: 0, properties: { opacity: '1' } }, { percentage: 100, properties: { opacity: '0' } }], duration: 1, timingFunction: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards' },
  { name: 'Fade Up', category: 'Opacity', keyframes: [{ percentage: 0, properties: { opacity: '0', transform: 'translateY(20px)' } }, { percentage: 100, properties: { opacity: '1', transform: 'translateY(0)' } }], duration: 0.8, timingFunction: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards' },
  { name: 'Slide Left', category: 'Slide', keyframes: [{ percentage: 0, properties: { transform: 'translateX(100%)', opacity: '0' } }, { percentage: 100, properties: { transform: 'translateX(0)', opacity: '1' } }], duration: 0.6, timingFunction: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards' },
  { name: 'Slide Right', category: 'Slide', keyframes: [{ percentage: 0, properties: { transform: 'translateX(-100%)', opacity: '0' } }, { percentage: 100, properties: { transform: 'translateX(0)', opacity: '1' } }], duration: 0.6, timingFunction: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards' },
  { name: 'Bounce', category: 'Transform', keyframes: [{ percentage: 0, properties: { transform: 'translateY(0)' } }, { percentage: 20, properties: { transform: 'translateY(-30px)' } }, { percentage: 40, properties: { transform: 'translateY(0)' } }, { percentage: 50, properties: { transform: 'translateY(-15px)' } }, { percentage: 65, properties: { transform: 'translateY(0)' } }, { percentage: 75, properties: { transform: 'translateY(-7px)' } }, { percentage: 100, properties: { transform: 'translateY(0)' } }], duration: 1, timingFunction: 'ease', iterationCount: 'infinite', direction: 'normal', fillMode: 'none' },
  { name: 'Pulse', category: 'Transform', keyframes: [{ percentage: 0, properties: { transform: 'scale(1)' } }, { percentage: 50, properties: { transform: 'scale(1.05)' } }, { percentage: 100, properties: { transform: 'scale(1)' } }], duration: 1.5, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none' },
  { name: 'Heartbeat', category: 'Transform', keyframes: [{ percentage: 0, properties: { transform: 'scale(1)' } }, { percentage: 14, properties: { transform: 'scale(1.3)' } }, { percentage: 28, properties: { transform: 'scale(1)' } }, { percentage: 42, properties: { transform: 'scale(1.3)' } }, { percentage: 70, properties: { transform: 'scale(1)' } }], duration: 1.3, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none' },
  { name: 'Spin', category: 'Transform', keyframes: [{ percentage: 0, properties: { transform: 'rotate(0deg)' } }, { percentage: 100, properties: { transform: 'rotate(360deg)' } }], duration: 1, timingFunction: 'linear', iterationCount: 'infinite', direction: 'normal', fillMode: 'none' },
  { name: 'Flip', category: 'Transform', keyframes: [{ percentage: 0, properties: { transform: 'perspective(400px) rotateY(0)' } }, { percentage: 100, properties: { transform: 'perspective(400px) rotateY(360deg)' } }], duration: 1, timingFunction: 'ease-in-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards' },
  { name: 'Scale Up', category: 'Transform', keyframes: [{ percentage: 0, properties: { transform: 'scale(0.3)', opacity: '0' } }, { percentage: 50, properties: { transform: 'scale(1.05)' } }, { percentage: 70, properties: { transform: 'scale(0.9)' } }, { percentage: 100, properties: { transform: 'scale(1)', opacity: '1' } }], duration: 0.6, timingFunction: 'ease', iterationCount: '1', direction: 'normal', fillMode: 'forwards' },
  { name: 'Shake', category: 'Transform', keyframes: [{ percentage: 0, properties: { transform: 'translateX(0)' } }, { percentage: 10, properties: { transform: 'translateX(-10px)' } }, { percentage: 20, properties: { transform: 'translateX(10px)' } }, { percentage: 30, properties: { transform: 'translateX(-10px)' } }, { percentage: 40, properties: { transform: 'translateX(10px)' } }, { percentage: 50, properties: { transform: 'translateX(-5px)' } }, { percentage: 60, properties: { transform: 'translateX(5px)' } }, { percentage: 70, properties: { transform: 'translateX(-5px)' } }, { percentage: 80, properties: { transform: 'translateX(5px)' } }, { percentage: 90, properties: { transform: 'translateX(-2px)' } }, { percentage: 100, properties: { transform: 'translateX(0)' } }], duration: 0.6, timingFunction: 'ease', iterationCount: '1', direction: 'normal', fillMode: 'none' },
  { name: 'Wiggle', category: 'Transform', keyframes: [{ percentage: 0, properties: { transform: 'rotate(0deg)' } }, { percentage: 25, properties: { transform: 'rotate(5deg)' } }, { percentage: 50, properties: { transform: 'rotate(-5deg)' } }, { percentage: 75, properties: { transform: 'rotate(3deg)' } }, { percentage: 100, properties: { transform: 'rotate(0deg)' } }], duration: 0.8, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none' },
  { name: 'Glow Pulse', category: 'Effects', keyframes: [{ percentage: 0, properties: { 'box-shadow': '0 0 5px rgba(212, 160, 23, 0.3)' } }, { percentage: 50, properties: { 'box-shadow': '0 0 20px rgba(212, 160, 23, 0.6), 0 0 40px rgba(184, 134, 11, 0.3)' } }, { percentage: 100, properties: { 'box-shadow': '0 0 5px rgba(212, 160, 23, 0.3)' } }], duration: 2, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none' },
  { name: 'Float', category: 'Effects', keyframes: [{ percentage: 0, properties: { transform: 'translateY(0px)' } }, { percentage: 50, properties: { transform: 'translateY(-12px)' } }, { percentage: 100, properties: { transform: 'translateY(0px)' } }], duration: 3, timingFunction: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none' },
  { name: 'Typewriter', category: 'Effects', keyframes: [{ percentage: 0, properties: { width: '0' } }, { percentage: 50, properties: { width: '100%' } }, { percentage: 100, properties: { width: '100%' } }], duration: 2, timingFunction: 'steps(20)', iterationCount: 'infinite', direction: 'normal', fillMode: 'none' },
];

const DEFAULT_LABELS: Required<AnimationGeneratorLabels> = {
  title: 'Animation Lab',
  subtitle: 'Build CSS @keyframes animations with live preview and export',
  presets: 'Presets',
  customBuilder: 'Custom Builder',
  all: 'All',
  play: 'Play',
  pause: 'Pause',
  reset: 'Reset',
  export: 'Export',
  copied: 'Copied!',
  copy: 'Copy',
  easing: 'Easing',
  timingCurves: 'Timing Function Curves',
  keyframes: 'Keyframes',
  properties: 'Properties',
  duration: 'Duration',
  delay: 'Delay',
  direction: 'Direction',
  fillMode: 'Fill Mode',
  iteration: 'Iteration',
  addKeyframe: '+ Step',
  removeKeyframe: '✕',
  property: 'Property',
  value: 'Value',
  apply: 'Apply',
};

// ─── Helpers ────────────────────────────────────────────────────

function createDefaultCustom(): { keyframes: KeyframeStep[]; settings: AnimationSettings } {
  return {
    keyframes: [
      { percentage: 0, properties: { transform: 'translateY(0)', opacity: '1' } },
      { percentage: 50, properties: { transform: 'translateY(-20px)', opacity: '0.5' } },
      { percentage: 100, properties: { transform: 'translateY(0)', opacity: '1' } },
    ],
    settings: {
      duration: 1.5, timingFunction: 'ease-in-out',
      iterationCount: 'infinite', direction: 'normal', fillMode: 'none', delay: 0,
    },
  };
}

export function generateKeyframesCSS(name: string, keyframes: KeyframeStep[]): string {
  const sorted = [...keyframes].sort((a, b) => a.percentage - b.percentage);
  const lines = sorted.map((kf) => {
    const props = Object.entries(kf.properties).map(([prop, val]) => `    ${prop}: ${val};`).join('\n');
    return `  ${kf.percentage}% {\n${props}\n  }`;
  }).join('\n');
  return `@keyframes ${name} {\n${lines}\n}`;
}

export function generateAnimationCSS(name: string, settings: AnimationSettings): string {
  const parts = [
    `animation-name: ${name}`,
    `animation-duration: ${settings.duration}s`,
    `animation-timing-function: ${settings.timingFunction}`,
    `animation-iteration-count: ${settings.iterationCount}`,
    `animation-direction: ${settings.direction}`,
    `animation-fill-mode: ${settings.fillMode}`,
  ];
  if (settings.delay > 0) parts.push(`animation-delay: ${settings.delay}s`);
  return parts.join(';\n') + ';';
}

export function generateFullCSS(preset: AnimationPreset): string {
  const name = preset.name.toLowerCase().replace(/\s+/g, '-');
  const kf = generateKeyframesCSS(name, preset.keyframes);
  const anim = generateAnimationCSS(name, preset.settings ??
    { duration: preset.duration, timingFunction: preset.timingFunction, iterationCount: preset.iterationCount, direction: preset.direction, fillMode: preset.fillMode, delay: 0 });
  return `${kf}\n\n.element {\n  ${anim}\n}`;
}

function timingToSVGPath(name: string): string {
  const w = 80, h = 50;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    let y: number;
    switch (name) {
      case 'linear': y = t; break;
      case 'ease': y = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; break;
      case 'ease-in': y = t * t * t; break;
      case 'ease-out': y = 1 - Math.pow(1 - t, 3); break;
      case 'ease-in-out': y = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; break;
      default: y = t;
    }
    pts.push([t * w, h - y * h]);
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
}

// ─── Main Component ─────────────────────────────────────────────

/**
 * AnimationGenerator — CSS Animation Keyframe Builder
 *
 * Build CSS @keyframes animations with presets, custom keyframe editor,
 * timing function visualization, and live preview.
 */
export function AnimationGenerator({
  presets = DEFAULT_PRESETS,
  animatableProperties = DEFAULT_ANIM_PROPERTIES,
  labels: labelOverrides,
  theme: themeOverrides,
  onAnimationChange,
  className,
}: AnimationGeneratorProps) {
  const mounted = useIsMounted();
  const t = useMemo(() => ({ ...DEFAULT_THEME, ...themeOverrides }), [themeOverrides]);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);

  const [tabMode, setTabMode] = useState<TabMode>('presets');
  const [activePresetIdx, setActivePresetIdx] = useState(0);
  const [presetCategory, setPresetCategory] = useState('all');

  const [customKeyframes, setCustomKeyframes] = useState(createDefaultCustom().keyframes);
  const [customSettings, setCustomSettings] = useState(createDefaultCustom().settings);
  const [activeKeyframeIdx, setActiveKeyframeIdx] = useState(0);
  const [editProperty, setEditProperty] = useState('transform');
  const [editValue, setEditValue] = useState('translateY(0)');

  const [previewShape] = useState<PreviewShape>('square');
  const [isPlaying, setIsPlaying] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showEasing, setShowEasing] = useState(false);

  const activePreset = presets[activePresetIdx];
  const activeKeyframe = customKeyframes[activeKeyframeIdx] || customKeyframes[0];

  const categories = useMemo(() => {
    const cats = new Set(presets.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [presets]);

  const filteredPresets = useMemo(() => {
    if (presetCategory === 'all') return presets;
    return presets.filter((p) => p.category === presetCategory);
  }, [presetCategory, presets]);

  const currentCSS = useMemo(() => {
    if (tabMode === 'presets') {
      return generateFullCSS(activePreset);
    }
    const name = 'custom-anim';
    const kf = generateKeyframesCSS(name, customKeyframes);
    const anim = generateAnimationCSS(name, customSettings);
    return `${kf}\n\n.element {\n  ${anim}\n}`;
  }, [tabMode, activePreset, customKeyframes, customSettings]);

  useMemo(() => { onAnimationChange?.(currentCSS); }, [currentCSS, onAnimationChange]);

  const previewAnimName = useMemo(() => {
    if (tabMode === 'presets') return activePreset.name.toLowerCase().replace(/\s+/g, '-');
    return 'custom-anim';
  }, [tabMode, activePreset]);

  const previewDuration = useMemo(() => {
    if (tabMode === 'presets') return activePreset.duration;
    return customSettings.duration;
  }, [tabMode, activePreset, customSettings]);

  const previewTimingFn = useMemo(() => {
    if (tabMode === 'presets') return activePreset.timingFunction;
    return customSettings.timingFunction;
  }, [tabMode, activePreset, customSettings]);

  const previewIteration = useMemo(() => {
    if (tabMode === 'presets') return activePreset.iterationCount;
    return customSettings.iterationCount;
  }, [tabMode, activePreset, customSettings]);

  const handlePlay = useCallback(() => { setIsPlaying(true); setAnimKey((k) => k + 1); }, []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setAnimKey((k) => k + 1);
    setTimeout(() => setIsPlaying(true), 50);
  }, []);

  const copyCode = useCallback(async () => {
    await copyToClipboard(currentCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentCSS]);

  const exportCSS = useCallback(() => downloadFile(currentCSS, 'animation.css', 'text/css'), [currentCSS]);

  const applyPreset = useCallback((idx: number) => {
    setActivePresetIdx(idx);
    setIsPlaying(true);
    setAnimKey((k) => k + 1);
  }, []);

  const addKeyframeStep = useCallback(() => {
    setCustomKeyframes((prev) => {
      const pcts = prev.map((k) => k.percentage);
      let newPct = 50;
      for (let p = 10; p <= 90; p += 10) { if (!pcts.includes(p)) { newPct = p; break; } }
      return [...prev, { percentage: newPct, properties: {} }].sort((a, b) => a.percentage - b.percentage);
    });
    setActiveKeyframeIdx((prev) => Math.min(prev + 1, customKeyframes.length));
  }, [customKeyframes.length]);

  const removeKeyframeStep = useCallback((idx: number) => {
    if (customKeyframes.length <= 2) return;
    setCustomKeyframes((prev) => prev.filter((_, i) => i !== idx));
    setActiveKeyframeIdx((prev) => Math.min(prev, customKeyframes.length - 2));
  }, [customKeyframes.length]);

  const updateKeyframeProperty = useCallback((kfIdx: number, prop: string, value: string) => {
    setCustomKeyframes((prev) => prev.map((kf, i) => i !== kfIdx ? kf : { ...kf, properties: { ...kf.properties, [prop]: value } }));
  }, []);

  const updateKeyframePercentage = useCallback((kfIdx: number, pct: number) => {
    setCustomKeyframes((prev) => prev.map((kf, i) => i !== kfIdx ? kf : { ...kf, percentage: pct }).sort((a, b) => a.percentage - b.percentage));
  }, []);

  const selectKeyframe = useCallback((idx: number) => {
    setActiveKeyframeIdx(idx);
    const kf = customKeyframes[idx];
    if (kf) {
      const firstProp = Object.keys(kf.properties)[0] || 'transform';
      setEditProperty(firstProp);
      setEditValue(kf.properties[firstProp] || '');
    }
  }, [customKeyframes]);

  const applyEditValue = useCallback(() => {
    if (editValue.trim()) updateKeyframeProperty(activeKeyframeIdx, editProperty, editValue.trim());
  }, [editValue, editProperty, activeKeyframeIdx, updateKeyframeProperty]);

  if (!mounted) return null;

  return (
    <div className={className}>
      {/* Inline keyframes for preview */}
      <style>{`
        ${tabMode === 'presets'
          ? presets.map((p) => {
            const n = p.name.toLowerCase().replace(/\s+/g, '-');
            return `@keyframes ${n} { ${p.keyframes.map((kf) => `${kf.percentage}% { ${Object.entries(kf.properties).map(([pr, v]) => `${pr}: ${v}`).join('; ')} }`).join('\n')} }`;
          }).join('\n')
          : `@keyframes custom-anim { ${customKeyframes.map((kf) => `${kf.percentage}% { ${Object.entries(kf.properties).map(([pr, v]) => `${pr}: ${v}`).join('; ')} }`).join('\n')} }`
        }
      `}</style>

      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
          style={{ borderColor: `${t.accent}33`, backgroundColor: `${t.accent}1a` }}>
          <span style={{ color: t.accent }}>🎬</span>
          <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: t.accent }}>Animation Tool</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3"
          style={{
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary}, ${t.accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
          {labels.title}
        </h2>
        <p className="font-mono text-sm max-w-md mx-auto" style={{ color: `${t.textMuted}b3` }}>{labels.subtitle}</p>
      </div>

      {/* Tab toggle + toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: t.surface, borderColor: t.border }}>
          {(['presets', 'custom'] as const).map((m) => (
            <button key={m} onClick={() => { setTabMode(m); setIsPlaying(true); setAnimKey((k) => k + 1); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              style={{
                color: tabMode === m ? '#1a1a1a' : t.textMuted,
                backgroundColor: tabMode === m ? t.surface : 'transparent',
                border: tabMode === m ? `1px solid ${t.border}` : '1px solid transparent',
              }}>
              <span>{m === 'presets' ? '✦' : '✏'}</span>
              <span>{m === 'presets' ? labels.presets : labels.customBuilder}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEasing((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-colors"
            style={{
              borderColor: showEasing ? `${t.accentSecondary}4d` : t.border,
              backgroundColor: showEasing ? `${t.accentSecondary}1a` : t.surface,
              color: showEasing ? t.accentSecondary : `${t.textMuted}b3`,
            }}>
            ⚡ {labels.easing}
          </button>
          <button onClick={exportCSS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-colors"
            style={{ backgroundColor: t.surface, borderColor: t.border, color: `${t.textMuted}b3` }}>
            <IconDownload size={12} /> {labels.export}
          </button>
        </div>
      </div>

      {/* Easing Visualizer */}
      {showEasing && (
        <div className="mb-6 rounded-xl border p-4" style={{ borderColor: t.border, backgroundColor: t.surface }}>
          <div className="flex items-center gap-2 mb-3">
            <span>⚡</span>
            <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>{labels.timingCurves}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIMING_FUNCTIONS.map((tf) => {
              const isActive = tabMode === 'custom'
                ? customSettings.timingFunction === tf.name
                : activePreset.timingFunction === tf.name;
              return (
                <button key={tf.name} onClick={() => {
                  if (tabMode === 'custom') setCustomSettings((s) => ({ ...s, timingFunction: tf.name }));
                }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-colors cursor-pointer"
                  style={{
                    borderColor: isActive ? `${t.accent}66` : t.border,
                    backgroundColor: isActive ? `${t.accent}1a` : t.surface,
                  }}>
                  <svg width={80} height={50} className="opacity-80">
                    <line x1={0} y1={50} x2={80} y2={50} stroke="rgba(26,26,26,0.15)" strokeWidth={0.5} />
                    <line x1={0} y1={0} x2={0} y2={50} stroke="rgba(26,26,26,0.15)" strokeWidth={0.5} />
                    <line x1={0} y1={50} x2={80} y2={0} stroke="rgba(26,26,26,0.1)" strokeWidth={0.5} strokeDasharray="3,3" />
                    <path d={timingToSVGPath(tf.name)} fill="none" stroke={isActive ? t.accent : t.accentSecondary} strokeWidth={2} strokeLinecap="round" />
                    <circle cx={78} cy={1} r={2.5} fill={isActive ? t.accent : t.accentSecondary} />
                  </svg>
                  <span className="text-[9px] font-mono" style={{ color: t.textMuted }}>{tf.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-5">
          {tabMode === 'presets' ? (
            <div className="space-y-4">
              {/* Category filter */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: t.border }}>
                  <span style={{ color: t.accent }}>✦</span>
                  <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>Preset Animations</span>
                  <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}80` }}>({filteredPresets.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 border-b" style={{ borderColor: t.border }}>
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setPresetCategory(cat)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-mono cursor-pointer transition-colors"
                      style={{
                        color: presetCategory === cat ? t.accent : `${t.textMuted}99`,
                        border: `1px solid ${presetCategory === cat ? `${t.accent}4d` : 'transparent'}`,
                        backgroundColor: presetCategory === cat ? `${t.accent}26` : 'transparent',
                      }}>
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 max-h-[420px] overflow-y-auto">
                  {filteredPresets.map((preset) => {
                    const idx = presets.indexOf(preset);
                    const isActive = idx === activePresetIdx;
                    const kfName = preset.name.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <button key={idx} onClick={() => applyPreset(idx)}
                        className="group flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer"
                        style={{
                          borderColor: isActive ? `${t.accent}66` : t.border,
                          backgroundColor: isActive ? `${t.accent}1a` : t.surface,
                        }}>
                        <div className="w-full h-12 rounded-md flex items-center justify-center overflow-hidden"
                          style={{ background: 'linear-gradient(to bottom right, #3d3828, #2a2518)' }}>
                          <div className="w-6 h-6 rounded"
                            style={{
                              background: `linear-gradient(to bottom right, ${t.accent}, ${t.accentSecondary})`,
                              animation: `${kfName}-mini ${preset.duration}s ${preset.timingFunction} ${preset.iterationCount} ${preset.direction} ${preset.fillMode}`,
                            }} />
                          <style>{`
                            @keyframes ${kfName}-mini {
                              ${preset.keyframes.map((kf) => `${kf.percentage}% { ${Object.entries(kf.properties).map(([p, v]) => `${p}: ${v}`).join('; ')} }`).join('\n')}
                            }
                          `}</style>
                        </div>
                        <span className="text-[9px] font-mono text-center" style={{ color: isActive ? t.accent : `${t.textMuted}b3` }}>
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Custom builder */
            <div className="space-y-4">
              {/* Keyframe steps */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: t.border }}>
                  <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>{labels.keyframes}</span>
                  <button onClick={addKeyframeStep} disabled={customKeyframes.length >= 8}
                    className="text-[11px] font-mono cursor-pointer disabled:opacity-30" style={{ color: t.accent }}>
                    {labels.addKeyframe}
                  </button>
                </div>
                <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                  {customKeyframes.map((kf, i) => (
                    <div key={i}
                      onClick={() => selectKeyframe(i)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      style={{
                        backgroundColor: activeKeyframeIdx === i ? t.surface : 'transparent',
                        border: `1px solid ${activeKeyframeIdx === i ? t.border : 'transparent'}`,
                      }}>
                      <span className="text-[11px] font-mono font-bold" style={{ color: t.accent }}>{kf.percentage}%</span>
                      <span className="text-[10px] font-mono truncate" style={{ color: `${t.textMuted}99` }}>
                        {Object.entries(kf.properties).map(([p, v]) => `${p}: ${v}`).join('; ') || '—'}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); removeKeyframeStep(i); }}
                        className="ml-auto text-[10px] cursor-pointer" style={{ color: `${t.textMuted}80` }}>
                        {labels.removeKeyframe}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit keyframe */}
              {activeKeyframe && (
                <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: t.border, backgroundColor: t.surface }}>
                  <span className="text-xs font-mono" style={{ color: t.textMuted }}>Step {activeKeyframe.percentage}%</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}80` }}>{labels.property}</span>
                    <select value={editProperty} onChange={(e) => setEditProperty(e.target.value)}
                      className="flex-1 px-2 py-1 rounded-lg border font-mono text-xs outline-none"
                      style={{ backgroundColor: t.surface, borderColor: t.border, color: `${t.textMuted}e6` }}>
                      {animatableProperties.map((prop) => (
                        <option key={prop.value} value={prop.value}>{prop.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}80` }}>{labels.value}</span>
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') applyEditValue(); }}
                      className="flex-1 px-2 py-1 rounded-lg border font-mono text-xs outline-none"
                      style={{ backgroundColor: t.surface, borderColor: t.border, color: `${t.textMuted}e6` }} />
                    <button onClick={applyEditValue}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono cursor-pointer"
                      style={{ backgroundColor: `${t.accent}1a`, color: t.accent, border: `1px solid ${t.accent}4d` }}>
                      {labels.apply}
                    </button>
                  </div>
                </div>
              )}

              {/* Animation settings */}
              <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: t.border, backgroundColor: t.surface }}>
                <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>Settings</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono" style={{ color: t.textMuted }}>{labels.duration}</span>
                    <span className="text-[11px] font-mono" style={{ color: t.accent }}>{customSettings.duration}s</span>
                  </div>
                  <input type="range" min={0.1} max={10} step={0.1} value={customSettings.duration}
                    onChange={(e) => setCustomSettings((s) => ({ ...s, duration: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${t.accent}, ${t.accentSecondary})` }} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono" style={{ color: t.textMuted }}>{labels.delay}</span>
                    <span className="text-[11px] font-mono" style={{ color: t.accent }}>{customSettings.delay}s</span>
                  </div>
                  <input type="range" min={0} max={5} step={0.1} value={customSettings.delay}
                    onChange={(e) => setCustomSettings((s) => ({ ...s, delay: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${t.accent}4d, ${t.accentSecondary}4d)` }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono block mb-1" style={{ color: `${t.textMuted}80` }}>{labels.direction}</span>
                    <select value={customSettings.direction}
                      onChange={(e) => setCustomSettings((s) => ({ ...s, direction: e.target.value }))}
                      className="w-full px-2 py-1 rounded-lg border font-mono text-xs outline-none"
                      style={{ backgroundColor: t.surface, borderColor: t.border, color: `${t.textMuted}e6` }}>
                      {DIRECTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono block mb-1" style={{ color: `${t.textMuted}80` }}>{labels.iteration}</span>
                    <select value={customSettings.iterationCount}
                      onChange={(e) => setCustomSettings((s) => ({ ...s, iterationCount: e.target.value }))}
                      className="w-full px-2 py-1 rounded-lg border font-mono text-xs outline-none"
                      style={{ backgroundColor: t.surface, borderColor: t.border, color: `${t.textMuted}e6` }}>
                      {ITERATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview + Code */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: t.border }}>
              <div className="flex items-center gap-2">
                <IconEye size={14} style={{ color: `${t.textMuted}b3` }} />
                <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}66` }}>Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePlay} className="p-1.5 rounded cursor-pointer transition-colors" style={{ color: t.accent }} title={labels.play}>▶</button>
                <button onClick={handlePause} className="p-1.5 rounded cursor-pointer transition-colors" style={{ color: t.textMuted }} title={labels.pause}>⏸</button>
                <button onClick={handleReset} className="p-1.5 rounded cursor-pointer transition-colors" style={{ color: t.textMuted }} title={labels.reset}>↻</button>
              </div>
            </div>
            <div className="p-8 flex items-center justify-center" style={{ minHeight: '200px', background: 'linear-gradient(to bottom right, #0f1117, #1a1a2e)' }}>
              {previewShape === 'square' || previewShape === 'circle' ? (
                <div key={animKey}
                  style={{
                    width: 80, height: 80,
                    borderRadius: previewShape === 'circle' ? '50%' : 8,
                    background: `linear-gradient(to bottom right, ${t.accent}, ${t.accentSecondary})`,
                    animation: isPlaying ? `${previewAnimName} ${previewDuration}s ${previewTimingFn} ${previewIteration} normal none` : 'none',
                  }}
                />
              ) : (
                <div key={animKey}
                  style={{
                    fontSize: 24, fontWeight: 'bold', color: '#1a1a1a',
                    animation: isPlaying ? `${previewAnimName} ${previewDuration}s ${previewTimingFn} ${previewIteration} normal none` : 'none',
                  }}>
                  Abc
                </div>
              )}
            </div>
          </div>

          {/* Code */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: t.border, backgroundColor: t.surface }}>
              <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}66` }}>Generated CSS</span>
              <button onClick={copyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono border cursor-pointer"
                style={{ backgroundColor: t.surface, borderColor: t.border, color: copied ? t.accent : t.textMuted }}>
                {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                {copied ? labels.copied : labels.copy}
              </button>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono leading-relaxed" style={{ color: '#f8f8f2' }}>
                {currentCSS.split('\n').map((line, i) => (
                  <CodeLine key={i} lineNum={i + 1}>
                    <span style={{
                      color: line.includes('@keyframes') ? '#ff7b72'
                        : line.includes('{') || line.includes('}') ? '#c9d1d9'
                        : line.includes('animation-') ? '#d2a8ff'
                        : line.includes('/*') ? '#8b949e'
                        : '#a5d6ff',
                    }}>
                      {line}
                    </span>
                  </CodeLine>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimationGenerator;
