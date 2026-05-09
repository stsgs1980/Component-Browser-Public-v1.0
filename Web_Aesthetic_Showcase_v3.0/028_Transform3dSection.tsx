// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1137

'use client';

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useSyncExternalStore,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Copy,
  Check,
  RotateCcw,
  Play,
  Pause,
  Code2,
  Eye,
  Sparkles,
  Gauge,
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
interface TransformValues {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  perspective: number;
  skewX: number;
  skewY: number;
  transformStyle: 'flat' | 'preserve-3d';
  backfaceVisibility: 'visible' | 'hidden';
}

interface SliderConfig {
  key: keyof TransformValues;
  label: string;
  group: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
}

interface Preset {
  name: string;
  values: Partial<TransformValues>;
}

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */
const DEFAULTS: TransformValues = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  perspective: 800,
  skewX: 0,
  skewY: 0,
  transformStyle: 'preserve-3d',
  backfaceVisibility: 'visible',
};

const SLIDERS: SliderConfig[] = [
  { key: 'rotateX', label: 'Rotate X', group: 'Rotation', min: -360, max: 360, step: 1, unit: '°', defaultValue: 0 },
  { key: 'rotateY', label: 'Rotate Y', group: 'Rotation', min: -360, max: 360, step: 1, unit: '°', defaultValue: 0 },
  { key: 'rotateZ', label: 'Rotate Z', group: 'Rotation', min: -360, max: 360, step: 1, unit: '°', defaultValue: 0 },
  { key: 'translateX', label: 'Translate X', group: 'Translation', min: -200, max: 200, step: 1, unit: 'px', defaultValue: 0 },
  { key: 'translateY', label: 'Translate Y', group: 'Translation', min: -200, max: 200, step: 1, unit: 'px', defaultValue: 0 },
  { key: 'translateZ', label: 'Translate Z', group: 'Translation', min: -200, max: 200, step: 1, unit: 'px', defaultValue: 0 },
  { key: 'scaleX', label: 'Scale X', group: 'Scale', min: 0.1, max: 3, step: 0.1, unit: '×', defaultValue: 1 },
  { key: 'scaleY', label: 'Scale Y', group: 'Scale', min: 0.1, max: 3, step: 0.1, unit: '×', defaultValue: 1 },
  { key: 'scaleZ', label: 'Scale Z', group: 'Scale', min: 0.1, max: 3, step: 0.1, unit: '×', defaultValue: 1 },
  { key: 'perspective', label: 'Perspective', group: 'Perspective', min: 100, max: 2000, step: 10, unit: 'px', defaultValue: 800 },
  { key: 'skewX', label: 'Skew X', group: 'Skew', min: -45, max: 45, step: 1, unit: '°', defaultValue: 0 },
  { key: 'skewY', label: 'Skew Y', group: 'Skew', min: -45, max: 45, step: 1, unit: '°', defaultValue: 0 },
];

const PRESETS: Preset[] = [
  { name: 'Isometric', values: { rotateX: 55, rotateY: -45 } },
  { name: 'Flip X', values: { rotateX: 180, rotateY: 0, rotateZ: 0 } },
  { name: 'Flip Y', values: { rotateY: 180, rotateX: 0, rotateZ: 0 } },
  { name: 'Card Tilt', values: { rotateX: 15, rotateY: -15, translateZ: 30 } },
  { name: 'Diamond', values: { rotateX: 45, rotateY: 45, rotateZ: 45 } },
  { name: 'Space', values: { rotateX: 20, rotateY: 200, translateZ: -50, scaleX: 0.8, scaleY: 0.8, scaleZ: 0.8, perspective: 600 } },
  { name: 'Depth Zoom', values: { translateZ: 80, scaleX: 1.5, scaleY: 1.5, scaleZ: 1.5, perspective: 400 } },
  { name: 'Wobble', values: { rotateX: -10, rotateY: 20, rotateZ: 5, skewX: 10, skewY: -5 } },
];

