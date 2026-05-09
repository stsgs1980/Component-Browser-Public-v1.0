/**
 * Base64Tool — Reusable encoder/decoder component.
 *
 * Supports Base64, URL, HTML Entity, and Base64 URL-safe
 * encoding/decoding with real-time conversion, auto-detection,
 * file upload, drag-and-drop, presets, and statistics.
 *
 * @module 012_Base64Tool
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useIsMounted, copyToClipboard, downloadFile, IconCopy, IconCheck, IconDownload, type GeneratorTheme, DEFAULT_THEME } from './shared';

// ─── Types ────────────────────────────────────────────────────

/** Supported encoding/decoding modes. */
export type EncodingMode =
  | 'base64-encode'
  | 'base64-decode'
  | 'url-encode'
  | 'url-decode'
  | 'html-encode'
  | 'html-decode'
  | 'base64url-encode';

/** An encoding mode option shown in the mode selector. */
export interface ModeOption {
  /** Unique mode identifier. */
  id: EncodingMode;
  /** Full label. */
  label: string;
  /** Short label for mobile. */
  shortLabel: string;
}

/** A sample-data preset. */
export interface Base64Preset {
  /** Unique preset id. */
  id: string;
  /** Display name. */
  name: string;
  /** Description. */
  description: string;
  /** The text value loaded when the preset is selected. */
  value: string;
}

/** Result of auto-detecting the encoding of pasted input. */
export interface DetectionResult {
  type: string;
  confidence: number;
}

/** Props for the Base64Tool component. */
export interface Base64ToolProps {
  /** Available encoding modes (defaults to all 7 built-in modes). */
  modes?: ModeOption[];
  /** Preset text samples. */
  presets?: Base64Preset[];
  /** Theme customisation (uses DEFAULT_THEME if omitted). */
  theme?: GeneratorTheme;
  /** Additional CSS class names on the root element. */
  className?: string;
}

// ─── Default Data ─────────────────────────────────────────────

const DEFAULT_MODES: ModeOption[] = [
  { id: 'base64-encode',  label: 'Base64 Encode',   shortLabel: 'B64→' },
  { id: 'base64-decode',  label: 'Base64 Decode',   shortLabel: '→B64' },
  { id: 'url-encode',     label: 'URL Encode',       shortLabel: '%→'   },
  { id: 'url-decode',     label: 'URL Decode',       shortLabel: '→%'   },
  { id: 'html-encode',    label: 'HTML Entity Encode', shortLabel: '&→' },
  { id: 'html-decode',    label: 'HTML Entity Decode', shortLabel: '→&' },
  { id: 'base64url-encode', label: 'Base64 URL-Safe', shortLabel: 'B64U' },
];

const DEFAULT_PRESETS: Base64Preset[] = [
  { id: 'hello', name: 'Hello World!', description: 'Simple text string', value: 'Hello World!' },
  { id: 'json',  name: 'JSON Object',  description: 'Structured data',   value: '{"name":"Alice","age":30,"active":true}' },
  { id: 'url',   name: 'URL String',   description: 'Web address',       value: 'https://example.com/path?key=value&foo=bar&x=1 2 3' },
  { id: 'html',  name: 'HTML Snippet', description: 'HTML markup tags',  value: '<div class="app"><h1>Hello</h1><p>Text & more</p></div>' },
];

// ─── Encoding / Decoding Engine ───────────────────────────────

