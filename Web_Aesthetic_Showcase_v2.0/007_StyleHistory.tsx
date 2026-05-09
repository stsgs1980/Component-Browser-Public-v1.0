// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 292

'use client'

import { useState, useEffect, useRef } from 'react'
import { History, X } from 'lucide-react'

/* ----------------------------------------------------------------------
   STYLE HISTORY TRACKER
   Floating button + popover showing the last 10 style switches.
   Code Art aesthetic with purple accents.
   ---------------------------------------------------------------------- */

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

type HistoryStyleKey = 'retro' | 'brutalist' | 'cli' | 'scifi' | 'codeart' | 'modern'

const STYLE_ACCENTS: Record<HistoryStyleKey, { label: string; accent: string }> = {
  retro: { label: 'Retro Terminal', accent: '#f0c020' },
  brutalist: { label: 'Brutalist Shell', accent: '#111111' },
  cli: { label: 'CLI / Command', accent: '#89b4fa' },
  scifi: { label: 'Sci-Fi UI', accent: '#00f0ff' },
  codeart: { label: 'Code Art', accent: '#c792ea' },
  modern: { label: 'Clean / Modern', accent: '#525252' },
}

export interface StyleHistoryEntry {
  key: HistoryStyleKey
  timestamp: number
}

interface StyleHistoryProps {
  history: StyleHistoryEntry[]
  onSelectStyle: (key: HistoryStyleKey) => void
}

export default function StyleHistory({ history, onSelectStyle }: StyleHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  /* --- Click outside to close --- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  /* --- ESC to close --- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  /* --- Format timestamp as HH:MM:SS --- */
  function formatTime(ts: number): string {
    const d = new Date(ts)
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    const s = String(d.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  /* --- Last 10 entries, newest first --- */
  const recentHistory = history.slice(-10).reverse()

  return (
    <>
      {/* --- Floating Trigger Button - bottom-right, above TokenInspector --- */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((p) => !p)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          bottom: '80px',
          right: '24px',
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
        aria-label="Style history"
        title="Style history"
      >
        <History size={16} />
      </button>

      {/* --- Popover Panel --- */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-[55] flex flex-col rounded-lg overflow-hidden"
          style={{
            bottom: '128px',
            right: '24px',
            width: '260px',
            maxHeight: '360px',
            background: '#0c0c14',
            border: '1px solid rgba(199,146,234,0.2)',
            boxShadow: '0 0 30px rgba(199,146,234,0.1), 0 12px 40px rgba(0,0,0,0.5)',
            animation: 'history-fade-in 0.2s ease-out',
          }}
          role="dialog"
          aria-label="Style history"
        >
          {/* -- Header -- */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(199,146,234,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <History size={13} style={{ color: '#c792ea' }} />
              <span
                style={{
                  ...mono,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#c792ea',
                  letterSpacing: '0.08em',
                }}
              >
                HISTORY
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-md transition-colors"
              style={{
                width: '24px',
                height: '24px',
                background: 'rgba(199,146,234,0.08)',
                border: '1px solid rgba(199,146,234,0.15)',
                color: '#c792ea',
                cursor: 'pointer',
              }}
              aria-label="Close history"
            >
              <X size={12} />
            </button>
          </div>

          {/* -- Timeline entries -- */}
          <div
            className="flex-1 overflow-y-auto py-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(199,146,234,0.2) transparent' }}
          >
            {recentHistory.length === 0 ? (
              <div
                className="px-4 py-6 text-center"
                style={{ ...mono, fontSize: '0.6875rem', color: '#565575' }}
              >
                No style changes yet
              </div>
            ) : (
              recentHistory.map((entry, i) => {
                const styleData = STYLE_ACCENTS[entry.key]
                if (!styleData) return null
                const isLast = i === recentHistory.length - 1
                return (
                  <button
                    key={`${entry.timestamp}-${entry.key}-${i}`}
                    onClick={() => {
                      onSelectStyle(entry.key)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: isLast ? 'none' : '1px solid rgba(199,146,234,0.04)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(199,146,234,0.04)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center shrink-0" style={{ width: '12px' }}>
                      <div
                        className="rounded-full"
                        style={{
                          width: '8px',
                          height: '8px',
                          background: styleData.accent,
                          boxShadow: `0 0 6px ${styleData.accent}60`,
                        }}
                      />
                      {!isLast && (
                        <div
                          className="w-px flex-1 mt-1"
                          style={{
                            height: '16px',
                            background: 'rgba(199,146,234,0.12)',
                          }}
                        />
                      )}
                    </div>

                    {/* Style info */}
                    <div className="flex-1 min-w-0">
                      <span
                        className="block truncate"
                        style={{
                          ...mono,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: styleData.accent === '#111111' ? '#c3cee3' : styleData.accent,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {styleData.label}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <span
                      className="shrink-0"
                      style={{
                        ...mono,
                        fontSize: '0.5625rem',
                        color: '#565575',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {formatTime(entry.timestamp)}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          {/* -- Footer -- */}
          <div
            className="flex items-center justify-center px-4 py-2 shrink-0"
            style={{ borderTop: '1px solid rgba(199,146,234,0.08)' }}
          >
            <span
              style={{
                ...mono,
                fontSize: '0.5rem',
                letterSpacing: '0.1em',
                color: '#565575',
              }}
            >
              ESC to close | Click entry to switch
            </span>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes history-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
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
