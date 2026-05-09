/**
 * UnitConverter — Reusable CSS unit converter component.
 *
 * Converts between 10 CSS units (px, rem, em, vw, vh, %, pt, cm, mm, in)
 * with configurable base-font-size and viewport dimensions. Includes a
 * visual ruler bar, typography-scale preview, and quick presets.
 *
 * @module 013_UnitConverter
 */

import { useState, useCallback, useMemo } from 'react';
import { useIsMounted, copyToClipboard, IconCopy, IconCheck, type GeneratorTheme, DEFAULT_THEME } from './shared';

// ─── Types ────────────────────────────────────────────────────

/** Supported CSS unit identifiers. */
export type CSSUnit = 'px' | 'rem' | 'em' | 'vw' | 'vh' | '%' | 'pt' | 'cm' | 'mm' | 'in';

/** Describes a single CSS unit. */
export interface UnitDef {
  id: CSSUnit;
  label: string;
  description: string;
}

/** A single conversion result row. */
export interface ConversionResult {
  unit: CSSUnit;
  value: number;
  formatted: string;
}

/** Props for the UnitConverter component. */
export interface UnitConverterProps {
  /** Available units (defaults to all 10). */
  units?: UnitDef[];
  /** Quick-preset pixel values. */
  presets?: number[];
  /** Theme overrides. */
  theme?: GeneratorTheme;
  /** Additional className on the root element. */
  className?: string;
}

// ─── Default Data ─────────────────────────────────────────────

const DEFAULT_UNITS: UnitDef[] = [
  { id: 'px',  label: 'px', description: 'Pixels' },
  { id: 'rem', label: 'rem', description: 'Root em' },
  { id: 'em',  label: 'em', description: 'Em units' },
  { id: 'vw',  label: 'vw', description: 'Viewport width' },
  { id: 'vh',  label: 'vh', description: 'Viewport height' },
  { id: '%',   label: '%', description: 'Percentage' },
  { id: 'pt',  label: 'pt', description: 'Points' },
  { id: 'cm',  label: 'cm', description: 'Centimeters' },
  { id: 'mm',  label: 'mm', description: 'Millimeters' },
  { id: 'in',  label: 'in', description: 'Inches' },
];

const DEFAULT_PRESETS = [8, 12, 16, 24, 32, 48, 64, 100];

// ─── Conversion Engine ────────────────────────────────────────

function toPx(value: number, fromUnit: CSSUnit, baseFontSize: number, viewportWidth: number, viewportHeight: number): number {
  switch (fromUnit) {
    case 'px': return value;
    case 'rem': return value * baseFontSize;
    case 'em':  return value * baseFontSize;
    case 'vw':  return (value * viewportWidth) / 100;
    case 'vh':  return (value * viewportHeight) / 100;
    case '%':   return (value * viewportWidth) / 100;
    case 'pt':  return value / 0.75;
    case 'cm':  return value * 37.795;
    case 'mm':  return value * 3.7795;
    case 'in':  return value * 96;
    default:    return value;
  }
}

function fromPx(pxValue: number, toUnit: CSSUnit, baseFontSize: number, viewportWidth: number, viewportHeight: number): number {
  switch (toUnit) {
    case 'px': return pxValue;
    case 'rem': return pxValue / baseFontSize;
    case 'em':  return pxValue / baseFontSize;
    case 'vw':  return (pxValue / viewportWidth) * 100;
    case 'vh':  return (pxValue / viewportHeight) * 100;
    case '%':   return (pxValue / viewportWidth) * 100;
    case 'pt':  return pxValue * 0.75;
    case 'cm':  return pxValue / 37.795;
    case 'mm':  return pxValue / 3.7795;
    case 'in':  return pxValue / 96;
    default:    return pxValue;
  }
}

