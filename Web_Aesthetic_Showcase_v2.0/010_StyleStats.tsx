// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 259

'use client'

import { useState, useEffect, useRef } from 'react'
import { BarChart3, X } from 'lucide-react'
import { type StyleKey } from '@/lib/style-constants'
import { STYLES } from '@/lib/style-constants'

/* ----------------------------------------------------------------------
   STYLE STATS DASHBOARD
   Floating panel showing style usage statistics.
   Tracks view counts in localStorage, displays mini bar chart.
   Keyboard shortcut: D
   ---------------------------------------------------------------------- */

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

const STORAGE_KEY = 'zai-style-stats'

interface StyleStat {
  key: StyleKey
  views: number
}

function loadStats(): StyleStat[] {
  if (typeof window === 'undefined') return STYLES.map(s => ({ key: s.key, views: 0 }))
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number>
      return STYLES.map(s => ({ key: s.key, views: parsed[s.key] ?? 0 }))
    }
  } catch { /* ignore */ }
  return STYLES.map(s => ({ key: s.key, views: 0 }))
}

function saveStats(stats: StyleStat[]) {
  if (typeof window === 'undefined') return
  try {
    const obj: Record<string, number> = {}
    stats.forEach(s => { obj[s.key] = s.views })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
  } catch { /* ignore */ }
}

export function recordStyleView(key: StyleKey) {
  if (typeof window === 'undefined') return
  const stats = loadStats()
  const entry = stats.find(s => s.key === key)
  if (entry) {
    entry.views += 1
    saveStats(stats)
  }
}

export function getStyleStats(): StyleStat[] {
  return loadStats()
}

export default function StyleStats() {
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState<StyleStat[]>([])
  const [sessionStart] = useState(Date.now())
  const [sessionDuration, setSessionDuration] = useState('0m 0s')
  const overlayRef = useRef<HTMLDivElement>(null)

  /* Load stats when opening */
  useEffect(() => {
    if (isOpen) {
      setStats(loadStats())
    }
  }, [isOpen])

  /* Session duration timer */
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setSessionDuration(`${minutes}m ${seconds}s`)
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionStart])

  /* External trigger */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('zai-open-stats', handleOpen)
    return () => window.removeEventListener('zai-open-stats', handleOpen)
  }, [])

  /* ESC to close */
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

  const maxViews = Math.max(...stats.map(s => s.views), 1)
  const totalViews = stats.reduce((sum, s) => sum + s.views, 0)
  const mostViewed = stats.length > 0 ? stats.reduce((a, b) => a.views >= b.views ? a : b) : null
  const mostViewedMeta = mostViewed ? STYLES.find(s => s.key === mostViewed.key) : null

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          bottom: '120px',
          left: '50%',
          transform: 'translateX(40px)',
          width: '36px',
          height: '36px',
          background: 'rgba(12,12,20,0.9)',
          border: '1px solid rgba(137,180,250,0.25)',
          boxShadow: isOpen
            ? '0 0 20px rgba(137,180,250,0.3), 0 4px 12px rgba(0,0,0,0.4)'
            : '0 0 12px rgba(137,180,250,0.15), 0 4px 12px rgba(0,0,0,0.3)',
          color: '#89b4fa',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Style statistics"
        title="Style stats (D)"
      >
        <BarChart3 size={14} />
      </button>

      {/* Overlay Panel */}
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
              border: '1px solid rgba(137,180,250,0.2)',
              boxShadow: '0 0 40px rgba(137,180,250,0.08), 0 24px 48px rgba(0,0,0,0.5)',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Style statistics"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(137,180,250,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 size={16} style={{ color: '#89b4fa' }} />
                <span style={{ ...mono, fontSize: '0.8125rem', fontWeight: 700, color: '#89b4fa', letterSpacing: '0.08em' }}>
                  STATS
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-md transition-colors"
                style={{ width: '32px', height: '32px', background: 'rgba(137,180,250,0.08)', border: '1px solid rgba(137,180,250,0.15)', color: '#89b4fa', cursor: 'pointer' }}
                aria-label="Close stats"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(137,180,250,0.2) transparent' }}>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ background: 'rgba(137,180,250,0.06)', border: '1px solid rgba(137,180,250,0.1)' }}
                >
                  <div style={{ ...mono, fontSize: '1.25rem', fontWeight: 700, color: '#89b4fa' }}>{totalViews}</div>
                  <div style={{ ...mono, fontSize: '0.5rem', color: '#565575', letterSpacing: '0.1em', marginTop: '4px' }}>TOTAL VIEWS</div>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ background: 'rgba(137,180,250,0.06)', border: '1px solid rgba(137,180,250,0.1)' }}
                >
                  <div style={{ ...mono, fontSize: '1.25rem', fontWeight: 700, color: '#a6e3a1' }}>{sessionDuration}</div>
                  <div style={{ ...mono, fontSize: '0.5rem', color: '#565575', letterSpacing: '0.1em', marginTop: '4px' }}>SESSION</div>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ background: 'rgba(137,180,250,0.06)', border: '1px solid rgba(137,180,250,0.1)' }}
                >
                  <div style={{ ...mono, fontSize: '1.25rem', fontWeight: 700, color: mostViewedMeta?.accent ?? '#c792ea' }}>
                    {mostViewedMeta?.pill ?? '--'}
                  </div>
                  <div style={{ ...mono, fontSize: '0.5rem', color: '#565575', letterSpacing: '0.1em', marginTop: '4px' }}>TOP STYLE</div>
                </div>
              </div>

              {/* Bar chart */}
              <div className="space-y-3">
                {stats.map((stat) => {
                  const meta = STYLES.find(s => s.key === stat.key)
                  if (!meta) return null
                  const barWidth = maxViews > 0 ? (stat.views / maxViews) * 100 : 0
                  return (
                    <div key={stat.key} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 shrink-0" style={{ width: '80px' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: meta.accent }} />
                        <span style={{ ...mono, fontSize: '0.5625rem', fontWeight: 600, color: '#c3cee3', letterSpacing: '0.04em' }}>{meta.pill}</span>
                      </div>
                      <div className="flex-1 h-5 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div
                          className="h-full rounded-sm transition-all duration-500"
                          style={{
                            width: `${Math.max(barWidth, stat.views > 0 ? 4 : 0)}%`,
                            background: `linear-gradient(90deg, ${meta.accent}80, ${meta.accent}40)`,
                            boxShadow: stat.views > 0 ? `0 0 8px ${meta.accent}20` : 'none',
                          }}
                        />
                      </div>
                      <span style={{ ...mono, fontSize: '0.5625rem', color: '#565575', width: '28px', textAlign: 'right' }}>{stat.views}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ borderTop: '1px solid rgba(137,180,250,0.08)' }}
            >
              <span style={{ ...mono, fontSize: '0.5rem', color: '#565575', letterSpacing: '0.08em' }}>
                Data stored locally
              </span>
              <span style={{ ...mono, fontSize: '0.5rem', color: '#565575', letterSpacing: '0.08em' }}>
                D to open | ESC to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
