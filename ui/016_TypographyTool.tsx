/**
 * TypographyTool — Interactive CSS typography playground
 *
 * A self-contained typography editor with live preview, font pairing
 * suggestions, preset gallery, and CSS export. Fully configurable
 * via props; zero external dependencies beyond React and ./shared.
 *
 * @module TypographyTool
 * @example
 * ```tsx
 * import { TypographyTool } from './016_TypographyTool';
 * import { DEFAULT_THEME } from './shared';
 *
 * <TypographyTool
 *   defaultText="Hello World"
 *   theme={DEFAULT_THEME}
 *   colorSwatches={['#fff','#000','#d4a017']}
 * />
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import {
  useIsMounted,
  copyToClipboard,
  GeneratorTheme,
  DEFAULT_THEME,
  IconCopy,
  IconCheck,
  IconEye,
  IconPalette,
  IconRefresh,
  fadeTransition,
} from './shared';

// ─── Types ──────────────────────────────────────────────

type TextShadowPreset = 'none' | 'subtle' | 'hard' | 'neon' | 'retro';
type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
type TextAlign = 'left' | 'center' | 'right' | 'justify';
type TextDecoration = 'none' | 'underline' | 'line-through' | 'overline';

interface TypoState {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textTransform: TextTransform;
  textAlign: TextAlign;
  textDecoration: TextDecoration;
  textShadow: TextShadowPreset;
  color: string;
  italic: boolean;
}

export interface TypographyToolProps {
  /** Initial preview text */
  defaultText?: string;
  /** Color theme (accent, surface, etc.) */
  theme?: GeneratorTheme;
  /** Available color swatches in the color picker */
  colorSwatches?: string[];
  /** Available font families */
  fonts?: Array<{ label: string; value: string }>;
  /** CSS class for the outermost wrapper */
  className?: string;
}

// ─── Constants ───────────────────────────────────────────

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Impact', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
];

const WEIGHT_LABELS: Record<number, string> = {
  100: 'Thin', 200: 'Extra Light', 300: 'Light', 400: 'Regular',
  500: 'Medium', 600: 'Semi Bold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black',
};

const SHADOW_MAP: Record<TextShadowPreset, string> = {
  none: 'none',
  subtle: '1px 1px 2px rgba(0,0,0,0.3)',
  hard: '3px 3px 0px rgba(0,0,0,0.8)',
  neon: '0 0 7px #d4a017, 0 0 20px #d4a017, 0 0 42px #b8860b',
  retro: '2px 2px 0px #d4a017, 4px 4px 0px #b8860b, 6px 6px 0px #0a0a0a',
};

const DEFAULT_STATE: TypoState = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 32, fontWeight: 400, lineHeight: 1.6,
  letterSpacing: 0, wordSpacing: 0, textTransform: 'none',
  textAlign: 'left', textDecoration: 'none', textShadow: 'none',
  color: '#1a1a1a', italic: false,
};

interface Preset {
  name: string; icon: string; desc: string;
  state: Partial<TypoState>; extraStyle?: React.CSSProperties;
}

