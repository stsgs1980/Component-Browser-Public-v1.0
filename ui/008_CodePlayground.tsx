/**
 * CodePlayground — Live HTML/CSS/JS editor with real-time preview iframe.
 *
 * De-hardcoded extraction from Code-Realm.
 * Zero external icon or animation library dependencies.
 *
 * @module CodePlayground
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { useIsMounted, copyToClipboard, downloadFile } from './shared';

// ─── Inline SVG Icons ─────────────────────────────────────────────

function IconPlay({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}

function IconRotateCcw({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconCode({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconPalette({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

import { IconCopy, IconCheck, IconEye, IconDownload } from './shared';

// ─── Types ────────────────────────────────────────────────────────

export type TabType = 'html' | 'css' | 'js';

export interface PlaygroundTab {
  id: TabType;
  label: string;
  filename: string;
  accent: string;
}

interface Token {
  text: string;
  className?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────

export const DEFAULT_TABS: PlaygroundTab[] = [
  { id: 'html', label: 'HTML', filename: 'index.html', accent: '#f97316' },
  { id: 'css', label: 'CSS', filename: 'style.css', accent: '#b8860b' },
  { id: 'js', label: 'JavaScript', filename: 'script.js', accent: '#eab308' },
];

export const DEFAULT_HTML = `<div id="demo">
  <div class="card">
    <h1 class="title">Hello, World!</h1>
    <p class="subtitle">Built with pure HTML, CSS & JS</p>
    <div class="orb"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>
</div>`;

export const DEFAULT_CSS = `body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0a0a0a;
  font-family: system-ui, sans-serif;
  overflow: hidden;
}

.card {
  position: relative;
  padding: 3rem 4rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #d4a017, #b8860b, #d4a017);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.5rem;
}`;

export const DEFAULT_JS = `const card = document.querySelector('.card');
card.addEventListener('mousemove', function(e) {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.background =
    "radial-gradient(circle at " + x + "px " +
    y + "px, rgba(255,255,255,0.06), " +
    "rgba(255,255,255,0.03))";
});

console.log('Playground loaded!');`;

// ─── Props ────────────────────────────────────────────────────────

export interface CodePlaygroundProps {
  /** Default HTML code */
  defaultHtml?: string;
  /** Default CSS code */
  defaultCss?: string;
  /** Default JS code */
  defaultJs?: string;
  /** Tab configuration */
  tabs?: PlaygroundTab[];
  /** Debounce delay in ms for auto-refresh (default 300) */
  debounceMs?: number;
  /** Maximum panel height (default 620) */
  maxHeight?: number | string;
  /** Callback when code changes */
  onCodeChange?: (lang: TabType, code: string) => void;
  /** Tab icon renderer (receives tab) */
  tabIcon?: (tab: PlaygroundTab) => ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Label for the editor section (default "Live Editor") */
  editorLabel?: string;
  /** Label for the preview section (default "Preview") */
  previewLabel?: string;
  /** Download filename (default "playground.html") */
  downloadFilename?: string;
}

// ─── Syntax Highlighting (kept lightweight, no external deps) ─────

