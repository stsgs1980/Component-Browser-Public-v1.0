/**
 * @file RetroTerminal.tsx
 * @description
 * A fully self-contained, reusable React component that emulates a classic
 * CRT terminal with boot-sequence animation, interactive command input,
 * and authentic phosphor-screen visual effects (scanlines, vignette, glow).
 *
 * ── FEATURES ───────────────────────────────────────────────────────────────
 * • Timed, line-by-line boot sequence (BIOS POST → system banner → prompt)
 * • Interactive command input with a built-in command registry
 * • CRT visual effects:
 *     - Amber phosphor text-shadow glow
 *     - Scanline overlay (repeating-linear-gradient)
 *     - Vignette (radial-gradient)
 *     - Blinking block cursor
 * • Auto-scrolls to bottom whenever new content is rendered
 * • Monospace-only font with ligatures explicitly disabled
 * • Fully configurable via props — zero external dependencies
 *
 * ── USAGE ──────────────────────────────────────────────────────────────────
 * ```tsx
 * import RetroTerminal from './001_RetroTerminal';
 *
 * <RetroTerminal
 *   accentColor="#00ff41"
 *   bgColor="#0d0208"
 *   headerTitle="NUKE TERMINAL"
 *   promptPrefix="root@nuke:~#"
 *   bootLines={myCustomBootSequence}
 *   commands={myCustomCommands}
 *   onCommand={(cmd, args) => console.log(cmd, args)}
 * />
 * ```
 *
 * ── REQUIRED CSS ───────────────────────────────────────────────────────────
 * The component relies on a `blink` keyframe animation for the cursor.
 * Either add this to your global stylesheet, or inject it via a `<style>`
 * tag in your app's `<head>`:
 *
 * ```css
 * @keyframes retro-term-blink {
 *   0%, 49% { opacity: 1; }
 *   50%, 100% { opacity: 0; }
 * }
 * ```
 * The component references the animation name `retro-term-blink` in its
 * inline styles so that it never collides with other `blink` definitions.
 *
 * ── PROPS ──────────────────────────────────────────────────────────────────
 * @see RetroTerminalProps
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────────── */

/** A single line rendered during the boot sequence. */
export interface BootLine {
  /** The text content to display. */
  text: string;
  /** Milliseconds to wait before this line appears. */
  delay: number;
  /** If true, the line is rendered in the prompt colour (e.g. a hint). */
  isPrompt?: boolean;
}

/** Props accepted by the {@link RetroTerminal} component. */
export interface RetroTerminalProps {
  /**
   * Lines rendered sequentially during the boot sequence.
   * Each line has `text`, `delay` (ms), and optional `isPrompt`.
   * @default Generic BIOS POST → system banner → help hint
   */
  bootLines?: BootLine[];

  /**
   * Command registry mapping command names to arrays of output lines.
   * Unknown commands receive a "Command not recognized" error.
   * @default help, sysinfo, ls, ver, whoami, cls, echo, matrix
   */
  commands?: Record<string, string[]>;

  /** Colour of normal terminal text and accents. @default '#f0c020' (amber) */
  accentColor?: string;

  /** Colour used for error messages. @default '#ff6666' */
  errorColor?: string;

  /** Colour of the input prompt prefix and boot hints. @default '#ffe066' */
  promptColor?: string;

  /** Background colour of the terminal body. @default '#0a0800' */
  bgColor?: string;

  /** Title rendered in the terminal header bar. @default 'TERMINAL' */
  headerTitle?: string;

  /** Maximum height of the scrollable terminal body. @default '420px' */
  maxHeight?: string;

  /** Whether to render the CRT scanline overlay. @default true */
  showScanlines?: boolean;

  /** Whether to render the CRT vignette overlay. @default true */
  showVignette?: boolean;

  /** Additional CSS class(es) applied to the outermost wrapper. @default '' */
  className?: string;

  /** Prompt prefix shown before the blinking cursor. @default 'C:\\>' */
  promptPrefix?: string;

