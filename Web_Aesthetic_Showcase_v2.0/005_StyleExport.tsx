// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 313

'use client'

import { useState, useEffect, useRef } from 'react'
import { Share2, X, Copy, Check } from 'lucide-react'

/* ----------------------------------------------------------------------
   STYLE EXPORT / SHARE PANEL
   Floating trigger button (bottom area) + modal overlay.
   Lets users copy CSS variables or a shareable config for the current style.
   Code Art aesthetic with purple accents.
   ---------------------------------------------------------------------- */

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

type ExportStyleKey = 'retro' | 'brutalist' | 'cli' | 'scifi' | 'codeart' | 'modern'

const STYLE_CSS: Record<ExportStyleKey, Record<string, string>> = {
  retro: {
    '--color-primary': '#f0c020',
    '--color-secondary': '#b8960f',
    '--color-background': '#0a0800',
    '--color-text': '#f0c020',
    '--color-accent': '#ffe066',
    '--color-muted': '#555',
    '--color-border': '#333',
    '--font-family': 'monospace',
    '--text-shadow': '0 0 6px rgba(240,192,32,0.45)',
  },
  brutalist: {
    '--color-primary': '#000000',
    '--color-secondary': '#555555',
    '--color-background': '#ffffff',
    '--color-text': '#000000',
    '--color-accent': '#ffff00',
    '--color-muted': '#999',
    '--color-border': '#000000',
    '--font-family': 'monospace',
    '--border-width': '2px',
  },
  cli: {
    '--color-primary': '#89b4fa',
    '--color-secondary': '#a6adc8',
    '--color-background': '#1e1e2e',
    '--color-text': '#cdd6f4',
    '--color-accent': '#a6e3a1',
    '--color-muted': '#6c7086',
    '--color-border': 'rgba(255,255,255,0.06)',
    '--font-family': 'monospace',
  },
  scifi: {
    '--color-primary': '#00f0ff',
    '--color-secondary': 'rgba(0,240,255,0.5)',
    '--color-background': '#0a0e1a',
    '--color-text': '#00f0ff',
    '--color-accent': '#a6e3a1',
    '--color-muted': 'rgba(0,240,255,0.3)',
    '--color-border': 'rgba(0,240,255,0.4)',
    '--font-family': 'monospace',
    '--text-shadow': '0 0 10px rgba(0,240,255,0.3)',
  },
  codeart: {
    '--color-primary': '#c792ea',
    '--color-secondary': '#82aaff',
    '--color-background': '#0c0c14',
    '--color-text': '#c3cee3',
    '--color-accent': '#c3e88d',
    '--color-muted': '#676e95',
    '--color-border': 'rgba(199,146,234,0.15)',
    '--font-family': 'monospace',
  },
  modern: {
    '--color-primary': '#525252',
    '--color-secondary': '#a3a3a3',
    '--color-background': '#fafafa',
    '--color-text': '#171717',
    '--color-accent': '#525252',
    '--color-muted': '#737373',
    '--color-border': '#e5e5e5',
    '--font-family': 'sans-serif',
  },
}

interface StyleExportProps {
  activeStyle: ExportStyleKey
  triggerOpen?: number
}

export default function StyleExport({ activeStyle, triggerOpen }: StyleExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState<'css' | 'json' | 'tailwind'>('css')
  const overlayRef = useRef<HTMLDivElement>(null)

  /* --- External trigger --- */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('zai-open-export', handleOpen)
    return () => window.removeEventListener('zai-open-export', handleOpen)
  }, [])

  /* --- triggerOpen prop --- */
  useEffect(() => {
    if (triggerOpen && triggerOpen > 0) {
      window.dispatchEvent(new CustomEvent('zai-open-export'))
    }
  }, [triggerOpen])

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

  function generateOutput(): string {
    const vars = STYLE_CSS[activeStyle] || {}
    if (format === 'css') {
      return `:root {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
    }
    if (format === 'json') {
      return JSON.stringify(vars, null, 2)
    }
    // tailwind format
    const entries = Object.entries(vars)
    return `// tailwind.config.ts\ntheme: {\n  extend: {\n${entries.map(([k, v]) => `    '${k.replace('--color-', '').replace('--font-', '').replace('--text-', '').replace('--border-', '')}': '${v}',`).join('\n')}\n  }\n}`
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generateOutput())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const styleData = STYLE_CSS[activeStyle]

  return (
    <>
      {/* --- Floating Trigger Button --- */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
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
        aria-label="Export style"
        title="Export style tokens"
      >
        <Share2 size={16} />
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
            className="w-full max-w-lg mx-4 flex flex-col rounded-xl overflow-hidden"
            style={{
              background: '#0c0c14',
              border: '1px solid rgba(199,146,234,0.2)',
              boxShadow: '0 0 40px rgba(199,146,234,0.08), 0 24px 48px rgba(0,0,0,0.5)',
              animation: 'export-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Export style tokens"
          >
            {/* -- Header -- */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(199,146,234,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <Share2 size={16} style={{ color: '#c792ea' }} />
                <span style={{ ...mono, fontSize: '0.8125rem', fontWeight: 700, color: '#c792ea', letterSpacing: '0.08em' }}>
                  EXPORT STYLE
                </span>
                {styleData && (
                  <span style={{ ...mono, fontSize: '0.5625rem', color: '#565575', background: 'rgba(199,146,234,0.08)', borderRadius: '3px', padding: '1px 6px', border: '1px solid rgba(199,146,234,0.12)' }}>
                    {activeStyle.toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-md transition-colors"
                style={{ width: '32px', height: '32px', background: 'rgba(199,146,234,0.08)', border: '1px solid rgba(199,146,234,0.15)', color: '#c792ea', cursor: 'pointer' }}
                aria-label="Close export panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* -- Format Tabs -- */}
            <div className="flex items-center gap-1 px-5 pt-4" style={{ ...mono, fontSize: '0.625rem', letterSpacing: '0.06em' }}>
              {(['css', 'json', 'tailwind'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="px-3 py-1.5 rounded-md transition-all duration-200"
                  style={{
                    background: format === f ? 'rgba(199,146,234,0.12)' : 'transparent',
                    border: format === f ? '1px solid rgba(199,146,234,0.25)' : '1px solid transparent',
                    color: format === f ? '#c792ea' : '#565575',
                    cursor: 'pointer',
                    fontWeight: format === f ? 600 : 400,
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* -- Code Output -- */}
            <div className="px-5 py-4 flex-1">
              <div
                className="relative rounded-lg overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(199,146,234,0.08)' }}
              >
                <pre
                  className="p-4 overflow-auto text-left"
                  style={{
                    ...mono,
                    fontSize: '0.6875rem',
                    lineHeight: 1.7,
                    color: '#c3cee3',
                    maxHeight: '280px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(199,146,234,0.2) transparent',
                  }}
                >
                  {generateOutput()}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200"
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
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            {/* -- Footer -- */}
            <div
              className="flex items-center justify-center px-5 py-3 shrink-0"
              style={{ borderTop: '1px solid rgba(199,146,234,0.08)' }}
            >
              <span style={{ ...mono, fontSize: '0.5625rem', letterSpacing: '0.1em', color: '#565575' }}>
                ESC to close | Click outside to dismiss
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes export-slide-up {
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
