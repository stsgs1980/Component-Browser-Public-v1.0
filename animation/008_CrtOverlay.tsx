/**
 * 008_CrtOverlay — Pure CSS CRT screen overlay (scanlines + vignette)
 *
 * Renders a fixed/absolute-positioned overlay that simulates the look of a
 * vintage CRT monitor.  No React hooks — just a tiny presentational layer
 * over inline CSS.  Drop it anywhere in the tree and it will paint over the
 * nearest positioned ancestor (or the viewport when no ancestor is positioned).
 *
 * @example
 * ```tsx
 * <CrtOverlay showScanlines showVignette scanlineOpacity={0.15} vignetteStrength={0.6} />
 * ```
 */

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CrtOverlayProps {
  /** Whether horizontal scanlines are visible. @default true */
  showScanlines?: boolean;

  /** Whether a radial vignette darkening is applied. @default true */
  showVignette?: boolean;

  /** Opacity of the scanline pattern (0–1). @default 0.12 */
  scanlineOpacity?: number;

  /** Intensity of the radial vignette (0–1). @default 0.5 */
  vignetteStrength?: number;

  /** Extra class names forwarded to the root `<div>`. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A zero-dependency, pure-CSS overlay that adds CRT scanlines and a vignette
 * to any container.
 */
const CrtOverlay: React.FC<CrtOverlayProps> = ({
  showScanlines = true,
  showVignette = true,
  scanlineOpacity = 0.12,
  vignetteStrength = 0.5,
  className,
}) => {
  // Guard: render nothing when both effects are disabled
  if (!showScanlines && !showVignette) return null;

  // Clamp values to sane ranges
  const clampedOpacity = Math.max(0, Math.min(1, scanlineOpacity));
  const clampedVignette = Math.max(0, Math.min(1, vignetteStrength));

  // Build layer styles
  const layers: React.CSSProperties[] = [];

  if (showScanlines) {
    layers.push({
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      // Repeating-linear-gradient for thin horizontal lines
      backgroundImage: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 1px,
        rgba(0, 0, 0, ${clampedOpacity}) 1px,
        rgba(0, 0, 0, ${clampedOpacity}) 2px
      )`,
      backgroundSize: "100% 2px",
      opacity: 1,
      zIndex: 1,
    });
  }

  if (showVignette) {
    layers.push({
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      // Radial gradient: transparent center → black edges
      backgroundImage: `radial-gradient(
        ellipse at center,
        transparent 50%,
        rgba(0, 0, 0, ${clampedVignette * 0.6}) 80%,
        rgba(0, 0, 0, ${clampedVignette}) 100%
      )`,
      zIndex: 2,
    });
  }

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {layers.map((layerStyle, i) => (
        <div key={i} style={layerStyle} />
      ))}
    </div>
  );
};

export default CrtOverlay;
