// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 250

'use client'

import { useState, useEffect, useRef } from 'react'
import { Keyboard, X } from 'lucide-react'

/* ----------------------------------------------------------------------
   KEYBOARD SHORTCUTS HELP PANEL
   Floating trigger button (bottom-left, above StyleComparison) + modal overlay.
   Code Art aesthetic with purple accents.
   ---------------------------------------------------------------------- */

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

interface ShortcutEntry {
  keys: string[]
  description: string
}

const SHORTCUTS: ShortcutEntry[] = [
  { keys: ['1'], description: 'Switch to Retro Terminal' },
  { keys: ['2'], description: 'Switch to CLI / Command' },
  { keys: ['3'], description: 'Switch to Code Art' },
  { keys: ['4'], description: 'Switch to Clean / Modern' },
  { keys: ['5'], description: 'Switch to Brutalist Shell' },
  { keys: ['6'], description: 'Switch to Sci-Fi UI' },
  { keys: ['R'], description: 'Random style' },
  { keys: ['H'], description: 'Show this help' },
  { keys: ['L'], description: 'Style legend' },
  { keys: ['T'], description: 'Token inspector' },
  { keys: ['E'], description: 'Export style tokens' },
  { keys: ['P'], description: 'Style playground' },
  { keys: ['S'], description: 'Animation showcase' },
  { keys: ['A'], description: 'Auto-cycle toggle' },
  { keys: ['Esc'], description: 'Close panels' },
]

interface KeyboardHelpProps {
  /** Incrementing counter; each change opens the panel */
  triggerOpen?: number
}

export default function KeyboardHelp({ triggerOpen }: KeyboardHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  /* --- External trigger: listen for custom event --- */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('zai-open-help', handleOpen)
    return () => window.removeEventListener('zai-open-help', handleOpen)
  }, [])

  /* --- triggerOpen prop: dispatch custom event to open the panel --- */
  useEffect(() => {
    if (triggerOpen && triggerOpen > 0) {
      window.dispatchEvent(new CustomEvent('zai-open-help'))
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

  return (
    <>
      {/* --- Floating Trigger Button - bottom-left, above StyleComparison --- */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          bottom: '80px',
          left: '24px',
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
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        <Keyboard size={16} />
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
            className="w-full max-w-md mx-4 flex flex-col rounded-xl overflow-hidden"
            style={{
              background: '#0c0c14',
              border: '1px solid rgba(199,146,234,0.2)',
              boxShadow: '0 0 40px rgba(199,146,234,0.08), 0 24px 48px rgba(0,0,0,0.5)',
              animation: 'kbdhelp-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            {/* -- Header -- */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(199,146,234,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <Keyboard size={16} style={{ color: '#c792ea' }} />
                <span
                  style={{
                    ...mono,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#c792ea',
                    letterSpacing: '0.08em',
                  }}
                >
                  KEYBOARD SHORTCUTS
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
                aria-label="Close keyboard shortcuts"
              >
                <X size={14} />
              </button>
            </div>

            {/* -- Shortcuts table -- */}
            <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(199,146,234,0.2) transparent' }}>
              <div className="space-y-1">
                {SHORTCUTS.map((shortcut, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5"
                    style={{ borderBottom: '1px solid rgba(199,146,234,0.04)' }}
                  >
                    {/* KBD styled box */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {shortcut.keys.map((key, ki) => (
                        <kbd
                          key={ki}
                          className="flex items-center justify-center rounded"
                          style={{
                            ...mono,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: '#c792ea',
                            background: 'rgba(199,146,234,0.08)',
                            border: '1px solid rgba(199,146,234,0.2)',
                            boxShadow: '0 2px 0 rgba(199,146,234,0.15)',
                            minWidth: '28px',
                            height: '28px',
                            padding: '0 8px',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>

                    {/* Description */}
                    <span
                      style={{
                        ...mono,
                        fontSize: '0.75rem',
                        color: '#c3cee3',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {shortcut.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* -- Footer -- */}
            <div
              className="flex items-center justify-center px-5 py-3 shrink-0"
              style={{ borderTop: '1px solid rgba(199,146,234,0.08)' }}
            >
              <span
                style={{
                  ...mono,
                  fontSize: '0.5625rem',
                  letterSpacing: '0.1em',
                  color: '#565575',
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
        @keyframes kbdhelp-slide-up {
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
