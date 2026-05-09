// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1382

'use client';

import { useState, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Copy,
  Check,
  Plus,
  Minus,
  Code2,
  Eye,
  GripVertical,
  RotateCcw,
  Columns3,
  Rows3,
  ArrowUpDown,
  AlignJustify,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Grid3x3,
  MoveHorizontal,
  MoveVertical,
  StretchHorizontal,
  StretchVertical,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type LayoutMode = 'flexbox' | 'grid';
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
type AlignItems = 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type GridJustifyItems = 'start' | 'center' | 'end' | 'stretch';
type GridAlignItems = 'start' | 'center' | 'end' | 'stretch';

interface LayoutItem {
  id: string;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  gridColumn: string;
  gridRow: string;
}

interface FlexboxConfig {
  flexDirection: FlexDirection;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  flexWrap: FlexWrap;
  gap: number;
}

interface GridConfig {
  columns: number;
  rows: number;
  gap: number;
  justifyItems: GridJustifyItems;
  alignItems: GridAlignItems;
}

interface LayoutPreset {
  name: string;
  mode: LayoutMode;
  flex?: Partial<FlexboxConfig>;
  grid?: Partial<GridConfig>;
  itemCount?: number;
}

// ============================================================
// Constants
// ============================================================

const ITEM_COLORS = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899',
  '#14b8a6', '#f472b6', '#34d399', '#a78bfa', '#fbbf24',
  '#f87171', '#60a5fa',
];

let itemIdCounter = 0;

function createItem(): LayoutItem {
  return {
    id: `item-${++itemIdCounter}-${Date.now()}`,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    gridColumn: 'auto',
    gridRow: 'auto',
  };
}

const PRESETS: LayoutPreset[] = [
  {
    name: 'Navigation Bar',
    mode: 'flexbox',
    flex: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
    itemCount: 4,
  },
  {
    name: 'Holy Grail',
    mode: 'grid',
    grid: { columns: 3, rows: 2, gap: 8 },
    itemCount: 5,
  },
  {
    name: 'Card Grid',
    mode: 'grid',
    grid: { columns: 3, rows: 2, gap: 16, justifyItems: 'stretch', alignItems: 'stretch' },
    itemCount: 6,
  },
  {
    name: 'Sidebar Dashboard',
    mode: 'flexbox',
    flex: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
    itemCount: 3,
  },
  {
    name: 'Photo Gallery',
    mode: 'grid',
    grid: { columns: 4, rows: 3, gap: 8 },
    itemCount: 8,
  },
  {
    name: 'Footer Layout',
    mode: 'flexbox',
    flex: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 },
    itemCount: 6,
  },
  {
    name: 'Form Layout',
    mode: 'grid',
    grid: { columns: 2, rows: 4, gap: 12, alignItems: 'center' },
    itemCount: 8,
  },
  {
    name: 'Equal Columns',
    mode: 'grid',
    grid: { columns: 3, rows: 1, gap: 16, justifyItems: 'stretch', alignItems: 'stretch' },
    itemCount: 3,
  },
];

const FLOATING_SYMBOLS = [
  'flex', 'grid', 'row', 'col', 'gap', '1fr', 'auto',
  'span', 'wrap', 'stretch', '⟟', '⟡', '⊞', '⊟', '⊞',
  'column', 'repeat()', 'minmax()', 'place-items',
];

// ============================================================
// Syntax Highlighting
// ============================================================

