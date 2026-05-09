/**
 * @file SciFiHUD — A reusable, fully-de-hardcoded Sci-Fi Heads-Up Display component library.
 *
 * Exports seven individual sub-components plus one composed wrapper (`SciFiHUD`).
 * Pure React (useState, useEffect) — zero external dependencies.
 *
 * @example
 * ```tsx
 * import SciFiHUD, { ScanLine, AnimatedRadar, TelemetryPanel } from './003_SciFiHUD';
 *
 * // Use the composed layout
 * <SciFiHUD
 *   metrics={[{ label: 'CPU', value: 72, color: '#00f0ff', percentage: 72 }]}
 *   logEntries={[{ text: 'System nominal', status: 'success' }]}
 *   radarBlips={[{ top: '30%', left: '45%', color: '#a6e3a1', size: '6px' }]}
 * />
 *
 * // Or compose your own layout from sub-components
 * <ScanLine color="#00f0ff" speed={3000} />
 * ```
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   DEFAULT COLOUR PALETTE
   ──────────────────────────────────────────────────────────────────────────── */

/** Default accent colour — bright cyan. */
const DEFAULT_ACCENT = "#00f0ff";
/** Default background colour — deep navy-black. */
const DEFAULT_BG = "#060a14";
/** Default success / "all-good" colour. */
const DEFAULT_SUCCESS = "#a6e3a1";
/** Default warning / caution colour. */
const DEFAULT_WARNING = "#f9e2af";
/** Default info / informational colour. */
const DEFAULT_INFO = "#89b4fa";
/** Default muted / dimmed colour. */
const DEFAULT_MUTED = "#6c7086";

/* ────────────────────────────────────────────────────────────────────────────
   SHARED TYPES
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Describes a single metric shown inside {@link TelemetryPanel}.
 *
 * `value` can be a static `number`/`string` **or** a function that returns
 * a dynamic value (called on every render, e.g. derived from live state).
 */
export interface MetricDatum {
  /** Short label for the metric (e.g. "CPU Load"). */
  label: string;
  /**
   * Current value. Pass a number, a formatted string, or a zero-arg
   * function that returns one of those — useful for live values.
   */
  value: number | string | (() => number | string);
  /** Colour of the progress bar fill. Falls back to `accentColor`. */
  color?: string;
  /** Progress percentage 0-100. */
  percentage: number;
}

/**
 * Describes a single log entry shown inside {@link SystemLog}.
 */
export interface LogEntry {
  /** The log message. */
  text: string;
  /** Status severity. Controls the leading icon. */
  status: "success" | "warning" | "error" | "info";
}

/**
 * Describes a radar blip rendered inside {@link AnimatedRadar}.
 */
