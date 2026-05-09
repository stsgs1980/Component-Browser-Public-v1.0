// --- source: Code-Snippets-Gallery / snippet-preview.tsx ---
// LRU-cached sandboxed iframe renderer. Accepts a generic id + HTML content,
// so it can render any sandboxed preview (code, HTML, SVG, etc.).
// De-hardcoded: removed domain-specific Snippet type, made fully generic.

import { useRef, useEffect, memo } from 'react';

const MAX_CACHE_SIZE = 100;
const htmlCache = new Map<string, string>();

function getCachedHTML(id: string): string | undefined {
  const html = htmlCache.get(id);
  if (html) {
    htmlCache.delete(id);
    htmlCache.set(id, html); // promote to most-recently-used
  }
  return html;
}

function setCachedHTML(id: string, html: string) {
  if (htmlCache.size >= MAX_CACHE_SIZE) {
    const firstKey = htmlCache.keys().next().value;
    if (firstKey) htmlCache.delete(firstKey);
  }
  htmlCache.set(id, html);
}

interface SandboxedPreviewProps {
  /** Unique key for caching the generated HTML */
  id: string;
  /** Full HTML string to render inside the sandboxed iframe */
  html: string | (() => string);
  /** Accessible title for the iframe */
  title?: string;
  /** Extra CSS classes */
  className?: string;
  /** Sandbox permissions (default: allow-scripts allow-same-origin for WebGL) */
  sandbox?: string;
}

export const SandboxedPreview = memo(function SandboxedPreview({
  id,
  html,
  title = 'Preview',
  className,
  sandbox = 'allow-scripts allow-same-origin',
}: SandboxedPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let htmlStr = getCachedHTML(id);
    if (!htmlStr) {
      htmlStr = typeof html === 'function' ? html() : html;
      setCachedHTML(id, htmlStr);
    }

    iframe.srcdoc = htmlStr;
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <iframe
      ref={iframeRef}
      sandbox={sandbox}
      className={`w-full h-full border-0 ${className || ''}`}
      title={title}
    />
  );
});
