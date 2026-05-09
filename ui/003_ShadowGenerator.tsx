/**
 * ShadowGenerator — Box/Text Shadow Generator
 *
 * A reusable React component for building CSS box-shadow and text-shadow
 * with multi-layer support, presets, live preview, and export.
 *
 * @module 003_ShadowGenerator
 * @example
 * ```tsx
 * <ShadowGenerator
 *   mode="box"
 *   maxLayers={5}
 *   labels={{ title: "Shadow Builder" }}
 *   onShadowChange={(css) => console.log(css)}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  useIsMounted,
  hexToRgba,
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
  ChromeHeader,
  CodeLine,
} from './shared';

// ─── Types ──────────────────────────────────────────────────────

export interface ShadowLayer {
  id: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export interface TextShadowSettings {
  x: number;
  y: number;
  blur: number;
  color: string;
  opacity: number;
}

export interface ShadowPreset {
  name: string;
  shadow: string;
}

export type ShadowMode = 'box' | 'text';
export type ShadowExportFormat = 'css' | 'tailwind';

export interface ShadowGeneratorLabels {
  title?: string;
  subtitle?: string;
  boxShadow?: string;
  textShadow?: string;
  layers?: string;
  add?: string;
  xOffset?: string;
  yOffset?: string;
  blurRadius?: string;
  spread?: string;
  opacity?: string;
  inset?: string;
  color?: string;
  presets?: string;
  random?: string;
  export?: string;
  copied?: string;
  copy?: string;
  previewText?: string;
  previewSubtext?: string;
}

export interface ShadowGeneratorProps {
  /** Initial mode: 'box' or 'text' */
  mode?: ShadowMode;
  /** Max number of box shadow layers (default: 5) */
  maxLayers?: number;
  /** Custom presets */
  presets?: ShadowPreset[];
  /** Labels */
  labels?: ShadowGeneratorLabels;
  /** Theme */
  theme?: Partial<GeneratorTheme>;
  /** Called when shadow CSS changes */
  onShadowChange?: (css: string) => void;
  /** Additional CSS class */
  className?: string;
}

// ─── Defaults ───────────────────────────────────────────────────

const DEFAULT_PRESETS: ShadowPreset[] = [
  { name: 'Soft Glow', shadow: '0 0 20px 5px rgba(212, 160, 23, 0.3)' },
  { name: 'Hard Edge', shadow: '4px 4px 0px rgba(0, 0, 0, 1)' },
  { name: 'Neon', shadow: '0 0 10px #d4a017, 0 0 20px #d4a017, 0 0 40px #b8860b' },
  { name: 'Long Shadow', shadow: '6px 6px 0px rgba(0, 0, 0, 0.5), 12px 12px 0px rgba(0, 0, 0, 0.25)' },
  { name: 'Floating', shadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.2)' },
  { name: 'Pressed', shadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.1)' },
  { name: 'Inner Glow', shadow: 'inset 0 0 20px rgba(212, 160, 23, 0.5)' },
  { name: 'Multiple', shadow: '0 1px 2px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.07), 0 16px 32px rgba(0,0,0,0.07)' },
  { name: 'Crisp', shadow: '0 2px 0px rgba(0, 0, 0, 0.8)' },
  { name: 'Dreamy', shadow: '0 0 30px 10px rgba(107, 99, 86, 0.3), 0 0 60px 20px rgba(194, 54, 22, 0.15)' },
  { name: 'Retro', shadow: '8px 8px 0px rgba(245, 158, 11, 0.8)' },
  { name: 'Holographic', shadow: '0 0 15px rgba(184, 134, 11, 0.4), 0 0 30px rgba(107, 99, 86, 0.3), 0 0 45px rgba(194, 54, 22, 0.2)' },
];

const DEFAULT_LABELS: Required<ShadowGeneratorLabels> = {
  title: 'Shadow Lab',
  subtitle: 'Design box-shadow and text-shadow with multi-layer support',
  boxShadow: 'Box Shadow',
  textShadow: 'Text Shadow',
  layers: 'Layers',
  add: 'Add',
  xOffset: 'X Offset',
  yOffset: 'Y Offset',
  blurRadius: 'Blur',
  spread: 'Spread',
  opacity: 'Opacity',
  inset: 'Inset',
  color: 'Color',
  presets: 'Presets',
  random: 'Random',
  export: 'Export',
  copied: 'Copied!',
  copy: 'Copy',
  previewText: 'The Art of Code',
  previewSubtext: 'CSS Shadow Preview',
};