  /**
   * Optional callback invoked every time the user submits a command.
   * Receives the parsed command name and the raw argument string.
   */
  onCommand?: (cmd: string, args: string) => void;
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULT_BOOT_LINES: BootLine[] = [
  { text: 'Phoenix BIOS v4.06 (C) 1999 Phoenix Technologies', delay: 0 },
  { text: 'CPU: Intel Pentium III 500MHz', delay: 200 },
  { text: 'Memory Test: 65536K OK', delay: 350 },
  { text: '', delay: 150 },
  { text: 'Loading System...', delay: 300 },
  { text: '\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 100%', delay: 600 },
  { text: '', delay: 150 },
  {
    text: '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
    delay: 0,
  },
  {
    text: '\u2551     TERMINAL  SYSTEM  v1.0                    \u2551',
    delay: 100,
  },
  {
    text: '\u2551     (c) 1999                                  \u2551',
    delay: 100,
  },
  {
    text: '\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D',
    delay: 100,
  },
  { text: '', delay: 200 },
  { text: 'Type "help" for available commands.', delay: 300, isPrompt: true },
];

const DEFAULT_COMMANDS: Record<string, string[]> = {
  help: [
    'Available commands:',
    '  help     - Show this help message',
    '  sysinfo  - Display system information',
    '  ls       - List directory contents',
    '  ver      - Show version information',
    '  whoami   - Display current user',
    '  cls      - Clear the terminal screen',
    '  echo     - Echo text back to terminal',
    '  matrix   - Display matrix rain effect',
  ],
  sysinfo: [
    'System Information',
    '─────────────────────',
    'OS      : RetroOS v1.0',
    'Kernel  : 2.2.14-5.0',
    'CPU     : Intel Pentium III 500MHz',
    'Memory  : 64 MB',
    'Storage : 4.3 GB IDE',
    'Display : 1024x768 @ 60Hz',
    'Uptime  : 0d 3h 42m 18s',
  ],
  ls: [
    'drwxr-xr-x  2 root root  4096 Jan 01 00:00 bin',
    'drwxr-xr-x  3 root root  4096 Jan 01 00:00 etc',
    'drwxr-xr-x  2 root root  4096 Jan 01 00:00 home',
    '-rw-r--r--  1 root root   512 Jan 01 00:00 readme.txt',
    'drwxr-xr-x  2 root root  4096 Jan 01 00:00 tmp',
    'drwxr-xr-x  4 root root  4096 Jan 01 00:00 usr',
    '-rwxr-xr-x  1 root root  8192 Jan 01 00:00 run.sh',
  ],
  ver: [
    'TERMINAL SYSTEM v1.0.0',
    'Build: 1999-12-31',
    'Kernel: 2.2.14-5.0',
  ],
  whoami: ['guest'],
  cls: [], // handled specially — clears the screen
  echo: [], // handled specially — echoes remaining text
  matrix: [
    '01001111 01101110 01100101',
    '10110100 11010010 01100011',
    '01100001 01010110 11101000',
    '11001010 01011001 10110101',
    '00110101 11010010 01001011',
    '11110010 01001001 10110100',
    '01001110 10100110 01101001',
    '10100101 01010011 11010010',
  ],
};

/* ─── Internal types ─────────────────────────────────────────────────────── */

/** A rendered line in the terminal history. */
interface TerminalLine {
  id: number;
  text: string;
  isError?: boolean;
  isPrompt?: boolean;
  isInput?: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * RetroTerminal — A configurable CRT terminal emulator component.
 *
 * Renders an animated boot sequence followed by an interactive command-line
 * interface with authentic CRT visual effects (phosphor glow, scanlines,
 * vignette, blinking cursor).
 *
 * @param props - {@link RetroTerminalProps}
 * @returns The rendered terminal DOM tree.
 */
export const RetroTerminal: React.FC<RetroTerminalProps> = (props) => {
  const {
    bootLines = DEFAULT_BOOT_LINES,
    commands = DEFAULT_COMMANDS,
    accentColor = '#f0c020',
    errorColor = '#ff6666',
    promptColor = '#ffe066',
    bgColor = '#0a0800',
    headerTitle = 'TERMINAL',
    maxHeight = '420px',
    showScanlines = true,
    showVignette = true,
    className = '',
    promptPrefix = 'C:\\>',
    onCommand,
  } = props;

  /* ── State ───────────────────────────────────────────────────────────── */

  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [booted, setBooted] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const lineIdCounter = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  /** Generate the next unique line id. */
  const nextId = useCallback((): number => {
    lineIdCounter.current += 1;
    return lineIdCounter.current;
  }, []);

  /** Append one or more lines to the terminal history and auto-scroll. */
  const pushLines = useCallback(
    (newLines: { text: string; isError?: boolean; isPrompt?: boolean; isInput?: boolean }[]) => {
      setLines((prev) => [
        ...prev,
        ...newLines.map((l) => ({ id: nextId(), ...l })),
      ]);
    },
    [nextId],
  );

  /** Scroll the terminal body to the very bottom. */
  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, []);

  /* ── Boot sequence ───────────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;
    let cumulativeDelay = 0;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    bootLines.forEach((line) => {
      cumulativeDelay += line.delay;
      const tid = setTimeout(() => {
        if (cancelled) return;
        setLines((prev) => [
          ...prev,
          { id: nextId(), text: line.text, isPrompt: !!line.isPrompt },
        ]);
      }, cumulativeDelay);
      timeouts.push(tid);
    });

    // Mark boot as complete after all lines have been rendered
    const bootDone = setTimeout(() => {
      if (!cancelled) setBooted(true);
    }, cumulativeDelay + 200);
    timeouts.push(bootDone);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — run once on mount

  /* ── Auto-scroll on new lines ────────────────────────────────────────── */

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  /* ── Focus input when boot finishes ──────────────────────────────────── */

