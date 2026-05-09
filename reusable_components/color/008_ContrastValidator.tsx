"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Inline color utilities (from colorUtils.ts)
// ---------------------------------------------------------------------------

interface RGB {
  r: number;
  g: number;
  b: number;
}

/** Convert a hex color string to an {r, g, b} object. */
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/** Calculate WCAG relative luminance for an RGB color. */
function getRelativeLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r =
    rsRGB <= 0.03928
      ? rsRGB / 12.92
      : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g =
    gsRGB <= 0.03928
      ? gsRGB / 12.92
      : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b =
    bsRGB <= 0.03928
      ? bsRGB / 12.92
      : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Calculate WCAG contrast ratio between two hex colours. */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check whether a foreground/background pair passes WCAG contrast requirements.
 *
 * @param foreground  Foreground hex colour.
 * @param background  Background hex colour.
 * @param level       `"AA"` or `"AAA"`.
 * @param isLargeText  `true` for large text (≥18 pt or ≥14 pt bold).
 */
function passesWCAG(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  isLargeText: boolean = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === "AAA") {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// ---------------------------------------------------------------------------
// Inline SVG icons (replaces lucide-react Check / X / AlertTriangle)
// ---------------------------------------------------------------------------

/** Small check-mark icon (success). */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Small "X" icon (failure). */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** Small warning-triangle icon. */
function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Labels used inside the contrast validator UI. */
export interface ContrastValidatorLabels {
  /** Contrast ratio label. @default "Contrast:" */
  contrastLabel?: string;
  /** "Normal text" descriptor. @default "Normal text" */
  normalText?: string;
  /** "Large text" descriptor. @default "Large text" */
  largeText?: string;
  /** Compact-mode "AA: Normal". @default "AA: Normal" */
  aaNormal?: string;
  /** Compact-mode "AA: Large". @default "AA: Large" */
  aaLarge?: string;
  /** Compact-mode "AAA: Normal". @default "AAA: Normal" */
  aaaNormal?: string;
  /** Compact-mode "AAA: Large". @default "AAA: Large" */
  aaaLarge?: string;
  /** Compact-mode minimum ratio warning. @default "Minimum 4.5:1" */
  minimumRatio?: string;
  /** Full-mode insufficient contrast warning. @default "Insufficient contrast for accessibility. Minimum 4.5:1 for AA level." */
  insufficientWarning?: string;
  /** Full-mode AAA success message. @default "Excellent contrast! Meets WCAG AAA (7:1)" */
  excellentContrast?: string;
}

export interface ContrastValidatorProps {
  /** Foreground hex colour to validate. */
  foreground: string;
  /** Background hex colour to validate against. */
  background: string;
  /** When `true`, render a compact single-column layout. @default false */
  compact?: boolean;
  /** Optional label overrides. */
  labels?: ContrastValidatorLabels;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_LABELS: Required<ContrastValidatorLabels> = {
  contrastLabel: "Contrast:",
  normalText: "Normal text",
  largeText: "Large text",
  aaNormal: "AA: Normal",
  aaLarge: "AA: Large",
  aaaNormal: "AAA: Normal",
  aaaLarge: "AAA: Large",
  minimumRatio: "Minimum 4.5:1",
  insufficientWarning:
    "Insufficient contrast for accessibility. Minimum 4.5:1 for AA level.",
  excellentContrast: "Excellent contrast! Meets WCAG AAA (7:1)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Displays the WCAG contrast ratio between a foreground and background colour
 * and shows pass / fail indicators for AA and AAA conformance levels (both
 * normal and large text).
 *
 * Fully self-contained — no external colour-utility or icon imports required.
 *
 * @example
 * ```tsx
 * <ContrastValidator
 *   foreground="#ffffff"
 *   background="#1a1a1a"
 *   compact
 *   labels={{ contrastLabel: "Ratio" }}
 * />
 * ```
 */
export function ContrastValidator({
  foreground,
  background,
  compact = false,
  labels,
}: ContrastValidatorProps) {
  const t: Required<ContrastValidatorLabels> = {
    ...DEFAULT_LABELS,
    ...labels,
  };

  const ratio = getContrastRatio(foreground, background);

  // WCAG requirements
  const passesAANormal = passesWCAG(foreground, background, "AA", false); // 4.5:1
  const passesAALarge = passesWCAG(foreground, background, "AA", true); // 3:1
  const passesAAANormal = passesWCAG(foreground, background, "AAA", false); // 7:1
  const passesAAALarge = passesWCAG(foreground, background, "AAA", true); // 4.5:1

  // -----------------------------------------------------------------------
  // Compact mode
  // -----------------------------------------------------------------------
  if (compact) {
    const getStatusIcon = (passes: boolean) =>
      passes ? (
        <CheckIcon className="w-3 h-3 text-green-500" />
      ) : (
        <XIcon className="w-3 h-3 text-red-500" />
      );

    return (
      <div className="space-y-1">
        <div className="text-sm font-medium tabular-nums">
          {ratio.toFixed(2)}:1
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            {getStatusIcon(passesAANormal)}
            <span className="text-[10px]">{t.aaNormal}</span>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon(passesAALarge)}
            <span className="text-[10px]">{t.aaLarge}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            {getStatusIcon(passesAAANormal)}
            <span className="text-[10px]">{t.aaaNormal}</span>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon(passesAAALarge)}
            <span className="text-[10px]">{t.aaaLarge}</span>
          </div>
        </div>

        {!passesAANormal && (
          <div className="flex items-center gap-1 text-yellow-500 mt-1">
            <AlertTriangleIcon className="w-3 h-3" />
            <span className="text-[10px]">{t.minimumRatio}</span>
          </div>
        )}

        {passesAAANormal && (
          <div className="flex items-center gap-1 text-green-500 mt-1">
            <CheckIcon className="w-3 h-3" />
            <span className="text-[10px]">AAA</span>
          </div>
        )}
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Full mode (default)
  // -----------------------------------------------------------------------
  const getStatusColor = (passes: boolean) =>
    passes ? "bg-green-500" : "bg-red-500";

  return (
    <div className="bg-muted rounded-lg p-3 space-y-3">
      {/* Contrast ratio display */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{t.contrastLabel}</span>
        <span className="text-sm font-medium tabular-nums">
          {ratio.toFixed(2)}:1
        </span>
      </div>

      {/* WCAG Level AA */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground mb-1.5">
          WCAG Level AA:
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(passesAANormal)}`}
          />
          <span className="text-xs">
            {t.normalText} (&ge;4.5:1)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(passesAALarge)}`}
          />
          <span className="text-xs">
            {t.largeText} (&ge;3:1)
          </span>
        </div>
      </div>

      {/* WCAG Level AAA */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground mb-1.5">
          WCAG Level AAA:
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(passesAAANormal)}`}
          />
          <span className="text-xs">
            {t.normalText} (&ge;7:1)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(passesAAALarge)}`}
          />
          <span className="text-xs">
            {t.largeText} (&ge;4.5:1)
          </span>
        </div>
      </div>

      {/* Warning for failing accessibility */}
      {!passesAANormal && (
        <div className="text-xs text-yellow-500 mt-2 p-2 bg-yellow-900/20 rounded border border-yellow-700/30">
          &#9888;&#65039; {t.insufficientWarning}
        </div>
      )}

      {/* Success message for AAA */}
      {passesAAANormal && (
        <div className="text-xs text-green-500 mt-2 p-2 bg-green-900/20 rounded border border-green-700/30">
          &#10003; {t.excellentContrast}
        </div>
      )}
    </div>
  );
}
