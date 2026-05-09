// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 352

'use client'

import { useState, useEffect, useRef } from 'react'
import { BookOpen, X } from 'lucide-react'

/* ----------------------------------------------------------------------
   STYLE LEGEND
   Collapsible quick-reference panel showing all 6 styles at a glance.
   Floating trigger button (bottom-center) + modal overlay with Code Art aesthetic.
   ---------------------------------------------------------------------- */

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

type LegendStyleKey = 'retro' | 'brutalist' | 'cli' | 'scifi' | 'codeart' | 'modern'

interface LegendStyleData {
  name: string
  accent: string
  desc: string
  bestFor: string
  key: string
}

const LEGEND_STYLES: Record<LegendStyleKey, LegendStyleData> = {
  retro: {
    name: 'Retro Terminal',
    accent: '#f0c020',
    desc: 'CRT phosphor + boot animation',
    bestFor: 'Dev tools, retro games',
    key: '1',
  },
  brutalist: {
    name: 'Brutalist Shell',
    accent: '#111111',
    desc: 'Raw HTML + thick borders',
    bestFor: 'Portfolio, art projects',
    key: '5',
  },
  cli: {
    name: 'CLI / Command',
    accent: '#89b4fa',
    desc: 'IDE layout + syntax highlight',
    bestFor: 'API docs, dev pages',
    key: '2',
  },
  scifi: {
    name: 'Sci-Fi UI',
    accent: '#00f0ff',
    desc: 'HUD + radar + live telemetry',
    bestFor: 'IoT dashboards, game UI',
    key: '6',
  },
  codeart: {
    name: 'Code Art',
    accent: '#c792ea',
    desc: 'Code as poetry + Material Theme',
    bestFor: 'Dev blogs, open source',
    key: '3',
  },
  modern: {
    name: 'Clean / Modern',
    accent: '#525252',
    desc: 'Bento grid + minimal + tokens',
    bestFor: 'SaaS, corporate',
    key: '4',
  },
}

const LEGEND_KEYS: LegendStyleKey[] = ['retro', 'brutalist', 'cli', 'scifi', 'codeart', 'modern']

interface StyleLegendProps {
  onSelectStyle?: (key: string) => void
  triggerOpen?: number
}

export default function StyleLegend({ onSelectStyle, triggerOpen }: StyleLegendProps) {
  const [isOpen, setIsOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  /* --- External trigger: listen for custom event --- */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('zai-open-legend', handleOpen)
    return () => window.removeEventListener('zai-open-legend', handleOpen)
  }, [])

  /* --- triggerOpen prop: dispatch custom event to open the panel --- */
  useEffect(() => {
    if (triggerOpen && triggerOpen > 0) {
      window.dispatchEvent(new CustomEvent('zai-open-legend'))
    }
  }, [triggerOpen])

  /* --- ESC key to close --- */
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

  /* --- Click outside to close --- */
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      setIsOpen(false)
    }
  }

  /* --- Handle style card click --- */
  function handleStyleClick(styleKey: LegendStyleKey) {
    if (onSelectStyle) {
      onSelectStyle(styleKey)
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* --- Floating Trigger Button - bottom center --- */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 z-50 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: '44px',
          height: '44px',
          background: 'rgba(12,12,20,0.9)',
          border: '1px solid rgba(199,146,234,0.25)',
          boxShadow: '0 0 16px rgba(199,146,234,0.15), 0 4px 12px rgba(0,0,0,0.3)',
          color: '#c792ea',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? 'none' : 'auto',
          transition: 'opacity 0.2s, transform 0.2s',
        }}
        aria-label="Style quick reference"
        title="Style quick reference"
      >
        <BookOpen size={18} />
      </button>

      {/* --- Overlay Panel --- */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={handleOverlayClick}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-t-xl md:rounded-xl overflow-hidden"
            style={{
              background: '#0c0c14',
              border: '1px solid rgba(199,146,234,0.15)',
              boxShadow: '0 0 40px rgba(199,146,234,0.08), 0 24px 48px rgba(0,0,0,0.5)',
              animation: 'legend-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Style quick reference"
          >
            {/* -- Header -- */}
            <div
              className="flex items-center justify-between px-5 py-3.5 shrink-0"
              style={{ borderBottom: '1px solid rgba(199,146,234,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen size={16} style={{ color: '#c792ea' }} />
                <span
                  style={{
                    ...mono,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#c792ea',
                    letterSpacing: '0.08em',
                  }}
                >
                  STYLE GUIDE
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
                aria-label="Close style legend"
              >
                <X size={14} />
              </button>
            </div>

            {/* -- Content: Style Cards Grid -- */}
            <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(199,146,234,0.2) transparent' }}>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {LEGEND_KEYS.map((styleKey) => {
                  const data = LEGEND_STYLES[styleKey]
                  return (
                    <button
                      key={styleKey}
                      onClick={() => handleStyleClick(styleKey)}
                      className="card-hover-lift press-effect flex flex-col rounded-lg overflow-hidden text-left"
                      style={{
                        background: '#141420',
                        border: '1px solid rgba(199,146,234,0.12)',
                        boxShadow: `0 0 16px ${data.accent}08`,
                        cursor: 'pointer',
                      }}
                    >
                      {/* Accent bar */}
                      <div
                        className="h-1 shrink-0"
                        style={{ background: `linear-gradient(90deg, ${data.accent}, ${data.accent}80, transparent)` }}
                      />

                      {/* Style name with accent dot */}
                      <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid rgba(199,146,234,0.06)' }}>
                        <div
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ background: data.accent, boxShadow: `0 0 8px ${data.accent}60` }}
                        />
                        <span
                          className="truncate"
                          style={{
                            ...mono,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: data.accent,
                            letterSpacing: '0.03em',
                          }}
                        >
                          {data.name}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(199,146,234,0.04)' }}>
                        <span
                          style={{
                            ...mono,
                            fontSize: '0.5625rem',
                            color: '#c3cee3',
                            lineHeight: 1.5,
                            display: 'block',
                          }}
                        >
                          {data.desc}
                        </span>
                      </div>

                      {/* Best for tag */}
                      <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(199,146,234,0.04)' }}>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded-sm"
                          style={{
                            ...mono,
                            fontSize: '0.5rem',
                            letterSpacing: '0.03em',
                            color: data.accent,
                            background: `${data.accent}12`,
                            border: `1px solid ${data.accent}20`,
                          }}
                        >
                          {data.bestFor}
                        </span>
                      </div>

                      {/* Key shortcut badge */}
                      <div className="px-3 py-2 flex items-center justify-between">
                        <span
                          style={{
                            ...mono,
                            fontSize: '0.5rem',
                            letterSpacing: '0.08em',
                            color: '#676e95',
                          }}
                        >
                          shortcut
                        </span>
                        <span
                          className="flex items-center justify-center rounded"
                          style={{
                            ...mono,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            color: '#c792ea',
                            background: 'rgba(199,146,234,0.08)',
                            border: '1px solid rgba(199,146,234,0.2)',
                            width: '20px',
                            height: '20px',
                          }}
                        >
                          {data.key}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* -- Footer -- */}
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
        @keyframes legend-slide-up {
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
