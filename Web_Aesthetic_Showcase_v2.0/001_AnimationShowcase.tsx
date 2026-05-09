// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 353

'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, X } from 'lucide-react'

/* ----------------------------------------------------------------------
   ANIMATION SHOWCASE
   Demonstrates all available CSS animations with live previews.
   Floating trigger button + modal overlay with Code Art aesthetic.
   ---------------------------------------------------------------------- */

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

interface AnimationEntry {
  name: string
  cssName: string
  description: string
  category: 'entrance' | 'loop' | 'hover' | 'utility'
  previewStyle: React.CSSProperties
  previewContent: string
}

const ANIMATIONS: AnimationEntry[] = [
  {
    name: 'Fade In Up',
    cssName: 'fadeInUp',
    description: 'Page transition -- fade + slide up',
    category: 'entrance',
    previewStyle: { animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) infinite alternate' },
    previewContent: 'Aa',
  },
  {
    name: 'Scale In',
    cssName: 'scaleIn',
    description: 'Pop in from small with spring easing',
    category: 'entrance',
    previewStyle: { animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) infinite alternate' },
    previewContent: '{}',
  },
  {
    name: 'Slide Left',
    cssName: 'slideInLeft',
    description: 'Slide in from left edge',
    category: 'entrance',
    previewStyle: { animation: 'slideInLeft 0.4s ease-out infinite alternate' },
    previewContent: '<<',
  },
  {
    name: 'Slide Right',
    cssName: 'slideInRight',
    description: 'Slide in from right edge',
    category: 'entrance',
    previewStyle: { animation: 'slideInRight 0.4s ease-out infinite alternate' },
    previewContent: '>>',
  },
  {
    name: 'Rotate In',
    cssName: 'rotateIn',
    description: 'Spin in from rotated state',
    category: 'entrance',
    previewStyle: { animation: 'rotateIn 0.5s ease-out infinite alternate' },
    previewContent: '*',
  },
  {
    name: 'Float Badge',
    cssName: 'floatBadge',
    description: 'Gentle floating for action buttons',
    category: 'loop',
    previewStyle: { animation: 'floatBadge 3s ease-in-out infinite' },
    previewContent: '+',
  },
  {
    name: 'Glow Pulse',
    cssName: 'glowPulse',
    description: 'Subtle box-shadow glow cycle',
    category: 'loop',
    previewStyle: { animation: 'glowPulse 2s ease-in-out infinite', boxShadow: '0 0 4px #c792ea' },
    previewContent: '///',
  },
  {
    name: 'Shimmer',
    cssName: 'shimmer',
    description: 'Loading skeleton shimmer effect',
    category: 'loop',
    previewStyle: { background: 'linear-gradient(90deg, rgba(199,146,234,0.1) 25%, rgba(199,146,234,0.3) 50%, rgba(199,146,234,0.1) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s ease-in-out infinite' },
    previewContent: '   ',
  },
  {
    name: 'Typing Cursor',
    cssName: 'heroTypingCursor',
    description: 'Blinking cursor for code editors',
    category: 'loop',
    previewStyle: { width: '2px', height: '1em', background: '#c792ea', display: 'inline-block', animation: 'heroTypingCursor 0.6s step-end infinite' },
    previewContent: '',
  },
  {
    name: 'Pulse Ring',
    cssName: 'heroPulseRing',
    description: 'Expanding ring from center',
    category: 'loop',
    previewStyle: { border: '2px solid #c792ea', borderRadius: '50%', animation: 'heroPulseRing 2.5s ease-out infinite' },
    previewContent: '',
  },
  {
    name: 'Gradient Shift',
    cssName: 'gradientShift',
    description: 'Animated gradient background',
    category: 'loop',
    previewStyle: { background: 'linear-gradient(135deg, #c792ea, #89b4fa, #a6e3a1)', backgroundSize: '200% 200%', animation: 'gradientShift 6s ease-in-out infinite' },
    previewContent: '',
  },
  {
    name: 'Card Hover Lift',
    cssName: 'card-hover-lift',
    description: 'Lift card on hover with shadow',
    category: 'hover',
    previewStyle: {},
    previewContent: 'HOVER',
  },
  {
    name: 'Press Effect',
    cssName: 'press-effect',
    description: 'Scale down on active/press',
    category: 'hover',
    previewStyle: {},
    previewContent: 'PRESS',
  },
  {
    name: 'Dot Pulse',
    cssName: 'footerDotPulse',
    description: 'Scaling dot with opacity pulse',
    category: 'loop',
    previewStyle: { width: '8px', height: '8px', borderRadius: '50%', background: '#c792ea', animation: 'footerDotPulse 2s ease-in-out infinite' },
    previewContent: '',
  },
  {
    name: 'Ripple Effect',
    cssName: 'rippleEffect',
    description: 'Expanding circle ripple from center',
    category: 'utility',
    previewStyle: { border: '2px solid #c792ea', borderRadius: '50%', animation: 'rippleEffect 0.6s ease-out infinite' },
    previewContent: '',
  },
]

