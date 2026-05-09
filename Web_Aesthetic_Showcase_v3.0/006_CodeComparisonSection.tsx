// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 919

'use client';

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Palette,
  Terminal,
  Code2,
  Quote,
  Hash,
  Braces,
  Infinity,
  MousePointerClick,
  ChevronRight,
} from 'lucide-react';

// ============================================================
// Types & Constants
// ============================================================

type StyleName = 'clean' | 'terminal' | 'brutalist' | 'glitch';

interface StyleConfig {
  id: StyleName;
  label: string;
  icon: React.ElementType;
  description: string;
  accent: string;
}

const STYLES: StyleConfig[] = [
  { id: 'clean', label: 'Clean / Modern', icon: Sparkles, description: 'Minimal, polished, SaaS-ready', accent: '#a78bfa' },
  { id: 'terminal', label: 'Terminal / Hacker', icon: Terminal, description: 'Monospace, green on black, raw', accent: '#00ff41' },
  { id: 'brutalist', label: 'Brutalist', icon: Palette, description: 'Thick borders, Times, unpolished', accent: '#ff6b35' },
  { id: 'glitch', label: 'Glitch / Cyberpunk', icon: Code2, description: 'Neon glow, RGB split, scanlines', accent: '#00ffff' },
];

interface Quote {
  text: string;
  author: string;
  role: string;
}

const QUOTES: Quote[] = [
  { text: "The best programs are written so that computing machines can perform them quickly and so that human beings can understand them clearly.", author: "Donald Knuth", role: "Computer Scientist, Author of TAOCP" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson", role: "Software Engineer" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House", role: "Software Architect & Pluralsight Author" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", role: "Author of Refactoring" },
];

// ============================================================
// Floating Decorative Elements
// ============================================================

const FLOATING_SYMBOLS = ['{', '}', ';', '//', '</>', '()', '=>', '[]', '&&', '||', '!=', '===', '0x', '<div>', '::', '$$', '**'];

function FloatingDecorations() {
  const items = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      symbol: FLOATING_SYMBOLS[i % FLOATING_SYMBOLS.length],
      left: 5 + (i * 5.3) % 90,
      top: 5 + (i * 7.1) % 90,
      size: 10 + (i % 4) * 4,
      duration: 8 + (i * 1.7) % 12,
      delay: (i * 0.4) % 6,
      rotate: -15 + (i * 7) % 30,
    }));
  }, []);

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
            color: 'rgba(255,255,255,0.04)',
          }}
          animate={{
            y: [0, -20, 0, 10, 0],
            x: [0, 8, -5, 3, 0],
            rotate: [item.rotate, item.rotate + 5, item.rotate - 3, item.rotate + 2, item.rotate],
            opacity: [0.03, 0.07, 0.04, 0.06, 0.03],
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
// Mini Hello World Card (style-specific)
// ============================================================

function CleanCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 max-w-[260px] w-full">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight">Hello World</h3>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">Welcome to the clean, modern aesthetic. Less is more.</p>
      <button className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors">
        Get Started
      </button>
    </div>
  );
}

function TerminalCard() {
  return (
    <div className="bg-black rounded border border-green-500/30 p-4 max-w-[260px] w-full font-mono text-sm">
      <div className="flex items-center gap-2 mb-3 text-green-500/60 text-xs">
        <span className="text-green-400">&lt;div class=&quot;card&quot;&gt;</span>
      </div>
      <div className="border border-green-500/20 rounded p-3 bg-black/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-5 rounded border border-green-500/40 flex items-center justify-center text-green-500 text-xs">&#x2726;</span>
          <span className="text-green-400 font-bold">$ hello</span>
        </div>
        <h3 className="text-green-300 text-base mb-1">Hello World</h3>
        <p className="text-green-700 text-xs mb-3">root@kali:~# Welcome, hacker.</p>
        <button className="w-full py-2 px-3 bg-green-900/30 border border-green-500/40 text-green-400 text-xs rounded hover:bg-green-900/50 transition-colors">
          [ EXECUTE ]<span className="cursor-blink ml-1 text-green-500">_</span>
        </button>
      </div>
      <div className="mt-3 text-green-500/60 text-xs">
        <span className="text-green-400">&lt;/div&gt;</span>
      </div>
    </div>
  );
}