const CUBE_FACES = [
  { name: 'Front', transform: 'translateZ(50px)', bg: 'linear-gradient(135deg, rgba(16,185,129,0.85), rgba(5,150,105,0.85))', border: 'rgba(16,185,129,0.5)' },
  { name: 'Back', transform: 'rotateY(180deg) translateZ(50px)', bg: 'linear-gradient(135deg, rgba(6,182,212,0.85), rgba(8,145,178,0.85))', border: 'rgba(6,182,212,0.5)' },
  { name: 'Right', transform: 'rotateY(90deg) translateZ(50px)', bg: 'linear-gradient(135deg, rgba(168,85,247,0.85), rgba(147,51,234,0.85))', border: 'rgba(168,85,247,0.5)' },
  { name: 'Left', transform: 'rotateY(-90deg) translateZ(50px)', bg: 'linear-gradient(135deg, rgba(236,72,153,0.85), rgba(219,39,119,0.85))', border: 'rgba(236,72,153,0.5)' },
  { name: 'Top', transform: 'rotateX(90deg) translateZ(50px)', bg: 'linear-gradient(135deg, rgba(245,158,11,0.85), rgba(217,119,6,0.85))', border: 'rgba(245,158,11,0.5)' },
  { name: 'Bottom', transform: 'rotateX(-90deg) translateZ(50px)', bg: 'linear-gradient(135deg, rgba(20,184,166,0.85), rgba(13,148,136,0.85))', border: 'rgba(20,184,166,0.5)' },
];

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function buildTransformString(v: TransformValues): string {
  const parts: string[] = [];
  if (v.rotateX !== 0) parts.push(`rotateX(${v.rotateX}deg)`);
  if (v.rotateY !== 0) parts.push(`rotateY(${v.rotateY}deg)`);
  if (v.rotateZ !== 0) parts.push(`rotateZ(${v.rotateZ}deg)`);
  if (v.translateX !== 0) parts.push(`translateX(${v.translateX}px)`);
  if (v.translateY !== 0) parts.push(`translateY(${v.translateY}px)`);
  if (v.translateZ !== 0) parts.push(`translateZ(${v.translateZ}px)`);
  if (v.scaleX !== 1) parts.push(`scaleX(${v.scaleX})`);
  if (v.scaleY !== 1) parts.push(`scaleY(${v.scaleY})`);
  if (v.scaleZ !== 1) parts.push(`scaleZ(${v.scaleZ})`);
  if (v.skewX !== 0) parts.push(`skewX(${v.skewX}deg)`);
  if (v.skewY !== 0) parts.push(`skewY(${v.skewY}deg)`);
  return parts.length > 0 ? parts.join('\n      ') : 'none';
}

function buildFullTransform(v: TransformValues): string {
  return [
    `rotateX(${v.rotateX}deg)`,
    `rotateY(${v.rotateY}deg)`,
    `rotateZ(${v.rotateZ}deg)`,
    `translateX(${v.translateX}px)`,
    `translateY(${v.translateY}px)`,
    `translateZ(${v.translateZ}px)`,
    `scaleX(${v.scaleX})`,
    `scaleY(${v.scaleY})`,
    `scaleZ(${v.scaleZ})`,
    `skewX(${v.skewX}deg)`,
    `skewY(${v.skewY}deg)`,
  ].join(' ');
}

function getActiveCount(v: TransformValues): number {
  let count = 0;
  if (v.rotateX !== 0) count++;
  if (v.rotateY !== 0) count++;
  if (v.rotateZ !== 0) count++;
  if (v.translateX !== 0) count++;
  if (v.translateY !== 0) count++;
  if (v.translateZ !== 0) count++;
  if (v.scaleX !== 1) count++;
  if (v.scaleY !== 1) count++;
  if (v.scaleZ !== 1) count++;
  if (v.perspective !== 800) count++;
  if (v.skewX !== 0) count++;
  if (v.skewY !== 0) count++;
  if (v.transformStyle !== 'preserve-3d') count++;
  if (v.backfaceVisibility !== 'visible') count++;
  return count;
}

function formatVal(v: number, step: number): string {
  return step < 1 ? v.toFixed(1) : String(v);
}

