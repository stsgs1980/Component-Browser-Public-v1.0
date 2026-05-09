/**
 * @file 007_CliBlock.tsx
 * @description
 * A fully self-contained, reusable React component that renders a static
 * CLI / Terminal block with a Catppuccin Mocha theme. Displays pre-defined
 * terminal lines with colored prompts, commands, and outputs — complete with
 * macOS-style traffic light dots, a title bar, and a blinking block cursor.
 *
 * ── FEATURES ───────────────────────────────────────────────────────────────
 * • macOS-style window chrome (red / yellow / green traffic light dots)
 * • Configurable title bar (defaults to "user@host:~")
 * • Per-line prompt, command, and output rendering with independent colours
 * • isError flag per line to switch output into the theme's red accent
 * • Animated blinking block cursor at the bottom (driven by useState, not
 *   external CSS keyframes — no side-effects or <style> tag required)
 * • Fully themeable via a CliTheme object (Catppuccin Mocha shipped as
 *   the default export `CLI_CATPPUCCIN_MOCHA`)
 * • Zero external dependencies — pure React + inline styles
 *
 * ── USAGE ──────────────────────────────────────────────────────────────────
 * ```tsx
 * import { CliBlock, CLI_CATPPUCCIN_MOCHA } from './007_CliBlock';
 *
 * <CliBlock
 *   title="mochi@nixos:~/projects"
 *   lines={[
 *     { prompt: 'mochi@nixos:~/projects$ ', command: 'ls -la', commandColor: '#cba6f7' },
 *     { output: 'drwxr-xr-x  5 mochi users 4096 Jun 14 09:30 .' },
 *     { output: '-rw-r--r--  1 mochi users  220 Jun 14 09:30 .gitignore' },
 *     { prompt: 'mochi@nixos:~/projects$ ', command: 'cat README.md', commandColor: '#89b4fa' },
 *     { output: '# My Project', outputColor: '#f9e2af' },
 *     { prompt: 'mochi@nixos:~/projects$ ', command: 'exit 1', isError: true },
 *     { output: 'Error: something went wrong', isError: true },
 *   ]}
 *   theme={CLI_CATPPUCCIN_MOCHA}
 *   showCursor
 * />
 * ```
 *
 * ── PROPS ──────────────────────────────────────────────────────────────────
 * @see CliBlockProps
 */

