// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 783

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  ScanSearch,
  AtSign,
  Hash,
  Braces,
  Calendar,
  Code2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Zap,
  Globe,
  Phone,
  Smartphone,
  Palette,
  Type,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNT HOOK
   ────────────────────────────────────────────── */
const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */
interface RegexPreset {
  id: string;
  name: string;
  pattern: string;
  flags: string;
  testString: string;
  icon: React.ElementType;
}

interface QuickPattern {
  label: string;
  insert: string;
}

interface MatchInfo {
  index: number;
  endIndex: number;
  match: string;
  groups: string[];
  groupIndices: { group: string; start: number; end: number }[];
}

/* ──────────────────────────────────────────────
   REGEX PRESETS
   ────────────────────────────────────────────── */
const PRESETS: RegexPreset[] = [
  {
    id: 'email',
    name: 'Email',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    testString: 'Contact us at hello@example.com or support@company.co.uk. Invalid: user@, @domain.com, test@.org',
    icon: AtSign,
  },
  {
    id: 'url',
    name: 'URL',
    pattern: 'https?://(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}\\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*)',
    flags: 'gi',
    testString: 'Visit https://example.com or http://www.test.org/path?q=1. Not a URL: just text or ftp://file.server',
    icon: Globe,
  },
  {
    id: 'phone',
    name: 'Phone',
    pattern: '(?:\\+?1[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
    flags: 'g',
    testString: 'Call (555) 123-4567 or +1-800-999-0000. Also 555.987.6543. Not: 123 or abc-def-ghij',
    icon: Phone,
  },
  {
    id: 'ipv4',
    name: 'IPv4',
    pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b',
    flags: 'g',
    testString: 'Servers: 192.168.1.1, 10.0.0.255, 172.16.0.1. Invalid: 256.1.1.1, 999.999.999.999, 1.2.3',
    icon: Smartphone,
  },
  {
    id: 'hex-color',
    name: 'Hex Color',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'gi',
    testString: 'Colors: #fff, #AABBCC, #123456, #abcdef. Not: #xyz, #12, #ghijkl',
    icon: Palette,
  },
  {
    id: 'date',
    name: 'Date YYYY-MM-DD',
    pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    testString: 'Dates: 2024-01-15, 2023-12-31, 2000-06-01. Invalid: 2024-13-01, 2024-00-99, 99-01-01',
    icon: Calendar,
  },
  {
    id: 'html-tag',
    name: 'HTML Tag',
    pattern: '<(/?)([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>',
    flags: 'g',
    testString: '<div class="test">Hello <span>world</span></div> <br/> <img src="pic.jpg" />',
    icon: Code2,
  },
  {
    id: 'number',
    name: 'Number',
    pattern: '-?\\d+(?:\\.\\d+)?',
    flags: 'g',
    testString: 'Values: 42, -3.14, 0.001, 1000. Not: abc, 12.34.56, .5',
    icon: Hash,
  },
];

/* ──────────────────────────────────────────────
   QUICK INSERT PATTERNS
   ────────────────────────────────────────────── */
const QUICK_PATTERNS: QuickPattern[] = [
  { label: '\\d+', insert: '\\d+' },
  { label: '\\w+', insert: '\\w+' },
  { label: '\\s+', insert: '\\s+' },
  { label: '[a-zA-Z]+', insert: '[a-zA-Z]+' },
  { label: '[0-9]+', insert: '[0-9]+' },
  { label: '.', insert: '.' },
  { label: '^...$', insert: '^(.*)$' },
  { label: '(...)', insert: '($1)' },
  { label: '[^...]', insert: '[^\\s]+' },
  { label: '\\b', insert: '\\b' },
  { label: '(?:...)', insert: '(?:)' },
  { label: '.*', insert: '.*' },
];

/* ──────────────────────────────────────────────
   ALL FLAGS
   ────────────────────────────────────────────── */
const ALL_FLAGS = ['g', 'i', 'm', 's', 'u'] as const;

const FLAG_DESCRIPTIONS: Record<string, string> = {
  g: 'Global',
  i: 'Case-insensitive',
  m: 'Multiline',
  s: 'Dotall (dot matches newline)',
  u: 'Unicode',
};

/* ──────────────────────────────────────────────
   MATCH COLORS
   ────────────────────────────────────────────── */