// ─── Helpers ────────────────────────────────────────────────────

function createDefaultLayer(): ShadowLayer {
  return {
    id: nextId(),
    x: 0, y: 4, blur: 12, spread: 0,
    color: '#d4a017', opacity: 40, inset: false,
  };
}

export function generateLayerCSS(layer: ShadowLayer): string {
  const rgba = hexToRgba(layer.color, layer.opacity);
  const inset = layer.inset ? 'inset ' : '';
  return `${inset}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${rgba}`;
}

function parseShadowToLayers(shadow: string): ShadowLayer[] {
  return shadow.split(', ').map((part) => {
    const layer = createDefaultLayer();
    const trimmed = part.trim();
    const insetMatch = trimmed.startsWith('inset ');
    const cleanPart = insetMatch ? trimmed.slice(6) : trimmed;
    const values = cleanPart.split(/\s+/);
    if (values.length >= 4) {
      layer.x = parseFloat(values[0]) || 0;
      layer.y = parseFloat(values[1]) || 0;
      layer.blur = parseFloat(values[2]) || 0;
      layer.spread = parseFloat(values[3]) || 0;
    }
    if (values[4]) {
      const colorStr = values[4];
      if (colorStr.startsWith('#')) {
        layer.color = colorStr.length >= 7 ? colorStr.slice(0, 7) : colorStr;
        layer.opacity = 100;
      } else {
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
        if (match) {
          const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
          layer.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          layer.opacity = match[4] ? Math.round(parseFloat(match[4]) * 100) : 100;
        }
      }
    }
    layer.inset = insetMatch;
    return layer;
  });
}

// ─── Sub-components ─────────────────────────────────────────────

