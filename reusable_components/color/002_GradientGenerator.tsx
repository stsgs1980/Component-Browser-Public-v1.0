/**
 * GradientGenerator — CSS Gradient Builder
 *
 * A reusable React component for building CSS gradients with
 * color stop management, angle control, presets, and export
 * to CSS, Tailwind, or SVG format.
 *
 * @module 002_GradientGenerator
 * @example
 * ```tsx
 * <GradientGenerator
 *   initialStops={['#d4a017', '#b8860b', '#6b6356']}
 *   labels={{ title: "Gradient Builder" }}
 *   presets={myPresets}
 *   onGradientChange={(css) => console.log(css)}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  useIsMounted,
  hslToHex,
  copyToClipboard,
  downloadFile,
  type GeneratorTheme,
  DEFAULT_THEME,
  nextId,
  IconCopy,
  IconCheck,
  IconShuffle,
  IconDownload,
  IconEye,
  IconPalette,
  ChromeHeader,
  CodeLine,
  highlightColors,
} from './shared';

// ─── Types ──────────────────────────────────────────────────────

export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-100
}

export type GradientType = 'linear' | 'radial' | 'conic';
export type GradientExportFormat = 'css' | 'tailwind' | 'svg';

export interface GradientPreset {
  name: string;
  colors: string[];
  type: GradientType;
  angle?: number;
}

export interface GradientGeneratorLabels {
  title?: string;
  subtitle?: string;
  gradientType?: string;
  angle?: string;
  colorStops?: string;
  add?: string;
  presets?: string;
  random?: string;
  preview?: string;
  export?: string;
  copied?: string;
  copy?: string;
  position?: string;
}

export interface GradientGeneratorProps {
  /** Initial color stops (hex strings) */
  initialStops?: string[];
  /** Initial gradient type */
  initialType?: GradientType;
  /** Initial angle (degrees) */
  initialAngle?: number;
  /** Maximum number of color stops (default: 4) */
  maxStops?: number;
  /** Custom presets */
  presets?: GradientPreset[];
  /** Labels */
  labels?: GradientGeneratorLabels;
  /** Theme */
  theme?: Partial<GeneratorTheme>;
  /** Called when gradient CSS changes */
  onGradientChange?: (css: string) => void;
  /** Additional CSS class */
  className?: string;
}

// ─── Defaults ───────────────────────────────────────────────────

