// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1134

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Zap,
  Shield,
  Code2,
  Terminal,
  GitBranch,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

/* ================================================================
   TYPES
   ================================================================ */

interface CodeTab {
  id: string;
  label: string;
  language: string;
  code: React.ReactNode;
}

interface MetricItem {
  value: string;
  suffix: string;
  label: string;
  numericValue: number;
  decimals?: number;
}

interface FeatureCardData {
  icon: React.ReactNode;
  title: string;
  description: string;
  code: React.ReactNode;
  accentColor: string;
  filename: string;
}

/* ================================================================
   MINI CODE EDITOR (VS Code–like window)
   ================================================================ */

function CodeEditor({
  filename,
  children,
  showLineNumbers = true,
  className = '',
}: {
  filename: string;
  children: React.ReactNode;
  showLineNumbers?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(() => {
    const el = codeRef.current;
    if (!el) return;
    const text = el.innerText ?? '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Count lines based on React children
  const lineCount = countLines(children);

  return (
    <div
      className={`rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d1117] shadow-2xl shadow-black/40 ${className}`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {/* Window dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          {/* Filename */}
          <span className="text-xs text-white/40 font-mono ml-2">{filename}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/[0.05]"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code body */}
      <div className="overflow-x-auto custom-scrollbar">
        <pre ref={codeRef} className="p-4 text-[13px] leading-relaxed font-mono">
          {showLineNumbers ? (
            <div className="flex">
              <div className="select-none text-white/20 text-right pr-4 flex-shrink-0" style={{ minWidth: '2.5rem' }}>
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={`line-no-${i}`}>{i + 1}</div>
                ))}
              </div>
              <div className="flex-1 overflow-x-auto">{children}</div>
            </div>
          ) : (
            children
          )}
        </pre>
      </div>
    </div>
  );
}

function countLines(node: React.ReactNode): number {
  if (!node) return 0;
  if (typeof node === 'string') return node.split('\n').length;
  if (Array.isArray(node)) {
    return node.reduce((acc, child) => acc + countLines(child), 0);
  }
  if (React.isValidElement(node)) {
    // Each <div> wrapper represents one line of code
    if (node.type === 'div') return 1;
    // For fragments and other containers, recurse into children
    return node.props.children ? countLines(node.props.children) : 0;
  }
  return 0;
}

/* ================================================================
   GRADIENT BORDER CARD
   ================================================================ */

function GradientBorderCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative rounded-2xl ${className}`}>
      {/* Gradient border pseudo-element */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 opacity-50 group-hover:opacity-100 group-hover:from-emerald-400/60 group-hover:via-cyan-400/60 group-hover:to-emerald-400/60 transition-all duration-500 blur-[0px]" />
      {/* Inner card */}
      <div className="relative rounded-2xl bg-[#12121a]/90 backdrop-blur-xl border border-white/[0.06] p-6 h-full">
        {children}
      </div>
    </div>
  );
}

/* ================================================================
   CODE SNIPPETS  (using custom syntax-highlight classes)
   ================================================================ */

const heroCodeSnippet = (
  <>
    <div>
      <span className="syn-keyword">import</span>{' '}
      <span className="syn-bracket">&#123;</span>
      <span className="syn-type">useState</span>,{' '}
      <span className="syn-type">useEffect</span>
      <span className="syn-bracket">&#125;</span>{' '}
      <span className="syn-keyword">from</span>{' '}
      <span className="syn-string">&apos;react&apos;</span>;
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-keyword">export function</span>{' '}
      <span className="syn-function">App</span>
      <span className="syn-bracket">&#40;</span>
      <span className="syn-bracket">&#41;</span>{' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-keyword">const</span>{' '}
      [<span className="syn-property">data</span>,{' '}
      <span className="syn-function">setData</span>] ={' '}
      <span className="syn-function">useState</span>(<span className="syn-keyword">null</span>);
    </div>
    <div>&nbsp;</div>
    <div>
      {'  '}
      <span className="syn-function">useEffect</span>(<span className="syn-bracket">&#40;</span>
      <span className="syn-bracket">&#41;</span>{' '}
      <span className="syn-keyword">=&gt;</span>{' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'    '}
      <span className="syn-function">fetch</span>(<span className="syn-string">&apos;/api/data&apos;</span>)
    </div>
    <div>
      {'      '}.
      <span className="syn-function">then</span>(<span className="syn-property">res</span>{' '}
      <span className="syn-keyword">=&gt;</span>{' '}
      <span className="syn-property">res</span>.
      <span className="syn-function">json</span>())
    </div>
    <div>
      {'      '}.
      <span className="syn-function">then</span>(<span className="syn-function">setData</span>);
    </div>
    <div>
      {'  '}
      <span className="syn-bracket">&#125;</span>, []);
    </div>
    <div>&nbsp;</div>
    <div>
      {'  '}
      <span className="syn-keyword">return</span>{' '}
      <span className="syn-bracket">&#40;</span>
    </div>
    <div>
      {'    '}
      <span className="syn-tag">&lt;main</span>{' '}
      <span className="syn-attr">className</span>
      <span className="syn-punctuation">=</span>
      <span className="syn-string">&quot;app&quot;</span>
      <span className="syn-tag">&gt;</span>
    </div>
    <div>
      {'      '}
      <span className="syn-tag">&lt;Dashboard</span>{' '}
      <span className="syn-attr">data</span>
      <span className="syn-punctuation">=</span>
      <span className="syn-bracket">&#123;</span>
      <span className="syn-property">data</span>
      <span className="syn-bracket">&#125;</span>{' '}
      <span className="syn-tag">/&gt;</span>
    </div>
    <div>
      {'    '}
      <span className="syn-tag">&lt;/main&gt;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-bracket">&#41;</span>;
    </div>
    <div>
      <span className="syn-bracket">&#125;</span>
    </div>
  </>
);

const performanceCode = (
  <>
    <div>
      <span className="syn-comment">{'// Optimize with dynamic imports'}</span>
    </div>
    <div>
      <span className="syn-keyword">import</span>{' '}
      <span className="syn-function">lazy</span>{' '}
      <span className="syn-keyword">from</span>{' '}
      <span className="syn-string">&apos;react&apos;</span>;
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-keyword">const</span>{' '}
      <span className="syn-type">Chart</span> ={' '}
      <span className="syn-function">lazy</span>(<span className="syn-bracket">&#40;</span>
      <span className="syn-bracket">&#41;</span>{' '}
      <span className="syn-keyword">=&gt;</span>{' '}
    </div>
    <div>
      {'  '}
      <span className="syn-function">import</span>(<span className="syn-string">&apos;./Chart&apos;</span>)
    </div>
    <div>
      <span className="syn-bracket">&#41;</span>;
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-comment">{'// Edge runtime for speed'}</span>
    </div>
    <div>
      <span className="syn-keyword">export const</span>{' '}
      <span className="syn-function">runtime</span> ={' '}
      <span className="syn-string">&apos;edge&apos;</span>;
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-comment">{'// Response in <50ms avg'}</span>
    </div>
    <div>
      <span className="syn-keyword">export async function</span>{' '}
      <span className="syn-function">GET</span>(){' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-keyword">return</span>{' '}
      <span className="syn-type">Response</span>.
      <span className="syn-function">json</span>(<span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'    '}
      <span className="syn-property">latency</span>:{' '}
      <span className="syn-number">12</span>,
    </div>
    <div>
      {'    '}
      <span className="syn-property">cached</span>:{' '}
      <span className="syn-keyword">true</span>,
    </div>
    <div>
      {'  '}
      <span className="syn-bracket">&#125;</span>);
    </div>
    <div>
      <span className="syn-bracket">&#125;</span>
    </div>
  </>
);

const typeSafeCode = (
  <>
    <div>
      <span className="syn-comment">{'// Fully typed API contracts'}</span>
    </div>
    <div>
      <span className="syn-keyword">interface</span>{' '}
      <span className="syn-type">User</span>{' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-property">id</span>:{' '}
      <span className="syn-type">string</span>;
    </div>
    <div>
      {'  '}
      <span className="syn-property">name</span>:{' '}
      <span className="syn-type">string</span>;
    </div>
    <div>
      {'  '}
      <span className="syn-property">email</span>:{' '}
      <span className="syn-type">string</span>;
    </div>
    <div>
      {'  '}
      <span className="syn-property">role</span>:{' '}
      <span className="syn-string">&apos;admin&apos;</span>{' '}
      | <span className="syn-string">&apos;user&apos;</span>;
    </div>
    <div>
      <span className="syn-bracket">&#125;</span>
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-keyword">async function</span>{' '}
      <span className="syn-function">getUser</span>(<span className="syn-bracket">&#40;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-property">id</span>:{' '}
      <span className="syn-type">string</span>
    </div>
    <div>
      <span className="syn-bracket">&#41;</span>{' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-keyword">const</span>{' '}
      <span className="syn-property">res</span> ={' '}
      <span className="syn-keyword">await</span>{' '}
    </div>
    <div>
      {'    '}
      <span className="syn-function">fetch</span>(<span className="syn-string">`/api/users/$&#123;id&#125;`</span>);
    </div>
    <div>
      {'  '}
      <span className="syn-keyword">return</span>{' '}
      <span className="syn-property">res</span>.
      <span className="syn-function">json</span>(){' '}
      <span className="syn-keyword">as</span>{' '}
      <span className="syn-type">Promise</span>
      <span className="syn-bracket">&lt;</span>
      <span className="syn-type">User</span>
      <span className="syn-bracket">&gt;</span>;
    </div>
    <div>
      <span className="syn-bracket">&#125;</span>
    </div>
  </>
);

