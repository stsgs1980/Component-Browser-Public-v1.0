// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 420

'use client'

import { useState, useEffect, useRef } from 'react'
import { Palette, X, RotateCcw, Copy, Check } from 'lucide-react'

/* ----------------------------------------------------------------------
   STYLE PLAYGROUND
   Interactive panel for customizing style tokens in real-time.
   Users can adjust accent color, border radius, font size, and spacing.
   Floating trigger button + modal overlay with Code Art aesthetic.
   ---------------------------------------------------------------------- */

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

type PlaygroundStyleKey = 'retro' | 'brutalist' | 'cli' | 'scifi' | 'codeart' | 'modern'

interface StyleDefaults {
  accent: string
  bg: string
  text: string
  borderRadius: string
  fontSize: string
  spacing: string
  borderWidth: string
  shadowIntensity: string
}

const STYLE_DEFAULTS: Record<PlaygroundStyleKey, StyleDefaults> = {
  retro: { accent: '#f0c020', bg: '#0a0800', text: '#f0c020', borderRadius: '2px', fontSize: '0.8125rem', spacing: '1rem', borderWidth: '1px', shadowIntensity: '0.5' },
  brutalist: { accent: '#111111', bg: '#ffffff', text: '#000000', borderRadius: '0px', fontSize: '0.875rem', spacing: '1.25rem', borderWidth: '3px', shadowIntensity: '0' },
  cli: { accent: '#89b4fa', bg: '#1e1e2e', text: '#cdd6f4', borderRadius: '4px', fontSize: '0.8125rem', spacing: '0.75rem', borderWidth: '1px', shadowIntensity: '0.2' },
  scifi: { accent: '#00f0ff', bg: '#0a0e1a', text: '#00f0ff', borderRadius: '6px', fontSize: '0.8125rem', spacing: '1rem', borderWidth: '1px', shadowIntensity: '0.8' },
  codeart: { accent: '#c792ea', bg: '#0c0c14', text: '#c3cee3', borderRadius: '8px', fontSize: '0.8125rem', spacing: '1rem', borderWidth: '1px', shadowIntensity: '0.3' },
  modern: { accent: '#525252', bg: '#fafafa', text: '#171717', borderRadius: '12px', fontSize: '0.875rem', spacing: '1.25rem', borderWidth: '1px', shadowIntensity: '0.1' },
}