function tokenizeHTML(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (code[i] === '<' && code[i + 1] === '!' && code[i + 2] === '-' && code[i + 3] === '-') {
      const end = code.indexOf('-->', i + 4);
      const ce = end === -1 ? code.length : end + 3;
      tokens.push({ text: code.slice(i, ce), className: 'syn-comment' }); i = ce; continue;
    }
    if (code[i] === '<') {
      let j = i + 1;
      const isClosing = code[j] === '/'; if (isClosing) j++;
      let tn = '';
      while (j < code.length && /[\w-]/.test(code[j])) { tn += code[j]; j++; }
      tokens.push({ text: isClosing ? '</' : '<', className: 'syn-bracket' });
      if (tn) tokens.push({ text: tn, className: 'syn-tag' });
      while (j < code.length && code[j] !== '>' && !(code[j] === '/' && code[j + 1] === '>')) {
        if (/\s/.test(code[j])) { tokens.push({ text: code[j] }); j++; }
        else if (code[j] === '=') { tokens.push({ text: '=', className: 'syn-punctuation' }); j++; }
        else if (code[j] === '"' || code[j] === "'") {
          const q = code[j]; let v = q; j++;
          while (j < code.length && code[j] !== q) v += code[j], j++;
          if (j < code.length) v += code[j]; j++;
          tokens.push({ text: v, className: 'syn-value' });
        } else {
          let a = '';
          while (j < code.length && /[\w-]/.test(code[j])) a += code[j], j++;
          if (a) tokens.push({ text: a, className: 'syn-attr' });
        }
      }
      if (j < code.length && code[j] === '/' && code[j + 1] === '>') { tokens.push({ text: '/>', className: 'syn-bracket' }); j += 2; }
      else if (j < code.length && code[j] === '>') { tokens.push({ text: '>', className: 'syn-bracket' }); j++; }
      i = j; continue;
    }
    let text = '';
    while (i < code.length && code[i] !== '<') text += code[i], i++;
    if (text) tokens.push({ text });
  }
  return tokens;
}

function tokenizeCSS(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const kw = new Set(['auto','inherit','initial','unset','none','normal','relative','absolute','fixed','sticky','static','block','inline','flex','grid','center','solid','dashed','dotted','transparent','ease','ease-in','ease-out','ease-in-out','linear','infinite','hidden','visible','scroll','cover','contain','nowrap','wrap','bold','clip','ellipsis','border-box','content-box']);
  while (i < code.length) {
    if (code[i] === '/' && code[i + 1] === '*') { const e = code.indexOf('*/', i + 2); const ce = e === -1 ? code.length : e + 2; tokens.push({ text: code.slice(i, ce), className: 'syn-comment' }); i = ce; continue; }
    if (code[i] === '"' || code[i] === "'") { const q = code[i]; let j = i + 1; while (j < code.length && code[j] !== q) { if (code[j] === '\\') j++; j++; } tokens.push({ text: code.slice(i, j + 1), className: 'syn-string' }); i = j + 1; continue; }
    if (code[i] === '@') { let j = i + 1; while (j < code.length && /[\w-]/.test(code[j])) j++; tokens.push({ text: code.slice(i, j), className: 'syn-keyword' }); i = j; continue; }
    if (code[i] === '{' || code[i] === '}') { tokens.push({ text: code[i], className: 'syn-bracket' }); i++; continue; }
    if (code[i] === ':' || code[i] === ';') { tokens.push({ text: code[i], className: 'syn-punctuation' }); i++; continue; }
    if (/\d/.test(code[i])) { let j = i; while (j < code.length && /[\d.%a-zA-Z]/.test(code[j])) j++; tokens.push({ text: code.slice(i, j), className: 'syn-number' }); i = j; continue; }
    if (code[i] === '#') { let j = i + 1; while (j < code.length && /[\da-fA-F]/.test(code[j])) j++; if (j > i + 1) { tokens.push({ text: code.slice(i, j), className: 'syn-number' }); i = j; continue; } tokens.push({ text: '#', className: 'syn-punctuation' }); i++; continue; }
    if (/[a-zA-Z_-]/.test(code[i])) {
      let j = i; while (j < code.length && /[\w-]/.test(code[j])) j++; const w = code.slice(i, j);
      let k = j; while (k < code.length && code[k] === ' ') k++;
      if (code[k] === ':' && code[k + 1] !== ':') tokens.push({ text: w, className: 'syn-property' });
      else if (kw.has(w)) tokens.push({ text: w, className: 'syn-keyword' });
      else tokens.push({ text: w, className: 'syn-tag' });
      i = j; continue;
    }
    if (/\s/.test(code[i])) { let j = i; while (j < code.length && /\s/.test(code[j])) j++; tokens.push({ text: code.slice(i, j) }); i = j; continue; }
    tokens.push({ text: code[i], className: 'syn-punctuation' }); i++;
  }
  return tokens;
}

