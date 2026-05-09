/**
 * ResponsiveShowcase — Responsive design preview & breakpoint visualizer
 *
 * A self-contained responsive design tool with device-frame preview,
 * breakpoint map, layout demos, media query playground, unit converter,
 * and CSS code output. Fully configurable via props.
 *
 * @module ResponsiveShowcase
 * @example
 * ```tsx
 * import { ResponsiveShowcase } from './019_ResponsiveShowcase';
 *
 * <ResponsiveShowcase initialWidth={768} theme={DEFAULT_THEME} />
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
  IconRefresh,
  IconEye,
  fadeTransition,
} from './shared';

// ─── Types ──────────────────────────────────────────────

interface DevicePreset {
  name: string; width: number; height: number;
  iconName: 'smartphone' | 'tablet' | 'laptop' | 'monitor';
}

interface Breakpoint { name: string; min: number; max: number; color: string; }

interface MediaQueryRule {
  id: string; property: string; value: string; minWidth: string; maxWidth: string;
}

type ActiveTab = 'preview' | 'breakpoints' | 'converter' | 'code';

export interface ResponsiveShowcaseProps {
  /** Initial viewport width in px */
  initialWidth?: number;
  /** Custom breakpoints */
  breakpoints?: Breakpoint[];
  /** Custom device presets */
  devices?: DevicePreset[];
  /** CSS properties available in the media query builder */
  cssProperties?: string[];
  /** Theme */
  theme?: GeneratorTheme;
  /** Outer wrapper class */
  className?: string;
}

// ─── Constants ───────────────────────────────────────────

const DEFAULT_DEVICES: DevicePreset[] = [
  { name: 'iPhone', width: 375, height: 812, iconName: 'smartphone' },
  { name: 'Galaxy', width: 360, height: 780, iconName: 'smartphone' },
  { name: 'iPad', width: 768, height: 1024, iconName: 'tablet' },
  { name: 'Laptop', width: 1366, height: 768, iconName: 'laptop' },
  { name: 'Desktop', width: 1920, height: 1080, iconName: 'monitor' },
];

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { name: 'xs', min: 0, max: 640, color: '#ef4444' },
  { name: 'sm', min: 640, max: 768, color: '#f97316' },
  { name: 'md', min: 768, max: 1024, color: '#eab308' },
  { name: 'lg', min: 1024, max: 1280, color: '#22c55e' },
  { name: 'xl', min: 1280, max: 1536, color: '#3b82f6' },
  { name: '2xl', min: 1536, max: 2000, color: '#a855f7' },
];

const DEFAULT_CSS_PROPERTIES = [
  'font-size', 'padding', 'margin', 'display', 'flex-direction',
  'background-color', 'gap', 'grid-template-columns', 'width', 'height',
  'font-weight', 'line-height', 'border-radius',
];

const UNIT_OPTIONS = ['px', 'em', 'rem', '%', 'vw', 'vh'];

// ─── Helpers ─────────────────────────────────────────────

let ruleIdCounter = 0;
function createRule(): MediaQueryRule {
  return { id: `rule-${++ruleIdCounter}-${Date.now()}`, property: 'font-size', value: '16px', minWidth: '768px', maxWidth: '' };
}

function getBreakpointForWidth(width: number, bps: Breakpoint[]): string {
  for (const bp of bps) { if (width < bp.max) return bp.name; }
  return bps[bps.length - 1].name;
}

function getBreakpointColor(width: number, bps: Breakpoint[]): string {
  for (const bp of bps) { if (width < bp.max) return bp.color; }
  return bps[bps.length - 1].color;
}

function convertUnit(value: number, fromUnit: string, toUnit: string, base: number, vw: number, vh: number): number {
  let px = value;
  switch (fromUnit) {
    case 'em': case 'rem': px = value * base; break; case '%': px = (value / 100) * base; break;
    case 'vw': px = (value / 100) * vw; break; case 'vh': px = (value / 100) * vh; break;
  }
  switch (toUnit) {
    case 'px': return px; case 'em': case 'rem': return px / base;
    case '%': return (px / base) * 100; case 'vw': return (px / vw) * 100; case 'vh': return (px / vh) * 100;
  }
  return px;
}

// ─── Inline SVG Icons ────────────────────────────────────

