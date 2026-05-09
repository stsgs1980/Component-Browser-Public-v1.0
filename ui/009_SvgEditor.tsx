/**
 * SvgEditor — Interactive SVG vector path builder with drawing tools, shape presets,
 * style controls, transform sliders, and SVG export.
 *
 * De-hardcoded extraction from Code-Realm.
 * Zero external icon or animation library dependencies.
 *
 * @module SvgEditor
 */

import { useState, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { useIsMounted, copyToClipboard, downloadFile } from './shared';
import { IconCopy, IconCheck, IconEye, IconDownload } from './shared';

// ─── Inline SVG Icons ─────────────────────────────────────────────

function IconPen({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconUndo({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function IconRedo({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  );
}

function IconTrash({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconRotateCw({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function IconPlus({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

function IconCode({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconMove({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" /><polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" /><line x1="2" x2="22" y1="12" y2="12" /><line x1="12" x2="12" y1="2" y2="22" />
    </svg>
  );
}

function IconStar({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconHeart({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function IconArrowRight({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconZap({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconCircle({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function IconHexagon({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function IconChevronDown({ size = 12, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────

export interface Point { x: number; y: number; id: number; }

export type PathType = 'line' | 'smooth' | 'freehand';
export type DashType = 'solid' | 'dashed' | 'dotted';
export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'miter' | 'round' | 'bevel';

export interface PathStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  fillOpacity: number;
  dashType: DashType;
  lineCap: LineCap;
  lineJoin: LineJoin;
}

export interface Transform { scale: number; rotation: number; translateX: number; translateY: number; }

interface HistoryState { points: Point[]; style: PathStyle; transform: Transform; pathType: PathType; closePath: boolean; }

export interface ShapePreset {
  label: string;
  points: Point[];
  icon: React.FC<{ size?: number } & React.SVGProps<SVGSVGElement>>;
}

// ─── Defaults ─────────────────────────────────────────────────────

export const DEFAULT_STYLE: PathStyle = {
  strokeColor: '#d4a017', strokeWidth: 3, fillColor: '#d4a017',
  fillOpacity: 0, dashType: 'solid', lineCap: 'round', lineJoin: 'round',
};

export const DEFAULT_TRANSFORM: Transform = { scale: 1, rotation: 0, translateX: 0, translateY: 0 };

export const DEFAULT_CANVAS_W = 600;
export const DEFAULT_CANVAS_H = 400;
export const DEFAULT_MAX_HISTORY = 20;

// ─── Shape Generators ─────────────────────────────────────────────

function genStar(cx: number, cy: number, oR: number, iR: number, n: number): Point[] {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const r = i % 2 === 0 ? oR : iR;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), id: i };
  });
}

function genHeart(cx: number, cy: number, size: number): Point[] {
  return Array.from({ length: 30 }, (_, i) => {
    const t = (i / 30) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: cx + x * (size / 16), y: cy + y * (size / 16), id: i };
  });
}

function genArrow(cx: number, cy: number, size: number): Point[] {
  const h = size / 2;
  return [
    { x: cx - h, y: cy - h * 0.3, id: 0 }, { x: cx + h * 0.2, y: cy - h * 0.3, id: 1 },
    { x: cx + h * 0.2, y: cy - h * 0.7, id: 2 }, { x: cx + h, y: cy, id: 3 },
    { x: cx + h * 0.2, y: cy + h * 0.7, id: 4 }, { x: cx + h * 0.2, y: cy + h * 0.3, id: 5 },
    { x: cx - h, y: cy + h * 0.3, id: 6 },
  ];
}

function genBolt(cx: number, cy: number, size: number): Point[] {
  const h = size / 2;
  return [
    { x: cx - h * 0.1, y: cy - h, id: 0 }, { x: cx + h * 0.5, y: cy - h, id: 1 },
    { x: cx + h * 0.05, y: cy - h * 0.05, id: 2 }, { x: cx + h * 0.4, y: cy - h * 0.05, id: 3 },
    { x: cx - h * 0.2, y: cy + h, id: 4 }, { x: cx + h * 0.05, y: cy + h * 0.1, id: 5 },
    { x: cx - h * 0.35, y: cy + h * 0.1, id: 6 },
  ];
}

function genCircle(cx: number, cy: number, r: number): Point[] {
  return Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), id: i };
  });
}

function genHexagon(cx: number, cy: number, r: number): Point[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), id: i };
  });
}

function defaultShapes(cw: number, ch: number): ShapePreset[] {
  const cx = cw / 2, cy = ch / 2;
  return [
    { label: 'Star', icon: IconStar, points: genStar(cx, cy, 140, 60, 5) },
    { label: 'Heart', icon: IconHeart, points: genHeart(cx, cy, 12) },
    { label: 'Arrow', icon: IconArrowRight, points: genArrow(cx, cy, 260) },
    { label: 'Bolt', icon: IconZap, points: genBolt(cx, cy, 160) },
    { label: 'Circle', icon: IconCircle, points: genCircle(cx, cy, 130) },
    { label: 'Hexagon', icon: IconHexagon, points: genHexagon(cx, cy, 130) },
  ];
}

// ─── Path helpers ─────────────────────────────────────────────────

function generatePathData(points: Point[], pathType: PathType, closePath: boolean): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (pathType === 'line') {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
    if (closePath && points.length > 2) d += ' Z';
    return d;
  }
  if (pathType === 'smooth') {
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    const mx = (points[0].x + points[1].x) / 2, my = (points[0].y + points[1].y) / 2;
    d += ` Q ${points[0].x} ${points[0].y} ${mx} ${my}`;
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2, midY = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
    }
    const last = points[points.length - 1];
    d += ` Q ${last.x} ${last.y} ${last.x} ${last.y}`;
    if (closePath && points.length > 2) d += ' Z';
    return d;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
  return d;
}

function getDashArray(dashType: DashType, sw: number): string {
  switch (dashType) {
    case 'dashed': return `${sw * 3} ${sw * 2}`;
    case 'dotted': return `${sw * 0.5} ${sw * 2}`;
    default: return 'none';
  }
}

// ─── Props ────────────────────────────────────────────────────────

export interface SvgEditorProps {
  /** Canvas width in SVG units (default 600) */
  canvasWidth?: number;
  /** Canvas height in SVG units (default 400) */
  canvasHeight?: number;
  /** Maximum undo history depth (default 20) */
  maxHistory?: number;
  /** Default path style */
  defaultStyle?: Partial<PathStyle>;
  /** Custom shape presets (overrides defaults) */
  shapes?: ShapePreset[];
  /** Additional CSS class */
  className?: string;
  /** Callback when path data changes */
  onPathChange?: (pathData: string) => void;
  /** Accent color (default #d4a017) */
  accent?: string;
  /** Surface / panel background (default #ebe5d0) */
  surface?: string;
  /** Text muted color (default #6b6356) */
  textMuted?: string;
}

// ─── Component ────────────────────────────────────────────────────

/**
 * SvgEditor — an interactive SVG path drawing editor.
 *
 * Features:
 * - Click to place points; drag to move them
 * - Line, Curve (smooth), and Freehand path modes
 * - Pre-built shape presets (star, heart, arrow, bolt, circle, hexagon)
 * - Stroke/fill style controls with dash pattern, cap, and join
 * - Scale, rotation, and translate sliders
 * - Undo / redo history (up to 20 steps)
 * - Copy path data or full SVG to clipboard; download as .svg
 *
 * @example
 * ```tsx
 * import { SvgEditor } from './009_SvgEditor';
 * <SvgEditor accent="#22c55e" canvasWidth={800} canvasHeight={500} />
 * ```
 */
export function SvgEditor({
  canvasWidth = DEFAULT_CANVAS_W,
  canvasHeight = DEFAULT_CANVAS_H,
  maxHistory = DEFAULT_MAX_HISTORY,
  defaultStyle: styleOverride,
  shapes: shapesProp,
  className,
  onPathChange,
  accent = '#d4a017',
  surface = '#ebe5d0',
  textMuted = '#6b6356',
}: SvgEditorProps) {
  const mounted = useIsMounted();
  const svgRef = useRef<SVGSVGElement>(null);
  const nextIdRef = useRef(1);

  const mergedStyle: PathStyle = { ...DEFAULT_STYLE, ...styleOverride };

  const [points, setPoints] = useState<Point[]>([]);
  const [pathType, setPathType] = useState<PathType>('line');
  const [closePath, setClosePath] = useState(false);
  const [style, setStyle] = useState<PathStyle>(mergedStyle);
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPathData, setShowPathData] = useState(true);
  const [hoverPointId, setHoverPointId] = useState<number | null>(null);

  const getNextId = useCallback(() => nextIdRef.current++, []);

  const pushHistory = useCallback((pts: Point[], s?: PathStyle, t?: Transform, pt?: PathType, cp?: boolean) => {
    setHistory(prev => {
      const state: HistoryState = { points: pts, style: s ?? prev[prev.length - 1]?.style ?? mergedStyle, transform: t ?? prev[prev.length - 1]?.transform ?? DEFAULT_TRANSFORM, pathType: pt ?? prev[prev.length - 1]?.pathType ?? 'line', closePath: cp ?? prev[prev.length - 1]?.closePath ?? false };
      const sliced = prev.slice(0, historyIndex + 1);
      const next = [...sliced, state];
      if (next.length > maxHistory) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [historyIndex, maxHistory, mergedStyle]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const ni = historyIndex - 1;
    setHistoryIndex(ni);
    const s = history[ni];
    if (s) { setPoints(s.points); setStyle(s.style); setTransform(s.transform); setPathType(s.pathType); setClosePath(s.closePath); }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const ni = historyIndex + 1;
    setHistoryIndex(ni);
    const s = history[ni];
    if (s) { setPoints(s.points); setStyle(s.style); setTransform(s.transform); setPathType(s.pathType); setClosePath(s.closePath); }
  }, [history, historyIndex]);

  const getSVGCoords = useCallback((e: React.PointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = canvasWidth / rect.width, sy = canvasHeight / rect.height;
    return { x: Math.round(((e.clientX - rect.left) * sx + Number.EPSILON) * 100) / 100, y: Math.round(((e.clientY - rect.top) * sy + Number.EPSILON) * 100) / 100 };
  }, [canvasWidth, canvasHeight]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const coords = getSVGCoords(e);
    if (!coords) return;
    for (let i = 0; i < points.length; i++) {
      const dx = points[i].x - coords.x, dy = points[i].y - coords.y;
      if (Math.sqrt(dx * dx + dy * dy) < 12) { setDragIndex(i); return; }
    }
    if (pathType === 'freehand') { setIsDrawing(true); setPoints([{ x: coords.x, y: coords.y, id: getNextId() }]); return; }
    const np: Point = { x: coords.x, y: coords.y, id: getNextId() };
    setPoints(prev => { const next = [...prev, np]; pushHistory(next, style, transform, pathType, closePath); return next; });
  }, [points, pathType, style, transform, closePath, getSVGCoords, getNextId, pushHistory]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragIndex !== null) {
      const coords = getSVGCoords(e); if (!coords) return;
      setPoints(prev => { const n = [...prev]; n[dragIndex] = { ...n[dragIndex], x: coords.x, y: coords.y }; return n; });
    }
    if (isDrawing) {
      const coords = getSVGCoords(e); if (!coords) return;
      setPoints(prev => {
        const last = prev[prev.length - 1]; if (!last) return prev;
        const dx = last.x - coords.x, dy = last.y - coords.y;
        if (Math.sqrt(dx * dx + dy * dy) < 4) return prev;
        return [...prev, { x: coords.x, y: coords.y, id: getNextId() }];
      });
    }
  }, [dragIndex, isDrawing, getSVGCoords, getNextId]);

  const handlePointerUp = useCallback(() => {
    if (dragIndex !== null) { setDragIndex(null); pushHistory(points, style, transform, pathType, closePath); }
    if (isDrawing) { setIsDrawing(false); pushHistory(points, style, transform, pathType, closePath); }
  }, [dragIndex, isDrawing, points, style, transform, pathType, closePath, pushHistory]);

  const deletePoint = useCallback((id: number) => {
    setPoints(prev => { const next = prev.filter(p => p.id !== id); pushHistory(next, style, transform, pathType, closePath); return next; });
  }, [style, transform, pathType, closePath, pushHistory]);

  const clearAll = useCallback(() => {
    setPoints([]); nextIdRef.current = 1;
    pushHistory([], mergedStyle, DEFAULT_TRANSFORM, 'line', false);
    setStyle(mergedStyle); setTransform(DEFAULT_TRANSFORM); setPathType('line'); setClosePath(false);
  }, [pushHistory, mergedStyle]);

  const handleCopy = useCallback(async (text: string, field: string) => {
    await copyToClipboard(text);
    setCopiedField(field); setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleDownload = useCallback(() => {
    const pd = generatePathData(points, pathType, closePath);
    const da = getDashArray(style.dashType, style.strokeWidth);
    const fill = style.fillOpacity > 0 ? style.fillColor : 'none';
    const fo = style.fillOpacity > 0 ? style.fillOpacity : undefined;
    const dashAttr = da !== 'none' ? ` stroke-dasharray="${da}"` : '';
    const fillOpAttr = fo !== undefined ? ` fill-opacity="${fo}"` : '';
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">\n <path d="${pd}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" fill="${fill}"${fillOpAttr}${dashAttr} stroke-linecap="${style.lineCap}" stroke-linejoin="${style.lineJoin}" />\n</svg>`;
    downloadFile(svgStr, 'path.svg', 'image/svg+xml');
  }, [points, pathType, closePath, style, canvasWidth, canvasHeight]);

  const pathData = useMemo(() => generatePathData(points, pathType, closePath), [points, pathType, closePath]);

  useEffect(() => { onPathChange?.(pathData); }, [pathData, onPathChange]);

  const transformStr = useMemo(() => {
    const p: string[] = [];
    if (transform.scale !== 1) p.push(`scale(${transform.scale})`);
    if (transform.rotation !== 0) p.push(`rotate(${transform.rotation} ${canvasWidth / 2} ${canvasHeight / 2})`);
    if (transform.translateX !== 0 || transform.translateY !== 0) p.push(`translate(${transform.translateX}, ${transform.translateY})`);
    return p.join(' ');
  }, [transform, canvasWidth, canvasHeight]);

  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let x = 0; x <= canvasWidth; x += 20) lines.push({ x1: x, y1: 0, x2: x, y2: canvasHeight });
    for (let y = 0; y <= canvasHeight; y += 20) lines.push({ x1: 0, y1: y, x2: canvasWidth, y2: y });
    return lines;
  }, [canvasWidth, canvasHeight]);

  const shapePresets = useMemo(() => shapesProp ?? defaultShapes(canvasWidth, canvasHeight), [shapesProp, canvasWidth, canvasHeight]);

  const handleLoadShape = useCallback((sp: Point[]) => {
    setPoints(sp); setClosePath(true);
    pushHistory(sp, style, transform, pathType, true);
    nextIdRef.current = Math.max(...sp.map(p => p.id), 0) + 1;
  }, [style, transform, pathType, pushHistory]);

  const updateStyle = useCallback((partial: Partial<PathStyle>) => setStyle(prev => ({ ...prev, ...partial })), []);
  const updateTransform = useCallback((partial: Partial<Transform>) => setTransform(prev => ({ ...prev, ...partial })), []);

  if (!mounted) return null;

  const ctrlBtnCls = `flex-1 flex items-center justify-center py-1.5 text-[10px] font-mono capitalize border transition-colors duration-200 cursor-pointer ${surface}`;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT: Canvas + Path Data */}
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-3 border border-[#1a1a1a]/15" style={{ backgroundColor: surface }}>
            {([['line', 'Line'], ['smooth', 'Curve'], ['freehand', 'Freehand']] as const).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setPathType(type as PathType)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-colors duration-200 cursor-pointer ${pathType === type ? 'text-white' : `text-[${textMuted}]/50 hover:text-[${textMuted}]/60`}`}
                style={pathType === type ? { backgroundColor: `${accent}20`, border: `1px solid ${accent}40` } : { border: '1px solid transparent' }}
              >
                <span className="relative z-10">{label}</span>
              </button>
            ))}

            <div className="w-px h-6 bg-[#1a1a1a]/10 mx-1" />

            <button onClick={() => setClosePath(v => !v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-colors duration-200 cursor-pointer ${closePath ? `text-[${accent}]` : `text-[${textMuted}]/50 hover:text-[${textMuted}]/60`}`} style={closePath ? { backgroundColor: `${accent}10`, border: `1px solid ${accent}30` } : { border: '1px solid transparent' }}>
              <IconPlus size={12} /><span>{closePath ? 'Closed' : 'Open'}</span>
            </button>

            <div className="flex-1" />

            <button onClick={undo} disabled={historyIndex <= 0} className="flex items-center justify-center w-8 h-8 border border-[#1a1a1a]/15 hover:border-[#1a1a1a]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer" style={{ backgroundColor: surface, color: `${textMuted}80` }} title="Undo"><IconUndo size={14} /></button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="flex items-center justify-center w-8 h-8 border border-[#1a1a1a]/15 hover:border-[#1a1a1a]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer" style={{ backgroundColor: surface, color: `${textMuted}80` }} title="Redo"><IconRedo size={14} /></button>
            <button onClick={clearAll} className="flex items-center justify-center w-8 h-8 border border-[#1a1a1a]/15 hover:border-red-500/30 hover:text-red-400 transition-colors duration-200 cursor-pointer" style={{ backgroundColor: surface, color: `${textMuted}80` }} title="Clear"><IconTrash size={14} /></button>
          </div>

          {/* SVG Canvas */}
          <div className="relative border border-[#1a1a1a]/15 overflow-hidden" style={{ background: '#080808' }}>
            <svg ref={svgRef} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-auto cursor-crosshair select-none" style={{ touchAction: 'none' }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
              {gridLines.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />)}
              {[0, 100, 200, 300, 400, 500, 600].filter(x => x <= canvasWidth).map(x => <line key={`mx-${x}`} x1={x} y1={0} x2={x} y2={canvasHeight} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />)}
              {[0, 100, 200, 300, 400].filter(y => y <= canvasHeight).map(y => <line key={`my-${y}`} x1={0} y1={y} x2={canvasWidth} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />)}

              <g transform={transformStr || undefined}>
                {pathData && <path d={pathData} stroke={style.strokeColor} strokeWidth={style.strokeWidth} fill={style.fillOpacity > 0 ? style.fillColor : 'none'} fillOpacity={style.fillOpacity > 0 ? style.fillOpacity : undefined} strokeDasharray={getDashArray(style.dashType, style.strokeWidth) || undefined} strokeLinecap={style.lineCap} strokeLinejoin={style.lineJoin} />}
                {points.map((pt, i) => (
                  <g key={pt.id}>
                    {hoverPointId === pt.id && <circle cx={pt.x} cy={pt.y} r={14} fill="none" stroke={`${accent}4D`} strokeWidth="2" />}
                    <circle cx={pt.x} cy={pt.y} r={7} fill="none" stroke={dragIndex === i ? accent : `${accent}80`} strokeWidth="1.5" className="cursor-grab active:cursor-grabbing" onPointerDown={e => { e.stopPropagation(); setDragIndex(i); }} onPointerEnter={() => setHoverPointId(pt.id)} onPointerLeave={() => setHoverPointId(null)} />
                    <circle cx={pt.x} cy={pt.y} r={4} fill={accent} className="pointer-events-none" />
                    <text x={pt.x} y={pt.y - 14} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="monospace" className="pointer-events-none select-none">{Math.round(pt.x)},{Math.round(pt.y)}</text>
                    {hoverPointId === pt.id && (
                      <g className="cursor-pointer" onClick={e => { e.stopPropagation(); deletePoint(pt.id); }} onPointerDown={e => e.stopPropagation()}>
                        <circle cx={pt.x + 16} cy={pt.y - 10} r={6} fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.5)" strokeWidth="1" />
                        <text x={pt.x + 16} y={pt.y - 7} textAnchor="middle" fill="rgba(239,68,68,0.8)" fontSize="10" fontFamily="monospace">×</text>
                      </g>
                    )}
                  </g>
                ))}
              </g>
              <text x="4" y="12" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace">0,0</text>
              <text x={canvasWidth - 40} y="12" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace">{canvasWidth},0</text>
              <text x="4" y={canvasHeight - 4} fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace">0,{canvasHeight}</text>
            </svg>
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1" style={{ backgroundColor: surface, border: '1px solid rgba(26,26,26,0.12)' }}>
              <span className="text-[10px] font-mono" style={{ color: `${textMuted}60` }}>{canvasWidth}×{canvasHeight}</span>
              <span className="text-[10px] font-mono" style={{ color: `${textMuted}40` }}>|</span>
              <span className="text-[10px] font-mono" style={{ color: `${textMuted}60` }}>{points.length} pts</span>
            </div>
          </div>

          {/* Path Data */}
          <div className="rounded-xl border border-[#1a1a1a]/15 overflow-hidden" style={{ backgroundColor: surface }}>
            <button onClick={() => setShowPathData(v => !v)} className="flex items-center gap-2 w-full px-4 py-2.5 border-b border-[#1a1a1a]/12 text-xs font-mono transition-colors duration-200 cursor-pointer" style={{ color: `${textMuted}80` }}>
              <IconCode size={14} /><span>Path Data</span>
              {pathData && <span style={{ color: `${textMuted}50` }} className="ml-auto">{pathData.length} chars</span>}
              <span className="ml-1 transition-transform duration-200" style={{ transform: showPathData ? 'rotate(180deg)' : 'rotate(0)' }}><IconChevronDown /></span>
            </button>
            {showPathData && (
              <div className="p-3">
                <pre className="text-xs font-mono break-all max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap" style={{ color: `${accent}CC` }}>{pathData || '<!-- Click on the canvas to add points -->'}</pre>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => handleCopy(pathData, 'path')} disabled={!pathData} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-[#1a1a1a]/15 disabled:opacity-30 transition-colors duration-200 cursor-pointer" style={{ backgroundColor: surface, color: `${textMuted}80` }}>
                    {copiedField === 'path' ? <IconCheck size={12} style={{ color: accent }} /> : <IconCopy size={12} />}{copiedField === 'path' ? 'Copied!' : 'Copy Path'}
                  </button>
                  <button onClick={() => {
                    const da = getDashArray(style.dashType, style.strokeWidth);
                    const fill = style.fillOpacity > 0 ? style.fillColor : 'none';
                    const fo = style.fillOpacity > 0 ? ` fill-opacity="${style.fillOpacity}"` : '';
                    const dashA = da !== 'none' ? ` stroke-dasharray="${da}"` : '';
                    handleCopy(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}">\n <path d="${pathData}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" fill="${fill}"${fo}${dashA} stroke-linecap="${style.lineCap}" stroke-linejoin="${style.lineJoin}" />\n</svg>`, 'svg');
                  }} disabled={!pathData} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-[#1a1a1a]/15 disabled:opacity-30 transition-colors duration-200 cursor-pointer" style={{ backgroundColor: surface, color: `${textMuted}80` }}>
                    {copiedField === 'svg' ? <IconCheck size={12} style={{ color: accent }} /> : <IconCopy size={12} />}{copiedField === 'svg' ? 'Copied!' : 'Copy SVG'}
                  </button>
                  <div className="flex-1" />
                  <button onClick={handleDownload} disabled={!pathData} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border disabled:opacity-30 transition-colors duration-200 cursor-pointer" style={{ backgroundColor: `${accent}10`, borderColor: `${accent}30`, color: `${accent}B0` }}>
                    <IconDownload size={12} />Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex flex-col gap-4">
          {/* Style Controls */}
          <div className="rounded-xl border border-[#1a1a1a]/15 p-4" style={{ backgroundColor: surface }}>
            <div className="flex items-center gap-2 mb-4"><IconPen size={16} style={{ color: accent }} /><span className="text-xs font-mono" style={{ color: `${textMuted}90` }}>Style Controls</span></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><label className="text-[11px] font-mono" style={{ color: `${textMuted}80` }}>Stroke Color</label><div className="flex items-center gap-2"><span className="text-[10px] font-mono" style={{ color: `${textMuted}55` }}>{style.strokeColor}</span><input type="color" value={style.strokeColor} onChange={e => updateStyle({ strokeColor: e.target.value })} className="w-7 h-7 border border-[#1a1a1a]/10 bg-transparent cursor-pointer" /></div></div>
              <div><div className="flex items-center justify-between mb-1"><label className="text-[11px] font-mono" style={{ color: `${textMuted}80` }}>Stroke Width</label><span className="text-[10px] font-mono" style={{ color: `${textMuted}55` }}>{style.strokeWidth}px</span></div><input type="range" min="1" max="20" step="0.5" value={style.strokeWidth} onChange={e => updateStyle({ strokeWidth: parseFloat(e.target.value) })} className="w-full h-1.5 appearance-none cursor-pointer" /></div>
              <div className="flex items-center justify-between"><label className="text-[11px] font-mono" style={{ color: `${textMuted}80` }}>Fill Color</label><div className="flex items-center gap-2"><span className="text-[10px] font-mono" style={{ color: `${textMuted}55` }}>{style.fillOpacity > 0 ? `${Math.round(style.fillOpacity * 100)}%` : 'none'}</span><input type="color" value={style.fillColor} onChange={e => updateStyle({ fillColor: e.target.value })} className="w-7 h-7 border border-[#1a1a1a]/10 bg-transparent cursor-pointer" /></div></div>
              <div><div className="flex items-center justify-between mb-1"><label className="text-[11px] font-mono" style={{ color: `${textMuted}80` }}>Fill Opacity</label><span className="text-[10px] font-mono" style={{ color: `${textMuted}55` }}>{Math.round(style.fillOpacity * 100)}%</span></div><input type="range" min="0" max="1" step="0.05" value={style.fillOpacity} onChange={e => updateStyle({ fillOpacity: parseFloat(e.target.value) })} className="w-full h-1.5 appearance-none cursor-pointer" /></div>
              <div className="h-px my-1" style={{ backgroundColor: surface }} />
              <div><label className="text-[11px] font-mono block mb-1.5" style={{ color: `${textMuted}80` }}>Stroke Pattern</label><div className="flex gap-1.5">{(['solid', 'dashed', 'dotted'] as const).map(d => (<button key={d} onClick={() => updateStyle({ dashType: d })} className={ctrlBtnCls} style={{ borderColor: style.dashType === d ? `${accent}40` : 'rgba(26,26,26,0.12)', backgroundColor: style.dashType === d ? `${accent}15` : surface, color: style.dashType === d ? accent : `${textMuted}80` }}><svg width="40" height="8" viewBox="0 0 40 8"><line x1="0" y1="4" x2="40" y2="4" stroke={style.dashType === d ? accent : 'rgba(255,255,255,0.3)'} strokeWidth="2" strokeDasharray={d === 'dashed' ? '6 4' : d === 'dotted' ? '2 4' : 'none'} strokeLinecap={d === 'dotted' ? 'round' : 'butt'} /></svg></button>))}</div></div>
              <div><label className="text-[11px] font-mono block mb-1.5" style={{ color: `${textMuted}80` }}>Line Cap</label><div className="flex gap-1.5">{(['butt', 'round', 'square'] as const).map(cap => (<button key={cap} onClick={() => updateStyle({ lineCap: cap })} className={ctrlBtnCls} style={{ borderColor: style.lineCap === cap ? `${accent}40` : 'rgba(26,26,26,0.12)', backgroundColor: style.lineCap === cap ? `${accent}15` : surface, color: style.lineCap === cap ? accent : `${textMuted}80` }}>{cap}</button>))}</div></div>
              <div><label className="text-[11px] font-mono block mb-1.5" style={{ color: `${textMuted}80` }}>Line Join</label><div className="flex gap-1.5">{(['miter', 'round', 'bevel'] as const).map(j => (<button key={j} onClick={() => updateStyle({ lineJoin: j })} className={ctrlBtnCls} style={{ borderColor: style.lineJoin === j ? `${accent}40` : 'rgba(26,26,26,0.12)', backgroundColor: style.lineJoin === j ? `${accent}15` : surface, color: style.lineJoin === j ? accent : `${textMuted}80` }}>{j}</button>))}</div></div>
            </div>
          </div>

          {/* Transform Controls */}
          <div className="rounded-xl border border-[#1a1a1a]/15 p-4" style={{ backgroundColor: surface }}>
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><IconRotateCw size={16} style={{ color: accent }} /><span className="text-xs font-mono" style={{ color: `${textMuted}90` }}>Transform</span></div><button onClick={() => updateTransform(DEFAULT_TRANSFORM)} className="text-[10px] font-mono hover:text-[#1a1a1a]/70 transition-colors duration-200 cursor-pointer" style={{ color: `${textMuted}55` }}>Reset</button></div>
            <div className="space-y-3">
              {[
                { label: 'Scale', value: transform.scale.toFixed(2) + '×', min: 0.5, max: 2, step: 0.05, prop: 'scale' as const },
                { label: 'Rotation', value: transform.rotation + '°', min: 0, max: 360, step: 1, prop: 'rotation' as const },
                { label: 'Translate X', value: transform.translateX + 'px', min: -200, max: 200, step: 1, prop: 'translateX' as const },
                { label: 'Translate Y', value: transform.translateY + 'px', min: -200, max: 200, step: 1, prop: 'translateY' as const },
              ].map(s => (
                <div key={s.prop}><div className="flex items-center justify-between mb-1"><label className="text-[11px] font-mono" style={{ color: `${textMuted}80` }}>{s.label}</label><span className="text-[10px] font-mono" style={{ color: `${textMuted}55` }}>{s.value}</span></div><input type="range" min={s.min} max={s.max} step={s.step} value={transform[s.prop] as number} onChange={e => updateTransform({ [s.prop]: s.step >= 1 ? parseInt(e.target.value) : parseFloat(e.target.value) })} className="w-full h-1.5 appearance-none cursor-pointer" /></div>
              ))}
            </div>
          </div>

          {/* Shape Presets */}
          <div className="rounded-xl border border-[#1a1a1a]/15 p-4" style={{ backgroundColor: surface }}>
            <div className="flex items-center gap-2 mb-3"><IconEye size={16} style={{ color: textMuted }} /><span className="text-xs font-mono" style={{ color: `${textMuted}90` }}>Preview Shapes</span></div>
            <div className="grid grid-cols-3 gap-2">
              {shapePresets.map((s, i) => (<button key={i} onClick={() => handleLoadShape(s.points)} className="flex flex-col items-center gap-1.5 p-3 border border-[#1a1a1a]/12 transition-colors duration-200 cursor-pointer hover:border-[#1a1a1a]/15" style={{ backgroundColor: surface }}><s.icon size={20} /><span className="text-[10px] font-mono" style={{ color: `${textMuted}60` }}>{s.label}</span></button>))}
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center justify-center gap-3 px-4 py-2 border border-[#1a1a1a]/12" style={{ backgroundColor: surface }}>
            {[{ icon: IconMove, text: 'Drag nodes' }, { icon: IconPen, text: 'Click to draw' }, { icon: IconCode, text: 'Export SVG' }].map((info, i) => (
              <div key={i} className="flex items-center gap-1"><info.icon size={12} style={{ color: `${textMuted}40` }} /><span className="text-[10px] font-mono" style={{ color: `${textMuted}40` }}>{info.text}</span>{i < 2 && <span style={{ color: `${textMuted}15` }} className="mx-2">/</span>}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgEditor;