export function formatValue(value: number, unit: CSSUnit): string {
  if (!isFinite(value)) return '0';
  if (Math.abs(value) < 0.001) return '0';
  const decimals = (unit === 'cm' ? 4 : unit === 'mm' ? 3 : unit === 'in' ? 6 : 4);
  return value.toFixed(decimals).replace(/\.?0+$/, '');
}

function convertAll(inputValue: number, inputUnit: CSSUnit, baseFontSize: number, viewportWidth: number, viewportHeight: number, units: UnitDef[]): ConversionResult[] {
  const pxValue = toPx(inputValue, inputUnit, baseFontSize, viewportWidth, viewportHeight);
  return units.map((u) => {
    const converted = fromPx(pxValue, u.id, baseFontSize, viewportWidth, viewportHeight);
    return { unit: u.id, value: converted, formatted: formatValue(converted, u.id) };
  });
}

// ─── Inline SVG Icons ─────────────────────────────────────────

function IconRuler({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
    </svg>
  );
}

function IconRotateCcw({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function IconType({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4,7 4,4 20,4 20,7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function IconMaximize({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function IconSettings2({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
    </svg>
  );
}

function IconArrowRightLeft({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" />
    </svg>
  );
}

// ─── CSS keyframes ────────────────────────────────────────────

const cssKeyframes = `
@keyframes uc-float {
  0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.02; }
  25% { transform: translateY(-10px) translateX(5px) rotate(2deg); opacity: 0.04; }
  50% { transform: translateY(-5px) translateX(-3px) rotate(-1deg); opacity: 0.025; }
  75% { transform: translateY(7px) translateX(2px) rotate(1deg); opacity: 0.035; }
}
`;

// ─── Sub-components ───────────────────────────────────────────

/** Visual ruler bar showing the px value proportionally. */
function VisualRuler({ pxValue, theme }: { pxValue: number; theme: GeneratorTheme }) {
  const maxRef = 200;
  const clampedValue = Math.min(Math.max(pxValue, 0), maxRef);
  const percentage = maxRef > 0 ? (clampedValue / maxRef) * 100 : 0;
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const val = i * 10;
    return { val, isMajor: val % 50 === 0, isMid: val % 25 === 0, pos: (val / maxRef) * 100 };
  });

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full h-8 bg-[#ebe5d0] border overflow-hidden" style={{ borderColor: theme.border }}>
        <div className="absolute inset-y-0 left-0 rounded-lg" style={{ width: `${Math.min(percentage, 100)}%`, background: `linear-gradient(90deg, ${theme.accent}4D, ${theme.accentSecondary}4D)`, borderRight: `2px solid ${theme.accent}`, transition: 'width 0.3s ease' }} />
        <div className="absolute inset-0 flex items-end">
          {ticks.map((t) => (
            <div key={`tick-${t.val}`} className="absolute bottom-0 bg-white/[0.12]" style={{ left: `${t.pos}%`, width: '1px', height: t.isMajor ? '14px' : t.isMid ? '10px' : '6px' }} />
          ))}
        </div>
        {clampedValue > 20 && (
          <div className="absolute top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#1a1a1a] whitespace-nowrap" style={{ left: `${Math.min(percentage, 100) - 2}%`, transition: 'left 0.3s ease' }}>
            <span className="px-1.5 py-0.5 rounded border" style={{ background: 'rgba(45,106,79,0.15)', borderColor: `${theme.accent}66`, transform: 'translateX(-100%)' }}>{formatValue(pxValue, 'px')}px</span>
          </div>
        )}
      </div>
      <div className="flex justify-between px-0.5">
        {['0px', '50px', '100px', '150px', '200px'].map((l) => <span key={l} className="font-mono text-[10px]" style={{ color: theme.textMuted }}>{l}</span>)}
      </div>
    </div>
  );
}

/** Typography-scale preview: font-size, padding, margin, border-radius. */
function TypographyScale({ pxValue, theme }: { pxValue: number; theme: GeneratorTheme }) {
  const clamped = Math.min(Math.max(pxValue, 1), 200);
  const label = (t: string, v: string) => (
    <div className="font-mono text-[10px] mt-2" style={{ color: theme.textMuted }}>{t}: {v}px</div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Font-size */}
        <div className="p-4 border bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <IconType className="w-3.5 h-3.5" style={{ color: `${theme.accent}99` }} />
            <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>Font Size</span>
          </div>
          <div className="text-[#1a1a1a] font-medium leading-tight overflow-hidden" style={{ fontSize: `${clamped}px` }}>Aa Bb Cc</div>
          {label('font-size', formatValue(clamped, 'px'))}
        </div>
        {/* Padding */}
        <div className="p-4 border bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <IconMaximize className="w-3.5 h-3.5" style={{ color: `${theme.accentSecondary}99` }} />
            <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>Padding</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center min-h-[40px] border" style={{ padding: `${Math.min(clamped, 48)}px`, borderColor: `${theme.accent}33`, transition: 'padding 0.3s' }}>
              <div className="w-6 h-6 rounded bg-white/10" />
            </div>
          </div>
          {label('padding', formatValue(Math.min(clamped, 48), 'px'))}
        </div>
        {/* Margin */}
        <div className="p-4 border bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <IconArrowRightLeft className="w-3.5 h-3.5" style={{ color: `${theme.accent}99` }} />
            <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>Margin</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative" style={{ margin: `${Math.min(clamped, 48)}px`, transition: 'margin 0.3s' }}>
              <div className="w-10 h-10 rounded" style={{ background: `${theme.accent}33`, border: `1px solid ${theme.accent}33` }} />
              <div className="absolute inset-0 -z-10 border border-dashed border-white/[0.08] rounded" />
            </div>
          </div>
          {label('margin', formatValue(Math.min(clamped, 48), 'px'))}
        </div>
        {/* Border-radius */}
        <div className="p-4 border bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2 mb-3">
            <IconSettings2 className="w-3.5 h-3.5" style={{ color: `${theme.accentSecondary}99` }} />
            <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>Border Radius</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-emerald-500/25" style={{ borderRadius: `${Math.min(clamped, 80)}px`, transition: 'border-radius 0.3s' }} />
          </div>
          {label('border-radius', formatValue(Math.min(clamped, 80), 'px'))}
        </div>
      </div>
    </div>
  );
}

/** A single conversion row. */
function ConversionRow({ result, isInput, pxValue, onCopy, copiedUnit, theme, units }: {
  result: ConversionResult; isInput: boolean; pxValue: number;
  onCopy: (text: string, unit: CSSUnit) => void; copiedUnit: CSSUnit | null;
  theme: GeneratorTheme; units: UnitDef[];
}) {
  const unitInfo = units.find((u) => u.id === result.unit);
  const displayText = `${result.formatted}${result.unit}`;
  const isCopied = copiedUnit === result.unit;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 group cursor-pointer transition-all duration-200"
      style={{
        background: isInput ? `${theme.accent}1a` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isInput ? `${theme.accent}33` : 'rgba(255,255,255,0.04)'}`,
      }}
      onClick={() => onCopy(displayText, result.unit)}
      onMouseEnter={(e) => { if (!isInput) (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; }}
    >
      <div className="shrink-0 w-12 text-center font-mono text-xs font-bold px-2 py-1 rounded-md" style={{ background: isInput ? `${theme.accent}33` : 'rgba(255,255,255,0.05)', color: isInput ? theme.accent : '#1a1a1a' }}>
        {result.unit}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-mono text-sm truncate ${isInput ? 'text-white font-bold' : 'text-[#1a1a1a]'}`}>{result.formatted}</div>
        <div className="font-mono text-[10px] mt-0.5" style={{ color: theme.textMuted }}>{unitInfo?.description}</div>
      </div>
      {!isInput && (
        <div className="hidden sm:block shrink-0"><span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.03]" style={{ color: theme.textMuted }}>≈ {formatValue(pxValue, 'px')}px</span></div>
      )}
      <div className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
        {isCopied ? <IconCheck className="w-3.5 h-3.5" style={{ color: theme.accent }} /> : <IconCopy className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

/**
 * UnitConverter — CSS unit conversion tool with live preview.
 *
 * @example
 * ```tsx
 * <UnitConverter presets={[16, 24, 32]} theme={{ accent: '#e04040' }} />
 * ```
 */
export function UnitConverter({ units, presets, theme = DEFAULT_THEME, className }: UnitConverterProps) {
  const mounted = useIsMounted();
  const activeUnits = units ?? DEFAULT_UNITS;
  const activePresets = presets ?? DEFAULT_PRESETS;

  const [inputValue, setInputValue] = useState('16');
  const [inputUnit, setInputUnit] = useState<CSSUnit>('px');
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedUnit, setCopiedUnit] = useState<CSSUnit | null>(null);

  const numericValue = useMemo(() => { const p = parseFloat(inputValue); return isNaN(p) ? 0 : p; }, [inputValue]);

  const conversions = useMemo(() => convertAll(numericValue, inputUnit, baseFontSize, viewportWidth, viewportHeight, activeUnits), [numericValue, inputUnit, baseFontSize, viewportWidth, viewportHeight, activeUnits]);
  const pxValue = useMemo(() => toPx(numericValue, inputUnit, baseFontSize, viewportWidth, viewportHeight), [numericValue, inputUnit, baseFontSize, viewportWidth, viewportHeight]);

  const handleCopy = useCallback((text: string, unit: CSSUnit) => {
    copyToClipboard(text).then(() => { setCopiedUnit(unit); setTimeout(() => setCopiedUnit(null), 2000); });
  }, []);
  const handlePreset = useCallback((value: number) => { setInputValue(String(value)); setInputUnit('px'); }, []);
  const handleReset = useCallback(() => { setInputValue('16'); setInputUnit('px'); setBaseFontSize(16); setViewportWidth(1920); setViewportHeight(1080); }, []);

  if (!mounted) return null;

  const inputText = `${inputValue || '0'}${inputUnit}`;
  const inputCopied = copiedUnit === inputUnit;

  // Chrome dots helper
  const chrome = () => (<><div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" /></>);

  return (
    <div className={`relative w-full overflow-hidden ${className ?? ''}`} style={{ background: '#f5f0e1', minHeight: '100vh' }}>
      <style>{cssKeyframes}</style>

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {['16px', '1rem', '100%', '10pt', '2.54cm', '96dpi', '0.75pt', '37.8px/cm', 'em', 'vw'].map((s, i) => (
          <span key={`fl-${i}`} className="absolute font-mono select-none" style={{ left: `${2 + (i * 7) % 96}%`, top: `${5 + (i * 7.3) % 90}%`, fontSize: `${10 + (i % 3) * 2}px`, color: 'rgba(180, 128, 23, 0.06)', animation: `uc-float ${12 + (i * 1.9) % 14}s ease-in-out ${(i * 0.6) % 8}s infinite` }}>{s}</span>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(180,128,23,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(180,128,23,0.06) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(180,128,23,0.06) 100%)' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="pt-20 sm:pt-28 pb-10 sm:pb-14 px-4 text-center" style={{ transition: 'opacity 0.6s ease' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border bg-[#ebe5d0] mb-6" style={{ borderColor: theme.border }}>
            <IconRuler className="w-3.5 h-3.5" style={{ color: theme.accentSecondary }} />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: `${theme.accentSecondary}CC` }}>CSS Tool</span>
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4" style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b, #d4a017)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Unit Converter</h2>
          <p className="font-mono text-sm sm:text-base tracking-wide max-w-lg mx-auto" style={{ color: theme.textMuted }}>Convert between CSS units with live preview and visual context</p>
        </div>

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          {/* Presets */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <IconRotateCcw className="w-4 h-4" style={{ color: `${theme.accent}99` }} />
              <h3 className="font-mono text-sm tracking-widest uppercase" style={{ color: theme.textMuted }}>Quick Presets</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
              <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/[0.03] text-xs font-mono transition-all cursor-pointer hover:bg-white/[0.06]" style={{ color: theme.textMuted, borderColor: 'rgba(255,255,255,0.08)' }} aria-label="Reset">
                <IconRotateCcw className="w-3.5 h-3.5" /><span className="hidden sm:inline">Reset</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePresets.map((val) => (
                <button key={`preset-${val}`} onClick={() => handlePreset(val)} className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer hover:bg-white/[0.06]" style={{
                  background: inputValue === String(val) && inputUnit === 'px' ? `${theme.accent}33` : 'rgba(255,255,255,0.03)',
                  color: inputValue === String(val) && inputUnit === 'px' ? theme.accent : theme.textMuted,
                  border: `1px solid ${inputValue === String(val) && inputUnit === 'px' ? `${theme.accent}4D` : 'rgba(255,255,255,0.06)'}`,
                }}>{val}px</button>
              ))}
            </div>
          </div>

          {/* Two-panel layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {/* LEFT: Input & Conversions */}
            <div className="flex flex-col gap-4 lg:gap-5">
              {/* Input Panel */}
              <div className="overflow-hidden border flex flex-col bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: theme.border }}>
                  {chrome()}<span className="font-mono text-[11px] ml-2 flex items-center gap-1.5" style={{ color: theme.textMuted }}><IconArrowRightLeft className="w-3 h-3" />Input</span>
                  <div className="flex-1" />
                  <button onClick={() => setShowSettings((p) => !p)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer" style={{ background: showSettings ? `${theme.accent}1a` : 'transparent', color: showSettings ? theme.accent : theme.textMuted, border: showSettings ? `1px solid ${theme.accent}33` : 'none' }} aria-label="Toggle settings">
                    <IconSettings2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Settings</span>
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Settings (collapsible) */}
                  {showSettings && (
                    <div className="border bg-[#ebe5d0] p-4 space-y-4 mb-4" style={{ borderColor: theme.border, transition: 'opacity 0.2s ease' }}>
                      <div className="font-mono text-[11px] uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: theme.textMuted }}><IconSettings2 className="w-3 h-3" style={{ opacity: 0.5 }} />Base Settings</div>
                      {/* Range slider helper */}
                      {[
                        { label: 'Base Font Size', value: baseFontSize, set: setBaseFontSize, min: 8, max: 32, step: 1, unit: 'px', icon: <IconType className="w-3 h-3" style={{ color: `${theme.accent}80` }} /> },
                        { label: 'Viewport Width', value: viewportWidth, set: setViewportWidth, min: 320, max: 3840, step: 10, unit: 'px', icon: <IconMaximize className="w-3 h-3" style={{ color: `${theme.accentSecondary}80` }} /> },
                        { label: 'Viewport Height', value: viewportHeight, set: setViewportHeight, min: 240, max: 2160, step: 10, unit: 'px', icon: <IconMaximize className="w-3 h-3" style={{ color: `${theme.accent}80` }} /> },
                      ].map((r) => (
                        <div key={r.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="font-mono text-xs flex items-center gap-1.5" style={{ color: theme.textMuted }}>{r.icon}{r.label}</label>
                            <span className="font-mono text-xs px-2 py-0.5 rounded-md" style={{ color: `${theme.accent}CC`, background: `${theme.accent}1a` }}>{r.value}px</span>
                          </div>
                          <input type="range" min={r.min} max={r.max} step={r.step} value={r.value} onChange={(e) => r.set(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentSecondary})` }} aria-label={r.label} />
                          <div className="flex justify-between mt-1"><span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>{r.min}px</span><span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>{r.max}px</span></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Value + Unit selector */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="font-mono text-[11px] uppercase tracking-wider mb-2 block" style={{ color: theme.textMuted }}>Value</label>
                      <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#ebe5d0] border text-[#1a1a1a] font-mono text-lg focus:outline-none transition-all" style={{ borderColor: theme.border }} placeholder={theme.textMuted} aria-label="Value to convert" />
                    </div>
                    <div className="w-[140px]">
                      <label className="font-mono text-[11px] uppercase tracking-wider mb-2 block" style={{ color: theme.textMuted }}>Unit</label>
                      <select value={inputUnit} onChange={(e) => setInputUnit(e.target.value as CSSUnit)} className="w-full px-3 py-3 rounded-xl bg-[#ebe5d0] border text-[#1a1a1a] font-mono text-sm focus:outline-none transition-all appearance-none cursor-pointer" style={{ borderColor: theme.border }} aria-label="Input unit">
                        {activeUnits.map((u) => <option key={u.id} value={u.id} className="bg-[#0d1117] text-white">{u.label} — {u.description}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Copy input */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} /><span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>Live conversion</span></div>
                    <button onClick={() => handleCopy(inputText, inputUnit)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer" style={{ color: inputCopied ? theme.accent : theme.textMuted }}>
                      {inputCopied ? <><IconCheck className="w-3.5 h-3.5" />Copied!</> : <><IconCopy className="w-3.5 h-3.5" />Copy</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversion Results */}
              <div className="overflow-hidden border flex flex-col bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: theme.border }}>
                  {chrome()}<span className="font-mono text-[11px] ml-2 flex items-center gap-1.5" style={{ color: theme.textMuted }}><IconRuler className="w-3 h-3" />Conversions</span>
                </div>
                <div className="p-3 sm:p-4 space-y-2 max-h-[480px] overflow-y-auto">
                  {conversions.map((result) => (
                    <div key={`conv-${result.unit}`}>
                      <ConversionRow result={result} isInput={result.unit === inputUnit} pxValue={pxValue} onCopy={handleCopy} copiedUnit={copiedUnit} theme={theme} units={activeUnits} />
                      {copiedUnit === result.unit && result.unit !== inputUnit && (
                        <div className="ml-[60px] mt-1 mb-1" style={{ transition: 'opacity 0.3s ease' }}>
                          <span className="font-mono text-[10px] flex items-center gap-1" style={{ color: `${theme.accent}B3` }}><IconCheck className="w-3 h-3" />Copied {result.formatted}{result.unit}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-t bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} /><span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>{activeUnits.length} units</span></div>
                  <span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>Click to copy</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Visual Ruler & Typography */}
            <div className="flex flex-col gap-4 lg:gap-5">
              {/* Visual Ruler */}
              <div className="overflow-hidden border flex flex-col bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: theme.border }}>
                  {chrome()}<span className="font-mono text-[11px] ml-2 flex items-center gap-1.5" style={{ color: theme.textMuted }}><IconRuler className="w-3 h-3" />Visual Ruler</span>
                </div>
                <div className="p-4 sm:p-5">
                  <VisualRuler pxValue={pxValue} theme={theme} />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: 'pixels', value: formatValue(pxValue, 'px'), color: theme.accent },
                      { label: 'rems', value: formatValue(pxValue / baseFontSize, 'rem'), color: theme.accentSecondary },
                      { label: 'ems', value: formatValue(pxValue / baseFontSize, 'em'), color: theme.textMuted },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-2 rounded-lg border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="font-mono text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="font-mono text-[10px] mt-0.5" style={{ color: theme.textMuted }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography Scale */}
              <div className="overflow-hidden border flex flex-col bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: theme.border }}>
                  {chrome()}<span className="font-mono text-[11px] ml-2 flex items-center gap-1.5" style={{ color: theme.textMuted }}><IconType className="w-3 h-3" />Typography Scale</span>
                </div>
                <div className="p-4 sm:p-5">
                  <TypographyScale pxValue={pxValue} theme={theme} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnitConverter;
