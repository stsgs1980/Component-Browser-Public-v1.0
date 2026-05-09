/**
 * CssFiltersGenerator — CSS Filter Playground
 *
 * A reusable React component for exploring CSS filter functions
 * with real-time image preview, curated presets, before/after
 * comparison, and multi-format export.
 *
 * @module 006_CssFiltersGenerator
 * @example
 * ```tsx
 * <CssFiltersGenerator
 *   imageUrl="/my-image.jpg"
 *   labels={{ title: "CSS Filters" }}
 *   presets={myPresets}
 *   onFilterChange={(css) => console.log(css)}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  useIsMounted,
  copyToClipboard,
  type GeneratorTheme,
  DEFAULT_THEME,
  IconCopy,
  IconCheck,
  IconEye,
  ChromeHeader,
  CodeLine,
} from './shared';

// ─── Types ──────────────────────────────────────────────────────

export interface FilterValues {
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
}

export interface FilterConfig {
  key: keyof FilterValues;
  label: string;
  min: number;
  max: number;
  default: number;
  step: number;
  unit: string;
  cssFn: string;
}

export interface FilterPreset {
  name: string;
  values: FilterValues;
}

export interface CssFiltersLabels {
  title?: string;
  subtitle?: string;
  brightness?: string;
  contrast?: string;
  saturate?: string;
  hueRotate?: string;
  blur?: string;
  grayscale?: string;
  sepia?: string;
  invert?: string;
  preview?: string;
  compare?: string;
  filterControls?: string;
  presets?: string;
  reset?: string;
  copied?: string;
  copyCSS?: string;
  export?: string;
  cssProperty?: string;
  tailwind?: string;
  svg?: string;
  before?: string;
  after?: string;
  filtersActive?: string;
}

export interface CssFiltersProps {
  /** Image URL for preview */
  imageUrl?: string;
  /** Custom filter presets */
  presets?: FilterPreset[];
  /** Custom filter configurations */
  filterConfigs?: FilterConfig[];
  /** Labels */
  labels?: CssFiltersLabels;
  /** Theme */
  theme?: Partial<GeneratorTheme>;
  /** Called when filter CSS changes */
  onFilterChange?: (css: string) => void;
  /** Additional CSS class */
  className?: string;
}

// ─── Defaults ───────────────────────────────────────────────────

const FILTER_CONFIGS: FilterConfig[] = [
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, default: 100, step: 1, unit: '%', cssFn: 'brightness' },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, default: 100, step: 1, unit: '%', cssFn: 'contrast' },
  { key: 'saturate', label: 'Saturate', min: 0, max: 300, default: 100, step: 1, unit: '%', cssFn: 'saturate' },
  { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, default: 0, step: 1, unit: 'deg', cssFn: 'hue-rotate' },
  { key: 'blur', label: 'Blur', min: 0, max: 20, default: 0, step: 0.1, unit: 'px', cssFn: 'blur' },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, default: 0, step: 1, unit: '%', cssFn: 'grayscale' },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, default: 0, step: 1, unit: '%', cssFn: 'sepia' },
  { key: 'invert', label: 'Invert', min: 0, max: 100, default: 0, step: 1, unit: '%', cssFn: 'invert' },
];

const DEFAULT_FILTERS: FilterValues = {
  brightness: 100, contrast: 100, saturate: 100,
  hueRotate: 0, blur: 0, grayscale: 0, sepia: 0, invert: 0,
};