import React, { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
 * Types
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A single terminal line to display inside the {@link CliBlock}.
 *
 * @example
 * ```ts
 * // A command line
 * { prompt: 'user@host:~$ ', command: 'npm run build', commandColor: '#89b4fa' }
 *
 * // An output line
 * { output: 'Build completed in 2.3s', outputColor: '#a6e3a1' }
 *
 * // An error line
 * { output: 'ERR! Missing dependency', isError: true }
 * ```
 */
export interface CliLine {
  /**
   * The prompt string displayed before the command (e.g. `'user@host:~$ '`).
   * Rendered in the theme's `green` colour by default.
   */
  prompt?: string;

  /**
   * The command text (e.g. `'npm install'`).
   * Rendered after the prompt. Use `commandColor` to override the default
   * theme `text` colour.
   */
  command?: string;

  /**
   * Custom colour for the command text.
   * @default theme.text (`#cdd6f4` in Catppuccin Mocha)
   */
  commandColor?: string;

  /**
   * Output text displayed on the line (no prompt).
   * Rendered in the theme's `overlay` colour by default, or `red` when
   * `isError` is `true`.
   */
  output?: string;

  /**
   * Custom colour for the output text.
   * @default theme.overlay (`#6c7086` in Catppuccin Mocha)
   */
  outputColor?: string;

  /**
   * If `true`, the output (and the command prompt `$` if present) is
   * rendered using the theme's `red` colour, signalling an error.
   * @default false
   */
  isError?: boolean;
}

/**
 * Colour palette used to theme the {@link CliBlock}.
 *
 * Every field is a CSS colour string (hex, rgb, hsl, etc.).
 */
export interface CliTheme {
  /** Deepest background — terminal body. */
  base: string;

  /** Slightly darker background — title bar. */
  mantle: string;

  /** Primary text colour. */
  text: string;

  /** Muted / secondary text colour (default output colour). */
  overlay: string;

  /** Accent green — used for the prompt. */
  green: string;

  /** Accent blue — commonly used for command colour overrides. */
  blue: string;

  /** Accent red — used for error lines. */
  red: string;

  /** Accent yellow — used for warnings or highlights. */
  yellow: string;

  /** Surface colour for hover / subtle highlights. */
  surface: string;
}

/**
 * Props accepted by the {@link CliBlock} component.
 */
export interface CliBlockProps {
  /**
   * Array of {@link CliLine} objects to render inside the terminal.
   * Lines are displayed top-to-bottom in order.
   */
  lines: CliLine[];

  /**
   * Title text shown in the window chrome / title bar.
   * Typically in the form `"user@host:~/path"`.
   * @default `'user@host:~'`
   */
  title?: string;

  /**
   * Theme colour palette.
   * @default {@link CLI_CATPPUCCIN_MOCHA}
   */
  theme?: CliTheme;

  /**
   * Whether to render a blinking block cursor after the last line.
   * The blink is driven by `useState` + `setInterval` — no external
   * CSS keyframes required.
   * @default true
   */
  showCursor?: boolean;

  /**
   * Speed of the cursor blink cycle in milliseconds.
   * The cursor alternates between visible and hidden every
   * `cursorBlinkSpeed` ms.
   * @default 530
   */
  cursorBlinkSpeed?: number;

  /**
   * Additional CSS class(es) applied to the outermost wrapper `<div>`.
   * Useful for positioning, sizing, or layout overrides.
   * @default ''
   */
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Default Theme — Catppuccin Mocha
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The [Catppuccin Mocha](https://catppuccin.com/palette/mocha/) colour
 * palette, ready to pass as the `theme` prop to {@link CliBlock}.
 *
 * | Token     | Hex       | Usage                        |
 * |-----------|-----------|------------------------------|
 * | `base`    | `#1e1e2e` | Terminal body background     |
 * | `mantle`  | `#181825` | Title bar background        |
 * | `surface` | `#313244` | Subtle highlights            |
 * | `overlay` | `#6c7086` | Default output text          |
 * | `text`    | `#cdd6f4` | Primary / command text       |
 * | `green`   | `#a6e3a1` | Prompt `$` indicator         |
 * | `blue`    | `#89b4fa` | Accent blue                  |
 * | `red`     | `#f38ba8` | Error text                   |
 * | `yellow`  | `#f9e2af` | Warning / highlight text     |
 */
export const CLI_CATPPUCCIN_MOCHA: CliTheme = {
  base: '#1e1e2e',
  mantle: '#181825',
  text: '#cdd6f4',
  overlay: '#6c7086',
  green: '#a6e3a1',
  blue: '#89b4fa',
  red: '#f38ba8',
  yellow: '#f9e2af',
  surface: '#313244',
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Component
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * CliBlock — A static, themed terminal display component.
 *
 * Renders a macOS-style terminal window containing pre-defined CLI lines
 * with coloured prompts, commands, and outputs. Not interactive — purely
 * visual.
 *
 * The blinking cursor is driven by React's `useState` + `setInterval`
 * so that **no external CSS keyframes or `<style>` tags** are needed.
 * The interval is cleaned up on unmount via `useEffect`.
 *
 * @param props - {@link CliBlockProps}
 * @returns The rendered terminal DOM tree.
 *
 * @example
 * ```tsx
 * import CliBlock from './007_CliBlock';
 *
 * <CliBlock
 *   title="dev@macbook:~/src/my-app"
 *   lines={[
 *     { prompt: 'dev@macbook:~/src/my-app$ ', command: 'npm test' },
 *     { output: 'Tests: 42 passed, 0 failed' },
 *   ]}
 * />
 * ```
 */
export const CliBlock: React.FC<CliBlockProps> = ({
  lines,
  title = 'user@host:~',
  theme = CLI_CATPPUCCIN_MOCHA,
  showCursor = true,
  cursorBlinkSpeed = 530,
  className = '',
}) => {
  /* ── Cursor blink state ─────────────────────────────────────────────── */

  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!showCursor) return;

    const id = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(id);
  }, [showCursor, cursorBlinkSpeed]);

  /* ── Styles ──────────────────────────────────────────────────────────── */

  /** Outermost wrapper — sets the bounding box. */
  const wrapperStyle: React.CSSProperties = {
    fontFamily:
      "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace",
    fontVariantLigatures: 'none',
    borderRadius: '10px',
    overflow: 'hidden',
    border: `1px solid ${theme.surface}`,
    width: '100%',
    maxWidth: '680px',
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)`,
  };

  /** macOS-style title bar. */
  const titleBarStyle: React.CSSProperties = {
    backgroundColor: theme.mantle,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: `1px solid ${theme.surface}`,
    userSelect: 'none',
  };

  /** A single traffic-light dot. */
  const dotStyle = (color: string): React.CSSProperties => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
  });

  /** Title text inside the title bar. */
  const titleTextStyle: React.CSSProperties = {
    color: theme.overlay,
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.02em',
    marginLeft: '8px',
    flex: 1,
    textAlign: 'center' as const,
    // Pull centre text back so it truly centres between the dots
    marginRight: '52px',
  };

  /** Terminal body — scrollable content area. */
  const bodyStyle: React.CSSProperties = {
    backgroundColor: theme.base,
    padding: '16px 18px',
    minHeight: '80px',
    fontSize: '14px',
    lineHeight: '1.65',
    color: theme.text,
  };

  /** A single terminal output row (the `<div>` wrapping each line). */
  const lineRowStyle: React.CSSProperties = {
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
    lineHeight: '1.65',
    fontSize: '14px',
  };

  /** Blinking block cursor. */
  const cursorStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '8px',
    height: '16px',
    backgroundColor: theme.text,
    verticalAlign: 'text-bottom',
    marginLeft: '2px',
    opacity: cursorVisible ? 1 : 0,
    transition: 'opacity 0.05s step-end',
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  /**
   * Resolves the effective colour for a line's command segment.
   * Priority: `commandColor` prop → `theme.text`.
   */
  const resolveCommandColor = (line: CliLine): string => {
    if (line.isError) return theme.red;
    return line.commandColor ?? theme.text;
  };

  /**
   * Resolves the effective colour for a line's output segment.
   * Priority: `outputColor` prop → `isError ? theme.red` → `theme.overlay`.
   */
  const resolveOutputColor = (line: CliLine): string => {
    if (line.outputColor) return line.outputColor;
    if (line.isError) return theme.red;
    return theme.overlay;
  };

  /**
   * Resolves the effective colour for the prompt segment.
   * Shows `theme.green` by default, or `theme.red` for error lines.
   */
  const resolvePromptColor = (line: CliLine): string => {
    if (line.isError) return theme.red;
    return theme.green;
  };

  /* ── Render a single CliLine ─────────────────────────────────────────── */

  const renderLine = (line: CliLine, index: number): React.ReactNode => {
    const key = `cli-line-${index}`;

    // If the line has a prompt and/or command, render them together on one row.
    const hasPrompt = Boolean(line.prompt);
    const hasCommand = Boolean(line.command);
    const hasOutput = Boolean(line.output);

    if (hasPrompt || hasCommand) {
      return (
        <div key={key} style={lineRowStyle}>
          {hasPrompt && (
            <span style={{ color: resolvePromptColor(line), fontWeight: 600 }}>
              {line.prompt}
            </span>
          )}
          {hasCommand && (
            <span style={{ color: resolveCommandColor(line) }}>
              {line.command}
            </span>
          )}
        </div>
      );
    }

    // Output-only line (may span multiple visual rows if it contains \n).
    if (hasOutput) {
      return (
        <div key={key} style={lineRowStyle}>
          <span style={{ color: resolveOutputColor(line) }}>{line.output}</span>
        </div>
      );
    }

    // Blank line — render an empty div to preserve spacing.
    return <div key={key} style={lineRowStyle}>&nbsp;</div>;
  };

  /* ── Main render ─────────────────────────────────────────────────────── */

  return (
    <div style={wrapperStyle} className={className}>
      {/* ── macOS-style title bar ────────────────────────────────────── */}
      <div style={titleBarStyle}>
        {/* Traffic light dots — left aligned */}
        <span style={dotStyle(theme.red)} aria-hidden="true" />
        <span style={dotStyle(theme.yellow)} aria-hidden="true" />
        <span style={dotStyle(theme.green)} aria-hidden="true" />

        {/* Centred title text */}
        <span style={titleTextStyle}>{title}</span>
      </div>

      {/* ── Terminal body ────────────────────────────────────────────── */}
      <div style={bodyStyle} role="presentation">
        {lines.map((line, idx) => renderLine(line, idx))}

        {/* Blinking cursor */}
        {showCursor && (
          <span style={cursorStyle} aria-hidden="true" />
        )}
      </div>
    </div>
  );
};

export default CliBlock;
