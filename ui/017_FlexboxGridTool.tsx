/**
 * FlexboxGridTool — Interactive Flexbox & CSS Grid layout builder
 *
 * A self-contained layout playground with mode toggle, preset gallery,
 * drag-and-drop items, item property editing, live preview, and CSS
 * code export. Fully configurable via props.
 *
 * @module FlexboxGridTool
 * @example
 * ```tsx
 * import { FlexboxGridTool } from './017_FlexboxGridTool';
 *
 * <FlexboxGridTool maxItems={8} initialMode="flexbox" />
 * ```
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import {
  useIsMounted,
  copyToClipboard,
  GeneratorTheme,
  DEFAULT_THEME,
  IconCopy,
  IconCheck,
  IconRefresh,
  IconEye,
  IconPalette,
  fadeTransition,
} from './shared';

// ─── Types ──────────────────────────────────────────────

type LayoutMode = 'flexbox' | 'grid';
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
type AlignItems = 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type GridJustifyItems = 'start' | 'center' | 'end' | 'stretch';
type GridAlignItems = 'start' | 'center' | 'end' | 'stretch';

interface LayoutItem {
  id: string; flexGrow: number; flexShrink: number; flexBasis: string;
  gridColumn: string; gridRow: string;
}

interface FlexboxConfig {
  flexDirection: FlexDirection; justifyContent: JustifyContent;
  alignItems: AlignItems; flexWrap: FlexWrap; gap: number;
}

interface GridConfig {
  columns: number; rows: number; gap: number;
  justifyItems: GridJustifyItems; alignItems: GridAlignItems;
}

interface LayoutPreset {
  name: string; mode: LayoutMode;
  flex?: Partial<FlexboxConfig>; grid?: Partial<GridConfig>; itemCount?: number;
}

export interface FlexboxGridToolProps {
  /** Initial layout mode */
  initialMode?: LayoutMode;
  /** Max layout items allowed */
  maxItems?: number;
  /** Custom presets */
  presets?: LayoutPreset[];
  /** Theme */
  theme?: GeneratorTheme;
  /** Outer wrapper class */
  className?: string;
}

// ─── Constants ───────────────────────────────────────────

const ITEM_COLORS = [
  '#d4a017', '#b8860b', '#6b6356', '#c23616', '#d4a017',
  '#c23616', '#b8860b', '#6b6356', '#d4a017', '#c23616', '#6b6356', '#d4a017',
];

let itemIdCounter = 0;
function createItem(): LayoutItem {
  return { id: `item-${++itemIdCounter}-${Date.now()}`, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', gridColumn: 'auto', gridRow: 'auto' };
}

const DEFAULT_PRESETS: LayoutPreset[] = [
  { name: 'Navigation Bar', mode: 'flexbox', flex: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }, itemCount: 4 },
  { name: 'Holy Grail', mode: 'grid', grid: { columns: 3, rows: 2, gap: 8 }, itemCount: 5 },
  { name: 'Card Grid', mode: 'grid', grid: { columns: 3, rows: 2, gap: 16, justifyItems: 'stretch', alignItems: 'stretch' }, itemCount: 6 },
  { name: 'Sidebar Dashboard', mode: 'flexbox', flex: { flexDirection: 'row', gap: 12, alignItems: 'stretch' }, itemCount: 3 },
  { name: 'Photo Gallery', mode: 'grid', grid: { columns: 4, rows: 3, gap: 8 }, itemCount: 8 },
  { name: 'Footer Layout', mode: 'flexbox', flex: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }, itemCount: 6 },
  { name: 'Form Layout', mode: 'grid', grid: { columns: 2, rows: 4, gap: 12, alignItems: 'center' }, itemCount: 8 },
  { name: 'Equal Columns', mode: 'grid', grid: { columns: 3, rows: 1, gap: 16, justifyItems: 'stretch', alignItems: 'stretch' }, itemCount: 3 },
];

// ─── Inline SVG Icons ────────────────────────────────────