function tryEncode(input: string, mode: EncodingMode): string {
  try {
    switch (mode) {
      case 'base64-encode': return btoa(unescape(encodeURIComponent(input)));
      case 'base64-decode': return decodeURIComponent(escape(atob(input.trim())));
      case 'url-encode':    return encodeURIComponent(input);
      case 'url-decode':    return decodeURIComponent(input);
      case 'html-encode':   return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      case 'html-decode':   { const el = document.createElement('textarea'); el.innerHTML = input; return el.value; }
      case 'base64url-encode': { const b64 = btoa(unescape(encodeURIComponent(input))); return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
      default: return input;
    }
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

function detectEncoding(input: string): DetectionResult {
  if (!input) return { type: 'none', confidence: 0 };
  const trimmed = input.trim();
  const b64Regex = /^[A-Za-z0-9+/]+=*$/;
  if (b64Regex.test(trimmed) && trimmed.length % 4 === 0 && trimmed.length > 3) {
    try { atob(trimmed); return { type: 'Base64', confidence: 0.95 }; } catch { /* not base64 */ }
  }
  if (/^[A-Za-z0-9_-]+$/.test(trimmed) && trimmed.length > 3 && !input.includes('+') && !input.includes('/')) {
    try {
      const padded = trimmed.replace(/-/g, '+').replace(/_/g, '/');
      atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
      return { type: 'Base64 URL-safe', confidence: 0.85 };
    } catch { /* not valid */ }
  }
  if (/%[0-9A-Fa-f]{2}/.test(input)) {
    try { decodeURIComponent(input); return { type: 'URL-encoded', confidence: 0.9 }; } catch { /* not valid */ }
  }
  if (/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9A-Fa-f]+);/.test(input)) return { type: 'HTML Entities', confidence: 0.85 };
  return { type: 'Plain Text', confidence: 0.7 };
}

// ─── Inline SVG Icons ─────────────────────────────────────────

function IconLock({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconArrowLeftRight({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 3 4 7l4 4" /><path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" /><path d="M20 17H4" />
    </svg>
  );
}

function IconTrash2({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconUpload({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconFileUp({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" /><line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9,15 12,12 15,15" />
    </svg>
  );
}

function IconArrowRight({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconSparkles({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
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

function IconBinary({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
      <path d="M3 17l6-6 6 6" /><path d="M21 17l-6-6-6 6" />
    </svg>
  );
}

// ─── CSS for floating symbols ─────────────────────────────────

const floatKeyframes = `
@keyframes b64-float {
  0%, 100% { transform: translateY(0); opacity: 0.05; }
  50% { transform: translateY(-10px); opacity: 0.12; }
}
`;

function FloatingSymbol({ text, x, y, delay }: { text: string; x: number; y: number; delay: number }) {
  return (
    <span
      className="absolute font-mono text-sm whitespace-nowrap select-none pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        color: 'rgba(180, 128, 23, 0.12)',
        animation: `b64-float ${7 + delay * 0.9}s ease-in-out ${delay}s infinite`,
      }}
    >
      {text}
    </span>
  );
}

// ─── Reverse mode map ─────────────────────────────────────────

const REVERSE_MAP: Record<EncodingMode, EncodingMode> = {
  'base64-encode': 'base64-decode',
  'base64-decode': 'base64-encode',
  'url-encode': 'url-decode',
  'url-decode': 'url-encode',
  'html-encode': 'html-decode',
  'html-decode': 'html-encode',
  'base64url-encode': 'base64-decode',
};

// ─── Component ────────────────────────────────────────────────

/**
 * Base64Tool — multi-format encoder/decoder.
 *
 * Renders a two-panel layout (input → output) with mode selector,
 * auto-detection, file upload, presets, copy/download/swap actions,
 * and byte-level statistics.
 *
 * @example
 * ```tsx
 * <Base64Tool theme={{ accent: '#e04040' }} />
 * ```
 */
export function Base64Tool({ modes, presets, theme = DEFAULT_THEME, className }: Base64ToolProps) {
  const mounted = useIsMounted();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeModes = modes ?? DEFAULT_MODES;
  const activePresets = presets ?? DEFAULT_PRESETS;

  const [mode, setMode] = useState<EncodingMode>('base64-encode');
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Real-time conversion
  const { outputText, error } = useMemo(() => {
    if (!inputText) return { outputText: '', error: null };
    try {
      const result = tryEncode(inputText, mode);
      if (result.startsWith('Error:')) return { outputText: '', error: result };
      return { outputText: result, error: null };
    } catch (e) {
      return { outputText: '', error: (e as Error).message };
    }
  }, [inputText, mode]);

  // Detection
  const detection = useMemo(() => detectEncoding(inputText), [inputText]);

  // Stats
  const stats = useMemo(() => {
    const inputLen = new TextEncoder().encode(inputText).length;
    const outputLen = new TextEncoder().encode(outputText).length;
    let diff = 0;
    let ratio = '';
    if (inputLen > 0 && outputLen > 0) {
      diff = outputLen - inputLen;
      ratio = `${((outputLen / inputLen) * 100).toFixed(1)}%`;
    }
    return { inputLen, outputLen, diff, ratio };
  }, [inputText, outputText]);

  // Handlers
  const copyOutput = useCallback(async () => {
    if (!outputText) return;
    const ok = await copyToClipboard(outputText);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [outputText]);

  const downloadOutput = useCallback(() => {
    if (!outputText) return;
    downloadFile(outputText, `encoded-${mode}-${Date.now()}.txt`);
  }, [outputText, mode]);

  const swapOutput = useCallback(() => {
    if (!outputText) return;
    setMode(REVERSE_MAP[mode]);
    setInputText(outputText);
  }, [outputText, mode]);

  const clearAll = useCallback(() => { setInputText(''); setActivePresetId(null); }, []);

  const loadPreset = useCallback((p: Base64Preset) => {
    setInputText(p.value); setActivePresetId(p.id); setShowPresets(false);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { const t = e.target?.result as string; if (t !== undefined) { setInputText(t); setActivePresetId(null); } };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }, [handleFileUpload]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) handleFileUpload(f); if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleFileUpload]);

  const currentMode = activeModes.find((m) => m.id === mode);

  if (!mounted) return <div className={className} />;

  return (
    <div className={`relative w-full py-20 md:py-28 bg-[#f5f0e1] overflow-hidden ${className ?? ''}`}>
      <style>{floatKeyframes}</style>

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { text: 'A=', x: 5, y: 10, delay: 0 },
          { text: '%20', x: 85, y: 15, delay: 1.2 },
          { text: '&amp;', x: 10, y: 75, delay: 0.6 },
          { text: 'SGVsbG8=', x: 90, y: 80, delay: 2.0 },
          { text: '+/→-_', x: 78, y: 45, delay: 1.6 },
          { text: '&#60;', x: 3, y: 50, delay: 2.4 },
        ].map((s, i) => <FloatingSymbol key={`fs-${i}`} {...s} />)}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(180,128,23,0.08) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16" style={{ opacity: 1, transform: 'none', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border bg-[#ebe5d0] mb-6" style={{ borderColor: theme.border }}>
            <IconLock className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-sm font-mono" style={{ color: theme.textMuted }}>Dev Tool</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-clip-text text-transparent bg-[length:200%_100%]">Encoder Lab</span>
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto font-mono" style={{ color: theme.textMuted }}>
            Encode, decode, and transform text across multiple formats in real-time
          </p>
        </div>

        {/* Mode selector */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {activeModes.map((m) => {
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'shadow-lg'
                      : 'hover:bg-white/[0.04]'
                  }`}
                  style={{
                    background: isActive ? `${theme.accent}15` : 'rgba(255,255,255,0.02)',
                    borderColor: isActive ? `${theme.accent}30` : 'rgba(255,255,255,0.06)',
                    color: isActive ? theme.accentSecondary : theme.textMuted,
                    boxShadow: isActive ? `0 10px 15px -3px ${theme.accent}1a` : undefined,
                  }}
                >
                  <span className="hidden sm:inline">{m.label}</span>
                  <span className="sm:hidden">{m.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detection badge */}
        {inputText.length > 0 && detection.type !== 'Plain Text' && detection.type !== 'none' && (
          <div className="max-w-7xl mx-auto mb-4 flex justify-center" style={{ transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono" style={{ background: `${theme.accentSecondary}10`, border: `1px solid ${theme.accentSecondary}20`, color: theme.accentSecondary }}>
              <IconSparkles className="w-3 h-3" />
              Detected: <span className="font-bold">{detection.type}</span>
              <span style={{ opacity: 0.6 }}>({Math.round(detection.confidence * 100)}%)</span>
            </div>
          </div>
        )}

        {/* Two-panel layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Input */}
          <div className="flex flex-col gap-4" style={{ transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            {/* Input card */}
            <div
              className={`rounded-xl border overflow-hidden transition-colors ${isDragOver ? '' : ''}`}
              style={{
                borderColor: isDragOver ? `${theme.accent}50` : 'rgba(255,255,255,0.08)',
                background: isDragOver ? `${theme.accent}05` : 'rgba(255,255,255,0.02)',
              }}
              onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            >
              {/* VS Code chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
                <span className="text-xs font-mono ml-2" style={{ color: theme.textMuted }}>input</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{inputText.length} chars · {stats.inputLen} B</span>
              </div>

              <div className="px-4 py-3">
                <textarea
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); setActivePresetId(null); }}
                  className="w-full h-48 sm:h-56 bg-black/30 rounded-lg border border-white/[0.06] focus-within:border-[#d4a017]/40 text-white font-mono text-sm p-3 outline-none resize-none placeholder:text-[#6b6356] transition-colors"
                  placeholder="Type or paste text here..." spellCheck={false} autoComplete="off" aria-label="Input text"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mx-4 mb-3 px-3 py-2 rounded-lg" style={{ background: `${theme.danger}10`, border: `1px solid ${theme.danger}20` }}>
                  <p className="text-xs font-mono" style={{ color: theme.danger }}>{error}</p>
                </div>
              )}

              {/* Drop overlay */}
              {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl z-20" style={{ background: `${theme.accent}10` }}>
                  <div className="text-center"><IconFileUp className="w-10 h-10 mx-auto mb-2" style={{ color: theme.accent }} /><p className="text-sm font-mono" style={{ color: theme.accentSecondary }}>Drop file here</p></div>
                </div>
              )}
            </div>

            {/* File upload */}
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInputChange} aria-label="Upload file" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer"
              style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.06)' }}
              aria-label="Upload file"
            >
              <IconUpload className="w-4 h-4" />Upload File (or drag &amp; drop)
            </button>

            {/* Presets toggle + clear */}
            <div className="flex gap-3">
              <button onClick={() => setShowPresets((p) => !p)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
                <IconZap className="w-4 h-4" style={{ color: theme.accent }} />Sample Data ({activePresets.length})
              </button>
              <button onClick={clearAll} className="px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.02] transition-all cursor-pointer hover:bg-white/[0.04]" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.06)' }} aria-label="Clear all">
                <IconTrash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Presets grid */}
            {showPresets && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1" style={{ transition: 'opacity 0.3s ease' }}>
                {activePresets.map((preset) => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <button key={`preset-${preset.id}`} onClick={() => loadPreset(preset)} className="flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer hover:bg-white/[0.04]" style={{ background: isActive ? `${theme.accent}10` : 'rgba(255,255,255,0.02)', borderColor: isActive ? `${theme.accent}30` : 'rgba(255,255,255,0.06)' }}>
                      <span className="text-xs font-mono" style={{ color: isActive ? theme.accentSecondary : '#1a1a1a' }}>{preset.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{preset.description}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Output */}
          <div className="flex flex-col gap-4" style={{ transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s' }}>
            {/* Output card */}
            <div className="border bg-[#ebe5d0] overflow-hidden flex-1" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#ebe5d0]" style={{ borderColor: theme.border }}>
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
                <span className="text-xs font-mono ml-2" style={{ color: theme.textMuted }}>output</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{outputText.length} chars · {stats.outputLen} B</span>
              </div>
              <div className="px-4 py-3">
                <div className="w-full min-h-[200px] sm:min-h-[230px] bg-black/30 rounded-lg border border-white/[0.06] p-3 font-mono text-sm text-[#1a1a1a] whitespace-pre-wrap break-all max-h-[340px] overflow-y-auto" role="region" aria-label="Output result">
                  {outputText ? outputText : inputText ? <span style={{ color: theme.textMuted }} className="italic">Error in conversion...</span> : <span style={{ color: theme.textMuted }} className="italic">Output will appear here...</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={copyOutput} disabled={!outputText} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
                {copied ? <IconCheck className="w-4 h-4" style={{ color: theme.accent }} /> : <IconCopy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Output'}
              </button>
              <button onClick={downloadOutput} disabled={!outputText} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
                <IconDownload className="w-4 h-4" />Download File
              </button>
            </div>

            {/* Swap */}
            <button onClick={swapOutput} disabled={!outputText} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono border bg-white/[0.03] hover:bg-white/[0.04] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: '#1a1a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
              <IconArrowLeftRight className="w-4 h-4" />Swap Output → Input<IconArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* Stats */}
            <div className="flex gap-3">
              {[
                { label: 'Input B', value: String(stats.inputLen), accent: true },
                { label: 'Output B', value: String(stats.outputLen), accent: false },
                { label: 'Diff', value: `${stats.diff > 0 ? '+' : ''}${stats.diff}`, accent: stats.diff !== 0 },
                { label: 'Ratio', value: stats.ratio || '—', accent: false, small: true },
              ].map((s) => (
                <div key={s.label} className="flex-1 border bg-[#ebe5d0] px-4 py-3 text-center" style={{ borderColor: theme.border }}>
                  <div className={`font-bold font-mono ${s.small ? 'text-lg' : 'text-2xl'}`} style={{ color: s.accent ? theme.accent : theme.textMuted }}>{s.value}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: theme.textMuted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Current mode badge */}
            {currentMode && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03]" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xs font-mono" style={{ color: theme.accentSecondary }}>{currentMode.label}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info bar */}
        <div className="max-w-7xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono" style={{ color: theme.textMuted }}>
          {[
            { text: `${activeModes.length} Encoding Modes` },
            { text: 'Real-time Conversion' },
            { text: 'Copy & Download' },
            { text: 'File Upload' },
            { text: 'Auto-Detect Encoding' },
            { text: `${activePresets.length} Sample Data` },
          ].map((info, i) => (
            <div key={`info-${i}`} className="flex items-center gap-1.5"><span>{info.text}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Base64Tool;
