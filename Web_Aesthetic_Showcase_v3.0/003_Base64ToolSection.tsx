// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 762

'use client';

import { useState, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Lock,
  ArrowLeftRight,
  Trash2,
  Download,
  Upload,
  FileText,
  Type,
  Braces,
  Code2,
  ArrowRight,
  Sparkles,
  Zap,
  FileUp,
  Binary,
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
type EncodingMode =
  | 'base64-encode'
  | 'base64-decode'
  | 'url-encode'
  | 'url-decode'
  | 'html-encode'
  | 'html-decode'
  | 'base64url-encode';

interface ModeOption {
  id: EncodingMode;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  value: string;
  icon: React.ElementType;
}

interface DetectionResult {
  type: string;
  confidence: number;
}

/* ──────────────────────────────────────────────
   ENCODING MODES
   ────────────────────────────────────────────── */
const MODES: ModeOption[] = [
  { id: 'base64-encode', label: 'Base64 Encode', shortLabel: 'B64→', icon: Binary },
  { id: 'base64-decode', label: 'Base64 Decode', shortLabel: '→B64', icon: FileText },
  { id: 'url-encode', label: 'URL Encode', shortLabel: '%→', icon: Type },
  { id: 'url-decode', label: 'URL Decode', shortLabel: '→%', icon: Code2 },
  { id: 'html-encode', label: 'HTML Entity Encode', shortLabel: '&→', icon: Braces },
  { id: 'html-decode', label: 'HTML Entity Decode', shortLabel: '→&', icon: Sparkles },
  { id: 'base64url-encode', label: 'Base64 URL-Safe', shortLabel: 'B64U', icon: Zap },
];

/* ──────────────────────────────────────────────
   PRESETS
   ────────────────────────────────────────────── */
const PRESETS: Preset[] = [
  {
    id: 'hello',
    name: 'Hello World!',
    description: 'Simple text string',
    value: 'Hello World!',
    icon: Type,
  },
  {
    id: 'json',
    name: 'JSON Object',
    description: 'Structured data',
    value: '{"name":"Alice","age":30,"active":true}',
    icon: Braces,
  },
  {
    id: 'url',
    name: 'URL String',
    description: 'Web address with query',
    value: 'https://example.com/path?key=value&foo=bar&x=1 2 3',
    icon: Code2,
  },
  {
    id: 'html',
    name: 'HTML Snippet',
    description: 'HTML markup tags',
    value: '<div class="app"><h1>Hello</h1><p>Text & more</p></div>',
    icon: FileText,
  },
];

/* ──────────────────────────────────────────────
   FLOATING DECORATIVE SYMBOLS
   ────────────────────────────────────────────── */
const FLOAT_SYMBOLS = [
  { text: 'A=', x: 5, y: 10, delay: 0 },
  { text: '%20', x: 85, y: 15, delay: 1.2 },
  { text: '&amp;', x: 10, y: 75, delay: 0.6 },
  { text: 'SGVsbG8=', x: 90, y: 80, delay: 2.0 },
  { text: '+/→-_', x: 78, y: 45, delay: 1.6 },
  { text: '&#60;', x: 3, y: 50, delay: 2.4 },
];

/* ──────────────────────────────────────────────
   ENCODING / DECODING FUNCTIONS
   ────────────────────────────────────────────── */
function tryEncode(input: string, mode: EncodingMode): string {
  try {
    switch (mode) {
      case 'base64-encode':
        return btoa(unescape(encodeURIComponent(input)));
      case 'base64-decode':
        return decodeURIComponent(escape(atob(input.trim())));
      case 'url-encode':
        return encodeURIComponent(input);
      case 'url-decode':
        return decodeURIComponent(input);
      case 'html-encode':
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      case 'html-decode': {
        const el = document.createElement('textarea');
        el.innerHTML = input;
        return el.value;
      }
      case 'base64url-encode': {
        const b64 = btoa(unescape(encodeURIComponent(input)));
        return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      default:
        return input;
    }
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

function detectEncoding(input: string): DetectionResult {
  if (!input) return { type: 'none', confidence: 0 };

  // Check Base64
  const b64Regex = /^[A-Za-z0-9+/]+=*$/;
  if (b64Regex.test(input.trim()) && input.trim().length % 4 === 0 && input.trim().length > 3) {
    try {
      atob(input.trim());
      return { type: 'Base64', confidence: 0.95 };
    } catch {
      // not valid base64
    }
  }

  // Check Base64 URL-safe
  const b64UrlRegex = /^[A-Za-z0-9_-]+$/;
  if (b64UrlRegex.test(input.trim()) && input.trim().length > 3 && !input.includes('+') && !input.includes('/')) {
    try {
      const padded = input.trim().replace(/-/g, '+').replace(/_/g, '/');
      atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
      return { type: 'Base64 URL-safe', confidence: 0.85 };
    } catch {
      // not valid
    }
  }

  // Check URL-encoded
  if (/%[0-9A-Fa-f]{2}/.test(input)) {
    try {
      decodeURIComponent(input);
      return { type: 'URL-encoded', confidence: 0.9 };
    } catch {
      // not valid
    }
  }

  // Check HTML entities
  if (/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9A-Fa-f]+);/.test(input)) {
    return { type: 'HTML Entities', confidence: 0.85 };
  }

  return { type: 'Plain Text', confidence: 0.7 };
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export function Base64ToolSection() {
  const mounted = useIsMounted();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── State ───
  const [mode, setMode] = useState<EncodingMode>('base64-encode');
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // ─── Real-time conversion ───
  const conversionResult = useMemo(() => {
    if (!inputText) return { output: '', error: null };
    try {
      const result = tryEncode(inputText, mode);
      if (result.startsWith('Error:')) {
        return { output: '', error: result };
      }
      return { output: result, error: null };
    } catch (e) {
      return { output: '', error: (e as Error).message };
    }
  }, [inputText, mode]);

  const outputText = conversionResult.output;
  const error = conversionResult.error;

  // ─── Detection ───
  const detection = useMemo(() => detectEncoding(inputText), [inputText]);

  // ─── Statistics ───
  const stats = useMemo(() => {
    const inputLen = new TextEncoder().encode(inputText).length;
    const outputLen = new TextEncoder().encode(outputText).length;
    let diff = 0;
    let ratio = '';
    if (inputLen > 0 && outputLen > 0) {
      diff = outputLen - inputLen;
      const pct = ((outputLen / inputLen) * 100).toFixed(1);
      ratio = `${pct}%`;
    }
    return { inputLen, outputLen, diff, ratio };
  }, [inputText, outputText]);

  // ─── Handlers ───
  const copyOutput = useCallback(async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = outputText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [outputText]);

  const downloadOutput = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encoded-${mode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [outputText, mode]);

  const swapOutput = useCallback(() => {
    if (!outputText) return;
    // Auto-detect what mode would reverse the current operation
    const reverseMap: Record<EncodingMode, EncodingMode> = {
      'base64-encode': 'base64-decode',
      'base64-decode': 'base64-encode',
      'url-encode': 'url-decode',
      'url-decode': 'url-encode',
      'html-encode': 'html-decode',
      'html-decode': 'html-encode',
      'base64url-encode': 'base64-decode',
    };
    setMode(reverseMap[mode]);
    setInputText(outputText);
  }, [outputText, mode]);

  const clearAll = useCallback(() => {
    setInputText('');
    setActivePresetId(null);
  }, []);

  const loadPreset = useCallback((preset: Preset) => {
    setInputText(preset.value);
    setActivePresetId(preset.id);
    setShowPresets(false);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text !== undefined) {
        setInputText(text);
        setActivePresetId(null);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFileUpload],
  );

  // ─── Current mode info ───
  const currentMode = MODES.find((m) => m.id === mode);

  if (!mounted) {
    return (
      <section className="relative w-full min-h-[80vh] bg-gradient-to-b from-[#0a0a0a] to-[#0a1014]" />
    );
  }

  return (
    <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] to-[#0a1014] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-grid-subtle" />

      {/* Floating decorative symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOAT_SYMBOLS.map((sym, i) => (
          <motion.div
            key={`b64-float-${i}`}
            className="absolute font-mono text-sm whitespace-nowrap select-none"
            style={{
              left: `${sym.x}%`,
              top: `${sym.y}%`,
              color: 'rgba(20, 184, 166, 0.08)',
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
            <Lock className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-white/60 font-mono">Dev Tool</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-text">
              Encoder Lab
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-mono">
            Encode, decode, and transform text across multiple formats in real-time
          </p>
        </motion.div>

        {/* Mode selector */}
        <motion.div
          className="max-w-7xl mx-auto mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {MODES.map((m) => {
              const isActive = mode === m.id;
              const ModeIcon = m.icon;
              return (
                <motion.button
                  key={m.id}
                  onClick={() => { setMode(m.id); }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-500/15 border-teal-500/30 text-teal-300 shadow-lg shadow-teal-500/10'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={m.label}
                >
                  <ModeIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{m.label}</span>
                  <span className="sm:hidden">{m.shortLabel}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Detection badge */}
        <AnimatePresence>
          {inputText.length > 0 && detection.type !== 'Plain Text' && detection.type !== 'none' && (
            <motion.div
              className="max-w-7xl mx-auto mb-4 flex justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
                <Sparkles className="w-3 h-3" />
                Detected: <span className="font-bold">{detection.type}</span>
                <span className="text-cyan-400/60">({Math.round(detection.confidence * 100)}%)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-panel layout: Input + Output */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── LEFT PANEL: Input ─── */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Input Card */}
            <div
              className={`rounded-xl border bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-colors ${
                isDragOver ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/[0.08]'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* VS Code-style chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-white/30 ml-2">input</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono text-white/20">{inputText.length} chars · {stats.inputLen} B</span>
              </div>

              {/* Textarea */}
              <div className="px-4 py-3">
                <textarea
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); setActivePresetId(null); }}
                  className="w-full h-48 sm:h-56 bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-teal-500/40 text-white font-mono text-sm p-3 outline-none resize-none placeholder:text-white/20 custom-scrollbar transition-colors"
                  placeholder="Type or paste text here..."
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Input text"
                />
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

              {/* Drop zone overlay hint */}
              {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-teal-500/10 backdrop-blur-sm rounded-xl z-20">
                  <div className="text-center">
                    <FileUp className="w-10 h-10 text-teal-400 mx-auto mb-2" />
                    <p className="text-sm font-mono text-teal-300">Drop file here</p>
                  </div>
                </div>
              )}
            </div>

            {/* File upload button */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              aria-label="Upload file"
            />
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono text-white/50 border border-white/[0.06] bg-white/[0.02] hover:text-teal-400 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Upload file"
            >
              <Upload className="w-4 h-4" />
              Upload File (or drag &amp; drop)
            </motion.button>

            {/* Presets */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowPresets((prev) => !prev)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono text-white/70 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="w-4 h-4 text-teal-400" />
                Sample Data ({PRESETS.length})
              </motion.button>
              <motion.button
                onClick={clearAll}
                className="px-4 py-2.5 rounded-xl text-sm font-mono text-white/50 border border-white/[0.06] bg-white/[0.02] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Clear all"
              >
                <Trash2 className="w-4 h-4" />
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
                              ? 'bg-teal-500/10 border-teal-500/30'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                          }`}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <PresetIcon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-white/40'}`} />
                          <span className={`text-xs font-mono ${isActive ? 'text-teal-300' : 'text-white/50'}`}>
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-mono text-white/20">{preset.description}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ─── RIGHT PANEL: Output ─── */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Output Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden flex-1">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-white/30 ml-2">output</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono text-white/20">{outputText.length} chars · {stats.outputLen} B</span>
              </div>

              {/* Output area */}
              <div className="px-4 py-3">
                <div
                  className="w-full min-h-[200px] sm:min-h-[230px] bg-black/30 rounded-lg border border-white/[0.06] p-3 font-mono text-sm text-teal-200/90 whitespace-pre-wrap break-all custom-scrollbar max-h-[340px] overflow-y-auto"
                  role="region"
                  aria-label="Output result"
                >
                  {outputText ? (
                    outputText
                  ) : inputText ? (
                    <span className="text-white/20 italic">Error in conversion...</span>
                  ) : (
                    <span className="text-white/20 italic">Output will appear here...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons row */}
            <div className="flex gap-3">
              <motion.button
                onClick={copyOutput}
                disabled={!outputText}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono text-white/70 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: outputText ? 1.02 : 1 }}
                whileTap={{ scale: outputText ? 0.98 : 1 }}
                aria-label="Copy output"
              >
                {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Output'}
              </motion.button>

              <motion.button
                onClick={downloadOutput}
                disabled={!outputText}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono text-white/70 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: outputText ? 1.02 : 1 }}
                whileTap={{ scale: outputText ? 0.98 : 1 }}
                aria-label="Download output as file"
              >
                <Download className="w-4 h-4" />
                Download File
              </motion.button>
            </div>

            {/* Swap button */}
            <motion.button
              onClick={swapOutput}
              disabled={!outputText}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono text-white/70 border border-white/[0.08] bg-white/[0.03] hover:bg-teal-500/5 hover:border-teal-500/30 hover:text-teal-300 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: outputText ? 1.02 : 1 }}
              whileTap={{ scale: outputText ? 0.98 : 1 }}
              aria-label="Swap output to input"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Swap Output → Input
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </motion.button>

            {/* Statistics */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-4 py-3 text-center">
                <div className="text-2xl font-bold font-mono text-teal-400">{stats.inputLen}</div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-1">Input B</div>
              </div>
              <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-4 py-3 text-center">
                <div className="text-2xl font-bold font-mono text-cyan-400">{stats.outputLen}</div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-1">Output B</div>
              </div>
              <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-4 py-3 text-center">
                <div className={`text-2xl font-bold font-mono ${stats.diff > 0 ? 'text-amber-400' : stats.diff < 0 ? 'text-emerald-400' : 'text-white/50'}`}>
                  {stats.diff > 0 ? '+' : ''}{stats.diff}
                </div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-1">Diff</div>
              </div>
              <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-4 py-3 text-center">
                <div className="text-lg font-bold font-mono text-purple-400">{stats.ratio || '—'}</div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-1">Ratio</div>
              </div>
            </div>

            {/* Encoding type badge */}
            <div className="flex justify-center">
              {currentMode && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                  <currentMode.icon className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-xs font-mono text-teal-300">{currentMode.label}</span>
                </div>
              )}
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
            { icon: Type, text: '7 Encoding Modes' },
            { icon: Zap, text: 'Real-time Conversion' },
            { icon: Copy, text: 'Copy & Download' },
            { icon: Upload, text: 'File Upload' },
            { icon: Sparkles, text: 'Auto-Detect Encoding' },
            { icon: Braces, text: `${PRESETS.length} Sample Data` },
          ].map((info, i) => (
            <div key={`b64-info-${i}`} className="flex items-center gap-1.5">
              <info.icon className="w-3.5 h-3.5" />
              <span>{info.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
