/**
 * Transform3dTool — Interactive CSS 3D transform playground
 *
 * A self-contained 3D transform editor with an interactive cube,
 * 12 transform property sliders, 8 presets, auto-rotate mode,
 * and CSS code export. Fully configurable via props.
 *
 * @module Transform3dTool
 * @example
 * ```tsx
 * import { Transform3dTool } from './018_Transform3dTool';
 * import { DEFAULT_THEME } from './shared';
 *
 * <Transform3dTool theme={DEFAULT_THEME} cubeSize={100} />
 * ```
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  useIsMounted,
  copyToClipboard,
  GeneratorTheme,
  DEFAULT_THEME,
  IconCopy,
  IconCheck,
  IconEye,
  IconRefresh,
  fadeTransition,
} from './shared';

// ─── Types ──────────────────────────────────────────────

interface TransformValues {
  rotateX: number; rotateY: number; rotateZ: number;
  translateX: number; translateY: number; translateZ: number;
  scaleX: number; scaleY: number; scaleZ: number;
  perspective: number; skewX: number; skewY: number;
  transformStyle: 'flat' | 'preserve-3d';
  backfaceVisibility: 'visible' | 'hidden';
}

interface SliderConfig {
  key: keyof TransformValues; label: string; group: string;
  min: number; max: number; step: number; unit: string; defaultValue: number;
}

interface TransformPreset {
  name: string; values: Partial<TransformValues>;
}

export interface Transform3dToolProps {
  /** Size of the 3D cube in pixels */
  cubeSize?: number;
  /** Custom presets */
  presets?: TransformPreset[];
  /** Theme */
  theme?: GeneratorTheme;
  /** Outer wrapper class */
  className?: string;
}

// ─── Constants ───────────────────────────────────────────

