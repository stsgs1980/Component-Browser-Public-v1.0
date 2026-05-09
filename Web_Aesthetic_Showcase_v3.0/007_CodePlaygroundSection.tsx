// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1144

'use client';

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Eye,
  Palette,
  Download,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type TabType = 'html' | 'css' | 'js';

interface Token {
  text: string;
  className?: string;
}

// ============================================================
// Tab Configuration
// ============================================================

const TABS: { id: TabType; label: string; filename: string; icon: React.ElementType; accent: string }[] = [
  { id: 'html', label: 'HTML', filename: 'index.html', icon: Code2, accent: '#f97316' },
  { id: 'css', label: 'CSS', filename: 'style.css', icon: Palette, accent: '#06b6d4' },
  { id: 'js', label: 'JavaScript', filename: 'script.js', icon: Code2, accent: '#eab308' },
];

// ============================================================
// Default Demo Code
// ============================================================

const DEFAULT_HTML = `<div id="demo">
  <div class="card">
    <h1 class="title">Hello, World!</h1>
    <p class="subtitle">Built with pure HTML, CSS & JS</p>
    <div class="orb"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>
</div>`;

const DEFAULT_CSS = `body {
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
  background: linear-gradient(
    135deg, #10b981, #06b6d4, #8b5cf6
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.5rem;
  animation: glow 2s ease-in-out infinite;
}

.subtitle {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  margin: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: float 6s ease-in-out infinite;
}

.orb {
  width: 200px;
  height: 200px;
  background: #10b981;
  top: -80px;
  left: -60px;
}

.orb-2 {
  width: 160px;
  height: 160px;
  background: #8b5cf6;
  bottom: -60px;
  right: -40px;
  animation-delay: -2s !important;
}

.orb-3 {
  width: 120px;
  height: 120px;
  background: #06b6d4;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -4s !important;
}

@keyframes glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -20px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}`;

const DEFAULT_JS = `const card = document.querySelector('.card');
let hue = 0;

card.addEventListener('mousemove', function(e) {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.background =
    "radial-gradient(circle at " + x + "px " +
    y + "px, rgba(255,255,255,0.06), " +
    "rgba(255,255,255,0.03))";
});

const title = document.querySelector('.title');
setInterval(function() {
  hue = (hue + 1) % 360;
  title.style.background =
    "linear-gradient(" + hue +
    "deg, #10b981, #06b6d4, #8b5cf6, #ec4899)";
  title.style.webkitBackgroundClip = 'text';
  title.style.webkitTextFillColor = 'transparent';
}, 50);

console.log('Playground loaded!');`;

// ============================================================
// Syntax Highlighting: Tokenizers
// ============================================================

function tokenizeHTML(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Comment: <!-- ... -->
    if (code[i] === '<' && code[i + 1] === '!' && code[i + 2] === '-' && code[i + 3] === '-') {
      const end = code.indexOf('-->', i + 4);
      const commentEnd = end === -1 ? code.length : end + 3;
      tokens.push({ text: code.slice(i, commentEnd), className: 'syn-comment' });
      i = commentEnd;
      continue;
    }

    // Tag: <...>
    if (code[i] === '<') {
      let j = i + 1;
      const isClosing = code[j] === '/';
      if (isClosing) j++;

      // Tag name
      let tagName = '';
      while (j < code.length && /[\w-]/.test(code[j])) {
        tagName += code[j];
        j++;
      }

      tokens.push({ text: isClosing ? '</' : '<', className: 'syn-bracket' });
      if (tagName) {
        tokens.push({ text: tagName, className: 'syn-tag' });
      }

      // Attributes
      while (j < code.length && code[j] !== '>' && !(code[j] === '/' && code[j + 1] === '>')) {
        if (/\s/.test(code[j])) {
          tokens.push({ text: code[j] });
          j++;
        } else if (code[j] === '=') {
          tokens.push({ text: '=', className: 'syn-punctuation' });
          j++;
        } else if (code[j] === '"' || code[j] === "'") {
          const quote = code[j];
          let val = quote;
          j++;
          while (j < code.length && code[j] !== quote) {
            val += code[j];
            j++;
          }
          if (j < code.length) val += code[j];
          j++;
          tokens.push({ text: val, className: 'syn-value' });
        } else {
          let attr = '';
          while (j < code.length && /[\w-]/.test(code[j])) {
            attr += code[j];
            j++;
          }
          if (attr) {
            tokens.push({ text: attr, className: 'syn-attr' });
          }
        }
      }

      // Closing bracket
      if (j < code.length && code[j] === '/' && code[j + 1] === '>') {
        tokens.push({ text: '/>', className: 'syn-bracket' });
        j += 2;
      } else if (j < code.length && code[j] === '>') {
        tokens.push({ text: '>', className: 'syn-bracket' });
        j++;
      }

      i = j;
      continue;
    }

    // Text content
    let text = '';
    while (i < code.length && code[i] !== '<') {
      text += code[i];
      i++;
    }
    if (text) {
      tokens.push({ text });
    }
  }

  return tokens;
}