const DEFAULT_PRESETS: FilterPreset[] = [
  { name: 'Vintage', values: { brightness: 110, contrast: 85, saturate: 70, hueRotate: 20, blur: 0, grayscale: 0, sepia: 40, invert: 0 } },
  { name: 'Noir', values: { brightness: 100, contrast: 130, saturate: 0, hueRotate: 0, blur: 0, grayscale: 100, sepia: 0, invert: 0 } },
  { name: 'Warm', values: { brightness: 105, contrast: 105, saturate: 130, hueRotate: 15, blur: 0, grayscale: 0, sepia: 20, invert: 0 } },
  { name: 'Cool', values: { brightness: 105, contrast: 110, saturate: 90, hueRotate: 190, blur: 0, grayscale: 0, sepia: 0, invert: 0 } },
  { name: 'Dramatic', values: { brightness: 90, contrast: 150, saturate: 120, hueRotate: 0, blur: 0, grayscale: 0, sepia: 0, invert: 0 } },
  { name: 'Fade', values: { brightness: 120, contrast: 80, saturate: 60, hueRotate: 0, blur: 0, grayscale: 20, sepia: 10, invert: 0 } },
  { name: 'Pop Art', values: { brightness: 110, contrast: 160, saturate: 250, hueRotate: 0, blur: 0, grayscale: 0, sepia: 0, invert: 0 } },
  { name: 'Cyberpunk', values: { brightness: 110, contrast: 130, saturate: 180, hueRotate: 270, blur: 0, grayscale: 0, sepia: 0, invert: 0 } },
  { name: 'Dreamy', values: { brightness: 115, contrast: 90, saturate: 120, hueRotate: 330, blur: 1.5, grayscale: 0, sepia: 10, invert: 0 } },
  { name: 'Retro', values: { brightness: 95, contrast: 110, saturate: 80, hueRotate: 30, blur: 0, grayscale: 10, sepia: 30, invert: 0 } },
  { name: 'Sunset', values: { brightness: 105, contrast: 110, saturate: 140, hueRotate: 340, blur: 0, grayscale: 0, sepia: 15, invert: 0 } },
  { name: 'Noir Film', values: { brightness: 95, contrast: 140, saturate: 0, hueRotate: 0, blur: 0.3, grayscale: 100, sepia: 5, invert: 0 } },
];

const DEFAULT_LABELS: Required<CssFiltersLabels> = {
  title: 'Filters Lab',
  subtitle: 'Explore CSS filter functions with real-time preview, presets, and code export.',
  brightness: 'Brightness',
  contrast: 'Contrast',
  saturate: 'Saturate',
  hueRotate: 'Hue Rotate',
  blur: 'Blur',
  grayscale: 'Grayscale',
  sepia: 'Sepia',
  invert: 'Invert',
  preview: 'Preview',
  compare: 'Compare',
  filterControls: 'Filter Controls',
  presets: 'Presets',
  reset: 'Reset',
  copied: 'Copied!',
  copyCSS: 'Copy CSS',
  export: 'Export',
  cssProperty: 'CSS Property',
  tailwind: 'Tailwind Arbitrary',
  svg: 'SVG Filter',
  before: 'Before',
  after: 'After',
  filtersActive: 'Filters Active',
};

// ─── Filter Helpers ─────────────────────────────────────────────

export function buildFilterString(filters: FilterValues): string {
  const parts: string[] = [];
  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`);
  if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  if (filters.blur !== 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.grayscale !== 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.sepia !== 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.invert !== 0) parts.push(`invert(${filters.invert}%)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

export function buildAllFilterFunctions(filters: FilterValues): string[] {
  const parts: string[] = [];
  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`);
  if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  if (filters.blur !== 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.grayscale !== 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.sepia !== 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.invert !== 0) parts.push(`invert(${filters.invert}%)`);
  return parts;
}

export function buildTailwindValue(filters: FilterValues): string {
  const filterStr = buildFilterString(filters);
  return filterStr === 'none' ? '' : `filter-[${filterStr.replace(/ /g, '_')}]`;
}

export function buildSVGFilter(filters: FilterValues): string {
  const parts: string[] = [];
  if (filters.brightness !== 100) parts.push(`    <feComponentTransfer><feFuncR type="linear" slope="${filters.brightness / 100}" /><feFuncG type="linear" slope="${filters.brightness / 100}" /><feFuncB type="linear" slope="${filters.brightness / 100}" /></feComponentTransfer>`);
  if (filters.contrast !== 100) parts.push(`    <feComponentTransfer><feFuncR type="linear" intercept="${-(0.5 * (filters.contrast / 100)) + 0.5}" amplitude="${filters.contrast / 100}" /><feFuncG type="linear" intercept="${-(0.5 * (filters.contrast / 100)) + 0.5}" amplitude="${filters.contrast / 100}" /><feFuncB type="linear" intercept="${-(0.5 * (filters.contrast / 100)) + 0.5}" amplitude="${filters.contrast / 100}" /></feComponentTransfer>`);
  if (filters.saturate !== 100) parts.push(`    <feColorMatrix type="saturate" values="${filters.saturate / 100}" />`);
  if (filters.hueRotate !== 0) parts.push(`    <feColorMatrix type="hueRotate" values="${filters.hueRotate}" />`);
  if (filters.blur !== 0) parts.push(`    <feGaussianBlur stdDeviation="${filters.blur}" />`);
  if (filters.grayscale !== 0) parts.push(`    <feColorMatrix type="saturate" values="${1 - filters.grayscale / 100}" />`);
  if (filters.invert !== 0) parts.push(`    <feComponentTransfer><feFuncR type="table" tableValues="${1 - filters.invert / 100} ${filters.invert / 100}" /><feFuncG type="table" tableValues="${1 - filters.invert / 100} ${filters.invert / 100}" /><feFuncB type="table" tableValues="${1 - filters.invert / 100} ${filters.invert / 100}" /></feComponentTransfer>`);
  return `<svg xmlns="http://www.w3.org/2000/svg">\n  <filter id="custom-filter">\n${parts.join('\n')}\n  </filter>\n</svg>`;
}

export function isDefaultFilters(filters: FilterValues): boolean {
  return filters.brightness === 100 && filters.contrast === 100 && filters.saturate === 100 &&
    filters.hueRotate === 0 && filters.blur === 0 && filters.grayscale === 0 &&
    filters.sepia === 0 && filters.invert === 0;
}

// ─── Sub-components ─────────────────────────────────────────────

function FilterSlider({ config, value, onChange, theme }: {
  config: FilterConfig; value: number; onChange: (v: number) => void; theme: GeneratorTheme;
}) {
  const pct = ((value - config.min) / (config.max - config.min)) * 100;
  const isDefault = value === config.default;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: theme.textMuted }}>{config.label}</span>
        <span className="text-[11px] font-mono tabular-nums" style={{ color: isDefault ? `${theme.textMuted}66` : theme.accent }}>
          {value}{config.unit}
        </span>
      </div>
      <input type="range" min={config.min} max={config.max} step={config.step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accentSecondary} ${pct}%, rgba(26,26,26,0.1) ${pct}%)` }} />
    </div>
  );
}

