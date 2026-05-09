/**
 * CssSnippets — A curated CSS code snippets library with live previews,
 * syntax highlighting, categories, and one-click copy.
 *
 * De-hardcoded extraction from Code-Realm.
 * Zero external icon or animation library dependencies.
 *
 * @module CssSnippets
 */

import { useState, useCallback, type ReactNode } from 'react';
import { useIsMounted, copyToClipboard } from './shared';
import { IconCopy, IconCheck, IconEye } from './shared';

// ─── Inline SVG Icons ─────────────────────────────────────────────

function IconType({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>;
}

function IconScissors({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" /><circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 20 20" /></svg>;
}

function IconPalette({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>;
}

function IconAlignCenter({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" x2="6" y1="10" y2="10" /><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="3" y1="14" y2="14" /><line x1="18" x2="6" y1="18" y2="18" /></svg>;
}

function IconGrid({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>;
}

function IconCheckbox({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 12 2 2 4-4" /></svg>;
}

function IconMessageSquare({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}

function IconArrowDown({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="5" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>;
}

function IconLayers({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22.54 12.43-1.28-.59a1 1 0 0 0-.73 0L12 15.49l-8.53-3.88a1 1 0 0 0-.73 0l-1.28.59a.5.5 0 0 0 0 .91L11.07 18a2 2 0 0 0 1.86 0l8.61-6.66a.5.5 0 0 0 0-.91Z" /></svg>;
}

function IconPointer({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="M13 13l6 6" /></svg>;
}

// ─── Types ────────────────────────────────────────────────────────

export interface CssSnippet {
  id: string;
  name: string;
  category: string;
  code: string;
}

export interface CategoryColor {
  bg: string;
  text: string;
  border: string;
}

export interface CssSnippetsProps {
  /** Array of CSS snippets to display */
  snippets?: CssSnippet[];
  /** Category → badge color mapping */
  categoryColors?: Record<string, CategoryColor>;
  /** Grid columns: 1, 2, or 3 (default responsive 1/2/3) */
  columns?: number;
  /** Accent color (default #d4a017) */
  accent?: string;
  /** Surface background (default #ebe5d0) */
  surface?: string;
  /** Muted text color (default #6b6356) */
  textMuted?: string;
  /** Additional CSS class */
  className?: string;
  /** Custom preview renderer for a snippet */
  renderPreview?: (snippet: CssSnippet) => ReactNode;
}

// ─── Default Snippets ─────────────────────────────────────────────

export const DEFAULT_SNIPPETS: CssSnippet[] = [
  { id: 'truncate-text', name: 'Truncate Text', category: 'Typography', code: `.truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  max-width: 200px;\n}` },
  { id: 'multi-line-truncate', name: 'Multi-Line Truncate', category: 'Typography', code: `.line-clamp {\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}` },
  { id: 'smooth-scrollbar', name: 'Smooth Scrollbar', category: 'Layout', code: `.custom-scroll::-webkit-scrollbar {\n  width: 6px;\n}\n.custom-scroll::-webkit-scrollbar-track {\n  background: rgba(0, 0, 0, 0.1);\n  border-radius: 3px;\n}\n.custom-scroll::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.15);\n  border-radius: 3px;\n}` },
  { id: 'text-gradient', name: 'Text Gradient', category: 'Effect', code: `.text-gradient {\n  background: linear-gradient(135deg, #d4a017, #b8860b);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}` },
  { id: 'glassmorphism', name: 'Glassmorphism Card', category: 'Effect', code: `.glass-card {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 16px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n}` },
  { id: 'neon-glow', name: 'Neon Glow Text', category: 'Effect', code: `.neon-glow {\n  color: #d4a017;\n  text-shadow:\n    0 0 7px #d4a017,\n    0 0 10px #d4a017,\n    0 0 21px #d4a017,\n    0 0 42px #b8860b;\n}` },
  { id: 'animated-underline', name: 'Animated Underline', category: 'Effect', code: `.animated-underline {\n  position: relative;\n  text-decoration: none;\n}\n.animated-underline::after {\n  content: '';\n  position: absolute;\n  bottom: -2px;\n  left: 0;\n  width: 0;\n  height: 2px;\n  background: #d4a017;\n  transition: width 0.3s ease;\n}\n.animated-underline:hover::after {\n  width: 100%;\n}` },
  { id: 'custom-selection', name: 'Custom Selection', category: 'Typography', code: `::selection {\n  background: rgba(16, 185, 129, 0.3);\n  color: #fff;\n}` },
  { id: 'aspect-ratio', name: 'Aspect Ratio Box', category: 'Layout', code: `.aspect-box {\n  aspect-ratio: 16 / 9;\n  width: 100%;\n  object-fit: cover;\n}` },
  { id: 'center-anything', name: 'Center Anything', category: 'Layout', code: `.center-flex {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n}` },
  { id: 'grid-auto-fill', name: 'Grid Auto-Fill', category: 'Layout', code: `.auto-grid {\n  display: grid;\n  grid-template-columns:\n    repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n}` },
  { id: 'custom-checkbox', name: 'Custom Checkbox', category: 'Form', code: `.custom-checkbox {\n  appearance: none;\n  width: 20px;\n  height: 20px;\n  border: 2px solid rgba(255, 255, 255, 0.2);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.custom-checkbox:checked {\n  background: #d4a017;\n  border-color: #d4a017;\n}` },
  { id: 'css-tooltip', name: 'CSS Tooltip', category: 'UI', code: `.tooltip {\n  position: relative;\n}\n.tooltip::before {\n  content: attr(data-tip);\n  position: absolute;\n  bottom: 100%;\n  left: 50%;\n  transform: translateX(-50%);\n  padding: 6px 12px;\n  background: #1a1a2e;\n  color: #fff;\n  font-size: 12px;\n  border-radius: 6px;\n  white-space: nowrap;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 0.2s;\n}\n.tooltip:hover::before {\n  opacity: 1;\n}` },
];

export const DEFAULT_CATEGORY_COLORS: Record<string, CategoryColor> = {
  Typography: { bg: 'rgba(184,134,11,0.12)', text: 'rgba(184,134,11,0.8)', border: 'rgba(184,134,11,0.3)' },
  Layout: { bg: 'rgba(212,160,23,0.12)', text: 'rgba(212,160,23,0.8)', border: 'rgba(212,160,23,0.3)' },
  Effect: { bg: 'rgba(184,134,11,0.12)', text: 'rgba(184,134,11,0.8)', border: 'rgba(184,134,11,0.3)' },
  Form: { bg: 'rgba(184,134,11,0.12)', text: 'rgba(184,134,11,0.8)', border: 'rgba(184,134,11,0.3)' },
  UI: { bg: 'rgba(184,134,11,0.12)', text: 'rgba(184,134,11,0.8)', border: 'rgba(184,134,11,0.3)' },
};

// ─── Lightweight CSS Syntax Highlighter ───────────────────────────

function highlightCSSLine(line: string, lineNum: number): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = line;
  let keyIdx = 0;
  if (remaining.trim() === '') return <div key={lineNum} className="flex leading-[1.5rem]"><span className="select-none text-[#1a1a1a]/[0.1] w-7 text-right mr-3 shrink-0 text-[10px]">{lineNum}</span><span>&nbsp;</span></div>;
  if (remaining.trimStart().startsWith('//')) return <div key={lineNum} className="flex leading-[1.5rem]"><span className="select-none text-[#1a1a1a]/[0.1] w-7 text-right mr-3 shrink-0 text-[10px]">{lineNum}</span><span className="syn-comment whitespace-pre text-[11px]">{remaining}</span></div>;
  const selMatch = remaining.match(/^(\s*)([\w.*#:\-\[\]=~^$*"',>+\s]+?)(\s*\{)$/);
  if (selMatch) {
    if (selMatch[1]) parts.push(<span key={`sl-${keyIdx++}`}>{selMatch[1]}</span>);
    parts.push(<span key={`ss-${keyIdx++}`} className="syn-tag">{selMatch[2]}</span>);
    parts.push(<span key={`sb-${keyIdx++}`} className="syn-bracket">{selMatch[3]}</span>);
    remaining = '';
  } else if (remaining.trim() === '}') {
    return <div key={lineNum} className="flex leading-[1.5rem]"><span className="select-none text-[#1a1a1a]/[0.1] w-7 text-right mr-3 shrink-0 text-[10px]">{lineNum}</span><span className="syn-bracket text-[11px]">{remaining}</span></div>;
  }
  const propMatch = remaining.match(/^(\s*)([-\w]+)(\s*:\s*)(.*)$/);
  if (propMatch && remaining.length > 0) {
    if (propMatch[1]) parts.push(<span key={`sp-${keyIdx++}`}>{propMatch[1]}</span>);
    parts.push(<span key={`spr-${keyIdx++}`} className="syn-property">{propMatch[2]}</span>);
    parts.push(<span key={`spu-${keyIdx++}`} className="syn-punctuation">{propMatch[3]}</span>);
    parts.push(<span key={`sv-${keyIdx++}`} className="syn-value text-[11px]">{propMatch[4]}</span>);
  }
  if (parts.length === 0) parts.push(<span key={`p-${keyIdx++}`} className="syn-value text-[11px]">{remaining}</span>);
  return <div key={lineNum} className="flex leading-[1.5rem]"><span className="select-none text-[#1a1a1a]/[0.1] w-7 text-right mr-3 shrink-0 text-[10px]">{lineNum}</span><span className="whitespace-pre text-[11px]">{parts}</span></div>;
}

// ─── Copy Button ──────────────────────────────────────────────────

function CopyBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);
  return (
    <button onClick={handleCopy} className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono transition-all duration-200 cursor-pointer border" style={{ color: copied ? '#d4a017' : '#6b6356', backgroundColor: copied ? 'rgba(184,134,11,0.15)' : '#ebe5d0', borderColor: copied ? 'rgba(212,160,23,0.2)' : 'rgba(26,26,26,0.1)' }} aria-label="Copy CSS code">
      {copied ? <><IconCheck size={12} /><span>Copied!</span></> : <><IconCopy size={12} /><span>Copy</span></>}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────

/**
 * CssSnippets — a browsable gallery of CSS code snippets.
 *
 * Features:
 * - Categorized snippet cards with live code preview
 * - Inline syntax highlighting (no external lib)
 * - One-click copy with visual feedback
 * - Configurable snippets, categories, and theming
 *
 * @example
 * ```tsx
 * import { CssSnippets } from './010_CssSnippets';
 * <CssSnippets accent="#22c55e" columns={2} />
 * ```
 */
export function CssSnippets({
  snippets = DEFAULT_SNIPPETS,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  columns,
  accent = '#d4a017',
  surface = '#ebe5d0',
  textMuted = '#6b6356',
  className,
  renderPreview: PreviewRenderer,
}: CssSnippetsProps) {
  const mounted = useIsMounted();
  if (!mounted) return null;

  const gridCols = columns
    ? `grid-cols-${columns}`
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const catColor = (cat: string) =>
    categoryColors[cat] ?? { bg: `${accent}1F`, text: `${accent}CC`, border: `${accent}4D` };

  return (
    <div className={className}>
      {/* Inline styles for snippet previews */}
      <style>{`
        .snippet-underline::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:#d4a017; transition:width 0.3s ease; border-radius:1px; }
        .snippet-underline:hover::after { width:100%; }
        .snippet-tooltip::before { content:attr(data-tip); position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%); padding:4px 10px; background:#1a1a2e; color:#fff; font-size:10px; border-radius:6px; white-space:nowrap; opacity:0; pointer-events:none; transition:opacity 0.2s; border:1px solid rgba(26,26,26,0.1); font-family:monospace; }
        .snippet-tooltip:hover::before { opacity:1; }
      `}</style>

      <div className={`grid ${gridCols} gap-4`}>
        {snippets.map((snippet, i) => {
          const cc = catColor(snippet.category);
          const codeLines = snippet.code.split('\n');
          return (
            <div
              key={snippet.id}
              className="group relative border border-[#1a1a1a]/12 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: surface, borderColor: 'rgba(26,26,26,0.12)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]/8">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-7 h-7" style={{ backgroundColor: cc.bg, border: `1px solid ${cc.border}` }}>
                    <IconPalette size={14} style={{ color: cc.text }} />
                  </div>
                  <div className="text-xs font-mono text-[#1a1a1a]/70 font-medium">{snippet.name}</div>
                </div>
                <div className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider" style={{ backgroundColor: cc.bg, color: cc.text, border: `1px solid ${cc.border}` }}>
                  {snippet.category}
                </div>
              </div>

              {/* Code Block */}
              <div className="flex-1 relative">
                <div className="absolute top-2 right-2 z-10">
                  <CopyBtn code={snippet.code} />
                </div>
                <div className="px-3 py-3 overflow-x-auto max-h-[220px]">
                  {codeLines.map((line, li) => highlightCSSLine(line, li + 1))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CssSnippets;
