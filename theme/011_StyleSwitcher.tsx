/**
 * 011_StyleSwitcher — Type-safe multi-theme switching architecture
 *
 * Renders a set of selectable style pills / tabs that let the user toggle
 * between different visual variants of a UI.  The `StyleConfig` interface
 * couples a key, label, visual pill token, accent colour, and the actual
 * component to render — keeping everything type-safe.
 *
 * **Three layout variants:**
 * - `"pills"`   — horizontal row of pill-shaped buttons (default).
 * - `"tabs"`    — tab bar with an animated underline on the active tab.
 * - `"dropdown"`— a native `<select>` dropdown for compact layouts.
 *
 * Zero external dependencies — only React `useState`.
 *
 * @example
 * ```tsx
 * import { StyleSwitcher } from './011_StyleSwitcher';
 *
 * const styles: StyleConfig[] = [
 *   { key: 'default', label: 'Default', pill: '#6366f1', accent: '#6366f1', component: DefaultTheme },
 *   { key: 'brutal',  label: 'Brutal',  pill: '#ff0050', accent: '#ff0050', component: BrutalTheme  },
 * ];
 *
 * const [active, setActive] = useState('default');
 *
 * <StyleSwitcher
 *   styles={styles}
 *   activeStyle={active}
 *   onStyleChange={setActive}
 *   variant="pills"
 *   sticky
 * />
 * ```
 */

import React, { useState, useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Opaque style key — any string is valid so callers can use branded strings,
 * enums, or plain literals.
 */
type StyleKey = string;

/**
 * Descriptor for a single visual style / theme variant.
 *
 * @property key       - Unique identifier for the style (must match other StyleConfig keys).
 * @property label     - Human-readable label shown in the UI.
 * @property pill      - Colour token for the pill / tab indicator.
 * @property accent    - Primary accent colour used by the component.
 * @property component - The React component to render when this style is active.
 */
export interface StyleConfig {
  key: StyleKey;
  label: string;
  pill: string;
  accent: string;
  component: React.ComponentType;
}

/**
 * Props for the `StyleSwitcher` component.
 *
 * @property styles        - Array of available `StyleConfig` entries.
 * @property activeStyle   - Currently active style key.
 * @property onStyleChange - Callback fired when the user selects a different style.
 * @property className     - Extra class names forwarded to the root element.
 * @property sticky        - Whether the switcher sticks to the top of its container. @default false
 * @property variant       - Layout variant. @default 'pills'
 */
export interface StyleSwitcherProps {
  /** Array of available style configurations. */
  styles: StyleConfig[];

  /** The `key` of the currently active style. */
  activeStyle: StyleKey;

  /** Callback fired when a style is selected. */
  onStyleChange: (key: StyleKey) => void;

  /** Extra class names forwarded to the root element. */
  className?: string;

  /** Whether to stick the switcher to the top of the viewport. @default false */
  sticky?: boolean;

  /** Visual layout variant. @default 'pills' */
  variant?: "pills" | "tabs" | "dropdown";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const rootBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: "0.8125rem",
  fontWeight: 500,
};

// ---------------------------------------------------------------------------
// Pills variant
// ---------------------------------------------------------------------------

const PillsVariant: React.FC<{
  styles: StyleConfig[];
  activeStyle: StyleKey;
  onStyleChange: (key: StyleKey) => void;
}> = ({ styles, activeStyle, onStyleChange }) => (
  <div style={{ ...rootBase, flexWrap: "wrap" }}>
    {styles.map((s) => {
      const isActive = s.key === activeStyle;
      return (
        <button
          key={s.key}
          type="button"
          onClick={() => onStyleChange(s.key)}
          aria-pressed={isActive}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 9999,
            border: isActive ? "none" : "1px solid rgba(128,128,128,0.3)",
            background: isActive ? s.pill : "transparent",
            color: isActive
              ? isLight(s.pill)
                ? "#000"
                : "#fff"
              : "inherit",
            cursor: "pointer",
            fontSize: "0.8125rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {/* Colour dot */}
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: s.pill,
              flexShrink: 0,
            }}
          />
          {s.label}
        </button>
      );
    })}
  </div>
);

// ---------------------------------------------------------------------------
// Tabs variant
// ---------------------------------------------------------------------------