function tokenizeJS(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const kw = new Set(['const','let','var','function','if','else','return','new','this','true','false','null','undefined','typeof','instanceof','class','extends','import','export','from','async','await','for','while','do','switch','case','break','continue','try','catch','finally','throw','default','void','delete','in','of']);
  while (i < code.length) {
    if (code[i] === '/' && code[i + 1] === '/') { let j = i; while (j < code.length && code[j] !== '\n') j++; tokens.push({ text: code.slice(i, j), className: 'syn-comment' }); i = j; continue; }
    if (code[i] === '/' && code[i + 1] === '*') { const e = code.indexOf('*/', i + 2); const ce = e === -1 ? code.length : e + 2; tokens.push({ text: code.slice(i, ce), className: 'syn-comment' }); i = ce; continue; }
    if (code[i] === '"' || code[i] === "'") { const q = code[i]; let j = i + 1; while (j < code.length && code[j] !== q) { if (code[j] === '\\') j++; j++; } tokens.push({ text: code.slice(i, j + 1), className: 'syn-string' }); i = j + 1; continue; }
    if (/\d/.test(code[i])) { let j = i; while (j < code.length && /[\d.]/.test(code[j])) j++; tokens.push({ text: code.slice(i, j), className: 'syn-number' }); i = j; continue; }
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i; while (j < code.length && /[\w$]/.test(code[j])) j++; const w = code.slice(i, j);
      if (kw.has(w)) tokens.push({ text: w, className: 'syn-keyword' });
      else { let k = j; while (k < code.length && code[k] === ' ') k++; tokens.push({ text: w, code[k] === '(' ? { className: 'syn-function' } : {} as Token }); }
      i = j; continue;
    }
    if ('=+-*/<>!&|^~%?:'.includes(code[i])) { let j = i; while (j < code.length && '=+-*/<>!&|^~%?:'.includes(code[j]) && j - i < 3) j++; tokens.push({ text: code.slice(i, j), className: 'syn-operator' }); i = j; continue; }
    if ('()[]{}'.includes(code[i])) { tokens.push({ text: code[i], className: 'syn-bracket' }); i++; continue; }
    if ('.,;'.includes(code[i])) { tokens.push({ text: code[i], className: 'syn-punctuation' }); i++; continue; }
    if (/\s/.test(code[i])) { let j = i; while (j < code.length && /\s/.test(code[j])) j++; tokens.push({ text: code.slice(i, j) }); i = j; continue; }
    tokens.push({ text: code[i] }); i++;
  }
  return tokens;
}

function tokenize(code: string, lang: TabType): Token[] {
  switch (lang) {
    case 'html': return tokenizeHTML(code);
    case 'css': return tokenizeCSS(code);
    case 'js': return tokenizeJS(code);
  }
}

function renderTokenizedCode(tokens: Token[]): ReactNode[] {
  const lines: { tokens: Token[] }[] = [{ tokens: [] }];
  for (const token of tokens) {
    const parts = token.text.split('\n');
    for (let pi = 0; pi < parts.length; pi++) {
      if (pi > 0) lines.push({ tokens: [] });
      if (parts[pi].length > 0) lines[lines.length - 1].tokens.push({ text: parts[pi], className: token.className });
    }
  }
  return lines.map((line, idx) => (
    <div key={idx} className="flex leading-[1.625rem]">
      <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">{idx + 1}</span>
      <span className="whitespace-pre text-xs">
        {line.tokens.length === 0 ? <span>&nbsp;</span> : line.tokens.map((t, ti) => <span key={ti} className={t.className}>{t.text}</span>)}
      </span>
    </div>
  ));
}

// ─── Build srcDoc ─────────────────────────────────────────────────

function buildSrcDoc(html: string, css: string, js: string): string {
  const cs = '<' + '/script>';
  return `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<style>${css}</style>\n</head>\n<body>${html}\n<script>${js}${cs}\n</body>\n</html>`;
}

// ─── Component ────────────────────────────────────────────────────

/**
 * CodePlayground — a live HTML/CSS/JS editor with side-by-side preview iframe.
 *
 * Features:
 * - Tabbed code editor with syntax highlighting
 * - Real-time debounced preview
 * - Copy, reset, download actions
 * - Scroll-synced textarea + overlay
 *
 * @example
 * ```tsx
 * import { CodePlayground } from './008_CodePlayground';
 * <CodePlayground defaultHtml="<h1>Hi</h1>" />
 * ```
 */