function tokenizeCSS(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const cssKeywords = new Set([
    'auto', 'inherit', 'initial', 'unset', 'none', 'normal',
    'relative', 'absolute', 'fixed', 'sticky', 'static',
    'block', 'inline', 'flex', 'grid', 'inline-flex', 'inline-grid',
    'center', 'left', 'right', 'top', 'bottom',
    'solid', 'dashed', 'dotted', 'transparent',
    'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear',
    'infinite', 'both', 'forwards', 'backwards',
    'pointer', 'hidden', 'visible', 'scroll',
    'cover', 'contain', 'nowrap', 'wrap',
    'bold', 'bolder', 'lighter',
    'clip', 'ellipsis',
    'border-box', 'content-box', 'padding-box',
    'text', 'percentage', 'evenodd', 'nonzero',
  ]);

  while (i < code.length) {
    // Comment
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const commentEnd = end === -1 ? code.length : end + 2;
      tokens.push({ text: code.slice(i, commentEnd), className: 'syn-comment' });
      i = commentEnd;
      continue;
    }

    // String
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), className: 'syn-string' });
      i = j + 1;
      continue;
    }

    // @-rule
    if (code[i] === '@') {
      let j = i + 1;
      while (j < code.length && /[\w-]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), className: 'syn-keyword' });
      i = j;
      continue;
    }

    // Brackets
    if (code[i] === '{' || code[i] === '}') {
      tokens.push({ text: code[i], className: 'syn-bracket' });
      i++;
      continue;
    }

    // Punctuation
    if (code[i] === ':' || code[i] === ';') {
      tokens.push({ text: code[i], className: 'syn-punctuation' });
      i++;
      continue;
    }

    // Number
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.%a-zA-Z]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), className: 'syn-number' });
      i = j;
      continue;
    }

    // Hash color
    if (code[i] === '#') {
      let j = i + 1;
      while (j < code.length && /[\da-fA-F]/.test(code[j])) j++;
      if (j > i + 1) {
        tokens.push({ text: code.slice(i, j), className: 'syn-number' });
        i = j;
        continue;
      }
      tokens.push({ text: '#', className: 'syn-punctuation' });
      i++;
      continue;
    }

    // Word: selector, property, or value keyword
    if (/[a-zA-Z_-]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\w-]/.test(code[j])) j++;
      const word = code.slice(i, j);

      // Look ahead: is this a property? (followed by optional spaces then ':')
      let k = j;
      while (k < code.length && code[k] === ' ') k++;
      if (code[k] === ':' && code[k + 1] !== ':') {
        tokens.push({ text: word, className: 'syn-property' });
      } else if (cssKeywords.has(word)) {
        tokens.push({ text: word, className: 'syn-keyword' });
      } else {
        tokens.push({ text: word, className: 'syn-tag' });
      }
      i = j;
      continue;
    }

    // Whitespace
    if (/\s/.test(code[i])) {
      let j = i;
      while (j < code.length && /\s/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j) });
      i = j;
      continue;
    }

    // Other characters (parentheses, commas, etc.)
    tokens.push({ text: code[i], className: 'syn-punctuation' });
    i++;
  }

  return tokens;
}