const TabsVariant: React.FC<{
  styles: StyleConfig[];
  activeStyle: StyleKey;
  onStyleChange: (key: StyleKey) => void;
}> = ({ styles, activeStyle, onStyleChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);

  const activeIdx = styles.findIndex((s) => s.key === activeStyle);

  // Measure the active tab button to position the sliding underline
  useEffect(() => {
    const container = containerRef.current;
    if (!container || activeIdx < 0) return;

    const buttons = container.querySelectorAll<HTMLButtonElement>(
      "[data-style-tab]",
    );
    const btn = buttons[activeIdx];
    if (!btn) return;

    setIndicatorLeft(btn.offsetLeft);
    setIndicatorWidth(btn.offsetWidth);
  }, [activeIdx, styles]);

  return (
    <div
      ref={containerRef}
      style={{
        ...rootBase,
        position: "relative",
        borderBottom: "1px solid rgba(128,128,128,0.25)",
        overflow: "auto",
      }}
    >
      {styles.map((s) => {
        const isActive = s.key === activeStyle;
        return (
          <button
            key={s.key}
            data-style-tab
            type="button"
            onClick={() => onStyleChange(s.key)}
            aria-selected={isActive}
            role="tab"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              border: "none",
              background: "transparent",
              color: isActive ? s.pill : "inherit",
              cursor: "pointer",
              fontSize: "0.8125rem",
              fontWeight: isActive ? 600 : 500,
              transition: "color 0.2s ease",
              whiteSpace: "nowrap",
              position: "relative",
            }}
          >
            {s.label}
          </button>
        );
      })}

      {/* Sliding underline indicator */}
      {activeIdx >= 0 && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: indicatorLeft,
            width: indicatorWidth,
            height: 2,
            background: styles[activeIdx]?.pill ?? "transparent",
            borderRadius: 1,
            transition: "left 0.25s ease, width 0.25s ease",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Dropdown variant
// ---------------------------------------------------------------------------

const DropdownVariant: React.FC<{
  styles: StyleConfig[];
  activeStyle: StyleKey;
  onStyleChange: (key: StyleKey) => void;
}> = ({ styles, activeStyle, onStyleChange }) => (
  <div style={{ ...rootBase }}>
    <label
      htmlFor="style-switcher-select"
      style={{ fontSize: "0.75rem", fontWeight: 500, opacity: 0.7, marginRight: 4 }}
    >
      Style
    </label>
    <select
      id="style-switcher-select"
      value={activeStyle}
      onChange={(e) => onStyleChange(e.target.value)}
      style={{
        padding: "6px 28px 6px 10px",
        borderRadius: 6,
        border: "1px solid rgba(128,128,128,0.3)",
        background: "transparent",
        fontSize: "0.8125rem",
        fontWeight: 500,
        cursor: "pointer",
        appearance: "auto",
        color: "inherit",
      }}
    >
      {styles.map((s) => (
        <option key={s.key} value={s.key}>
          {s.label}
        </option>
      ))}
    </select>
  </div>
);

// ---------------------------------------------------------------------------
// Colour utility
// ---------------------------------------------------------------------------

/**
 * Naive luminance check — returns `true` if the hex colour is likely light.
 */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // Relative luminance (simplified)
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * A type-safe, zero-dependency style / theme switcher.
 *
 * Supports three layout variants:
 * - **pills** — compact horizontal row of pill buttons.
 * - **tabs** — tab bar with sliding underline indicator.
 * - **dropdown** — native `<select>` for space-constrained layouts.
 *
 * @named
 */
export const StyleSwitcher: React.FC<StyleSwitcherProps> = ({
  styles,
  activeStyle,
  onStyleChange,
  className,
  sticky = false,
  variant = "pills",
}) => {
  const outerStyle: React.CSSProperties = sticky
    ? { position: "sticky" as const, top: 0, zIndex: 50 }
    : {};

  return (
    <div className={className} style={outerStyle}>
      {variant === "pills" && (
        <PillsVariant
          styles={styles}
          activeStyle={activeStyle}
          onStyleChange={onStyleChange}
        />
      )}
      {variant === "tabs" && (
        <TabsVariant
          styles={styles}
          activeStyle={activeStyle}
          onStyleChange={onStyleChange}
        />
      )}
      {variant === "dropdown" && (
        <DropdownVariant
          styles={styles}
          activeStyle={activeStyle}
          onStyleChange={onStyleChange}
        />
      )}
    </div>
  );
};

export default StyleSwitcher;
