// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 719

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Copy,
  Check,
  Type,
  Hash,
  AlignLeft,
  ArrowRight,
  Info,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   SSR-SAFE MOUNT HOOK
   ────────────────────────────────────────────── */
const subscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/* ──────────────────────────────────────────────
   LOREM IPSUM CORPUS (100+ words in sentences)
   ────────────────────────────────────────────── */
const LOREM_CORPUS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus, nec faucibus nisl sodales ut.',
  'Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.',
  'Aliquam erat volutpat, nam dui mi, tincidunt quis accumsan porttitor facilisis luctus metus.',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
  'Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet ante.',
  'Donec eu libero sit amet quam egestas semper, aenean ultricies mi vitae est.',
  'Mauris placerat eleifend leo, quisque sit amet est et sapien ullamcorper pharetra.',
  'Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet wisi.',
  'Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci.',
  'Sed sagittis blandit diam at convallis, cras sed odio felis.',
  'In hac habitasse platea dictumst, maecenas nec odio et ante tincidunt tempus.',
  'Donec vitae sapien ut libero venenatis faucibus, nullam quis ante etiam sit amet orci eget eros.',
  'Fusce ac felis sit amet ligula pharetra condimentum, maecenas mattis mollis tristique.',
  'Sed sed lorem id erat iaculis vestibulum, sed vitae augue vitae diam pharetra vestibulum.',
  'Integer malesuada, donec dignissim lacus ut ante tempus posuere.',
  'Proin ut ligula vel nunc egestas porttitor, morbi lectus risus iaculis vel.',
  'Suspendisse potenti, ut pharetra augue nunc eu nibh consequat auctor.',
  'Nam nec ante sed lacinia, maecenas ut urna pellentesque dolor sagittis.',
  'Aenean commodo ligula eget dolor, aenean massa cum sociis natoque.',
  'Penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
  'Nulla consequat massa quis enim, donec pede justo fringilla vel aliquet.',
  'Vivamus elementum semper nisi, aenean vulputate eleifend tellus.',
  'Aenean leo ligula porttitor eu consequat vitae eleifend ac enim.',
  'Aliquam lorem ante dapibus in viverra quis feugiat a tellus.',
  'Phasellus viverra nulla ut metus varius laoreet, quisque rutrum.',
  'Aenean imperdiet etiam ultricies nisi vel augue, curabitur ullamcorper ultricies nisi.',
  'Nam eget dui etiam rhoncus maecenas tempus, tellus eget condimentum rhoncus.',
  'Sem quam semper libero sit amet adipiscing sem neque sed ipsum.',
  'Nam quam nunc blandit vel luctus duis, consectetuer adipiscing elit.',
  'Proin interdum mauris non ligula pellentesque ultrices, phasellus id sapien.',
  'Suspendisse ornare consequat lectus in est risus auctor sed tristique.',
  'Ut non enim eleifend felis pretium feugiat, vivamus quis mi sit amet dui commodo.',
  'Maecenas nisl est, ultrices nec congue eget auctor vitae massa.',
  'Fusce luctus vestibulum augue ut facilisis, donec pede justo fringilla vel aliquet.',
  'Nec vulputate eget, arcu in enim rhoncus tempor ac nulla enim.',
  'Pellentesque dapibus hendrerit tortor, praesent porttitor integer fermentum.',
  'Cras dapibus vivamus elementum semper nisi aenean vulputate eleifend tellus.',
  'Aenean leo ligula porttitor eu consequat vitae eleifend ac enim.',
  'Quisque ut nisi, donec sodales sagittis magna sed consequat leo eget bibendum.',
  'Orci non eros sed orci in hac habitasse platea dictumst.',
  'Sed fringilla mauris sit amet nibh, nam nec ante sed lacinia.',
  'Maecenas malesuada, praesent congue erat at massa sed cursus.',
  'Turpis faucibus orci luctus et ultrices posuere cubilia curae.',
  'Suspendisse felis, imperdiet feugiat massa pretium pharetra hendrerit.',
  'Lectus sit amet est consectetur adipiscing elit pellentesque habitant morbi.',
  'Tristique senectus et netus et malesuada fames ac turpis egestas.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia.',
];

/* ──────────────────────────────────────────────
   FLOATING DECORATIONS
   ────────────────────────────────────────────── */