function IconLayoutGrid({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>;
}

function IconPlus({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
}

function IconMinus({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /></svg>;
}

function IconGrip({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}><circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" /></svg>;
}

function IconGrid3x3({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>;
}

function IconAlignJustify({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="3" y1="10" y2="10" /><line x1="21" x2="3" y1="14" y2="14" /><line x1="21" x2="3" y1="18" y2="18" /></svg>;
}

function IconSparkles({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>;
}

// ─── Syntax Highlighting ────────────────────────────────

function highlightCSS(css: string): React.ReactNode[] {
  const lines = css.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return (
      <div key={`fg-${i}`} className="flex leading-[1.625rem]">
        <span className="select-none w-8 text-right mr-4 shrink-0 text-xs" style={{ color: 'rgba(107,99,86,0.6)' }}>{i + 1}</span>
        <span className="whitespace-pre text-xs">&nbsp;</span>
      </div>
    );
    const parts: React.ReactNode[] = []; let keyIdx = 0;
    const propMatch = line.match(/^(\s*)([\w-]+)(\s*:\s*)(.*)$/);
    if (propMatch) {
      parts.push(<span key={`${i}-p-${keyIdx++}`}>{propMatch[1]}</span>);
      parts.push(<span key={`${i}-p-${keyIdx++}`} className="syn-property">{propMatch[2]}</span>);
      parts.push(<span key={`${i}-p-${keyIdx++}`} className="syn-punctuation">{propMatch[3]}</span>);
      parts.push(<span key={`${i}-p-${keyIdx++}`} className="syn-value">{propMatch[4]}</span>);
    } else if (line.trim() === '{' || line.trim() === '}') {
      parts.push(<span key={`${i}-b-${keyIdx++}`} className="syn-bracket">{line}</span>);
    } else {
      parts.push(<span key={`${i}-s-${keyIdx++}`} className="syn-tag">{line}</span>);
    }
    return (
      <div key={`fg-${i}`} className="flex leading-[1.625rem]">
        <span className="select-none w-8 text-right mr-4 shrink-0 text-xs" style={{ color: 'rgba(107,99,86,0.6)' }}>{i + 1}</span>
        <span className="whitespace-pre text-xs">{parts}</span>
      </div>
    );
  });
}

// ─── Toggle Button Group ────────────────────────────────

function ToggleButtonGroup({ label, options, value, onChange }: {
  label: string; options: { id: string; label: string; shortLabel?: string }[];
  value: string; onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="font-mono text-[11px] mb-2 block tracking-wide" style={{ color: 'rgba(107,99,86,0.8)' }}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            className="relative px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono transition-colors cursor-pointer"
            style={{
              color: value === opt.id ? '#1a1a1a' : 'rgba(107,99,86,0.6)',
              backgroundColor: value === opt.id ? 'rgba(212,160,23,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${value === opt.id ? 'rgba(212,160,23,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>
            {opt.shortLabel || opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export function FlexboxGridTool({
  initialMode = 'flexbox', maxItems = 12, presets = DEFAULT_PRESETS,
  theme = DEFAULT_THEME, className,
}: FlexboxGridToolProps) {
  const mounted = useIsMounted();
  const [mode, setMode] = useState<LayoutMode>(initialMode);
  const [items, setItems] = useState<LayoutItem[]>(() => Array.from({ length: 4 }, () => createItem()));
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [flexConfig, setFlexConfig] = useState<FlexboxConfig>({ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', flexWrap: 'nowrap', gap: 8 });
  const [gridConfig, setGridConfig] = useState<GridConfig>({ columns: 3, rows: 2, gap: 8, justifyItems: 'stretch', alignItems: 'stretch' });
  const [copied, setCopied] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemRef = useRef<string | null>(null);

  const handleAddItem = useCallback(() => {
    setItems((prev) => prev.length >= maxItems ? prev : [...prev, createItem()]);
  }, [maxItems]);

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      if (selectedItemId === id) setSelectedItemId(null);
      return prev.filter((item) => item.id !== id);
    });
  }, [selectedItemId]);

  const handleDragStart = useCallback((id: string) => { dragItemRef.current = id; }, []);
  const handleDragOver = useCallback((e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); }, []);
  const handleDrop = useCallback((targetId: string) => {
    const dragId = dragItemRef.current;
    if (!dragId || dragId === targetId) { setDragOverId(null); return; }
    setItems((prev) => {
      const dragIdx = prev.findIndex((i) => i.id === dragId);
      const targetIdx = prev.findIndex((i) => i.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;
      const next = [...prev]; const [moved] = next.splice(dragIdx, 1); next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragOverId(null); dragItemRef.current = null;
  }, []);
  const handleDragEnd = useCallback(() => { setDragOverId(null); dragItemRef.current = null; }, []);

  const handleUpdateItem = useCallback((id: string, updates: Partial<LayoutItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const handleApplyPreset = useCallback((preset: LayoutPreset) => {
    setMode(preset.mode);
    setItems(Array.from({ length: preset.itemCount || 4 }, () => createItem()));
    if (preset.mode === 'flexbox' && preset.flex) setFlexConfig((prev) => ({ ...prev, ...preset.flex }));
    if (preset.mode === 'grid' && preset.grid) setGridConfig((prev) => ({ ...prev, ...preset.grid }));
    setSelectedItemId(null);
  }, []);

  const handleReset = useCallback(() => {
    setMode(initialMode);
    setFlexConfig({ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', flexWrap: 'nowrap', gap: 8 });
    setGridConfig({ columns: 3, rows: 2, gap: 8, justifyItems: 'stretch', alignItems: 'stretch' });
    setItems(Array.from({ length: 4 }, () => createItem()));
    setSelectedItemId(null);
  }, [initialMode]);

  const cssCode = useMemo(() => {
    if (mode === 'flexbox') {
      const sel = items.find((it) => it.id === selectedItemId);
      let code = `.container {\n  display: flex;\n  flex-direction: ${flexConfig.flexDirection};\n  justify-content: ${flexConfig.justifyContent};\n  align-items: ${flexConfig.alignItems};\n  flex-wrap: ${flexConfig.flexWrap};\n  gap: ${flexConfig.gap}px;\n}`;
      if (sel) { const idx = items.indexOf(sel) + 1; code += `\n\n.item-${idx} {\n  flex-grow: ${sel.flexGrow};\n  flex-shrink: ${sel.flexShrink};\n  flex-basis: ${sel.flexBasis};\n}`; }
      return code;
    }
    const sel = items.find((it) => it.id === selectedItemId);
    let code = `.container {\n  display: grid;\n  grid-template-columns: repeat(${gridConfig.columns}, 1fr);\n  grid-template-rows: repeat(${gridConfig.rows}, auto);\n  gap: ${gridConfig.gap}px;\n  justify-items: ${gridConfig.justifyItems};\n  align-items: ${gridConfig.alignItems};\n}`;
    if (sel && (sel.gridColumn !== 'auto' || sel.gridRow !== 'auto')) {
      const idx = items.indexOf(sel) + 1; code += `\n\n.item-${idx} {\n`;
      if (sel.gridColumn !== 'auto') code += `  grid-column: ${sel.gridColumn};\n`;
      if (sel.gridRow !== 'auto') code += `  grid-row: ${sel.gridRow};\n`;
      code += '}';
    }
    return code;
  }, [mode, flexConfig, gridConfig, items, selectedItemId]);

  const containerStyle = useMemo(() => {
    if (mode === 'flexbox') return { display: 'flex' as const, flexDirection: flexConfig.flexDirection as React.CSSProperties['flexDirection'], justifyContent: flexConfig.justifyContent as React.CSSProperties['justifyContent'], alignItems: flexConfig.alignItems as React.CSSProperties['alignItems'], flexWrap: flexConfig.flexWrap as React.CSSProperties['flexWrap'], gap: `${flexConfig.gap}px` };
    return { display: 'grid' as const, gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`, gridTemplateRows: `repeat(${gridConfig.rows}, auto)`, gap: `${gridConfig.gap}px`, justifyItems: gridConfig.justifyItems as React.CSSProperties['justifyItems'], alignItems: gridConfig.alignItems as React.CSSProperties['alignItems'] };
  }, [mode, flexConfig, gridConfig]);

  const getItemStyle = useCallback((item: LayoutItem): React.CSSProperties => {
    const base: React.CSSProperties = { transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)', cursor: 'grab', minWidth: '40px', minHeight: '40px' };
    if (mode === 'flexbox') return { ...base, flexGrow: item.flexGrow, flexShrink: item.flexShrink, flexBasis: item.flexBasis };
    return { ...base, gridColumn: item.gridColumn, gridRow: item.gridRow };
  }, [mode]);

  const selectedItem = useMemo(() => items.find((it) => it.id === selectedItemId) || null, [items, selectedItemId]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(cssCode);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [cssCode]);

  if (!mounted) return null;

  const flexDirOpts = [{ id: 'row', label: 'row', shortLabel: '→' }, { id: 'row-reverse', label: 'row-reverse', shortLabel: '←' }, { id: 'column', label: 'column', shortLabel: '↓' }, { id: 'column-reverse', label: 'column-reverse', shortLabel: '↑' }];
  const justifyOpts = [{ id: 'flex-start', label: 'flex-start', shortLabel: 'start' }, { id: 'center', label: 'center', shortLabel: 'center' }, { id: 'flex-end', label: 'flex-end', shortLabel: 'end' }, { id: 'space-between', label: 'space-between', shortLabel: 's-bet' }, { id: 'space-around', label: 'space-around', shortLabel: 's-arnd' }, { id: 'space-evenly', label: 'space-evenly', shortLabel: 's-even' }];
  const alignOpts = [{ id: 'stretch', label: 'stretch', shortLabel: 'stretch' }, { id: 'flex-start', label: 'flex-start', shortLabel: 'start' }, { id: 'center', label: 'center', shortLabel: 'center' }, { id: 'flex-end', label: 'flex-end', shortLabel: 'end' }, { id: 'baseline', label: 'baseline', shortLabel: 'base' }];
  const wrapOpts = [{ id: 'nowrap', label: 'nowrap' }, { id: 'wrap', label: 'wrap' }, { id: 'wrap-reverse', label: 'wrap-reverse' }];
  const gridJAlign = [{ id: 'start', label: 'start' }, { id: 'center', label: 'center' }, { id: 'end', label: 'end' }, { id: 'stretch', label: 'stretch' }];

  return (
    <div className={className}>
      {/* Mode Toggle + Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative inline-flex items-center p-1 rounded-none" style={{ border: `1px solid ${theme.border}`, backgroundColor: `${theme.accent}08` }}>
          {(['flexbox', 'grid'] as LayoutMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-mono capitalize transition-colors cursor-pointer"
              style={{ color: mode === m ? '#1a1a1a' : 'rgba(107,99,86,0.7)', ...(mode === m ? { backgroundColor: theme.accent, border: `1px solid #1a1a1a` } : { border: '1px solid transparent' }) }}>
              {m === 'flexbox' ? <IconAlignJustify size={16} /> : <IconGrid3x3 size={16} />}
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <IconSparkles size={14} style={{ color: `${theme.accent}99` }} />
          <span className="font-mono text-sm uppercase tracking-widest" style={{ color: theme.textMuted }}>Presets</span>
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors"
            style={{ border: `1px solid ${theme.border}`, color: theme.textMuted, backgroundColor: `${theme.accent}06` }}>
            <IconRefresh size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {presets.map((preset) => (
          <button key={preset.name} onClick={() => handleApplyPreset(preset)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"
            style={{ border: `1px solid ${theme.border}`, backgroundColor: `${theme.accent}06`, color: theme.textMuted }}>
            {preset.mode === 'flexbox' ? <IconAlignJustify size={12} /> : <IconGrid3x3 size={12} />}
            {preset.name}
          </button>
        ))}
      </div>

      {/* 3-column layout: Controls | Preview | Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Controls */}
        <div className="lg:col-span-4 overflow-hidden flex flex-col rounded-lg" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.panelBg }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="font-mono text-[11px] ml-2" style={{ color: theme.textMuted }}>{mode === 'flexbox' ? 'flexbox.config' : 'grid.config'}</span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[500px]">
            {mode === 'flexbox' ? (
              <div className="space-y-4">
                <ToggleButtonGroup label="flex-direction" options={flexDirOpts} value={flexConfig.flexDirection} onChange={(v) => setFlexConfig((p) => ({ ...p, flexDirection: v as FlexDirection }))} />
                <ToggleButtonGroup label="justify-content" options={justifyOpts} value={flexConfig.justifyContent} onChange={(v) => setFlexConfig((p) => ({ ...p, justifyContent: v as JustifyContent }))} />
                <ToggleButtonGroup label="align-items" options={alignOpts} value={flexConfig.alignItems} onChange={(v) => setFlexConfig((p) => ({ ...p, alignItems: v as AlignItems }))} />
                <ToggleButtonGroup label="flex-wrap" options={wrapOpts} value={flexConfig.flexWrap} onChange={(v) => setFlexConfig((p) => ({ ...p, flexWrap: v as FlexWrap }))} />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[11px]" style={{ color: theme.textMuted }}>gap</label>
                    <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ color: `${theme.accent}cc`, backgroundColor: `${theme.accent}15` }}>{flexConfig.gap}px</span>
                  </div>
                  <input type="range" min={0} max={40} value={flexConfig.gap} onChange={(e) => setFlexConfig((p) => ({ ...p, gap: +e.target.value }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `${theme.accent}30` }} />
                </div>
                <ItemCounter items={items} onAdd={handleAddItem} onRemove={handleRemoveItem} theme={theme} maxItems={maxItems} selectedItemId={selectedItemId} />
              </div>
            ) : (
              <div className="space-y-4">
                <SliderWithLabel label="Grid Columns" value={gridConfig.columns} min={1} max={6} onChange={(v) => setGridConfig((p) => ({ ...p, columns: v }))} theme={theme} note={`repeat(${gridConfig.columns}, 1fr)`} />
                <SliderWithLabel label="Grid Rows" value={gridConfig.rows} min={1} max={4} onChange={(v) => setGridConfig((p) => ({ ...p, rows: v }))} theme={theme} />
                <SliderWithLabel label="gap" value={gridConfig.gap} min={0} max={40} onChange={(v) => setGridConfig((p) => ({ ...p, gap: v }))} theme={theme} />
                <ToggleButtonGroup label="justify-items" options={gridJAlign} value={gridConfig.justifyItems} onChange={(v) => setGridConfig((p) => ({ ...p, justifyItems: v as GridJustifyItems }))} />
                <ToggleButtonGroup label="align-items" options={gridJAlign} value={gridConfig.alignItems} onChange={(v) => setGridConfig((p) => ({ ...p, alignItems: v as GridAlignItems }))} />
                <ItemCounter items={items} onAdd={handleAddItem} onRemove={handleRemoveItem} theme={theme} maxItems={maxItems} selectedItemId={selectedItemId} />
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-4">
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.panelBg }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <IconEye size={12} style={{ color: theme.textMuted, marginLeft: 8 }} />
              <span className="font-mono text-[11px]" style={{ color: theme.textMuted }}>Preview</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: theme.accent, backgroundColor: `${theme.accent}15` }}>{items.length} items</span>
            </div>
            <div className="p-6 min-h-[300px] flex items-center justify-center">
              <div className="w-full" style={containerStyle}>
                {items.map((item, idx) => {
                  const isSelected = selectedItemId === item.id;
                  const isDragOver = dragOverId === item.id;
                  return (
                    <div key={item.id} draggable onDragStart={() => handleDragStart(item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)} onDrop={() => handleDrop(item.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                      className={`rounded-lg border flex items-center justify-center gap-2 px-3 py-4 ${isDragOver ? 'opacity-60' : ''}`}
                      style={{
                        ...getItemStyle(item),
                        border: isSelected ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                        backgroundColor: `${ITEM_COLORS[idx % ITEM_COLORS.length]}18`,
                        boxShadow: isSelected ? `0 0 12px ${ITEM_COLORS[idx % ITEM_COLORS.length]}40` : undefined,
                      }}>
                      <IconGrip size={10} style={{ color: 'rgba(255,255,255,0.3)', position: 'absolute', top: 4, left: 4 }} />
                      <span className="text-[10px] font-mono" style={{ color: ITEM_COLORS[idx % ITEM_COLORS.length] }}>Item {idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Selected item props */}
          {selectedItem && mode === 'flexbox' && (
            <div className="mt-4 p-4 rounded-lg space-y-3" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <span className="text-xs font-mono" style={{ color: theme.textMuted }}>Item Properties</span>
              <SliderWithLabel label="flex-grow" value={selectedItem.flexGrow} min={0} max={5} step={1} onChange={(v) => handleUpdateItem(selectedItem.id, { flexGrow: v })} theme={theme} />
              <SliderWithLabel label="flex-shrink" value={selectedItem.flexShrink} min={0} max={5} step={1} onChange={(v) => handleUpdateItem(selectedItem.id, { flexShrink: v })} theme={theme} />
              <StringProp label="flex-basis" value={selectedItem.flexBasis} placeholder="auto" onChange={(v) => handleUpdateItem(selectedItem.id, { flexBasis: v })} theme={theme} />
            </div>
          )}
          {selectedItem && mode === 'grid' && (
            <div className="mt-4 p-4 rounded-lg space-y-3" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <span className="text-xs font-mono" style={{ color: theme.textMuted }}>Grid Item Properties</span>
              <StringProp label="grid-column" value={selectedItem.gridColumn} placeholder="auto" onChange={(v) => handleUpdateItem(selectedItem.id, { gridColumn: v })} theme={theme} />
              <StringProp label="grid-row" value={selectedItem.gridRow} placeholder="auto" onChange={(v) => handleUpdateItem(selectedItem.id, { gridRow: v })} theme={theme} />
            </div>
          )}
        </div>

        {/* Code */}
        <div className="lg:col-span-4">
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.panelBg }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="font-mono text-[11px] ml-2" style={{ color: theme.textMuted }}>styles.css</span>
              <button onClick={handleCopy} className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors"
                style={{ border: `1px solid ${theme.border}`, color: copied ? theme.accent : theme.textMuted, backgroundColor: `${theme.accent}06` }}>
                {copied ? <><IconCheck size={12} /> Copied</> : <><IconCopy size={12} /> Copy</>}
              </button>
            </div>
            <div className="p-4 font-mono overflow-x-auto max-h-[500px] overflow-y-auto">
              {highlightCSS(cssCode)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Sub-components ───────────────────────────────

function ItemCounter({ items, onAdd, onRemove, theme, maxItems, selectedItemId }: {
  items: LayoutItem[]; onAdd: () => void; onRemove: (id: string) => void;
  theme: GeneratorTheme; maxItems: number; selectedItemId: string | null;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="font-mono text-[11px]" style={{ color: theme.textMuted }}>Items</label>
      <div className="flex items-center gap-1.5">
        <button onClick={() => {
          if (items.length <= 1) return;
          const last = items[items.length - 1];
          if (selectedItemId === last.id) { /* parent handles deselect */ }
          onRemove(last.id);
        }} disabled={items.length <= 1} className="p-1 rounded-md transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer">
          <IconMinus size={14} style={{ color: theme.textMuted }} />
        </button>
        <span className="font-mono text-xs w-6 text-center" style={{ color: '#1a1a1a' }}>{items.length}</span>
        <button onClick={onAdd} disabled={items.length >= maxItems} className="p-1 rounded-md transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer">
          <IconPlus size={14} style={{ color: theme.textMuted }} />
        </button>
      </div>
    </div>
  );
}

function SliderWithLabel({ label, value, min, max, step = 1, note, onChange, theme }: {
  label: string; value: number; min: number; max: number; step?: number;
  note?: string; onChange: (v: number) => void; theme: GeneratorTheme;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="font-mono text-[11px]" style={{ color: theme.textMuted }}>{label}</label>
        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ color: `${theme.accent}cc`, backgroundColor: `${theme.accent}15` }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `${theme.accent}30` }} />
      {note && <p className="font-mono text-[10px] mt-1" style={{ color: theme.textMuted }}>{note}</p>}
    </div>
  );
}

function StringProp({ label, value, placeholder, onChange, theme }: {
  label: string; value: string; placeholder: string; onChange: (v: string) => void; theme: GeneratorTheme;
}) {
  return (
    <div>
      <label className="font-mono text-[11px]" style={{ color: theme.textMuted }}>{label}</label>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 rounded font-mono text-xs mt-1 transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.border}`, color: '#ebe5d0' }} />
    </div>
  );
}

export default FlexboxGridTool;