export interface RadarBlip {
  /** `top` CSS value (e.g. `"30%"`). */
  top: string;
  /** `left` CSS value (e.g. `"45%"`). */
  left: string;
  /** Blip colour. */
  color: string;
  /** Blip diameter (CSS value). Defaults to `"6px"`. */
  size?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────────────────── */

/** Resolve a potentially-function metric value to a plain value. */
function resolveMetricValue(
  v: number | string | (() => number | string),
): string {
  return String(typeof v === "function" ? v() : v);
}

/**
 * Map a log-entry status string to the corresponding default colour.
 */
function statusToColor(
  status: LogEntry["status"],
  colors: { success: string; warning: string; info: string; muted: string },
): string {
  switch (status) {
    case "success":
      return colors.success;
    case "warning":
      return colors.warning;
    case "error":
      return "#f38ba8";
    case "info":
    default:
      return colors.info;
  }
}

/**
 * Map a log-entry status to a compact unicode symbol.
 */
function statusToIcon(status: LogEntry["status"]): string {
  switch (status) {
    case "success":
      return "\u2713";
    case "warning":
      return "\u26A0";
    case "error":
      return "\u2717";
    case "info":
    default:
      return "\u2139";
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   1. ScanLine
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * A full-width horizontal sweep line that continuously animates from top to
 * bottom of its container.
 *
 * Uses `setInterval` internally to cycle `top` from 0 % → 100 %, applying
 * a coloured glow via `box-shadow`.
 *
 * @example
 * ```tsx
 * <ScanLine color="#00f0ff" speed={3000} opacity={0.6} className="absolute inset-0" />
 * ```
 */
export function ScanLine({
  color = DEFAULT_ACCENT,
  speed = 3000,
  opacity = 0.5,
  className,
}: {
  /** Colour of the line and its glow. @default '#00f0ff' */
  color?: string;
  /** Duration in ms for one full sweep (top → bottom). @default 3000 */
  speed?: number;
  /** Opacity of the line (0–1). @default 0.5 */
  opacity?: string | number;
  /** Additional CSS class names. */
  className?: string;
}): React.ReactElement | null {
  const [top, setTop] = useState<number>(0);

  useEffect(() => {
    const step = 100 / (speed / 50); // update every ~50 ms
    const id = setInterval(() => {
      setTop((prev) => (prev >= 100 ? 0 : prev + step));
    }, 50);
    return () => clearInterval(id);
  }, [speed]);

  const style = useMemo(
    (): React.CSSProperties => ({
      position: "absolute",
      left: 0,
      right: 0,
      top: `${top}%`,
      height: "2px",
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      boxShadow: `0 0 ${12}px ${color}, 0 0 ${30}px ${color}`,
      opacity: Number(opacity),
      pointerEvents: "none",
      zIndex: 10,
    }),
    [top, color, opacity],
  );

  return <div style={style} className={className} />;
}

/* ════════════════════════════════════════════════════════════════════════════
   2. GridOverlay
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * A perspective-crosshatch mesh background created with repeating
 * `linear-gradient` lines at configurable spacing.
 *
 * @example
 * ```tsx
 * <GridOverlay color="#00f0ff" size="40px" opacity={0.08} />
 * ```
 */
export function GridOverlay({
  color = DEFAULT_ACCENT,
  size = "40px",
  opacity = 0.08,
  className,
}: {
  /** Grid-line colour. @default '#00f0ff' */
  color?: string;
  /** `backgroundSize` value controlling grid spacing. @default '40px' */
  size?: string;
  /** Opacity of the grid (0–1). @default 0.08 */
  opacity?: string | number;
  /** Additional CSS class names. */
  className?: string;
}): React.ReactElement {
  const style = useMemo(
    (): React.CSSProperties => ({
      position: "absolute",
      inset: 0,
      backgroundSize: size,
      backgroundImage: `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px)
      `,
      opacity: Number(opacity),
      pointerEvents: "none",
      perspective: "500px",
    }),
    [color, size, opacity],
  );

  return <div style={style} className={className} />;
}

/* ════════════════════════════════════════════════════════════════════════════
   3. HUDCornerAccents
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * Four corner-bracket decorations commonly seen in sci-fi HUD frames.
 *
 * Each bracket is an absolutely-positioned element with only two visible
 * sides (top/left, top/right, bottom/left, bottom/right).
 *
 * @example
 * ```tsx
 * <HUDCornerAccents color="#00f0ff" size="24px" />
 * ```
 */
export function HUDCornerAccents({
  color = DEFAULT_ACCENT,
  size = "24px",
  className,
}: {
  /** Accent colour of the brackets. @default '#00f0ff' */
  color?: string;
  /** Length of each bracket arm (CSS value). @default '24px' */
  size?: string;
  /** Additional CSS class names. */
  className?: string;
}): React.ReactElement {
  const bracketStyle = useMemo(
    (position: string): React.CSSProperties => ({
      position: "absolute",
      [position]: "8px",
      width: size,
      height: size,
      borderColor: color,
      borderStyle: "solid",
      borderWidth: 0,
      pointerEvents: "none",
      zIndex: 10,
    }),
    [color, size],
  );

  /** Generate the two visible borders for a corner. */
  const cornerBorders = (
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  ): React.CSSProperties => {
    const base = bracketStyle(
      position === "top-left"
        ? "top"
        : position === "top-right"
          ? "top"
          : position === "bottom-left"
            ? "bottom"
            : "bottom",
    );

    const extra: React.CSSProperties =
      position === "top-left"
        ? { top: "8px", left: "8px", borderTopWidth: "2px", borderLeftWidth: "2px" }
        : position === "top-right"
          ? {
              top: "8px",
              right: "8px",
              borderTopWidth: "2px",
              borderRightWidth: "2px",
            }
          : position === "bottom-left"
            ? {
                bottom: "8px",
                left: "8px",
                borderBottomWidth: "2px",
                borderLeftWidth: "2px",
              }
            : {
                bottom: "8px",
                right: "8px",
                borderBottomWidth: "2px",
                borderRightWidth: "2px",
              };

    return { ...base, ...extra };
  };

  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <span style={cornerBorders("top-left")} />
      <span style={cornerBorders("top-right")} />
      <span style={cornerBorders("bottom-left")} />
      <span style={cornerBorders("bottom-right")} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   4. AnimatedRadar
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * CSS-only rotating radar sweep built from a `conic-gradient` + `animate-spin`
 * with optional blip dots.
 *
 * @example
 * ```tsx
 * <AnimatedRadar
 *   size={180}
 *   duration={4}
 *   blips={[
 *     { top: "30%", left: "55%", color: "#a6e3a1", size: "8px" },
 *     { top: "65%", left: "25%", color: "#f38ba8" },
 *   ]}
 * />
 * ```
 */
export function AnimatedRadar({
  size = 180,
  duration = 4,
  blips = [],
  className,
}: {
  /** Diameter in pixels. @default 180 */
  size?: number;
  /** Full rotation duration in seconds. @default 4 */
  duration?: number;
  /** Array of blip descriptors. @default [] */
  blips?: RadarBlip[];
  /** Additional CSS class names. */
  className?: string;
}): React.ReactElement {
  const containerStyle = useMemo(
    (): React.CSSProperties => ({
      position: "relative",
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      border: `1px solid ${DEFAULT_ACCENT}44`,
      background: `radial-gradient(circle, ${DEFAULT_ACCENT}0a 0%, ${DEFAULT_BG} 70%)`,
      boxShadow: `0 0 20px ${DEFAULT_ACCENT}22, inset 0 0 30px ${DEFAULT_BG}`,
    }),
    [size],
  );

  /** Concentric ring decorations. */
  const rings = useMemo(() => {
    const count = 3;
    return Array.from({ length: count }, (_, i) => {
      const pct = ((i + 1) / (count + 1)) * 100;
      return (
        <div
          key={`ring-${i}`}
          style={{
            position: "absolute",
            inset: `${pct / 2}%`,
            borderRadius: "50%",
            border: `1px solid ${DEFAULT_ACCENT}18`,
            pointerEvents: "none",
          }}
        />
      );
    });
  }, []);

  /** Crosshair lines (vertical + horizontal). */
  const crosshair = useMemo(
    () => (
      <>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: "1px",
            background: `${DEFAULT_ACCENT}15`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: "1px",
            background: `${DEFAULT_ACCENT}15`,
            pointerEvents: "none",
          }}
        />
      </>
    ),
    [],
  );

  return (
    <div className={className} style={containerStyle}>
      {rings}
      {crosshair}

      {/* Rotating sweep */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, transparent 0deg, ${DEFAULT_ACCENT}66 30deg, transparent 60deg)`,
          animation: `radar-spin ${duration}s linear infinite`,
          pointerEvents: "none",
        }}
      />

      {/* Blips */}
      {blips.map((blip, idx) => (
        <div
          key={`blip-${idx}`}
          style={{
            position: "absolute",
            top: blip.top,
            left: blip.left,
            width: blip.size ?? "6px",
            height: blip.size ?? "6px",
            borderRadius: "50%",
            backgroundColor: blip.color,
            boxShadow: `0 0 ${parseInt(blip.size ?? "6", 10) * 2}px ${blip.color}`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Keyframe injection (scoped to this component) */}
      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   5. TelemetryPanel
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * A collection of status cards, each displaying a label, value, and an
 * animated progress bar.
 *
 * `metrics` entries may use static values or functions that return
 * live-updating values.
 *
 * @example
 * ```tsx
 * <TelemetryPanel
 *   accentColor="#00f0ff"
 *   mutedColor="#6c7086"
 *   metrics={[
 *     { label: "CPU", value: () => cpuLoad(), color: "#00f0ff", percentage: cpuLoad },
 *     { label: "MEM", value: "12.4 GB", color: "#a6e3a1", percentage: 62 },
 *   ]}
 * />
 * ```
 */
export function TelemetryPanel({
  metrics = [],
  accentColor = DEFAULT_ACCENT,
  mutedColor = DEFAULT_MUTED,
  className,
}: {
  /** Array of metric data objects. @default [] */
  metrics?: MetricDatum[];
  /** Accent colour for borders / labels when no metric-specific colour is set. @default '#00f0ff' */
  accentColor?: string;
  /** Muted colour for labels / background tracks. @default '#6c7086' */
  mutedColor?: string;
  /** Additional CSS class names. */
  className?: string;
}): React.ReactElement {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {metrics.map((m, idx) => {
        const barColor = m.color ?? accentColor;
        const displayValue = resolveMetricValue(m.value);
        return (
          <div
            key={`metric-${idx}`}
            style={{
              background: `${mutedColor}12`,
              border: `1px solid ${mutedColor}30`,
              borderRadius: "4px",
              padding: "10px 14px",
              minWidth: "160px",
            }}
          >
            {/* Label row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "6px",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: mutedColor,
                fontFamily: "monospace",
              }}
            >
              <span>{m.label}</span>
              <span style={{ color: barColor, fontWeight: 600 }}>{displayValue}</span>
            </div>

            {/* Progress track */}
            <div
              style={{
                width: "100%",
                height: "4px",
                background: `${mutedColor}30`,
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, m.percentage))}%`,
                  height: "100%",
                  background: barColor,
                  borderRadius: "2px",
                  boxShadow: `0 0 6px ${barColor}`,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   6. LiveClock
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * A real-time digital clock display (HH:MM:SS) that updates every second.
 *
 * @example
 * ```tsx
 * <LiveClock accentColor="#00f0ff" className="text-xl" />
 * ```
 */
export function LiveClock({
  accentColor = DEFAULT_ACCENT,
  mutedColor = DEFAULT_MUTED,
  className,
}: {
  /** Colour of the time digits. @default '#00f0ff' */
  accentColor?: string;
  /** Colour of the label text. @default '#6c7086' */
  mutedColor?: string;
  /** Additional CSS class names. */
  className?: string;
}): React.ReactElement {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map((n) => n.toString().padStart(2, "0"))
          .join(":"),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={className} style={{ fontFamily: "monospace", textAlign: "center" }}>
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: accentColor,
          textShadow: `0 0 10px ${accentColor}88`,
          letterSpacing: "0.15em",
          lineHeight: 1.2,
        }}
      >
        {time}
      </div>
      <div
        style={{
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: mutedColor,
          marginTop: "4px",
        }}
      >
        Local Time
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   7. SystemLog
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * A scrollable log viewer that shows timestamped entries with colour-coded
 * status icons.
 *
 * Accepts an `entries` array that can be updated externally (e.g. from a
 * parent `useState` / reducer) for truly live-updating logs.
 *
 * @example
 * ```tsx
 * const [logs, setLogs] = useState<LogEntry[]>([]);
 * useEffect(() => {
 *   const id = setInterval(() => {
 *     setLogs((prev) => [...prev.slice(-20), { text: `ping ok ${Date.now()}`, status: "info" }]);
 *   }, 1500);
 *   return () => clearInterval(id);
 * }, []);
 * <SystemLog entries={logs} accentColor="#00f0ff" />
 * ```
 */
export function SystemLog({
  entries = [],
  accentColor = DEFAULT_ACCENT,
  successColor = DEFAULT_SUCCESS,
  warningColor = DEFAULT_WARNING,
  infoColor = DEFAULT_INFO,
  mutedColor = DEFAULT_MUTED,
  maxVisible = 8,
  className,
}: {
  /** Array of log entries. Can be updated externally for live feeds. @default [] */
  entries?: LogEntry[];
  /** Accent colour for borders. @default '#00f0ff' */
  accentColor?: string;
  /** Success entry colour. @default '#a6e3a1' */
  successColor?: string;
  /** Warning entry colour. @default '#f9e2af' */
  warningColor?: string;
  /** Info entry colour. @default '#89b4fa' */
  infoColor?: string;
  /** Muted colour for secondary text. @default '#6c7086' */
  mutedColor?: string;
  /** Max entries shown before scrolling. @default 8 */
  maxVisible?: number;
  /** Additional CSS class names. */
  className?: string;
}): React.ReactElement {
  const colors = useMemo(
    () => ({ success: successColor, warning: warningColor, info: infoColor, muted: mutedColor }),
    [successColor, warningColor, infoColor, mutedColor],
  );

  return (
    <div
      className={className}
      style={{
        background: `${mutedColor}0c`,
        border: `1px solid ${mutedColor}25`,
        borderRadius: "4px",
        padding: "10px 12px",
        fontFamily: "monospace",
        fontSize: "11px",
        maxHeight: `${maxVisible * 22}px`,
        overflowY: "auto",
        lineHeight: 1.8,
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: "9px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: mutedColor,
          borderBottom: `1px solid ${mutedColor}25`,
          paddingBottom: "6px",
          marginBottom: "6px",
        }}
      >
        System Log
      </div>

      {entries.length === 0 && (
        <div style={{ color: mutedColor, fontStyle: "italic" }}>
          No entries yet.
        </div>
      )}

      {entries.map((entry, idx) => {
        const entryColor = statusToColor(entry.status, colors);
        const icon = statusToIcon(entry.status);
        return (
          <div key={`log-${idx}`} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            {/* Timestamp */}
            <span style={{ color: mutedColor, flexShrink: 0, fontSize: "10px" }}>
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            {/* Status icon */}
            <span
              style={{ color: entryColor, flexShrink: 0, width: "14px", textAlign: "center" }}
              aria-label={entry.status}
            >
              {icon}
            </span>
            {/* Message */}
            <span style={{ color: accentColor, wordBreak: "break-word" }}>{entry.text}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   8. Composed SciFiHUD
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * A fully-composed Sci-Fi HUD layout combining all seven sub-components into
 * a single, ready-to-use display.
 *
 * **Customisable via props** — every colour, speed, metric, blip, and log
 * entry is configurable; there are no hardcoded brand references.
 *
 * @example
 * ```tsx
 * <SciFiHUD
 *   metrics={[
 *     { label: "CPU", value: () => 42 + Math.random() * 30 | 0, color: "#00f0ff", percentage: 72 },
 *     { label: "MEM", value: "12.4 GB", color: "#a6e3a1", percentage: 62 },
 *   ]}
 *   logEntries={[
 *     { text: "Subspace relay online", status: "success" },
 *     { text: "Flux capacitor warning", status: "warning" },
 *   ]}
 *   radarBlips={[
 *     { top: "30%", left: "55%", color: "#a6e3a1", size: "8px" },
 *     { top: "65%", left: "25%", color: "#f38ba8" },
 *   ]}
 *   accentColor="#00f0ff"
 *   bgColor="#060a14"
 *   gridColor="#00f0ff"
 *   scanSpeed={3000}
 * />
 * ```
 */
export default function SciFiHUD({
  metrics = [],
  logEntries = [],
  radarBlips = [],
  accentColor = DEFAULT_ACCENT,
  bgColor = DEFAULT_BG,
  gridColor = DEFAULT_ACCENT,
  scanSpeed = 3000,
  successColor = DEFAULT_SUCCESS,
  warningColor = DEFAULT_WARNING,
  infoColor = DEFAULT_INFO,
  mutedColor = DEFAULT_MUTED,
  className,
}: {
  /** Metric data for the telemetry panel. @default [] */
  metrics?: MetricDatum[];
  /** Log entries for the system log viewer. @default [] */
  logEntries?: LogEntry[];
  /** Radar blip descriptors. @default [] */
  radarBlips?: RadarBlip[];
  /** Primary accent colour. @default '#00f0ff' */
  accentColor?: string;
  /** Background colour of the overall HUD frame. @default '#060a14' */
  bgColor?: string;
  /** Grid overlay line colour. @default '#00f0ff' */
  gridColor?: string;
  /** Scan-line sweep speed in ms. @default 3000 */
  scanSpeed?: number;
  /** Success colour. @default '#a6e3a1' */
  successColor?: string;
  /** Warning colour. @default '#f9e2af' */
  warningColor?: string;
  /** Info colour. @default '#89b4fa' */
  infoColor?: string;
  /** Muted colour. @default '#6c7086' */
  mutedColor?: string;
  /** Additional CSS class names for the outermost wrapper. */
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: bgColor,
        color: accentColor,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background layers */}
      <GridOverlay color={gridColor} opacity={0.06} size="40px" />
      <ScanLine color={accentColor} speed={scanSpeed} opacity={0.35} />
      <HUDCornerAccents color={accentColor} size="28px" />

      {/* Layout grid */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          display: "grid",
          gridTemplateColumns: "280px 1fr 280px",
          gridTemplateRows: "auto 1fr auto",
          gap: "20px",
          padding: "40px",
          minHeight: "100vh",
          alignItems: "start",
        }}
      >
        {/* ── Top bar: clock + title ── */}
        <header
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${mutedColor}20`,
            paddingBottom: "14px",
          }}
        >
          <div style={{ fontFamily: "monospace", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", color: mutedColor }}>
            HUD ACTIVE
          </div>
          <LiveClock accentColor={accentColor} mutedColor={mutedColor} />
        </header>

        {/* ── Left column: telemetry ── */}
        <section>
          <TelemetryPanel
            metrics={metrics}
            accentColor={accentColor}
            mutedColor={mutedColor}
          />
        </section>

        {/* ── Centre column: radar ── */}
        <section
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AnimatedRadar blips={radarBlips} />
        </section>

        {/* ── Right column: system log ── */}
        <section>
          <SystemLog
            entries={logEntries}
            accentColor={accentColor}
            successColor={successColor}
            warningColor={warningColor}
            infoColor={infoColor}
            mutedColor={mutedColor}
          />
        </section>

        {/* ── Bottom bar ── */}
        <footer
          style={{
            gridColumn: "1 / -1",
            borderTop: `1px solid ${mutedColor}20`,
            paddingTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: "10px",
            color: mutedColor,
            letterSpacing: "0.06em",
          }}
        >
          <span>STATUS: NOMINAL</span>
          <span>UPTIME: {Math.floor(performance.now() / 1000)}s</span>
        </footer>
      </div>

      {/* Scoped keyframes (shared by sub-components) */}
      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
