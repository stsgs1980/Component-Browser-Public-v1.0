/**
 * @file 006_IdeLayout.tsx
 * @description
 * Reusable Catppuccin Mocha–themed IDE layout component suite.
 *
 * Provides a 3-panel layout (sidebar file tree | code editor | status bar)
 * with macOS-style window controls, an interactive file explorer, an embedded
 * terminal with blinking cursor, and a context-aware status bar.
 *
 * ---
 * ### CSS `@keyframes blink`
 * The embedded terminal uses a blinking-cursor animation. If you consume this
 * component in a project that **strips inline `<style>` tags** (e.g. certain
 * SSR / CSP setups), you must provide the keyframe yourself:
 *
 * ```css
 * @keyframes ide-cursor-blink {
 *   0%, 100% { opacity: 1; }
 *   50%      { opacity: 0; }
 * }
 * ```
 * The inline `<style>` block is only injected **once** (via a module-level
 * flag) so there is no performance penalty.
 * ---
 *
 * @example Quick start
 * ```tsx
 * import { IdeLayout, CATPPUCCIN_MOCHA } from './006_IdeLayout';
 *
 * const files = [
 *   { name: 'src', icon: '📁', children: [
 *     { name: 'App.tsx', icon: '⚛️', content: 'export default function App() {\n  return <h1>Hello</h1>;\n}' },
 *   ]},
 *   { name: 'package.json', icon: '📄', content: '{ "name": "my-app" }' },
 * ];
 *
 * <IdeLayout files={files} height={520} theme={CATPPUCCIN_MOCHA} showTerminal />
 * ```
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/** A single file or folder entry in the file tree. */
export interface IdeFile {
  /** Display name (e.g. "src", "App.tsx"). */
  name: string;
  /** Optional icon / emoji shown next to the name. Falls back to defaults. */
  icon?: string;
  /** Optional source content rendered in the editor panel when selected. */
  content?: string;
  /** Nested children turn this entry into a collapsible folder. */
  children?: IdeFile[];
  /** Language hint for syntax highlighting (e.g. "typescript", "json"). */
  language?: string;
}

/** Catppuccin-inspired colour palette used by every sub-component. */
export interface IdeTheme {
  /** Deepest background   */ base: string;     // '#1e1e2e'
  /** Panel background     */ mantle: string;   // '#181825'
  /** Darkest background   */ crust: string;    // '#11111b'
  /** Primary text colour  */ text: string;     // '#cdd6f4'
  /** Muted text colour    */ subtext: string;  // '#a6adc8'
  /** Dimmed / overlay     */ overlay: string;  // '#6c7086'
  /** Accent – blue        */ blue: string;     // '#89b4fa'
  /** Accent – green       */ green: string;    // '#a6e3a1'
  /** Accent – red         */ red: string;      // '#f38ba8'
  /** Accent – yellow      */ yellow: string;   // '#f9e2af'
  /** Accent – mauve       */ mauve: string;    // '#cba6f7'
  /** Translucent surface  */ surface: string;  // 'rgba(255,255,255,0.06)'
}

/** Options for `StatusBar`. */
export interface StatusBarProps {
  /** Editor language / mode label shown on the right (e.g. "TypeScript"). */
  mode?: string;
  /** File encoding label (e.g. "UTF-8"). */
  encoding?: string;
  /** Indentation style label (e.g. "Spaces: 2"). */
  indent?: string;
  /** Arbitrary trailing info segment. */
  extraInfo?: string;
  /** Active colour palette. */
  theme?: IdeTheme;
  /** Additional CSS class applied to the root `<div>`. */
  className?: string;
}

/** Options for `EmbeddedTerminal`. */
export interface EmbeddedTerminalProps {
  /** Array of terminal line strings to render. */
  lines?: string[];
  /** Active colour palette. */
  theme?: IdeTheme;
  /** Additional CSS class applied to the root `<div>`. */
  className?: string;
}

/** Options for `TrafficLightDots`. */
export interface TrafficLightDotsProps {
  /** Diameter in px (default 12). */
  size?: number;
  /** Additional CSS class. */
  className?: string;
}

