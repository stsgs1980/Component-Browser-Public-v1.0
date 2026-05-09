"use client";

import React, { useState, useEffect, useRef } from "react";

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

/**
 * Return `#ffffff` or `#000000` whichever provides better contrast
 * against the given background `hexColor`.
 */
function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  const luminance = getRelativeLuminance(rgb);
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  return contrastWithWhite > contrastWithBlack ? "#ffffff" : "#000000";
}

// ---------------------------------------------------------------------------
// Inline SVG icons (replaces lucide-react Copy / Check)
// ---------------------------------------------------------------------------

/** Small "copy to clipboard" icon. */
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

/** Small "copied / check" icon. */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorVariantsListProps {
  /** Array of hex color strings (typically 5 palette variants). */
  colors: string[];
  /** Design-system scale labels shown on each swatch. @default ["50","100","200","300","400"] */
  labels?: string[];
  /** Title displayed above the swatches. @default "Base Color" */
  title?: string;
  /** Called when the user clicks a swatch. */
  onColorSelect?: (color: string) => void;
  /** Called when the user copies a swatch colour. */
  onCopy?: (color: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A row of colour swatches with design-system scale labels, a copy-to-
 * clipboard overlay, and optional click-to-select behaviour.
 *
 * Fully self-contained — no external colour-utility or icon imports required.
 *
 * @example
 * ```tsx
 * <ColorVariantsList
 *   colors={["#fecaca", "#f87171", "#ef4444", "#dc2626", "#b91c1c"]}
 *   onColorSelect={(c) => console.log("selected", c)}
 *   onCopy={(c) => navigator.clipboard.writeText(c)}
 *   labels={["100", "200", "300", "400", "500"]}
 *   title="Base Color"
 * />
 * ```
 */
export function ColorVariantsList({
  colors,
  labels = ["50", "100", "200", "300", "400"],
  title = "Base Color",
  onColorSelect,
  onCopy,
}: ColorVariantsListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Copy a colour to clipboard and show the checkmark briefly. */
  const handleCopy = (
    e: React.MouseEvent<HTMLDivElement>,
    color: string,
    index: number,
  ) => {
    e.stopPropagation();
    onCopy?.(color);
    setCopiedIndex(index);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopiedIndex(null);
      copyTimeoutRef.current = null;
    }, 1500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-1.5">
      <div className="text-xs text-muted-foreground mb-1.5">{title}</div>
      <div className="flex rounded-xl overflow-hidden border border-border shadow-sm">
        {colors.map((color, index) => (
          <button
            key={index}
            className="group relative flex flex-col items-center justify-center cursor-pointer flex-1 py-3 px-1 transition-all duration-200 hover:flex-[1.2]"
            onClick={() => onColorSelect?.(color)}
            style={{ backgroundColor: color }}
          >
            <div
              className="text-xs font-semibold mb-0.5"
              style={{ color: getContrastColor(color) }}
            >
              {labels[index]}
            </div>
            <div
              className="text-[9px] tabular-nums opacity-80"
              style={{ color: getContrastColor(color) }}
            >
              {color.toUpperCase()}
            </div>

            {/* Copy button overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleCopy(e, color, index)}
            >
              {copiedIndex === index ? (
                <CheckIcon className="w-4 h-4 text-white drop-shadow-md" />
              ) : (
                <CopyIcon className="w-4 h-4 text-white drop-shadow-md" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