function tokenizeJS(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const jsKeywords = new Set([
    'const', 'let', 'var', 'function', 'if', 'else', 'return',
    'new', 'this', 'true', 'false', 'null', 'undefined',
    'typeof', 'instanceof', 'class', 'extends', 'import', 'export',
    'from', 'async', 'await', 'for', 'while', 'do', 'switch',
    'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw',
    'default', 'void', 'delete', 'in', 'of', 'yield',
  ]);

  while (i < code.length) {
    // Single-line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      let j = i;
      while (j < code.length && code[j] !== '\n') j++;
      tokens.push({ text: code.slice(i, j), className: 'syn-comment' });
      i = j;
      continue;
    }

    // Multi-line comment
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const commentEnd = end === -1 ? code.length : end + 2;
      tokens.push({ text: code.slice(i, commentEnd), className: 'syn-comment' });
      i = commentEnd;
      continue;
    }

    // String (double quote)
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), className: 'syn-string' });
      i = j + 1;
      continue;
    }

    // String (single quote)
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), className: 'syn-string' });
      i = j + 1;
      continue;
    }

    // Number
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), className: 'syn-number' });
      i = j;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\w$]/.test(code[j])) j++;
      const word = code.slice(i, j);

      if (jsKeywords.has(word)) {
        tokens.push({ text: word, className: 'syn-keyword' });
      } else {
        // Look ahead: is it a function call? (followed by '(')
        let k = j;
        while (k < code.length && code[k] === ' ') k++;
        if (code[k] === '(') {
          tokens.push({ text: word, className: 'syn-function' });
        } else {
          tokens.push({ text: word });
        }
      }
      i = j;
      continue;
    }

    // Operators & punctuation
    if ('=+-*/<>!&|^~%?:'.includes(code[i])) {
      let j = i;
      while (j < code.length && '=+-*/<>!&|^~%?:'.includes(code[j]) && j - i < 3) j++;
      tokens.push({ text: code.slice(i, j), className: 'syn-operator' });
      i = j;
      continue;
    }

    // Brackets
    if ('()[]{}'.includes(code[i])) {
      tokens.push({ text: code[i], className: 'syn-bracket' });
      i++;
      continue;
    }

    // Dot, comma, semicolon
    if ('.,;'.includes(code[i])) {
      tokens.push({ text: code[i], className: 'syn-punctuation' });
      i++;
      continue;
    }

    // Whitespace
    if (/\s/.test(code[i])) {
      let j = i;
      while (j < code.length && /\s/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j) });
      i = j;
      continue;
    }

    // Fallback
    tokens.push({ text: code[i] });
    i++;
  }

  return tokens;
}

function tokenize(code: string, language: TabType): Token[] {
  switch (language) {
    case 'html': return tokenizeHTML(code);
    case 'css': return tokenizeCSS(code);
    case 'js': return tokenizeJS(code);
  }
}

// ============================================================
// Render Tokenized Code with Line Numbers
// ============================================================

function renderTokenizedCode(tokens: Token[]): React.ReactNode[] {
  const lines: { tokens: Token[] }[] = [{ tokens: [] }];

  for (const token of tokens) {
    const parts = token.text.split('\n');
    for (let pi = 0; pi < parts.length; pi++) {
      if (pi > 0) {
        lines.push({ tokens: [] });
      }
      if (parts[pi].length > 0) {
        lines[lines.length - 1].tokens.push({
          text: parts[pi],
          className: token.className,
        });
      }
    }
  }

  return lines.map((line, index) => (
    <div key={index} className="flex leading-[1.625rem]">
      <span className="select-none text-white/[0.12] w-8 text-right mr-4 shrink-0 text-xs">
        {index + 1}
      </span>
      <span className="whitespace-pre text-xs">
        {line.tokens.length === 0 ? (
          <span>&nbsp;</span>
        ) : (
          line.tokens.map((t, ti) => (
            <span key={ti} className={t.className}>
              {t.text}
            </span>
          ))
        )}
      </span>
    </div>
  ));
}

// ============================================================
// Build srcDoc for iframe
// ============================================================

function buildSrcDoc(html: string, css: string, js: string): string {
  const closeScript = '<' + '/script>';
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<style>',
    css,
    '</style>',
    '</head>',
    '<body>',
    html,
    '<script>',
    js,
    closeScript,
    '</body>',
    '</html>',
  ].join('\n');
}

// ============================================================
// Floating Decorative Symbols
// ============================================================

const FLOATING_SYMBOLS = ['< />', '{ }', '( )', '//', '=>', 'fn()', '<div>', 'CSS', 'JS', '&&', '||', '===', 'let', '0xFF', 'npm', '::', '[ ]'];

