/**
 * BorderGenerator — CSS Border & Border-Radius Generator
 *
 * A reusable React component for designing CSS borders with per-side control,
 * border-radius management, outline, gradient borders, and live preview.
 *
 * @module 004_BorderGenerator
 * @example
 * ```tsx
 * <BorderGenerator
 *   labels={{ title: "Border Builder" }}
 *   presets={myPresets}
 *   onBorderChange={(css) => console.log(css)}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  useIsMounted,
  copyToClipboard,
  type GeneratorTheme,
  DEFAULT_THEME,
  IconCopy,
  IconCheck,
  ChromeHeader,
  CodeLine,
  highlightColors,
} from './shared';

// ─── Types ──────────────────────────────────────────────────────

export type BorderSide = 'top' | 'right' | 'bottom' | 'left';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none' | 'hidden';
export type BoxSize = 'small' | 'medium' | 'large';
export type BorderPanel = 'border' | 'radius' | 'outline' | 'gradient';

export interface BorderConfig {
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

export interface RadiusConfig {
  linked: boolean;
  all: number;
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface OutlineConfig {
  enabled: boolean;
  width: number;
  style: BorderStyle;
  color: string;
  offset: number;
}

export interface GradientBorderConfig {
  enabled: boolean;
  angle: number;
  stop1: string;
  stop2: string;
  stop3: string;
  useThreeStops: boolean;
}

export interface BorderPreset {
  name: string;
  icon?: string;
  border?: Partial<BorderConfig>;
  radius?: Partial<RadiusConfig>;
  outline?: Partial<OutlineConfig>;
  gradient?: Partial<GradientBorderConfig>;
  extraStyle?: React.CSSProperties;
}

export interface BorderGeneratorLabels {
  title?: string;
  subtitle?: string;
  border?: string;
  radius?: string;
  outline?: string;
  gradient?: string;
  width?: string;
  style?: string;
  color?: string;
  perSide?: string;
  linked?: string;
  independent?: string;
  unified?: string;
  enableOutline?: string;
  angle?: string;
  presets?: string;
  copied?: string;
  copy?: string;
}

export interface BorderGeneratorProps {
  /** Initial border config */
  initialBorder?: Partial<BorderConfig>;
  /** Initial radius */
  initialRadius?: Partial<RadiusConfig>;
  /** Custom presets */
  presets?: BorderPreset[];
  /** Labels */
  labels?: BorderGeneratorLabels;
  /** Theme */
  theme?: Partial<GeneratorTheme>;
  /** Called when CSS changes */
  onBorderChange?: (css: string) => void;
  /** Additional CSS class */
  className?: string;
}

// ─── Defaults ───────────────────────────────────────────────────

const BORDER_STYLES: BorderStyle[] = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'];

const defaultBorder: BorderConfig = {
  width: 2, style: 'solid', color: '#d4a017', perSide: false,
  topWidth: 2, rightWidth: 2, bottomWidth: 2, leftWidth: 2,
  topColor: '#d4a017', rightColor: '#d4a017', bottomColor: '#d4a017', leftColor: '#d4a017',
  topStyle: 'solid', rightStyle: 'solid', bottomStyle: 'solid', leftStyle: 'solid',
};

const defaultRadius: RadiusConfig = { linked: true, all: 12, topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 };
const defaultOutline: OutlineConfig = { enabled: false, width: 2, style: 'solid', color: '#b8860b', offset: 4 };
const defaultGradient: GradientBorderConfig = { enabled: false, angle: 90, stop1: '#d4a017', stop2: '#b8860b', stop3: '#6b6356', useThreeStops: false };