function ShadowSlider({
  label, value, min, max, step, unit, onChange, theme,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; theme: GeneratorTheme;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: theme.textMuted }}>{label}</span>
        <span className="text-[11px] font-mono tabular-nums" style={{ color: theme.accent }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accentSecondary} ${pct}%, rgba(26,26,26,0.1) ${pct}%)` }} />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

/**
 * ShadowGenerator — Box/Text Shadow Generator
 *
 * Build CSS box-shadow and text-shadow with multi-layer support,
 * presets, live preview, and code export.
 */
export function ShadowGenerator({
  mode: initialMode = 'box',
  maxLayers = 5,
  presets = DEFAULT_PRESETS,
  labels: labelOverrides,
  theme: themeOverrides,
  onShadowChange,
  className,
}: ShadowGeneratorProps) {
  const mounted = useIsMounted();
  const t = useMemo(() => ({ ...DEFAULT_THEME, ...themeOverrides }), [themeOverrides]);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);

  const [mode, setMode] = useState<ShadowMode>(initialMode);
  const [layers, setLayers] = useState<ShadowLayer[]>([createDefaultLayer()]);
  const [activeLayerId, setActiveLayerId] = useState(layers[0].id);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<ShadowExportFormat>('css');

  const [textShadow, setTextShadow] = useState<TextShadowSettings>({
    x: 2, y: 2, blur: 8, color: '#d4a017', opacity: 60,
  });

  const activeLayer = useMemo(
    () => layers.find((l) => l.id === activeLayerId) || layers[0],
    [layers, activeLayerId]
  );

  const updateLayer = useCallback((field: keyof ShadowLayer, value: number | string | boolean) => {
    setLayers((prev) => prev.map((l) => (l.id === activeLayerId ? { ...l, [field]: value } : l)));
  }, [activeLayerId]);

  const addLayer = useCallback(() => {
    if (layers.length >= maxLayers) return;
    const newLayer = createDefaultLayer();
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  }, [layers.length, maxLayers]);

  const removeLayer = useCallback((id: number) => {
    if (layers.length <= 1) return;
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (activeLayerId === id) setActiveLayerId(next[0].id);
      return next;
    });
  }, [layers.length, activeLayerId]);

  const boxShadowCSS = useMemo(() => layers.map(generateLayerCSS).join(', '), [layers]);

  const textShadowCSS = useMemo(
    () => `${textShadow.x}px ${textShadow.y}px ${textShadow.blur}px ${hexToRgba(textShadow.color, textShadow.opacity)}`,
    [textShadow]
  );

  const cssCode = useMemo(() => {
    if (mode === 'box') {
      return exportFormat === 'css'
        ? `.element {\n  box-shadow: ${boxShadowCSS};\n}`
        : `<div class="shadow-[${boxShadowCSS.replace(/ /g, '_')}]">`;
    }
    return exportFormat === 'css'
      ? `.element {\n  text-shadow: ${textShadowCSS};\n}`
      : `<span class="[text-shadow:${textShadowCSS.replace(/ /g, '_')}]">`;
  }, [mode, boxShadowCSS, textShadowCSS, exportFormat]);

  // Notify parent
  useMemo(() => {
    onShadowChange?.(mode === 'box' ? boxShadowCSS : textShadowCSS);
  }, [mode, boxShadowCSS, textShadowCSS, onShadowChange]);

  const copyCode = useCallback(async () => {
    await copyToClipboard(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const applyPreset = useCallback((preset: ShadowPreset) => {
    if (mode === 'box') {
      const newLayers = parseShadowToLayers(preset.shadow);
      setLayers(newLayers);
      setActiveLayerId(newLayers[0].id);
    } else {
      const trimmed = preset.shadow.split(', ')[0].trim();
      const insetMatch = trimmed.startsWith('inset ');
      const cleanPart = insetMatch ? trimmed.slice(6) : trimmed;
      const values = cleanPart.split(/\s+/);
      setTextShadow((prev) => ({
        ...prev,
        x: parseFloat(values[0]) || 0,
        y: parseFloat(values[1]) || 0,
        blur: parseFloat(values[2]) || 0,
        color: values[3]?.startsWith('#') ? values[3].slice(0, 7) : prev.color,
      }));
    }
  }, [mode]);

  const randomShadow = useCallback(() => {
    if (mode === 'box') {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      const layer: ShadowLayer = {
        id: nextId(),
        x: Math.round((Math.random() - 0.5) * 40),
        y: Math.round((Math.random() - 0.5) * 40),
        blur: Math.round(Math.random() * 60),
        spread: Math.round((Math.random() - 0.5) * 30),
        color: randomColor,
        opacity: Math.round(20 + Math.random() * 60),
        inset: Math.random() > 0.7,
      };
      setLayers([layer]);
      setActiveLayerId(layer.id);
    } else {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      setTextShadow({
        x: Math.round((Math.random() - 0.5) * 20),
        y: Math.round((Math.random() - 0.5) * 20),
        blur: Math.round(Math.random() * 40),
        color: randomColor,
        opacity: Math.round(30 + Math.random() * 60),
      });
    }
  }, [mode]);

  if (!mounted) return null;

  return (
    <div className={className}>
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
          style={{ borderColor: `${t.accent}33`, backgroundColor: `${t.accent}1a` }}>
          <span style={{ color: t.accent }}>◼</span>
          <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: t.accent }}>CSS Tool</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3"
          style={{
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary}, #10b981)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
          {labels.title}
        </h2>
        <p className="font-mono text-sm max-w-md mx-auto" style={{ color: `${t.textMuted}b3` }}>
          {labels.subtitle}
        </p>
      </div>

      {/* Mode toggle + toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: t.surface, borderColor: t.border }}>
          {(['box', 'text'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              style={{
                color: mode === m ? '#1a1a1a' : t.textMuted,
                backgroundColor: mode === m ? t.surface : 'transparent',
                border: mode === m ? `1px solid ${t.border}` : '1px solid transparent',
              }}>
              <span>{m === 'box' ? '◼' : 'A'}</span>
              <span>{m === 'box' ? labels.boxShadow : labels.textShadow}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={randomShadow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
            style={{ backgroundColor: t.surface, borderColor: t.border, color: `${t.textMuted}b3` }}>
            <IconShuffle size={12} /> <span className="text-xs font-mono">{labels.random}</span>
          </button>
          <button onClick={() => downloadFile(cssCode, 'shadow.css', 'text/css')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
            style={{ backgroundColor: t.surface, borderColor: t.border, color: `${t.textMuted}b3` }}>
            <IconDownload size={12} /> <span className="text-xs font-mono">{labels.export}</span>
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-5">
          {mode === 'box' ? (
            <>
              {/* Layer list */}
              <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: t.border }}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: t.accent }}>🚀</span>
                    <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>{labels.layers}</span>
                    <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}80` }}>({layers.length}/{maxLayers})</span>
                  </div>
                  <button onClick={addLayer} disabled={layers.length >= maxLayers}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    style={{ color: t.accent }}>
                    + {labels.add}
                  </button>
                </div>
                <div className="p-3 space-y-1.5 max-h-40 overflow-y-auto">
                  {layers.map((layer) => (
                    <div key={layer.id}
                      onClick={() => setActiveLayerId(layer.id)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      style={{
                        backgroundColor: activeLayerId === layer.id ? t.surface : 'transparent',
                        border: `1px solid ${activeLayerId === layer.id ? t.border : 'transparent'}`,
                      }}>
                      <div className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: layer.color, boxShadow: `0 0 0 1px ${t.border}` }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-mono truncate" style={{ color: `${t.textMuted}b3` }}>
                          {layer.inset && 'inset '}{layer.x}px {layer.y}px {layer.blur}px {layer.spread}px
                        </div>
                        <div className="text-[10px] font-mono" style={{ color: `${t.textMuted}80` }}>
                          {layer.color} @ {layer.opacity}%
                        </div>
                      </div>
                      {activeLayerId === layer.id && (
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.accent }} />
                      )}
                      {layers.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                          className="w-5 h-5 flex items-center justify-center rounded cursor-pointer transition-colors"
                          style={{ color: `${t.textMuted}80` }}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active layer controls */}
              <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeLayer.color, boxShadow: `0 0 0 1px ${t.border}` }} />
                  <span className="text-xs font-mono" style={{ color: t.textMuted }}>
                    Layer {layers.findIndex((l) => l.id === activeLayerId) + 1} Controls
                  </span>
                </div>
                <ShadowSlider label={labels.xOffset} value={activeLayer.x} min={-50} max={50} step={1} unit="px" onChange={(v) => updateLayer('x', v)} theme={t} />
                <ShadowSlider label={labels.yOffset} value={activeLayer.y} min={-50} max={50} step={1} unit="px" onChange={(v) => updateLayer('y', v)} theme={t} />
                <ShadowSlider label={labels.blurRadius} value={activeLayer.blur} min={0} max={100} step={1} unit="px" onChange={(v) => updateLayer('blur', v)} theme={t} />
                <ShadowSlider label={labels.spread} value={activeLayer.spread} min={-50} max={50} step={1} unit="px" onChange={(v) => updateLayer('spread', v)} theme={t} />

                <div className="flex items-center gap-3">
                  <input type="color" value={activeLayer.color} onChange={(e) => updateLayer('color', e.target.value)}
                    className="w-8 h-8 rounded-lg border cursor-pointer appearance-none bg-transparent" style={{ borderColor: t.border, padding: 0 }} />
                  <input type="text" value={activeLayer.color}
                    onChange={(e) => { const val = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(val)) updateLayer('color', val); }}
                    className="flex-1 px-3 py-1.5 rounded-lg border font-mono text-xs outline-none focus:ring-1 transition-colors"
                    style={{ backgroundColor: t.surface, color: `${t.textMuted}e6`, borderColor: t.border }} maxLength={7} />
                </div>

                <ShadowSlider label={labels.opacity} value={activeLayer.opacity} min={0} max={100} step={1} unit="%" onChange={(v) => updateLayer('opacity', v)} theme={t} />

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={activeLayer.inset} onChange={(e) => updateLayer('inset', e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <span className="text-[11px] font-mono group-hover:opacity-80 transition-colors" style={{ color: t.textMuted }}>
                    {labels.inset}
                  </span>
                </label>
              </div>
            </>
          ) : (
            <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px]">A</span>
                <span className="text-xs font-mono" style={{ color: t.textMuted }}>Text Shadow Controls</span>
              </div>
              <ShadowSlider label={labels.xOffset} value={textShadow.x} min={-20} max={20} step={1} unit="px" onChange={(v) => setTextShadow((p) => ({ ...p, x: v }))} theme={t} />
              <ShadowSlider label={labels.yOffset} value={textShadow.y} min={-20} max={20} step={1} unit="px" onChange={(v) => setTextShadow((p) => ({ ...p, y: v }))} theme={t} />
              <ShadowSlider label={labels.blurRadius} value={textShadow.blur} min={0} max={40} step={1} unit="px" onChange={(v) => setTextShadow((p) => ({ ...p, blur: v }))} theme={t} />
              <div className="flex items-center gap-3">
                <input type="color" value={textShadow.color} onChange={(e) => setTextShadow((p) => ({ ...p, color: e.target.value }))}
                  className="w-8 h-8 rounded-lg border cursor-pointer appearance-none bg-transparent" style={{ borderColor: t.border, padding: 0 }} />
                <input type="text" value={textShadow.color}
                  onChange={(e) => { const val = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setTextShadow((p) => ({ ...p, color: val })); }}
                  className="flex-1 px-3 py-1.5 rounded-lg border font-mono text-xs outline-none transition-colors"
                  style={{ backgroundColor: t.surface, color: `${t.textMuted}e6`, borderColor: t.border }} maxLength={7} />
              </div>
              <ShadowSlider label={labels.opacity} value={textShadow.opacity} min={0} max={100} step={1} unit="%" onChange={(v) => setTextShadow((p) => ({ ...p, opacity: v }))} theme={t} />
            </div>
          )}

          {/* Presets */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: t.border }}>
              <span style={{ color: t.accent }}>🎨</span>
              <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>{labels.presets}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3">
              {presets.map((preset, i) => (
                <button key={i} onClick={() => applyPreset(preset)}
                  className="group flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer hover:-translate-y-0.5"
                  style={{ borderColor: t.border, backgroundColor: t.surface }}>
                  <div className="w-full h-10 rounded-md flex items-center justify-center" style={{ background: '#1a1a2e', boxShadow: preset.shadow }}>
                    {mode === 'text' ? (
                      <span className="text-[10px] font-bold" style={{ color: '#1a1a1a', textShadow: preset.shadow.split(', ')[0] }}>Aa</span>
                    ) : (
                      <div className="w-5 h-5 rounded" style={{ background: 'rgba(255,255,255,0.9)' }} />
                    )}
                  </div>
                  <span className="text-[9px] font-mono truncate w-full text-center transition-colors" style={{ color: `${t.textMuted}b3` }}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview + Output */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <ChromeHeader filename="preview" theme={t} />
            <div className="relative p-8 flex items-center justify-center" style={{ minHeight: '260px' }}>
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)',
                backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', opacity: 0.3,
              }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, #0f1117, #1a1a2e)' }} />

              {mode === 'box' ? (
                <div className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 rounded-2xl flex items-center justify-center"
                  style={{ background: 'white', boxShadow: boxShadowCSS }}>
                  <div className="w-6 h-6 rounded-md" style={{ background: `linear-gradient(to bottom right, ${t.accent}, #06b6d4)` }} />
                </div>
              ) : (
                <div className="relative z-10 text-center px-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
                    style={{ color: '#1a1a1a', textShadow: textShadowCSS }}>
                    {labels.previewText}
                  </div>
                  <div className="mt-2 text-sm font-mono" style={{ color: t.textMuted, textShadow: textShadowCSS }}>
                    {labels.previewSubtext}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code output */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: t.surface, borderColor: t.border }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: t.border, backgroundColor: t.surface }}>
              <div className="flex items-center gap-2">
                <IconEye size={12} style={{ color: `${t.textMuted}b3` }} />
                <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}66` }}>Output</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 p-0.5 rounded-md border" style={{ borderColor: t.border }}>
                  {(['css', 'tailwind'] as const).map((fmt) => (
                    <button key={fmt} onClick={() => setExportFormat(fmt)}
                      className="px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer"
                      style={{
                        color: exportFormat === fmt ? '#1a1a1a' : `${t.textMuted}b3`,
                        backgroundColor: exportFormat === fmt ? t.surface : 'transparent',
                      }}>
                      {fmt === 'css' ? 'CSS' : 'TW'}
                    </button>
                  ))}
                </div>
                <button onClick={copyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono border cursor-pointer transition-colors"
                  style={{
                    backgroundColor: t.surface, borderColor: t.border,
                    color: copied ? t.accent : t.textMuted,
                  }}>
                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  {copied ? labels.copied : labels.copy}
                </button>
              </div>
            </div>
            <div className="p-4 max-h-48 overflow-y-auto">
              <pre className="text-xs font-mono leading-relaxed" style={{ color: '#f8f8f2' }}>
                {cssCode.split('\n').map((line, i) => (
                  <CodeLine key={`css-${i}`} lineNum={i + 1}>
                    {line.includes('.element') ? (
                      <>
                        <span style={{ color: '#ff7b72' }}>{line.split(' ')[0]}</span>
                        {line.includes('{') && <span style={{ color: '#c9d1d9' }}> {'{'}</span>}
                      </>
                    ) : line.includes('box-shadow') || line.includes('text-shadow') ? (
                      <>
                        <span style={{ color: '#d2a8ff' }}>{line.split(':')[0]}</span>
                        <span style={{ color: '#c9d1d9' }}>: </span>
                        <span style={{ color: '#a5d6ff' }}>{line.split(': ')[1]}</span>
                      </>
                    ) : (
                      <span>{line}</span>
                    )}
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

export default ShadowGenerator;
