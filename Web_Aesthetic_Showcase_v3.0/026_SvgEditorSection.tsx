// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1142

'use client';

import { useState, useCallback, useRef, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Move,
  Pen,
  Circle,
  Star,
  Heart,
  ArrowRight,
  Zap,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Check,
  RotateCw,
  Minus,
  Plus,
  Eye,
  Code2,
  Download,
  Hexagon,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

interface Point {
  x: number;
  y: number;
  id: number;
}

type PathType = 'line' | 'smooth' | 'freehand';
type DashType = 'solid' | 'dashed' | 'dotted';
type LineCap = 'butt' | 'round' | 'square';
type LineJoin = 'miter' | 'round' | 'bevel';

interface PathStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  fillOpacity: number;
  dashType: DashType;
  lineCap: LineCap;
  lineJoin: LineJoin;
}

interface Transform {
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;
}

interface HistoryState {
  points: Point[];
  style: PathStyle;
  transform: Transform;
  pathType: PathType;
  closePath: boolean;
}

/* ──────────────────────────────────────────────
   PRE-BUILT SHAPES
   ────────────────────────────────────────────── */

function generateStar(cx: number, cy: number, outerR: number, innerR: number, points: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), id: i });
  }
  return pts;
}

function generateHeart(cx: number, cy: number, size: number): Point[] {
  const pts: Point[] = [];
  const steps = 30;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push({ x: cx + x * (size / 16), y: cy + y * (size / 16), id: i });
  }
  return pts;
}

function generateArrow(cx: number, cy: number, size: number): Point[] {
  const half = size / 2;
  return [
    { x: cx - half, y: cy - half * 0.3, id: 0 },
    { x: cx + half * 0.2, y: cy - half * 0.3, id: 1 },
    { x: cx + half * 0.2, y: cy - half * 0.7, id: 2 },
    { x: cx + half, y: cy, id: 3 },
    { x: cx + half * 0.2, y: cy + half * 0.7, id: 4 },
    { x: cx + half * 0.2, y: cy + half * 0.3, id: 5 },
    { x: cx - half, y: cy + half * 0.3, id: 6 },
  ];
}

function generateLightning(cx: number, cy: number, size: number): Point[] {
  const half = size / 2;
  return [
    { x: cx - half * 0.1, y: cy - half, id: 0 },
    { x: cx + half * 0.5, y: cy - half, id: 1 },
    { x: cx + half * 0.05, y: cy - half * 0.05, id: 2 },
    { x: cx + half * 0.4, y: cy - half * 0.05, id: 3 },
    { x: cx - half * 0.2, y: cy + half, id: 4 },
    { x: cx + half * 0.05, y: cy + half * 0.1, id: 5 },
    { x: cx - half * 0.35, y: cy + half * 0.1, id: 6 },
  ];
}

function generateCirclePoints(cx: number, cy: number, radius: number): Point[] {
  const pts: Point[] = [];
  const steps = 36;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), id: i });
  }
  return pts;
}

function generateHexagon(cx: number, cy: number, radius: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), id: i });
  }
  return pts;
}

/* ──────────────────────────────────────────────
   PATH DATA GENERATION
   ────────────────────────────────────────────── */

function generatePathData(points: Point[], pathType: PathType, closePath: boolean): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  if (pathType === 'line') {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    if (closePath && points.length > 2) d += ' Z';
    return d;
  }

  if (pathType === 'smooth') {
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }
    let d = `M ${points[0].x} ${points[0].y}`;
    // First quadratic bezier to midpoint of first segment
    const mx01 = (points[0].x + points[1].x) / 2;
    const my01 = (points[0].y + points[1].y) / 2;
    d += ` Q ${points[0].x} ${points[0].y} ${mx01} ${my01}`;

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
    }
    // Last segment
    const last = points[points.length - 1];
    d += ` Q ${last.x} ${last.y} ${last.x} ${last.y}`;
    if (closePath && points.length > 2) d += ' Z';
    return d;
  }

  // freehand
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