const MATCH_COLORS = [
  { bg: 'rgba(16, 185, 129, 0.25)', border: 'rgba(16, 185, 129, 0.5)', text: '#34d399' },
  { bg: 'rgba(245, 158, 11, 0.25)', border: 'rgba(245, 158, 11, 0.5)', text: '#fbbf24' },
  { bg: 'rgba(139, 92, 246, 0.25)', border: 'rgba(139, 92, 246, 0.5)', text: '#a78bfa' },
  { bg: 'rgba(6, 182, 212, 0.25)', border: 'rgba(6, 182, 212, 0.5)', text: '#22d3ee' },
  { bg: 'rgba(236, 72, 153, 0.25)', border: 'rgba(236, 72, 153, 0.5)', text: '#f472b6' },
  { bg: 'rgba(52, 211, 153, 0.25)', border: 'rgba(52, 211, 153, 0.5)', text: '#6ee7b7' },
  { bg: 'rgba(251, 146, 60, 0.25)', border: 'rgba(251, 146, 60, 0.5)', text: '#fb923c' },
  { bg: 'rgba(96, 165, 250, 0.25)', border: 'rgba(96, 165, 250, 0.5)', text: '#93c5fd' },
];

/* ──────────────────────────────────────────────
   FLOATING DECORATIONS
   ────────────────────────────────────────────── */