function BrutalistCard() {
  return (
    <div
      className="bg-white border-4 border-black p-5 max-w-[260px] w-full"
      style={{ fontFamily: 'Times New Roman, Georgia, serif', transform: 'rotate(-1deg)' }}
    >
      <div className="flex items-center gap-2 mb-3 text-xs font-mono text-gray-500">
        <span>&lt;h1&gt;</span>
      </div>
      <h3
        className="text-2xl font-black uppercase mb-1"
        style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
      >
        HELLO WORLD
      </h3>
      <div className="text-xs font-mono text-gray-500 mb-3">
        <span>&lt;/h1&gt;</span>
      </div>
      <p className="text-sm text-black mb-4" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
        NO SUBTLETY. NO ELEGANCE. JUST RAW UNPOLISHED DESIGN.
      </p>
      <div className="text-xs font-mono text-gray-500 mb-2">
        <span>&lt;button&gt;</span>
      </div>
      <button
        className="w-full py-3 px-4 bg-yellow-400 border-4 border-black text-black text-sm font-black uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors"
        style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
      >
        SMASH THIS
      </button>
      <div className="mt-2 text-xs font-mono text-gray-500">
        <span>&lt;/button&gt;</span>
      </div>
    </div>
  );
}

function GlitchCard() {
  return (
    <div className="relative max-w-[260px] w-full">
      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 rounded pointer-events-none z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />
      <div
        className="cyber-border rounded-sm bg-[#0a0014] p-5 relative overflow-hidden"
        style={{
          boxShadow: '0 0 15px rgba(0,255,255,0.15), inset 0 0 15px rgba(0,255,255,0.05)',
        }}
      >
        {/* Neon glow background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,255,0.08) 0%, transparent 60%)',
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-sm bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <span className="text-cyan-400 text-xs">&#x25C8;</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-600 tracking-widest">SYS://CARD</span>
          </div>
          <h3
            className="glitch-text text-xl font-black font-mono tracking-wider mb-1"
            data-text="HELLO WORLD"
            style={{
              color: '#ffffff',
              textShadow: '3px 0 0 #ff0040, -3px 0 0 #00ffff',
            }}
          >
            HELLO WORLD
          </h3>
          <p className="font-mono text-xs text-cyan-700 mb-4">
            {'>'} System infiltrated. Welcome.
          </p>
          <button
            className="w-full py-2.5 px-4 bg-transparent border border-cyan-500/60 text-cyan-400 font-mono text-xs font-bold tracking-widest rounded-sm hover:bg-cyan-500/10 transition-colors"
            style={{
              boxShadow: '0 0 8px rgba(0,255,255,0.3), inset 0 0 8px rgba(0,255,255,0.1)',
              textShadow: '0 0 8px rgba(0,255,255,0.6)',
            }}
          >
            {'>'} INITIALIZE_
          </button>
        </div>
      </div>
    </div>
  );
}

const STYLE_CARDS: Record<StyleName, React.FC> = {
  clean: CleanCard,
  terminal: TerminalCard,
  brutalist: BrutalistCard,
  glitch: GlitchCard,
};

// ============================================================
// Code Display for each style
// ============================================================

const STYLE_CODE: Record<StyleName, string[]> = {
  clean: [
    `.card {`,
    `  background: #ffffff;`,
    `  border-radius: 1rem;`,
    `  box-shadow: 0 10px 15px -3px`,
    `    rgba(0,0,0,0.1);`,
    `  padding: 1.5rem;`,
    `  border: 1px solid #f3f4f6;`,
    `}`,
    ``,
    `.card h3 {`,
    `  font-size: 1.125rem;`,
    `  font-weight: 600;`,
    `  color: #111827;`,
    `  letter-spacing: -0.025em;`,
    `}`,
    ``,
    `.card button {`,
    `  background: #7c3aed;`,
    `  color: white;`,
    `  border-radius: 0.75rem;`,
    `  padding: 0.625rem 1rem;`,
    `  transition: all 0.2s;`,
    `}`,
  ],
  terminal: [
    `.card {`,
    `  background: #000000;`,
    `  border: 1px solid #00ff4130;`,
    `  font-family: 'Courier New';`,
    `  color: #00ff41;`,
    `}`,
    ``,
    `.card h3 {`,
    `  color: #00ff41;`,
    `  text-shadow: 0 0 5px #00ff41;`,
    `}`,
    ``,
    `.cursor {`,
    `  animation: blink 1s`,
    `    step-end infinite;`,
    `}`,
    ``,
    `/* ASCII border decoration */`,
    `.card::before {`,
    `  content: '+---+---+---+';`,
    `  color: #00ff4160;`,
    `}`,
  ],
  brutalist: [
    `.card {`,
    `  background: #ffffff;`,
    `  border: 4px solid #000;`,
    `  border-radius: 0;`,
    `  padding: 1.25rem;`,
    `  transform: rotate(-1deg);`,
    `  font-family: 'Times New Roman';`,
    `}`,
    ``,
    `.card h3 {`,
    `  font-size: 1.5rem;`,
    `  font-weight: 900;`,
    `  text-transform: uppercase;`,
    `}`,
    ``,
    `.card button {`,
    `  background: #facc15;`,
    `  border: 4px solid #000;`,
    `  font-weight: 900;`,
    `  text-transform: uppercase;`,
    `}`,
  ],
  glitch: [
    `.card {`,
    `  background: #0a0014;`,
    `  border: 1px solid #00ffff30;`,
    `  box-shadow: 0 0 15px`,
    `    rgba(0,255,255,0.15);`,
    `  animation: border-glow`,
    `    4s ease-in-out infinite;`,
    `}`,
    ``,
    `.glitch-text {`,
    `  text-shadow: 3px 0 0 #ff0040,`,
    `    -3px 0 0 #00ffff;`,
    `  /* RGB split via ::before,`,
    `     ::after pseudo-elements */`,
    `}`,
    ``,
    `.scanlines::before {`,
    `  background: repeating-linear`,
    `    -gradient(0deg, transparent,`,
    `    transparent 2px,`,
    `    rgba(0,0,0,0.08) 2px,`,
    `    rgba(0,0,0,0.08) 4px);`,
    `}`,
  ],
};

// ============================================================
// Code syntax highlighting helper
// ============================================================

function highlightLine(line: string) {
  if (!line.trim()) return <span>&nbsp;</span>;

  // Property: color, background, border, padding, etc.
  if (/^\s+\w[\w-]*\s*:/.test(line)) {
    const prop = line.match(/^(\s+)([\w-]+)(\s*:\s*)(.*)/);
    if (prop) {
      return (
        <>
          <span className="text-white/30">{prop[1]}</span>
          <span className="syn-property">{prop[2]}</span>
          <span className="syn-punctuation">{prop[3]}</span>
          <span className="syn-value">{prop[4]}</span>
        </>
      );
    }
  }

  // Comment
  if (line.trimStart().startsWith('/*') || line.trimStart().startsWith('//')) {
    return <span className="syn-comment">{line}</span>;
  }

  // Selector / opening brace
  if (line.includes('{')) {
    const sel = line.split('{');
    return (
      <>
        <span className="syn-tag">{sel[0]}</span>
        <span className="syn-bracket">{'{'}</span>
      </>
    );
  }

  // Closing brace
  if (line.trim() === '}') {
    return <span className="syn-bracket">{line}</span>;
  }

  return <span className="text-white/70">{line}</span>;
}

// ============================================================
// Quote Section
// ============================================================

function QuoteSection() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative py-20 px-4">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />

      <div className="max-w-3xl mx-auto text-center">
        {/* Decorative quote marks */}
        <div className="relative mb-8">
          <span
            className="font-mono text-6xl sm:text-7xl leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {'{'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <blockquote className="mb-6">
              <p
                className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed"
                style={{
                  background: 'linear-gradient(to right, rgba(255,255,255,0.6), rgba(255,255,255,0.4))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                &ldquo;{QUOTES[currentQuote].text}&rdquo;
              </p>
            </blockquote>

            <div className="space-y-1">
              <p className="font-mono text-sm text-purple-400/80">
                {QUOTES[currentQuote].author}
              </p>
              <p className="font-mono text-xs text-white/25">
                {QUOTES[currentQuote].role}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quote indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {QUOTES.map((_, i) => (
            <button
              key={`quote-${i}`}
              onClick={() => setCurrentQuote(i)}
              className="relative w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: i === currentQuote ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.15)',
              }}
              aria-label={`Go to quote ${i + 1}`}
            >
              {i === currentQuote && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'rgba(168,85,247,0.3)' }}
                  layoutId="quoteIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Decorative closing bracket */}
        <div className="mt-8">
          <span
            className="font-mono text-6xl sm:text-7xl leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(168,85,247,0.3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {'}'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Stats Info Bar
// ============================================================

function StatsBar() {
  const stats = [
    { icon: Palette, label: '4 Styles', value: 'AESTHETICS' },
    { icon: Layers, label: '1 Component', value: 'UNIFIED' },
    { icon: Infinity, label: 'Infinite Possibilities', value: 'BOUNDLESS' },
  ];

  return (
    <div className="border-t border-b border-white/[0.06] py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
        {stats.map((stat, i) => (
          <div key={`stat-${i}`} className="flex items-center gap-3 px-4 sm:px-6">
            <stat.icon className="w-4 h-4 text-purple-400/60" />
            <div>
              <span className="font-mono text-xs text-white/60">{stat.label}</span>
              <span className="font-mono text-[10px] text-white/20 ml-2 hidden sm:inline">{stat.value}</span>
            </div>
            {i < stats.length - 1 && (
              <span className="hidden sm:block w-px h-4 bg-white/10 ml-4 sm:ml-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Live Preview Card with style transitions
// ============================================================

function LivePreviewCard({ style }: { style: StyleName }) {
  const CardComponent = STYLE_CARDS[style];

  const variants = {
    clean: {
      initial: { opacity: 0, scale: 0.95, filter: 'blur(8px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } },
      exit: { opacity: 0, scale: 0.95, filter: 'blur(8px)', transition: { duration: 0.3 } },
    },
    terminal: {
      initial: { opacity: 0, x: -30, filter: 'brightness(3)' },
      animate: { opacity: 1, x: 0, filter: 'brightness(1)', transition: { duration: 0.3, ease: 'easeOut' } },
      exit: { opacity: 0, x: 30, filter: 'brightness(0)', transition: { duration: 0.2 } },
    },
    brutalist: {
      initial: { opacity: 0, rotate: 5, scale: 0.9 },
      animate: { opacity: 1, rotate: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
      exit: { opacity: 0, rotate: -5, scale: 0.9, transition: { duration: 0.2 } },
    },
    glitch: {
      initial: { opacity: 0, skewX: 10, x: -20 },
      animate: { opacity: 1, skewX: 0, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      exit: { opacity: 0, skewX: -10, x: 20, filter: 'blur(4px)', transition: { duration: 0.2 } },
    },
  };

  const v = variants[style];

  // Wrap with a background container per style
  const bgStyle: Record<StyleName, string> = {
    clean: 'bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl',
    terminal: 'bg-black rounded-lg border border-green-500/20',
    brutalist: 'bg-white',
    glitch: 'bg-[#0a0014] rounded-lg',
  };

  return (
    <div className="flex items-center justify-center p-6 sm:p-8 min-h-[320px] sm:min-h-[360px]">
      <div className={bgStyle[style]} style={{ padding: '2rem' }}>
        <motion.div
          key={style}
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
        >
          <CardComponent />
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// Style Switcher Buttons
// ============================================================

function StyleSwitcher({
  active,
  onChange,
}: {
  active: StyleName;
  onChange: (style: StyleName) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {STYLES.map((style) => {
        const isActive = active === style.id;
        return (
          <motion.button
            key={style.id}
            onClick={() => onChange(style.id)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-colors"
            style={{
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
              backgroundColor: isActive ? `${style.accent}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isActive ? `${style.accent}40` : 'rgba(255,255,255,0.06)'}`,
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  border: `1px solid ${style.accent}30`,
                  boxShadow: `0 0 15px ${style.accent}15`,
                }}
                layoutId="switcherActiveBg"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <style.icon className="w-4 h-4 relative z-10" style={{ color: isActive ? style.accent : undefined }} />
            <span className="relative z-10 hidden sm:inline">{style.label}</span>
            <span className="relative z-10 sm:hidden">{style.label.split('/')[0].trim()}</span>
            {isActive && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full relative z-10"
                style={{ backgroundColor: style.accent }}
                layoutId="switcherDot"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ============================================================
// Code Editor Panel
// ============================================================

function CodeEditorPanel({ style }: { style: StyleName }) {
  const lines = STYLE_CODE[style];
  const config = STYLES.find((s) => s.id === style)!;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={style}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col"
      >
        {/* Editor header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="font-mono text-[11px] text-white/30 ml-2">
            {style}.styles.css
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.accent, opacity: 0.6 }} />
            <span className="font-mono text-[10px] text-white/20 uppercase tracking-wider">{config.label}</span>
          </div>
        </div>

        {/* Code content */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs sm:text-sm leading-relaxed">
          <div className="space-y-0">
            {lines.map((line, i) => (
              <div key={`code-line-${i}`} className="flex">
                <span className="select-none text-white/15 w-8 text-right mr-4 shrink-0">{i + 1}</span>
                <span className="whitespace-pre">{highlightLine(line)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editor footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06]">
          <span className="font-mono text-[10px] text-white/20">CSS</span>
          <span className="font-mono text-[10px] text-white/20">{lines.length} lines</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// Comparison Grid Card
// ============================================================

function ComparisonGridCard({ style }: { style: StyleConfig }) {
  const CardComponent = STYLE_CARDS[style.id];

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
      style={{
        boxShadow: `0 0 20px ${style.accent}05`,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 30px ${style.accent}15`,
        borderColor: `${style.accent}25`,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: style.accent, boxShadow: `0 0 6px ${style.accent}50` }}
        />
        <span className="font-mono text-xs text-white/50">{style.label}</span>
      </div>

      {/* Card preview area */}
      <div className="p-4 flex items-center justify-center min-h-[220px] sm:min-h-[260px]">
        <div className="transform scale-[0.85] sm:scale-[0.9] origin-center">
          <CardComponent />
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/20">{style.description}</span>
        <MousePointerClick className="w-3 h-3 text-white/15 group-hover:text-white/40 transition-colors" />
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function CodeComparisonSection() {
  const [activeStyle, setActiveStyle] = useState<StyleName>('clean');
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const handleStyleChange = useCallback((style: StyleName) => {
    setActiveStyle(style);
  }, []);

  if (!mounted) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #141428 50%, #0d0d0d 100%)',
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
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {/* ===== Section Header ===== */}
        <div className="pt-20 sm:pt-28 pb-12 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/[0.06] mb-6">
              <Braces className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-mono text-purple-400/80 uppercase tracking-widest">
                Creative Coding
              </span>
            </div>

            <h2
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4"
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Code Art
            </h2>

            <p className="font-mono text-sm sm:text-base text-white/30 tracking-wide">
              When code becomes the canvas
            </p>
          </motion.div>
        </div>

        {/* ===== Live Style Switcher ===== */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Section label */}
            <div className="flex items-center gap-3 mb-6">
              <MousePointerClick className="w-4 h-4 text-purple-400/60" />
              <h3 className="font-mono text-sm text-white/40 tracking-widest uppercase">Live Preview</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent" />
            </div>

            {/* Switcher buttons */}
            <div className="mb-8">
              <StyleSwitcher active={activeStyle} onChange={handleStyleChange} />
            </div>

            {/* Side-by-side: Preview + Code */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Preview panel */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="font-mono text-[11px] text-white/30 ml-2">
                    preview — {STYLES.find(s => s.id === activeStyle)?.label}
                  </span>
                  <ChevronRight className="w-3 h-3 text-white/15 ml-auto" />
                </div>
                <LivePreviewCard style={activeStyle} />
              </div>

              {/* Code editor panel */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d]/80 backdrop-blur-sm overflow-hidden">
                <CodeEditorPanel style={activeStyle} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===== Comparison Grid ===== */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Hash className="w-4 h-4 text-purple-400/60" />
              <h3 className="font-mono text-sm text-white/40 tracking-widest uppercase">Style Comparison</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent" />
            </div>

            <p className="font-mono text-xs text-white/25 mb-8 max-w-xl">
              {'>'} The same &quot;Hello World&quot; component, rendered in 4 distinct aesthetic styles. Each one tells a different story.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {STYLES.map((style, i) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <ComparisonGridCard style={style} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ===== Quote Section ===== */}
        <QuoteSection />

        {/* ===== Stats Bar ===== */}
        <StatsBar />
      </div>
    </section>
  );
}