function getDashArray(dashType: DashType, strokeWidth: number): string {
  switch (dashType) {
    case 'dashed': return `${strokeWidth * 3} ${strokeWidth * 2}`;
    case 'dotted': return `${strokeWidth * 0.5} ${strokeWidth * 2}`;
    default: return 'none';
  }
}

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNTING
   ────────────────────────────────────────────── */

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   DEFAULTS
   ────────────────────────────────────────────── */

const DEFAULT_STYLE: PathStyle = {
  strokeColor: '#10b981',
  strokeWidth: 3,
  fillColor: '#10b981',
  fillOpacity: 0,
  dashType: 'solid',
  lineCap: 'round',
  lineJoin: 'round',
};

const DEFAULT_TRANSFORM: Transform = {
  scale: 1,
  rotation: 0,
  translateX: 0,
  translateY: 0,
};

const CANVAS_W = 600;
const CANVAS_H = 400;
const MAX_HISTORY = 20;

/* ──────────────────────────────────────────────
   SVG EDITOR SECTION
   ────────────────────────────────────────────── */

export function SvgEditorSection() {
  const mounted = useMounted();
  const svgRef = useRef<SVGSVGElement>(null);
  const nextIdRef = useRef(1);

  // State
  const [points, setPoints] = useState<Point[]>([]);
  const [pathType, setPathType] = useState<PathType>('line');
  const [closePath, setClosePath] = useState(false);
  const [style, setStyle] = useState<PathStyle>(DEFAULT_STYLE);
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPathData, setShowPathData] = useState(true);
  const [hoverPointId, setHoverPointId] = useState<number | null>(null);

  // Generate unique ID
  const getNextId = useCallback(() => {
    return nextIdRef.current++;
  }, []);

  // Push to history
  const pushHistory = useCallback((newPoints: Point[], newStyle?: PathStyle, newTransform?: Transform, newPathType?: PathType, newClosePath?: boolean) => {
    setHistory(prev => {
      const state: HistoryState = {
        points: newPoints,
        style: newStyle ?? prev[prev.length - 1]?.style ?? DEFAULT_STYLE,
        transform: newTransform ?? prev[prev.length - 1]?.transform ?? DEFAULT_TRANSFORM,
        pathType: newPathType ?? prev[prev.length - 1]?.pathType ?? 'line',
        closePath: newClosePath ?? prev[prev.length - 1]?.closePath ?? false,
      };
      const sliced = prev.slice(0, historyIndex + 1);
      const newHistory = [...sliced, state];
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const state = history[newIndex];
    if (state) {
      setPoints(state.points);
      setStyle(state.style);
      setTransform(state.transform);
      setPathType(state.pathType);
      setClosePath(state.closePath);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const state = history[newIndex];
    if (state) {
      setPoints(state.points);
      setStyle(state.style);
      setTransform(state.transform);
      setPathType(state.pathType);
      setClosePath(state.closePath);
    }
  }, [history, historyIndex]);

  // SVG coordinates from mouse event
  const getSVGCoords = useCallback((e: React.MouseEvent | React.PointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: Math.round(((e.clientX - rect.left) * scaleX + Number.EPSILON) * 100) / 100,
      y: Math.round(((e.clientY - rect.top) * scaleY + Number.EPSILON) * 100) / 100,
    };
  }, []);

  // Mouse/touch handlers for SVG canvas
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const coords = getSVGCoords(e);
    if (!coords) return;

    // Check if clicking on existing point (drag)
    for (let i = 0; i < points.length; i++) {
      const dx = points[i].x - coords.x;
      const dy = points[i].y - coords.y;
      if (Math.sqrt(dx * dx + dy * dy) < 12) {
        setDragIndex(i);
        return;
      }
    }

    // Freehand mode: start drawing
    if (pathType === 'freehand') {
      setIsDrawing(true);
      const newPoint: Point = { x: coords.x, y: coords.y, id: getNextId() };
      setPoints([newPoint]);
      return;
    }

    // Line / Smooth mode: add point
    const newPoint: Point = { x: coords.x, y: coords.y, id: getNextId() };
    setPoints(prev => {
      const next = [...prev, newPoint];
      pushHistory(next, style, transform, pathType, closePath);
      return next;
    });
  }, [points, pathType, style, transform, closePath, getSVGCoords, getNextId, pushHistory]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragIndex !== null) {
      const coords = getSVGCoords(e);
      if (!coords) return;
      setPoints(prev => {
        const next = [...prev];
        next[dragIndex] = { ...next[dragIndex], x: coords.x, y: coords.y };
        return next;
      });
    }
    if (isDrawing) {
      const coords = getSVGCoords(e);
      if (!coords) return;
      setPoints(prev => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        const dx = last.x - coords.x;
        const dy = last.y - coords.y;
        if (Math.sqrt(dx * dx + dy * dy) < 4) return prev; // debounce
        return [...prev, { x: coords.x, y: coords.y, id: getNextId() }];
      });
    }
  }, [dragIndex, isDrawing, getSVGCoords, getNextId]);

  const handlePointerUp = useCallback(() => {
    if (dragIndex !== null) {
      setDragIndex(null);
      pushHistory(points, style, transform, pathType, closePath);
    }
    if (isDrawing) {
      setIsDrawing(false);
      pushHistory(points, style, transform, pathType, closePath);
    }
  }, [dragIndex, isDrawing, points, style, transform, pathType, closePath, pushHistory]);

  // Delete point
  const deletePoint = useCallback((id: number) => {
    setPoints(prev => {
      const next = prev.filter(p => p.id !== id);
      pushHistory(next, style, transform, pathType, closePath);
      return next;
    });
  }, [style, transform, pathType, closePath, pushHistory]);

  // Clear all
  const clearAll = useCallback(() => {
    setPoints([]);
    nextIdRef.current = 1;
    pushHistory([], DEFAULT_STYLE, DEFAULT_TRANSFORM, 'line', false);
    setStyle(DEFAULT_STYLE);
    setTransform(DEFAULT_TRANSFORM);
    setPathType('line');
    setClosePath(false);
  }, [pushHistory]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  // Download SVG
  const downloadSVG = useCallback(() => {
    const pathD = generatePathData(points, pathType, closePath);
    const dashArray = getDashArray(style.dashType, style.strokeWidth);
    const fill = style.fillOpacity > 0 ? `${style.fillColor}` : 'none';
    const fillOpacity = style.fillOpacity > 0 ? style.fillOpacity : undefined;
    const dashAttr = dashArray !== 'none' ? ` stroke-dasharray="${dashArray}"` : '';
    const fillOpAttr = fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : '';

    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">\n  <path d="${pathD}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" fill="${fill}"${fillOpAttr}${dashAttr} stroke-linecap="${style.lineCap}" stroke-linejoin="${style.lineJoin}" />\n</svg>`;

    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'path.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [points, pathType, closePath, style]);

  // Compute path data
  const pathData = useMemo(() => generatePathData(points, pathType, closePath), [points, pathType, closePath]);

  // Transform string for SVG
  const transformStr = useMemo(() => {
    const parts: string[] = [];
    if (transform.scale !== 1) parts.push(`scale(${transform.scale})`);
    if (transform.rotation !== 0) parts.push(`rotate(${transform.rotation} ${CANVAS_W / 2} ${CANVAS_H / 2})`);
    if (transform.translateX !== 0 || transform.translateY !== 0) parts.push(`translate(${transform.translateX}, ${transform.translateY})`);
    return parts.length > 0 ? parts.join(' ') : '';
  }, [transform]);

  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let x = 0; x <= CANVAS_W; x += 20) {
      lines.push({ x1: x, y1: 0, x2: x, y2: CANVAS_H });
    }
    for (let y = 0; y <= CANVAS_H; y += 20) {
      lines.push({ x1: 0, y1: y, x2: CANVAS_W, y2: y });
    }
    return lines;
  }, []);

  // Shape generators (stable, no deps on refs)
  const shapeGenerators = useMemo(() => [
    { label: 'Star', icon: Star, points: generateStar(300, 200, 140, 60, 5) },
    { label: 'Heart', icon: Heart, points: generateHeart(300, 200, 12) },
    { label: 'Arrow', icon: ArrowRight, points: generateArrow(300, 200, 260) },
    { label: 'Bolt', icon: Zap, points: generateLightning(300, 200, 160) },
    { label: 'Circle', icon: Circle, points: generateCirclePoints(300, 200, 130) },
    { label: 'Hexagon', icon: Hexagon, points: generateHexagon(300, 200, 130) },
  ], []);

  const handleLoadShape = useCallback((shapePoints: Point[]) => {
    setPoints(shapePoints);
    setClosePath(true);
    pushHistory(shapePoints, style, transform, pathType, true);
    const maxId = Math.max(...shapePoints.map(p => p.id), 0);
    nextIdRef.current = maxId + 1;
  }, [style, transform, pathType, pushHistory]);

  // Style update helper
  const updateStyle = useCallback((partial: Partial<PathStyle>) => {
    setStyle(prev => {
      const next = { ...prev, ...partial };
      return next;
    });
  }, []);

  const updateTransform = useCallback((partial: Partial<Transform>) => {
    setTransform(prev => ({ ...prev, ...partial }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full py-12 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #0a0a0a 100%)' }}>
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none bg-grid-subtle" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)' }}
      />

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-text">
              SVG Path Editor
            </span>
          </h2>
          <p className="text-sm text-white/40 font-mono max-w-xl mx-auto">
            Interactive vector path builder — draw, shape, style, and export SVG paths with real-time preview
          </p>
        </motion.div>

        {/* Main layout: Canvas + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* LEFT: Canvas + Path Data */}
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
            >
              {/* Path Type Selector */}
              {([['line', 'Line'], ['smooth', 'Curve'], ['freehand', 'Freehand']] as const).map(([type, label]) => (
                <motion.button
                  key={`path-type-${type}`}
                  onClick={() => setPathType(type as PathType)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    pathType === type ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {pathType === type && (
                    <motion.div
                      layoutId="svg-path-type"
                      className="absolute inset-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </motion.button>
              ))}

              <div className="w-px h-6 bg-white/[0.08] mx-1" />

              {/* Close Path Toggle */}
              <motion.button
                onClick={() => setClosePath(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  closePath ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-white/40 hover:text-white/60 border border-transparent'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus className="w-3 h-3" />
                <span>{closePath ? 'Closed' : 'Open'}</span>
              </motion.button>

              <div className="flex-1" />

              {/* Undo / Redo / Clear */}
              <motion.button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Redo2 className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                onClick={clearAll}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>

            {/* SVG Canvas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="relative rounded-xl border border-white/[0.08] overflow-hidden"
              style={{ background: '#080808' }}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                className="w-full h-auto cursor-crosshair select-none"
                style={{ touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* Grid */}
                {gridLines.map((line, i) => (
                  <line
                    key={`grid-line-${i}`}
                    x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="0.5"
                  />
                ))}

                {/* Major grid lines (every 100px) */}
                {[0, 100, 200, 300, 400, 500, 600].map(x => (
                  <line key={`major-grid-x-${x}`} x1={x} y1={0} x2={x} y2={CANVAS_H} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                ))}
                {[0, 100, 200, 300, 400].map(y => (
                  <line key={`major-grid-y-${y}`} x1={0} y1={y} x2={CANVAS_W} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                ))}

                {/* Path with transform */}
                <g transform={transformStr || undefined}>
                  {/* The path */}
                  {pathData && (
                    <path
                      d={pathData}
                      stroke={style.strokeColor}
                      strokeWidth={style.strokeWidth}
                      fill={style.fillOpacity > 0 ? style.fillColor : 'none'}
                      fillOpacity={style.fillOpacity > 0 ? style.fillOpacity : undefined}
                      strokeDasharray={getDashArray(style.dashType, style.strokeWidth) || undefined}
                      strokeLinecap={style.lineCap}
                      strokeLinejoin={style.lineJoin}
                    />
                  )}

                  {/* Points (nodes) */}
                  {points.map((point, i) => (
                    <g key={`point-${point.id}`}>
                      {/* Hover glow */}
                      {hoverPointId === point.id && (
                        <circle
                          cx={point.x} cy={point.y} r={14}
                          fill="none"
                          stroke="rgba(16, 185, 129, 0.3)"
                          strokeWidth="2"
                        />
                      )}
                      {/* Outer ring */}
                      <circle
                        cx={point.x} cy={point.y} r={7}
                        fill="none"
                        stroke={dragIndex === i ? '#34d399' : 'rgba(16, 185, 129, 0.5)'}
                        strokeWidth="1.5"
                        className="cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setDragIndex(i);
                        }}
                        onPointerEnter={() => setHoverPointId(point.id)}
                        onPointerLeave={() => setHoverPointId(null)}
                      />
                      {/* Inner dot */}
                      <circle
                        cx={point.x} cy={point.y} r={4}
                        fill={dragIndex === i ? '#34d399' : '#10b981'}
                        className="pointer-events-none"
                      />
                      {/* Coordinate label */}
                      <text
                        x={point.x} y={point.y - 14}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.35)"
                        fontSize="9"
                        fontFamily="monospace"
                        className="pointer-events-none select-none"
                      >
                        {Math.round(point.x)},{Math.round(point.y)}
                      </text>
                      {/* Delete button (show on hover) */}
                      {hoverPointId === point.id && (
                        <g
                          className="cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); deletePoint(point.id); }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <circle cx={point.x + 16} cy={point.y - 10} r={6} fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.5)" strokeWidth="1" />
                          <text x={point.x + 16} y={point.y - 7} textAnchor="middle" fill="rgba(239,68,68,0.8)" fontSize="10" fontFamily="monospace">×</text>
                        </g>
                      )}
                    </g>
                  ))}
                </g>

                {/* Axis labels */}
                <text x="4" y="12" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace">0,0</text>
                <text x={CANVAS_W - 40} y="12" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace">600,0</text>
                <text x="4" y={CANVAS_H - 4} fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace">0,400</text>
              </svg>

              {/* Canvas info overlay */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/[0.06]">
                <span className="text-[10px] font-mono text-white/30">{CANVAS_W}×{CANVAS_H}</span>
                <span className="text-[10px] font-mono text-white/20">|</span>
                <span className="text-[10px] font-mono text-white/30">{points.length} pts</span>
              </div>
            </motion.div>

            {/* Path Data Output */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden"
            >
              {/* Toggle bar */}
              <button
                onClick={() => setShowPathData(prev => !prev)}
                className="flex items-center gap-2 w-full px-4 py-2.5 border-b border-white/[0.06] text-xs font-mono text-white/50 hover:text-white/70 transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Path Data</span>
                {pathData && (
                  <span className="text-white/20 ml-auto">{pathData.length} chars</span>
                )}
                <motion.div
                  animate={{ rotate: showPathData ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon />
                </motion.div>
              </button>

              <AnimatePresence>
                {showPathData && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3">
                      <pre className="text-xs font-mono text-emerald-400/80 break-all max-h-32 overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
                        {pathData || '<!-- Click on the canvas to add points -->'}
                      </pre>
                      <div className="flex items-center gap-2 mt-3">
                        <motion.button
                          onClick={() => copyToClipboard(pathData, 'path')}
                          disabled={!pathData}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white/70 hover:border-white/15 disabled:opacity-30 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {copiedField === 'path' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedField === 'path' ? 'Copied!' : 'Copy Path'}
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            const dashArray = getDashArray(style.dashType, style.strokeWidth);
                            const fill = style.fillOpacity > 0 ? `${style.fillColor}` : 'none';
                            const fillOpAttr = style.fillOpacity > 0 ? ` fill-opacity="${style.fillOpacity}"` : '';
                            const dashAttr = dashArray !== 'none' ? ` stroke-dasharray="${dashArray}"` : '';
                            const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">\n  <path d="${pathData}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" fill="${fill}"${fillOpAttr}${dashAttr} stroke-linecap="${style.lineCap}" stroke-linejoin="${style.lineJoin}" />\n</svg>`;
                            copyToClipboard(fullSvg, 'svg');
                          }}
                          disabled={!pathData}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white/70 hover:border-white/15 disabled:opacity-30 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {copiedField === 'svg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedField === 'svg' ? 'Copied!' : 'Copy SVG'}
                        </motion.button>
                        <div className="flex-1" />
                        <motion.button
                          onClick={downloadSVG}
                          disabled={!pathData}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-emerald-500/20 bg-emerald-500/10 text-emerald-400/70 hover:text-emerald-400 hover:border-emerald-500/40 disabled:opacity-30 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* RIGHT: Controls Panel */}
          <div className="flex flex-col gap-4">
            {/* Style Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Pen className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-white/60">Style Controls</span>
              </div>

              <div className="space-y-3">
                {/* Stroke Color */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-white/40">Stroke Color</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/25">{style.strokeColor}</span>
                    <input
                      type="color"
                      value={style.strokeColor}
                      onChange={(e) => updateStyle({ strokeColor: e.target.value })}
                      className="w-7 h-7 rounded-md border border-white/10 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Stroke Width */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-white/40">Stroke Width</label>
                    <span className="text-[10px] font-mono text-white/25">{style.strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="20" step="0.5"
                    value={style.strokeWidth}
                    onChange={(e) => updateStyle({ strokeWidth: parseFloat(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${((style.strokeWidth - 1) / 19) * 100}%, rgba(255,255,255,0.1) ${((style.strokeWidth - 1) / 19) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>

                {/* Fill Color */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-white/40">Fill Color</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/25">{style.fillOpacity > 0 ? `${Math.round(style.fillOpacity * 100)}%` : 'none'}</span>
                    <input
                      type="color"
                      value={style.fillColor}
                      onChange={(e) => updateStyle({ fillColor: e.target.value })}
                      className="w-7 h-7 rounded-md border border-white/10 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Fill Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-white/40">Fill Opacity</label>
                    <span className="text-[10px] font-mono text-white/25">{Math.round(style.fillOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="1" step="0.05"
                    value={style.fillOpacity}
                    onChange={(e) => updateStyle({ fillOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(16,185,129,0.1) 0%, #10b981 ${style.fillOpacity * 100}%, rgba(255,255,255,0.1) ${style.fillOpacity * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>

                <div className="h-px bg-white/[0.06] my-1" />

                {/* Dash Type */}
                <div>
                  <label className="text-[11px] font-mono text-white/40 block mb-1.5">Stroke Pattern</label>
                  <div className="flex gap-1.5">
                    {(['solid', 'dashed', 'dotted'] as const).map(dash => (
                      <motion.button
                        key={`dash-${dash}`}
                        onClick={() => updateStyle({ dashType: dash })}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                          style.dashType === dash
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg width="40" height="8" viewBox="0 0 40 8">
                          <line
                            x1="0" y1="4" x2="40" y2="4"
                            stroke={style.dashType === dash ? '#34d399' : 'rgba(255,255,255,0.3)'}
                            strokeWidth="2"
                            strokeDasharray={dash === 'dashed' ? '6 4' : dash === 'dotted' ? '2 4' : 'none'}
                            strokeLinecap={dash === 'dotted' ? 'round' : 'butt'}
                          />
                        </svg>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Line Cap */}
                <div>
                  <label className="text-[11px] font-mono text-white/40 block mb-1.5">Line Cap</label>
                  <div className="flex gap-1.5">
                    {(['butt', 'round', 'square'] as const).map(cap => (
                      <motion.button
                        key={`cap-${cap}`}
                        onClick={() => updateStyle({ lineCap: cap })}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono capitalize border transition-colors cursor-pointer ${
                          style.lineCap === cap
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {cap}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Line Join */}
                <div>
                  <label className="text-[11px] font-mono text-white/40 block mb-1.5">Line Join</label>
                  <div className="flex gap-1.5">
                    {(['miter', 'round', 'bevel'] as const).map(join => (
                      <motion.button
                        key={`join-${join}`}
                        onClick={() => updateStyle({ lineJoin: join })}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono capitalize border transition-colors cursor-pointer ${
                          style.lineJoin === join
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {join}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transform Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono text-white/60">Transform</span>
                </div>
                <motion.button
                  onClick={() => updateTransform(DEFAULT_TRANSFORM)}
                  className="text-[10px] font-mono text-white/25 hover:text-white/50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset
                </motion.button>
              </div>

              <div className="space-y-3">
                {/* Scale */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-white/40">Scale</label>
                    <span className="text-[10px] font-mono text-white/25">{transform.scale.toFixed(2)}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.5" max="2" step="0.05"
                    value={transform.scale}
                    onChange={(e) => updateTransform({ scale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((transform.scale - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.1) ${((transform.scale - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-white/40">Rotation</label>
                    <span className="text-[10px] font-mono text-white/25">{transform.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="360" step="1"
                    value={transform.rotation}
                    onChange={(e) => updateTransform({ rotation: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(transform.rotation / 360) * 100}%, rgba(255,255,255,0.1) ${(transform.rotation / 360) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>

                {/* Translate X */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-white/40">Translate X</label>
                    <span className="text-[10px] font-mono text-white/25">{transform.translateX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200" max="200" step="1"
                    value={transform.translateX}
                    onChange={(e) => updateTransform({ translateX: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((transform.translateX + 200) / 400) * 100}%, rgba(255,255,255,0.1) ${((transform.translateX + 200) / 400) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>

                {/* Translate Y */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-white/40">Translate Y</label>
                    <span className="text-[10px] font-mono text-white/25">{transform.translateY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200" max="200" step="1"
                    value={transform.translateY}
                    onChange={(e) => updateTransform({ translateY: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((transform.translateY + 200) / 400) * 100}%, rgba(255,255,255,0.1) ${((transform.translateY + 200) / 400) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Preview Shapes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono text-white/60">Preview Shapes</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {shapeGenerators.map((shape, i) => (
                  <motion.button
                    key={`shape-${i}`}
                    onClick={() => handleLoadShape(shape.points)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05] transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <shape.icon className="w-5 h-5 text-white/40" />
                    <span className="text-[10px] font-mono text-white/30">{shape.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Mini info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-center justify-center gap-3 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              {[
                { icon: Move, text: 'Drag nodes' },
                { icon: Pen, text: 'Click to draw' },
                { icon: Code2, text: 'Export SVG' },
              ].map((info, i) => (
                <div key={`info-${i}`} className="flex items-center gap-1">
                  <info.icon className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] font-mono text-white/20">{info.text}</span>
                  {i < 2 && <span className="text-white/10 mx-2">/</span>}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   TINY HELPERS
   ────────────────────────────────────────────── */

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  );
}