const DEFAULT_PRESETS: BorderPreset[] = [
  { name: 'Card', icon: '□', border: { width: 1, style: 'solid', color: 'rgba(26,26,26,0.1)' }, radius: { all: 16 } },
  { name: 'Neon Glow', icon: '✦', border: { width: 2, style: 'solid', color: '#d4a017' }, radius: { all: 12 }, extraStyle: { boxShadow: '0 0 10px #d4a017, 0 0 20px #d4a01740' } },
  { name: 'Dashed Tag', icon: '﹏', border: { width: 2, style: 'dashed', color: '#f59e0b' }, radius: { all: 8 } },
  { name: 'Double Frame', icon: '▤', border: { width: 4, style: 'double', color: '#b8860b' }, radius: { all: 12 } },
  { name: 'Gradient', icon: '◈', border: { width: 3, style: 'solid', color: '#d4a017' }, radius: { all: 16 }, gradient: { enabled: true, angle: 135, stop1: '#d4a017', stop2: '#b8860b', stop3: '#6b6356', useThreeStops: true } },
  { name: 'Dotted Circle', icon: '○', border: { width: 3, style: 'dotted', color: '#c23616' }, radius: { all: 100 } },
  { name: 'Groove Panel', icon: '▽', border: { width: 4, style: 'groove', color: '#64748b' }, radius: { all: 8 } },
  { name: 'Ridge Badge', icon: '△', border: { width: 4, style: 'ridge', color: '#6b6356' }, radius: { all: 24 } },
  { name: 'Glassmorphism', icon: '◇', border: { width: 1, style: 'solid', color: 'rgba(26,26,26,0.18)' }, radius: { all: 16 }, extraStyle: { background: 'rgba(26,26,26,0.05)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' } },
  { name: 'Underline', icon: '▁', border: { width: 0, style: 'none', color: '#d4a017', perSide: true, topWidth: 0, rightWidth: 0, bottomWidth: 3, leftWidth: 0, topStyle: 'none', rightStyle: 'none', bottomStyle: 'solid', leftStyle: 'none' }, radius: { all: 4 } },
];

const DEFAULT_LABELS: Required<BorderGeneratorLabels> = {
  title: 'Border Lab',
  subtitle: 'Design CSS borders with per-side control, border-radius, and gradient borders',
  border: 'Border', radius: 'Radius', outline: 'Outline', gradient: 'Gradient',
  width: 'Width', style: 'Style', color: 'Color',
  perSide: 'Per-Side Control', linked: 'Linked', independent: 'Independent', unified: 'Unified',
  enableOutline: 'Enable Outline', angle: 'Angle',
  presets: 'Presets', copied: 'Copied!', copy: 'Copy',
};

// ─── Slider Sub-component ───────────────────────────────────────

