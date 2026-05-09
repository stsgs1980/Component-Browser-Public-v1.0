// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 301

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, X } from 'lucide-react'
import { STYLES, mono, type StyleKey } from '@/lib/style-constants'

const FAV_STORAGE_KEY = 'zai-style-favorites'

function readFavorites(): StyleKey[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return parsed.filter((k): k is StyleKey => STYLES.some(s => s.key === k))
  } catch {
    return []
  }
}

function saveFavorites(favs: StyleKey[]) {
  localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs))
}

interface StyleFavoritesProps {
  onSelectStyle: (key: StyleKey) => void
}

export default function StyleFavorites({ onSelectStyle }: StyleFavoritesProps) {
  const [open, setOpen] = useState(false)
  const [favorites, setFavorites] = useState<StyleKey[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  /* Read favorites when panel opens (via click handler, not effect) */
  const handleOpen = useCallback(() => {
    const stored = readFavorites()
    setFavorites(stored)
    setOpen(true)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const toggleFavorite = (key: StyleKey) => {
    setFavorites(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      saveFavorites(next)
      return next
    })
  }

  const isFav = (key: StyleKey) => favorites.includes(key)

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => open ? setOpen(false) : handleOpen()}
        className="fab-button"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '80px',
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(12,12,20,0.9)',
          border: favorites.length > 0 ? '1px solid rgba(199,146,234,0.4)' : '1px solid rgba(255,255,255,0.08)',
          color: favorites.length > 0 ? '#c792ea' : '#565575',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: favorites.length > 0 ? '0 0 12px rgba(199,146,234,0.15)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 40,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(199,146,234,0.5)'
          e.currentTarget.style.color = '#c792ea'
          e.currentTarget.style.boxShadow = '0 0 16px rgba(199,146,234,0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = favorites.length > 0 ? 'rgba(199,146,234,0.4)' : 'rgba(255,255,255,0.08)'
          e.currentTarget.style.color = favorites.length > 0 ? '#c792ea' : '#565575'
          e.currentTarget.style.boxShadow = favorites.length > 0 ? '0 0 12px rgba(199,146,234,0.15)' : 'none'
        }}
        title="Style favorites"
        aria-label="Open style favorites"
      >
        <Heart size={18} fill={favorites.length > 0 ? '#c792ea' : 'none'} />
        {favorites.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#c792ea',
            color: '#0c0c14',
            fontSize: '0.5rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...mono,
          }}>
            {favorites.length}
          </span>
        )}
      </button>

      {/* Panel overlay */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '40px',
            width: '340px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 120px)',
            background: '#0c0c14',
            border: '1px solid rgba(199,146,234,0.2)',
            borderRadius: '12px',
            boxShadow: '0 0 0 1px rgba(199,146,234,0.1), 0 16px 48px rgba(0,0,0,0.5), 0 0 24px rgba(199,146,234,0.08)',
            zIndex: 51,
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={14} fill="#c792ea" style={{ color: '#c792ea' }} />
              <span style={{ ...mono, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', color: '#c3cee3' }}>FAVORITES</span>
              <span style={{ ...mono, fontSize: '0.5625rem', color: '#3b3f54', marginLeft: '4px' }}>{favorites.length}/{STYLES.length}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                color: '#565575',
                cursor: 'pointer',
                padding: '2px 6px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Close favorites"
            >
              <X size={12} />
            </button>
          </div>

          {/* Style list */}
          <div style={{ padding: '8px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            {STYLES.map((s) => {
              const fav = isFav(s.key)
              return (
                <div
                  key={s.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-out',
                    background: fav ? `${s.accent}08` : 'transparent',
                    border: fav ? `1px solid ${s.accent}15` : '1px solid transparent',
                    marginBottom: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${s.accent}10`
                    e.currentTarget.style.borderColor = `${s.accent}25`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = fav ? `${s.accent}08` : 'transparent'
                    e.currentTarget.style.borderColor = fav ? `${s.accent}15` : 'transparent'
                  }}
                  onClick={() => {
                    onSelectStyle(s.key)
                    setOpen(false)
                  }}
                >
                  {/* Heart toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(s.key)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      color: fav ? s.accent : '#3b3f54',
                      transition: 'color 0.15s ease-out',
                    }}
                    aria-label={fav ? `Remove ${s.label} from favorites` : `Add ${s.label} to favorites`}
                  >
                    <Heart size={14} fill={fav ? s.accent : 'none'} />
                  </button>

                  {/* Accent dot */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: s.accent,
                    boxShadow: fav ? `0 0 6px ${s.accent}40` : 'none',
                    opacity: fav ? 1 : 0.5,
                    transition: 'all 0.15s ease-out',
                  }} />

                  {/* Style info */}
                  <div style={{ flex: 1 }}>
                    <span style={{ ...mono, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', color: fav ? s.accent : '#8b8b9e' }}>{s.label}</span>
                  </div>

                  {/* Key badge */}
                  <span style={{
                    ...mono,
                    fontSize: '0.5rem',
                    color: '#3b3f54',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '2px',
                    padding: '1px 5px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {STYLES.indexOf(s) + 1}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Footer hint */}
          <div style={{
            padding: '8px 16px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            ...mono,
            fontSize: '0.5rem',
            color: '#3b3f54',
            letterSpacing: '0.06em',
            textAlign: 'center',
          }}>
            CLICK HEART TO TOGGLE | CLICK STYLE TO SWITCH
          </div>
        </div>
      )}
    </>
  )
}