function FloatingDecorations() {
  const items = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    symbol: FLOATING_SYMBOLS[i % FLOATING_SYMBOLS.length],
    left: 3 + (i * 6.9) % 94,
    top: 3 + (i * 7.3) % 94,
    size: 9 + (i % 3) * 3,
    duration: 10 + (i * 1.9) % 14,
    delay: (i * 0.6) % 8,
    rotate: -20 + (i * 8) % 40,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <motion.span
          key={item.id}
          className="absolute font-mono select-none"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.size}px`,
            color: 'rgba(255,255,255,0.025)',
          }}
          animate={{
            y: [0, -15, 0, 8, 0],
            x: [0, 6, -4, 2, 0],
            rotate: [item.rotate, item.rotate + 4, item.rotate - 2, item.rotate + 1, item.rotate],
            opacity: [0.02, 0.05, 0.03, 0.04, 0.02],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeatType: "loop",
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.symbol}
        </motion.span>
      ))}
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function CodePlaygroundSection() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Code state
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [jsCode, setJsCode] = useState(DEFAULT_JS);
  const [srcDoc, setSrcDoc] = useState(() => buildSrcDoc(DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS));

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Refs
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Get active code
  const activeCode = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;

  // Debounced srcDoc update on code change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode));
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [htmlCode, cssCode, jsCode]);

  // Handlers
  const handleCodeChange = useCallback((value: string, tab: TabType) => {
    switch (tab) {
      case 'html': setHtmlCode(value); break;
      case 'css': setCssCode(value); break;
      case 'js': setJsCode(value); break;
    }
  }, []);

  const handleRun = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode));
  }, [htmlCode, cssCode, jsCode]);

  const handleReset = useCallback(() => {
    setHtmlCode(DEFAULT_HTML);
    setCssCode(DEFAULT_CSS);
    setJsCode(DEFAULT_JS);
    setSrcDoc(buildSrcDoc(DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS));
  }, []);

  const handleCopy = useCallback(() => {
    const code = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for environments without clipboard API
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab, htmlCode, cssCode, jsCode]);

  const handleDownload = useCallback(() => {
    const htmlContent = buildSrcDoc(htmlCode, cssCode, jsCode);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playground.html';
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }, [htmlCode, cssCode, jsCode]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Scroll sync between textarea and highlighted overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Handle Tab key to insert spaces
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      handleCodeChange(newValue, activeTab);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  }, [activeTab, handleCodeChange]);

  // Line and character count for status bar
  const lineCount = activeCode.split('\n').length;
  const charCount = activeCode.length;

  if (!mounted) return null;

  // Tokenize active code for highlighting
  const tokens = tokenize(activeCode, activeTab);
  const highlightedLines = renderTokenizedCode(tokens);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #141420 50%, #0a0a0a 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Floating decorations */}
      <FloatingDecorations />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {/* ===== Section Header ===== */}
        <div className="pt-20 sm:pt-28 pb-10 sm:pb-14 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] mb-6">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-widest">
                Interactive Playground
              </span>
            </div>

            <h2
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Code Playground
            </h2>

            <p className="font-mono text-sm sm:text-base text-white/30 tracking-wide max-w-lg mx-auto">
              Write, preview, and experiment with code in real-time
            </p>
          </motion.div>
        </div>

        {/* ===== Playground Container ===== */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Label */}
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-4 h-4 text-emerald-400/60" />
              <h3 className="font-mono text-sm text-white/40 tracking-widest uppercase">Live Editor</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
            </div>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

              {/* ===== Editor Panel ===== */}
              <motion.div
                className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col"
                style={{ background: '#0d1117', maxHeight: '620px' }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Tab Bar */}
                <div className="flex items-center border-b border-white/[0.06]">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className="relative flex items-center gap-2 px-4 py-3 text-xs font-mono transition-colors"
                        style={{
                          color: isActive ? '#f8f8f2' : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        <TabIcon className="w-3.5 h-3.5" style={{ color: isActive ? tab.accent : undefined }} />
                        <span>{tab.label}</span>
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-[2px]"
                            style={{ background: tab.accent }}
                            layoutId="playgroundTabIndicator"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                          />
                        )}
                      </button>
                    );
                  })}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Toolbar buttons */}
                  <div className="flex items-center gap-1 pr-2">
                    <motion.button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Reset to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </motion.button>

                    <motion.button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Copy code"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1.5 text-emerald-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copied!</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copy</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <motion.button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Download as HTML"
                    >
                      <AnimatePresence mode="wait">
                        {downloaded ? (
                          <motion.span
                            key="dl-check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1.5 text-emerald-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Saved!</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="dl-icon"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <motion.button
                      onClick={handleRun}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono transition-colors"
                      style={{
                        color: '#ffffff',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                      }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      title="Run code"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Run</span>
                    </motion.button>
                  </div>
                </div>

                {/* Editor window chrome */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="font-mono text-[11px] text-white/20 ml-3">{activeTabConfig.filename}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTabConfig.accent, opacity: 0.5 }} />
                    <span className="font-mono text-[10px] text-white/15 uppercase tracking-wider">{activeTab}</span>
                  </div>
                </div>

                {/* Code area */}
                <div className="relative flex-1 overflow-hidden min-h-[300px] sm:min-h-[380px] lg:min-h-[420px]">
                  {/* Highlighted code overlay */}
                  <pre
                    ref={preRef}
                    className="absolute inset-0 w-full h-full p-4 overflow-hidden pointer-events-none custom-scrollbar font-mono text-xs leading-[1.625rem] selection:bg-emerald-500/30"
                    style={{ tabSize: 2, color: '#f8f8f2' }}
                    aria-hidden="true"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        {highlightedLines}
                      </motion.div>
                    </AnimatePresence>
                  </pre>

                  {/* Actual textarea for editing */}
                  <textarea
                    ref={textareaRef}
                    value={activeCode}
                    onChange={(e) => handleCodeChange(e.target.value, activeTab)}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-[#f8f8f2] outline-none p-4 font-mono text-xs leading-[1.625rem] overflow-auto custom-scrollbar selection:bg-emerald-500/30"
                    style={{ tabSize: 2 }}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    aria-label={`Code editor for ${activeTabConfig.label}`}
                  />
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/20 uppercase">{activeTab}</span>
                    <span className="font-mono text-[10px] text-white/15">UTF-8</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/15">{lineCount} lines</span>
                    <span className="font-mono text-[10px] text-white/15">{charCount} chars</span>
                  </div>
                </div>
              </motion.div>

              {/* ===== Preview Panel ===== */}
              <motion.div
                className="rounded-2xl overflow-hidden border border-white/[0.06] flex flex-col"
                style={{ background: '#0d1117', maxHeight: '620px' }}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Preview header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <div className="flex items-center gap-1.5 ml-3">
                    <Eye className="w-3.5 h-3.5 text-white/25" />
                    <span className="font-mono text-[11px] text-white/25">Preview</span>
                  </div>
                  {/* Fake URL bar */}
                  <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.04]">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    <span className="font-mono text-[10px] text-white/15">localhost:3000/playground</span>
                  </div>
                </div>

                {/* iframe preview */}
                <div className="flex-1 bg-white min-h-[300px] sm:min-h-[380px] lg:min-h-[420px]">
                  <iframe
                    srcDoc={srcDoc}
                    title="Code preview"
                    sandbox="allow-scripts"
                    className="w-full h-full border-0"
                    style={{ minHeight: '300px' }}
                  />
                </div>

                {/* Preview status bar */}
                <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
                    <span className="font-mono text-[10px] text-white/20">Live</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/15">Auto-refresh (300ms)</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ===== Info Bar ===== */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              { icon: Code2, label: 'HTML + CSS + JS', sub: 'TRIPLE THREAT' },
              { icon: Eye, label: 'Live Preview', sub: 'INSTANT FEEDBACK' },
              { icon: Palette, label: 'Creative Freedom', sub: 'NO LIMITS' },
            ].map((item, i) => (
              <div key={`pg-info-${i}`} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-emerald-400/50" />
                <div>
                  <span className="font-mono text-xs text-white/50">{item.label}</span>
                  <span className="font-mono text-[10px] text-white/15 ml-2 hidden sm:inline">{item.sub}</span>
                </div>
                {i < 2 && (
                  <span className="hidden sm:block w-px h-4 bg-white/10 ml-4 sm:ml-8" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
