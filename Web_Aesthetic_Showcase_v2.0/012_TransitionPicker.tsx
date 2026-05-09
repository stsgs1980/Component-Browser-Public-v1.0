// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 270

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { mono } from '@/lib/style-constants'

const TRANSITION_STORAGE_KEY = 'zai-transition-type'

type TransitionType = 'fade' | 'slideUp' | 'slideLeft' | 'scale' | 'flip' | 'glitch'

const TRANSITIONS: { key: TransitionType; label: string; desc: string }[] = [
  { key: 'fade', label: 'Fade', desc: 'Simple opacity fade' },
  { key: 'slideUp', label: 'Slide Up', desc: 'Slide up with fade' },
  { key: 'slideLeft', label: 'Slide Left', desc: 'Slide from right to left' },
  { key: 'scale', label: 'Scale', desc: 'Scale up from center' },
  { key: 'flip', label: 'Flip', desc: '3D flip effect' },
  { key: 'glitch', label: 'Glitch', desc: 'Glitch-style transition' },
]

function readTransition(): TransitionType {
  if (typeof window === 'undefined') return 'fade'
  try {
    const raw = localStorage.getItem(TRANSITION_STORAGE_KEY)
    if (raw && TRANSITIONS.some(t => t.key === raw)) return raw as TransitionType
  } catch { /* ignore */ }
  return 'fade'
}

function getPreviewAnimation(type: TransitionType): React.CSSProperties {
  const base: React.CSSProperties = {
    width: '80px',
    height: '48px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #c792ea, #89b4fa)',
  }
  switch (type) {
    case 'fade':
      return { ...base, animation: 'blink 2s ease-in-out infinite' }
    case 'slideUp':
      return { ...base, animation: 'fadeInUp 2s ease-in-out infinite' }
    case 'slideLeft':
      return { ...base, animation: 'previewSlideLeft 2s ease-in-out infinite' }
    case 'scale':
      return { ...base, animation: 'previewScale 2s ease-in-out infinite' }
    case 'flip':
      return { ...base, animation: 'previewFlip 2s ease-in-out infinite' }
    case 'glitch':
      return { ...base, animation: 'previewGlitch 2s ease-in-out infinite' }
    default:
      return base
  }
}

export default function TransitionPicker() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TransitionType>('fade')
  const panelRef = useRef<HTMLDivElement>(null)

  /* Read persisted transition when panel opens */
  const handleOpen = useCallback(() => {
    const stored = readTransition()
    setSelected(stored)
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

  const selectTransition = (type: TransitionType) => {
    setSelected(type)
    localStorage.setItem(TRANSITION_STORAGE_KEY, type)
    window.dispatchEvent(new CustomEvent('zai-set-transition', { detail: type }))
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => open ? setOpen(false) : handleOpen()}
        className="fab-button"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '140px',
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(12,12,20,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#565575',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 40,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(137,180,250,0.5)'
          e.currentTarget.style.color = '#89b4fa'
          e.currentTarget.style.boxShadow = '0 0 16px rgba(137,180,250,0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.color = '#565575'
          e.currentTarget.style.boxShadow = 'none'
        }}
        title="Transition effects"
        aria-label="Choose transition effect"
      >
        <Sparkles size={18} />
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
            left: '80px',
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            background: '#0c0c14',
            border: '1px solid rgba(137,180,250,0.2)',
            borderRadius: '12px',
            boxShadow: '0 0 0 1px rgba(137,180,250,0.1), 0 16px 48px rgba(0,0,0,0.5), 0 0 24px rgba(137,180,250,0.08)',
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
              <Sparkles size={14} style={{ color: '#89b4fa' }} />
              <span style={{ ...mono, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', color: '#c3cee3' }}>TRANSITIONS</span>
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
              aria-label="Close transitions"
            >
              <X size={12} />
            </button>
          </div>

          {/* Transition list */}
          <div style={{ padding: '8px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            {TRANSITIONS.map((t) => {
              const isActive = selected === t.key
              return (
                <div
                  key={t.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-out',
                    background: isActive ? 'rgba(137,180,250,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(137,180,250,0.2)' : '1px solid transparent',
                    marginBottom: '2px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(137,180,250,0.05)'
                      e.currentTarget.style.borderColor = 'rgba(137,180,250,0.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }
                  }}
                  onClick={() => selectTransition(t.key)}
                >
                  {/* Indicator dot */}
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isActive ? '#89b4fa' : '#3b3f54',
                    boxShadow: isActive ? '0 0 8px rgba(137,180,250,0.4)' : 'none',
                    transition: 'all 0.15s ease-out',
                    flexShrink: 0,
                  }} />

                  {/* Text info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ ...mono, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', color: isActive ? '#89b4fa' : '#8b8b9e' }}>{t.label}</div>
                    <div style={{ ...mono, fontSize: '0.5rem', color: '#3b3f54', marginTop: '2px', letterSpacing: '0.02em' }}>{t.desc}</div>
                  </div>

                  {/* Preview */}
                  <div style={{ perspective: '200px', flexShrink: 0 }}>
                    <div style={getPreviewAnimation(t.key)} />
                  </div>
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
            CLICK TO SELECT TRANSITION EFFECT
          </div>
        </div>
      )}
    </>
  )
}