/* --- Slider control (extracted to module scope to avoid static-components error) --- */
function SliderControl({ label, value, onChange, min, max, step, unit, accent }: {
  label: string; value: string; onChange: (v: string) => void; min: number; max: number; step: number; unit: string; accent: string
}) {
  const numVal = parseFloat(value)
  return (
    <div className="py-2.5" style={{ borderBottom: '1px solid rgba(199,146,234,0.04)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ ...mono, fontSize: '0.6875rem', fontWeight: 600, color: '#c3cee3', letterSpacing: '0.04em' }}>{label}</span>
        <span style={{ ...mono, fontSize: '0.625rem', color: '#c792ea', letterSpacing: '0.02em' }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numVal}
        onChange={(e) => onChange(`${parseFloat(e.target.value)}${unit}`)}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accent} ${(numVal - min) / (max - min) * 100}%, rgba(255,255,255,0.06) ${(numVal - min) / (max - min) * 100}%)`,
          accentColor: accent,
        }}
      />
    </div>
  )
}

/* --- Color input (extracted to module scope to avoid static-components error) --- */
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(199,146,234,0.04)' }}>
      <span className="flex-1" style={{ ...mono, fontSize: '0.6875rem', fontWeight: 600, color: '#c3cee3', letterSpacing: '0.04em' }}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith('#') ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
        />
        <span style={{ ...mono, fontSize: '0.5625rem', color: '#676e95' }}>{value}</span>
      </div>
    </div>
  )
}

interface StylePlaygroundProps {
  activeStyle: PlaygroundStyleKey
}

export default function StylePlayground({ activeStyle }: StylePlaygroundProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [overrides, setOverrides] = useState<Partial<StyleDefaults>>({})
  const [copied, setCopied] = useState(false)
  const [prevStyle, setPrevStyle] = useState(activeStyle)
  const overlayRef = useRef<HTMLDivElement>(null)

  const defaults = STYLE_DEFAULTS[activeStyle]

  /* Reset overrides when style changes -- use ref comparison instead of effect */
  if (prevStyle !== activeStyle) {
    setPrevStyle(activeStyle)
    setOverrides({})
  }

  /* --- External trigger --- */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('zai-open-playground', handleOpen)
    return () => window.removeEventListener('zai-open-playground', handleOpen)
  }, [])

  /* --- ESC to close --- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) setIsOpen(false)
  }

  function handleReset() {
    setOverrides({})
  }

  async function handleCopyCSS() {
    const accent = overrides.accent ?? defaults.accent
    const bg = overrides.bg ?? defaults.bg
    const text = overrides.text ?? defaults.text
    const radius = overrides.borderRadius ?? defaults.borderRadius
    const fontSize = overrides.fontSize ?? defaults.fontSize
    const spacing = overrides.spacing ?? defaults.spacing
    const borderWidth = overrides.borderWidth ?? defaults.borderWidth
    const shadowIntensity = overrides.shadowIntensity ?? defaults.shadowIntensity

    const css = `:root {
  --color-accent: ${accent};
  --color-background: ${bg};
  --color-text: ${text};
  --border-radius: ${radius};
  --font-size: ${fontSize};
  --spacing: ${spacing};
  --border-width: ${borderWidth};
  --shadow-intensity: ${shadowIntensity};
}`

    try {
      await navigator.clipboard.writeText(css)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  /* Current values (override or default) */
  const accent = overrides.accent ?? defaults.accent
  const bg = overrides.bg ?? defaults.bg
  const text = overrides.text ?? defaults.text
  const radius = overrides.borderRadius ?? defaults.borderRadius
  const fontSize = overrides.fontSize ?? defaults.fontSize
  const spacing = overrides.spacing ?? defaults.spacing
  const borderWidth = overrides.borderWidth ?? defaults.borderWidth
  const shadowIntensity = overrides.shadowIntensity ?? defaults.shadowIntensity

  const hasChanges = Object.keys(overrides).length > 0

  return (
    <>
      {/* --- Floating Trigger Button --- */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-80px)',
          width: '40px',
          height: '40px',
          background: 'rgba(12,12,20,0.9)',
          border: '1px solid rgba(199,146,234,0.25)',
          boxShadow: isOpen
            ? '0 0 20px rgba(199,146,234,0.3), 0 4px 12px rgba(0,0,0,0.4)'
            : '0 0 16px rgba(199,146,234,0.15), 0 4px 12px rgba(0,0,0,0.3)',
          color: '#c792ea',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Style playground"
        title="Style playground (P)"
      >
        <Palette size={16} />
      </button>

      {/* --- Overlay Panel --- */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={handleOverlayClick}
        >
          <div
            className="w-full max-w-2xl mx-4 flex flex-col rounded-xl overflow-hidden"
            style={{
              background: '#0c0c14',
              border: '1px solid rgba(199,146,234,0.2)',
              boxShadow: '0 0 40px rgba(199,146,234,0.08), 0 24px 48px rgba(0,0,0,0.5)',
              animation: 'export-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Style playground"
          >
            {/* -- Header -- */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(199,146,234,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <Palette size={16} style={{ color: '#c792ea' }} />
                <span style={{ ...mono, fontSize: '0.8125rem', fontWeight: 700, color: '#c792ea', letterSpacing: '0.08em' }}>
                  PLAYGROUND
                </span>
                <span style={{ ...mono, fontSize: '0.5625rem', color: '#565575', background: 'rgba(199,146,234,0.08)', borderRadius: '3px', padding: '1px 6px', border: '1px solid rgba(199,146,234,0.12)' }}>
                  {activeStyle.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                    style={{ background: 'rgba(199,146,234,0.08)', border: '1px solid rgba(199,146,234,0.15)', color: '#c792ea', cursor: 'pointer', ...mono, fontSize: '0.5625rem' }}
                    aria-label="Reset to defaults"
                  >
                    <RotateCcw size={10} />
                    RESET
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-md transition-colors"
                  style={{ width: '32px', height: '32px', background: 'rgba(199,146,234,0.08)', border: '1px solid rgba(199,146,234,0.15)', color: '#c792ea', cursor: 'pointer' }}
                  aria-label="Close playground"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* -- Content: Controls + Preview -- */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(199,146,234,0.2) transparent' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 p-5">
                {/* Left: Controls */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ ...mono, fontSize: '0.625rem', fontWeight: 700, color: '#c792ea', letterSpacing: '0.1em' }}>CONTROLS</span>
                  </div>

                  <ColorInput label="Accent" value={accent} onChange={(v) => setOverrides((p) => ({ ...p, accent: v }))} />
                  <ColorInput label="Background" value={bg} onChange={(v) => setOverrides((p) => ({ ...p, bg: v }))} />
                  <ColorInput label="Text" value={text} onChange={(v) => setOverrides((p) => ({ ...p, text: v }))} />

                  <SliderControl label="Border Radius" value={radius} onChange={(v) => setOverrides((p) => ({ ...p, borderRadius: v }))} min={0} max={24} step={1} unit="px" accent={accent} />
                  <SliderControl label="Font Size" value={fontSize} onChange={(v) => setOverrides((p) => ({ ...p, fontSize: v }))} min={10} max={20} step={0.5} unit="rem" accent={accent} />
                  <SliderControl label="Spacing" value={spacing} onChange={(v) => setOverrides((p) => ({ ...p, spacing: v }))} min={4} max={32} step={2} unit="px" accent={accent} />
                  <SliderControl label="Border Width" value={borderWidth} onChange={(v) => setOverrides((p) => ({ ...p, borderWidth: v }))} min={0} max={5} step={1} unit="px" accent={accent} />
                  <SliderControl label="Shadow" value={shadowIntensity} onChange={(v) => setOverrides((p) => ({ ...p, shadowIntensity: v }))} min={0} max={1} step={0.1} unit="" accent={accent} />
                </div>

                {/* Right: Live Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ ...mono, fontSize: '0.625rem', fontWeight: 700, color: '#82aaff', letterSpacing: '0.1em' }}>PREVIEW</span>
                  </div>

                  <div className="space-y-3">
                    {/* Card preview */}
                    <div
                      style={{
                        background: bg,
                        borderRadius: radius,
                        border: `${borderWidth} solid ${accent}40`,
                        padding: spacing,
                        boxShadow: `0 ${parseFloat(shadowIntensity) * 20}px ${parseFloat(shadowIntensity) * 40}px rgba(0,0,0,${parseFloat(shadowIntensity) * 0.5})`,
                      }}
                    >
                      <h3 style={{ ...mono, fontSize: fontSize, fontWeight: 700, color: accent, letterSpacing: '0.04em', marginBottom: '8px' }}>
                        Card Title
                      </h3>
                      <p style={{ ...mono, fontSize: `calc(${fontSize} - 2px)`, color: text, opacity: 0.7, lineHeight: 1.6 }}>
                        Body text with custom spacing and typography.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          style={{
                            ...mono,
                            fontSize: `calc(${fontSize} - 3px)`,
                            fontWeight: 600,
                            background: accent,
                            color: bg,
                            borderRadius: radius,
                            padding: '4px 12px',
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '0.04em',
                          }}
                        >
                          ACTION
                        </button>
                        <button
                          style={{
                            ...mono,
                            fontSize: `calc(${fontSize} - 3px)`,
                            fontWeight: 600,
                            background: 'transparent',
                            color: accent,
                            borderRadius: radius,
                            padding: '4px 12px',
                            border: `${borderWidth} solid ${accent}40`,
                            cursor: 'pointer',
                            letterSpacing: '0.04em',
                          }}
                        >
                          OUTLINE
                        </button>
                      </div>
                    </div>

                    {/* Badge row */}
                    <div className="flex flex-wrap gap-2">
                      {[accent, bg, text].map((color, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5"
                          style={{
                            background: `${color}12`,
                            borderRadius: radius,
                            padding: '3px 8px',
                            border: `1px solid ${color}20`,
                          }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span style={{ ...mono, fontSize: '0.5625rem', color: text, opacity: 0.7 }}>{color}</span>
                        </div>
                      ))}
                    </div>

                    {/* Input preview */}
                    <div
                      style={{
                        background: bg,
                        borderRadius: radius,
                        border: `${borderWidth} solid ${accent}25`,
                        padding: '8px 12px',
                      }}
                    >
                      <div style={{ ...mono, fontSize: `calc(${fontSize} - 3px)`, color: text, opacity: 0.5 }}>
                        Type something...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* -- Footer -- */}
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ borderTop: '1px solid rgba(199,146,234,0.08)' }}
            >
              <button
                onClick={handleCopyCSS}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200"
                style={{
                  background: copied ? 'rgba(166,227,161,0.12)' : 'rgba(199,146,234,0.08)',
                  border: copied ? '1px solid rgba(166,227,161,0.25)' : '1px solid rgba(199,146,234,0.15)',
                  color: copied ? '#a6e3a1' : '#c792ea',
                  cursor: 'pointer',
                  ...mono,
                  fontSize: '0.5625rem',
                  letterSpacing: '0.06em',
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'COPIED' : 'COPY CSS'}
              </button>
              <span style={{ ...mono, fontSize: '0.5625rem', letterSpacing: '0.1em', color: '#565575' }}>
                ESC to close | P to open
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes playground-slide-up {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}
