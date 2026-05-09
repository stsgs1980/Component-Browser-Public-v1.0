/**
 * Code-Realm Generator Components — Shared Types & Utilities
 *
 * Common interfaces, color math helpers, and SSR-safe hooks
 * used across all 6 generator components.
 *
 * @module shared
 */

import { useSyncExternalStore, useCallback } from 'react';

// ─── SSR-safe mount hook ─────────────────────────────────────────
const emptySubscribe = () => () => {};
/** Returns `false` during SSR and `true` after hydration. */
export function useIsMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

// ─── Color Types ─────────────────────────────────────────────────
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

// ─── Color Conversion ───────────────────────────────────────────
/** Convert hex (#RGB or #RRGGBB) to RGB object. */
export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Convert RGB values (0-255) to hex string. */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Convert RGB to HSL (h: 0-360, s/l: 0-100). */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / d + 2) * 60;
        break;
      case bn:
        h = ((rn - gn) / d + 4) * 60;
        break;
    }
  }
  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/** Convert HSL to RGB. */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

/** Convert HSL to hex. */
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/** Convert hex color to rgba string. */
export function hexToRgba(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

// ─── Clipboard Utility ──────────────────────────────────────────
/** Copy text to clipboard with fallback. Returns true on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

// ─── File Download Utility ───────────────────────────────────────
/** Download a string as a file. */
export function downloadFile(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── WCAG Contrast ──────────────────────────────────────────────
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(rgb1: RGB, rgb2: RGB): number {
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastResult {
  whiteRatio: number;
  blackRatio: number;
  whiteAA: boolean;
  whiteAAA: boolean;
  blackAA: boolean;
  blackAAA: boolean;
}

export function getContrastBadges(hex: string): ContrastResult {
  const rgb = hexToRgb(hex);
  const white: RGB = { r: 255, g: 255, b: 255 };
  const black: RGB = { r: 0, g: 0, b: 0 };
  const wRatio = contrastRatio(rgb, white);
  const bRatio = contrastRatio(rgb, black);
  return {
    whiteRatio: Math.round(wRatio * 100) / 100,
    blackRatio: Math.round(bRatio * 100) / 100,
    whiteAA: wRatio >= 4.5,
    whiteAAA: wRatio >= 7,
    blackAA: bRatio >= 4.5,
    blackAAA: bRatio >= 7,
  };
}

// ─── Incrementing ID helper ─────────────────────────────────────
let _nextId = 0;
/** Returns a unique numeric ID (resets per module load). */
export function nextId(): number {
  return ++_nextId;
}

// ─── Theme Defaults ─────────────────────────────────────────────
export interface GeneratorTheme {
  /** Primary accent color (default: #d4a017) */
  accent: string;
  /** Secondary accent (default: #b8860b) */
  accentSecondary: string;
  /** Panel background (default: #0d1117) */
  panelBg: string;
  /** Surface background (default: #ebe5d0) */
  surface: string;
  /** Text color for muted labels (default: #6b6356) */
  textMuted: string;
  /** Error/danger color (default: #c23616) */
  danger: string;
  /** Border color (default: rgba(26,26,26,0.1)) */
  border: string;
}

export const DEFAULT_THEME: GeneratorTheme = {
  accent: '#d4a017',
  accentSecondary: '#b8860b',
  panelBg: '#0d1117',
  surface: '#ebe5d0',
  textMuted: '#6b6356',
  danger: '#c23616',
  border: 'rgba(26,26,26,0.1)',
};

// ─── CSS Transition Helpers ─────────────────────────────────────
export const fadeUpTransition: React.CSSProperties = {
  transition: 'opacity 0.3s ease, transform 0.3s ease',
};

export const fadeTransition: React.CSSProperties = {
  transition: 'opacity 0.25s ease',
};

// ─── Syntax Highlighting Helpers ────────────────────────────────
/** Highlight hex colors in a string, returning React nodes. */
export function highlightColors(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const colorRegex = /#[0-9a-fA-F]{3,8}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = colorRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`c-${lastIndex}`} className="syn-value">
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }
    parts.push(
      <span key={`c-${match.index}`} className="syn-number">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(
      <span key={`c-end-${lastIndex}`} className="syn-value">
        {text.slice(lastIndex)}
      </span>
    );
  }
  return <>{parts}</>;
}

/** Render a code line with line number. */
export function CodeLine({
  lineNum,
  children,
}: {
  lineNum: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex leading-[1.625rem]">
      <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">
        {lineNum}
      </span>
      <span className="whitespace-pre text-xs">{children}</span>
    </div>
  );
}

/** VS Code-style traffic-light header. */
export function ChromeHeader({
  filename,
  theme,
}: {
  filename: string;
  theme: GeneratorTheme;
}) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 border-b"
      style={{ borderColor: theme.border, backgroundColor: theme.panelBg }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      <span
        className="font-mono text-[11px] ml-2"
        style={{ color: `${theme.textMuted}99` }}
      >
        {filename}
      </span>
    </div>
  );
}

// ─── Inline SVG Icons ───────────────────────────────────────────
/** 24×24 Copy icon (clipboard). */
export function IconCopy({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

/** 24×24 Check icon. */
export function IconCheck({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** 24×24 Download icon. */
export function IconDownload({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

/** 24×24 Shuffle icon. */
export function IconShuffle({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H20" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
      <path d="M20 18h-3.9c-1.3 0-2.5-.6-3.3-1.7l-.5-.8" />
      <path d="m18 14 4 4-4 4" />
    </svg>
  );
}

/** 24×24 Eye icon. */
export function IconEye({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** 24×24 Palette icon. */
export function IconPalette({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

/** 24×24 Refresh/RotateCcw icon. */
export function IconRefresh({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

/** 24×24 Lock icon. */
export function IconLock({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/** 24×24 Unlock icon. */
export function IconUnlock({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}
