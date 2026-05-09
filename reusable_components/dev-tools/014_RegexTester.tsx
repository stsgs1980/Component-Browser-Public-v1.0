/**
 * RegexTester — Reusable regular expression testing component.
 *
 * Provides a live regex testing environment with pattern input,
 * flag toggles, match highlighting (multi-color), match detail table,
 * auto-detection presets, and quick-insert pattern snippets.
 *
 * @module 014_RegexTester
 */

import { useState, useCallback, useMemo } from 'react';
import { useIsMounted, copyToClipboard, IconCopy, IconCheck, type GeneratorTheme, DEFAULT_THEME } from './shared';

// ─── Types ────────────────────────────────────────────────────

/** A regex preset with pattern, flags, and test string. */
export interface RegexPreset {
  id: string;
  name: string;
  pattern: string;
  flags: string;
  testString: string;
}

/** A quick-insert pattern snippet. */
export interface QuickPattern {
  label: string;
  insert: string;
}

/** Information about a single match. */
export interface MatchInfo {
  index: number;
  endIndex: number;
  match: string;
  groups: string[];
  groupIndices: { group: string; start: number; end: number }[];
}

/** A match highlight color definition. */
export interface MatchColor {
  bg: string;
  border: string;
  text: string;
}

/** Flag definition. */
export interface FlagDef {
  char: string;
  description: string;
}

/** Props for the RegexTester component. */
export interface RegexTesterProps {
  /** Preset regex patterns. */
  presets?: RegexPreset[];
  /** Quick-insert pattern snippets. */
  quickPatterns?: QuickPattern[];
  /** Colors used for alternating match highlights. */
  matchColors?: MatchColor[];
  /** Flag definitions. */
  flags?: FlagDef[];
  /** Theme overrides. */
  theme?: GeneratorTheme;
  /** Additional className on the root element. */
  className?: string;
}

// ─── Default Data ─────────────────────────────────────────────