function highlightCSS(css: string): React.ReactNode[] {
  const lines = css.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) {
      return (
        <div key={`fg-css-${i}`} className="flex leading-[1.625rem]">
          <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{i + 1}</span>
          <span className="whitespace-pre text-xs">&nbsp;</span>
        </div>
      );
    }

    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIdx = 0;

    // Match property: value pattern
    const propMatch = remaining.match(/^(\s*)([\w-]+)(\s*:\s*)(.*)$/);
    if (propMatch) {
      parts.push(<span key={`${i}-ws-${keyIdx++}`}>{propMatch[1]}</span>);
      parts.push(<span key={`${i}-prop-${keyIdx++}`} className="syn-property">{propMatch[2]}</span>);
      parts.push(<span key={`${i}-colon-${keyIdx++}`} className="syn-punctuation">{propMatch[3]}</span>);

      let val = propMatch[4];
      // Highlight values - numbers, strings, keywords
      const valParts: React.ReactNode[] = [];
      let valRemaining = val;
      let valKey = 0;

      // Match numbers with units
      const numRegex = /(\d+(?:\.\d+)?)(px|%|rem|em|fr|vw|vh|deg|ms|s)?/g;
      let lastIdx = 0;
      let numMatch;
      while ((numMatch = numRegex.exec(valRemaining)) !== null) {
        if (numMatch.index > lastIdx) {
          const textBefore = valRemaining.slice(lastIdx, numMatch.index);
          if (['auto', 'stretch', 'start', 'end', 'center', 'baseline', 'nowrap', 'wrap', 'wrap-reverse', 'row', 'column', 'row-reverse', 'column-reverse', 'space-between', 'space-around', 'space-evenly', 'flex-start', 'flex-end', 'minmax', 'repeat', 'span'].some(k => textBefore.trim().startsWith(k))) {
            valParts.push(<span key={`${i}-val-${valKey++}`} className="syn-keyword">{textBefore}</span>);
          } else if (textBefore.includes('#')) {
            valParts.push(<span key={`${i}-val-${valKey++}`} className="syn-number">{textBefore}</span>);
          } else {
            valParts.push(<span key={`${i}-val-${valKey++}`} className="syn-value">{textBefore}</span>);
          }
        }
        valParts.push(<span key={`${i}-num-${valKey++}`} className="syn-number">{numMatch[0]}</span>);
        lastIdx = numMatch.index + numMatch[0].length;
      }
      if (lastIdx < valRemaining.length) {
        const textAfter = valRemaining.slice(lastIdx);
        if (['auto', 'stretch', 'start', 'end', 'center', 'baseline', 'nowrap', 'wrap', 'wrap-reverse', 'row', 'column', 'row-reverse', 'column-reverse', 'space-between', 'space-around', 'space-evenly', 'flex-start', 'flex-end'].includes(textAfter.trim())) {
          valParts.push(<span key={`${i}-val-${valKey++}`} className="syn-keyword">{textAfter}</span>);
        } else if (textAfter.includes('(')) {
          valParts.push(<span key={`${i}-fn-${valKey++}`} className="syn-function">{textAfter}</span>);
        } else {
          valParts.push(<span key={`${i}-val-${valKey++}`} className="syn-value">{textAfter}</span>);
        }
      }

      parts.push(<span key={`${i}-vals-${keyIdx++}`}>{valParts.length > 0 ? valParts : <span className="syn-value">{val}</span>}</span>);
    } else if (line.trim() === '{') {
      parts.push(<span key={`${i}-brace-${keyIdx++}`} className="syn-bracket">{line}</span>);
    } else if (line.trim() === '}') {
      parts.push(<span key={`${i}-brace-${keyIdx++}`} className="syn-bracket">{line}</span>);
    } else {
      // Selector or other
      parts.push(<span key={`${i}-sel-${keyIdx++}`} className="syn-tag">{line}</span>);
    }

    return (
      <div key={`fg-css-${i}`} className="flex leading-[1.625rem]">
        <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{i + 1}</span>
        <span className="whitespace-pre text-xs">{parts}</span>
      </div>
    );
  });
}

// ============================================================
// Floating Decorations
// ============================================================

