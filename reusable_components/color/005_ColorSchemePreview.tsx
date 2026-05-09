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

/** Deep dark gray constant used for dark-theme backgrounds. */
const DARK_BG = "#1a1a1a";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Labels that appear inside the preview mock-up. All default to English. */
export interface ColorSchemePreviewLabels {
  /** Label for the email input field. @default "Email Address" */
  emailLabel?: string;
  /** Label for the select / dropdown field. @default "Select an option" */
  selectLabel?: string;
  /** First option in the dropdown. @default "Option 1" */
  option1?: string;
  /** Second option in the dropdown. @default "Option 2" */
  option2?: string;
  /** Checkbox label. @default "I agree to the terms" */
  agreeLabel?: string;
  /** Primary CTA button text. @default "Learn More" */
  ctaButton?: string;
  /** Secondary / outline button text. @default "Cancel" */
  cancelButton?: string;
  /** Category tag shown on cards. @default "Category" */
  categoryLabel?: string;
  /** "Read more" link text. @default "Read More \u2192" */
  readMore?: string;
}

export interface ColorSchemePreviewProps {
  /** Array of 5 hex color strings (palette variants). */
  colors: string[];
  /** Secondary / accent hex color. */
  secondaryColor: string;
  /** Current colour scheme mode. */
  mode: "light" | "dark";
  /** Optional override for every user-visible label in the preview. */
  labels?: ColorSchemePreviewLabels;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_LABELS: Required<ColorSchemePreviewLabels> = {
  emailLabel: "Email Address",
  selectLabel: "Select an option",
  option1: "Option 1",
  option2: "Option 2",
  agreeLabel: "I agree to the terms",
  ctaButton: "Learn More",
  cancelButton: "Cancel",
  categoryLabel: "Category",
  readMore: "Read More \u2192",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A miniature UI mock-up that previews a colour scheme using the 60-30-10
 * rule: 60 % neutral background, 30 % primary colour, 10 % accent.
 *
 * Fully self-contained — no external colour-utility or icon imports required.
 *
 * @example
 * ```tsx
 * <ColorSchemePreview
 *   colors={["#e74c3c", "#c0392b", "#a93226", "#922b21", "#7b241c"]}
 *   secondaryColor="#2980b9"
 *   mode="dark"
 *   labels={{ ctaButton: "Try it now" }}
 * />
 * ```
 */
export function ColorSchemePreview({
  colors,
  secondaryColor,
  mode,
  labels,
}: ColorSchemePreviewProps) {
  const t: Required<ColorSchemePreviewLabels> = { ...DEFAULT_LABELS, ...labels };

  const [baseColor, variant1, variant2, variant3, variant4] = colors;

  // 60-30-10 Rule Implementation
  const neutralBg = mode === "light" ? "#f5f5f5" : DARK_BG;
  const neutralSurface = mode === "light" ? "#ffffff" : "#242424";
  const neutralText = mode === "light" ? "#1a1a1a" : "#e0e0e0";
  const neutralMuted = mode === "light" ? "#6b7280" : "#9ca3af";

  const primaryColor = baseColor;
  const accentColor = secondaryColor;

  return (
    <div
      className="w-full border rounded-xl overflow-hidden shadow-lg transition-all duration-300"
      style={{
        backgroundColor: neutralBg,
        color: neutralText,
        borderColor: mode === "light" ? "#e0e0e0" : "#404040",
      }}
    >
      {/* Header — 30% Primary */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ backgroundColor: primaryColor }}
      >
        <div
          className="text-2xl font-serif italic"
          style={{ color: getContrastColor(primaryColor) }}
        >
          lorem ipsum
        </div>
        <div style={{ color: getContrastColor(primaryColor) }}>
          <div className="text-xs font-medium">DUIS AUTE</div>
          <div className="text-xs opacity-80">IRURE DOLOR</div>
        </div>
      </div>

      {/* Color bar — showing full palette */}
      <div className="flex h-2">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex-1 transition-all duration-300"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Content area — 60% Neutral background */}
      <div className="p-5" style={{ backgroundColor: neutralBg }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left column */}
          <div>
            <div
              className="mb-3 text-sm font-semibold"
              style={{ color: primaryColor }}
            >
              Mollit Anim
            </div>
            <div className="text-sm mb-4 leading-relaxed text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>

            {/* Form elements preview */}
            <div className="space-y-3 mb-4">
              {/* Input field */}
              <div>
                <label
                  className="text-xs font-medium mb-1 block"
                  style={{ color: neutralText }}
                >
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: neutralSurface,
                    borderColor: mode === "light" ? "#d1d5db" : "#404040",
                    color: neutralText,
                  }}
                />
              </div>