export function CodePlayground({
  defaultHtml = DEFAULT_HTML,
  defaultCss = DEFAULT_CSS,
  defaultJs = DEFAULT_JS,
  tabs = DEFAULT_TABS,
  debounceMs = 300,
  maxHeight = 620,
  onCodeChange,
  tabIcon,
  className,
  editorLabel = 'Live Editor',
  previewLabel = 'Preview',
  downloadFilename = 'playground.html',
}: CodePlaygroundProps) {
  const mounted = useIsMounted();

  const [htmlCode, setHtmlCode] = useState(defaultHtml);
  const [cssCode, setCssCode] = useState(defaultCss);
  const [jsCode, setJsCode] = useState(defaultJs);
  const [srcDoc, setSrcDoc] = useState(() => buildSrcDoc(defaultHtml, defaultCss, defaultJs));

  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const activeCode = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
  const activeTabConfig = tabs.find(t => t.id === activeTab)!;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode));
    }, debounceMs);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [htmlCode, cssCode, jsCode, debounceMs]);

  const handleCodeChange = useCallback((value: string, tab: TabType) => {
    switch (tab) {
      case 'html': setHtmlCode(value); break;
      case 'css': setCssCode(value); break;
      case 'js': setJsCode(value); break;
    }
    onCodeChange?.(tab, value);
  }, [onCodeChange]);

  const handleRun = useCallback(() => {
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
    setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode));
  }, [htmlCode, cssCode, jsCode]);

  const handleReset = useCallback(() => {
    setHtmlCode(defaultHtml); setCssCode(defaultCss); setJsCode(defaultJs);
    setSrcDoc(buildSrcDoc(defaultHtml, defaultCss, defaultJs));
  }, [defaultHtml, defaultCss, defaultJs]);

  const handleCopy = useCallback(async () => {
    const code = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeTab, htmlCode, cssCode, jsCode]);

  const handleDownload = useCallback(() => {
    downloadFile(buildSrcDoc(htmlCode, cssCode, jsCode), downloadFilename, 'text/html');
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }, [htmlCode, cssCode, jsCode, downloadFilename]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const s = ta.selectionStart;
      const v = ta.value.substring(0, s) + '  ' + ta.value.substring(ta.selectionEnd);
      handleCodeChange(v, activeTab);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
    }
  }, [activeTab, handleCodeChange]);

  const lineCount = activeCode.split('\n').length;
  const charCount = activeCode.length;

  if (!mounted) return null;

  const tokens = tokenize(activeCode, activeTab);
  const highlightedLines = renderTokenizedCode(tokens);

  const tabIconColor = (tab: PlaygroundTab) => activeTab === tab.id ? tab.accent : undefined;

  return (
    <div className={className}>
      {/* Toolbar label */}
      <div className="flex items-center gap-3 mb-6">
        <IconEye size={16} style={{ color: 'rgba(212,160,23,0.6)' }} />
        <h3 className="font-mono text-sm text-[#6b6356]/50 tracking-widest uppercase">{editorLabel}</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4a017]/20 to-transparent" />
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

        {/* Editor Panel */}
        <div
          className="rounded-2xl overflow-hidden border border-[#1a1a1a]/12 flex flex-col"
          style={{ background: '#0d1117', maxHeight }}
        >
          {/* Tab Bar */}
          <div className="flex items-center border-b border-[#1a1a1a]/12">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 px-4 py-3 text-xs font-mono transition-colors duration-200"
                  style={{ color: isActive ? '#f8f8f2' : 'rgba(255,255,255,0.35)' }}
                >
                  {tabIcon ? tabIcon(tab) : <IconCode size={14} style={{ color: tabIconColor(tab) }} />}
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: tab.accent }}
                    />
                  )}
                </button>
              );
            })}
            <div className="flex-1" />

            {/* Toolbar actions */}
            <div className="flex items-center gap-1 pr-2">
              <button onClick={handleReset} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono text-[#6b6356]/50 hover:text-[#1a1a1a]/70 hover:bg-[#ebe5d0] transition-colors duration-200" title="Reset">
                <IconRotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono transition-colors duration-200" style={{ color: copied ? '#d4a017' : 'rgba(107,99,86,0.5)', backgroundColor: copied ? 'rgba(184,134,11,0.15)' : '#ebe5d0' }} title="Copy">
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button onClick={handleDownload} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono transition-colors duration-200" style={{ color: downloaded ? '#d4a017' : 'rgba(107,99,86,0.5)', backgroundColor: downloaded ? 'rgba(184,134,11,0.15)' : '#ebe5d0' }} title="Download">
                {downloaded ? <IconCheck size={14} /> : <IconDownload size={14} />}
                <span className="hidden sm:inline">{downloaded ? 'Saved!' : 'Download'}</span>
              </button>

              <button onClick={handleRun} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono text-white transition-all duration-200 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)' }} title="Run">
                <IconPlay size={14} />
                <span className="hidden sm:inline">Run</span>
              </button>
            </div>
          </div>

          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1a1a]/8">
            <div className="w-2.5 h-2.5 bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 bg-[#28c840]" />
            <span className="font-mono text-[11px] text-[#6b6356]/30 ml-3">{activeTabConfig.filename}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5" style={{ backgroundColor: activeTabConfig.accent, opacity: 0.5 }} />
              <span className="font-mono text-[10px] text-[#6b6356]/20 uppercase tracking-wider">{activeTab}</span>
            </div>
          </div>

          {/* Code area */}
          <div className="relative flex-1 overflow-hidden min-h-[300px] sm:min-h-[380px] lg:min-h-[420px]">
            <pre ref={preRef} className="absolute inset-0 w-full h-full p-4 overflow-hidden pointer-events-none font-mono text-xs leading-[1.625rem]" style={{ tabSize: 2, color: '#f8f8f2' }} aria-hidden="true">
              {highlightedLines}
            </pre>
            <textarea
              ref={textareaRef}
              value={activeCode}
              onChange={e => handleCodeChange(e.target.value, activeTab)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-[#f8f8f2] outline-none p-4 font-mono text-xs leading-[1.625rem] overflow-auto"
              style={{ tabSize: 2 }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label={`Code editor for ${activeTabConfig.label}`}
            />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#1a1a1a]/8 bg-[#ebe5d0]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#6b6356]/30 uppercase">{activeTab}</span>
              <span className="font-mono text-[10px] text-[#6b6356]/20">UTF-8</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#6b6356]/20">{lineCount} lines</span>
              <span className="font-mono text-[10px] text-[#6b6356]/20">{charCount} chars</span>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="rounded-2xl overflow-hidden border border-[#1a1a1a]/12 flex flex-col" style={{ background: '#0d1117', maxHeight }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1a1a1a]/12">
            <div className="w-2.5 h-2.5 bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 bg-[#28c840]" />
            <div className="flex items-center gap-1.5 ml-3">
              <IconEye size={14} style={{ color: 'rgba(107,99,86,0.35)' }} />
              <span className="font-mono text-[11px] text-[#6b6356]/35">{previewLabel}</span>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-[#ebe5d0] border border-[#1a1a1a]/8">
              <div className="w-2 h-2 bg-[#d4a017]/50" />
              <span className="font-mono text-[10px] text-[#6b6356]/20">localhost:3000/playground</span>
            </div>
          </div>
          <div className="flex-1 bg-white min-h-[300px] sm:min-h-[380px] lg:min-h-[420px]">
            <iframe srcDoc={srcDoc} title="Code preview" sandbox="allow-scripts" className="w-full h-full border-0" style={{ minHeight: '300px' }} />
          </div>
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#1a1a1a]/8 bg-[#ebe5d0]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#d4a017]/60 animate-pulse" />
              <span className="font-mono text-[10px] text-[#6b6356]/30">Live</span>
            </div>
            <span className="font-mono text-[10px] text-[#6b6356]/20">Auto-refresh ({debounceMs}ms)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodePlayground;