function FloatingDecorations() {
  const items = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    symbol: FLOATING_SYMBOLS[i % FLOATING_SYMBOLS.length],
    left: 3 + (i * 7.1) % 94,
    top: 3 + (i * 7.3) % 94,
    size: 9 + (i % 3) * 3,
    duration: 10 + (i * 1.7) % 14,
    delay: (i * 0.6) % 7,
    rotate: -20 + (i * 8) % 40,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <motion.span
          key={item.id}
          className="absolute font-mono select-none"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.size}px`,
            color: 'rgba(255,255,255,0.025)',
          }}
          animate={{
            y: [0, -12, 0, 8, 0],
            x: [0, 6, -4, 2, 0],
            rotate: [item.rotate, item.rotate + 3, item.rotate - 2, item.rotate + 1, item.rotate],
            opacity: [0.02, 0.045, 0.03, 0.04, 0.02],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeatType: 'loop',
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.symbol}
        </motion.span>
      ))}
    </div>
  );
}

// ============================================================
// Toggle Button Group
// ============================================================

function ToggleButtonGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string; shortLabel?: string }[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="font-mono text-[11px] text-white/40 mb-2 block tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = value === opt.id;
          return (
            <motion.button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className="relative px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono transition-colors"
              style={{
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)',
                backgroundColor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {opt.shortLabel || opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function FlexboxGridSection() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Layout mode
  const [mode, setMode] = useState<LayoutMode>('flexbox');

  // Items
  const [items, setItems] = useState<LayoutItem[]>(() =>
    Array.from({ length: 4 }, () => createItem()),
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Flexbox config
  const [flexConfig, setFlexConfig] = useState<FlexboxConfig>({
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
    gap: 8,
  });

  // Grid config
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    columns: 3,
    rows: 2,
    gap: 8,
    justifyItems: 'stretch',
    alignItems: 'stretch',
  });

  // UI state
  const [copied, setCopied] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemRef = useRef<string | null>(null);

  // ─── Item management ───
  const handleAddItem = useCallback(() => {
    setItems((prev) => {
      if (prev.length >= 12) return prev;
      return [...prev, createItem()];
    });
  }, []);

  const handleRemoveItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((item) => item.id !== id);
        if (selectedItemId === id) setSelectedItemId(null);
        return next;
      });
    },
    [selectedItemId],
  );

  // ─── Drag and drop ───
  const handleDragStart = useCallback((id: string) => {
    dragItemRef.current = id;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback(
    (targetId: string) => {
      const dragId = dragItemRef.current;
      if (!dragId || dragId === targetId) {
        setDragOverId(null);
        return;
      }
      setItems((prev) => {
        const dragIdx = prev.findIndex((item) => item.id === dragId);
        const targetIdx = prev.findIndex((item) => item.id === targetId);
        if (dragIdx === -1 || targetIdx === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      });
      setDragOverId(null);
      dragItemRef.current = null;
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDragOverId(null);
    dragItemRef.current = null;
  }, []);

  // ─── Item property updates ───
  const handleUpdateItem = useCallback((id: string, updates: Partial<LayoutItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  // ─── Preset application ───
  const handleApplyPreset = useCallback((preset: LayoutPreset) => {
    setMode(preset.mode);
    const count = preset.itemCount || 4;
    setItems(Array.from({ length: count }, () => createItem()));

    if (preset.mode === 'flexbox' && preset.flex) {
      setFlexConfig((prev) => ({ ...prev, ...preset.flex }));
    }
    if (preset.mode === 'grid' && preset.grid) {
      setGridConfig((prev) => ({ ...prev, ...preset.grid }));
    }
    setSelectedItemId(null);
  }, []);

  // ─── Reset ───
  const handleReset = useCallback(() => {
    setMode('flexbox');
    setFlexConfig({
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      flexWrap: 'nowrap',
      gap: 8,
    });
    setGridConfig({
      columns: 3,
      rows: 2,
      gap: 8,
      justifyItems: 'stretch',
      alignItems: 'stretch',
    });
    setItems(Array.from({ length: 4 }, () => createItem()));
    setSelectedItemId(null);
  }, []);

  // ─── Generate CSS code ───
  const cssCode = useMemo(() => {
    if (mode === 'flexbox') {
      const selectedItem = items.find((it) => it.id === selectedItemId);
      let code = `.container {\n  display: flex;\n  flex-direction: ${flexConfig.flexDirection};\n  justify-content: ${flexConfig.justifyContent};\n  align-items: ${flexConfig.alignItems};\n  flex-wrap: ${flexConfig.flexWrap};\n  gap: ${flexConfig.gap}px;\n}`;

      if (selectedItem) {
        const idx = items.indexOf(selectedItem) + 1;
        code += `\n\n.item-${idx} {\n  flex-grow: ${selectedItem.flexGrow};\n  flex-shrink: ${selectedItem.flexShrink};\n  flex-basis: ${selectedItem.flexBasis};\n}`;
      }
      return code;
    } else {
      const selectedItem = items.find((it) => it.id === selectedItemId);
      let code = `.container {\n  display: grid;\n  grid-template-columns: repeat(${gridConfig.columns}, 1fr);\n  grid-template-rows: repeat(${gridConfig.rows}, auto);\n  gap: ${gridConfig.gap}px;\n  justify-items: ${gridConfig.justifyItems};\n  align-items: ${gridConfig.alignItems};\n}`;

      if (selectedItem && (selectedItem.gridColumn !== 'auto' || selectedItem.gridRow !== 'auto')) {
        const idx = items.indexOf(selectedItem) + 1;
        code += `\n\n.item-${idx} {\n`;
        if (selectedItem.gridColumn !== 'auto') code += `  grid-column: ${selectedItem.gridColumn};\n`;
        if (selectedItem.gridRow !== 'auto') code += `  grid-row: ${selectedItem.gridRow};\n`;
        code += `}`;
      }
      return code;
    }
  }, [mode, flexConfig, gridConfig, items, selectedItemId]);

  // ─── Container style for preview ───
  const containerStyle = useMemo(() => {
    if (mode === 'flexbox') {
      return {
        display: 'flex' as const,
        flexDirection: flexConfig.flexDirection as React.CSSProperties['flexDirection'],
        justifyContent: flexConfig.justifyContent as React.CSSProperties['justifyContent'],
        alignItems: flexConfig.alignItems as React.CSSProperties['alignItems'],
        flexWrap: flexConfig.flexWrap as React.CSSProperties['flexWrap'],
        gap: `${flexConfig.gap}px`,
      };
    } else {
      return {
        display: 'grid' as const,
        gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
        gridTemplateRows: `repeat(${gridConfig.rows}, auto)`,
        gap: `${gridConfig.gap}px`,
        justifyItems: gridConfig.justifyItems as React.CSSProperties['justifyItems'],
        alignItems: gridConfig.alignItems as React.CSSProperties['alignItems'],
      };
    }
  }, [mode, flexConfig, gridConfig]);

  // ─── Item style ───
  const getItemStyle = useCallback(
    (item: LayoutItem): React.CSSProperties => {
      const base: React.CSSProperties = {
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: 'grab',
        minWidth: '40px',
        minHeight: '40px',
      };

      if (mode === 'flexbox') {
        return {
          ...base,
          flexGrow: item.flexGrow,
          flexShrink: item.flexShrink,
          flexBasis: item.flexBasis,
        };
      } else {
        return {
          ...base,
          gridColumn: item.gridColumn,
          gridRow: item.gridRow,
        };
      }
    },
    [mode],
  );

  // ─── Copy handler ───
  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(cssCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = cssCode;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  }, [cssCode]);

  // ─── Selected item ───
  const selectedItem = useMemo(() => items.find((it) => it.id === selectedItemId) || null, [items, selectedItemId]);

  if (!mounted) return null;

  const flexDirectionOptions = [
    { id: 'row', label: 'row', shortLabel: '→' },
    { id: 'row-reverse', label: 'row-reverse', shortLabel: '←' },
    { id: 'column', label: 'column', shortLabel: '↓' },
    { id: 'column-reverse', label: 'column-reverse', shortLabel: '↑' },
  ];

  const justifyContentOptions = [
    { id: 'flex-start', label: 'flex-start', shortLabel: 'start' },
    { id: 'center', label: 'center', shortLabel: 'center' },
    { id: 'flex-end', label: 'flex-end', shortLabel: 'end' },
    { id: 'space-between', label: 'space-between', shortLabel: 's-bet' },
    { id: 'space-around', label: 'space-around', shortLabel: 's-arnd' },
    { id: 'space-evenly', label: 'space-evenly', shortLabel: 's-even' },
  ];

  const alignItemsOptions = [
    { id: 'stretch', label: 'stretch', shortLabel: 'stretch' },
    { id: 'flex-start', label: 'flex-start', shortLabel: 'start' },
    { id: 'center', label: 'center', shortLabel: 'center' },
    { id: 'flex-end', label: 'flex-end', shortLabel: 'end' },
    { id: 'baseline', label: 'baseline', shortLabel: 'base' },
  ];

  const flexWrapOptions = [
    { id: 'nowrap', label: 'nowrap' },
    { id: 'wrap', label: 'wrap' },
    { id: 'wrap-reverse', label: 'wrap-reverse' },
  ];

  const gridJustifyOptions = [
    { id: 'start', label: 'start' },
    { id: 'center', label: 'center' },
    { id: 'end', label: 'end' },
    { id: 'stretch', label: 'stretch' },
  ];

  return (
    <section
      id="flexbox-grid"
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0a1a10 50%, #0a0a0a 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Floating decorations */}
      <FloatingDecorations />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {/* ===== Section Header ===== */}
        <div className="pt-20 sm:pt-28 pb-10 sm:pb-14 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] mb-6">
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-widest">CSS Tool</span>
            </div>

            <h2
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4, #10b981)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 4s ease-in-out infinite',
              }}
            >
              Layout Lab
            </h2>

            <p className="font-mono text-sm sm:text-base text-white/30 tracking-wide max-w-lg mx-auto">
              Interactive Flexbox &amp; CSS Grid playground with live preview
            </p>
          </motion.div>
        </div>

        {/* ===== Main Content ===== */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          {/* --- Mode Toggle --- */}
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative inline-flex items-center p-1 rounded-xl border border-white/[0.08] bg-white/[0.03]">
              {(['flexbox', 'grid'] as LayoutMode[]).map((m) => {
                const isActive = mode === m;
                const Icon = m === 'flexbox' ? AlignJustify : Grid3x3;
                return (
                  <motion.button
                    key={m}
                    onClick={() => setMode(m)}
                    className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-mono capitalize transition-colors"
                    style={{
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon className="w-4 h-4" />
                    {m}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          boxShadow: '0 0 15px rgba(16,185,129,0.08)',
                        }}
                        layoutId="modeIndicator"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* --- Presets Row --- */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400/60" />
              <h3 className="font-mono text-sm text-white/40 tracking-widest uppercase">Presets</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
              <motion.button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-white/40 hover:text-white/60 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {PRESETS.map((preset) => (
                <motion.button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {preset.mode === 'flexbox' ? (
                    <AlignJustify className="w-3 h-3" />
                  ) : (
                    <Grid3x3 className="w-3 h-3" />
                  )}
                  {preset.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* --- Three-column layout: Controls | Preview | Code --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">

            {/* ===== Controls Panel ===== */}
            <motion.div
              className="lg:col-span-4 rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col"
              style={{ background: '#0d1117' }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Panel header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="font-mono text-[11px] text-white/30 ml-2">
                  {mode === 'flexbox' ? 'flexbox.config' : 'grid.config'}
                </span>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar max-h-[500px]">
                <AnimatePresence mode="wait">
                  {mode === 'flexbox' ? (
                    <motion.div
                      key="flexbox-controls"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <ToggleButtonGroup
                        label="flex-direction"
                        options={flexDirectionOptions}
                        value={flexConfig.flexDirection}
                        onChange={(v) =>
                          setFlexConfig((prev) => ({ ...prev, flexDirection: v as FlexDirection }))
                        }
                      />
                      <ToggleButtonGroup
                        label="justify-content"
                        options={justifyContentOptions}
                        value={flexConfig.justifyContent}
                        onChange={(v) =>
                          setFlexConfig((prev) => ({ ...prev, justifyContent: v as JustifyContent }))
                        }
                      />
                      <ToggleButtonGroup
                        label="align-items"
                        options={alignItemsOptions}
                        value={flexConfig.alignItems}
                        onChange={(v) =>
                          setFlexConfig((prev) => ({ ...prev, alignItems: v as AlignItems }))
                        }
                      />
                      <ToggleButtonGroup
                        label="flex-wrap"
                        options={flexWrapOptions}
                        value={flexConfig.flexWrap}
                        onChange={(v) =>
                          setFlexConfig((prev) => ({ ...prev, flexWrap: v as FlexWrap }))
                        }
                      />

                      {/* Gap slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-mono text-[11px] text-white/40 flex items-center gap-2">
                            <Columns3 className="w-3 h-3 text-cyan-400/50" />
                            gap
                          </label>
                          <span className="font-mono text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {flexConfig.gap}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={40}
                          value={flexConfig.gap}
                          onChange={(e) =>
                            setFlexConfig((prev) => ({ ...prev, gap: Number(e.target.value) }))
                          }
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))',
                          }}
                          aria-label="Flex gap"
                        />
                      </div>

                      {/* Item count */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-mono text-[11px] text-white/40">Items</label>
                          <div className="flex items-center gap-1.5">
                            <motion.button
                              onClick={() => {
                                setItems((prev) => {
                                  if (prev.length <= 1) return prev;
                                  if (selectedItemId === prev[prev.length - 1].id) setSelectedItemId(null);
                                  return prev.slice(0, -1);
                                });
                              }}
                              disabled={items.length <= 1}
                              className="p-1 rounded-md hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Minus className="w-3.5 h-3.5 text-white/40" />
                            </motion.button>
                            <span className="font-mono text-xs text-white/50 w-6 text-center">{items.length}</span>
                            <motion.button
                              onClick={handleAddItem}
                              disabled={items.length >= 12}
                              className="p-1 rounded-md hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="w-3.5 h-3.5 text-white/40" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="grid-controls"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Columns */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-mono text-[11px] text-white/40 flex items-center gap-2">
                            <Columns3 className="w-3 h-3 text-cyan-400/50" />
                            Grid Columns
                          </label>
                          <span className="font-mono text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {gridConfig.columns}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={6}
                          value={gridConfig.columns}
                          onChange={(e) =>
                            setGridConfig((prev) => ({ ...prev, columns: Number(e.target.value) }))
                          }
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))',
                          }}
                          aria-label="Grid columns"
                        />
                        <p className="font-mono text-[10px] text-white/20 mt-1">
                          repeat({gridConfig.columns}, 1fr)
                        </p>
                      </div>

                      {/* Rows */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-mono text-[11px] text-white/40 flex items-center gap-2">
                            <Rows3 className="w-3 h-3 text-cyan-400/50" />
                            Grid Rows
                          </label>
                          <span className="font-mono text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {gridConfig.rows}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={4}
                          value={gridConfig.rows}
                          onChange={(e) =>
                            setGridConfig((prev) => ({ ...prev, rows: Number(e.target.value) }))
                          }
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))',
                          }}
                          aria-label="Grid rows"
                        />
                      </div>

                      {/* Gap slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-mono text-[11px] text-white/40 flex items-center gap-2">
                            <StretchHorizontal className="w-3 h-3 text-cyan-400/50" />
                            gap
                          </label>
                          <span className="font-mono text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {gridConfig.gap}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={40}
                          value={gridConfig.gap}
                          onChange={(e) =>
                            setGridConfig((prev) => ({ ...prev, gap: Number(e.target.value) }))
                          }
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))',
                          }}
                          aria-label="Grid gap"
                        />
                      </div>

                      <ToggleButtonGroup
                        label="justify-items"
                        options={gridJustifyOptions}
                        value={gridConfig.justifyItems}
                        onChange={(v) =>
                          setGridConfig((prev) => ({ ...prev, justifyItems: v as GridJustifyItems }))
                        }
                      />
                      <ToggleButtonGroup
                        label="align-items"
                        options={gridJustifyOptions}
                        value={gridConfig.alignItems}
                        onChange={(v) =>
                          setGridConfig((prev) => ({ ...prev, alignItems: v as GridAlignItems }))
                        }
                      />

                      {/* Item count */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-mono text-[11px] text-white/40">Items</label>
                          <div className="flex items-center gap-1.5">
                            <motion.button
                              onClick={() => {
                                setItems((prev) => {
                                  if (prev.length <= 1) return prev;
                                  if (selectedItemId === prev[prev.length - 1].id) setSelectedItemId(null);
                                  return prev.slice(0, -1);
                                });
                              }}
                              disabled={items.length <= 1}
                              className="p-1 rounded-md hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Minus className="w-3.5 h-3.5 text-white/40" />
                            </motion.button>
                            <span className="font-mono text-xs text-white/50 w-6 text-center">{items.length}</span>
                            <motion.button
                              onClick={handleAddItem}
                              disabled={items.length >= 12}
                              className="p-1 rounded-md hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="w-3.5 h-3.5 text-white/40" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected Item Properties */}
                {selectedItem && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/[0.06] pt-4 mt-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[11px] text-emerald-400/80 flex items-center gap-2">
                        <Eye className="w-3 h-3" />
                        Item {items.indexOf(selectedItem) + 1} Properties
                      </span>
                      <motion.button
                        onClick={() => setSelectedItemId(null)}
                        className="text-white/30 hover:text-white/60 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>
                    </div>

                    <div className="space-y-3">
                      {mode === 'flexbox' ? (
                        <>
                          {/* flex-grow */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-mono text-[10px] text-white/30">flex-grow</label>
                              <span className="font-mono text-[10px] text-emerald-400/60">{selectedItem.flexGrow}</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={5}
                              step={1}
                              value={selectedItem.flexGrow}
                              onChange={(e) =>
                                handleUpdateItem(selectedItem.id, { flexGrow: Number(e.target.value) })
                              }
                              className="w-full h-1 rounded-full appearance-none cursor-pointer"
                              style={{ background: 'rgba(16,185,129,0.2)' }}
                            />
                          </div>
                          {/* flex-shrink */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-mono text-[10px] text-white/30">flex-shrink</label>
                              <span className="font-mono text-[10px] text-emerald-400/60">{selectedItem.flexShrink}</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={5}
                              step={1}
                              value={selectedItem.flexShrink}
                              onChange={(e) =>
                                handleUpdateItem(selectedItem.id, { flexShrink: Number(e.target.value) })
                              }
                              className="w-full h-1 rounded-full appearance-none cursor-pointer"
                              style={{ background: 'rgba(16,185,129,0.2)' }}
                            />
                          </div>
                          {/* flex-basis */}
                          <ToggleButtonGroup
                            label="flex-basis"
                            options={[
                              { id: 'auto', label: 'auto' },
                              { id: '100px', label: '100px' },
                              { id: '150px', label: '150px' },
                              { id: '200px', label: '200px' },
                              { id: '0', label: '0' },
                            ]}
                            value={selectedItem.flexBasis}
                            onChange={(v) => handleUpdateItem(selectedItem.id, { flexBasis: v })}
                          />
                        </>
                      ) : (
                        <>
                          {/* grid-column span */}
                          <div>
                            <label className="font-mono text-[10px] text-white/30 mb-1.5 block">grid-column</label>
                            <div className="flex flex-wrap gap-1.5">
                              {['auto', 'span 2', 'span 3', '1 / 3', '1 / -1'].map((opt) => (
                                <motion.button
                                  key={opt}
                                  onClick={() => handleUpdateItem(selectedItem.id, { gridColumn: opt })}
                                  className="px-2 py-1 rounded-md text-[10px] font-mono transition-colors"
                                  style={{
                                    color: selectedItem.gridColumn === opt ? '#ffffff' : 'rgba(255,255,255,0.35)',
                                    backgroundColor: selectedItem.gridColumn === opt ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${selectedItem.gridColumn === opt ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                  }}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  {opt}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                          {/* grid-row span */}
                          <div>
                            <label className="font-mono text-[10px] text-white/30 mb-1.5 block">grid-row</label>
                            <div className="flex flex-wrap gap-1.5">
                              {['auto', 'span 2', 'span 3', '1 / 3', '1 / -1'].map((opt) => (
                                <motion.button
                                  key={opt}
                                  onClick={() => handleUpdateItem(selectedItem.id, { gridRow: opt })}
                                  className="px-2 py-1 rounded-md text-[10px] font-mono transition-colors"
                                  style={{
                                    color: selectedItem.gridRow === opt ? '#ffffff' : 'rgba(255,255,255,0.35)',
                                    backgroundColor: selectedItem.gridRow === opt ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${selectedItem.gridRow === opt ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                  }}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  {opt}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Panel footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  <span className="font-mono text-[10px] text-white/20">Live</span>
                </div>
                <span className="font-mono text-[10px] text-white/15">{items.length} items</span>
              </div>
            </motion.div>

            {/* ===== Preview Panel ===== */}
            <motion.div
              className="lg:col-span-5 rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col"
              style={{ background: '#0d1117' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="font-mono text-[11px] text-white/30 ml-2 flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-white/25" />
                  Preview
                </span>
                <div className="flex-1" />
                <span className="font-mono text-[10px] text-white/15 uppercase">
                  {mode === 'flexbox' ? 'display: flex' : 'display: grid'}
                </span>
              </div>

              <div className="flex-1 p-4 sm:p-6">
                <div
                  className="w-full min-h-[300px] sm:min-h-[400px] p-3 sm:p-4 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01]"
                  style={containerStyle}
                >
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => {
                      const isSelected = selectedItemId === item.id;
                      const isDragOver = dragOverId === item.id;
                      const color = ITEM_COLORS[index % ITEM_COLORS.length];
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.25, layout: { duration: 0.3 } }}
                          draggable
                          onDragStart={() => handleDragStart(item.id)}
                          onDragOver={(e) => handleDragOver(e, item.id)}
                          onDrop={() => handleDrop(item.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                          className="relative flex items-center justify-center rounded-lg font-mono text-xs sm:text-sm font-bold select-none group"
                          style={{
                            ...getItemStyle(item),
                            backgroundColor: `${color}20`,
                            border: `2px solid ${isSelected ? '#10b981' : isDragOver ? '#06b6d4' : `${color}40`}`,
                            color: color,
                            boxShadow: isSelected
                              ? `0 0 20px ${color}30, inset 0 0 20px ${color}10`
                              : 'none',
                          }}
                          whileHover={{
                            scale: 1.03,
                            boxShadow: `0 0 15px ${color}20`,
                          }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {/* Drag grip */}
                          <div className="absolute top-0.5 left-1 opacity-0 group-hover:opacity-40 transition-opacity">
                            <GripVertical className="w-3 h-3" />
                          </div>
                          <span className="relative z-10">{index + 1}</span>
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 rounded-lg"
                              style={{
                                border: '2px solid #10b981',
                                boxShadow: '0 0 12px rgba(16,185,129,0.3)',
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Preview footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                <span className="font-mono text-[10px] text-white/20">
                  {mode === 'flexbox' ? 'Flexbox' : 'CSS Grid'} · {items.length} items
                </span>
                <span className="font-mono text-[10px] text-white/15">Drag to reorder</span>
              </div>
            </motion.div>

            {/* ===== Code Output Panel ===== */}
            <motion.div
              className="lg:col-span-3 rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col"
              style={{ background: '#0d1117' }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="flex items-center border-b border-white/[0.06]">
                <div className="flex items-center gap-2 px-4 py-3 border-r border-white/[0.04]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="font-mono text-[11px] text-white/30 px-3 flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-white/25" />
                  Generated CSS
                </span>
                <div className="flex-1" />
                <motion.button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Copy to clipboard"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-1.5 text-emerald-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <div className="p-4 overflow-y-auto custom-scrollbar font-mono max-h-[500px]" style={{ color: '#f8f8f2' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${mode}-${cssCode.slice(0, 30)}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {highlightCSS(cssCode)}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Code footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                <span className="font-mono text-[10px] text-white/20 uppercase">CSS</span>
                <span className="font-mono text-[10px] text-white/15">{cssCode.split('\n').length} lines</span>
              </div>
            </motion.div>
          </div>

          {/* ===== Info Bar ===== */}
          <motion.div
            className="mt-10 flex items-center justify-center gap-3 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { label: '2 Modes', icon: LayoutGrid },
              { label: '15+ Properties', icon: AlignJustify },
              { label: '8 Presets', icon: Sparkles },
              { label: 'Live Preview', icon: Eye },
            ].map((info, i) => {
              const InfoIcon = info.icon;
              return (
                <div
                  key={`fg-info-${i}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02]"
                >
                  <InfoIcon className="w-3.5 h-3.5 text-emerald-400/50" />
                  <span className="font-mono text-[11px] sm:text-xs text-white/40">{info.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