/* ──────────────────────────────────────────────
   CUSTOM SLIDER
   ────────────────────────────────────────────── */
function TransformSlider({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - config.min) / (config.max - config.min)) * 100;
  const isDefault = value === config.defaultValue;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
          {config.label}
        </span>
        <span
          className={`text-[11px] font-mono tabular-nums ${
            isDefault ? 'text-white/25' : 'text-emerald-400/80'
          }`}
        >
          {formatVal(value, config.step)}
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
    { text: 'rotate3d()', x: 4, y: 8, delay: 0 },
    { text: 'perspective', x: 86, y: 12, delay: 1.5 },
    { text: '⟳', x: 91, y: 55, delay: 0.8 },
    { text: 'translateZ', x: 6, y: 72, delay: 2.2 },
    { text: 'preserve-3d', x: 76, y: 88, delay: 1.0 },
    { text: '⟨x,y,z⟩', x: 10, y: 42, delay: 0.3 },
    { text: 'matrix3d', x: 82, y: 35, delay: 1.8 },
    { text: 'backface', x: 5, y: 90, delay: 0.6 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {symbols.map((sym, i) => (
        <motion.div
          key={`t3d-deco-${i}`}
          className="absolute font-mono text-[10px] whitespace-nowrap select-none"
          style={{
            left: `${sym.x}%`,
            top: `${sym.y}%`,
            color: 'rgba(168, 85, 247, 0.07)',
          }}
          animate={{ y: [0, -10, 0], opacity: [0.04, 0.12, 0.04] }}
          transition={{
            duration: 7 + i * 0.8,
            repeatType: 'loop',
            repeat: Infinity,
            ease: 'easeInOut',
            delay: sym.delay,
          }}
        >
          {sym.text}
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   TOGGLE BUTTON GROUP
   ────────────────────────────────────────────── */
function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative flex items-center gap-1 p-1 rounded-lg border border-white/[0.06] bg-white/[0.03]">
      {options.map((opt) => (
        <button
          key={`toggle-${opt.value}`}
          onClick={() => onChange(opt.value)}
          className={`relative flex items-center px-3 py-1.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
            value === opt.value
              ? 'text-white'
              : 'text-white/35 hover:text-white/55'
          }`}
        >
          {value === opt.value && (
            <motion.div
              layoutId={`toggle-${options[0].label}-bg`}
              className="absolute inset-0 rounded-md border border-white/10 bg-white/[0.08]"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function Transform3dSection() {
  const mounted = useIsMounted();
  const [values, setValues] = useState<TransformValues>({ ...DEFAULTS });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(1);

  // Refs
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragBase = useRef({ rx: 0, ry: 0 });
  const speedRef = useRef(autoSpeed);

  // Keep speedRef in sync
  useEffect(() => {
    speedRef.current = autoSpeed;
  }, [autoSpeed]);

  // Auto-rotate animation
  useEffect(() => {
    if (!autoRotate) return;
    let frameId: number;
    const animate = () => {
      if (!isDragging.current) {
        setValues((prev) => ({
          ...prev,
          rotateY: Math.round(prev.rotateY + speedRef.current * 0.5),
        }));
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [autoRotate]);

  // Pointer drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      setValues((prev) => {
        dragBase.current = { rx: prev.rotateX, ry: prev.rotateY };
        return prev;
      });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setValues((prev) => ({
      ...prev,
      rotateX: Math.round(dragBase.current.rx - dy * 0.4),
      rotateY: Math.round(dragBase.current.ry + dx * 0.4),
    }));
    setActivePreset(null);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Update a single value
  const updateValue = useCallback(
    (key: keyof TransformValues, val: number | string) => {
      setValues((prev) => ({ ...prev, [key]: val }));
      setActivePreset(null);
    },
    []
  );

  // Apply preset
  const applyPreset = useCallback((preset: Preset) => {
    setValues((prev) => ({ ...prev, ...preset.values }));
    setActivePreset(preset.name);
  }, []);

  // Reset
  const resetAll = useCallback(() => {
    setValues({ ...DEFAULTS });
    setActivePreset(null);
  }, []);

  // Copy CSS
  const copyCSS = useCallback(() => {
    const ts = buildTransformString(values);
    const perspective = values.perspective !== 800 ? `perspective: ${values.perspective}px;` : '';
    const tsStyle = values.transformStyle !== 'preserve-3d' ? `transform-style: ${values.transformStyle};` : '';
    const bfVis = values.backfaceVisibility !== 'visible' ? `backface-visibility: ${values.backfaceVisibility};` : '';

    let code = `.cube-wrapper {\n  perspective: ${values.perspective}px;\n}\n\n.cube {\n  transform: ${ts === 'none' ? 'none' : buildFullTransform(values)};\n  transform-style: ${values.transformStyle};\n  backface-visibility: ${values.backfaceVisibility};\n}`;

    try {
      navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [values]);

  // Computed
  const activeCount = useMemo(() => getActiveCount(values), [values]);
  const hasChanges = activeCount > 0;
  const transformStyle = useMemo(() => buildFullTransform(values), [values]);

  // CSS code lines
  const codeLines = useMemo(() => {
    const lines: Array<{
      tokens: Array<{ text: string; cls?: string }>;
    }> = [];

    // Line 1: .cube-wrapper {
    lines.push({
      tokens: [
        { text: '.cube-wrapper', cls: 'syn-tag' },
        { text: ' {', cls: 'syn-punctuation' },
      ],
    });

    // Line 2: perspective
    lines.push({
      tokens: [
        { text: '  perspective', cls: 'syn-property' },
        { text: ': ', cls: 'syn-punctuation' },
        { text: `${values.perspective}px`, cls: 'syn-number' },
        { text: ';', cls: 'syn-punctuation' },
      ],
    });

    // Line 3: }
    lines.push({ tokens: [{ text: '}', cls: 'syn-punctuation' }] });

    // Line 4: empty
    lines.push({ tokens: [{ text: '' }] });

    // Line 5: .cube {
    lines.push({
      tokens: [
        { text: '.cube', cls: 'syn-tag' },
        { text: ' {', cls: 'syn-punctuation' },
      ],
    });

    // Lines 6+: transform chain
    const transformParts: string[] = [];
    const transforms = [
      { fn: 'rotateX', val: values.rotateX, unit: 'deg', def: 0 },
      { fn: 'rotateY', val: values.rotateY, unit: 'deg', def: 0 },
      { fn: 'rotateZ', val: values.rotateZ, unit: 'deg', def: 0 },
      { fn: 'translateX', val: values.translateX, unit: 'px', def: 0 },
      { fn: 'translateY', val: values.translateY, unit: 'px', def: 0 },
      { fn: 'translateZ', val: values.translateZ, unit: 'px', def: 0 },
      { fn: 'scaleX', val: values.scaleX, unit: '', def: 1 },
      { fn: 'scaleY', val: values.scaleY, unit: '', def: 1 },
      { fn: 'scaleZ', val: values.scaleZ, unit: '', def: 1 },
      { fn: 'skewX', val: values.skewX, unit: 'deg', def: 0 },
      { fn: 'skewY', val: values.skewY, unit: 'deg', def: 0 },
    ];

    // Collect all parts
    for (const t of transforms) {
      const displayVal = t.unit === '' && t.def === 1 ? t.val.toFixed(1) : String(t.val);
      transformParts.push(`${t.fn}(${displayVal}${t.unit})`);
    }

    const transformStr = transformParts.join(' ');
    lines.push({
      tokens: [
        { text: '  transform', cls: 'syn-property' },
        { text: ': ', cls: 'syn-punctuation' },
        { text: transformStr, cls: 'syn-value' },
        { text: ';', cls: 'syn-punctuation' },
      ],
    });

    // transform-style
    const tsIsDefault = values.transformStyle === 'preserve-3d';
    lines.push({
      tokens: [
        { text: '  transform-style', cls: tsIsDefault ? 'syn-property' : 'syn-property' },
        { text: ': ', cls: 'syn-punctuation' },
        { text: values.transformStyle, cls: tsIsDefault ? 'syn-value' : 'syn-function' },
        { text: ';', cls: 'syn-punctuation' },
      ],
    });

    // backface-visibility
    const bfIsDefault = values.backfaceVisibility === 'visible';
    lines.push({
      tokens: [
        { text: '  backface-visibility', cls: 'syn-property' },
        { text: ': ', cls: 'syn-punctuation' },
        { text: values.backfaceVisibility, cls: bfIsDefault ? 'syn-value' : 'syn-function' },
        { text: ';', cls: 'syn-punctuation' },
      ],
    });

    // Closing }
    lines.push({ tokens: [{ text: '}', cls: 'syn-punctuation' }] });

    return lines;
  }, [values]);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <section className="relative w-full min-h-screen py-16 md:py-24 overflow-hidden">
      {/* ──── Background ──── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d1a] to-[#0a0a0a]" />

      {/* Grid */}
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
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/[0.06] mb-4">
            <Box className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400/70">
              Visual Tool
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #a855f7, #06b6d4, #a855f7)',
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 6s ease infinite',
              }}
            >
              3D Transforms
            </span>
          </h2>
          <p className="text-sm text-white/30 font-mono max-w-md mx-auto">
            Master CSS 3D transforms with a live interactive cube, presets, and code export.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-mono text-white/25">
            <span>9 Properties</span>
            <span className="text-purple-500/40">/</span>
            <span>8 Presets</span>
            <span className="text-purple-500/40">/</span>
            <span>Live 3D</span>
            <span className="text-purple-500/40">/</span>
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
          <div className="flex items-center gap-2">
            <motion.button
              onClick={resetAll}
              disabled={!hasChanges}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                hasChanges
                  ? 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80 hover:border-white/[0.15]'
                  : 'border-white/[0.04] bg-transparent text-white/15 cursor-not-allowed'
              }`}
              whileHover={hasChanges ? { y: -1 } : undefined}
              whileTap={hasChanges ? { scale: 0.97 } : undefined}
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </motion.button>

            {/* Auto-rotate toggle */}
            <motion.button
              onClick={() => setAutoRotate((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                autoRotate
                  ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400/80'
                  : 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80 hover:border-white/[0.15]'
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {autoRotate ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              Auto
            </motion.button>

            {/* Speed control (visible when auto-rotate is on) */}
            <AnimatePresence>
              {autoRotate && (
                <motion.div
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <Gauge className="w-3 h-3 text-white/30 flex-shrink-0" />
                  <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={autoSpeed}
                    onChange={(e) => setAutoSpeed(Number(e.target.value))}
                    className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #06b6d4 ${((autoSpeed - 0.1) / 4.9) * 100}%, rgba(255,255,255,0.08) ${((autoSpeed - 0.1) / 4.9) * 100}%)`,
                    }}
                  />
                  <span className="text-[10px] font-mono text-white/30 tabular-nums w-6">
                    {autoSpeed.toFixed(1)}×
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={copyCSS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/50 hover:text-white/80 hover:border-white/[0.15] transition-colors cursor-pointer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
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
        </motion.div>

        {/* ──── Main Grid ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ──── Left: 3D Preview ──── */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Animated gradient border wrapper */}
            <div className="relative rounded-xl overflow-hidden p-[1.5px]">
              {/* Rotating gradient border */}
              <motion.div
                className="absolute -inset-[200%]"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 10,
                  repeatType: 'loop',
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(168,85,247,0.5), rgba(6,182,212,0.3), rgba(16,185,129,0.5), rgba(236,72,153,0.3), rgba(168,85,247,0.5))',
                }}
              />
              {/* Inner content */}
              <div className="relative rounded-[10px] bg-[#0a0a12] z-10 overflow-hidden">
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
                      <span className="text-[10px] font-mono text-white/25">
                        Live 3D Preview
                      </span>
                    </div>
                  </div>
                  {/* Axis indicators */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-[2px] bg-red-500 rounded" />
                      <span className="text-[9px] font-mono text-red-400/50 tabular-nums">
                        {values.rotateX}°
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-[2px] bg-green-500 rounded" />
                      <span className="text-[9px] font-mono text-green-400/50 tabular-nums">
                        {values.rotateY}°
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-[2px] bg-blue-500 rounded" />
                      <span className="text-[9px] font-mono text-blue-400/50 tabular-nums">
                        {values.rotateZ}°
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview area */}
                <div
                  className="relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                  style={{
                    minHeight: '340px',
                    perspective: `${values.perspective}px`,
                    perspectiveOrigin: '50% 50%',
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* Subtle radial bg */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(168,85,247,0.04) 0%, transparent 60%)',
                    }}
                  />

                  {/* Grid floor (perspective plane) */}
                  <div
                    className="absolute"
                    style={{
                      width: '200px',
                      height: '200px',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-100px',
                      marginTop: '60px',
                      transform: 'rotateX(90deg)',
                      transformOrigin: 'center top',
                      backgroundImage: `
                        linear-gradient(rgba(168,85,247,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(168,85,247,0.06) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px',
                      maskImage: 'radial-gradient(ellipse 70% 70% at center, black 20%, transparent 80%)',
                      WebkitMaskImage:
                        'radial-gradient(ellipse 70% 70% at center, black 20%, transparent 80%)',
                    }}
                  />

                  {/* Shadow beneath cube */}
                  <div
                    className="absolute"
                    style={{
                      width: '140px',
                      height: '16px',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-70px',
                      marginTop: '72px',
                      background:
                        'radial-gradient(ellipse, rgba(168,85,247,0.2) 0%, rgba(6,182,212,0.1) 40%, transparent 70%)',
                      filter: 'blur(10px)',
                      transform: `translateX(${Math.sin((values.rotateY * Math.PI) / 180) * 20}px)`,
                    }}
                  />

                  {/* 3D Cube */}
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      position: 'relative',
                      transformStyle: values.transformStyle,
                      transition: autoRotate
                        ? 'none'
                        : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: transformStyle,
                    }}
                  >
                    {/* 6 faces */}
                    {CUBE_FACES.map((face, i) => (
                      <div
                        key={`cube-face-${i}`}
                        className="absolute inset-0 flex items-center justify-center rounded-lg border"
                        style={{
                          transform: face.transform,
                          background: face.bg,
                          borderColor: face.border,
                          backfaceVisibility: values.backfaceVisibility,
                        }}
                      >
                        <span className="text-[10px] font-mono font-bold text-white/80 select-none drop-shadow-lg">
                          {face.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom controls bar */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-white/25">
                        transform-style
                      </span>
                      <ToggleGroup
                        options={[
                          { label: 'flat', value: 'flat' },
                          { label: 'preserve-3d', value: 'preserve-3d' },
                        ]}
                        value={values.transformStyle}
                        onChange={(v) => updateValue('transformStyle', v)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-white/25">
                      backface
                    </span>
                    <ToggleGroup
                      options={[
                        { label: 'visible', value: 'visible' },
                        { label: 'hidden', value: 'hidden' },
                      ]}
                      value={values.backfaceVisibility}
                      onChange={(v) => updateValue('backfaceVisibility', v)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ──── Right: Controls + Presets ──── */}
          <motion.div
            className="lg:col-span-7 space-y-5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Transform Controls */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <Sparkles className="w-3.5 h-3.5 text-purple-400/70" />
                <span className="text-xs font-mono text-white/50">
                  Transform Controls
                </span>
                {hasChanges && (
                  <span className="ml-auto text-[10px] font-mono text-cyan-400/50">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="p-4 space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar">
                {SLIDERS.map((config, i) => {
                  const showGroup =
                    i === 0 || SLIDERS[i - 1].group !== config.group;
                  return (
                    <div key={`t3d-slider-${config.key}`}>
                      {showGroup && (
                        <div className="text-[10px] font-mono text-purple-400/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <div className="w-4 h-[1px] bg-purple-500/20" />
                          {config.group}
                          {config.group === 'Rotation' && (
                            <span className="text-white/15 normal-case">
                              — X / Y / Z
                            </span>
                          )}
                          {config.group === 'Translation' && (
                            <span className="text-white/15 normal-case">
                              — X / Y / Z
                            </span>
                          )}
                          {config.group === 'Scale' && (
                            <span className="text-white/15 normal-case">
                              — X / Y / Z
                            </span>
                          )}
                        </div>
                      )}
                      <TransformSlider
                        config={config}
                        value={values[config.key] as number}
                        onChange={(v) => updateValue(config.key, v)}
                      />
                    </div>
                  );
                })}
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
                <Sparkles className="w-3.5 h-3.5 text-cyan-400/70" />
                <span className="text-xs font-mono text-white/50">Presets</span>
                <span className="text-[10px] font-mono text-white/20 ml-1">
                  ({PRESETS.length})
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 p-3">
                {PRESETS.map((preset, i) => {
                  const isActive = activePreset === preset.name;
                  return (
                    <motion.button
                      key={`t3d-preset-${preset.name}`}
                      onClick={() => applyPreset(preset)}
                      className={`group flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'border-purple-500/40 bg-purple-500/[0.08]'
                          : 'border-white/[0.04] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.04]'
                      }`}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Mini cube preview */}
                      <div
                        className="relative w-full flex items-center justify-center"
                        style={{
                          height: '48px',
                          perspective: '200px',
                        }}
                      >
                        <div
                          className="relative"
                          style={{
                            width: '24px',
                            height: '24px',
                            transformStyle: 'preserve-3d',
                            transform: [
                              preset.values.rotateX
                                ? `rotateX(${preset.values.rotateX}deg)`
                                : '',
                              preset.values.rotateY
                                ? `rotateY(${preset.values.rotateY}deg)`
                                : '',
                              preset.values.rotateZ
                                ? `rotateZ(${preset.values.rotateZ}deg)`
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ') || 'rotateX(-20deg) rotateY(30deg)',
                            transition: 'transform 0.4s ease',
                          }}
                        >
                          {/* Mini front face */}
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{
                              transform: 'translateZ(12px)',
                              background: 'rgba(168,85,247,0.6)',
                              border: '1px solid rgba(168,85,247,0.4)',
                            }}
                          />
                          {/* Mini top face */}
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{
                              transform: 'rotateX(90deg) translateZ(12px)',
                              background: 'rgba(245,158,11,0.5)',
                              border: '1px solid rgba(245,158,11,0.3)',
                            }}
                          />
                          {/* Mini right face */}
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{
                              transform: 'rotateY(90deg) translateZ(12px)',
                              background: 'rgba(236,72,153,0.5)',
                              border: '1px solid rgba(236,72,153,0.3)',
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-mono truncate w-full text-center transition-colors ${
                          isActive
                            ? 'text-purple-400'
                            : 'text-white/30 group-hover:text-white/50'
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
              <Code2 className="w-3.5 h-3.5 text-purple-400/70" />
              <span className="text-[10px] font-mono text-white/25">
                Generated CSS
              </span>
            </div>
            <motion.button
              onClick={copyCSS}
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
          <div className="p-4 custom-scrollbar max-h-72 overflow-y-auto">
            <pre className="text-xs font-mono leading-relaxed">
              <code>
                {codeLines.map((line, i) => (
                  <div key={`t3d-code-${i}`} className="flex">
                    <span className="text-white/10 w-8 text-right mr-4 select-none">
                      {i + 1}
                    </span>
                    <span>
                      {line.tokens.map((token, j) => (
                        <span
                          key={`t3d-token-${i}-${j}`}
                          className={token.cls || 'text-white/50'}
                        >
                          {token.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </motion.div>

        {/* ──── Info Bar ──── */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] text-[11px] font-mono text-white/25">
            <span>9 Properties</span>
            <span className="text-purple-500/40">/</span>
            <span>8 Presets</span>
            <span className="text-purple-500/40">/</span>
            <span>Live 3D</span>
            <span className="text-purple-500/40">/</span>
            <span>CSS Export</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