/** Options for `FileTree`. */
export interface FileTreeProps {
  /** Flat or nested file entries. */
  files: IdeFile[];
  /** Currently selected file name (matched by `file.name`). */
  activeFile?: string | null;
  /** Callback when a file row is clicked. */
  onSelectFile?: (file: IdeFile) => void;
  /** Active colour palette. */
  theme?: IdeTheme;
  /** Additional CSS class. */
  className?: string;
}

/** Options for the top-level `IdeLayout`. */
export interface IdeLayoutProps {
  /** File entries to display in the sidebar & editor. */
  files?: IdeFile[];
  /** Fixed pixel height for the outer container (default 480). */
  height?: number;
  /** Colour palette (defaults to Catppuccin Mocha). */
  theme?: IdeTheme;
  /** Whether to show the embedded terminal in the sidebar. */
  showTerminal?: boolean;
  /** Title rendered in the editor tab / title bar area. */
  editorTitle?: string;
  /** Additional CSS class on the outermost wrapper. */
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEFAULT THEME
   ═══════════════════════════════════════════════════════════════════════════ */

/** Catppuccin Mocha – the default dark theme shipped with every component. */
export const CATPPUCCIN_MOCHA: IdeTheme = {
  base:     '#1e1e2e',
  mantle:   '#181825',
  crust:    '#11111b',
  text:     '#cdd6f4',
  subtext:  '#a6adc8',
  overlay:  '#6c7086',
  blue:     '#89b4fa',
  green:    '#a6e3a1',
  red:      '#f38ba8',
  yellow:   '#f9e2af',
  mauve:    '#cba6f7',
  surface:  'rgba(255,255,255,0.06)',
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Attempt a dynamic `import('react-syntax-highlighter')` and fall back to
 * `null` when the package is not installed. This keeps the component tree
 * fully functional without any syntax-highlighting dependency.
 */
async function tryImportSyntaxHighlighter(): Promise<unknown | null> {
  try {
    const mod = await import('react-syntax-highlighter');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (mod as any).Prism ?? (mod as any).Light ?? mod.default ?? null;
  } catch {
    return null;
  }
}

/** Default file icon lookup based on extension. */
function defaultFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts:   '🔷', tsx:  '⚛️', js:   '📜', jsx:  '⚛️',
    json: '📋', md:   '📝', css:  '🎨', scss: '🎨',
    html: '🌐', py:   '🐍', rs:   '🦀', go:   '🐹',
    yml:  '⚙️', yaml: '⚙️', toml: '⚙️', svg:  '🖼️',
    png:  '🖼️', jpg:  '🖼️', gif:  '🖼️',
  };
  if (map[ext]) return map[ext];
  // folder heuristic
  if (!ext || !name.includes('.')) return '📁';
  return '📄';
}

/** Detect language from file extension for syntax highlighter. */
function detectLanguage(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const langMap: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
    json: 'json', md: 'markdown', css: 'css', scss: 'scss',
    html: 'html', py: 'python', rs: 'rust', go: 'go',
    yml: 'yaml', yaml: 'yaml', toml: 'toml', sh: 'bash',
    bash: 'bash', sql: 'sql', graphql: 'graphql',
  };
  return langMap[ext] ?? 'text';
}

