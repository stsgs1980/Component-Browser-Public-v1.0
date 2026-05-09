"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorPaletteProps {
  /** Array of hex colour strings to display as swatches. */
  colors: string[];
  /** Label shown above the palette. @default "Primary Color:" */
  title?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Simple row of colour swatches with hex labels underneath.
 *
 * Fully self-contained — no external imports beyond React.
 *
 * @example
 * ```tsx
 * <ColorPalette
 *   colors={["#e74c3c", "#3498db", "#2ecc71"]}
 *   title="Primary Color:"
 * />
 * ```
 */
export function ColorPalette({
  colors,
  title = "Primary Color:",
}: ColorPaletteProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground mb-2">{title}</div>
      <div className="flex gap-2">
        {colors.map((color, index) => (
          <div key={index} className="flex-1">
            <div
              className="h-12 rounded border border-border"
              style={{ backgroundColor: color }}
            />
            <div className="text-[10px] text-center mt-1.5 text-muted-foreground uppercase">
              {color}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