  useEffect(() => {
    if (booted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [booted]);

  /* ── Command handler ─────────────────────────────────────────────────── */

  const handleCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === '') return;

      // Echo the user's input line
      pushLines([{ text: `${promptPrefix} ${trimmed}`, isInput: true }]);

      const spaceIdx = trimmed.indexOf(' ');
      const cmd = spaceIdx === -1 ? trimmed.toLowerCase() : trimmed.substring(0, spaceIdx).toLowerCase();
      const args = spaceIdx === -1 ? '' : trimmed.substring(spaceIdx + 1).trim();

      // Fire the external callback regardless
      onCommand?.(cmd, args);

      // Special-case: cls (clear screen)
      if (cmd === 'cls') {
        setLines([]);
        return;
      }

      // Special-case: echo
      if (cmd === 'echo') {
        pushLines([{ text: args }]);
        return;
      }

      // Look up command in registry
      const output = commands[cmd];
      if (output) {
        if (output.length > 0) {
          pushLines(output.map((text) => ({ text })));
        }
      } else {
        pushLines([{ text: `'${cmd}' is not recognized as a command. Type "help" for available commands.`, isError: true }]);
      }
    },
    [commands, promptPrefix, pushLines, onCommand],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCommand(inputValue);
        setInputValue('');
      }
    },
    [handleCommand, inputValue],
  );

  /* ── Styles ──────────────────────────────────────────────────────────── */

  const outerStyle: React.CSSProperties = {
    fontFamily: "'Courier New', Courier, monospace",
    fontVariantLigatures: 'none',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `2px solid ${accentColor}44`,
    boxShadow: `0 0 12px ${accentColor}22, inset 0 0 40px ${bgColor}`,
    width: '100%',
    maxWidth: '720px',
  };

  const headerStyle: React.CSSProperties = {
    background: `linear-gradient(180deg, ${accentColor}33, ${accentColor}11)`,
    borderBottom: `1px solid ${accentColor}44`,
    padding: '6px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    userSelect: 'none',
  };

  const dotStyle = (color: string): React.CSSProperties => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: color,
    display: 'inline-block',
    flexShrink: 0,
  });

  const headerTitleStyle: React.CSSProperties = {
    color: accentColor,
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    textShadow: `0 0 6px ${accentColor}88`,
    marginLeft: '8px',
  };

  const bodyStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    padding: '12px 14px',
    maxHeight,
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
    fontSize: '13px',
    lineHeight: '1.5',
    color: accentColor,
    textShadow: `0 0 4px ${accentColor}66, 0 0 2px ${accentColor}44`,
    scrollbarWidth: 'thin',
    scrollbarColor: `${accentColor}44 ${bgColor}`,
  };

  const lineStyle = (line: TerminalLine): React.CSSProperties => ({
    color: line.isError ? errorColor : line.isPrompt ? promptColor : accentColor,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
    textShadow: line.isError
      ? `0 0 6px ${errorColor}66`
      : `0 0 4px ${accentColor}66, 0 0 2px ${accentColor}44`,
    opacity: line.isInput ? 0.8 : 1,
  });

  const scanlineOverlay: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
    zIndex: 1,
  };

  const vignetteOverlay: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)',
    zIndex: 1,
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginTop: '4px',
    flexWrap: 'wrap',
  };

  const promptLabelStyle: React.CSSProperties = {
    color: promptColor,
    textShadow: `0 0 6px ${promptColor}66`,
    whiteSpace: 'pre' as const,
    fontSize: '13px',
    lineHeight: '1.5',
    userSelect: 'none',
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: accentColor,
    fontFamily: 'inherit',
    fontVariantLigatures: 'none',
    fontSize: '13px',
    lineHeight: '1.5',
    caretColor: 'transparent',
    flex: '1',
    minWidth: '60px',
    padding: 0,
    textShadow: `0 0 4px ${accentColor}66, 0 0 2px ${accentColor}44`,
  };

  const cursorStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '8px',
    height: '14px',
    backgroundColor: accentColor,
    boxShadow: `0 0 4px ${accentColor}88`,
    animation: 'retro-term-blink 1s step-end infinite',
    verticalAlign: 'text-bottom',
    flexShrink: 0,
  };

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div style={outerStyle} className={className}>
      {/* Header bar */}
      <div style={headerStyle}>
        <span style={dotStyle('#ff5f57')} />
        <span style={dotStyle('#febc2e')} />
        <span style={dotStyle('#28c840')} />
        <span style={headerTitleStyle}>{headerTitle}</span>
      </div>

      {/* Scrollable body */}
      <div style={bodyStyle} ref={bodyRef} onClick={() => inputRef.current?.focus()}>
        {/* Scanline overlay */}
        {showScanlines && <div style={scanlineOverlay} aria-hidden="true" />}

        {/* Vignette overlay */}
        {showVignette && <div style={vignetteOverlay} aria-hidden="true" />}

        {/* Terminal line history */}
        {lines.map((line) => (
          <div key={line.id} style={lineStyle(line)}>
            {line.text}
          </div>
        ))}

        {/* Input row (only visible after boot completes) */}
        {booted && (
          <div style={inputRowStyle}>
            <span style={promptLabelStyle}>{promptPrefix} </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Terminal command input"
            />
            <span style={cursorStyle} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RetroTerminal;
