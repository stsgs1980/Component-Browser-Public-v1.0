// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 684

'use client'

import { useState, useEffect, useRef } from 'react'
import { Columns2, X, ChevronDown } from 'lucide-react'

/* --- Types & Data --- */

type ComparisonStyleKey = 'retro' | 'brutalist' | 'cli' | 'scifi' | 'codeart' | 'modern'

interface ComparisonStyleData {
  name: string
  accent: string
  colors: string[]
  headingFont: string
  bodyFont: string
  features: string[]
  bestFor: string
}

const COMPARISON_DATA: Record<ComparisonStyleKey, ComparisonStyleData> = {
  retro: {
    name: 'Retro Terminal',
    accent: '#f0c020',
    colors: ['#f0c020', '#ffe066', '#0a0800', '#1a1a1a', '#ff6666'],
    headingFont: 'Geist Mono, ligatures off',
    bodyFont: 'Geist Mono, ligatures off',
    features: ['CRT scanline effects', 'Boot sequence animation', 'Interactive command input'],
    bestFor: 'Developer tools, retro games',
  },
  brutalist: {
    name: 'Brutalist Shell',
    accent: '#000000',
    colors: ['#000000', '#ffffff', '#ffff00', '#555555', '#f9f9f9'],
    headingFont: 'System monospace',
    bodyFont: 'System monospace',
    features: ['2px solid black borders', 'No shadows or radius', 'Raw HTML structure'],
    bestFor: 'Portfolio, art projects',
  },
  cli: {
    name: 'CLI / Command',
    accent: '#89b4fa',
    colors: ['#1e1e2e', '#89b4fa', '#a6e3a1', '#f38ba8', '#cdd6f4'],
    headingFont: 'Geist Mono, Catppuccin Mocha',
    bodyFont: 'Geist Mono, Catppuccin Mocha',
    features: ['File explorer sidebar', 'Syntax highlighting', 'Status bar'],
    bestFor: 'API docs, dev landing pages',
  },
  scifi: {
    name: 'Sci-Fi UI',
    accent: '#00f0ff',
    colors: ['#00f0ff', '#0a0e1a', '#a6e3a1', '#f9e2af', '#cdd6f4'],
    headingFont: 'Geist Mono, holographic',
    bodyFont: 'Geist Mono, HUD style',
    features: ['Animated radar', 'Live telemetry panels', 'Grid overlay + scan line'],
    bestFor: 'IoT dashboards, game UI',
  },
  codeart: {
    name: 'Code Art',
    accent: '#c792ea',
    colors: ['#c792ea', '#82aaff', '#c3e88d', '#89ddff', '#c3cee3'],
    headingFont: 'Geist Mono, Material Theme',
    bodyFont: 'Geist Sans, code poetry',
    features: ['Syntax-colored elements', 'Self-referential design', 'Code as visual art'],
    bestFor: 'Dev blogs, open source',
  },
  modern: {
    name: 'Clean / Modern',
    accent: '#525252',
    colors: ['#525252', '#f5f5f5', '#e5e5e5', '#171717', '#fafafa'],
    headingFont: 'Geist Sans, neutral palette',
    bodyFont: 'Geist Sans, whitespace-first',
    features: ['Bento grid layout', 'Design tokens', 'Component lab'],
    bestFor: 'SaaS products, corporate',
  },
}

const STYLE_KEYS: ComparisonStyleKey[] = ['retro', 'brutalist', 'cli', 'scifi', 'codeart', 'modern']

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