const FLOAT_SYMBOLS = [
  { text: '/', x: 5, y: 10, delay: 0 },
  { text: '.*', x: 85, y: 15, delay: 1.2 },
  { text: '\\d', x: 10, y: 75, delay: 0.6 },
  { text: '^$', x: 90, y: 80, delay: 2.0 },
  { text: '[a-z]', x: 78, y: 45, delay: 1.6 },
  { text: 'g,i,m', x: 3, y: 50, delay: 2.4 },
];

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function RegexTesterSection() {
  const mounted = useIsMounted();

  // ─── State ───
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState<Set<string>>(new Set(['g']));
  const [testString, setTestString] = useState('Contact us at hello@example.com or support@company.co.uk. Also try user.name+tag@gmail.com and invalid@.com');
  const [copied, setCopied] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('email');

  // ─── Regex matching ───
  const matchResult = useMemo((): { results: MatchInfo[]; error: string | null } => {
    if (!pattern) return { results: [], error: null };
    try {
      const flagStr = Array.from(flags).sort().join('');
      const regex = new RegExp(pattern, flagStr);
      const results: MatchInfo[] = [];
      let m: RegExpExecArray | null;

      if (flags.has('g')) {
        while ((m = regex.exec(testString)) !== null) {
          if (m[0].length === 0) { regex.lastIndex++; continue; }
          const groupIndices: MatchInfo['groupIndices'] = [];
          for (let g = 1; g < m.length; g++) {
            if (m[g] !== undefined) {
              const gStart = testString.indexOf(m[g], m.index);
              if (gStart !== -1) {
                groupIndices.push({ group: `Group ${g}`, start: gStart, end: gStart + m[g].length });
              }
            }
          }
          results.push({
            index: m.index,
            endIndex: m.index + m[0].length,
            match: m[0],
            groups: m.slice(1).filter((g): g is string => g !== undefined),
            groupIndices,
          });
        }
      } else {
        m = regex.exec(testString);
        if (m && m[0].length > 0) {
          const groupIndices: MatchInfo['groupIndices'] = [];
          for (let g = 1; g < m.length; g++) {
            if (m[g] !== undefined) {
              const gStart = testString.indexOf(m[g], m.index);
              if (gStart !== -1) {
                groupIndices.push({ group: `Group ${g}`, start: gStart, end: gStart + m[g].length });
              }
            }
          }
          results.push({
            index: m.index,
            endIndex: m.index + m[0].length,
            match: m[0],
            groups: m.slice(1).filter((g): g is string => g !== undefined),
            groupIndices,
          });
        }
      }
      return { results, error: null };
    } catch (e) {
      return { results: [], error: (e as Error).message };
    }
  }, [pattern, flags, testString]);

  const matches = matchResult.results;
  const error = matchResult.error;

  // ─── Highlighted text rendering ───
  const highlightedParts = useMemo(() => {
    if (matches.length === 0) {
      return [{ type: 'text' as const, content: testString, colorIndex: 0 }];
    }

    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
    const parts: { type: 'match' | 'text' | 'group'; content: string; colorIndex: number }[] = [];
    let lastEnd = 0;

    sortedMatches.forEach((match, mi) => {
      if (match.index > lastEnd) {
        parts.push({ type: 'text', content: testString.slice(lastEnd, match.index), colorIndex: 0 });
      }
      parts.push({ type: 'match', content: match.match, colorIndex: mi % MATCH_COLORS.length });
      lastEnd = match.endIndex;
    });

    if (lastEnd < testString.length) {
      parts.push({ type: 'text', content: testString.slice(lastEnd), colorIndex: 0 });
    }

    return parts;
  }, [matches, testString]);

  // ─── Handlers ───
  const toggleFlag = useCallback((flag: string) => {
    setFlags(prev => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }, []);

  const insertPattern = useCallback((insert: string) => {
    setPattern(prev => prev + insert);
  }, []);

  const loadPreset = useCallback((preset: RegexPreset) => {
    setPattern(preset.pattern);
    setFlags(new Set(preset.flags.split('')));
    setTestString(preset.testString);
    setActivePresetId(preset.id);
    setShowPresets(false);
  }, []);

  const copyRegex = useCallback(async () => {
    const flagStr = Array.from(flags).sort().join('');
    const full = `/${pattern}/${flagStr}`;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = full;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pattern, flags]);

  const clearAll = useCallback(() => {
    setPattern('');
    setFlags(new Set(['g']));
    setTestString('');
    setActivePresetId(null);
  }, []);

  if (!mounted) {
    return (
      <section className="relative w-full min-h-[80vh] bg-gradient-to-b from-[#0a0a0a] to-[#141420]" />
    );
  }

  return (
    <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] to-[#141420] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-grid-subtle" />

      {/* Floating decorative symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOAT_SYMBOLS.map((sym, i) => (
          <motion.div
            key={`regex-float-${i}`}
            className="absolute font-mono text-sm whitespace-nowrap select-none"
            style={{
              left: `${sym.x}%`,
              top: `${sym.y}%`,
              color: 'rgba(16, 185, 129, 0.08)',
            }}
            animate={{ y: [0, -10, 0], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 7 + i * 0.9, repeat: Infinity, ease: 'easeInOut', delay: sym.delay }}
          >
            {sym.text}
          </motion.div>
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-6">
            <ScanSearch className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/60 font-mono">Pattern Tool</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-text">
              Regex Lab
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-mono">
            Test, debug, and learn regular expressions in real-time
          </p>
        </motion.div>

        {/* Two-panel layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── LEFT PANEL: Controls ─── */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Pattern Input Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              {/* VS Code-style chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-white/30 ml-2">regex-pattern</span>
                <div className="flex-1" />
                <motion.button
                  onClick={copyRegex}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono text-white/50 hover:text-white/80 border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Copy regex pattern"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>

              {/* Regex input with delimiters */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-0 bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-amber-500/40 transition-colors">
                  <span className="text-amber-400 font-mono text-lg font-bold pl-3 select-none">/</span>
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => { setPattern(e.target.value); setActivePresetId(null); }}
                    className="flex-1 bg-transparent text-white font-mono text-sm py-2.5 px-1 outline-none placeholder:text-white/20 min-w-0"
                    placeholder="Enter regex pattern..."
                    spellCheck={false}
                    autoComplete="off"
                    aria-label="Regex pattern"
                  />
                  <span className="text-amber-400 font-mono text-lg font-bold pr-1 select-none">/</span>
                  <span className="text-emerald-400 font-mono text-sm pr-3 select-none">
                    {Array.from(flags).sort().join('')}
                  </span>
                </div>
              </div>

              {/* Flags selector */}
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {ALL_FLAGS.map((flag) => {
                    const isActive = flags.has(flag);
                    return (
                      <motion.button
                        key={flag}
                        onClick={() => toggleFlag(flag)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12]'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={FLAG_DESCRIPTIONS[flag]}
                        aria-label={`${FLAG_DESCRIPTIONS[flag]} flag`}
                      >
                        <span className="font-bold">{flag}</span>
                        <span className="text-[10px] opacity-60 hidden sm:inline">{FLAG_DESCRIPTIONS[flag]}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Error display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs font-mono text-red-400">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Test String Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden flex-1">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-white/30 ml-2">test-string</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono text-white/20">{testString.length} chars</span>
              </div>
              <div className="px-4 py-3">
                <textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  className="w-full h-36 sm:h-44 bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-emerald-500/40 text-white font-mono text-sm p-3 outline-none resize-none placeholder:text-white/20 custom-scrollbar transition-colors"
                  placeholder="Enter test string here..."
                  spellCheck={false}
                  aria-label="Test string"
                />
              </div>
            </div>

            {/* Quick Patterns */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <Braces className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-mono text-white/40">Common Patterns</span>
              </div>
              <div className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PATTERNS.map((qp) => (
                    <motion.button
                      key={`qp-${qp.label}`}
                      onClick={() => insertPattern(qp.insert)}
                      className="px-2.5 py-1 rounded-md text-xs font-mono text-white/40 border border-white/[0.06] bg-white/[0.02] hover:text-amber-300 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Insert pattern ${qp.label}`}
                    >
                      {qp.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Presets Toggle + Clear */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowPresets(prev => !prev)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono text-white/70 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Presets ({PRESETS.length})
                {showPresets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </motion.button>
              <motion.button
                onClick={clearAll}
                className="px-4 py-2.5 rounded-xl text-sm font-mono text-white/50 border border-white/[0.06] bg-white/[0.02] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Clear all"
              >
                Clear
              </motion.button>
            </div>

            {/* Presets Grid */}
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {PRESETS.map((preset) => {
                      const isActive = activePresetId === preset.id;
                      const PresetIcon = preset.icon;
                      return (
                        <motion.button
                          key={`preset-${preset.id}`}
                          onClick={() => loadPreset(preset)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                          }`}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <PresetIcon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-white/40'}`} />
                          <span className={`text-xs font-mono ${isActive ? 'text-amber-300' : 'text-white/50'}`}>
                            {preset.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ─── RIGHT PANEL: Results ─── */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Match Highlighting Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-white/30 ml-2">match-highlight</span>
                <div className="flex-1" />
                <span className="text-xs font-mono text-emerald-400/60">
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              <div className="px-4 py-3">
                <div
                  className="min-h-[120px] sm:min-h-[160px] bg-black/30 rounded-lg border border-white/[0.06] p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words custom-scrollbar max-h-[300px] overflow-y-auto"
                  role="region"
                  aria-label="Match highlighting result"
                >
                  {highlightedParts.length > 0 && testString ? (
                    highlightedParts.map((part, i) => {
                      if (part.type === 'text') {
                        return (
                          <span key={`hl-text-${i}`} className="text-white/70">
                            {part.content}
                          </span>
                        );
                      }
                      const color = MATCH_COLORS[part.colorIndex % MATCH_COLORS.length];
                      return (
                        <span
                          key={`hl-match-${i}`}
                          className="rounded px-0.5 border-b-2 transition-all"
                          style={{
                            backgroundColor: color.bg,
                            borderBottomColor: color.border,
                            color: color.text,
                          }}
                        >
                          {part.content}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-white/20 italic">No test string provided...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Match Stats */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-4 py-3 text-center">
                <div className="text-2xl font-bold font-mono text-emerald-400">{matches.length}</div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-1">Matches</div>
              </div>
              <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-4 py-3 text-center">
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {matches.reduce((acc, m) => acc + m.groups.length, 0)}
                </div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-1">Groups</div>
              </div>
              <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-4 py-3 text-center">
                <div className="text-2xl font-bold font-mono text-purple-400">
                  {matches.reduce((acc, m) => acc + m.match.length, 0)}
                </div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-1">Chars</div>
              </div>
            </div>

            {/* Match Details Table */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden flex-1">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <Terminal className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-mono text-white/40">Match Details</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {matches.length > 0 ? (
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left px-4 py-2.5 text-white/40 font-normal">#</th>
                        <th className="text-left px-4 py-2.5 text-white/40 font-normal">Match</th>
                        <th className="text-left px-4 py-2.5 text-white/40 font-normal hidden sm:table-cell">Index</th>
                        <th className="text-left px-4 py-2.5 text-white/40 font-normal hidden md:table-cell">Groups</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((match, i) => {
                        const color = MATCH_COLORS[i % MATCH_COLORS.length];
                        return (
                          <motion.tr
                            key={`match-row-${i}`}
                            className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <td className="px-4 py-2.5">
                              <span
                                className="inline-block w-5 h-5 rounded text-center leading-5 text-[10px] font-bold"
                                style={{ backgroundColor: `${color.bg}`, color: color.text, border: `1px solid ${color.border}` }}
                              >
                                {i + 1}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <code
                                className="rounded px-1.5 py-0.5"
                                style={{ backgroundColor: color.bg, color: color.text }}
                              >
                                {match.match.length > 50 ? match.match.slice(0, 50) + '...' : match.match}
                              </code>
                            </td>
                            <td className="px-4 py-2.5 text-white/40 hidden sm:table-cell">
                              [{match.index}:{match.endIndex}]
                            </td>
                            <td className="px-4 py-2.5 text-white/40 hidden md:table-cell">
                              {match.groups.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {match.groups.map((g, gi) => (
                                    <span
                                      key={`group-${i}-${gi}`}
                                      className="px-1.5 py-0.5 rounded bg-white/[0.04] text-white/50"
                                    >
                                      ${gi + 1}: &quot;{g.length > 20 ? g.slice(0, 20) + '...' : g}&quot;
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-white/20">—</span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-4 py-12 text-center">
                    <div className="text-white/20 text-sm">
                      {pattern && !error ? 'No matches found' : 'Enter a pattern to see matches'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info bar */}
        <motion.div
          className="max-w-7xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-white/25"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { icon: Braces, text: 'Real-time Matching' },
            { icon: ScanSearch, text: `${PRESETS.length} Presets` },
            { icon: Copy, text: 'Copy Regex' },
            { icon: Type, text: '5 Flags' },
          ].map((info, i) => (
            <div key={`regex-info-${i}`} className="flex items-center gap-1.5">
              <info.icon className="w-3.5 h-3.5" />
              <span>{info.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
