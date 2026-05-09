// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 967

'use client';

import { useState, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  Copy,
  Check,
  RotateCcw,
  ArrowLeftRight,
  Code2,
  Palette,
  Sparkles,
  Eye,
  FileImage,
  ChevronDown,
  Columns,
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
interface FilterValues {
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
}

interface FilterConfig {
  key: keyof FilterValues;
  label: string;
  min: number;
  max: number;
  default: number;
  step: number;
  unit: string;
  cssFn: string;
}

interface FilterPreset {
  name: string;
  values: FilterValues;
}

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */
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
  brightness: 100,
  contrast: 100,
  saturate: 100,
  hueRotate: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
};

const PRESETS: FilterPreset[] = [
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

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function buildFilterString(filters: FilterValues): string {
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

function buildAllFilterFunctions(filters: FilterValues): string[] {
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

function buildSVGFilter(filters: FilterValues): string {
  return `<svg xmlns="http://www.w3.org/2000/svg">\n  <filter id="custom-filter">\n${filters.brightness !== 100 ? `    <feComponentTransfer>\n      <feFuncR type="linear" slope="${filters.brightness / 100}" />\n      <feFuncG type="linear" slope="${filters.brightness / 100}" />\n      <feFuncB type="linear" slope="${filters.brightness / 100}" />\n    </feComponentTransfer>\n` : ''}${filters.contrast !== 100 ? `    <feComponentTransfer>\n      <feFuncR type="linear" intercept="${-(0.5 * (filters.contrast / 100)) + 0.5}" amplitude="${filters.contrast / 100}" />\n      <feFuncG type="linear" intercept="${-(0.5 * (filters.contrast / 100)) + 0.5}" amplitude="${filters.contrast / 100}" />\n      <feFuncB type="linear" intercept="${-(0.5 * (filters.contrast / 100)) + 0.5}" amplitude="${filters.contrast / 100}" />\n    </feComponentTransfer>\n` : ''}${filters.saturate !== 100 ? `    <feColorMatrix type="saturate" values="${filters.saturate / 100}" />\n` : ''}${filters.hueRotate !== 0 ? `    <feColorMatrix type="hueRotate" values="${filters.hueRotate}" />\n` : ''}${filters.blur !== 0 ? `    <feGaussianBlur stdDeviation="${filters.blur}" />\n` : ''}${filters.grayscale !== 0 ? `    <feColorMatrix type="saturate" values="${1 - filters.grayscale / 100}" />\n` : ''}${filters.sepia !== 0 ? `    <feColorMatrix type="matrix" values="${(0.393 + 0.607 * (1 - filters.sepia / 100))} ${(0.769 - 0.769 * (filters.sepia / 100))} ${(0.189 - 0.189 * (filters.sepia / 100))} 0 0 ${(-0.349 * (1 - (1 - filters.sepia / 100)) + 0.349)} ${((1 - (1 - filters.sepia / 100)) * (1.0 - 0.311) + (1 - filters.sepia / 100) * 0.686)} ${(-(1 - filters.sepia / 100) * 0.168 + (1 - filters.sepia / 100) * 0.168)} 0 0 ${(-(1 - (1 - filters.sepia / 100)) * 0.272 + (1 - filters.sepia / 100) * 0.272)} ${(1 - (1 - filters.sepia / 100) * 0.534 + (1 - filters.sepia / 100) * 0.534)} ${((1 - (1 - filters.sepia / 100)) * 1.131 + (1 - filters.sepia / 100) * (-0.131))} 0 0 0 0 0 1 0" />\n` : ''}${filters.invert !== 0 ? `    <feComponentTransfer>\n      <feFuncR type="table" tableValues="${1 - filters.invert / 100} ${filters.invert / 100}" />\n      <feFuncG type="table" tableValues="${1 - filters.invert / 100} ${filters.invert / 100}" />\n      <feFuncB type="table" tableValues="${1 - filters.invert / 100} ${filters.invert / 100}" />\n    </feComponentTransfer>\n` : ''}  </filter>\n</svg>`;
}

function buildTailwindValue(filters: FilterValues): string {
  const filterStr = buildFilterString(filters);
  return filterStr === 'none'
    ? ''
    : `filter-[${filterStr.replace(/ /g, '_')}]`;
}

function isDefaultFilters(filters: FilterValues): boolean {
  return (
    filters.brightness === 100 &&
    filters.contrast === 100 &&
    filters.saturate === 100 &&
    filters.hueRotate === 0 &&
    filters.blur === 0 &&
    filters.grayscale === 0 &&
    filters.sepia === 0 &&
    filters.invert === 0
  );
}

/* ──────────────────────────────────────────────
   CUSTOM SLIDER
   ────────────────────────────────────────────── */
function FilterSlider({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - config.min) / (config.max - config.min)) * 100;
  const isDefault = value === config.default;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
          {config.label}
        </span>
        <span className={`text-[11px] font-mono tabular-nums ${isDefault ? 'text-white/25' : 'text-emerald-400/80'}`}>
          {value}
          {config.unit}
        </span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #10b981 0%, #06b6d4 ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   FLOATING DECORATIONS
   ────────────────────────────────────────────── */
function FloatingDecorations() {
  const symbols = [
    { text: 'filter:', x: 3, y: 8, delay: 0 },
    { text: 'blur(5px)', x: 88, y: 12, delay: 1.5 },
    { text: 'grayscale()', x: 90, y: 55, delay: 0.8 },
    { text: 'saturate()', x: 5, y: 72, delay: 2.2 },
    { text: 'hue-rotate', x: 78, y: 88, delay: 1.0 },
    { text: 'sepia()', x: 12, y: 42, delay: 0.3 },
    { text: 'contrast()', x: 85, y: 35, delay: 1.8 },
    { text: 'invert()', x: 6, y: 90, delay: 0.6 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {symbols.map((sym, i) => (
        <motion.div
          key={`filter-deco-${i}`}
          className="absolute font-mono text-[10px] whitespace-nowrap select-none"
          style={{
            left: `${sym.x}%`,
            top: `${sym.y}%`,
            color: 'rgba(6, 182, 212, 0.07)',
          }}
          animate={{ y: [0, -10, 0], opacity: [0.04, 0.12, 0.04] }}
          transition={{ duration: 7 + i * 0.8, repeatType: "loop", repeat: Infinity, ease: 'easeInOut', delay: sym.delay }}
        >
          {sym.text}
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   COMPARE SLIDER
   ────────────────────────────────────────────── */
function CompareSlider({
  filters,
  imageUrl,
}: {
  filters: FilterValues;
  imageUrl: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const isDragging = useRef(false);

  const updatePosition = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setPosition(Math.max(0, Math.min(100, x)));
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updatePosition(e);
    },
    [updatePosition]
  );

  const filterString = buildFilterString(filters);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg cursor-col-resize select-none"
      style={{ aspectRatio: '3/2' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* After (filtered) — full width behind */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt="Filtered"
          className="w-full h-full object-cover"
          style={{ filter: filterString === 'none' ? undefined : filterString }}
          draggable={false}
        />
      </div>

      {/* Before (original) — clipped */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img
          src={imageUrl}
          alt="Original"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 z-10"
        style={{
          left: `${position}%`,
          background: 'linear-gradient(to bottom, transparent, #10b981, #06b6d4, transparent)',
        }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm flex items-center justify-center">
          <ArrowLeftRight className="w-3.5 h-3.5 text-white/70" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-[10px] font-mono text-white/60">
        Before
      </div>
      <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-[10px] font-mono text-emerald-400/80">
        After
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   EXPORT DROPDOWN
   ────────────────────────────────────────────── */
function ExportDropdown({
  filters,
  copiedType,
  onCopy,
}: {
  filters: FilterValues;
  copiedType: string | null;
  onCopy: (type: string, text: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const filterString = buildFilterString(filters);
  const tailwindVal = buildTailwindValue(filters);
  const svgFilter = buildSVGFilter(filters);

  const options = [
    {
      id: 'css',
      label: 'CSS Property',
      text: `filter: ${filterString};`,
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'tailwind',
      label: 'Tailwind Arbitrary',
      text: tailwindVal ? `class="${tailwindVal}"` : '// No filters applied',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: 'svg',
      label: 'SVG Filter',
      text: svgFilter,
      icon: <FileImage className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/50 hover:text-white/80 hover:border-white/[0.15] transition-colors cursor-pointer"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
      >
        <Copy className="w-3 h-3" />
        Export
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] rounded-lg border border-white/[0.1] bg-[#1a1a2e]/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={`export-${opt.id}`}
                onClick={() => {
                  onCopy(opt.id, opt.text);
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left text-xs font-mono text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <span className="text-emerald-400/60">{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                {copiedType === opt.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function CssFiltersSection() {
  const mounted = useIsMounted();
  const [filters, setFilters] = useState<FilterValues>({ ...DEFAULT_FILTERS });
  const [compareMode, setCompareMode] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const filterString = useMemo(() => buildFilterString(filters), [filters]);
  const allFunctions = useMemo(() => buildAllFilterFunctions(filters), [filters]);
  const hasFilters = !isDefaultFilters(filters);

  // Update a single filter value
  const updateFilter = useCallback((key: keyof FilterValues, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setActivePreset(null);
  }, []);

  // Apply a preset
  const applyPreset = useCallback((preset: FilterPreset) => {
    setFilters({ ...preset.values });
    setActivePreset(preset.name);
  }, []);

  // Copy to clipboard
  const handleCopy = useCallback((type: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  }, []);

  // Quick copy CSS
  const quickCopyCSS = useCallback(() => {
    handleCopy('css', `filter: ${filterString};`);
  }, [filterString, handleCopy]);

  if (!mounted) return <div className="min-h-screen" />;

  const imageUrl = 'https://picsum.photos/seed/filters-lab/600/400';

  return (
    <section className="relative w-full min-h-screen py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a1210] to-[#0a1a15]" />

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <FloatingDecorations />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6">
        {/* ──── Section Header ──── */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] mb-4">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400/70">
              Image Tool
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span
              className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% 100%', animation: 'gradient-shift 6s ease infinite' }}
            >
              Filters Lab
            </span>
          </h2>
          <p className="text-sm text-white/30 font-mono max-w-md mx-auto">
            Explore CSS filter functions with real-time preview, curated presets, and code export.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-mono text-white/25">
            <span>8 Filters</span>
            <span className="text-emerald-500/40">/</span>
            <span>12 Presets</span>
            <span className="text-emerald-500/40">/</span>
            <span>Real-time Preview</span>
            <span className="text-emerald-500/40">/</span>
            <span>CSS Export</span>
          </div>
        </motion.div>

        {/* ──── Toolbar ──── */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-3 mb-6"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Compare mode toggle */}
          <div className="relative flex items-center gap-1 p-1 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
            <button
              onClick={() => setCompareMode(false)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                !compareMode ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {!compareMode && (
                <motion.div
                  layoutId="filter-mode-bg"
                  className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.08]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Eye className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Preview</span>
            </button>
            <button
              onClick={() => setCompareMode(true)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                compareMode ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {compareMode && (
                <motion.div
                  layoutId="filter-mode-bg"
                  className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.08]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Columns className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Compare</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={resetFilters}
              disabled={!hasFilters}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                hasFilters
                  ? 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80 hover:border-white/[0.15]'
                  : 'border-white/[0.04] bg-transparent text-white/15 cursor-not-allowed'
              }`}
              whileHover={hasFilters ? { y: -1 } : undefined}
              whileTap={hasFilters ? { scale: 0.97 } : undefined}
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </motion.button>

            <motion.button
              onClick={quickCopyCSS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/50 hover:text-white/80 hover:border-white/[0.15] transition-colors cursor-pointer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {copiedType === 'css' ? (
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

            <ExportDropdown filters={filters} copiedType={copiedType} onCopy={handleCopy} />
          </div>
        </motion.div>

        {/* ──── Main Grid ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ──── Left: Image Preview ──── */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              {/* VS Code chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <Eye className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] font-mono text-white/25">
                    {compareMode ? 'Before / After Comparison' : 'Live Preview'}
                  </span>
                </div>
                {hasFilters && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400/50">Filters Active</span>
                  </div>
                )}
              </div>

              {/* Preview area */}
              <div className="relative" style={{ minHeight: '300px' }}>
                {/* Checkerboard bg */}
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
                {/* Dark base */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f1117] to-[#1a1a2e]" />

                <div className="relative z-10 p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    {compareMode ? (
                      <motion.div
                        key="compare-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CompareSlider filters={filters} imageUrl={imageUrl} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center"
                        style={{ minHeight: '260px' }}
                      >
                        <img
                          src={imageUrl}
                          alt="Filter preview"
                          className="w-full max-w-lg rounded-lg shadow-2xl"
                          style={{
                            filter: filterString === 'none' ? undefined : filterString,
                          }}
                          draggable={false}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ──── Right: Controls + Presets ──── */}
          <motion.div
            className="lg:col-span-5 space-y-5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Filter Controls */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400/70" />
                <span className="text-xs font-mono text-white/50">Filter Controls</span>
                {hasFilters && (
                  <span className="ml-auto text-[10px] font-mono text-cyan-400/50">
                    {allFunctions.length} active
                  </span>
                )}
              </div>
              <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar">
                {FILTER_CONFIGS.map((config) => (
                  <FilterSlider
                    key={`filter-ctrl-${config.key}`}
                    config={config}
                    value={filters[config.key]}
                    onChange={(v) => updateFilter(config.key, v)}
                  />
                ))}
              </div>
            </div>

            {/* Presets */}
            <motion.div
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <Palette className="w-3.5 h-3.5 text-cyan-400/70" />
                <span className="text-xs font-mono text-white/50">Presets</span>
                <span className="text-[10px] font-mono text-white/20 ml-1">({PRESETS.length})</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 max-h-[240px] overflow-y-auto custom-scrollbar">
                {PRESETS.map((preset) => {
                  const presetFilter = buildFilterString(preset.values);
                  const isActive = activePreset === preset.name;
                  return (
                    <motion.button
                      key={`filter-preset-${preset.name}`}
                      onClick={() => applyPreset(preset)}
                      className={`group flex flex-col items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'border-emerald-500/40 bg-emerald-500/[0.08]'
                          : 'border-white/[0.04] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.04]'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: '3/2' }}>
                        <img
                          src={imageUrl}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          style={{
                            filter: presetFilter === 'none' ? undefined : presetFilter,
                          }}
                          draggable={false}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <span
                        className={`text-[9px] font-mono truncate w-full text-center transition-colors ${
                          isActive ? 'text-emerald-400' : 'text-white/30 group-hover:text-white/50'
                        }`}
                      >
                        {preset.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ──── CSS Output Panel ──── */}
        <motion.div
          className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-emerald-400/70" />
              <span className="text-[10px] font-mono text-white/25">Generated CSS</span>
            </div>
            <motion.button
              onClick={quickCopyCSS}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono text-white/40 hover:text-white/70 border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {copiedType === 'css' ? (
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
                {/* Line 1: selector */}
                <div className="flex">
                  <span className="text-white/10 w-6 text-right mr-4 select-none">1</span>
                  <span>
                    <span className="syn-tag">.element</span>
                    <span className="syn-punctuation">{' {'}</span>
                  </span>
                </div>

                {/* Line 2: filter property */}
                <div className="flex">
                  <span className="text-white/10 w-6 text-right mr-4 select-none">2</span>
                  <span>
                    <span className="syn-property">filter</span>
                    <span className="syn-punctuation">:</span>
                    {allFunctions.length === 0 ? (
                      <span className="syn-value"> none</span>
                    ) : (
                      <span>
                        {allFunctions.map((fn, i) => {
                          const match = fn.match(/^(\w[\w-]*)\((.+)\)$/);
                          if (!match) return null;
                          const [, fnName, fnValue] = match;
                          return (
                            <span key={`fn-syn-${i}`}>
                              {i > 0 && <span className="syn-punctuation"> </span>}
                              <span className="syn-function">{fnName}</span>
                              <span className="syn-punctuation">(</span>
                              <span className="syn-number">{fnValue}</span>
                              <span className="syn-punctuation">)</span>
                            </span>
                          );
                        })}
                        <span className="syn-punctuation">;</span>
                      </span>
                    )}
                  </span>
                </div>

                {/* Line 3: closing brace */}
                <div className="flex">
                  <span className="text-white/10 w-6 text-right mr-4 select-none">3</span>
                  <span className="syn-punctuation">{'}'}</span>
                </div>

                {/* Individual functions breakdown */}
                {allFunctions.length > 1 && (
                  <>
                    <div className="flex mt-3 mb-1">
                      <span className="text-white/10 w-6 mr-4" />
                      <span className="syn-comment">{'/* Individual functions */'}</span>
                    </div>
                    {allFunctions.map((fn, i) => {
                      const match = fn.match(/^(\w[\w-]*)\((.+)\)$/);
                      if (!match) return null;
                      const [, fnName, fnValue] = match;
                      const lineNum = 5 + i;
                      return (
                        <div key={`fn-line-${i}`} className="flex">
                          <span className="text-white/10 w-6 text-right mr-4 select-none">
                            {lineNum}
                          </span>
                          <span>
                            <span className="syn-comment">{'/* '}{fnName}{' */'}</span>
                            <span className="syn-punctuation">{' '}</span>
                            <span className="syn-property">filter</span>
                            <span className="syn-punctuation">:</span>
                            <span className="syn-function">{' '}{fnName}</span>
                            <span className="syn-punctuation">(</span>
                            <span className="syn-number">{fnValue}</span>
                            <span className="syn-punctuation">)</span>
                            <span className="syn-punctuation">;</span>
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Tailwind version */}
                {hasFilters && (
                  <>
                    <div className="flex mt-3 mb-1">
                      <span className="text-white/10 w-6 mr-4" />
                      <span className="syn-comment">{'/* Tailwind CSS */'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-white/10 w-6 text-right mr-4 select-none">
                        {5 + (allFunctions.length > 1 ? allFunctions.length + 1 : 0)}
                      </span>
                      <span>
                        <span className="syn-tag">&lt;div</span>
                        <span className="syn-attr">{' class'}</span>
                        <span className="syn-punctuation">{'="'}</span>
                        <span className="syn-value">{'filter-['}{buildTailwindValue(filters).replace('filter-[', '')}</span>
                        <span className="syn-punctuation">"{'>'}</span>
                      </span>
                    </div>
                  </>
                )}
              </code>
            </pre>
          </div>
        </motion.div>

        {/* ──── Info Bar ──── */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-4 text-[10px] font-mono text-white/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
            8 Filters
          </span>
          <span className="text-white/10">/</span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-cyan-500/50" />
            12 Presets
          </span>
          <span className="text-white/10">/</span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
            Real-time Preview
          </span>
          <span className="text-white/10">/</span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-cyan-500/50" />
            CSS Export
          </span>
        </motion.div>
      </div>
    </section>
  );
}