const DEFAULTS: TransformValues = {
  rotateX: 0, rotateY: 0, rotateZ: 0,
  translateX: 0, translateY: 0, translateZ: 0,
  scaleX: 1, scaleY: 1, scaleZ: 1,
  perspective: 800, skewX: 0, skewY: 0,
  transformStyle: 'preserve-3d', backfaceVisibility: 'visible',
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

const DEFAULT_PRESETS: TransformPreset[] = [
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
  { name: 'Front', transform: 'translateZ(50px)' },
  { name: 'Back', transform: 'rotateY(180deg) translateZ(50px)' },
  { name: 'Right', transform: 'rotateY(90deg) translateZ(50px)' },
  { name: 'Left', transform: 'rotateY(-90deg) translateZ(50px)' },
  { name: 'Top', transform: 'rotateX(90deg) translateZ(50px)' },
  { name: 'Bottom', transform: 'rotateX(-90deg) translateZ(50px)' },
];

// ─── Helpers ─────────────────────────────────────────────

function buildFullTransform(v: TransformValues): string {
  return [
    `rotateX(${v.rotateX}deg)`, `rotateY(${v.rotateY}deg)`, `rotateZ(${v.rotateZ}deg)`,
    `translateX(${v.translateX}px)`, `translateY(${v.translateY}px)`, `translateZ(${v.translateZ}px)`,
    `scaleX(${v.scaleX})`, `scaleY(${v.scaleY})`, `scaleZ(${v.scaleZ})`,
    `skewX(${v.skewX}deg)`, `skewY(${v.skewY}deg)`,
  ].join(' ');
}

function getActiveCount(v: TransformValues): number {
  let count = 0;
  if (v.rotateX !== 0) count++; if (v.rotateY !== 0) count++; if (v.rotateZ !== 0) count++;
  if (v.translateX !== 0) count++; if (v.translateY !== 0) count++; if (v.translateZ !== 0) count++;
  if (v.scaleX !== 1) count++; if (v.scaleY !== 1) count++; if (v.scaleZ !== 1) count++;
  if (v.perspective !== 800) count++; if (v.skewX !== 0) count++; if (v.skewY !== 0) count++;
  if (v.transformStyle !== 'preserve-3d') count++; if (v.backfaceVisibility !== 'visible') count++;
  return count;
}

function formatVal(v: number, step: number): string {
  return step < 1 ? v.toFixed(1) : String(v);
}

// ─── Inline SVG Icons ────────────────────────────────────

function IconBox({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 8a2 2 0 0 0-1-1h-3a2 2 0 0 0-1 1v10a2 2 0 0 0 1 1h3a2 2 0 0 0 1-1V8Z" /><path d="M3 8h2v10H3V8Z" /><path d="M12 2v20" /><path d="M12 6h2" /><path d="M12 12h2" /><path d="M12 18h2" /></svg>;
}

function IconPlay({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}><polygon points="6 3 20 12 6 21 6 3" /></svg>;
}

function IconPause({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}><rect x="14" y="4" width="4" height="16" rx="1" /><rect x="6" y="4" width="4" height="16" rx="1" /></svg>;
}

function IconGauge({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 10s4.477 10 10 10" /><path d="m12 6 4 4" /><path d="m8 10 4-4" /></svg>;
}

function IconSparkles({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>;
}

// ─── Custom Slider ──────────────────────────────────────

function TransformSlider({ config, value, onChange, theme }: {
  config: SliderConfig; value: number; onChange: (v: number) => void; theme: GeneratorTheme;
}) {
  const pct = ((value - config.min) / (config.max - config.min)) * 100;
  const isDefault = value === config.defaultValue;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: theme.textMuted }}>{config.label}</span>
        <span className="text-[11px] font-mono tabular-nums" style={{ color: isDefault ? theme.textMuted : `${theme.accent}cc` }}>
          {formatVal(value, config.step)}{config.unit}
        </span>
      </div>
      <input type="range" min={config.min} max={config.max} step={config.step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accentSecondary} ${pct}%, rgba(26,26,26,0.08) ${pct}%)` }} />
    </div>
  );
}

// ─── Toggle Button Group ────────────────────────────────

function ToggleGroup<T extends string>({ options, value, onChange }: {
  options: { label: string; value: T }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="relative flex items-center gap-1 p-1 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
      {options.map((opt) => (
        <button key={`toggle-${opt.value}`} onClick={() => onChange(opt.value)}
          className="relative flex items-center px-3 py-1.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer"
          style={{
            color: value === opt.value ? '#1a1a1a' : 'rgba(107,99,86,0.6)',
            ...(value === opt.value ? { backgroundColor: 'rgba(212,160,23,0.15)', border: `1px solid rgba(212,160,23,0.3)` } : { border: '1px solid transparent' }),
          }}>
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export function Transform3dTool({
  cubeSize = 100,
  presets = DEFAULT_PRESETS,
  theme = DEFAULT_THEME,
  className,
}: Transform3dToolProps) {
  const mounted = useIsMounted();
  const [values, setValues] = useState<TransformValues>({ ...DEFAULTS });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(1);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragBase = useRef({ rx: 0, ry: 0 });
  const speedRef = useRef(autoSpeed);

  useEffect(() => { speedRef.current = autoSpeed; }, [autoSpeed]);

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate) return;
    let frameId: number;
    const animate = () => {
      if (!isDragging.current) setValues((prev) => ({ ...prev, rotateY: Math.round(prev.rotateY + speedRef.current * 0.5) }));
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [autoRotate]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setValues((prev) => { dragBase.current = { rx: prev.rotateX, ry: prev.rotateY }; return prev; });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setValues((prev) => ({ ...prev, rotateX: Math.round(dragBase.current.rx - dy * 0.4), rotateY: Math.round(dragBase.current.ry + dx * 0.4) }));
    setActivePreset(null);
  }, []);

  const handlePointerUp = useCallback(() => { isDragging.current = false; }, []);

  const updateValue = useCallback((key: keyof TransformValues, val: number | string) => {
    setValues((prev) => ({ ...prev, [key]: val })); setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset: TransformPreset) => {
    setValues((prev) => ({ ...prev, ...preset.values })); setActivePreset(preset.name);
  }, []);

  const resetAll = useCallback(() => {
    setValues({ ...DEFAULTS }); setActivePreset(null);
  }, []);

  const handleCopy = useCallback(async () => {
    const code = `.cube-wrapper {\n  perspective: ${values.perspective}px;\n}\n\n.cube {\n  transform: ${buildFullTransform(values)};\n  transform-style: ${values.transformStyle};\n  backface-visibility: ${values.backfaceVisibility};\n}`;
    const ok = await copyToClipboard(code);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [values]);

  const activeCount = useMemo(() => getActiveCount(values), [values]);
  const hasChanges = activeCount > 0;
  const transformStyle = useMemo(() => buildFullTransform(values), [values]);

  const codeLines = useMemo(() => {
    const lines: Array<{ tokens: Array<{ text: string; cls?: string }> }> = [];
    lines.push({ tokens: [{ text: '.cube-wrapper', cls: 'syn-tag' }, { text: ' {', cls: 'syn-punctuation' }] });
    lines.push({ tokens: [{ text: '  perspective', cls: 'syn-property' }, { text: ': ', cls: 'syn-punctuation' }, { text: `${values.perspective}px`, cls: 'syn-number' }, { text: ';', cls: 'syn-punctuation' }] });
    lines.push({ tokens: [{ text: '}', cls: 'syn-punctuation' }] });
    lines.push({ tokens: [{ text: '' }] });
    lines.push({ tokens: [{ text: '.cube', cls: 'syn-tag' }, { text: ' {', cls: 'syn-punctuation' }] });
    const transforms = [
      { fn: 'rotateX', val: values.rotateX, unit: 'deg', def: 0 }, { fn: 'rotateY', val: values.rotateY, unit: 'deg', def: 0 },
      { fn: 'rotateZ', val: values.rotateZ, unit: 'deg', def: 0 }, { fn: 'translateX', val: values.translateX, unit: 'px', def: 0 },
      { fn: 'translateY', val: values.translateY, unit: 'px', def: 0 }, { fn: 'translateZ', val: values.translateZ, unit: 'px', def: 0 },
      { fn: 'scaleX', val: values.scaleX, unit: '', def: 1 }, { fn: 'scaleY', val: values.scaleY, unit: '', def: 1 },
      { fn: 'scaleZ', val: values.scaleZ, unit: '', def: 1 }, { fn: 'skewX', val: values.skewX, unit: 'deg', def: 0 },
      { fn: 'skewY', val: values.skewY, unit: 'deg', def: 0 },
    ];
    const parts = transforms.map((t) => `${t.fn}(${t.unit === '' && t.def === 1 ? t.val.toFixed(1) : String(t.val)}${t.unit})`).join(' ');
    lines.push({ tokens: [{ text: '  transform', cls: 'syn-property' }, { text: ': ', cls: 'syn-punctuation' }, { text: parts, cls: 'syn-value' }, { text: ';', cls: 'syn-punctuation' }] });
    lines.push({ tokens: [{ text: '  transform-style', cls: 'syn-property' }, { text: ': ', cls: 'syn-punctuation' }, { text: values.transformStyle, cls: 'syn-value' }, { text: ';', cls: 'syn-punctuation' }] });
    lines.push({ tokens: [{ text: '  backface-visibility', cls: 'syn-property' }, { text: ': ', cls: 'syn-punctuation' }, { text: values.backfaceVisibility, cls: 'syn-value' }, { text: ';', cls: 'syn-punctuation' }] });
    lines.push({ tokens: [{ text: '}', cls: 'syn-punctuation' }] });
    return lines;
  }, [values]);

  if (!mounted) return null;

  const half = cubeSize / 2;
  const faceTranslate = `translateZ(${half}px)`;
  const faceTransforms = [
    faceTranslate, `rotateY(180deg) ${faceTranslate}`, `rotateY(90deg) ${faceTranslate}`,
    `rotateY(-90deg) ${faceTranslate}`, `rotateX(90deg) ${faceTranslate}`, `rotateX(-90deg) ${faceTranslate}`,
  ];

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6" style={fadeTransition}>
        <div className="flex items-center gap-2">
          <button onClick={resetAll} disabled={!hasChanges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer disabled:cursor-not-allowed"
            style={{ border: `1px solid ${hasChanges ? theme.border : 'transparent'}`, color: hasChanges ? '#1a1a1a' : theme.textMuted, backgroundColor: `${theme.accent}06` }}>
            <IconRefresh size={12} /> Reset
          </button>
          <button onClick={() => setAutoRotate((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            style={{
              border: `1px solid ${autoRotate ? `${theme.accent}30` : theme.border}`,
              backgroundColor: autoRotate ? `${theme.accent}12` : `${theme.accent}06`,
              color: autoRotate ? `${theme.accent}cc` : '#1a1a1a',
            }}>
            {autoRotate ? <IconPause size={12} /> : <IconPlay size={12} />} Auto
          </button>
          {autoRotate && (
            <div className="flex items-center gap-2 transition-all duration-200" style={{ overflow: 'hidden', maxWidth: autoRotate ? '160px' : '0', opacity: autoRotate ? 1 : 0 }}>
              <IconGauge size={12} style={{ color: theme.textMuted }} />
              <input type="range" min={0.1} max={5} step={0.1} value={autoSpeed} onChange={(e) => setAutoSpeed(Number(e.target.value))}
                className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accentSecondary} ${((autoSpeed - 0.1) / 4.9) * 100}%, rgba(26,26,26,0.08) ${((autoSpeed - 0.1) / 4.9) * 100}%)` }} />
              <span className="text-[10px] font-mono tabular-nums w-6" style={{ color: theme.textMuted }}>{autoSpeed.toFixed(1)}×</span>
            </div>
          )}
        </div>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          style={{ border: `1px solid ${theme.border}`, backgroundColor: `${theme.accent}06`, color: copied ? theme.accent : '#1a1a1a' }}>
          {copied ? <><IconCheck size={12} /> Copied!</> : <><IconCopy size={12} /> Copy CSS</>}
        </button>
      </div>

      {/* Main Grid: 3D Preview + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Preview */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-lg" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.panelBg }}>
            {/* Chrome header */}
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div className="flex items-center gap-1.5 ml-3"><IconEye size={12} style={{ color: theme.textMuted }} /><span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>Live 3D Preview</span></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><div className="w-2.5 h-[2px] bg-red-500 rounded" /><span className="text-[9px] font-mono tabular-nums" style={{ color: 'rgba(194,54,22,0.5)' }}>{values.rotateX}°</span></div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-[2px] bg-green-500 rounded" /><span className="text-[9px] font-mono tabular-nums" style={{ color: 'rgba(34,197,94,0.5)' }}>{values.rotateY}°</span></div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-[2px] bg-blue-500 rounded" /><span className="text-[9px] font-mono tabular-nums" style={{ color: 'rgba(59,130,246,0.5)' }}>{values.rotateZ}°</span></div>
              </div>
            </div>

            {/* Preview area */}
            <div className="relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              style={{ minHeight: '340px', perspective: `${values.perspective}px`, perspectiveOrigin: '50% 50%' }}
              onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
              {/* Grid floor */}
              <div className="absolute" style={{ width: '200px', height: '200px', left: '50%', top: '50%', marginLeft: '-100px', marginTop: '60px', transform: 'rotateX(90deg)', transformOrigin: 'center top', backgroundImage: 'linear-gradient(rgba(212,160,23,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px', maskImage: 'radial-gradient(ellipse 70% 70% at center, rgba(26,26,26,0.2) 20%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at center, rgba(26,26,26,0.2) 20%, transparent 80%)' }} />
              {/* Shadow */}
              <div className="absolute" style={{ width: '140px', height: '16px', left: '50%', top: '50%', marginLeft: '-70px', marginTop: '72px', background: 'radial-gradient(ellipse, rgba(212,160,23,0.2) 0%, rgba(184,134,11,0.1) 40%, transparent 70%)', filter: 'blur(10px)', transform: `translateX(${Math.sin((values.rotateY * Math.PI) / 180) * 20}px)` }} />

              {/* Cube */}
              <div style={{ width: `${cubeSize}px`, height: `${cubeSize}px`, position: 'relative', transformStyle: values.transformStyle, transition: autoRotate ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', transform: transformStyle }}>
                {CUBE_FACES.map((face, i) => (
                  <div key={`face-${i}`} className="absolute inset-0 flex items-center justify-center rounded-lg border"
                    style={{
                      transform: faceTransforms[i], background: `linear-gradient(135deg, ${theme.accent}d9, ${theme.accentSecondary}d9)`,
                      borderColor: `${theme.accent}80`, backfaceVisibility: values.backfaceVisibility,
                    }}>
                    <span className="text-[10px] font-mono font-bold select-none" style={{ color: '#1a1a1a', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{face.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: `1px solid ${theme.border}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>transform-style</span>
                <ToggleGroup options={[{ label: 'flat', value: 'flat' }, { label: 'preserve-3d', value: 'preserve-3d' }]} value={values.transformStyle} onChange={(v) => updateValue('transformStyle', v)} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>backface</span>
                <ToggleGroup options={[{ label: 'visible', value: 'visible' }, { label: 'hidden', value: 'hidden' }]} value={values.backfaceVisibility} onChange={(v) => updateValue('backfaceVisibility', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls + Presets */}
        <div className="lg:col-span-7 space-y-5">
          {/* Transform Controls */}
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <IconSparkles size={14} style={{ color: `${theme.textMuted}b3` }} />
              <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Transform Controls</span>
              {hasChanges && <span className="ml-auto text-[10px] font-mono" style={{ color: `${theme.accentSecondary}80` }}>{activeCount} active</span>}
            </div>
            <div className="p-4 space-y-5 max-h-[500px] overflow-y-auto">
              {SLIDERS.map((config, i) => {
                const showGroup = i === 0 || SLIDERS[i - 1].group !== config.group;
                return (
                  <div key={`t3d-slider-${config.key}`}>
                    {showGroup && (
                      <div className="text-[10px] font-mono uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: `${theme.textMuted}66` }}>
                        <div className="w-4 h-[1px]" style={{ backgroundColor: `${theme.accent}30` }} />{config.group}
                      </div>
                    )}
                    <TransformSlider config={config} value={values[config.key] as number} onChange={(v) => updateValue(config.key, v)} theme={theme} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Presets */}
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <IconSparkles size={14} style={{ color: `${theme.accentSecondary}b3` }} />
              <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Presets</span>
              <span className="text-[10px] font-mono ml-1" style={{ color: theme.textMuted }}>({presets.length})</span>
            </div>
            <div className="grid grid-cols-4 gap-2 p-3">
              {presets.map((preset) => {
                const isActive = activePreset === preset.name;
                return (
                  <button key={`t3d-preset-${preset.name}`} onClick={() => applyPreset(preset)}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer"
                    style={isActive
                      ? { borderColor: `${theme.textMuted}30`, backgroundColor: theme.surface }
                      : { borderColor: 'rgba(255,255,255,0.04)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div className="relative w-full flex items-center justify-center" style={{ height: '48px', perspective: '200px' }}>
                      <div className="relative" style={{ width: '24px', height: '24px', transformStyle: 'preserve-3d', transform: [preset.values.rotateX ? `rotateX(${preset.values.rotateX}deg)` : '', preset.values.rotateY ? `rotateY(${preset.values.rotateY}deg)` : '', preset.values.rotateZ ? `rotateZ(${preset.values.rotateZ}deg)` : ''].filter(Boolean).join(' ') || 'none' }}>
                        {CUBE_FACES.map((_, fi) => (
                          <div key={fi} className="absolute inset-0 rounded" style={{ transform: faceTransforms[fi], background: 'linear-gradient(135deg, rgba(212,160,23,0.8), rgba(184,134,11,0.8))', border: '1px solid rgba(212,160,23,0.4)' }} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: isActive ? '#1a1a1a' : theme.textMuted }}>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CSS Output */}
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.panelBg }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="font-mono text-[11px] ml-2" style={{ color: theme.textMuted }}>3d-transform.css</span>
            </div>
            <div className="p-4 font-mono overflow-x-auto">
              {codeLines.map((line, i) => (
                <div key={`cl-${i}`} className="flex leading-[1.625rem]">
                  <span className="select-none w-8 text-right mr-4 shrink-0 text-xs" style={{ color: 'rgba(107,99,86,0.6)' }}>{i + 1}</span>
                  <span className="whitespace-pre text-xs">{line.tokens.map((t, ti) => <span key={ti} className={t.cls}>{t.text}</span>)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transform3dTool;