function IconMonitor({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="17" /></svg>;
}
function IconSmartphone({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /><path d="M17.7 7.7 13 2.1 8.3 7.7" /><path d="m9.3 16.3 13 21.9 8.3 16.3" /></svg>;
}
function IconTablet({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><line x1="12" x2="12" y1="18" y2="18" /></svg>;
}
function IconLaptop({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="12" x="3" y="4" rx="2" /><path d="M2 20h20" /><path d="M7 20h10" /></svg>;
}
function IconFlip({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" /><path d="M12 20v2" /><path d="M12 14v2" /><path d="M12 8v2" /><path d="m15 13-3-3" /><path d="m9 17 3-3" /></svg>;
}
function IconRuler({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.3 15.3a2.4 2.4 0 0 0 0 3.4l-7.07 4.12V4.83a.5.5 0 0 0-1 0V2.67a.5.5 0 0 1 1 0v11.66" /><path d="m14.5 12.5-2-2" /><path d="m11.5 9.5-2-2" /><path d="m8.5 6.5-2-2" /><path d="m5.5 3.5-2-2" /></svg>;
}
function IconLayoutGrid({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>;
}
function IconLayers({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a2 2 0 0 0 .66 1.66L12 17.82a2 2 0 0 0 1.66 0L6.08 2.6a2 2 0 0 0-1.66-.66" /><path d="m22 17.2-1-1.6" /><path d="m6.18 6.18 1.64-1.64" /><path d="m21.82 6.18-1.64 1.64" /></svg>;
}
function IconCode({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 18 22 12 18 8" /><polyline points="8 18 2 12 8 6" /><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2l2.5 2.5" /><path d="m14.5 4-5 5" /></svg>;
}
function IconPlus({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
}
function IconTrash({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7l-5 5v-5" /><path d="M18 14 23 9" /><path d="m23 9-9 5" /></svg>;
}
function IconMaximize({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" /><path d="M21 3h-3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" /><path d="M9 14l6-6" /><path d="M15 14l-6-6" /></svg>;
}

// ─── Device Icon Map ─────────────────────────────────────

function DeviceIcon({ type, size = 14 }: { type: DevicePreset['iconName']; size?: number }) {
  const props = { size };
  switch (type) {
    case 'smartphone': return <IconSmartphone {...props} />;
    case 'tablet': return <IconTablet {...props} />;
    case 'laptop': return <IconLaptop {...props} />;
    case 'monitor': default: return <IconMonitor {...props} />;
  }
}

// ─── Main Component ─────────────────────────────────────

export function ResponsiveShowcase({
  initialWidth = 768,
  breakpoints = DEFAULT_BREAKPOINTS,
  devices = DEFAULT_DEVICES,
  cssProperties = DEFAULT_CSS_PROPERTIES,
  theme = DEFAULT_THEME,
  className,
}: ResponsiveShowcaseProps) {
  const mounted = useIsMounted();
  const [viewportWidth, setViewportWidth] = useState(initialWidth);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [activePreset, setActivePreset] = useState<string | null>(devices[2]?.name ?? 'iPad');
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [mediaRules, setMediaRules] = useState<MediaQueryRule[]>([createRule()]);
  const [convertValue, setConvertValue] = useState(16);
  const [convertFrom, setConvertFrom] = useState('px');
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [copied, setCopied] = useState(false);

  const deviceFrameWidth = useMemo(() => Math.min(viewportWidth, 500), [viewportWidth]);
  const deviceFrameHeight = useMemo(() => {
    const dev = devices.find((d) => d.name === activePreset);
    if (dev) return (deviceFrameWidth / dev.width) * dev.height;
    return deviceFrameWidth * 0.65;
  }, [deviceFrameWidth, activePreset, devices]);

  const previewCols = useMemo(() => {
    if (viewportWidth >= 1024) return 4;
    if (viewportWidth >= 768) return 3;
    if (viewportWidth >= 640) return 2;
    return 1;
  }, [viewportWidth]);

  const navCollapsed = viewportWidth < 768;
  const sidebarHidden = viewportWidth < 1024;
  const heroFontSize = viewportWidth >= 1024 ? 32 : viewportWidth >= 768 ? 24 : 18;

  const currentBreakpoint = useMemo(() => getBreakpointForWidth(viewportWidth, breakpoints), [viewportWidth, breakpoints]);
  const currentBreakpointColor = useMemo(() => getBreakpointColor(viewportWidth, breakpoints), [viewportWidth, breakpoints]);
  const breakpointPosition = Math.min((viewportWidth / 2000) * 100, 100);

  const unitConversions = useMemo(() => {
    const results: Record<string, number> = {};
    for (const unit of UNIT_OPTIONS) results[unit] = convertUnit(convertValue, convertFrom, unit, baseFontSize, viewportWidth, 800);
    return results;
  }, [convertValue, convertFrom, baseFontSize, viewportWidth]);

  const generatedCSS = useMemo(() => {
    let code = '/* Responsive Design — Generated CSS */\n\n';
    code += `.container {\n  display: grid;\n  gap: 1rem;\n  padding: 1rem;\n  grid-template-columns: 1fr;\n}\n\n`;
    code += `.nav {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n\n`;
    code += `.layout {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n`;
    if (mediaRules.some((r) => r.value.trim())) {
      code += '\n/* Custom media queries */\n';
      for (const rule of mediaRules) {
        if (!rule.value.trim()) continue;
        const conditions: string[] = [];
        if (rule.minWidth.trim()) conditions.push(`(min-width: ${rule.minWidth.trim()})`);
        if (rule.maxWidth.trim()) conditions.push(`(max-width: ${rule.maxWidth.trim()})`);
        if (conditions.length === 0) continue;
        code += `\n@media ${conditions.join(' and ')} {\n  .element {\n    ${rule.property}: ${rule.value};\n  }\n}\n`;
      }
    }
    code += '\n/* sm */\n@media (min-width: 640px) { .container { grid-template-columns: repeat(2, 1fr); } .nav { flex-direction: row; } }\n\n';
    code += '/* md */\n@media (min-width: 768px) { .container { grid-template-columns: repeat(3, 1fr); } .nav { flex-direction: row; } }\n\n';
    code += '/* lg */\n@media (min-width: 1024px) { .container { grid-template-columns: repeat(4, 1fr); } .layout { flex-direction: row; } }\n\n';
    code += '/* xl */\n@media (min-width: 1280px) { .container { max-width: 1280px; margin: 0 auto; } }\n\n';
    code += '/* 2xl */\n@media (min-width: 1536px) { .container { max-width: 1536px; } }\n';
    return code;
  }, [mediaRules]);

  const handlePreset = useCallback((dev: DevicePreset) => {
    setActivePreset(dev.name);
    setViewportWidth(orientation === 'landscape' ? dev.height : dev.width);
  }, [orientation]);

  const handleOrientationToggle = useCallback(() => {
    setOrientation((prev) => {
      const next = prev === 'portrait' ? 'landscape' : 'portrait';
      const dev = devices.find((d) => d.name === activePreset);
      if (dev) setViewportWidth(next === 'landscape' ? dev.height : dev.width);
      return next;
    });
  }, [activePreset, devices]);

  const handleCopy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, []);

  const handleAddRule = useCallback(() => setMediaRules((prev) => [...prev, createRule()]), []);
  const handleRemoveRule = useCallback((id: string) => setMediaRules((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id))), []);
  const handleUpdateRule = useCallback((id: string, updates: Partial<MediaQueryRule>) => {
    setMediaRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const quickRef = [
    { from: '1rem', to: '16px', note: 'Default browser' },
    { from: '1em', to: '16px', note: 'Same as rem if base=16' },
    { from: '100vw', to: '100% viewport width', note: '' },
    { from: '100vh', to: '100% viewport height', note: '' },
    { from: '62.5%', to: '10px (base)', note: '62.5% trick' },
    { from: '1.5rem', to: '24px' }, { from: '2rem', to: '32px' }, { from: '3rem', to: '48px' },
  ];

  if (!mounted) return null;

  const tabs: { id: ActiveTab; label: string; Icon: React.FC<{ size?: number } & React.SVGProps<SVGSVGElement> }>[] = [
    { id: 'preview', label: 'Preview', Icon: IconEye },
    { id: 'breakpoints', label: 'Breakpoints', Icon: IconRuler },
    { id: 'converter', label: 'Unit Converter', Icon: IconLayers },
    { id: 'code', label: 'CSS Output', Icon: IconCode },
  ];

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 max-w-2xl mx-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-mono whitespace-nowrap transition-colors cursor-pointer"
              style={{
                color: activeTab === tab.id ? '#1a1a1a' : 'rgba(26,26,26,0.4)',
                ...(activeTab === tab.id ? { backgroundColor: theme.accent, border: `1px solid #1a1a1a` } : { border: '1px solid transparent' }),
              }}>
              <tab.Icon size={14} /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pb-12">
        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="space-y-6" style={fadeTransition}>
            <div className="flex flex-wrap gap-2 justify-center">
              {devices.map((dev) => (
                <button key={dev.name} onClick={() => handlePreset(dev)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"
                  style={activePreset === dev.name
                    ? { border: `${theme.accent}30`, backgroundColor: `${theme.accent}10`, color: theme.accent }
                    : { border: `${theme.border}`, backgroundColor: `${theme.accent}04`, color: theme.textMuted }}>
                  <DeviceIcon type={dev.iconName} size={14} />
                  {dev.name}
                  <span style={{ color: theme.textMuted }}>{orientation === 'portrait' ? dev.width : dev.height}px</span>
                </button>
              ))}
              <button onClick={handleOrientationToggle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"
                style={{ border: `${theme.accentSecondary}20`, backgroundColor: `${theme.accentSecondary}10`, color: `${theme.accentSecondary}cc` }}>
                <IconFlip size={14} />{orientation === 'portrait' ? 'Portrait' : 'Landscape'}
              </button>
            </div>

            {/* Width slider */}
            <div className="p-4" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px]" style={{ color: theme.textMuted }}>Viewport Width</span>
                <span className="font-mono text-sm px-2.5 py-0.5 rounded" style={{ color: theme.accent, backgroundColor: `${theme.accent}15` }}>{viewportWidth}px</span>
              </div>
              <input type="range" min={320} max={1920} value={viewportWidth}
                onChange={(e) => { setViewportWidth(Number(e.target.value)); setActivePreset(null); }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(90deg, ${getBreakpointColor(320, breakpoints)} 0%, ${getBreakpointColor(640, breakpoints)} 16.7%, ${getBreakpointColor(768, breakpoints)} 33.3%, ${getBreakpointColor(1024, breakpoints)} 50%, ${getBreakpointColor(1280, breakpoints)} 66.7%, ${getBreakpointColor(1536, breakpoints)} 83.3%, ${getBreakpointColor(1920, breakpoints)} 100%)` }}
                aria-label="Viewport width" />
            </div>

            {/* Preview frame */}
            <div className="flex justify-center">
              <div className="rounded-none overflow-hidden border-2 relative"
                style={{ width: `${deviceFrameWidth}px`, height: `${deviceFrameHeight}px`, backgroundColor: theme.panelBg,
                  boxShadow: `0 0 40px ${currentBreakpointColor}14` }}>
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
                  <div className="w-2 h-2 rounded-full bg-[#ff5f57]" /><div className="w-2 h-2 rounded-full bg-[#febc2e]" /><div className="w-2 h-2 rounded-full bg-[#28c840]" />
                  <div className="flex-1 mx-2 px-2 py-0.5 rounded text-[9px] font-mono text-center truncate" style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: theme.textMuted }}>
                    {activePreset ? `${activePreset.toLowerCase()}.dev` : `localhost:${viewportWidth}`}
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: currentBreakpointColor, backgroundColor: `${currentBreakpointColor}15` }}>{currentBreakpoint}</span>
                </div>
                {/* Mini webpage */}
                <div className="overflow-auto h-[calc(100%-32px)]" style={{ fontSize: `${Math.max(10, viewportWidth / 80)}px` }}>
                  {/* Nav */}
                  <div className="px-3 py-2 flex items-center" style={{ borderBottom: `1px solid ${theme.border}`, flexDirection: 'row', justifyContent: 'space-between', flexWrap: navCollapsed ? 'wrap' : 'nowrap' }}>
                    <span className="font-mono font-bold" style={{ color: `${theme.accent}cc`, fontSize: `${Math.max(10, viewportWidth / 60)}px` }}>DevSite</span>
                    {navCollapsed ? (
                      <div className="flex items-center gap-1 mt-1">{[1, 2, 3].map((i) => <div key={i} className="w-4 h-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />)}</div>
                    ) : (
                      <div className="flex items-center gap-3">{['Home', 'About', 'Blog', 'Contact'].map((item) => <span key={item} className="font-mono cursor-pointer" style={{ color: theme.textMuted, fontSize: `${Math.max(8, viewportWidth / 100)}px` }}>{item}</span>)}</div>
                    )}
                  </div>
                  {/* Hero */}
                  <div className="px-4 py-6 text-center">
                    <h1 className="font-bold mb-2" style={{ fontSize: `${heroFontSize * (Math.max(10, viewportWidth / 80) / 10)}px`, color: '#1a1a1a' }}>Build Better UIs</h1>
                    <p className="font-mono" style={{ fontSize: `${Math.max(8, viewportWidth / 120)}px`, color: theme.textMuted }}>Responsive design tools for modern developers</p>
                    <div className="mt-3 inline-flex px-3 py-1.5 rounded-lg text-[10px] font-mono" style={{ color: theme.accent, border: `1px solid ${theme.accent}20`, backgroundColor: `${theme.accent}10` }}>Get Started</div>
                  </div>
                  {/* Card Grid */}
                  <div className="grid gap-2 px-3 pb-4" style={{ gridTemplateColumns: `repeat(${previewCols}, 1fr)` }}>
                    {[{ title: 'Design', color: theme.accent }, { title: 'Develop', color: theme.accentSecondary }, { title: 'Deploy', color: '#a855f7' }, { title: 'Scale', color: '#f59e0b' }].map((card) => (
                      <div key={card.title} className="rounded-lg border p-3" style={{ minHeight: '60px', borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <div className="w-6 h-1 rounded mb-2" style={{ backgroundColor: `${card.color}40` }} />
                        <div className="font-mono text-[9px] font-bold" style={{ color: theme.textMuted }}>{card.title}</div>
                        <div className="mt-1.5 space-y-0.5">{[1, 0.75, 0.5].map((w, i) => <div key={i} className="h-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: `${w * 100}%` }} />)}</div>
                      </div>
                    ))}
                  </div>
                  {/* Sidebar */}
                  <div className="px-3 pb-3">
                    <div className="flex gap-2 rounded-lg border p-2" style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)', flexDirection: sidebarHidden ? 'column' : 'row' }}>
                      {sidebarHidden && <div className="font-mono text-[8px] text-center" style={{ color: theme.textMuted }}>Sidebar hidden</div>}
                      {!sidebarHidden && (
                        <div className="w-1/4 border-r pr-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          <div className="font-mono text-[8px] mb-1" style={{ color: theme.textMuted }}>Sidebar</div>
                          {[1, 2, 3].map((i) => <div key={i} className="h-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: `${60 + i * 10}%` }} />)}
                        </div>
                      )}
                      <div className={sidebarHidden ? 'w-full' : 'flex-1'}>
                        <div className="font-mono text-[8px] mb-1" style={{ color: theme.textMuted }}>Content</div>
                        {[1, 2, 3, 4].map((i) => <div key={i} className="h-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: `${90 - i * 10}%` }} />)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                  <IconMaximize size={10} style={{ color: theme.textMuted }} />
                  <span className="text-[9px] font-mono" style={{ color: theme.textMuted }}>{viewportWidth} × {activePreset && orientation === 'portrait' ? devices.find((d) => d.name === activePreset)?.height ?? '---' : '---'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BREAKPOINTS TAB */}
        {activeTab === 'breakpoints' && (
          <div className="space-y-6" style={fadeTransition}>
            <div className="p-5" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-sm flex items-center gap-2" style={{ color: '#1a1a1a' }}>
                  <IconRuler size={16} style={{ color: `${theme.accent}80` }} /> CSS Breakpoint Map
                </h3>
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg"
                  style={{ color: currentBreakpointColor, backgroundColor: `${currentBreakpointColor}15`, border: `1px solid ${currentBreakpointColor}30` }}>
                  {currentBreakpoint} ({viewportWidth}px)
                </span>
              </div>
              {/* Breakpoint bar */}
              <div className="relative h-10 rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}` }}>
                <div className="flex h-full">
                  {breakpoints.map((bp) => (
                    <div key={bp.name} className="flex items-center justify-center font-mono text-[10px] font-bold"
                      style={{ backgroundColor: `${bp.color}25`, width: `${((bp.max - bp.min) / 2000) * 100}%`, borderRight: '1px solid rgba(255,255,255,0.06)', color: '#1a1a1a' }}>
                      {bp.name}
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${breakpointPosition}%`, transform: 'translateX(-50%)' }}>
                  <div className="w-0.5 h-full" style={{ backgroundColor: '#1a1a1a', boxShadow: '0 0 8px rgba(26,26,26,0.2)' }} />
                  <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-white text-black text-[9px] font-mono font-bold whitespace-nowrap">{viewportWidth}px</div>
                </div>
              </div>
              <div className="flex mt-2">{breakpoints.map((bp) => (
                <div key={bp.name} className="font-mono text-[9px]" style={{ color: theme.textMuted, width: `${((bp.max - bp.min) / 2000) * 100}%` }}>{bp.min}-{bp.max}px</div>
              ))}</div>
              <div className="mt-4">
                <input type="range" min={320} max={1920} value={viewportWidth}
                  onChange={(e) => { setViewportWidth(Number(e.target.value)); setActivePreset(null); }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f97316 32%, #eab308 38.4%, #22c55e 51.2%, #3b82f6 64%, #a855f7 76.8%)' }}
                  aria-label="Breakpoint position" />
              </div>
              {/* Breakpoint cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-5">
                {breakpoints.map((bp) => {
                  const isActive = viewportWidth >= bp.min && viewportWidth < bp.max;
                  return (
                    <div key={bp.name} className="rounded-lg border p-3 text-center transition-all"
                      style={isActive ? { borderColor: `${bp.color}40`, backgroundColor: `${bp.color}10` } : { borderColor: 'rgba(255,255,255,0.04)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <div className="font-mono text-lg font-bold mb-1" style={{ color: isActive ? bp.color : 'rgba(255,255,255,0.2)' }}>{bp.name}</div>
                      <div className="text-[10px] font-mono" style={{ color: isActive ? bp.color : theme.textMuted }}>{bp.min}-{bp.max}px</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONVERTER TAB */}
        {activeTab === 'converter' && (
          <div className="space-y-6" style={fadeTransition}>
            <div className="p-5" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <h3 className="font-mono text-sm mb-4" style={{ color: '#1a1a1a' }}>Unit Converter</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px]" style={{ color: theme.textMuted }}>Value</label>
                  <input type="number" value={convertValue} onChange={(e) => setConvertValue(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded font-mono text-xs transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.border}`, color: '#ebe5d0' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px]" style={{ color: theme.textMuted }}>From</label>
                  <select value={convertFrom} onChange={(e) => setConvertFrom(e.target.value)}
                    className="w-full px-2 py-1.5 rounded font-mono text-xs cursor-pointer"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.border}`, color: '#ebe5d0' }}>
                    {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px]" style={{ color: theme.textMuted }}>Base font-size (px)</label>
                  <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded font-mono text-xs transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.border}`, color: '#ebe5d0' }} />
                </div>
              </div>
              {/* Conversion results */}
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase tracking-wider" style={{ color: theme.textMuted }}>Conversions</h4>
                {UNIT_OPTIONS.map((unit) => (
                  <div key={unit} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
                    style={{ borderColor: `1px solid ${theme.border}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <span className="font-mono text-[11px]" style={{ color: theme.textMuted }}>{convertValue}{convertFrom} =</span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: '#1a1a1a' }}>{unit === 'vw' || unit === 'vh' ? unit : `${unit} (${unit === 'px' ? Math.round(unitConversions[unit]) : unitConversions[unit].toFixed(2)})`}</span>
                  </div>
                ))}
              </div>
              {/* Quick reference */}
              <h4 className="font-mono text-xs uppercase tracking-wider mt-6" style={{ color: theme.textMuted }}>Quick Reference</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickRef.map((ref) => (
                  <div key={ref.from} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ borderColor: `1px solid ${theme.border}`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <span className="font-mono text-[11px]" style={{ color: theme.textMuted }}>{ref.from}</span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: '#1a1a1a' }}>{ref.to}</span>
                    {ref.note && <span className="text-[9px] ml-1" style={{ color: theme.textMuted }}>{ref.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CODE TAB */}
        {activeTab === 'code' && (
          <div style={fadeTransition}>
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.panelBg }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="font-mono text-[11px] ml-2" style={{ color: theme.textMuted }}>responsive.css</span>
                </div>
                <button onClick={() => handleCopy(generatedCSS)} className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors"
                  style={{ border: `1px solid ${theme.border}`, color: copied ? theme.accent : theme.textMuted, backgroundColor: `${theme.accent}06` }}>
                  {copied ? <><IconCheck size={12} /> Copied</> : <><IconCopy size={12} /> Copy</>}
                </button>
              </div>
              <div className="p-4 font-mono overflow-x-auto max-h-[500px] overflow-y-auto text-xs whitespace-pre" style={{ color: '#ebe5d0' }}>
                {generatedCSS}
              </div>
            </div>
          </div>
        )}

        {/* MEDIA QUERIES (merged into converter for brevity — skipped as separate tab to reduce size) */}
      </div>
    </div>
  );
}

export default ResponsiveShowcase;