const DEFAULT_PRESETS: RegexPreset[] = [
  { id: 'email', name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', testString: 'Contact us at hello@example.com or support@company.co.uk. Invalid: user@, @domain.com, test@.org' },
  { id: 'url', name: 'URL', pattern: 'https?://(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}\\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*)', flags: 'gi', testString: 'Visit https://example.com or http://www.test.org/path?q=1. Not a URL: just text' },
  { id: 'phone', name: 'Phone', pattern: '(?:\\+?1[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g', testString: 'Call (555) 123-4567 or +1-800-999-0000. Also 555.987.6543.' },
  { id: 'ipv4', name: 'IPv4', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: 'g', testString: 'Servers: 192.168.1.1, 10.0.0.255. Invalid: 256.1.1.1' },
  { id: 'hex', name: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'gi', testString: 'Colors: #fff, #AABBCC, #123456. Not: #xyz, #12' },
  { id: 'date', name: 'Date', pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b', flags: 'g', testString: 'Dates: 2024-01-15, 2023-12-31. Invalid: 2024-13-01' },
  { id: 'html', name: 'HTML Tag', pattern: '<(/?)([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>', flags: 'g', testString: '<div class="test">Hello <span>world</span></div> <br/>' },
  { id: 'number', name: 'Number', pattern: '-?\\d+(?:\\.\\d+)?', flags: 'g', testString: 'Values: 42, -3.14, 0.001, 1000.' },
];

const DEFAULT_QUICK_PATTERNS: QuickPattern[] = [
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

const DEFAULT_FLAGS: FlagDef[] = [
  { char: 'g', description: 'Global' },
  { char: 'i', description: 'Case-insensitive' },
  { char: 'm', description: 'Multiline' },
  { char: 's', description: 'Dotall' },
  { char: 'u', description: 'Unicode' },
];

const DEFAULT_MATCH_COLORS: MatchColor[] = [
  { bg: 'rgba(16, 185, 129, 0.25)', border: 'rgba(16, 185, 129, 0.5)', text: '#34d399' },
  { bg: 'rgba(245, 158, 11, 0.25)', border: 'rgba(245, 158, 11, 0.5)', text: '#fbbf24' },
  { bg: 'rgba(139, 92, 246, 0.25)', border: 'rgba(139, 92, 246, 0.5)', text: '#a78bfa' },
  { bg: 'rgba(6, 182, 212, 0.25)', border: 'rgba(6, 182, 212, 0.5)', text: '#22d3ee' },
  { bg: 'rgba(236, 72, 153, 0.25)', border: 'rgba(236, 72, 153, 0.5)', text: '#f472b6' },
  { bg: 'rgba(52, 211, 153, 0.25)', border: 'rgba(52, 211, 153, 0.5)', text: '#6ee7b7' },
  { bg: 'rgba(251, 146, 60, 0.25)', border: 'rgba(251, 146, 60, 0.5)', text: '#fb923c' },
  { bg: 'rgba(96, 165, 250, 0.25)', border: 'rgba(96, 165, 250, 0.5)', text: '#93c5fd' },
];

// ─── Inline SVG Icons ─────────────────────────────────────────

function IconScanSearch({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="4" /><path d="m16 16-2 2" />
    </svg>
  );
}

function IconTerminal({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4,17 10,11 4,5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function IconChevronDown({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconChevronUp({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function IconZap({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function IconBraces({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
      <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
    </svg>
  );
}

// ─── CSS keyframes ────────────────────────────────────────────

const floatKeyframes = `
@keyframes regex-float {
  0%, 100% { transform: translateY(0); opacity: 0.05; }
  50% { transform: translateY(-10px); opacity: 0.12; }
}
`;

// ─── Component ────────────────────────────────────────────────

/**
 * RegexTester — interactive regular expression testing tool.
 *
 * @example
 * ```tsx
 * <RegexTester theme={{ accent: '#e04040' }} />
 * ```
 */
export function RegexTester({
  presets,
  quickPatterns,
  matchColors,
  flags,
  theme = DEFAULT_THEME,
  className,
}: RegexTesterProps) {
  const mounted = useIsMounted();
  const activePresets = presets ?? DEFAULT_PRESETS;
  const activeQP = quickPatterns ?? DEFAULT_QUICK_PATTERNS;
  const activeColors = matchColors ?? DEFAULT_MATCH_COLORS;
  const activeFlags = flags ?? DEFAULT_FLAGS;

  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flagSet, setFlagSet] = useState<Set<string>>(new Set(['g']));
  const [testString, setTestString] = useState('Contact us at hello@example.com or support@company.co.uk. Also try user.name+tag@gmail.com and invalid@.com');
  const [copied, setCopied] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('email');

  // Regex matching
  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [] as MatchInfo[], error: null };
    try {
      const flagStr = Array.from(flagSet).sort().join('');
      const regex = new RegExp(pattern, flagStr);
      const results: MatchInfo[] = [];
      let m: RegExpExecArray | null;
      const collect = (match: RegExpExecArray | null) => {
        if (!match || match[0].length === 0) return;
        const gi: MatchInfo['groupIndices'] = [];
        for (let g = 1; g < match.length; g++) {
          if (match[g] !== undefined) {
            const gs = testString.indexOf(match[g], match.index);
            if (gs !== -1) gi.push({ group: `Group ${g}`, start: gs, end: gs + match[g].length });
          }
        }
        results.push({ index: match.index, endIndex: match.index + match[0].length, match: match[0], groups: match.slice(1).filter((g): g is string => g !== undefined), groupIndices: gi });
      };
      if (flagSet.has('g')) {
        while ((m = regex.exec(testString)) !== null) { collect(m); if (m[0].length === 0) regex.lastIndex++; }
      } else { collect(regex.exec(testString)); }
      return { matches: results, error: null };
    } catch (e) { return { matches: [] as MatchInfo[], error: (e as Error).message }; }
  }, [pattern, flagSet, testString]);

  // Highlighted text
  const highlightedParts = useMemo(() => {
    if (matches.length === 0) return [{ type: 'text' as const, content: testString, colorIndex: 0 }];
    const sorted = [...matches].sort((a, b) => a.index - b.index);
    const parts: { type: 'match' | 'text'; content: string; colorIndex: number }[] = [];
    let lastEnd = 0;
    sorted.forEach((m, mi) => {
      if (m.index > lastEnd) parts.push({ type: 'text', content: testString.slice(lastEnd, m.index), colorIndex: 0 });
      parts.push({ type: 'match', content: m.match, colorIndex: mi % activeColors.length });
      lastEnd = m.endIndex;
    });
    if (lastEnd < testString.length) parts.push({ type: 'text', content: testString.slice(lastEnd), colorIndex: 0 });
    return parts;
  }, [matches, testString, activeColors.length]);

  const toggleFlag = useCallback((f: string) => { setFlagSet(prev => { const n = new Set(prev); if (n.has(f)) n.delete(f); else n.add(f); return n; }); }, []);
  const insertPattern = useCallback((insert: string) => setPattern(prev => prev + insert), []);
  const loadPreset = useCallback((p: RegexPreset) => { setPattern(p.pattern); setFlagSet(new Set(p.flags.split(''))); setTestString(p.testString); setActivePresetId(p.id); setShowPresets(false); }, []);

  const copyRegex = useCallback(async () => {
    const flagStr = Array.from(flagSet).sort().join('');
    const ok = await copyToClipboard(`/${pattern}/${flagStr}`);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [pattern, flagSet]);

  const clearAll = useCallback(() => { setPattern(''); setFlagSet(new Set(['g'])); setTestString(''); setActivePresetId(null); }, []);

  if (!mounted) return <div className={className} />;

  const chrome = () => (<><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" />{<div className="flex gap-1.5" />}</>);

  return (
    <div className={`relative w-full py-20 md:py-28 bg-[#f5f0e1] overflow-hidden ${className ?? ''}`}>
      <style>{floatKeyframes}</style>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { text: '/', x: 5, y: 10, delay: 0 }, { text: '.*', x: 85, y: 15, delay: 1.2 },
          { text: '\\d', x: 10, y: 75, delay: 0.6 }, { text: '^$', x: 90, y: 80, delay: 2.0 },
          { text: '[a-z]', x: 78, y: 45, delay: 1.6 }, { text: 'g,i,m', x: 3, y: 50, delay: 2.4 },
        ].map((s, i) => (
          <span key={`fl-${i}`} className="absolute font-mono text-sm whitespace-nowrap select-none pointer-events-none" style={{ left: `${s.x}%`, top: `${s.y}%`, color: 'rgba(180, 128, 23, 0.12)', animation: `regex-float ${7 + i * 0.9}s ease-in-out ${s.delay}s infinite` }}>{s.text}</span>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(180,128,23,0.08) 100%)' }} />

      <div className="relative z-10 w-full px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16" style={{ transition: 'opacity 0.7s ease' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border bg-[#ebe5d0] mb-6" style={{ borderColor: theme.border }}>
            <IconScanSearch className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-sm font-mono" style={{ color: theme.textMuted }}>Pattern Tool</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-clip-text text-transparent bg-[length:200%_100%]">Regex Lab</span>
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto font-mono" style={{ color: theme.textMuted }}>Test, debug, and learn regular expressions in real-time</p>
        </div>

        {/* Two-panel */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Controls */}
          <div className="flex flex-col gap-4">
            {/* Pattern Input Card */}
            <div className="border bg-[#ebe5d0] overflow-hidden" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex gap-1.5">{chrome()}</div>
                <span className="text-xs font-mono ml-2" style={{ color: theme.textMuted }}>regex-pattern</span>
                <div className="flex-1" />
                <button onClick={copyRegex} className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono border bg-white/[0.02] transition-all cursor-pointer hover:bg-white/[0.04]" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.06)' }} aria-label="Copy regex">
                  {copied ? <IconCheck className="w-3.5 h-3.5" style={{ color: theme.accent }} /> : <IconCopy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Regex input with delimiters */}
              <div className="px-4 py-3">
                <div className="flex items-center bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-amber-500/40 transition-colors">
                  <span className="font-mono text-lg font-bold pl-3 select-none" style={{ color: theme.accent }}>/</span>
                  <input type="text" value={pattern} onChange={(e) => { setPattern(e.target.value); setActivePresetId(null); }} className="flex-1 bg-transparent text-white font-mono text-sm py-2.5 px-1 outline-none min-w-0" placeholder="Enter regex pattern..." spellCheck={false} autoComplete="off" aria-label="Regex pattern" />
                  <span className="font-mono text-lg font-bold pr-1 select-none" style={{ color: theme.accent }}>/</span>
                  <span className="font-mono text-sm pr-3 select-none" style={{ color: theme.accent }}>{Array.from(flagSet).sort().join('')}</span>
                </div>
              </div>

              {/* Flags */}
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {activeFlags.map((f) => {
                    const isActive = flagSet.has(f.char);
                    return (
                      <button key={f.char} onClick={() => toggleFlag(f.char)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all cursor-pointer" style={{ background: isActive ? `${theme.accent}26` : 'rgba(255,255,255,0.02)', borderColor: isActive ? `${theme.accent}4D` : 'rgba(255,255,255,0.06)', color: isActive ? theme.accentSecondary : theme.textMuted }} title={f.description} aria-label={`${f.description} flag`}>
                        <span className="font-bold">{f.char}</span>
                        <span className="text-[10px] opacity-60 hidden sm:inline">{f.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mx-4 mb-3 px-3 py-2 rounded-lg" style={{ background: `${theme.danger}1a`, border: `1px solid ${theme.danger}33` }}>
                  <p className="text-xs font-mono" style={{ color: theme.danger }}>{error}</p>
                </div>
              )}
            </div>

            {/* Test String Card */}
            <div className="border bg-[#ebe5d0] overflow-hidden flex-1" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex gap-1.5">{chrome()}</div>
                <span className="text-xs font-mono ml-2" style={{ color: theme.textMuted }}>test-string</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{testString.length} chars</span>
              </div>
              <div className="px-4 py-3">
                <textarea value={testString} onChange={(e) => setTestString(e.target.value)} className="w-full h-36 sm:h-44 bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-[#d4a017]/40 text-white font-mono text-sm p-3 outline-none resize-none transition-colors" placeholder="Enter test string here..." spellCheck={false} aria-label="Test string" />
              </div>
            </div>

            {/* Quick Patterns */}
            <div className="border bg-[#ebe5d0] overflow-hidden" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <IconBraces className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
                <span className="text-xs font-mono" style={{ color: theme.textMuted }}>Common Patterns</span>
              </div>
              <div className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {activeQP.map((qp) => (
                    <button key={`qp-${qp.label}`} onClick={() => insertPattern(qp.insert)} className="px-2.5 py-1 rounded-md text-xs font-mono border bg-white/[0.02] transition-all cursor-pointer" style={{ color: theme.textMuted, borderColor: 'rgba(255,255,255,0.06)' }}>{qp.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Presets toggle + clear */}
            <div className="flex gap-3">
              <button onClick={() => setShowPresets((p) => !p)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
                <IconZap className="w-4 h-4" style={{ color: theme.accent }} />Presets ({activePresets.length})
                {showPresets ? <IconChevronUp className="w-3.5 h-3.5" /> : <IconChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button onClick={clearAll} className="px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.02] transition-all cursor-pointer" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.06)' }} aria-label="Clear all">Clear</button>
            </div>

            {/* Presets Grid */}
            {showPresets && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1" style={{ transition: 'opacity 0.3s ease' }}>
                {activePresets.map((preset) => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <button key={`preset-${preset.id}`} onClick={() => loadPreset(preset)} className="flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer hover:bg-white/[0.04]" style={{ background: isActive ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)', borderColor: isActive ? `${theme.accent}4D` : 'rgba(255,255,255,0.06)' }}>
                      <span className="text-xs font-mono" style={{ color: isActive ? theme.accentSecondary : '#1a1a1a' }}>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {/* Match Highlighting */}
            <div className="border bg-[#ebe5d0] overflow-hidden" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex gap-1.5">{chrome()}</div>
                <span className="text-xs font-mono ml-2" style={{ color: theme.textMuted }}>match-highlight</span>
                <div className="flex-1" />
                <span className="text-xs font-mono" style={{ color: `${theme.accent}99` }}>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</span>
              </div>
              <div className="px-4 py-3">
                <div className="min-h-[120px] sm:min-h-[160px] bg-black/30 rounded-lg border border-white/[0.06] p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto" role="region" aria-label="Match highlighting">
                  {highlightedParts.length > 0 && testString ? highlightedParts.map((part, i) => {
                    if (part.type === 'text') return <span key={`hl-${i}`} className="text-[#1a1a1a]">{part.content}</span>;
                    const c = activeColors[part.colorIndex % activeColors.length];
                    return <span key={`hm-${i}`} className="rounded px-0.5 border-b-2" style={{ backgroundColor: c.bg, borderBottomColor: c.border, color: c.text }}>{part.content}</span>;
                  }) : <span className="italic" style={{ color: theme.textMuted }}>No test string provided...</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              {[
                { label: 'Matches', value: matches.length, color: theme.accent },
                { label: 'Groups', value: matches.reduce((a, m) => a + m.groups.length, 0), color: theme.accent },
                { label: 'Chars', value: matches.reduce((a, m) => a + m.match.length, 0), color: theme.textMuted },
              ].map((s) => (
                <div key={s.label} className="flex-1 border bg-[#ebe5d0] px-4 py-3 text-center" style={{ borderColor: theme.border }}>
                  <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: theme.textMuted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Match Details Table */}
            <div className="border bg-[#ebe5d0] overflow-hidden flex-1" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <IconTerminal className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
                <span className="text-xs font-mono" style={{ color: theme.textMuted }}>Match Details</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {matches.length > 0 ? (
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.border }}>
                        <th className="text-left px-4 py-2.5 font-normal" style={{ color: theme.textMuted }}>#</th>
                        <th className="text-left px-4 py-2.5 font-normal" style={{ color: theme.textMuted }}>Match</th>
                        <th className="text-left px-4 py-2.5 font-normal hidden sm:table-cell" style={{ color: theme.textMuted }}>Index</th>
                        <th className="text-left px-4 py-2.5 font-normal hidden md:table-cell" style={{ color: theme.textMuted }}>Groups</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((match, i) => {
                        const color = activeColors[i % activeColors.length];
                        return (
                          <tr key={`row-${i}`} className="border-b transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <td className="px-4 py-2.5">
                              <span className="inline-block w-5 h-5 rounded text-center leading-5 text-[10px] font-bold" style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}>{i + 1}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              <code className="rounded px-1.5 py-0.5" style={{ backgroundColor: color.bg, color: color.text }}>
                                {match.match.length > 50 ? match.match.slice(0, 50) + '...' : match.match}
                              </code>
                            </td>
                            <td className="px-4 py-2.5 hidden sm:table-cell" style={{ color: theme.textMuted }}>[{match.index}:{match.endIndex}]</td>
                            <td className="px-4 py-2.5 hidden md:table-cell" style={{ color: theme.textMuted }}>
                              {match.groups.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {match.groups.map((g, gi) => <span key={`g-${i}-${gi}`} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[#1a1a1a]">${gi + 1}: &quot;{g.length > 20 ? g.slice(0, 20) + '...' : g}&quot;</span>)}
                                </div>
                              ) : <span style={{ color: theme.textMuted }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-4 py-12 text-center"><span className="text-sm" style={{ color: theme.textMuted }}>{pattern && !error ? 'No matches found' : 'Enter a pattern to see matches'}</span></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info bar */}
        <div className="max-w-7xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono" style={{ color: theme.textMuted }}>
          {[
            { text: 'Real-time Matching' },
            { text: `${activePresets.length} Presets` },
            { text: 'Copy Regex' },
            { text: `${activeFlags.length} Flags` },
          ].map((info, i) => (
            <div key={`info-${i}`} className="flex items-center gap-1.5"><span>{info.text}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RegexTester;