const FLOAT_SYMBOLS = [
  { text: '¶', x: 5, y: 15, delay: 0 },
  { text: '§', x: 90, y: 20, delay: 1.2 },
  { text: 'Aa', x: 7, y: 75, delay: 0.6 },
  { text: '…', x: 88, y: 80, delay: 2.0 },
  { text: '"', x: 80, y: 45, delay: 1.6 },
  { text: '¶¶', x: 3, y: 50, delay: 2.4 },
  { text: '~~', x: 78, y: 90, delay: 0.3 },
  { text: 'Ip', x: 18, y: 88, delay: 1.0 },
];

/* ──────────────────────────────────────────────
   TEXT TYPES
   ────────────────────────────────────────────── */
type TextType = 'paragraphs' | 'sentences' | 'words' | 'single';

interface TextTypeOption {
  id: TextType;
  label: string;
  icon: React.ElementType;
  min: number;
  max: number;
  defaultCount: number;
}

const TEXT_TYPE_OPTIONS: TextTypeOption[] = [
  { id: 'paragraphs', label: 'Paragraphs', icon: AlignLeft, min: 1, max: 50, defaultCount: 3 },
  { id: 'sentences', label: 'Sentences', icon: Type, min: 1, max: 100, defaultCount: 10 },
  { id: 'words', label: 'Words', icon: Hash, min: 1, max: 500, defaultCount: 50 },
  { id: 'single', label: 'Single', icon: FileText, min: 1, max: 1, defaultCount: 1 },
];

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateText(
  type: TextType,
  count: number,
  startWithLorem: boolean,
  seed: number,
): string {
  const rand = seededRandom(seed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  if (type === 'single') {
    const sentences: string[] = [];
    const numSentences = 4 + Math.floor(rand() * 4);
    if (startWithLorem) sentences.push(LOREM_CORPUS[0]);
    for (let i = sentences.length; i < numSentences; i++) {
      sentences.push(pick(LOREM_CORPUS));
    }
    return sentences.join(' ');
  }

  if (type === 'sentences') {
    const sentences: string[] = [];
    if (startWithLorem) {
      sentences.push(LOREM_CORPUS[0]);
    }
    for (let i = sentences.length; i < count; i++) {
      sentences.push(pick(LOREM_CORPUS));
    }
    return sentences.join(' ');
  }

  if (type === 'words') {
    const allWords = LOREM_CORPUS.join(' ').replace(/\./g, '').split(/\s+/);
    const words: string[] = [];
    if (startWithLorem) {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
    }
    while (words.length < count) {
      words.push(pick(allWords));
    }
    return words.slice(0, count).join(' ');
  }

  // paragraphs
  const paragraphs: string[] = [];
  for (let p = 0; p < count; p++) {
    const numSentences = 4 + Math.floor(rand() * 5);
    const sentences: string[] = [];
    if (p === 0 && startWithLorem) {
      sentences.push(LOREM_CORPUS[0]);
    }
    for (let i = sentences.length; i < numSentences; i++) {
      sentences.push(pick(LOREM_CORPUS));
    }
    paragraphs.push(sentences.join(' '));
  }
  return paragraphs.join('\n\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function LoremIpsumSection() {
  const mounted = useIsMounted();

  // ─── State ───
  const [textType, setTextType] = useState<TextType>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [copiedText, setCopiedText] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // ─── Derived ───
  const typeConfig = useMemo(
    () => TEXT_TYPE_OPTIONS.find((t) => t.id === textType)!,
    [textType],
  );

  // Generate the text
  const generatedText = useMemo(
    () => generateText(textType, count, startWithLorem, seed),
    [textType, count, startWithLorem, seed],
  );

  // Stats
  const stats = useMemo(() => {
    const trimmed = generatedText.trim();
    const charCount = trimmed.length;
    const wordCount = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
    const paragraphCount = trimmed === '' ? 0 : trimmed.split(/\n\s*\n/).length;
    return { charCount, wordCount, paragraphCount };
  }, [generatedText]);

  // Generate HTML version
  const htmlVersion = useMemo(() => {
    const paragraphs = generatedText.split(/\n\s*\n/);
    return paragraphs
      .map((p) => {
        const escaped = escapeHtml(p.trim());
        return escaped ? `<p>${escaped}</p>` : '';
      })
      .filter(Boolean)
      .join('\n');
  }, [generatedText]);

  // ─── Handlers ───
  const handleTypeChange = useCallback((type: TextType) => {
    const config = TEXT_TYPE_OPTIONS.find((t) => t.id === type)!;
    setTextType(type);
    setCount(config.defaultCount);
    setSeed(Math.floor(Math.random() * 100000));
  }, []);

  const handleRegenerate = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
  }, []);

  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = generatedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }, [generatedText]);

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlVersion);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = htmlVersion;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  }, [htmlVersion]);

  if (!mounted) {
    return (
      <section className="relative w-full min-h-[80vh] bg-gradient-to-b from-[#0a0a0a] to-[#0a0a0a]" />
    );
  }

  return (
    <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] to-[#0a0a0a] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-grid-subtle" />

      {/* Floating decorative symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOAT_SYMBOLS.map((sym, i) => (
          <motion.div
            key={`li-float-${i}`}
            className="absolute font-mono text-lg whitespace-nowrap select-none"
            style={{
              left: `${sym.x}%`,
              top: `${sym.y}%`,
              color: 'rgba(16, 185, 129, 0.08)',
            }}
            animate={{ y: [0, -12, 0], opacity: [0.05, 0.14, 0.05] }}
            transition={{
              duration: 7 + i * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: sym.delay,
            }}
          >
            {sym.text}
          </motion.div>
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-8">
        {/* ── Section Header ── */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-6">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60 font-mono">
              Placeholder Text Generator
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-text">
              Lorem Ipsum
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-mono">
            Generate placeholder text for your designs &amp; prototypes
          </p>
        </motion.div>

        {/* ── Main Container ── */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* ── Top Bar ── */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-white/30 ml-2">
                lorem-ipsum-generator
              </span>
              <div className="flex-1" />

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-white/25">
                <span>{stats.charCount} chars</span>
                <span>{stats.wordCount} words</span>
                <span>{stats.paragraphCount} paras</span>
              </div>
            </div>

            {/* ── Controls Panel ── */}
            <div className="p-4 md:p-6 border-b border-white/[0.06] space-y-5">
              {/* Text Type Tabs */}
              <div>
                <label className="block text-xs font-mono text-white/40 mb-2.5 uppercase tracking-wider">
                  Text Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TEXT_TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = textType === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        onClick={() => handleTypeChange(opt.id)}
                        className={`
                          flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-mono
                          transition-all cursor-pointer border
                          ${
                            isActive
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12]'
                          }
                        `}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        aria-label={`Select ${opt.label} mode`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Count + Options Row */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Count Control */}
                <div className="flex-1">
                  <label className="block text-xs font-mono text-white/40 mb-2.5 uppercase tracking-wider">
                    Count
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={typeConfig.min}
                      max={typeConfig.max}
                      value={count}
                      onChange={(e) =>
                        setCount(Math.max(typeConfig.min, Math.min(typeConfig.max, Number(e.target.value))))
                      }
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400
                        [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(16,185,129,0.4)]
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20
                        [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-runnable-track]:rounded-full"
                      style={{
                        background: `linear-gradient(to right, rgba(16,185,129,0.5) 0%, rgba(16,185,129,0.5) ${((count - typeConfig.min) / (typeConfig.max - typeConfig.min)) * 100}%, rgba(255,255,255,0.1) ${((count - typeConfig.min) / (typeConfig.max - typeConfig.min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                      }}
                      aria-label={`Count: ${count}`}
                    />
                    <input
                      type="number"
                      min={typeConfig.min}
                      max={typeConfig.max}
                      value={count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setCount(Math.max(typeConfig.min, Math.min(typeConfig.max, val)));
                        }
                      }}
                      className="w-16 px-2 py-1.5 text-center text-xs font-mono
                        bg-white/[0.04] border border-white/[0.08] rounded-md
                        text-emerald-300 focus:outline-none focus:border-emerald-500/40
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label={`Count number input`}
                    />
                  </div>
                  <div className="flex justify-between mt-1 px-0.5">
                    <span className="text-[10px] font-mono text-white/20">
                      {typeConfig.min}
                    </span>
                    <span className="text-[10px] font-mono text-white/20">
                      {typeConfig.max}
                    </span>
                  </div>
                </div>

                {/* Start with Lorem Ipsum Toggle */}
                <div className="flex items-center gap-2.5 sm:pb-1">
                  <motion.button
                    onClick={() => setStartWithLorem((prev) => !prev)}
                    className={`
                      relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer
                      ${startWithLorem ? 'bg-emerald-500/30 border border-emerald-500/40' : 'bg-white/10 border border-white/[0.08]'}
                    `}
                    whileTap={{ scale: 0.95 }}
                    role="switch"
                    aria-checked={startWithLorem}
                    aria-label="Start with Lorem Ipsum"
                  >
                    <motion.div
                      className="absolute top-0.5 w-3.5 h-3.5 rounded-full shadow-sm"
                      animate={{
                        left: startWithLorem ? '22px' : '2px',
                        backgroundColor: startWithLorem ? '#34d399' : 'rgba(255,255,255,0.4)',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                  <span className="text-xs font-mono text-white/50 select-none">
                    Start with &quot;Lorem ipsum…&quot;
                  </span>
                </div>
              </div>
            </div>

            {/* ── Preview Panel ── */}
            <div className="relative">
              <div className="p-4 md:p-6">
                <div className="rounded-lg bg-black/40 border border-white/[0.04] overflow-hidden">
                  {/* Preview header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
                    <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">
                      Preview
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-emerald-500/40">
                        ●
                      </span>
                      <span className="text-[10px] font-mono text-white/20">
                        Generated
                      </span>
                    </div>
                  </div>

                  {/* Text display */}
                  <div className="p-4 md:p-5 max-h-[420px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={seed}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {generatedText.split('\n\n').map((paragraph, i) => (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.3 }}
                            className="text-sm md:text-base text-white/70 leading-relaxed font-mono first:text-emerald-200/80"
                          >
                            {paragraph}
                          </motion.p>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Mobile stats bar */}
                  <div className="sm:hidden flex items-center gap-3 px-4 py-2.5 border-t border-white/[0.04] text-[10px] font-mono text-white/25">
                    <span>{stats.charCount} chars</span>
                    <span>{stats.wordCount} words</span>
                    <span>{stats.paragraphCount} paras</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Action Bar ── */}
            <div className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                {/* Regenerate */}
                <motion.button
                  onClick={handleRegenerate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                    bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                    text-xs font-mono hover:bg-emerald-500/20 hover:border-emerald-500/30
                    transition-all cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="Regenerate text"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </motion.button>

                {/* Copy Text */}
                <motion.button
                  onClick={handleCopyText}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border
                    text-xs font-mono transition-all cursor-pointer
                    ${
                      copiedText
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.15]'
                    }
                  `}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="Copy plain text"
                >
                  <AnimatePresence mode="wait">
                    {copiedText ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Copy HTML */}
                <motion.button
                  onClick={handleCopyHtml}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border
                    text-xs font-mono transition-all cursor-pointer
                    ${
                      copiedHtml
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.15]'
                    }
                  `}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="Copy as HTML"
                >
                  <AnimatePresence mode="wait">
                    {copiedHtml ? (
                      <motion.span
                        key="check-html"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy-html"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Copy as HTML</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <div className="flex-1" />

                {/* Quick count pills */}
                <div className="hidden lg:flex items-center gap-1">
                  <span className="text-[10px] font-mono text-white/20 mr-1">
                    Quick:
                  </span>
                  {[1, 3, 5, 10].map((n) => (
                    <motion.button
                      key={n}
                      onClick={() => setCount(Math.min(n, typeConfig.max))}
                      disabled={n > typeConfig.max}
                      className={`
                        px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-all
                        ${
                          count === n && n <= typeConfig.max
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'text-white/25 hover:text-white/50 border border-transparent hover:border-white/10'
                        }
                        disabled:opacity-20 disabled:cursor-not-allowed
                      `}
                      whileTap={{ scale: 0.92 }}
                      aria-label={`Set count to ${n}`}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Info Bar ── */}
          <motion.div
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 text-xs font-mono text-white/30">
              <Info className="w-3.5 h-3.5 text-emerald-500/40" />
              <span>4 Types</span>
              <ArrowRight className="w-3 h-3 text-white/15" />
              <span>Custom Count</span>
              <ArrowRight className="w-3 h-3 text-white/15" />
              <span>Copy as Text &amp; HTML</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