function ControlSlider({ label, value, min, max, step, unit, onChange, accentColor, theme }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; accentColor?: string; theme: GeneratorTheme;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = accentColor || theme.accent;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: theme.textMuted }}>{label}</span>
        <span className="text-[11px] font-mono tabular-nums" style={{ color: theme.accent }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} 0%, ${color}88 ${pct}%, rgba(26,26,26,0.1) ${pct}%)` }} />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

/**
 * BorderGenerator — CSS Border & Border-Radius Generator
 *
 * Design CSS borders with per-side control, border-radius,
 * outline, gradient borders, and live preview.
 */
export function BorderGenerator({
  initialBorder,
  initialRadius,
  presets = DEFAULT_PRESETS,
  labels: labelOverrides,
  theme: themeOverrides,
  onBorderChange,
  className,
}: BorderGeneratorProps) {
  const mounted = useIsMounted();
  const t = useMemo(() => ({ ...DEFAULT_THEME, ...themeOverrides }), [themeOverrides]);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);

  const [border, setBorder] = useState<BorderConfig>({ ...defaultBorder, ...initialBorder });
  const [radius, setRadius] = useState<RadiusConfig>({ ...defaultRadius, ...initialRadius });
  const [outline, setOutline] = useState<OutlineConfig>({ ...defaultOutline });
  const [gradient, setGradient] = useState<GradientBorderConfig>({ ...defaultGradient });
  const [boxSize] = useState<BoxSize>('medium');
  const [copied, setCopied] = useState(false);
  const [activePanel, setActivePanel] = useState<BorderPanel>('border');
  const [activePresetIdx, setActivePresetIdx] = useState(-1);

  // Preview border style
  const previewBorderStyle = useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (border.perSide) {
      style.borderTop = `${border.topWidth}px ${border.topStyle} ${border.topColor}`;
      style.borderRight = `${border.rightWidth}px ${border.rightStyle} ${border.rightColor}`;
      style.borderBottom = `${border.bottomWidth}px ${border.bottomStyle} ${border.bottomColor}`;
      style.borderLeft = `${border.leftWidth}px ${border.leftStyle} ${border.leftColor}`;
    } else if (border.style !== 'none' && border.style !== 'hidden') {
      style.border = `${border.width}px ${border.style} ${border.color}`;
    }
    if (gradient.enabled && border.style !== 'none' && border.style !== 'hidden') {
      const stops = gradient.useThreeStops ? `${gradient.stop1}, ${gradient.stop2}, ${gradient.stop3}` : `${gradient.stop1}, ${gradient.stop2}`;
      style.borderImage = `linear-gradient(${gradient.angle}deg, ${stops}) 1`;
      style.borderStyle = border.style;
      style.borderWidth = border.perSide ? `${border.topWidth}px ${border.rightWidth}px ${border.bottomWidth}px ${border.leftWidth}px` : `${border.width}px`;
    }
    style.borderRadius = radius.linked ? `${radius.all}px` : `${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`;
    if (outline.enabled) {
      style.outline = `${outline.width}px ${outline.style} ${outline.color}`;
      style.outlineOffset = `${outline.offset}px`;
    }
    return style;
  }, [border, radius, outline, gradient]);

  const extraStyle = useMemo(() => {
    if (activePresetIdx >= 0 && presets[activePresetIdx]) return presets[activePresetIdx].extraStyle || {};
    return {};
  }, [activePresetIdx, presets]);

  // CSS code output
  const cssCode = useMemo(() => {
    const lines: string[] = ['.element {'];
    if (gradient.enabled && border.style !== 'none' && border.style !== 'hidden') {
      const stops = gradient.useThreeStops ? `${gradient.stop1}, ${gradient.stop2}, ${gradient.stop3}` : `${gradient.stop1}, ${gradient.stop2}`;
      lines.push(`  border-image: linear-gradient(${gradient.angle}deg, ${stops}) 1;`);
    } else if (border.perSide) {
      if (border.topWidth > 0 || border.topStyle !== 'none') lines.push(`  border-top: ${border.topWidth}px ${border.topStyle} ${border.topColor};`);
      if (border.rightWidth > 0 || border.rightStyle !== 'none') lines.push(`  border-right: ${border.rightWidth}px ${border.rightStyle} ${border.rightColor};`);
      if (border.bottomWidth > 0 || border.bottomStyle !== 'none') lines.push(`  border-bottom: ${border.bottomWidth}px ${border.bottomStyle} ${border.bottomColor};`);
      if (border.leftWidth > 0 || border.leftStyle !== 'none') lines.push(`  border-left: ${border.leftWidth}px ${border.leftStyle} ${border.leftColor};`);
    } else if (border.style !== 'none' && border.style !== 'hidden') {
      lines.push(`  border: ${border.width}px ${border.style} ${border.color};`);
    }
    if (radius.linked ? radius.all > 0 : true)
      lines.push(`  border-radius: ${radius.linked ? radius.all : `${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`};`);
    if (outline.enabled) {
      lines.push(`  outline: ${outline.width}px ${outline.style} ${outline.color};`);
      lines.push(`  outline-offset: ${outline.offset}px;`);
    }
    lines.push('}');
    return lines.join('\n');
  }, [border, radius, outline, gradient]);

  useMemo(() => { onBorderChange?.(cssCode); }, [cssCode, onBorderChange]);

  const copyCode = useCallback(async () => {
    await copyToClipboard(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const applyPreset = useCallback((preset: BorderPreset, idx: number) => {
    setActivePresetIdx(idx);
    setBorder({ ...defaultBorder, ...preset.border });
    const newRadius = { ...defaultRadius, ...preset.radius };
    if (preset.radius && (preset.radius.topLeft !== undefined || preset.radius.topRight !== undefined)) newRadius.linked = false;
    setRadius(newRadius);
    setOutline({ ...defaultOutline, ...preset.outline });
    setGradient({ ...defaultGradient, ...preset.gradient });
  }, []);

  const updateRadiusAll = useCallback((val: number) => {
    setRadius({ linked: true, all: val, topLeft: val, topRight: val, bottomRight: val, bottomLeft: val });
  }, []);

  const updateBorderSide = useCallback((side: BorderSide, field: 'width' | 'color' | 'style', value: number | string) => {
    setBorder((prev) => {
      const next = { ...prev, perSide: true };
      const key = `${side}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof BorderConfig;
      (next as Record<string, unknown>)[key] = value;
      return next;
    });
  }, []);

  if (!mounted) return null;

  const panelTabs: { id: BorderPanel; label: string; icon: string }[] = [
    { id: 'border', label: labels.border, icon: '◻' },
    { id: 'radius', label: labels.radius, icon: '↻' },
    { id: 'outline', label: labels.outline, icon: '⊞' },
    { id: 'gradient', label: labels.gradient, icon: '✦' },
  ];

  return (
    <div className={className}>
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
          style={{ borderColor: `${t.accent}33`, backgroundColor: `${t.accent}1a` }}>
          <span style={{ color: t.accent }}>◻</span>
          <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: t.accent }}>Style Tool</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3"
          style={{ background: `linear-gradient(135deg, #f59e0b, ${t.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {labels.title}
        </h2>
        <p className="font-mono text-sm max-w-md mx-auto" style={{ color: `${t.textMuted}b3` }}>{labels.subtitle}</p>
      </div>

      {/* Panel Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl border mb-6" style={{ backgroundColor: t.surface, borderColor: t.border }}>
        {panelTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActivePanel(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            style={{
              color: activePanel === tab.id ? '#1a1a1a' : t.textMuted,
              backgroundColor: activePanel === tab.id ? t.surface : 'transparent',
              border: `1px solid ${activePanel === tab.id ? t.border : 'transparent'}`,
            }}>
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* Border Panel */}
          {activePanel === 'border' && (
            <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono" style={{ color: t.textMuted }}>{labels.perSide}</span>
                <button onClick={() => setBorder((p) => {
                  const next = !p.perSide;
                  return {
                    ...p, perSide: next,
                    topWidth: next ? p.width : p.topWidth, rightWidth: next ? p.width : p.rightWidth,
                    bottomWidth: next ? p.width : p.bottomWidth, leftWidth: next ? p.width : p.leftWidth,
                    topColor: next ? p.color : p.topColor, rightColor: next ? p.color : p.rightColor,
                    bottomColor: next ? p.color : p.bottomColor, leftColor: next ? p.color : p.leftColor,
                    topStyle: next ? p.style : p.topStyle, rightStyle: next ? p.style : p.rightStyle,
                    bottomStyle: next ? p.style : p.bottomStyle, leftStyle: next ? p.style : p.leftStyle,
                  };
                })}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer transition-colors"
                  style={{
                    color: border.perSide ? '#f59e0b' : `${t.textMuted}80`,
                    backgroundColor: border.perSide ? 'rgba(245,158,11,0.1)' : 'rgba(26,26,26,0.05)',
                    border: `1px solid ${border.perSide ? 'rgba(245,158,11,0.3)' : 'rgba(26,26,26,0.08)'}`,
                  }}>
                  {border.perSide ? '🔗' : '↔'} {border.perSide ? labels.linked : labels.unified}
                </button>
              </div>

              {!border.perSide ? (
                <>
                  <ControlSlider label={labels.width} value={border.width} min={0} max={20} step={1} unit="px" onChange={(v) => setBorder((p) => ({ ...p, width: v }))} theme={t} />
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider block mb-1.5" style={{ color: t.textMuted }}>{labels.style}</span>
                    <div className="grid grid-cols-5 gap-1">
                      {BORDER_STYLES.map((s) => (
                        <button key={s} onClick={() => setBorder((p) => ({ ...p, style: s }))}
                          className="px-1.5 py-1.5 rounded-md text-[10px] font-mono transition-all cursor-pointer"
                          style={{
                            backgroundColor: border.style === s ? `${t.accent}26` : t.surface,
                            color: border.style === s ? t.accent : t.textMuted,
                            border: `1px solid ${border.style === s ? `${t.accent}4d` : t.border}`,
                          }}>
                          {s.slice(0, 4)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={border.color} onChange={(e) => setBorder((p) => ({ ...p, color: e.target.value }))}
                      className="w-8 h-8 rounded-lg border cursor-pointer appearance-none bg-transparent" style={{ borderColor: t.border, padding: 0 }} />
                    <input type="text" value={border.color}
                      onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setBorder((p) => ({ ...p, color: e.target.value })); }}
                      className="flex-1 px-3 py-1.5 rounded-lg border font-mono text-xs outline-none transition-colors"
                      style={{ backgroundColor: t.surface, color: `${t.textMuted}e6`, borderColor: t.border }} maxLength={7} />
                  </div>
                </>
              ) : (
                (['top', 'right', 'bottom', 'left'] as BorderSide[]).map((side) => (
                  <div key={side} className="rounded-lg border p-3 space-y-2" style={{ borderColor: t.border, backgroundColor: t.surface }}>
                    <span className="text-[11px] font-mono capitalize flex items-center gap-2" style={{ color: `${t.textMuted}b3` }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: border[`${side}Color` as keyof BorderConfig] as string }} />
                      {side}
                    </span>
                    <ControlSlider label={labels.width} value={border[`${side}Width` as keyof BorderConfig] as number} min={0} max={20} step={1} unit="px"
                      onChange={(v) => updateBorderSide(side, 'width', v)} theme={t} />
                    <div className="flex items-center gap-2">
                      <input type="color" value={border[`${side}Color` as keyof BorderConfig] as string}
                        onChange={(e) => updateBorderSide(side, 'color', e.target.value)}
                        className="w-6 h-6 rounded border cursor-pointer appearance-none bg-transparent" style={{ borderColor: t.border, padding: 0 }} />
                      <input type="text" value={border[`${side}Color` as keyof BorderConfig] as string}
                        onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) updateBorderSide(side, 'color', e.target.value); }}
                        className="flex-1 px-2 py-1 rounded border font-mono text-[10px] outline-none transition-colors"
                        style={{ backgroundColor: t.surface, color: `${t.textMuted}cc`, borderColor: t.border }} maxLength={7} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Radius Panel */}
          {activePanel === 'radius' && (
            <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono" style={{ color: t.textMuted }}>Per-Corner Control</span>
                <button onClick={() => setRadius((p) => ({ ...p, linked: !p.linked }))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer"
                  style={{
                    color: radius.linked ? t.accent : `${t.textMuted}80`,
                    backgroundColor: radius.linked ? `${t.accent}1a` : 'rgba(26,26,26,0.05)',
                    border: `1px solid ${radius.linked ? `${t.accent}4d` : 'rgba(26,26,26,0.08)'}`,
                  }}>
                  {radius.linked ? '🔗' : '↔'} {radius.linked ? labels.linked : labels.independent}
                </button>
              </div>

              {radius.linked ? (
                <ControlSlider label="Border Radius" value={radius.all} min={0} max={100} step={1} unit="px" onChange={updateRadiusAll} accentColor="#d4a017" theme={t} />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <ControlSlider label="Top Left" value={radius.topLeft} min={0} max={100} step={1} unit="px" onChange={(v) => setRadius((p) => ({ ...p, topLeft: v }))} accentColor="#d4a017" theme={t} />
                  <ControlSlider label="Top Right" value={radius.topRight} min={0} max={100} step={1} unit="px" onChange={(v) => setRadius((p) => ({ ...p, topRight: v }))} accentColor="#b8860b" theme={t} />
                  <ControlSlider label="Bottom Left" value={radius.bottomLeft} min={0} max={100} step={1} unit="px" onChange={(v) => setRadius((p) => ({ ...p, bottomLeft: v }))} accentColor="#f59e0b" theme={t} />
                  <ControlSlider label="Bottom Right" value={radius.bottomRight} min={0} max={100} step={1} unit="px" onChange={(v) => setRadius((p) => ({ ...p, bottomRight: v }))} accentColor="#c23616" theme={t} />
                </div>
              )}

              {/* Visual radius map */}
              <div className="flex items-center justify-center py-2">
                <svg viewBox="0 0 128 128" className="w-32 h-32">
                  <rect x="8" y="8" width="112" height="112"
                    rx={radius.linked ? Math.min(radius.all, 56) : 0} ry={radius.linked ? Math.min(radius.all, 56) : 0}
                    fill="none" stroke="rgba(26,26,26,0.15)" strokeWidth="1"
                    style={radius.linked ? {} : {
                      borderTopLeftRadius: `${Math.min(radius.topLeft, 56)}px`,
                      borderTopRightRadius: `${Math.min(radius.topRight, 56)}px`,
                      borderBottomRightRadius: `${Math.min(radius.bottomRight, 56)}px`,
                      borderBottomLeftRadius: `${Math.min(radius.bottomLeft, 56)}px`,
                    }} />
                  {!radius.linked && (
                    <>
                      <text x="16" y="22" fill="rgba(212,160,23,0.6)" fontSize="8" fontFamily="monospace">{radius.topLeft}</text>
                      <text x="96" y="22" fill="rgba(184,134,11,0.6)" fontSize="8" fontFamily="monospace" textAnchor="end">{radius.topRight}</text>
                      <text x="16" y="122" fill="rgba(245,158,11,0.6)" fontSize="8" fontFamily="monospace">{radius.bottomLeft}</text>
                      <text x="96" y="122" fill="rgba(194,54,22,0.6)" fontSize="8" fontFamily="monospace" textAnchor="end">{radius.bottomRight}</text>
                    </>
                  )}
                  {radius.linked && <text x="64" y="68" fill="rgba(212,160,23,0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle">{radius.all}px</text>}
                </svg>
              </div>
            </div>
          )}

          {/* Outline Panel */}
          {activePanel === 'outline' && (
            <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-mono" style={{ color: t.textMuted }}>{labels.enableOutline}</span>
                <input type="checkbox" checked={outline.enabled}
                  onChange={(e) => setOutline((p) => ({ ...p, enabled: e.target.checked }))}
                  className="w-4 h-4 rounded" />
              </label>
              {outline.enabled && (
                <>
                  <ControlSlider label={labels.width} value={outline.width} min={0} max={10} step={1} unit="px" onChange={(v) => setOutline((p) => ({ ...p, width: v }))} theme={t} />
                  <ControlSlider label="Offset" value={outline.offset} min={-10} max={20} step={1} unit="px" onChange={(v) => setOutline((p) => ({ ...p, offset: v }))} theme={t} />
                  <div className="flex items-center gap-3">
                    <input type="color" value={outline.color} onChange={(e) => setOutline((p) => ({ ...p, color: e.target.value }))}
                      className="w-8 h-8 rounded-lg border cursor-pointer appearance-none bg-transparent" style={{ borderColor: t.border, padding: 0 }} />
                    <input type="text" value={outline.color}
                      onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setOutline((p) => ({ ...p, color: e.target.value })); }}
                      className="flex-1 px-3 py-1.5 rounded-lg border font-mono text-xs outline-none"
                      style={{ backgroundColor: t.surface, color: `${t.textMuted}e6`, borderColor: t.border }} maxLength={7} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Gradient Panel */}
          {activePanel === 'gradient' && (
            <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-mono" style={{ color: t.textMuted }}>Enable Gradient Border</span>
                <input type="checkbox" checked={gradient.enabled}
                  onChange={(e) => setGradient((p) => ({ ...p, enabled: e.target.checked }))}
                  className="w-4 h-4 rounded" />
              </label>
              {gradient.enabled && (
                <>
                  <ControlSlider label={labels.angle} value={gradient.angle} min={0} max={360} step={1} unit="deg" onChange={(v) => setGradient((p) => ({ ...p, angle: v }))} theme={t} />
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono block mb-1" style={{ color: `${t.textMuted}80` }}>Stop 1</span>
                      <input type="color" value={gradient.stop1} onChange={(e) => setGradient((p) => ({ ...p, stop1: e.target.value }))}
                        className="w-8 h-8 rounded-lg border cursor-pointer appearance-none bg-transparent" style={{ borderColor: t.border, padding: 0 }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono block mb-1" style={{ color: `${t.textMuted}80` }}>Stop 2</span>
                      <input type="color" value={gradient.stop2} onChange={(e) => setGradient((p) => ({ ...p, stop2: e.target.value }))}
                        className="w-8 h-8 rounded-lg border cursor-pointer appearance-none bg-transparent" style={{ borderColor: t.border, padding: 0 }} />
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={gradient.useThreeStops}
                        onChange={(e) => setGradient((p) => ({ ...p, useThreeStops: e.target.checked }))}
                        className="w-3 h-3 rounded" />
                      <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}80` }}>3 stops</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Presets */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: t.border }}>
              <span style={{ color: t.accent }}>🎨</span>
              <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>{labels.presets}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3">
              {presets.map((preset, i) => (
                <button key={i} onClick={() => applyPreset(preset, i)}
                  className="group flex flex-col items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer hover:-translate-y-0.5"
                  style={{ borderColor: t.border, backgroundColor: t.surface }}>
                  <div className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ ...previewBorderStyle, ...preset.extraStyle }}>
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.9)' }} />
                  </div>
                  <span className="text-[9px] font-mono truncate w-full text-center" style={{ color: `${t.textMuted}b3` }}>
                    {preset.icon} {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview + Code */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <ChromeHeader filename="preview" theme={t} />
            <div className="p-8 flex items-center justify-center" style={{ minHeight: '300px' }}>
              <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center"
                style={{
                  ...previewBorderStyle,
                  ...extraStyle,
                  ...(boxSize === 'small' ? {} : {}),
                }}>
                <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}80` }}>Preview</span>
              </div>
            </div>
          </div>

          {/* Code Output */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: t.border, backgroundColor: t.surface }}>
              <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}66` }}>Generated CSS</span>
              <button onClick={copyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono border cursor-pointer transition-colors"
                style={{ backgroundColor: t.surface, borderColor: t.border, color: copied ? t.accent : t.textMuted }}>
                {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                {copied ? labels.copied : labels.copy}
              </button>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono leading-relaxed" style={{ color: '#f8f8f2' }}>
                {cssCode.split('\n').map((line, i) => (
                  <CodeLine key={i} lineNum={i + 1}>
                    {highlightColors(line)}
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

export default BorderGenerator;