/** Flatten a nested IdeFile tree into a flat list (depth-first). */
function flattenFiles(files: IdeFile[]): IdeFile[] {
  const result: IdeFile[] = [];
  const walk = (items: IdeFile[]) => {
    for (const item of items) {
      if (item.children) {
        walk(item.children);
      }
      result.push(item);
    }
  };
  walk(files);
  return result;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INJECT BLINK KEYFRAME (once per module load)
   ═══════════════════════════════════════════════════════════════════════════ */

let blinkStyleInjected = false;

/**
 * Injects `<style id="ide-cursor-blink-style">` into `<head>` exactly once.
 * If you need to supply your own `@keyframes ide-cursor-blink`, call this
 * function with `force = false` to skip injection, or set the module-level
 * flag before rendering.
 */
export function ensureBlinkStyle(force = true): void {
  if (blinkStyleInjected || !force) return;
  if (typeof document === 'undefined') return;
  const id = 'ide-cursor-blink-style';
  if (document.getElementById(id)) {
    blinkStyleInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @keyframes ide-cursor-blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  blinkStyleInjected = true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TrafficLightDots
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * macOS-style red / yellow / green window control dots.
 *
 * @example
 * ```tsx
 * <TrafficLightDots size={14} />
 * ```
 */
export function TrafficLightDots({ size = 12, className }: TrafficLightDotsProps) {
  const dotStyle = (color: string): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  });

  return (
    <div
      className={className}
      style={{ display: 'flex', gap: Math.max(6, size * 0.5), alignItems: 'center' }}
    >
      <span style={dotStyle('#f38ba8')} />
      <span style={dotStyle('#f9e2af')} />
      <span style={dotStyle('#a6e3a1')} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FileTree
   ═══════════════════════════════════════════════════════════════════════════ */

/** Renders a single row in the file tree (recursive for folders). */
function FileTreeRow({
  file,
  depth,
  activeFile,
  onSelectFile,
  theme,
}: {
  file: IdeFile;
  depth: number;
  activeFile?: string | null;
  onSelectFile?: (f: IdeFile) => void;
  theme: IdeTheme;
}): React.ReactElement {
  const [open, setOpen] = useState(true);
  const isFolder = Boolean(file.children && file.children.length > 0);
  const isActive = activeFile === file.name;
  const icon = file.icon ?? defaultFileIcon(file.name);

  const handleClick = useCallback(() => {
    if (isFolder) {
      setOpen((prev) => !prev);
    }
    onSelectFile?.(file);
  }, [isFolder, onSelectFile, file]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '4px 8px',
          paddingLeft: 8 + depth * 16,
          border: 'none',
          background: isActive ? theme.surface : 'transparent',
          color: isActive ? theme.blue : theme.subtext,
          fontSize: 13,
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          borderRadius: 4,
          transition: 'background 0.15s, color 0.15s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = theme.surface;
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        {isFolder ? (
          <span style={{ fontSize: 10, width: 14, textAlign: 'center', flexShrink: 0 }}>
            {open ? '▾' : '▸'}
          </span>
        ) : (
          <span style={{ width: 14, flexShrink: 0 }} />
        )}
        <span style={{ flexShrink: 0 }}>{icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
      </button>
      {isFolder && open &&
        file.children!.map((child) => (
          <FileTreeRow
            key={child.name}
            file={child}
            depth={depth + 1}
            activeFile={activeFile}
            onSelectFile={onSelectFile}
            theme={theme}
          />
        ))}
    </>
  );
}

/**
 * Interactive file explorer with active-state highlighting, folder collapse,
 * and file-type icons.
 *
 * @example
 * ```tsx
 * <FileTree
 *   files={[{ name: 'App.tsx', icon: '⚛️', content: '...' }]}
 *   activeFile="App.tsx"
 *   onSelectFile={(f) => console.log(f.name)}
 *   theme={CATPPUCCIN_MOCHA}
 * />
 * ```
 */
export function FileTree({
  files,
  activeFile,
  onSelectFile,
  theme = CATPPUCCIN_MOCHA,
  className,
}: FileTreeProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1,
        padding: '4px 0',
        userSelect: 'none',
      }}
    >
      {files.map((file) => (
        <FileTreeRow
          key={file.name}
          file={file}
          depth={0}
          activeFile={activeFile}
          onSelectFile={onSelectFile}
          theme={theme}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EmbeddedTerminal
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Mini terminal section with a blinking cursor.
 *
 * Requires the `@keyframes ide-cursor-blink` animation (automatically injected
 * via the `ensureBlinkStyle()` call on first render).
 *
 * @example
 * ```tsx
 * <EmbeddedTerminal
 *   lines={['$ npm run dev', '  ➜ Local: http://localhost:3000']}
 *   theme={CATPPUCCIN_MOCHA}
 * />
 * ```
 */
export function EmbeddedTerminal({
  lines = [],
  theme = CATPPUCCIN_MOCHA,
  className,
}: EmbeddedTerminalProps) {
  // Inject blink keyframe on first mount
  useEffect(() => {
    ensureBlinkStyle(true);
  }, []);

  return (
    <div
      className={className}
      style={{
        background: theme.crust,
        borderRadius: 6,
        padding: '8px 10px',
        fontFamily: "'Menlo', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
        fontSize: 11,
        lineHeight: 1.6,
        color: theme.subtext,
        overflow: 'hidden',
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {line}
        </div>
      ))}
      {/* Blinking cursor line */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: theme.green, marginRight: 6 }}>{'>'}</span>
        <span
          style={{
            display: 'inline-block',
            width: 7,
            height: 14,
            background: theme.text,
            borderRadius: 1,
            animation: 'ide-cursor-blink 1s step-end infinite',
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   StatusBar
   ═══════════════════════════════════════════════════════════════════════════ */

/** Small segment rendered inside the status bar. */
function StatusSegment({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: IdeTheme;
}) {
  return (
    <span
      style={{
        padding: '0 8px',
        borderRight: `1px solid ${theme.surface}`,
        fontSize: 11,
        color: theme.subtext,
        whiteSpace: 'nowrap',
        lineHeight: 'inherit',
      }}
    >
      {children}
    </span>
  );
}

/**
 * Context-aware bottom bar showing editor metadata.
 *
 * @example
 * ```tsx
 * <StatusBar mode="TypeScript" encoding="UTF-8" indent="Spaces: 2" />
 * ```
 */
export function StatusBar({
  mode = 'Normal',
  encoding = 'UTF-8',
  indent = 'Spaces: 2',
  extraInfo,
  theme = CATPPUCCIN_MOCHA,
  className,
}: StatusBarProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 24,
        background: theme.mantle,
        borderTop: `1px solid ${theme.surface}`,
        color: theme.subtext,
        fontSize: 11,
        fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
        padding: '0 4px',
        flexShrink: 0,
        gap: 0,
        overflow: 'hidden',
      }}
    >
      {extraInfo && (
        <StatusSegment theme={theme}>{extraInfo}</StatusSegment>
      )}
      <StatusSegment theme={theme}>{indent}</StatusSegment>
      <StatusSegment theme={theme}>{encoding}</StatusSegment>
      <StatusSegment theme={theme}>{mode}</StatusSegment>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CodeViewer (internal)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Lazy wrapper that attempts to use `react-syntax-highlighter` and falls
 * back to a plain `<pre>` block when unavailable.
 */
function CodeViewer({
  code,
  language,
  theme,
}: {
  code: string;
  language: string;
  theme: IdeTheme;
}): React.ReactElement {
  const [SyntaxHighlighter, setSyntaxHighlighter] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    tryImportSyntaxHighlighter().then((mod) => {
      if (cancelled) return;
      if (mod && typeof mod === 'function') {
        setSyntaxHighlighter(() => mod as React.ComponentType<Record<string, unknown>>);
      }
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Still loading – show plain text immediately (optimistic)
  if (!loaded || !SyntaxHighlighter) {
    return (
      <pre
        style={{
          margin: 0,
          padding: 16,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Menlo', 'Consolas', monospace",
          fontSize: 13,
          lineHeight: 1.65,
          color: theme.text,
          background: 'transparent',
          whiteSpace: 'pre-wrap',
          overflow: 'auto',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {code}
      </pre>
    );
  }

  return (
    <SyntaxHighlighter
      language={language}
      style={undefined as unknown as Record<string, string>} // intentional – we style via customTheme
      customStyle={{
        margin: 0,
        padding: 16,
        fontFamily: "'Fira Code', 'Cascadia Code', 'Menlo', 'Consolas', monospace",
        fontSize: 13,
        lineHeight: 1.65,
        color: theme.text,
        background: 'transparent',
        height: '100%',
        boxSizing: 'border-box',
      }}
      codeTagProps={{
        style: {
          fontFamily: "'Fira Code', 'Cascadia Code', 'Menlo', 'Consolas', monospace",
          fontSize: 13,
          lineHeight: 1.65,
          color: theme.text,
        },
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IdeLayout (composed)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Full IDE layout: sidebar (file tree + optional terminal), code editor,
 * title bar with traffic-light dots, and status bar.
 *
 * @example
 * ```tsx
 * <IdeLayout
 *   files={[
 *     { name: 'src', icon: '📁', children: [
 *       { name: 'App.tsx', icon: '⚛️', content: 'export default function App() {}' },
 *     ]},
 *     { name: 'package.json', icon: '📄', content: '{ "name": "demo" }' },
 *   ]}
 *   height={520}
 *   showTerminal
 *   editorTitle="App.tsx — my-project"
 * />
 * ```
 */
export function IdeLayout({
  files = [],
  height = 480,
  theme = CATPPUCCIN_MOCHA,
  showTerminal = false,
  editorTitle,
  className,
}: IdeLayoutProps) {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const flatFiles = useMemo(() => flattenFiles(files), [files]);

  // Auto-select first file with content on mount
  useEffect(() => {
    if (!activeFile && flatFiles.length > 0) {
      const first = flatFiles.find((f) => f.content != null) ?? flatFiles[0];
      setActiveFile(first.name);
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedFile = useMemo(
    () => flatFiles.find((f) => f.name === activeFile),
    [flatFiles, activeFile],
  );

  const handleSelectFile = useCallback((file: IdeFile) => {
    // Only set active if it has content (is a leaf file)
    if (file.content != null) {
      setActiveFile(file.name);
    }
  }, []);

  const detectedLanguage = selectedFile
    ? (selectedFile.language ?? detectLanguage(selectedFile.name))
    : 'text';

  const resolvedEditorTitle = editorTitle ?? (selectedFile ? selectedFile.name : 'No file selected');

  const defaultTerminalLines = [
    '$ npm run dev',
    '  ➜  Local:   http://localhost:3000/',
    '  ➜  Network: http://192.168.1.42:3000/',
    '  ready in 420ms',
  ];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height,
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${theme.surface}`,
        background: theme.base,
        fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
        color: theme.text,
      }}
    >
      {/* ── Title Bar ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          background: theme.mantle,
          borderBottom: `1px solid ${theme.surface}`,
          flexShrink: 0,
        }}
      >
        <TrafficLightDots size={12} />
        <span
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 12,
            color: theme.overlay,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {resolvedEditorTitle}
        </span>
        {/* Spacer to keep title centred */}
        <div style={{ width: 12 * 3 + 6 * 2, flexShrink: 0 }} />
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Sidebar ────────────────────────────────────────── */}
        <div
          style={{
            width: 200,
            minWidth: 160,
            background: theme.mantle,
            borderRight: `1px solid ${theme.surface}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: '10px 12px 6px',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              color: theme.overlay,
            }}
          >
            Explorer
          </div>

          {/* File tree */}
          <FileTree
            files={files}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            theme={theme}
          />

          {/* Embedded terminal */}
          {showTerminal && (
            <div style={{ padding: '8px 8px', flexShrink: 0 }}>
              <EmbeddedTerminal
                lines={defaultTerminalLines}
                theme={theme}
              />
            </div>
          )}
        </div>

        {/* ── Editor Panel ───────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: theme.base,
          }}
        >
          {/* Editor tab bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 34,
              background: theme.crust,
              borderBottom: `1px solid ${theme.surface}`,
              flexShrink: 0,
              padding: '0 8px',
              gap: 2,
              overflowX: 'auto',
            }}
          >
            {selectedFile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  background: theme.base,
                  borderRadius: '6px 6px 0 0',
                  fontSize: 12,
                  color: theme.text,
                  whiteSpace: 'nowrap',
                  borderTop: `2px solid ${theme.blue}`,
                  marginTop: -1,
                  height: 33,
                }}
              >
                <span>{selectedFile.icon ?? defaultFileIcon(selectedFile.name)}</span>
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>

          {/* Editor body */}
          <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            {selectedFile?.content != null ? (
              <CodeViewer
                code={selectedFile.content}
                language={detectedLanguage}
                theme={theme}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: theme.overlay,
                  fontSize: 13,
                }}
              >
                {selectedFile ? 'No content available' : 'Select a file to view its contents'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status Bar ───────────────────────────────────────── */}
      <StatusBar
        mode={detectedLanguage === 'text' ? 'Plain Text' : detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}
        encoding="UTF-8"
        indent="Spaces: 2"
        extraInfo="Ln 1, Col 1"
        theme={theme}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEFAULT EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export default IdeLayout;