const DEFAULT_PRESETS: GradientPreset[] = [
  { name: 'Sunset', colors: ['#ff6b35', '#f7c948', '#ff006e', '#8338ec'], type: 'linear', angle: 135 },
  { name: 'Ocean', colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'], type: 'linear', angle: 180 },
  { name: 'Aurora', colors: ['#00f5d4', '#00bbf9', '#9b5de5', '#f15bb5'], type: 'linear', angle: 135 },
  { name: 'Neon', colors: ['#ff00ff', '#00ffff', '#ff00ff'], type: 'linear', angle: 90 },
  { name: 'Forest', colors: ['#2d6a4f', '#40916c', '#52b788', '#95d5b2'], type: 'linear', angle: 160 },
  { name: 'Lavender', colors: ['#e0aaff', '#c77dff', '#9d4edd', '#7b2cbf'], type: 'linear', angle: 135 },
  { name: 'Peach', colors: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec'], type: 'radial' },
  { name: 'Midnight', colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9'], type: 'linear', angle: 180 },
];

const DEFAULT_LABELS: Required<GradientGeneratorLabels> = {
  title: 'Gradient Lab',
  subtitle: 'Create, customize, and export beautiful gradients',
  gradientType: 'Gradient Type',
  angle: 'Angle',
  colorStops: 'Color Stops',
  add: 'Add',
  presets: 'Presets',
  random: 'Random',
  preview: 'Preview',
  export: 'Export',
  copied: 'Copied!',
  copy: 'Copy',
  position: 'Position',
};

// ─── Helpers ────────────────────────────────────────────────────

let _stopId = 0;
function createStop(color: string, position: number): ColorStop {
  return { id: `stop-${++_stopId}-${Date.now()}`, color, position };
}

function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const sat = 60 + Math.floor(Math.random() * 40);
  const light = 45 + Math.floor(Math.random() * 25);
  return hslToHex(hue, sat, light);
}

function generateRandomGradient(): { colors: string[]; type: GradientType; angle: number } {
  const types: GradientType[] = ['linear', 'radial', 'conic'];
  const type = types[Math.floor(Math.random() * 3)];
  const count = 2 + Math.floor(Math.random() * 3);
  const colors: string[] = [];
  for (let i = 0; i < count; i++) colors.push(generateRandomColor());
  return { colors, type, angle: Math.floor(Math.random() * 360) };
}

export function buildGradientCSS(stops: ColorStop[], type: GradientType, angle: number): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const colorString = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
  switch (type) {
    case 'linear': return `linear-gradient(${angle}deg, ${colorString})`;
    case 'radial': return `radial-gradient(circle, ${colorString})`;
    case 'conic': return `conic-gradient(from ${angle}deg, ${colorString})`;
  }
}

export function buildTailwindClass(stops: ColorStop[], type: GradientType, angle: number): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const colorString = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
  switch (type) {
    case 'linear': return `bg-[linear-gradient(${angle}deg,${colorString})]`;
    case 'radial': return `bg-[radial-gradient(circle,${colorString})]`;
    case 'conic': return `bg-[conic-gradient(from_${angle}deg,${colorString})]`;
  }
}

export function buildSVGCode(stops: ColorStop[], type: GradientType, angle: number): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const id = type === 'linear' ? 'linearGrad' : type === 'radial' ? 'radialGrad' : 'conicGrad';

  let defs = '';
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
    defs = `  <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">`;
  }

  const stopElements = sorted.map((s) => `    <stop offset="${s.position}%" stop-color="${s.color}" />`).join('\n');
  const tag = type === 'radial' ? 'radialGradient' : 'linearGradient';

  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
${defs}
${stopElements}
  </${tag}>
  </defs>
  <rect width="400" height="300" fill="url(#${id})" />
</svg>`;
}

// ─── Sub-components ─────────────────────────────────────────────

function ColorStopEditor({
  stop,
  index,
  total,
  onUpdate,
  onRemove,
  theme,
  labels,
}: {
  stop: ColorStop;
  index: number;
  total: number;
  onUpdate: (updated: ColorStop) => void;
  onRemove: () => void;
  theme: GeneratorTheme;
  labels: Required<GradientGeneratorLabels>;
}) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border group"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {/* Color picker */}
      <div className="relative shrink-0">
        <input
          type="color"
          value={stop.color}
          onChange={(e) => onUpdate({ ...stop, color: e.target.value })}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
          style={{ borderColor: theme.border }}
          aria-label={`Color for stop ${index + 1}`}
        />
        <span className="font-mono text-[10px] block text-center mt-0.5" style={{ color: theme.textMuted }}>
          {stop.color}
        </span>
      </div>

      {/* Position slider */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px]" style={{ color: `${theme.textMuted}b3` }}>
            {labels.position}
          </span>
          <span className="font-mono text-[10px]" style={{ color: theme.accent }}>
            {stop.position}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={stop.position}
          onChange={(e) => onUpdate({ ...stop, position: Number(e.target.value) })}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, ${stop.color}00 0%, ${stop.color} ${stop.position}%, rgba(26,26,26,0.1) ${stop.position}%)`,
          }}
          aria-label={`Position for stop ${index + 1}`}
        />
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        disabled={total <= 2}
        className="p-1.5 rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        style={{ color: theme.danger }}
        aria-label={`Remove color stop ${index + 1}`}
      >
        ✕
      </button>
    </div>
  );
}