/* --- Style Selector Dropdown --- */
function StyleSelector({
  value,
  onChange,
  exclude,
}: {
  value: ComparisonStyleKey
  onChange: (key: ComparisonStyleKey) => void
  exclude?: ComparisonStyleKey
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const options = STYLE_KEYS.filter((k) => k !== exclude)
  const current = COMPARISON_DATA[value]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full"
        style={{
          ...mono,
          fontSize: '0.8125rem',
          background: 'rgba(199,146,234,0.08)',
          border: '1px solid rgba(199,146,234,0.2)',
          color: '#c3cee3',
          cursor: 'pointer',
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ background: current.accent, boxShadow: `0 0 6px ${current.accent}40` }}
        />
        <span className="flex-1 text-left truncate">{current.name}</span>
        <ChevronDown
          size={14}
          className="shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: '#676e95' }}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-md overflow-hidden z-50"
          style={{
            background: '#141420',
            border: '1px solid rgba(199,146,234,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
          role="listbox"
        >
          {options.map((key) => {
            const s = COMPARISON_DATA[key]
            const isActive = key === value
            return (
              <button
                key={key}
                onClick={() => {
                  onChange(key)
                  setOpen(false)
                }}
                className="flex items-center gap-2 px-3 py-2 w-full text-left transition-colors"
                style={{
                  ...mono,
                  fontSize: '0.8125rem',
                  background: isActive ? 'rgba(199,146,234,0.12)' : 'transparent',
                  color: isActive ? '#c792ea' : '#c3cee3',
                  cursor: 'pointer',
                  border: 'none',
                  borderBottom: '1px solid rgba(199,146,234,0.06)',
                }}
                role="option"
                aria-selected={isActive}
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: s.accent }}
                />
                <span className="flex-1">{s.name}</span>
                {isActive && (
                  <span style={{ color: '#c792ea', fontSize: '0.625rem' }}>active</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* --- Comparison Card --- */
function ComparisonCard({ styleKey }: { styleKey: ComparisonStyleKey }) {
  const data = COMPARISON_DATA[styleKey]

  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden"
      style={{
        background: '#141420',
        border: '1px solid rgba(199,146,234,0.12)',
        boxShadow: `0 0 20px ${data.accent}08`,
      }}
    >
      {/* Accent bar */}
      <div
        className="h-1 shrink-0"
        style={{ background: `linear-gradient(90deg, ${data.accent}, ${data.accent}80, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid rgba(199,146,234,0.08)' }}>
        <div
          className="w-3 h-3 rounded-sm shrink-0"
          style={{ background: data.accent, boxShadow: `0 0 8px ${data.accent}60` }}
        />
        <span
          style={{
            ...mono,
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: data.accent,
            letterSpacing: '0.04em',
          }}
        >
          {data.name}
        </span>
      </div>

      {/* Color swatches */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(199,146,234,0.08)' }}>
        <div
          style={{
            ...mono,
            fontSize: '0.5625rem',
            letterSpacing: '0.12em',
            color: '#676e95',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}
        >
          Color Palette
        </div>
        <div className="flex gap-2">
          {data.colors.map((hex, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded"
                style={{
                  background: hex,
                  border: '1px solid rgba(199,146,234,0.15)',
                  boxShadow: `0 2px 8px ${hex}30`,
                }}
              />
              <span
                style={{
                  ...mono,
                  fontSize: '0.5rem',
                  color: '#676e95',
                  letterSpacing: '0.02em',
                }}
              >
                {hex}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography preview */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(199,146,234,0.08)' }}>
        <div
          style={{
            ...mono,
            fontSize: '0.5625rem',
            letterSpacing: '0.12em',
            color: '#676e95',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}
        >
          Typography
        </div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: data.accent,
            lineHeight: 1.3,
            marginBottom: '0.25rem',
          }}
        >
          {data.name}
        </div>
        <div
          style={{
            ...mono,
            fontSize: '0.75rem',
            color: '#c3cee3',
            lineHeight: 1.5,
          }}
        >
          {data.headingFont}
        </div>
        <div
          style={{
            ...mono,
            fontSize: '0.6875rem',
            color: '#676e95',
            lineHeight: 1.5,
            marginTop: '0.125rem',
          }}
        >
          {data.bodyFont}
        </div>
      </div>

      {/* Feature highlights */}
      <div className="px-4 py-3 flex-1" style={{ borderBottom: '1px solid rgba(199,146,234,0.08)' }}>
        <div
          style={{
            ...mono,
            fontSize: '0.5625rem',
            letterSpacing: '0.12em',
            color: '#676e95',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}
        >
          Features
        </div>
        <div className="space-y-1.5">
          {data.features.map((feat, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                style={{
                  ...mono,
                  fontSize: '0.5rem',
                  color: data.accent,
                  marginTop: '0.2rem',
                  lineHeight: 1,
                }}
              >
                {'//'}
              </span>
              <span
                style={{
                  ...mono,
                  fontSize: '0.75rem',
                  color: '#c3cee3',
                  lineHeight: 1.5,
                }}
              >
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Best for tag */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            style={{
              ...mono,
              fontSize: '0.5625rem',
              letterSpacing: '0.1em',
              color: '#676e95',
              textTransform: 'uppercase',
            }}
          >
            Best for:
          </span>
          <span
            className="px-2 py-0.5 rounded-sm"
            style={{
              ...mono,
              fontSize: '0.625rem',
              letterSpacing: '0.04em',
              color: data.accent,
              background: `${data.accent}12`,
              border: `1px solid ${data.accent}25`,
            }}
          >
            {data.bestFor}
          </span>
        </div>
      </div>
    </div>
  )
}

/* --- VS Divider --- */
function VsDivider({ vertical }: { vertical: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-2 md:px-4 shrink-0">
        <div
          className="w-px flex-1"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(199,146,234,0.3), transparent)' }}
        />
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: '44px',
            height: '44px',
            background: '#141420',
            border: '2px solid rgba(199,146,234,0.3)',
            boxShadow: '0 0 20px rgba(199,146,234,0.15)',
          }}
        >
          <span
            style={{
              ...mono,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#c792ea',
              letterSpacing: '0.1em',
              textShadow: '0 0 8px rgba(199,146,234,0.4)',
            }}
          >
            VS
          </span>
        </div>
        <div
          className="w-px flex-1"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(199,146,234,0.3), transparent)' }}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2 py-2 shrink-0">
      <div
        className="h-px flex-1"
        style={{ background: 'linear-gradient(to right, transparent, rgba(199,146,234,0.3), transparent)' }}
      />
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: '44px',
          height: '44px',
          background: '#141420',
          border: '2px solid rgba(199,146,234,0.3)',
          boxShadow: '0 0 20px rgba(199,146,234,0.15)',
        }}
      >
        <span
          style={{
            ...mono,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#c792ea',
            letterSpacing: '0.1em',
            textShadow: '0 0 8px rgba(199,146,234,0.4)',
          }}
        >
          VS
        </span>
      </div>
      <div
        className="h-px flex-1"
        style={{ background: 'linear-gradient(to right, transparent, rgba(199,146,234,0.3), transparent)' }}
      />
    </div>
  )
}

/* --- Main Component --- */
export default function StyleComparison() {
  const [isOpen, setIsOpen] = useState(false)
  const [styleA, setStyleA] = useState<ComparisonStyleKey>('retro')
  const [styleB, setStyleB] = useState<ComparisonStyleKey>('codeart')
  const [isMobile, setIsMobile] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Detect mobile
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Escape key to close
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

  // Click outside to close
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Floating trigger button - bottom-left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          width: '44px',
          height: '44px',
          background: 'rgba(12,12,20,0.9)',
          border: '1px solid rgba(199,146,234,0.25)',
          boxShadow: '0 0 16px rgba(199,146,234,0.15), 0 4px 12px rgba(0,0,0,0.3)',
          color: '#c792ea',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Open style comparison"
        title="Compare styles side by side"
      >
        <Columns2 size={18} />
      </button>

      {/* Overlay panel */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={handleOverlayClick}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-t-xl md:rounded-xl overflow-hidden"
            style={{
              background: '#0c0c14',
              border: '1px solid rgba(199,146,234,0.15)',
              boxShadow: '0 0 40px rgba(199,146,234,0.08), 0 24px 48px rgba(0,0,0,0.5)',
              animation: 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Style comparison"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5 shrink-0"
              style={{ borderBottom: '1px solid rgba(199,146,234,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <Columns2 size={16} style={{ color: '#c792ea' }} />
                <span
                  style={{
                    ...mono,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#c792ea',
                    letterSpacing: '0.08em',
                  }}
                >
                  STYLE COMPARISON
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-md transition-colors"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(199,146,234,0.08)',
                  border: '1px solid rgba(199,146,234,0.15)',
                  color: '#c792ea',
                  cursor: 'pointer',
                }}
                aria-label="Close comparison panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* Selectors row */}
            <div
              className="grid grid-cols-2 gap-4 px-5 py-3 shrink-0"
              style={{ borderBottom: '1px solid rgba(199,146,234,0.08)' }}
            >
              <div>
                <div
                  style={{
                    ...mono,
                    fontSize: '0.5625rem',
                    letterSpacing: '0.12em',
                    color: '#676e95',
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Style A
                </div>
                <StyleSelector
                  value={styleA}
                  onChange={setStyleA}
                  exclude={styleB}
                />
              </div>
              <div>
                <div
                  style={{
                    ...mono,
                    fontSize: '0.5625rem',
                    letterSpacing: '0.12em',
                    color: '#676e95',
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Style B
                </div>
                <StyleSelector
                  value={styleB}
                  onChange={setStyleB}
                  exclude={styleA}
                />
              </div>
            </div>

            {/* Comparison content */}
            <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(199,146,234,0.2) transparent' }}>
              {/* Desktop: side by side, Mobile: stacked */}
              {isMobile ? (
                <div className="flex flex-col gap-0">
                  <ComparisonCard styleKey={styleA} />
                  <VsDivider vertical={false} />
                  <ComparisonCard styleKey={styleB} />
                </div>
              ) : (
                <div className="flex items-stretch gap-0 min-h-0">
                  <div className="flex-1 min-w-0">
                    <ComparisonCard styleKey={styleA} />
                  </div>
                  <VsDivider vertical={true} />
                  <div className="flex-1 min-w-0">
                    <ComparisonCard styleKey={styleB} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center justify-center px-5 py-2.5 shrink-0"
              style={{ borderTop: '1px solid rgba(199,146,234,0.08)' }}
            >
              <span
                style={{
                  ...mono,
                  fontSize: '0.5625rem',
                  letterSpacing: '0.1em',
                  color: '#676e95',
                }}
              >
                ESC to close | Click outside to dismiss
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slide-up {
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
