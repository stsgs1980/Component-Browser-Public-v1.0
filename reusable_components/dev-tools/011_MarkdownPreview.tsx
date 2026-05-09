/**
 * MarkdownPreview — A live Markdown editor with real-time preview, toolbar,
 * template loading, copy/export, and a zero-dependency Markdown parser.
 *
 * De-hardcoded extraction from Code-Realm.
 * Zero external icon or animation library dependencies.
 * Markdown parsed from scratch (no external lib).
 *
 * @module MarkdownPreview
 */

import { useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { useIsMounted, copyToClipboard, downloadFile } from './shared';
import { IconCopy, IconCheck, IconEye, IconDownload } from './shared';

// ─── Inline SVG Icons ─────────────────────────────────────────────

function IconBold({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>;
}

function IconItalic({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" /></svg>;
}

function IconStrikethrough({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 4H9a3 3 0 0 0 0 6h6" /><path d="M8 14H9a3 3 0 0 1 0 6h7" /><line x1="4" x2="20" y1="12" y2="12" /></svg>;
}

function IconLink({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
}

function IconImage({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
}

function IconQuote({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" /></svg>;
}

function IconList({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>;
}

function IconListOrdered({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>;
}

function IconTable({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>;
}

function IconMinus({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /></svg>;
}

function IconClipboardPaste({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /></svg>;
}

function IconTrash({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>;
}

function IconFileCode({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m10 13-2 2 2 2" /><path d="m14 11 2 2-2 2" /></svg>;
}

function IconAlignLeft({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="17" x2="3" y1="10" y2="10" /><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="3" y1="14" y2="14" /><line x1="17" x2="3" y1="18" y2="18" /></svg>;
}

function IconClock({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

function IconHash({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" /></svg>;
}

function IconType({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>;
}

function IconFileText({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>;
}

function IconCode({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
}

// ─── Types ────────────────────────────────────────────────────────

export interface MdTemplate {
  id: string;
  name: string;
  content: string;
}

export interface MarkdownStats {
  chars: number;
  lines: number;
  words: number;
  readingTime: number;
}

type ToolbarAction = 'bold' | 'italic' | 'strikethrough' | 'code' | 'heading' | 'link' | 'image' | 'codeblock' | 'quote' | 'ul' | 'ol' | 'table' | 'hr';

export interface MarkdownPreviewProps {
  /** Initial markdown content (default empty) */
  defaultContent?: string;
  /** Template collection (shown in Samples dropdown) */
  templates?: MdTemplate[];
  /** localStorage key for auto-save (default "md-editor-content") */
  localStorageKey?: string;
  /** Auto-save debounce ms (default 500) */
  autoSaveMs?: number;
  /** Editor height (default "500px") */
  editorHeight?: string;
  /** Export filename (default "markdown-export.html") */
  exportFilename?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when markdown changes */
  onChange?: (markdown: string) => void;
  /** Accent color (default #d4a017) */
  accent?: string;
  /** Surface background (default #ebe5d0) */
  surface?: string;
  /** Text muted color (default #6b6356) */
  textMuted?: string;
  /** Additional CSS class */
  className?: string;
  /** Show mobile tab toggle (default true) */
  showMobileToggle?: boolean;
  /** Show stats bar (default true) */
  showStats?: boolean;
}

// ─── Default Templates ────────────────────────────────────────────

export const DEFAULT_TEMPLATES: MdTemplate[] = [
  { id: 'readme', name: 'README', content: `# My Project\n\n> A toolkit for building modern web applications.\n\n## Features\n\n- **Fast** — Sub-millisecond response times\n- **Type Safe** — Full TypeScript support\n- **Plugin System** — Extensible architecture\n\n## Installation\n\n\`\`\`bash\nnpm install my-project\n\`\`\`\n\n## Quick Start\n\n\`\`\`typescript\nimport { createApp } from 'my-project';\nconst app = createApp({ port: 3000 });\napp.start();\n\`\`\`` },
  { id: 'blog', name: 'Blog Post', content: `# Building Scalable APIs\n\n*Published December 2024*\n\n---\n\n## Introduction\n\nBuilding APIs that scale is **critical**.\n\n> "Make it work, make it right, make it fast."\n\n## Key Principles\n\n1. Each service owns its **data**\n2. Services communicate via **well-defined APIs**\n3. Services are **independently deployable**\n\n## Conclusion\n\nStart simple, measure everything, and evolve based on **real needs**.` },
  { id: 'docs', name: 'Documentation', content: `# API Reference\n\n*Version 3.2.0*\n\n---\n\n## Authentication\n\nInclude your API key in the \`Authorization\` header:\n\n\`\`\`bash\ncurl -H "Authorization: Bearer sk_live_abc123" \\\n  https://api.example.com/v3/users\n\`\`\`\n\n## Endpoints\n\n| Method | Path | Description |\n|--------|------|-------------|\n| GET | /v3/users | List users |\n| POST | /v3/users | Create user |\n| DELETE | /v3/users/:id | Delete user |` },
];

// ─── Markdown Parser (zero dependencies) ───────────────────────────

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inlineFormat(text: string): string {
  let r = escapeHtml(text);
  r = r.replace(/`([^`\n]+)`/g, '<code class="md-inline-code">$1</code>');
  r = r.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" />');
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
  r = r.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  r = r.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  r = r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  r = r.replace(/__(.+?)__/g, '<strong>$1</strong>');
  r = r.replace(/\*(.+?)\*/g, '<em>$1</em>');
  r = r.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');
  r = r.replace(/~~(.+?)~~/g, '<del>$1</del>');
  return r;
}

function highlightCode(code: string, _lang: string): string {
  let h = escapeHtml(code);
  h = h.replace(/(\/\/.*$|#.*$)/gm, '<span class="syn-comment">$1</span>');
  h = h.replace(/(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;)/g, '<span class="syn-string">$1</span>');
  h = h.replace(/\b(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|new|this|async|await|try|catch|throw|typeof|instanceof|switch|case|break|continue|default|interface|type|enum|public|private|protected|static|void|null|undefined|true|false|def|print|self|lambda|elif|pass|raise|with|as|yield|in|not|and|or|is)\b/g, '<span class="syn-keyword">$1</span>');
  h = h.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-number">$1</span>');
  h = h.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="syn-function">$1</span>');
  return h;
}

function parseMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inCode = false, codeContent = '', codeLang = '';
  let inList = false, listType: 'ul' | 'ol' | 'task' | '' = '';
  let inBQ = false;
  const tbl = { in: false, hd: false };

  const closeList = () => { if (inList) { out.push('</ul>'); inList = false; listType = ''; } };
  const closeBQ = () => { if (inBQ) { out.push('</blockquote>'); inBQ = false; } };
  const closeTbl = () => { if (tbl.in) { out.push('</tbody></table></div>'); tbl.in = false; tbl.hd = false; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith('```')) {
      if (inCode) { out.push(`<div class="md-code-block"><div class="md-code-header"><span>${escapeHtml(codeLang || 'code')}</span></div><pre><code>${highlightCode(codeContent.trimEnd(), codeLang)}</code></pre></div>`); inCode = false; codeContent = ''; codeLang = ''; }
      else { closeList(); closeBQ(); closeTbl(); inCode = true; codeLang = line.trimStart().slice(3).trim(); codeContent = ''; }
      continue;
    }
    if (inCode) { codeContent += line + '\n'; continue; }
    if (line.trim() === '') { closeList(); closeBQ(); closeTbl(); continue; }
    if (/^(\s*)([-*_])\s*\2\s*\2[\s\2]*$/.test(line.trim())) { closeList(); closeBQ(); closeTbl(); out.push('<hr class="md-hr" />'); continue; }
    const isTbl = line.includes('|') && line.trim().startsWith('|');
    const isSep = /^\|[\s:|-]+\|$/.test(line.trim());
    if (isTbl || (tbl.in && isSep)) {
      closeList(); closeBQ();
      if (!tbl.in) { out.push('<div class="md-table-wrap"><table class="md-table"><thead>'); tbl.in = true; }
      if (isSep) { out.push('</thead><tbody>'); tbl.hd = true; continue; }
      const cells = line.split('|').filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));
      const tag = !tbl.hd ? 'th' : 'td';
      out.push('<tr>'); for (const c of cells) out.push(`<${tag}>${inlineFormat(c.trim())}</${tag}>`); out.push('</tr>');
      continue;
    }
    if (tbl.in) closeTbl();
    const hm = line.match(/^(#{1,6})\s+(.+)$/);
    if (hm) { closeList(); closeBQ(); const lv = hm[1].length; out.push(`<h${lv} class="md-h${lv}">${inlineFormat(hm[2])}</h${lv}>`); continue; }
    if (line.trimStart().startsWith('>')) { closeList(); if (!inBQ) { out.push('<blockquote class="md-blockquote">'); inBQ = true; } out.push(`<p>${inlineFormat(line.trimStart().replace(/^>\s?/, ''))}</p>`); continue; }
    else if (inBQ) closeBQ();
    const tm = line.trimStart().match(/^[-*+]\s+\[([ xX])\]\s+(.+)$/);
    if (tm) { if (!inList || listType !== 'task') { closeList(); out.push('<ul class="md-task-list">'); inList = true; listType = 'task'; } out.push(`<li class="md-task-item"><input type="checkbox" disabled${tm[1] !== ' ' ? ' checked' : ''} /><span>${inlineFormat(tm[2])}</span></li>`); continue; }
    const um = line.trimStart().match(/^[-*+]\s+(.+)$/);
    if (um) { if (!inList || listType !== 'ul') { closeList(); out.push('<ul class="md-ul">'); inList = true; listType = 'ul'; } out.push(`<li>${inlineFormat(um[1])}</li>`); continue; }
    const om = line.trimStart().match(/^\d+\.\s+(.+)$/);
    if (om) { if (!inList || listType !== 'ol') { closeList(); out.push('<ol class="md-ol">'); inList = true; listType = 'ol'; } out.push(`<li>${inlineFormat(om[1])}</li>`); continue; }
    closeList(); closeBQ(); out.push(`<p>${inlineFormat(line)}</p>`);
  }
  if (inCode) { out.push(`<div class="md-code-block"><div class="md-code-header"><span>${escapeHtml(codeLang || 'code')}</span></div><pre><code>${highlightCode(codeContent.trimEnd(), codeLang)}</code></pre></div>`); }
  closeList(); closeBQ(); closeTbl();
  return out.join('\n');
}

// ─── Component ────────────────────────────────────────────────────

/**
 * MarkdownPreview — a split-pane Markdown editor with live preview.
 *
 * Features:
 * - Zero-dependency Markdown parser (GFM: tables, task lists, code blocks)
 * - Toolbar with bold, italic, heading, link, image, code, quote, lists, table, HR
 * - Heading level selector (H1–H6)
 * - Template loading (configurable)
 * - Copy markdown or HTML, export as HTML file
 * - Auto-save to localStorage
 * - Word count, reading time stats
 *
 * @example
 * ```tsx
 * import { MarkdownPreview } from './011_MarkdownPreview';
 * <MarkdownPreview defaultContent="# Hello" accent="#22c55e" />
 * ```
 */
export function MarkdownPreview({
  defaultContent = '',
  templates = DEFAULT_TEMPLATES,
  localStorageKey = 'md-editor-content',
  autoSaveMs = 500,
  editorHeight = '500px',
  exportFilename = 'markdown-export.html',
  placeholder,
  onChange,
  accent = '#d4a017',
  surface = '#ebe5d0',
  textMuted = '#6b6356',
  className,
  showMobileToggle = true,
  showStats = true,
}: MarkdownPreviewProps) {
  const mounted = useIsMounted();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [markdown, setMarkdown] = useState(() => {
    if (typeof window === 'undefined') return defaultContent;
    try { return localStorage.getItem(localStorageKey) || defaultContent; }
    catch { return defaultContent; }
  });
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [headingLevel, setHeadingLevel] = useState(1);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const debouncedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save
  useEffect(() => {
    if (debouncedRef.current) clearTimeout(debouncedRef.current);
    debouncedRef.current = setTimeout(() => {
      try { localStorage.setItem(localStorageKey, markdown); } catch { /* noop */ }
    }, autoSaveMs);
    return () => { if (debouncedRef.current) clearTimeout(debouncedRef.current); };
  }, [markdown, localStorageKey, autoSaveMs]);

  const stats = useMemo((): MarkdownStats => {
    const chars = markdown.length;
    const lines = markdown.split('\n').length;
    const words = markdown.trim() === '' ? 0 : markdown.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { chars, lines, words, readingTime };
  }, [markdown]);

  const htmlOutput = useMemo(() => parseMarkdown(markdown), [markdown]);

  useEffect(() => { onChange?.(markdown); }, [markdown, onChange]);

  const insertAtCursor = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const ta = textareaRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = markdown.slice(s, e); const ins = sel || placeholder;
    const nv = markdown.slice(0, s) + before + ins + after + markdown.slice(e);
    setMarkdown(nv);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + before.length + ins.length, s + before.length + ins.length); }, 0);
  }, [markdown]);

  const toolbarAction = useCallback((action: ToolbarAction) => {
    switch (action) {
      case 'bold': insertAtCursor('**', '**', 'bold text'); break;
      case 'italic': insertAtCursor('*', '*', 'italic text'); break;
      case 'strikethrough': insertAtCursor('~~', '~~', 'strikethrough'); break;
      case 'code': insertAtCursor('`', '`', 'code'); break;
      case 'heading': insertAtCursor('#'.repeat(headingLevel) + ' ', '', 'Heading'); break;
      case 'link': insertAtCursor('[', '](url)', 'link text'); break;
      case 'image': insertAtCursor('![', '](url)', 'alt text'); break;
      case 'codeblock': insertAtCursor('```\n', '\n```', 'code here'); break;
      case 'quote': insertAtCursor('> ', '', 'quote'); break;
      case 'ul': insertAtCursor('- ', '', 'list item'); break;
      case 'ol': insertAtCursor('1. ', '', 'list item'); break;
      case 'table': insertAtCursor('\n| Header | Header |\n|--------|--------|\n| Cell | Cell |\n', '', ''); break;
      case 'hr': insertAtCursor('\n---\n', '', ''); break;
    }
  }, [insertAtCursor, headingLevel]);

  const copyHtml = useCallback(async () => {
    await copyToClipboard(htmlOutput);
    setCopiedHtml(true); setTimeout(() => setCopiedHtml(false), 2000);
  }, [htmlOutput]);

  const copyMd = useCallback(async () => {
    await copyToClipboard(markdown);
    setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000);
  }, [markdown]);

  const exportHtml = useCallback(() => {
    const full = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Markdown Export</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;background:#1a1a2e;color:#e0e0e0;line-height:1.7}h1{color:#c084fc;font-size:2rem;border-bottom:1px solid #333;padding-bottom:.5rem}h2{color:#a78bfa;font-size:1.5rem}h3{color:#8b5cf6;font-size:1.25rem}code{background:#2d2d44;padding:.15rem .4rem;border-radius:4px;font-size:.9em;color:#c084fc}pre{background:#0d0d1a;border:1px solid #333;border-radius:8px;padding:1rem;overflow-x:auto}pre code{background:none;padding:0}blockquote{border-left:4px solid ${accent};margin:1rem 0;padding:.5rem 1rem;background:rgba(212,160,23,0.05)}table{border-collapse:collapse;width:100%;margin:1rem 0}th,td{border:1px solid #333;padding:.5rem .75rem;text-align:left}th{background:#2d2d44}hr{border:none;border-top:1px solid #333;margin:2rem 0}a{color:#c084fc;text-decoration:none}a:hover{text-decoration:underline}ul,ol{padding-left:1.5rem}li{margin:.25rem 0}del{color:#888}strong{color:#fff}</style></head><body>${htmlOutput}</body></html>`;
    downloadFile(full, exportFilename, 'text/html');
  }, [htmlOutput, accent, exportFilename]);

  const loadTemplate = useCallback((t: MdTemplate) => { setMarkdown(t.content); setShowTemplates(false); }, []);
  const clearEditor = useCallback(() => setMarkdown(''), []);
  const pasteClip = useCallback(async () => {
    try { const t = await navigator.clipboard.readText(); setMarkdown(p => p + t); } catch { /* noop */ }
  }, []);

  if (!mounted) return null;

  const TOOLBAR: { action: ToolbarAction; label: string; icon: React.FC<{ size?: number } & React.SVGProps<SVGSVGElement>> }[] = [
    { action: 'bold', label: 'Bold', icon: IconBold },
    { action: 'italic', label: 'Italic', icon: IconItalic },
    { action: 'strikethrough', label: 'Strikethrough', icon: IconStrikethrough },
    { action: 'code', label: 'Inline Code', icon: IconCode },
    { action: 'heading', label: 'Heading', icon: IconType },
    { action: 'link', label: 'Link', icon: IconLink },
    { action: 'image', label: 'Image', icon: IconImage },
    { action: 'codeblock', label: 'Code Block', icon: IconCode },
    { action: 'quote', label: 'Quote', icon: IconQuote },
    { action: 'ul', label: 'Unordered List', icon: IconList },
    { action: 'ol', label: 'Ordered List', icon: IconListOrdered },
    { action: 'table', label: 'Table', icon: IconTable },
    { action: 'hr', label: 'Horizontal Rule', icon: IconMinus },
  ];

  const btnCls = "p-1.5 border border-transparent hover:text-[#d4a017] hover:border-[#d4a017]/30 hover:bg-[#d4a017]/5 transition-all duration-200 cursor-pointer";
  const mutedColor = `${textMuted}`;

  return (
    <div className={className}>
      {/* Preview styles */}
      <style>{`
.md-preview{color:rgba(26,26,26,0.85);font-size:.9rem;line-height:1.75}
.md-preview h1{font-size:1.8rem;font-weight:700;color:#1a1a1a;margin:1.5rem 0 .75rem;padding-bottom:.5rem;border-bottom:1px solid ${accent}40}
.md-preview h2{font-size:1.45rem;font-weight:600;color:#1a1a1a;margin:1.25rem 0 .625rem;padding-bottom:.375rem;border-bottom:1px solid ${accent}20}
.md-preview h3{font-size:1.2rem;font-weight:600;color:#1a1a1a;margin:1rem 0 .5rem}
.md-preview h4,.md-preview h5,.md-preview h6{font-weight:600;color:#b8860b;margin:.75rem 0 .3rem}
.md-preview p{margin:.5rem 0}
.md-preview strong{color:#1a1a1a;font-weight:600}
.md-preview em{color:#b8860b}
.md-preview del{color:rgba(26,26,26,.4)}
.md-preview a.md-link{color:#b8860b;text-decoration:none;border-bottom:1px solid ${accent}40;transition:border-color .2s,color .2s}
.md-preview a.md-link:hover{border-color:#d4a017;color:#d4a017}
.md-preview .md-inline-code{background:${accent}10;border:1px solid ${accent}20;color:#b8860b;padding:.1rem .4rem;border-radius:4px;font-size:.85em;font-family:'SF Mono','Fira Code',monospace}
.md-preview .md-code-block{background:#0a0a12;border:1px solid rgba(26,26,26,.12);border-radius:10px;margin:.875rem 0;overflow:hidden}
.md-preview .md-code-header{background:rgba(26,26,26,.06);border-bottom:1px solid rgba(26,26,26,.08);padding:.4rem 1rem;font-size:.7rem;color:rgba(26,26,26,.5);font-family:'SF Mono','Fira Code',monospace;text-transform:uppercase;letter-spacing:.05em}
.md-preview .md-code-block pre{margin:0;padding:1rem;overflow-x:auto}
.md-preview .md-code-block code{font-family:'SF Mono','Fira Code',monospace;font-size:.8rem;line-height:1.6;color:#e8e0cc}
.md-preview .md-blockquote{border-left:3px solid ${accent};margin:.875rem 0;padding:.625rem 1rem;background:${accent}08;border-radius:0 8px 8px 0;color:rgba(26,26,26,.7)}
.md-preview .md-blockquote p{margin:.25rem 0}
.md-preview .md-ul{list-style:disc;padding-left:1.5rem;margin:.5rem 0}
.md-preview .md-ol{list-style:decimal;padding-left:1.5rem;margin:.5rem 0}
.md-preview .md-task-list{list-style:none;padding-left:.25rem;margin:.5rem 0}
.md-preview .md-task-item{display:flex;align-items:flex-start;gap:.5rem;margin:.375rem 0}
.md-preview .md-task-item input[type="checkbox"]{appearance:none;-webkit-appearance:none;width:16px;height:16px;min-width:16px;border:2px solid ${accent}60;border-radius:4px;background:transparent;margin-top:4px;cursor:default;position:relative;transition:all .2s}
.md-preview .md-task-item input[type="checkbox"]:checked{background:${accent}20;border-color:#b8860b}
.md-preview .md-task-item input[type="checkbox"]:checked::after{content:'✓';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#b8860b;font-size:10px;font-weight:bold}
.md-preview .md-hr{border:none;height:1px;background:linear-gradient(90deg,transparent,${accent}30,transparent);margin:1.5rem 0}
.md-preview .md-img{max-width:100%;border-radius:8px;margin:.5rem 0}
.md-preview .md-table-wrap{overflow-x:auto;margin:.875rem 0;border-radius:8px;border:1px solid rgba(26,26,26,.1)}
.md-preview .md-table{width:100%;border-collapse:collapse;font-size:.82rem}
.md-preview .md-table th{background:${accent}10;border:1px solid rgba(26,26,26,.1);padding:.5rem .75rem;text-align:left;font-weight:600;color:#b8860b;font-size:.78rem;text-transform:uppercase;letter-spacing:.03em}
.md-preview .md-table td{border:1px solid rgba(26,26,26,.08);padding:.4375rem .75rem;color:rgba(26,26,26,.7)}
.md-preview .md-table tbody tr:nth-child(even){background:${accent}05}
.md-preview .md-table tbody tr:hover{background:${accent}0A}
.md-preview .syn-keyword{color:#ff79c6}.md-preview .syn-string{color:#f1fa8c}.md-preview .syn-function{color:#50fa7b}.md-preview .syn-comment{color:#6272a4;font-style:italic}.md-preview .syn-number{color:#bd93f9}
`}</style>

      {/* Main container */}
      <div>
        {/* Toolbar */}
        <div className="rounded-t-xl border border-[#1a1a1a]/15 border-b-0 overflow-hidden" style={{ backgroundColor: surface }}>
          {/* Chrome bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]/12" style={{ backgroundColor: surface }}>
            <div className="flex gap-1.5"><div className="w-3 h-3 bg-red-500/80" /><div className="w-3 h-3 bg-yellow-500/80" /><div className="w-3 h-3 bg-green-500/80" /></div>
            <span className="text-xs font-mono ml-2" style={{ color: `${textMuted}60` }}>markdown-lab</span>
            <div className="flex-1" />

            {showMobileToggle && (
              <div className="flex lg:hidden items-center gap-1 mr-3">
                <button onClick={() => setMobileTab('editor')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${mobileTab === 'editor' ? 'bg-[#d4a017]/15 border border-[#d4a017]/30 text-[#d4a017]' : `${mutedColor}50 border border-transparent`}`} aria-label="Show editor"><IconAlignLeft size={14} /><span className="hidden sm:inline">Edit</span></button>
                <button onClick={() => setMobileTab('preview')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${mobileTab === 'preview' ? 'bg-[#d4a017]/15 border border-[#d4a017]/30 text-[#d4a017]' : `${mutedColor}50 border border-transparent`}`} aria-label="Show preview"><IconEye size={14} /><span className="hidden sm:inline">Preview</span></button>
              </div>
            )}

            {showStats && (
              <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono" style={{ color: `${textMuted}55` }}>
                <span>{stats.chars} chars</span><span>{stats.lines} lines</span><span>{stats.words} words</span>
                <span className="flex items-center gap-1"><IconClock size={12} />{stats.readingTime} min read</span>
              </div>
            )}
          </div>

          {/* Toolbar buttons */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[#1a1a1a]/12 flex-wrap">
            {TOOLBAR.map(btn => {
              if (btn.action === 'heading') {
                return (
                  <div key="heading-select" className="relative">
                    <button onClick={() => setShowHeadingMenu(v => !v)} className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono border border-[#1a1a1a]/12 transition-all duration-200 cursor-pointer hover:text-[#d4a017] hover:border-[#d4a017]/30 hover:bg-[#d4a017]/5" style={{ backgroundColor: surface, color: `${textMuted}80` }} title={`H${headingLevel}`} aria-label={`Heading level ${headingLevel}`}>
                      <span className="font-bold" style={{ color: accent }}>H</span><span>{headingLevel}</span>
                    </button>
                    {showHeadingMenu && (
                      <div className="absolute top-full left-0 mt-1 border border-[#1a1a1a]/20 shadow-xl z-50 overflow-hidden py-1" style={{ backgroundColor: surface }}>
                        {[1, 2, 3, 4, 5, 6].map(lv => (
                          <button key={lv} onClick={() => { setHeadingLevel(lv); setShowHeadingMenu(false); toolbarAction('heading'); }} className={`block w-full text-left px-4 py-1.5 text-xs font-mono hover:bg-[#d4a017]/10 transition-colors duration-200 cursor-pointer ${lv === headingLevel ? 'text-[#d4a017] bg-[#d4a017]/5' : `${mutedColor}60`}`}>
                            <span className="font-bold" style={{ fontSize: `${18 - lv * 2}px` }}>H{lv}</span> Heading {lv}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              const Ic = btn.icon;
              return <button key={btn.action} onClick={() => toolbarAction(btn.action)} className={btnCls} style={{ color: `${textMuted}80` }} title={btn.label} aria-label={btn.label}><Ic size={16} /></button>;
            })}

            <div className="w-px h-5 bg-[#1a1a1a]/10 mx-1" />

            <button onClick={() => setShowTemplates(v => !v)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono border border-[#1a1a1a]/12 transition-all duration-200 cursor-pointer hover:text-[#d4a017] hover:border-[#d4a017]/30 hover:bg-[#d4a017]/5" style={{ backgroundColor: surface, color: `${textMuted}80` }} title="Load sample"><IconFileCode size={14} /><span className="hidden md:inline">Samples</span></button>
            <button onClick={pasteClip} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono border border-[#1a1a1a]/12 transition-all duration-200 cursor-pointer hover:text-[#d4a017] hover:border-[#d4a017]/30 hover:bg-[#d4a017]/5" style={{ backgroundColor: surface, color: `${textMuted}80` }} title="Paste from clipboard"><IconClipboardPaste size={14} /><span className="hidden md:inline">Paste</span></button>
            <button onClick={clearEditor} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono border border-[#1a1a1a]/12 transition-all duration-200 cursor-pointer hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5" style={{ backgroundColor: surface, color: `${textMuted}80` }} title="Clear editor"><IconTrash size={14} /></button>
          </div>

          {/* Template dropdown */}
          {showTemplates && (
            <div className="flex flex-wrap gap-2 px-3 py-3 border-b border-[#1a1a1a]/12" style={{ backgroundColor: surface }}>
              {templates.map(t => (
                <button key={t.id} onClick={() => loadTemplate(t)} className="flex items-center gap-2 px-3 py-2 border border-[#1a1a1a]/12 transition-all duration-200 cursor-pointer hover:bg-[#d4a017]/10 hover:border-[#d4a017]/30" style={{ backgroundColor: surface }}>
                  <IconFileCode size={16} style={{ color: '#b8860b' }} /><span className="text-xs font-mono" style={{ color: `${textMuted}80` }}>{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editor + Preview split */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '500px' }}>
          {/* Editor */}
          <div className={`lg:border-r border-[#1a1a1a]/15 border-b lg:border-b-0 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`} style={{ backgroundColor: surface }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1a1a]/12">
              <IconType size={14} style={{ color: `${textMuted}60` }} /><span className="text-xs font-mono" style={{ color: `${textMuted}60` }}>EDITOR</span>
              <div className="flex-1" />
              <button onClick={copyMd} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-colors duration-200 cursor-pointer hover:text-[#1a1a1a]/70" style={{ color: `${textMuted}60` }} aria-label="Copy markdown">
                {copiedCode ? <IconCheck size={12} style={{ color: '#b8860b' }} /> : <IconCopy size={12} />}{copiedCode ? 'Copied!' : 'Copy MD'}
              </button>
            </div>
            <textarea ref={textareaRef} value={markdown} onChange={e => setMarkdown(e.target.value)} className="w-full bg-transparent text-[#1a1a1a] font-mono text-sm p-4 outline-none resize-none leading-relaxed" style={{ height: editorHeight, color: '#1a1a1a' }} placeholder={placeholder ?? 'Start writing markdown here...\n\nTry loading a sample template to get started!'} spellCheck={false} aria-label="Markdown editor" />
            {showStats && (
              <div className="flex items-center gap-3 px-4 py-2 border-t border-[#1a1a1a]/12 text-[10px] font-mono lg:hidden" style={{ color: `${textMuted}55` }}>
                <span>{stats.chars} chars</span><span>{stats.lines} lines</span><span>{stats.words} words</span>
                <span className="flex items-center gap-1"><IconClock size={12} />{stats.readingTime} min</span>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className={`${mobileTab !== 'preview' ? 'hidden lg:block' : ''}`} style={{ backgroundColor: surface }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1a1a]/12">
              <IconEye size={14} style={{ color: `${textMuted}60` }} /><span className="text-xs font-mono" style={{ color: `${textMuted}60` }}>PREVIEW</span>
              <div className="flex-1" />
              <button onClick={copyHtml} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-colors duration-200 cursor-pointer hover:text-[#1a1a1a]/70" style={{ color: `${textMuted}60` }} aria-label="Copy HTML">
                {copiedHtml ? <IconCheck size={12} style={{ color: '#b8860b' }} /> : <IconCopy size={12} />}{copiedHtml ? 'Copied!' : 'Copy HTML'}
              </button>
              <button onClick={exportHtml} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-colors duration-200 cursor-pointer hover:text-[#1a1a1a]/70" style={{ color: `${textMuted}60` }} aria-label="Export as HTML">
                <IconDownload size={12} />Export
              </button>
            </div>
            <div className="overflow-y-auto p-4 md:p-6" style={{ height: editorHeight }}>
              {markdown.trim() ? (
                <div className="md-preview" dangerouslySetInnerHTML={{ __html: htmlOutput }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div style={{ color: `${textMuted}20` }} className="text-6xl mb-4 font-mono">#</div>
                  <p className="text-sm font-mono" style={{ color: `${textMuted}40` }}>Start typing to see the live preview</p>
                  <p className="text-xs font-mono mt-2" style={{ color: `${textMuted}20` }}>or load a sample template from the toolbar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="rounded-b-xl border border-t-0 border-[#1a1a1a]/15" style={{ backgroundColor: surface }}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            {showStats && (
              <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: `${textMuted}55` }}>
                <span className="flex items-center gap-1"><IconHash size={12} />{stats.chars} chars</span>
                <span>{stats.lines} lines</span>
                <span className="flex items-center gap-1"><IconType size={12} />{stats.words} words</span>
                <span className="flex items-center gap-1"><IconClock size={12} />{stats.readingTime} min read</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono" style={{ color: `${textMuted}30` }}>Auto-saved</span>
              <div className="w-1.5 h-1.5 bg-violet-400/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarkdownPreview;