const apiFirstCode = (
  <>
    <div>
      <span className="syn-comment">{'// RESTful API endpoint'}</span>
    </div>
    <div>
      <span className="syn-keyword">import</span>{' '}
      <span className="syn-bracket">&#123;</span>{' '}
      <span className="syn-type">NextResponse</span>{' '}
      <span className="syn-bracket">&#125;</span>{' '}
      <span className="syn-keyword">from</span>{' '}
      <span className="syn-string">&apos;next/server&apos;</span>;
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-keyword">export async function</span>{' '}
      <span className="syn-function">POST</span>(<span className="syn-bracket">&#40;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-property">req</span>:{' '}
      <span className="syn-type">Request</span>
    </div>
    <div>
      <span className="syn-bracket">&#41;</span>{' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-keyword">const</span>{' '}
      <span className="syn-property">body</span> ={' '}
      <span className="syn-keyword">await</span>{' '}
      <span className="syn-property">req</span>.
      <span className="syn-function">json</span>();
    </div>
    <div>&nbsp;</div>
    <div>
      {'  '}
      <span className="syn-keyword">const</span>{' '}
      <span className="syn-property">result</span> ={' '}
      <span className="syn-keyword">await</span>{' '}
    </div>
    <div>
      {'    '}
      <span className="syn-function">processData</span>(<span className="syn-property">body</span>);
    </div>
    <div>&nbsp;</div>
    <div>
      {'  '}
      <span className="syn-keyword">return</span>{' '}
      <span className="syn-type">NextResponse</span>.
      <span className="syn-function">json</span>(<span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'    '}
      <span className="syn-property">success</span>:{' '}
      <span className="syn-keyword">true</span>,
    </div>
    <div>
      {'    '}
      <span className="syn-property">data</span>:{' '}
      <span className="syn-property">result</span>,
    </div>
    <div>
      {'  '}
      <span className="syn-bracket">&#125;</span>);
    </div>
    <div>
      <span className="syn-bracket">&#125;</span>
    </div>
  </>
);

/* ================================================================
   LIVE CODE PREVIEW  — tab content
   ================================================================ */

const reactPreviewCode = (
  <>
    <div>
      <span className="syn-keyword">export default function</span>{' '}
      <span className="syn-function">Card</span>(<span className="syn-bracket">&#123;</span>
      <span className="syn-property">title</span>,{' '}
      <span className="syn-property">count</span>{' '}
      <span className="syn-bracket">&#125;</span>){' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-keyword">return</span>{' '}
      <span className="syn-bracket">&#40;</span>
    </div>
    <div>
      {'    '}
      <span className="syn-tag">&lt;div</span>{' '}
      <span className="syn-attr">className</span>
      <span className="syn-punctuation">=</span>
      <span className="syn-string">&quot;card&quot;</span>
      <span className="syn-tag">&gt;</span>
    </div>
    <div>
      {'      '}
      <span className="syn-tag">&lt;h2&gt;</span>
      <span className="syn-bracket">&#123;</span>
      <span className="syn-property">title</span>
      <span className="syn-bracket">&#125;</span>
      <span className="syn-tag">&lt;/h2&gt;</span>
    </div>
    <div>
      {'      '}
      <span className="syn-tag">&lt;span&gt;</span>
      <span className="syn-bracket">&#123;</span>
      <span className="syn-property">count</span>
      <span className="syn-bracket">&#125;</span>{' '}
      <span className="syn-tag">&lt;/span&gt;</span>
    </div>
    <div>
      {'    '}
      <span className="syn-tag">&lt;/div&gt;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-bracket">&#41;</span>;
    </div>
    <div>
      <span className="syn-bracket">&#125;</span>
    </div>
  </>
);

const pythonPreviewCode = (
  <>
    <div>
      <span className="syn-keyword">from</span>{' '}
      <span className="syn-type">fastapi</span>{' '}
      <span className="syn-keyword">import</span>{' '}
      <span className="syn-type">FastAPI</span>
    </div>
    <div>
      <span className="syn-keyword">from</span>{' '}
      <span className="syn-type">pydantic</span>{' '}
      <span className="syn-keyword">import</span>{' '}
      <span className="syn-type">BaseModel</span>
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-property">app</span> ={' '}
      <span className="syn-function">FastAPI</span>()
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-keyword">class</span>{' '}
      <span className="syn-type">Item</span>(<span className="syn-type">BaseModel</span>)
      <span className="syn-bracket">:</span>
    </div>
    <div>
      {'    '}
      <span className="syn-property">name</span>:{' '}
      <span className="syn-type">str</span>
    </div>
    <div>
      {'    '}
      <span className="syn-property">price</span>:{' '}
      <span className="syn-type">float</span>
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-decorator">@app</span>.
      <span className="syn-function">post</span>(<span className="syn-string">&quot;/items&quot;</span>)
    </div>
    <div>
      <span className="syn-keyword">def</span>{' '}
      <span className="syn-function">create_item</span>(<span className="syn-property">item</span>:{' '}
      <span className="syn-type">Item</span>)
      <span className="syn-bracket">:</span>
    </div>
    <div>
      {'    '}
      <span className="syn-keyword">return</span>{' '}
      <span className="syn-bracket">&#123;</span>
      <span className="syn-string">&quot;ok&quot;</span>
      <span className="syn-bracket">:</span>{' '}
      <span className="syn-keyword">True</span>,{' '}
      <span className="syn-string">&quot;item&quot;</span>
      <span className="syn-bracket">:</span>{' '}
      <span className="syn-property">item</span>
      <span className="syn-bracket">&#125;</span>
    </div>
  </>
);

const cssPreviewCode = (
  <>
    <div>
      <span className="syn-comment">{'/* Glassmorphism card */'}</span>
    </div>
    <div>
      <span className="syn-tag">.card</span>{' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-property">background</span>:{' '}
      <span className="syn-function">rgba</span>(<span className="syn-number">255</span>,{' '}
      <span className="syn-number">255</span>,{' '}
      <span className="syn-number">255</span>,{' '}
      <span className="syn-number">0.05</span>);
    </div>
    <div>
      {'  '}
      <span className="syn-property">backdrop-filter</span>:{' '}
      <span className="syn-function">blur</span>(<span className="syn-number">12px</span>);
    </div>
    <div>
      {'  '}
      <span className="syn-property">border</span>:{' '}
      <span className="syn-number">1px</span>{' '}
      <span className="syn-function">solid</span>{' '}
      <span className="syn-function">rgba</span>(<span className="syn-number">255</span>,{' '}
      <span className="syn-number">255</span>,{' '}
      <span className="syn-number">255</span>,{' '}
      <span className="syn-number">0.1</span>);
    </div>
    <div>
      {'  '}
      <span className="syn-property">border-radius</span>:{' '}
      <span className="syn-number">16px</span>;
    </div>
    <div>
      {'  '}
      <span className="syn-property">transition</span>:{' '}
      <span className="syn-function">transform</span>{' '}
      <span className="syn-number">0.3s</span>{' '}
      <span className="syn-function">ease</span>;
    </div>
    <div>
      <span className="syn-bracket">&#125;</span>
    </div>
    <div>&nbsp;</div>
    <div>
      <span className="syn-tag">.card</span>
      <span className="syn-punctuation">:</span>
      <span className="syn-function">hover</span>{' '}
      <span className="syn-bracket">&#123;</span>
    </div>
    <div>
      {'  '}
      <span className="syn-property">transform</span>:{' '}
      <span className="syn-function">translateY</span>(<span className="syn-number">-4px</span>);
    </div>
    <div>
      <span className="syn-bracket">&#125;</span>
    </div>
  </>
);

/* ================================================================
   PREVIEW PANELS (what the code renders)
   ================================================================ */

function ReactPreviewPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-5 w-full max-w-[260px] backdrop-blur-sm">
        <div className="text-sm font-semibold text-white/90 mb-2">Dashboard</div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 text-xs font-bold">A</span>
          </div>
          <div>
            <div className="text-xs text-white/70">Welcome back</div>
            <div className="text-sm text-white/90 font-medium">Alex Chen</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">2.4k</div>
            <div className="text-[10px] text-white/50">Users</div>
          </div>
          <div className="bg-cyan-500/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-cyan-400">98%</div>
            <div className="text-[10px] text-white/50">Uptime</div>
          </div>
        </div>
      </div>
      <p className="text-xs text-white/30 text-center">React component preview</p>
    </div>
  );
}

function PythonPreviewPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <div className="w-full max-w-[300px] space-y-3">
        <div className="text-xs text-white/40 font-mono mb-2">$ curl -X POST /items</div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 font-mono text-[12px]">
          <div className="text-amber-400/80 mb-1">POST /items</div>
          <div className="text-white/40">
            {'{'}&quot;name&quot;: &quot;Widget&quot;, &quot;price&quot;: 29.99{'}'}
          </div>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 font-mono text-[12px]">
          <div className="text-emerald-400/80 mb-1">200 OK</div>
          <div className="text-white/60">
            {'{\&quot;ok\&quot;: true, \&quot;item\&quot;: {…}\}'}
          </div>
        </div>
      </div>
      <p className="text-xs text-white/30 text-center">FastAPI endpoint preview</p>
    </div>
  );
}

function CssPreviewPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
      <div className="bg-white/[0.06] backdrop-blur-md border border-white/[0.1] rounded-2xl p-6 w-full max-w-[220px] text-center shadow-lg shadow-black/20 transition-transform hover:-translate-y-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 mx-auto mb-3 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="text-sm font-medium text-white/90">Glass Card</div>
        <div className="text-xs text-white/40 mt-1">Hover me!</div>
      </div>
      <p className="text-xs text-white/30 text-center">CSS glassmorphism preview</p>
    </div>
  );
}

/* ================================================================
   COUNT-UP ANIMATION HOOK
   ================================================================ */

function useCountUp(target: number, decimals = 0, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (inView && !hasStarted.current) {
      hasStarted.current = true;
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }
  }, [inView, target, duration]);

  return { ref, displayValue: count.toFixed(decimals) };
}

/* ================================================================
   MAIN COMPONENT — DevexSection
   ================================================================ */

export function DevexSection() {
  /* ---------- State ---------- */
  const [activeTab, setActiveTab] = useState<string>('react');

  /* ---------- Feature card data ---------- */
  const features: FeatureCardData[] = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Lightning Fast',
      description:
        'Edge runtime, dynamic imports, and aggressive caching deliver sub-50ms responses globally.',
      code: performanceCode,
      accentColor: 'text-amber-400',
      filename: 'performance.ts',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Type Safe',
      description:
        'End-to-end TypeScript with Zod validation ensures your data stays safe from API to UI.',
      code: typeSafeCode,
      accentColor: 'text-emerald-400',
      filename: 'types.ts',
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: 'API First',
      description:
        'Clean RESTful endpoints with automatic type generation and built-in error handling.',
      code: apiFirstCode,
      accentColor: 'text-cyan-400',
      filename: 'api/route.ts',
    },
  ];

  /* ---------- Code preview tabs ---------- */
  const previewTabs: CodeTab[] = [
    { id: 'react', label: 'React', language: 'tsx', code: reactPreviewCode },
    { id: 'python', label: 'Python', language: 'py', code: pythonPreviewCode },
    { id: 'css', label: 'CSS', language: 'css', code: cssPreviewCode },
  ];

  const currentTab = previewTabs.find((t) => t.id === activeTab) ?? previewTabs[0];

  /* ---------- Metrics data ---------- */
  const metrics: MetricItem[] = [
    { value: '99.9', suffix: '%', label: 'Uptime', numericValue: 99.9, decimals: 1 },
    { value: '<50', suffix: 'ms', label: 'Avg Response', numericValue: 50, decimals: 0 },
    { value: '10', suffix: 'M+', label: 'API Calls / Day', numericValue: 10, decimals: 0 },
    { value: '500', suffix: '+', label: 'Integrations', numericValue: 500, decimals: 0 },
  ];

  /* ---------- Animation variants ---------- */
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  /* ---------- Render ---------- */
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a2e 100%)',
      }}
    >
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============================================================
            HERO AREA
            ============================================================ */}
        <div className="pt-24 pb-20 md:pt-32 md:pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/50 mb-8">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next-Gen Developer Platform</span>
            </div>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Developer Experience
            </span>
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Built for developers, by developers
          </motion.p>

          {/* Floating code block */}
          <motion.div
            className="max-w-2xl mx-auto float-code"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <CodeEditor filename="app.tsx">{heroCodeSnippet}</CodeEditor>
          </motion.div>
        </div>

        {/* ============================================================
            FEATURE CARDS
            ============================================================ */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={fadeUp}
              className="group"
            >
              <GradientBorderCard>
                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center ${feature.accentColor} group-hover:border-white/[0.15] transition-colors duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-white/40 mb-5 leading-relaxed">
                  {feature.description}
                </p>

                {/* Mini code editor */}
                <CodeEditor filename={feature.filename} className="text-xs">
                  {feature.code}
                </CodeEditor>
              </GradientBorderCard>
            </motion.div>
          ))}
        </motion.div>

        {/* ============================================================
            LIVE CODE PREVIEW
            ============================================================ */}
        <motion.div
          className="pb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Section heading */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs text-white/40 mb-3">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Preview</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white/90">
              Write once, render{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                anywhere
              </span>
            </h3>
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {previewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-emerald-400'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Split pane */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code side */}
            <motion.div
              key={`code-${activeTab}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CodeEditor filename={`component.${currentTab.language}`}>
                {currentTab.code}
              </CodeEditor>
            </motion.div>

            {/* Preview side */}
            <motion.div
              key={`preview-${activeTab}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d1117]/80 backdrop-blur-sm min-h-[300px]"
            >
              {/* Preview title bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-[#161b22]/80">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/30 font-mono">Preview</span>
              </div>
              <div className="min-h-[260px]">
                {activeTab === 'react' && <ReactPreviewPanel />}
                {activeTab === 'python' && <PythonPreviewPanel />}
                {activeTab === 'css' && <CssPreviewPanel />}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ============================================================
            STATS / METRICS BAR
            ============================================================ */}
        <motion.div
          className="pb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric, i) => (
              <MetricCard key={metric.label} metric={metric} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ============================================================
            BOTTOM CTA
            ============================================================ */}
        <motion.div
          className="text-center pb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex flex-col items-center gap-4 px-8 py-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Ready to build?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white/90">
              Start shipping{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                today
              </span>
            </h3>
            <button className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold text-sm hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================
   METRIC CARD  (with count-up)
   ================================================================ */

function MetricCard({ metric, index }: { metric: MetricItem; index: number }) {
  const { ref, displayValue } = useCountUp(metric.numericValue, metric.decimals, 2200);
  const neonColors = [
    'from-emerald-400 to-emerald-500',
    'from-cyan-400 to-cyan-500',
    'from-amber-400 to-amber-500',
    'from-rose-400 to-rose-500',
  ];

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 text-center hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
        {/* Neon accent line at top */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-12 bg-gradient-to-r ${neonColors[index % neonColors.length]} opacity-60 group-hover:w-3/4 group-hover:opacity-100 transition-all duration-500`}
        />
        <div className="text-2xl sm:text-3xl font-bold text-white/90 mb-1">
          <span ref={ref}>
            {metric.label === 'Avg Response' && displayValue === '0'
              ? '<'
              : metric.label === 'Avg Response'
                ? '<'
                : ''}
            {displayValue}
          </span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {metric.suffix}
          </span>
        </div>
        <div className="text-xs text-white/40">{metric.label}</div>
      </div>
    </motion.div>
  );
}