const PRESETS: Preset[] = [
  { name: 'Hero Heading', icon: 'H1', desc: 'Bold, tight spacing', state: { fontSize: 64, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1 }, extraStyle: { background: 'linear-gradient(135deg, #d4a017, #b8860b, #d4a017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } },
  { name: 'Body Text', icon: 'Bd', desc: 'Relaxed reading', state: { fontSize: 16, fontWeight: 400, lineHeight: 1.7, fontFamily: 'Inter, system-ui, sans-serif', color: '#d4d4d8' } },
  { name: 'Code Block', icon: '</>',', desc: 'Monospace, tight', state: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0.5, fontFamily: '"Courier New", Courier, monospace', color: '#d4a017' } },
  { name: 'Elegant Serif', icon: 'Se', desc: 'Classic sophistication', state: { fontSize: 24, fontWeight: 400, lineHeight: 1.6, letterSpacing: 1.5, fontFamily: 'Georgia, "Times New Roman", serif', color: '#f0e6d3', italic: true } },
  { name: 'Neon Glow', icon: 'Ne', desc: 'Electric glow', state: { fontSize: 48, fontWeight: 800, fontFamily: 'Inter, system-ui, sans-serif', color: '#d4a017', textShadow: 'neon', letterSpacing: 2 } },
  { name: 'Retro Terminal', icon: '>_', desc: 'Green on dark', state: { fontSize: 18, fontWeight: 700, fontFamily: '"Courier New", Courier, monospace', color: '#22c55e', lineHeight: 1.4, letterSpacing: 1 }, extraStyle: { textShadow: '0 0 10px rgba(34,197,94,0.5), 0 0 30px rgba(34,197,94,0.2)' } },
  { name: 'Minimal Caption', icon: 'Cp', desc: 'Tiny, uppercase', state: { fontSize: 12, fontWeight: 500, lineHeight: 1.5, letterSpacing: 4, textTransform: 'uppercase', color: '#737373' } },
  { name: 'Playful', icon: 'Pl', desc: 'Fun and bouncy', state: { fontSize: 36, fontWeight: 700, fontFamily: '"Comic Sans MS", cursive', color: '#fb923c', letterSpacing: 1, lineHeight: 1.3 }, extraStyle: { transform: 'rotate(-2deg)' } },
];

const FONT_PAIRINGS = [
  { heading: 'Inter', headingFont: 'Inter, system-ui, sans-serif', body: 'Inter', bodyFont: 'Inter, system-ui, sans-serif', desc: 'Modern & clean — tech/SaaS' },
  { heading: 'Georgia', headingFont: 'Georgia, "Times New Roman", serif', body: 'Verdana', bodyFont: 'Verdana, Geneva, sans-serif', desc: 'Classic & readable — editorial' },
  { heading: 'Impact', headingFont: 'Impact, "Arial Black", sans-serif', body: 'Trebuchet MS', bodyFont: '"Trebuchet MS", Helvetica, sans-serif', desc: 'Bold & friendly — media/posters' },
  { heading: 'Courier New', headingFont: '"Courier New", Courier, monospace', body: 'Verdana', bodyFont: 'Verdana, Geneva, sans-serif', desc: 'Technical & clean — docs/code' },
  { heading: 'Trebuchet MS', headingFont: '"Trebuchet MS", Helvetica, sans-serif', body: 'Georgia', bodyFont: 'Georgia, "Times New Roman", serif', desc: 'Balanced & professional — blogs' },
  { heading: 'Verdana', headingFont: 'Verdana, Geneva, sans-serif', body: 'Georgia', bodyFont: 'Georgia, "Times New Roman", serif', desc: 'Friendly & elegant — magazines' },
];

// ─── Helpers ─────────────────────────────────────────────

function generateCSS(state: TypoState, extraStyle?: React.CSSProperties): string {
  const lines: string[] = ['.typography {'];
  lines.push(`  font-family: ${state.fontFamily};`);
  lines.push(`  font-size: ${state.fontSize}px;`);
  lines.push(`  font-weight: ${state.fontWeight};`);
  lines.push(`  line-height: ${state.lineHeight};`);
  if (state.letterSpacing !== 0) lines.push(`  letter-spacing: ${state.letterSpacing}px;`);
  if (state.wordSpacing !== 0) lines.push(`  word-spacing: ${state.wordSpacing}px;`);
  if (state.textTransform !== 'none') lines.push(`  text-transform: ${state.textTransform};`);
  lines.push(`  text-align: ${state.textAlign};`);
  if (state.textDecoration !== 'none') lines.push(`  text-decoration: ${state.textDecoration};`);
  if (state.textShadow !== 'none') lines.push(`  text-shadow: ${SHADOW_MAP[state.textShadow]};`);
  lines.push(`  color: ${state.color};`);
  if (state.italic) lines.push(`  font-style: italic;`);
  if (extraStyle) {
    if (extraStyle.background) lines.push(`  background: ${extraStyle.background};`);
    if (extraStyle.WebkitBackgroundClip) lines.push(`  -webkit-background-clip: text;`);
    if (extraStyle.WebkitTextFillColor) lines.push(`  -webkit-text-fill-color: transparent;`);
    if (extraStyle.transform) lines.push(`  transform: ${extraStyle.transform};`);
    if (extraStyle.textShadow) lines.push(`  text-shadow: ${extraStyle.textShadow};`);
  }
  lines.push('}');
  return lines.join('\n');
}

function highlightCSS(css: string) {
  return css.split('\n').map((line, i) => {
    const parts: JSX.Element[] = [];
    let remaining = line;
    let keyIdx = 0;
    if (line.trim().startsWith('.typography')) {
      parts.push(<span key={`css-sel-${i}`} className="syn-tag">{remaining}</span>);
    } else if (line.trim() === '}') {
      parts.push(<span key={`css-bk-${i}`} className="syn-bracket">{remaining}</span>);
    } else {
      const colonIdx = remaining.indexOf(':');
      if (colonIdx !== -1) {
        const prop = remaining.slice(0, colonIdx).trim();
        const val = remaining.slice(colonIdx + 1).replace(';', '').trim();
        parts.push(
          <span key={`css-prop-${i}-${keyIdx++}`} className="syn-property">{prop}</span>,
          <span key={`css-punc-${i}-${keyIdx++}`} className="syn-punctuation">: </span>,
          <span key={`css-val-${i}-${keyIdx++}`} className="syn-value">{val}</span>,
          <span key={`css-semi-${i}-${keyIdx++}`} className="syn-punctuation">;</span>,
        );
      } else {
        parts.push(<span key={`css-raw-${i}`}>{remaining}</span>);
      }
    }
    return (
      <div key={`css-line-ty-${i}`}>
        <span className="syn-comment select-none">{String(i + 1).padStart(2, ' ')}</span>
        {'  '}{parts}
      </div>
    );
  });
}

// ─── Inline SVG Icons ────────────────────────────────────

function IconType({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" />
    </svg>
  );
}

function IconSparkles({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}

function IconUnderline({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" />
    </svg>
  );
}

function IconAlignLeft({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="17" x2="3" y1="10" y2="10" /><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="3" y1="14" y2="14" /><line x1="17" x2="3" y1="18" y2="18" />
    </svg>
  );
}

function IconAlignCenter({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" x2="6" y1="10" y2="10" /><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="3" y1="14" y2="14" /><line x1="18" x2="6" y1="18" y2="18" />
    </svg>
  );
}

function IconAlignRight({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="21" x2="7" y1="10" y2="10" /><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="3" y1="14" y2="14" /><line x1="21" x2="7" y1="18" y2="18" />
    </svg>
  );
}

function IconAlignJustify({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="3" y1="10" y2="10" /><line x1="21" x2="3" y1="14" y2="14" /><line x1="21" x2="3" y1="18" y2="18" />
    </svg>
  );
}

// ─── Sub-components ─────────────────────────────────────

function ToggleGroup<T extends string>({ options, value, onChange, iconMap }: {
  options: { label: string; value: T }[];
  value: T; onChange: (v: T) => void;
  iconMap?: Record<string, React.ReactNode>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={`tog-${opt.value}`}
          onClick={() => onChange(opt.value)}
          className={`relative px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
            value === opt.value ? 'text-[var(--tw-accent,#b8860b)]' : 'text-[var(--tw-muted,#6b6356)] hover:text-[var(--tw-muted,#6b6356)]'
          }`}
          style={value === opt.value ? { backgroundColor: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.3)' } : { border: '1px solid transparent' }}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            {iconMap?.[opt.value]}{opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function SliderControl({ label, value, min, max, step, unit, display, onChange, theme }: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; display?: string; onChange: (v: number) => void; theme: GeneratorTheme;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: theme.panelBg === '#0d1117' ? '#ebe5d0' : '#1a1a1a' }}>{label}</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: `${theme.accent}cc`, backgroundColor: `${theme.accent}15` }}>
          {display ?? `${value}${unit}`}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `${theme.accent}18` }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export function TypographyTool({
  defaultText = 'The quick brown fox jumps over the lazy dog',
  theme = DEFAULT_THEME,
  colorSwatches = ['#ffffff', '#d4d4d8', '#737373', '#d4a017', '#b8860b', '#f59e0b', '#ec4899', '#f87171', '#a78bfa', '#22c55e'],
  fonts = FONT_OPTIONS,
  className,
}: TypographyToolProps) {
  const mounted = useIsMounted();

  const [text, setText] = useState(defaultText);
  const [state, setState] = useState<TypoState>({ ...DEFAULT_STATE });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [extraStyle, setExtraStyle] = useState<React.CSSProperties | undefined>();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'presets' | 'pairings'>('controls');

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const updateState = useCallback((partial: Partial<TypoState>) => {
    setState((prev) => ({ ...prev, ...partial }));
    setActivePreset(null); setExtraStyle(undefined);
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setState((prev) => ({ ...prev, ...preset.state }));
    setExtraStyle(preset.extraStyle); setActivePreset(preset.name);
  }, []);

  const resetAll = useCallback(() => {
    setState({ ...DEFAULT_STATE }); setText(defaultText);
    setActivePreset(null); setExtraStyle(undefined);
  }, [defaultText]);

  const cssCode = useMemo(() => generateCSS(state, extraStyle), [state, extraStyle]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(cssCode);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [cssCode]);

  if (!mounted) return null;

  return (
    <div className={className}>
      {/* Header */}
      <div className="text-center mb-8" style={{ ...fadeTransition, opacity: 1, transform: 'translateY(0)' }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border mb-4"
          style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}08` }}>
          <IconType size={16} style={{ color: theme.accent }} />
          <span className="text-xs font-mono" style={{ color: `${theme.accent}cc` }}>Typography Tool</span>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1 border" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
          {([
            { id: 'controls' as const, label: 'Controls', Icon: IconPalette },
            { id: 'presets' as const, label: 'Presets', Icon: IconSparkles },
            { id: 'pairings' as const, label: 'Pairings', Icon: IconEye },
          ]).map((tab) => (
            <button key={`typo-tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer"
              style={{
                color: activeTab === tab.id ? '#1a1a1a' : theme.textMuted,
                ...(activeTab === tab.id ? { backgroundColor: `${theme.accent}18`, border: `1px solid ${theme.accent}30` } : { border: '1px solid transparent' }),
              }}>
              <tab.Icon size={14} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL */}
        <div>
          {activeTab === 'controls' && (
            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, ...fadeTransition }}>
              {/* Reset */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono flex items-center gap-2" style={{ color: theme.textMuted }}>
                  <IconPalette size={16} style={{ color: theme.accent }} /> Typography Controls
                </h3>
                <button onClick={resetAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                  style={{ color: theme.textMuted, backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
                  <IconRefresh size={12} /> Reset
                </button>
              </div>

              {/* Text editor */}
              <div className="space-y-2">
                <label className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Preview Text</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-mono resize-y transition-colors"
                  style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, color: '#1a1a1a' }}
                  placeholder="Type your text here..." />
                <div className="flex gap-3 text-[10px] font-mono" style={{ color: theme.textMuted }}>
                  <span>{charCount} chars</span><span>{wordCount} words</span>
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Font Family</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {fonts.map((font) => (
                    <button key={`font-opt-${font.label}`} onClick={() => updateState({ fontFamily: font.value })}
                      className="px-2.5 py-2 rounded-lg text-left text-xs font-mono transition-all duration-200 cursor-pointer"
                      style={{
                        fontFamily: font.value,
                        ...(state.fontFamily === font.value
                          ? { backgroundColor: `${theme.accent}18`, border: `1px solid ${theme.accent}30`, color: theme.accentSecondary }
                          : { backgroundColor: theme.surface, border: `1px solid ${theme.border}`, color: '#1a1a1a' }),
                      }}>
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <SliderControl label="Font Size" value={state.fontSize} min={8} max={120} step={1} unit="px" onChange={(v) => updateState({ fontSize: v })} theme={theme} />
              <SliderControl label="Font Weight" value={state.fontWeight} min={100} max={900} step={100} unit=""
                display={`${state.fontWeight} ${WEIGHT_LABELS[state.fontWeight]}`} onChange={(v) => updateState({ fontWeight: v })} theme={theme} />
              <SliderControl label="Line Height" value={state.lineHeight} min={0.8} max={3.0} step={0.1} unit=""
                display={state.lineHeight.toFixed(1)} onChange={(v) => updateState({ lineHeight: v })} theme={theme} />
              <SliderControl label="Letter Spacing" value={state.letterSpacing} min={-5} max={20} step={0.5} unit="px" onChange={(v) => updateState({ letterSpacing: v })} theme={theme} />
              <SliderControl label="Word Spacing" value={state.wordSpacing} min={-5} max={20} step={0.5} unit="px" onChange={(v) => updateState({ wordSpacing: v })} theme={theme} />

              {/* Italic toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Italic</span>
                <button onClick={() => updateState({ italic: !state.italic })}
                  className="w-10 h-5 rounded-full transition-colors relative cursor-pointer"
                  style={{ backgroundColor: state.italic ? `${theme.accent}20` : `${theme.accent}10` }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
                    style={{ left: state.italic ? '22px' : '2px', backgroundColor: state.italic ? theme.accent : `${theme.accent}60` }} />
                </button>
              </div>

              {/* Toggle groups */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Text Transform</span>
                <ToggleGroup<TextTransform> options={[
                  { label: 'None', value: 'none' }, { label: 'Upper', value: 'uppercase' },
                  { label: 'Lower', value: 'lowercase' }, { label: 'Cap', value: 'capitalize' },
                ]} value={state.textTransform} onChange={(v) => updateState({ textTransform: v })} />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Text Alignment</span>
                <ToggleGroup<TextAlign> options={[
                  { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' }, { label: 'Justify', value: 'justify' },
                ]} value={state.textAlign} onChange={(v) => updateState({ textAlign: v })} iconMap={{
                  left: <IconAlignLeft size={12} />, center: <IconAlignCenter size={12} />,
                  right: <IconAlignRight size={12} />, justify: <IconAlignJustify size={12} />,
                }} />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Text Decoration</span>
                <ToggleGroup<TextDecoration> options={[
                  { label: 'None', value: 'none' }, { label: 'Underline', value: 'underline' },
                  { label: 'Strike', value: 'line-through' }, { label: 'Overline', value: 'overline' },
                ]} value={state.textDecoration} onChange={(v) => updateState({ textDecoration: v })} iconMap={{ underline: <IconUnderline size={12} /> }} />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono" style={{ color: '#1a1a1a' }}>Text Shadow</span>
                <ToggleGroup<TextShadowPreset> options={[
                  { label: 'None', value: 'none' }, { label: 'Subtle', value: 'subtle' },
                  { label: 'Hard', value: 'hard' }, { label: 'Neon', value: 'neon' }, { label: 'Retro', value: 'retro' },
                ]} value={state.textShadow} onChange={(v) => updateState({ textShadow: v })} />
              </div>

              {/* Color picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono flex items-center gap-1.5" style={{ color: '#1a1a1a' }}>
                    <IconPalette size={12} /> Text Color
                  </span>
                  <span className="text-xs font-mono" style={{ color: theme.textMuted }}>{state.color}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" value={state.color} onChange={(e) => updateState({ color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent" style={{ border: `1px solid ${theme.border}` }} />
                  <div className="flex gap-1.5 flex-wrap">
                    {colorSwatches.map((c) => (
                      <button key={`csw-${c}`} onClick={() => updateState({ color: c })}
                        className="w-6 h-6 rounded-md transition-transform cursor-pointer hover:scale-110"
                        style={{
                          backgroundColor: c, border: `1px solid ${state.color === c ? '#1a1a1a' : 'rgba(0,0,0,0.1)'}`,
                          transform: state.color === c ? 'scale(1.1)' : undefined,
                        }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="p-5 max-h-[80vh] overflow-y-auto" style={{ ...fadeTransition }}>
              <h3 className="text-sm font-mono flex items-center gap-2 mb-5" style={{ color: theme.textMuted }}>
                <IconSparkles size={16} style={{ color: theme.accent }} /> Preset Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map((preset) => (
                  <button key={`preset-${preset.name}`} onClick={() => applyPreset(preset)}
                    className="relative group text-left p-4 rounded-none border transition-all duration-300 cursor-pointer overflow-hidden"
                    style={activePreset === preset.name
                      ? { borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }
                      : { borderColor: theme.border, backgroundColor: theme.surface }
                    }>
                    <div className="mb-3 overflow-hidden h-16 flex items-center">
                      <span className="w-full truncate" style={{
                        fontFamily: preset.state.fontFamily ?? DEFAULT_STATE.fontFamily,
                        fontSize: Math.min(preset.state.fontSize ?? DEFAULT_STATE.fontSize, 24),
                        fontWeight: preset.state.fontWeight ?? DEFAULT_STATE.fontWeight,
                        color: preset.state.color ?? '#1a1a1a',
                        letterSpacing: `${preset.state.letterSpacing ?? 0}px`,
                        fontStyle: preset.state.italic ? 'italic' : 'normal',
                        textTransform: (preset.state.textTransform as 'uppercase' | 'lowercase' | 'capitalize' | undefined) ?? 'none',
                        textShadow: SHADOW_MAP[preset.state.textShadow ?? 'none'] ?? 'none',
                        ...(preset.extraStyle ?? {}),
                      }}>
                        {text.slice(0, 30)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                        style={{ color: `${theme.accent}b3`, backgroundColor: `${theme.accent}15` }}>{preset.icon}</span>
                      <div>
                        <div className="text-xs font-mono font-medium" style={{ color: '#1a1a1a' }}>{preset.name}</div>
                        <div className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{preset.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pairings' && (
            <div className="p-5 max-h-[80vh] overflow-y-auto" style={{ ...fadeTransition }}>
              <h3 className="text-sm font-mono flex items-center gap-2 mb-5" style={{ color: theme.textMuted }}>
                <IconEye size={16} style={{ color: theme.accent }} /> Font Pairing Suggestions
              </h3>
              <div className="space-y-3">
                {FONT_PAIRINGS.map((pairing) => (
                  <button key={`pairing-${pairing.heading}`}
                    onClick={() => updateState({ fontFamily: pairing.headingFont })}
                    className="w-full text-left p-4 rounded-none border transition-all duration-300 cursor-pointer"
                    style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                    <div className="mb-3 space-y-1.5">
                      <div className="text-lg font-bold truncate" style={{ fontFamily: pairing.headingFont, color: '#1a1a1a' }}>
                        {text.slice(0, 35)}{text.length > 35 ? '...' : ''}
                      </div>
                      <div className="text-xs truncate" style={{ fontFamily: pairing.bodyFont, color: theme.textMuted }}>
                        {text.slice(0, 60)}{text.length > 60 ? '...' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                        style={{ color: `${theme.accent}b3`, backgroundColor: `${theme.accent}15` }}>{pairing.heading}</span>
                      <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>+</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                        style={{ color: `${theme.accentSecondary}b3`, backgroundColor: `${theme.accentSecondary}15` }}>{pairing.body}</span>
                      <span className="text-[10px] font-mono ml-auto" style={{ color: theme.textMuted }}>{pairing.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          {/* Live Preview */}
          <div className="p-5" style={fadeTransition}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono flex items-center gap-2" style={{ color: theme.textMuted }}>
                <IconEye size={16} style={{ color: theme.accent }} /> Live Preview
              </h3>
              <div className="flex gap-2 text-[10px] font-mono" style={{ color: theme.textMuted }}>
                <span>{charCount} chars</span><span>·</span><span>{wordCount} words</span>
              </div>
            </div>
            <div className="relative min-h-[200px] max-h-[400px] overflow-y-auto p-6 transition-all duration-300"
              style={{
                backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
                ...(activePreset === 'Retro Terminal' ? { overflow: 'hidden' } : {}),
              }}>
              {activePreset === 'Retro Terminal' && (
                <div className="absolute inset-0 pointer-events-none z-10"
                  style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' }} />
              )}
              <div className="break-words transition-all duration-300" style={{
                fontFamily: state.fontFamily, fontSize: `${state.fontSize}px`, fontWeight: state.fontWeight,
                lineHeight: state.lineHeight, letterSpacing: `${state.letterSpacing}px`,
                wordSpacing: `${state.wordSpacing}px`, textTransform: state.textTransform,
                textAlign: state.textAlign, textDecoration: state.textDecoration,
                textShadow: extraStyle?.textShadow ?? SHADOW_MAP[state.textShadow],
                color: state.color, fontStyle: state.italic ? 'italic' : 'normal', ...extraStyle,
              }}>
                {text || <span style={{ color: theme.textMuted, fontStyle: 'italic' }}>Start typing to preview...</span>}
              </div>
            </div>
          </div>

          {/* CSS Code Output */}
          <div className="p-5" style={fadeTransition}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono flex items-center gap-2" style={{ color: theme.textMuted }}>
                CSS Output
              </h3>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: copied ? theme.accent : '#1a1a1a' }}>
                {copied ? <><IconCheck size={14} /> Copied!</> : <><IconCopy size={14} /> Copy</>}
              </button>
            </div>
            <div className="p-4 rounded-lg font-mono overflow-x-auto" style={{ backgroundColor: theme.panelBg }}>
              {highlightCSS(cssCode)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypographyTool;