const CATEGORIES = [
  { key: 'all', label: 'ALL' },
  { key: 'entrance', label: 'ENTRANCE' },
  { key: 'loop', label: 'LOOP' },
  { key: 'hover', label: 'HOVER' },
  { key: 'utility', label: 'UTILITY' },
] as const

export default function AnimationShowcase() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [playingAnimation, setPlayingAnimation] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  /* --- External trigger --- */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('zai-open-animations', handleOpen)
    return () => window.removeEventListener('zai-open-animations', handleOpen)
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

  const filteredAnimations = activeCategory === 'all'
    ? ANIMATIONS
    : ANIMATIONS.filter((a) => a.category === activeCategory)

  return (
    <>
      {/* --- Floating Trigger Button --- */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          bottom: '80px',
          left: '50%',
          transform: 'translateX(40px)',
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
        aria-label="Animation showcase"
        title="Animation showcase (S)"
      >
        <Sparkles size={16} />
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
            className="w-full max-w-3xl mx-4 flex flex-col rounded-xl overflow-hidden"
            style={{
              background: '#0c0c14',
              border: '1px solid rgba(199,146,234,0.2)',
              boxShadow: '0 0 40px rgba(199,146,234,0.08), 0 24px 48px rgba(0,0,0,0.5)',
              animation: 'export-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              maxHeight: '85vh',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Animation showcase"
          >
            {/* -- Header -- */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(199,146,234,0.1)' }}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} style={{ color: '#c792ea' }} />
                <span style={{ ...mono, fontSize: '0.8125rem', fontWeight: 700, color: '#c792ea', letterSpacing: '0.08em' }}>
                  ANIMATIONS
                </span>
                <span style={{ ...mono, fontSize: '0.5625rem', color: '#565575', background: 'rgba(199,146,234,0.08)', borderRadius: '3px', padding: '1px 6px', border: '1px solid rgba(199,146,234,0.12)' }}>
                  {ANIMATIONS.length}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-md transition-colors"
                style={{ width: '32px', height: '32px', background: 'rgba(199,146,234,0.08)', border: '1px solid rgba(199,146,234,0.15)', color: '#c792ea', cursor: 'pointer' }}
                aria-label="Close animation showcase"
              >
                <X size={14} />
              </button>
            </div>

            {/* -- Category Filter Tabs -- */}
            <div className="flex items-center gap-1 px-5 pt-3 shrink-0" style={{ ...mono, fontSize: '0.5625rem', letterSpacing: '0.06em' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className="px-2.5 py-1.5 rounded-md transition-all duration-200"
                  style={{
                    background: activeCategory === cat.key ? 'rgba(199,146,234,0.12)' : 'transparent',
                    border: activeCategory === cat.key ? '1px solid rgba(199,146,234,0.25)' : '1px solid transparent',
                    color: activeCategory === cat.key ? '#c792ea' : '#565575',
                    cursor: 'pointer',
                    fontWeight: activeCategory === cat.key ? 600 : 400,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* -- Animation Grid -- */}
            <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(199,146,234,0.2) transparent' }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredAnimations.map((anim) => {
                  const isHover = anim.category === 'hover'
                  const isActive = playingAnimation === anim.cssName
                  return (
                    <button
                      key={anim.cssName}
                      onClick={() => {
                        if (anim.category === 'hover') return
                        setPlayingAnimation(isActive ? null : anim.cssName)
                        if (!isActive) setTimeout(() => setPlayingAnimation(null), 2000)
                      }}
                      className="flex flex-col items-center gap-2.5 p-3 rounded-lg transition-all duration-200 text-center"
                      style={{
                        background: isActive ? 'rgba(199,146,234,0.06)' : '#141420',
                        border: isActive ? '1px solid rgba(199,146,234,0.25)' : '1px solid rgba(199,146,234,0.08)',
                        cursor: isHover ? 'default' : 'pointer',
                      }}
                    >
                      {/* Preview box */}
                      <div
                        className={isHover ? (anim.cssName === 'card-hover-lift' ? 'card-hover-lift' : 'press-effect') : ''}
                        style={{
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          background: 'rgba(199,146,234,0.06)',
                          border: '1px solid rgba(199,146,234,0.1)',
                          ...anim.previewStyle,
                        }}
                      >
                        <span style={{ ...mono, fontSize: '0.75rem', fontWeight: 700, color: '#c792ea' }}>
                          {anim.previewContent}
                        </span>
                      </div>

                      {/* Name */}
                      <div>
                        <div style={{ ...mono, fontSize: '0.5625rem', fontWeight: 700, color: '#c792ea', letterSpacing: '0.04em' }}>
                          {anim.name}
                        </div>
                        <div style={{ ...mono, fontSize: '0.5rem', color: '#565575', marginTop: '1px', lineHeight: 1.3 }}>
                          {anim.cssName}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* -- Footer -- */}
            <div
              className="flex items-center justify-center px-5 py-3 shrink-0"
              style={{ borderTop: '1px solid rgba(199,146,234,0.08)' }}
            >
              <span style={{ ...mono, fontSize: '0.5625rem', letterSpacing: '0.1em', color: '#565575' }}>
                ESC to close | Click to preview | S to open
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