function PresetButton({
  preset,
  onClick,
  theme,
}: {
  preset: GradientPreset;
  onClick: (preset: GradientPreset) => void;
  theme: GeneratorTheme;
}) {
  const gradientStr = preset.colors.map((c, i) => `${c} ${(i / (preset.colors.length - 1)) * 100}%`).join(', ');
  const bgStyle = preset.type === 'radial'
    ? `radial-gradient(circle, ${gradientStr})`
    : preset.type === 'conic'
      ? `conic-gradient(from 0deg, ${gradientStr})`
      : `linear-gradient(90deg, ${gradientStr})`;

  return (
    <button
      onClick={() => onClick(preset)}
      className="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-0 p-0 transition-transform hover:scale-105"
    >
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border shadow-lg"
        style={{ background: bgStyle, borderColor: theme.border }}
      />
      <span className="font-mono text-[10px] sm:text-xs transition-colors" style={{ color: theme.textMuted }}>
        {preset.name}
      </span>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────

/**
 * GradientGenerator — CSS Gradient Builder
 *
 * Create, customize, and export CSS gradients with color stop management,
 * angle control, presets, and multi-format export.
 */
export function GradientGenerator({
  initialStops = ['#d4a017', '#b8860b', '#6b6356'],
  initialType = 'linear',
  initialAngle = 135,
  maxStops = 4,
  presets = DEFAULT_PRESETS,
  labels: labelOverrides,
  theme: themeOverrides,
  onGradientChange,
  className,
}: GradientGeneratorProps) {
  const mounted = useIsMounted();
  const t = useMemo(() => ({ ...DEFAULT_THEME, ...themeOverrides }), [themeOverrides]);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);

  const [stops, setStops] = useState<ColorStop[]>(() =>
    initialStops.map((color, i) => createStop(color, Math.round((i / (initialStops.length - 1)) * 100)))
  );
  const [gradientType, setGradientType] = useState<GradientType>(initialType);
  const [angle, setAngle] = useState(initialAngle);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<GradientExportFormat>('css');

  const gradientCSS = useMemo(() => buildGradientCSS(stops, gradientType, angle), [stops, gradientType, angle]);
  const tailwindClass = useMemo(() => buildTailwindClass(stops, gradientType, angle), [stops, gradientType, angle]);
  const svgCode = useMemo(() => buildSVGCode(stops, gradientType, angle), [stops, gradientType, angle]);

  const exportCode = useMemo(() => {
    switch (exportFormat) {
      case 'css': return `background: ${gradientCSS};`;
      case 'tailwind': return tailwindClass;
      case 'svg': return svgCode;
    }
  }, [exportFormat, gradientCSS, tailwindClass, svgCode]);

  // Notify parent
  useMemo(() => { onGradientChange?.(gradientCSS); }, [gradientCSS, onGradientChange]);

  const handleUpdateStop = useCallback((index: number, updated: ColorStop) => {
    setStops((prev) => prev.map((s, i) => (i === index ? updated : s)));
  }, []);

  const handleRemoveStop = useCallback((index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddStop = useCallback(() => {
    setStops((prev) => {
      if (prev.length >= maxStops) return prev;
      const lastPos = prev[prev.length - 1].position;
      const newPos = Math.min(100, lastPos + 25);
      return [...prev, createStop(generateRandomColor(), newPos)];
    });
  }, [maxStops]);

  const handleRandomGradient = useCallback(() => {
    const { colors, type, angle: newAngle } = generateRandomGradient();
    const newStops = colors.map((color, i) =>
      createStop(color, Math.round(colors.length === 1 ? 50 : (i / (colors.length - 1)) * 100))
    );
    setStops(newStops);
    setGradientType(type);
    setAngle(newAngle);
  }, []);

  const handleApplyPreset = useCallback((preset: GradientPreset) => {
    const newStops = preset.colors.map((color, i) =>
      createStop(color, Math.round(preset.colors.length === 1 ? 50 : (i / (preset.colors.length - 1)) * 100))
    );
    setStops(newStops);
    setGradientType(preset.type);
    setAngle(preset.angle ?? 135);
  }, []);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [exportCode]);

  const handleExport = useCallback(() => {
    downloadFile(exportCode, `gradient.${exportFormat === 'css' ? 'css' : exportFormat === 'tailwind' ? 'txt' : 'svg'}`);
  }, [exportCode, exportFormat]);

  if (!mounted) return null;

  const gradientTypeOptions: { id: GradientType; label: string }[] = [
    { id: 'linear', label: 'Linear' },
    { id: 'radial', label: 'Radial' },
    { id: 'conic', label: 'Conic' },
  ];

  const exportFormatOptions: { id: GradientExportFormat; label: string }[] = [
    { id: 'css', label: 'CSS' },
    { id: 'tailwind', label: 'Tailwind' },
    { id: 'svg', label: 'SVG' },
  ];

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
          style={{ borderColor: `${t.accentSecondary}33`, backgroundColor: `${t.accentSecondary}1a` }}>
          <IconPalette size={14} style={{ color: t.accentSecondary }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: t.accentSecondary }}>Design Tool</span>
        </div>
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4"
          style={{
            background: `linear-gradient(135deg, ${t.accentSecondary}, ${t.accent}, ${t.accentSecondary})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
          {labels.title}
        </h2>
        <p className="font-mono text-sm sm:text-base max-w-lg mx-auto" style={{ color: `${t.textMuted}b3` }}>
          {labels.subtitle}
        </p>
      </div>

      {/* Presets */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <span style={{ color: `${t.accent}cc` }}>✦</span>
          <h3 className="font-mono text-sm tracking-widest uppercase" style={{ color: t.textMuted }}>{labels.presets}</h3>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${t.accent}33, transparent)` }} />
          <button onClick={handleRandomGradient}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all hover:scale-105"
            style={{ backgroundColor: t.surface, borderColor: t.border, color: t.textMuted }}>
            <IconShuffle size={14} />
            <span className="hidden sm:inline text-xs font-mono">{labels.random}</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
          {presets.map((preset) => (
            <PresetButton key={preset.name} preset={preset} onClick={handleApplyPreset} theme={t} />
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Controls */}
        <div className="rounded-2xl overflow-hidden border flex flex-col" style={{ backgroundColor: t.panelBg, borderColor: t.border }}>
          <ChromeHeader filename="gradient.config" theme={t} />

          <div className="p-4 sm:p-5 space-y-5 flex-1">
            {/* Type selector */}
            <div>
              <label className="font-mono text-xs mb-2.5 block" style={{ color: t.textMuted }}>
                {labels.gradientType}
              </label>
              <div className="flex gap-2">
                {gradientTypeOptions.map((opt) => {
                  const isActive = gradientType === opt.id;
                  return (
                    <button key={opt.id} onClick={() => setGradientType(opt.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer"
                      style={{
                        color: isActive ? '#1a1a1a' : `${t.textMuted}80`,
                        backgroundColor: isActive ? `${t.accent}1a` : 'rgba(26,26,26,0.05)',
                        border: `1px solid ${isActive ? `${t.accent}4d` : 'rgba(26,26,26,0.08)'`,
                      }}>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Angle (linear/conic only) */}
            {(gradientType === 'linear' || gradientType === 'conic') && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="font-mono text-xs flex items-center gap-2" style={{ color: t.textMuted }}>
                    🔄 {labels.angle}
                  </label>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md" style={{ color: t.accent, backgroundColor: `${t.accent}1a` }}>
                    {angle}°
                  </span>
                </div>
                <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(90deg, ${t.accent}4d, ${t.accentSecondary}4d)` }} />
                <div className="flex justify-between mt-1.5">
                  <span className="font-mono text-[10px]" style={{ color: `${t.textMuted}80` }}>0°</span>
                  <span className="font-mono text-[10px]" style={{ color: `${t.textMuted}80` }}>360°</span>
                </div>
              </div>
            )}

            {/* Color Stops */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-mono text-xs flex items-center gap-2" style={{ color: t.textMuted }}>
                  🎚 {labels.colorStops}
                  <span className="text-[10px]" style={{ color: `${t.textMuted}80` }}>({stops.length}/{maxStops})</span>
                </label>
                <button onClick={handleAddStop} disabled={stops.length >= maxStops}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  style={{ color: t.textMuted }}>
                  + {labels.add}
                </button>
              </div>

              {/* Preview bar */}
              <div className="w-full h-3 rounded-full mb-4 border" style={{ background: gradientCSS, borderColor: t.border }} />

              {/* Stop list */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {stops.map((stop, index) => (
                  <ColorStopEditor
                    key={stop.id}
                    stop={stop}
                    index={index}
                    total={stops.length}
                    onUpdate={(updated) => handleUpdateStop(index, updated)}
                    onRemove={() => handleRemoveStop(index)}
                    theme={t}
                    labels={labels}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${t.accent}b3` }} />
              <span className="font-mono text-[10px]" style={{ color: `${t.textMuted}80` }}>Live</span>
            </div>
            <span className="font-mono text-[10px]" style={{ color: `${t.textMuted}4d` }}>{stops.length} stops</span>
          </div>
        </div>

        {/* Preview + Code */}
        <div className="flex flex-col gap-4 lg:gap-5">
          {/* Preview */}
          <div className="rounded-2xl overflow-hidden border flex flex-col" style={{ backgroundColor: t.panelBg, borderColor: t.border }}>
            <ChromeHeader filename="preview" theme={t} />
            <div className="w-full h-48 sm:h-56 lg:h-64 relative" style={{ background: gradientCSS }} />
          </div>

          {/* Code */}
          <div className="rounded-2xl overflow-hidden border flex flex-col" style={{ backgroundColor: t.panelBg, borderColor: t.border }}>
            <div className="flex items-center border-b" style={{ borderColor: t.border }}>
              {/* Format tabs */}
              <div className="flex items-center">
                {exportFormatOptions.map((fmt) => (
                  <button key={fmt.id} onClick={() => setExportFormat(fmt.id)}
                    className="relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-mono transition-colors cursor-pointer"
                    style={{ color: exportFormat === fmt.id ? '#1a1a1a' : `${t.textMuted}80` }}>
                    <span>{fmt.label}</span>
                    {exportFormat === fmt.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: t.accentSecondary }} />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1 pr-2">
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer"
                  style={{ color: t.textMuted }}>
                  {copied ? <IconCheck size={14} style={{ color: t.accent }} /> : <IconCopy size={14} />}
                  <span className="hidden sm:inline">{copied ? labels.copied : labels.copy}</span>
                </button>
                <button onClick={handleExport}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer"
                  style={{ color: '#1a1a1a', background: `linear-gradient(135deg, ${t.accentSecondary}, ${t.accent})` }}>
                  <IconDownload size={14} />
                  <span className="hidden sm:inline">{labels.export}</span>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto font-mono max-h-[240px]" style={{ color: '#f8f8f2' }}>
              {exportCode.split('\n').map((line, i) => (
                <CodeLine key={`code-${i}`} lineNum={i + 1}>
                  {highlightColors(line)}
                </CodeLine>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t" style={{ backgroundColor: t.surface, borderColor: t.border }}>
              <span className="font-mono text-[10px] uppercase" style={{ color: t.textMuted }}>{exportFormat}</span>
              <span className="font-mono text-[10px]" style={{ color: `${t.textMuted}4d` }}>
                {exportCode.split('\n').length} lines
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradientGenerator;