              {/* Select field */}
              <div>
                <label
                  className="text-xs font-medium mb-1 block"
                  style={{ color: neutralText }}
                >
                  {t.selectLabel}
                </label>
                <select
                  className="w-full px-3 py-2 text-sm rounded-lg border transition-all"
                  style={{
                    backgroundColor: neutralSurface,
                    borderColor: mode === "light" ? "#d1d5db" : "#404040",
                    color: neutralText,
                  }}
                >
                  <option>{t.option1}</option>
                  <option>{t.option2}</option>
                </select>
              </div>

              {/* Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{ accentColor: primaryColor }}
                />
                <span className="text-sm">{t.agreeLabel}</span>
              </label>
            </div>

            {/* CTA Button — 10% Secondary */}
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium mb-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
              style={{
                backgroundColor: accentColor,
                color: getContrastColor(accentColor),
              }}
            >
              {t.ctaButton}
            </button>

            {/* Secondary button */}
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium ml-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "transparent",
                color: primaryColor,
                border: `1.5px solid ${primaryColor}`,
              }}
            >
              {t.cancelButton}
            </button>

            {/* Card with elevation */}
            <div
              className="mt-5 p-4 rounded-xl shadow-md transition-all hover:shadow-lg"
              style={{
                backgroundColor: neutralSurface,
                borderLeft: `4px solid ${primaryColor}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {/* Clock icon (inline SVG — replaces any lucide-react dependency) */}
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke={getContrastColor(primaryColor)}
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeWidth="2" d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div
                    className="text-xs font-semibold mb-0.5"
                    style={{ color: primaryColor }}
                  >
                    Duis aute irure dolor
                  </div>
                  <div
                    className="text-xs space-y-0.5"
                    style={{ color: neutralMuted }}
                  >
                    <div>&bull; Lorem ipsum</div>
                    <div>&bull; Dolor sit amet</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Cards */}
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-3 rounded-xl shadow-sm transition-all hover:shadow-md hover:scale-[1.01]"
                style={{ backgroundColor: neutralSurface }}
              >
                <div className="flex gap-3">
                  <div className="text-xl" style={{ color: primaryColor }}>
                    &block;
                  </div>
                  <div className="flex-1">
                    <div
                      className="mb-1 text-sm font-medium"
                      style={{ color: primaryColor }}
                    >
                      Lorem ipsum dolor
                    </div>
                    <div
                      className="text-xs mb-1.5"
                      style={{ color: accentColor }}
                    >
                      Duis aute &bull; {t.categoryLabel}
                    </div>
                    <div
                      className="text-xs leading-relaxed"
                      style={{ color: neutralMuted }}
                    >
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </div>
                    <button
                      className="text-xs mt-2 hover:underline font-medium transition-all"
                      style={{ color: accentColor }}
                    >
                      {t.readMore}
                    </button>
                    {item === 2 && (
                      <div
                        className="text-xs p-2 rounded-lg mt-2"
                        style={{
                          backgroundColor: accentColor + "15",
                          borderLeft: `3px solid ${accentColor}`,
                          color: accentColor,
                        }}
                      >
                        &zwnj;26A1 Adipiscing elit sed do eiusmod tempor.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer accent line */}
      <div className="h-1.5" style={{ backgroundColor: primaryColor }} />
    </div>
  );
}