/** Before/after compare slider */
function CompareSlider({ filters, imageUrl }: { filters: FilterValues; imageUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const isDragging = useRef(false);

  const updatePosition = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, x)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e);
  }, [updatePosition]);

  const filterString = buildFilterString(filters);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg cursor-col-resize select-none"
      style={{ aspectRatio: '3/2' }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}>
      <div className="absolute inset-0">
        <img src={imageUrl} alt="Filtered" className="w-full h-full object-cover" draggable={false}
          style={{ filter: filterString === 'none' ? undefined : filterString }} />
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={imageUrl} alt="Original" className="w-full h-full object-cover" draggable={false} />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 z-10"
        style={{ left: `${position}%`, background: 'linear-gradient(to bottom, transparent, #d4a017, #b8860b, transparent)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(26,26,26,0.25)' }}>
          <span className="text-[10px]">↔</span>
        </div>
      </div>
      <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded text-[10px] font-mono" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'rgba(26,26,26,0.8)' }}>Before</div>
      <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded text-[10px] font-mono" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#d4a017' }}>After</div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

/**
 * CssFiltersGenerator — CSS Filter Playground
 *
 * Explore CSS filter functions with real-time preview,
 * curated presets, before/after comparison, and code export.
 */
export function CssFiltersGenerator({
  imageUrl = 'https://picsum.photos/seed/filters-lab/600/400',
  presets = DEFAULT_PRESETS,
  filterConfigs = FILTER_CONFIGS,
  labels: labelOverrides,
  theme: themeOverrides,
  onFilterChange,
  className,
}: CssFiltersProps) {
  const mounted = useIsMounted();
  const t = useMemo(() => ({ ...DEFAULT_THEME, ...themeOverrides }), [themeOverrides]);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);

  const [filters, setFilters] = useState<FilterValues>({ ...DEFAULT_FILTERS });
  const [compareMode, setCompareMode] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const filterString = useMemo(() => buildFilterString(filters), [filters]);
  const allFunctions = useMemo(() => buildAllFilterFunctions(filters), [filters]);
  const hasFilters = !isDefaultFilters(filters);

  useMemo(() => { onFilterChange?.(filterString); }, [filterString, onFilterChange]);

  const updateFilter = useCallback((key: keyof FilterValues, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset: FilterPreset) => {
    setFilters({ ...preset.values });
    setActivePreset(preset.name);
  }, []);

  const handleCopy = useCallback(async (type: string, text: string) => {
    await copyToClipboard(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  }, []);

  const quickCopyCSS = useCallback(() => handleCopy('css', `filter: ${filterString};`), [filterString, handleCopy]);

  if (!mounted) return null;

  const exportOptions = [
    { id: 'css', label: labels.cssProperty, text: `filter: ${filterString};` },
    { id: 'tailwind', label: labels.tailwind, text: buildTailwindValue(filters) ? `class="${buildTailwindValue(filters)}"` : '// No filters' },
    { id: 'svg', label: labels.svg, text: buildSVGFilter(filters) },
  ];

  return (
    <div className={className}>
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
          style={{ borderColor: `${t.accentSecondary}33`, backgroundColor: `${t.accentSecondary}1a` }}>
          <span style={{ color: t.accentSecondary }}>☰</span>
          <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: t.accentSecondary }}>Image Tool</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3"
          style={{
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentSecondary}, #10b981)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
          {labels.title}
        </h2>
        <p className="font-mono text-sm max-w-md mx-auto" style={{ color: `${t.textMuted}b3` }}>{labels.subtitle}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: t.surface, borderColor: t.border }}>
          {([false, true] as const).map((isCompare) => (
            <button key={String(isCompare)} onClick={() => setCompareMode(isCompare)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              style={{
                color: compareMode === isCompare ? '#1a1a1a' : t.textMuted,
                backgroundColor: compareMode === isCompare ? t.surface : 'transparent',
                border: compareMode === isCompare ? `1px solid ${t.border}` : '1px solid transparent',
              }}>
              <span>{isCompare ? '⊞' : <IconEye size={14} style={{ color: compareMode === isCompare ? '#1a1a1a' : t.textMuted }} />}</span>
              <span>{isCompare ? labels.compare : labels.preview}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetFilters} disabled={!hasFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: hasFilters ? t.surface : 'transparent', borderColor: hasFilters ? t.border : 'rgba(26,26,26,0.1)', color: `${t.textMuted}b3` }}>
            ↻ {labels.reset}
          </button>
          <button onClick={quickCopyCSS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-colors"
            style={{ backgroundColor: t.surface, borderColor: t.border, color: copiedType === 'css' ? t.accent : `${t.textMuted}b3` }}>
            {copiedType === 'css' ? <IconCheck size={12} /> : <IconCopy size={12} />}
            {copiedType === 'css' ? labels.copied : labels.copyCSS}
          </button>
          {/* Export dropdown */}
          <div className="relative">
            <button onClick={() => setCopiedType(copiedType === 'dropdown' ? null : 'dropdown')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-colors"
              style={{ backgroundColor: t.surface, borderColor: t.border, color: `${t.textMuted}b3` }}>
              <IconCopy size={12} /> {labels.export} ▾
            </button>
            {copiedType === 'dropdown' && (
              <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] rounded-lg border overflow-hidden shadow-xl"
                style={{ backgroundColor: 'rgba(26,26,46,0.95)', borderColor: t.border }}>
                {exportOptions.map((opt) => (
                  <button key={opt.id} onClick={() => handleCopy(opt.id, opt.text)}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left text-xs font-mono transition-colors cursor-pointer"
                    style={{ color: 'rgba(26,26,26,0.8)' }}>
                    <span style={{ color: `${t.accent}cc` }}>●</span>
                    <span className="flex-1">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image Preview */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
            <ChromeHeader filename={compareMode ? 'comparison' : 'preview'} theme={t} />
            <div className="relative" style={{ minHeight: '300px' }}>
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)',
                backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', opacity: 0.3,
              }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, #0f1117, #1a1a2e)' }} />
              <div className="relative z-10 p-4 sm:p-6">
                {compareMode ? (
                  <CompareSlider filters={filters} imageUrl={imageUrl} />
                ) : (
                  <div className="flex items-center justify-center" style={{ minHeight: '260px' }}>
                    <img src={imageUrl} alt="Filter preview" className="w-full max-w-lg rounded-lg shadow-2xl" draggable={false}
                      style={{ filter: filterString === 'none' ? undefined : filterString }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls + Presets */}
        <div className="lg:col-span-5 space-y-5">
          {/* Filter controls */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: t.border }}>
              <span style={{ color: t.accent }}>☰</span>
              <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>{labels.filterControls}</span>
              {hasFilters && (
                <span className="ml-auto text-[10px] font-mono" style={{ color: `${t.accentSecondary}b3` }}>
                  {allFunctions.length} active
                </span>
              )}
            </div>
            <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
              {filterConfigs.map((config) => (
                <FilterSlider key={config.key} config={config} value={filters[config.key]}
                  onChange={(v) => updateFilter(config.key, v)} theme={t} />
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: t.border }}>
              <span style={{ color: t.accentSecondary }}>🎨</span>
              <span className="text-xs font-mono" style={{ color: `${t.textMuted}b3` }}>{labels.presets}</span>
              <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}80` }}>({presets.length})</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 max-h-[240px] overflow-y-auto">
              {presets.map((preset) => {
                const presetFilter = buildFilterString(preset.values);
                const isActive = activePreset === preset.name;
                return (
                  <button key={preset.name} onClick={() => applyPreset(preset)}
                    className="group flex flex-col items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer"
                    style={{
                      borderColor: isActive ? `${t.accent}66` : t.border,
                      backgroundColor: isActive ? `${t.accent}1a` : t.surface,
                    }}>
                    <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: '3/2' }}>
                      <img src={imageUrl} alt={preset.name} className="w-full h-full object-cover" draggable={false}
                        style={{ filter: presetFilter === 'none' ? undefined : presetFilter }} />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors" />
                    </div>
                    <span className="text-[9px] font-mono truncate w-full text-center transition-colors"
                      style={{ color: isActive ? t.accent : `${t.textMuted}b3` }}>
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="mt-6 rounded-xl border overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.surface }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: t.border, backgroundColor: t.surface }}>
          <span className="text-[10px] font-mono" style={{ color: `${t.textMuted}66` }}>Generated CSS</span>
          <button onClick={quickCopyCSS}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono border cursor-pointer"
            style={{ backgroundColor: t.surface, borderColor: t.border, color: copiedType === 'css' ? t.accent : t.textMuted }}>
            {copiedType === 'css' ? <IconCheck size={12} /> : <IconCopy size={12} />}
            {copiedType === 'css' ? labels.copied : labels.copy}
          </button>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono leading-relaxed" style={{ color: '#f8f8f2' }}>
            <CodeLine lineNum={1}>
              <span style={{ color: '#ff7b72' }}>.element</span>
              <span style={{ color: '#c9d1d9' }}> {'{'}</span>
            </CodeLine>
            <CodeLine lineNum={2}>
              <span style={{ color: '#d2a8ff' }}>filter</span>
              <span style={{ color: '#c9d1d9' }}>: </span>
              {allFunctions.length === 0 ? (
                <span style={{ color: '#a5d6ff' }}> none</span>
              ) : allFunctions.map((fn, i) => {
                const match = fn.match(/^(\w[\w-]*)\((.+)\)$/);
                if (!match) return null;
                const [, fnName, fnValue] = match;
                return (
                  <span key={`fn-${i}`}>
                    {i > 0 && <span style={{ color: '#c9d1d9' }}> </span>}
                    <span style={{ color: '#d2a8ff' }}>{fnName}</span>
                    <span style={{ color: '#c9d1d9' }}>(</span>
                    <span style={{ color: '#a5d6ff' }}>{fnValue}</span>
                    <span style={{ color: '#c9d1d9' }}>)</span>
                  </span>
                );
              })}
              <span style={{ color: '#c9d1d9' }}>;</span>
            </CodeLine>
            <CodeLine lineNum={3}>
              <span style={{ color: '#c9d1d9' }}>{'}'}</span>
            </CodeLine>

            {/* Individual functions breakdown */}
            {allFunctions.length > 1 && (
              <>
                <CodeLine lineNum={5}>
                  <span style={{ color: '#8b949e' }}>{'/* Individual functions */'}</span>
                </CodeLine>
                {allFunctions.map((fn, i) => {
                  const match = fn.match(/^(\w[\w-]*)\((.+)\)$/);
                  if (!match) return null;
                  return (
                    <CodeLine key={i} lineNum={6 + i}>
                      <span style={{ color: '#8b949e' }}>{`/* ${match[1]} */`}</span>{' '}
                      <span style={{ color: '#d2a8ff' }}>filter</span>
                      <span style={{ color: '#c9d1d9' }}>: </span>
                      <span style={{ color: '#d2a8ff' }}> {match[1]}</span>
                      <span style={{ color: '#c9d1d9' }}>(</span>
                      <span style={{ color: '#a5d6ff' }}>{match[2]}</span>
                      <span style={{ color: '#c9d1d9' }}>)</span>
                      <span style={{ color: '#c9d1d9' }}>; </span>
                    </CodeLine>
                  );
                })}
              </>
            )}

            {/* Tailwind version */}
            {hasFilters && (
              <>
                <CodeLine lineNum={6 + (allFunctions.length > 1 ? allFunctions.length + 1 : 0)}>
                  <span style={{ color: '#8b949e' }}>{'/* Tailwind CSS */'}</span>
                </CodeLine>
                <CodeLine lineNum={7 + (allFunctions.length > 1 ? allFunctions.length + 1 : 0)}>
                  <span className="syn-value">{`class="${buildTailwindValue(filters)}"`}</span>
                </CodeLine>
              </>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CssFiltersGenerator;
