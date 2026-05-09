// Project: Web Aesthetic Showcase v2.0
// Category: app
// Source: showcases\Web Aesthetic Showcase v2.0\src\app
// Lines: 809

'use client'

import { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from 'react'
import { Shuffle, Play, Pause, Share2 } from 'lucide-react'
import TokenInspector from '@/components/token-inspector'
import StyleComparison from '@/components/style-comparison'
import StyleLegend from '@/components/style-legend'
import StyleHistory from '@/components/style-history'
import KeyboardHelp from '@/components/keyboard-help'
import StyleExport from '@/components/style-export'
import StylePlayground from '@/components/style-playground'
import AnimationShowcase from '@/components/animation-showcase'
import StyleStats, { recordStyleView } from '@/components/style-stats'
import StyleFavorites from '@/components/style-favorites'
import TransitionPicker from '@/components/transition-picker'
import BrutalistPage from '@/components/styles/brutalist-page'
import RetroPage from '@/components/styles/retro-page'
import CliPage from '@/components/styles/cli-page'
import SciFiPage from '@/components/styles/scifi-page'
import CodeArtPage from '@/components/styles/codeart-page'
import CleanModernPage from '@/components/styles/clean-modern-page'
import { mono, sans, STYLES } from '@/lib/style-constants'
import { type StyleKey } from '@/lib/style-constants'

/* -----------------------------------------------------------------------
   MAIN PAGE -- Style Switcher
   ----------------------------------------------------------------------- */

/* -- Hydration-safe style store via useSyncExternalStore -- */
const STORAGE_KEY = 'zai-active-style'
const DEFAULT_STYLE: StyleKey = 'retro'

/* Module-level cached style + listeners for same-tab updates */
let cachedStyle: StyleKey | null = null
const styleListeners = new Set<() => void>()

function initCachedStyle(): StyleKey {
  if (typeof window === 'undefined') return DEFAULT_STYLE
  if (cachedStyle !== null) return cachedStyle
  try {
    const params = new URLSearchParams(window.location.search)
    const styleParam = params.get('style')
    if (styleParam && STYLES.some(s => s.key === styleParam)) {
      cachedStyle = styleParam as StyleKey
      return cachedStyle
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && STYLES.some(s => s.key === saved)) {
      cachedStyle = saved as StyleKey
      return cachedStyle
    }
  } catch { /* ignore */ }
  cachedStyle = DEFAULT_STYLE
  return cachedStyle
}

function getStyleSnapshot(): StyleKey {
  return cachedStyle ?? initCachedStyle()
}

function getStyleServerSnapshot(): StyleKey {
  return DEFAULT_STYLE
}

function subscribeStyle(callback: () => void): () => void {
  styleListeners.add(callback)
  /* Also listen for cross-tab storage events */
  const onStorage = () => {
    cachedStyle = null // invalidate cache so next getSnapshot re-reads
    callback()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    styleListeners.delete(callback)
    window.removeEventListener('storage', onStorage)
  }
}

function setStyleInStore(key: StyleKey) {
  cachedStyle = key
  try { localStorage.setItem(STORAGE_KEY, key) } catch { /* ignore */ }
  styleListeners.forEach(l => l())
}

export default function Home() {
  const persistedStyle = useSyncExternalStore(
    subscribeStyle,
    getStyleSnapshot,
    getStyleServerSnapshot,
  )
  const [localStyle, setLocalStyle] = useState<StyleKey | null>(null)
  const activeStyle = localStyle ?? persistedStyle
  const [transitionKey, setTransitionKey] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [styleHistory, setStyleHistory] = useState<{ key: StyleKey; timestamp: number }[]>([])
  const [legendTrigger, setLegendTrigger] = useState(0)
  const [tokenTrigger, setTokenTrigger] = useState(0)
  const [helpTrigger, setHelpTrigger] = useState(0)
  const [autoCycle, setAutoCycle] = useState(false)
  const [autoCycleInterval, setAutoCycleInterval] = useState(5000)
  const [toastStyle, setToastStyle] = useState<StyleKey | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* -- Scroll progress tracking -- */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* -- Save style on change -- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeStyle)
  }, [activeStyle])

  const switchStyle = useCallback((key: StyleKey) => {
    if (key !== activeStyle) {
      setLocalStyle(key)
      setTransitionKey((p) => p + 1)
      setStyleHistory((prev) => [...prev, { key, timestamp: Date.now() }])
    }
    /* Record style view for stats */
    recordStyleView(key)
    /* Update URL query param */
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('style', key)
      window.history.replaceState({}, '', url.pathname + url.search)
    }
    /* Show style change toast */
    setToastStyle(key)
    setToastVisible(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 1500)
    switcherRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeStyle])

  /* -- Random style picker -- */
  const randomizeStyle = useCallback(() => {
    const otherStyles = STYLES.filter((s) => s.key !== activeStyle)
    const random = otherStyles[Math.floor(Math.random() * otherStyles.length)]
    switchStyle(random.key)
  }, [activeStyle, switchStyle])

  /* -- Keyboard shortcuts: 1-6, r, h, l, t -- */
  useEffect(() => {
    const keyMap: Record<string, StyleKey> = {
      '1': 'retro',
      '2': 'cli',
      '3': 'codeart',
      '4': 'modern',
      '5': 'brutalist',
      '6': 'scifi',
    }
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (keyMap[e.key]) {
        e.preventDefault()
        switchStyle(keyMap[e.key])
        return
      }
      const k = e.key.toLowerCase()
      if (k === 'r') {
        e.preventDefault()
        randomizeStyle()
        return
      }
      if (k === 'h') {
        e.preventDefault()
        setHelpTrigger((p) => p + 1)
        return
      }
      if (k === 'l') {
        e.preventDefault()
        setLegendTrigger((p) => p + 1)
        return
      }
      if (k === 't') {
        e.preventDefault()
        setTokenTrigger((p) => p + 1)
        return
      }
      if (k === 'e') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('zai-open-export'))
        return
      }
      if (k === 'a') {
        e.preventDefault()
        setAutoCycle(p => !p)
        return
      }
      if (k === 'p') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('zai-open-playground'))
        return
      }
      if (k === 's') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('zai-open-animations'))
        return
      }
      if (k === 'd') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('zai-open-stats'))
        return
      }
      if (e.key === '?') {
        e.preventDefault()
        setHelpTrigger(p => p + 1)
        return
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        setAutoCycleInterval(p => Math.min(p + 1000, 15000))
        return
      }
      if (e.key === '-') {
        e.preventDefault()
        setAutoCycleInterval(p => Math.max(p - 1000, 2000))
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [switchStyle, randomizeStyle])

  /* -- Auto-cycle through styles -- */
  useEffect(() => {
    if (!autoCycle) return
    const timer = setInterval(() => {
      const currentIndex = STYLES.findIndex(s => s.key === activeStyle)
      const nextIndex = (currentIndex + 1) % STYLES.length
      switchStyle(STYLES[nextIndex].key)
    }, autoCycleInterval)
    return () => clearInterval(timer)
  }, [autoCycle, activeStyle, autoCycleInterval, switchStyle])

  const ActivePage = useMemo(() => {
    switch (activeStyle) {
      case 'retro': return <RetroPage />
      case 'cli': return <CliPage />
      case 'codeart': return <CodeArtPage />
      case 'modern': return <CleanModernPage />
      case 'brutalist': return <BrutalistPage />
      case 'scifi': return <SciFiPage />
    }
  }, [activeStyle])

  const currentMeta = STYLES.find((s) => s.key === activeStyle)!

  const isLight = activeStyle === 'brutalist' || activeStyle === 'modern'

  return (
    <div className="min-h-screen flex flex-col" style={{ ...sans }}>

      {/* --- Skip to Content (accessibility) --- */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* --- Style Change Toast --- */}
      {toastVisible && toastStyle && (() => {
        const meta = STYLES.find((s) => s.key === toastStyle)!
        return (
          <div
            className="fixed top-4 left-1/2 z-[70] pointer-events-none"
            style={{
              transform: `translateX(-50%) translateY(${toastVisible ? '0' : '-12px'})`,
              opacity: toastVisible ? 1 : 0,
              transition: 'transform 0.25s ease-out, opacity 0.25s ease-out',
            }}
          >
            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg"
              style={{
                background: 'rgba(12,12,20,0.85)',
                border: `1px solid ${meta.accent}40`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: `0 0 16px ${meta.accent}15, 0 8px 32px rgba(0,0,0,0.4)`,
                ...mono,
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: '#c3cee3',
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.accent, boxShadow: `0 0 8px ${meta.accent}50` }} />
              <span>{meta.label}</span>
            </div>
          </div>
        )
      })()}

      {/* --- Scroll Progress Bar --- */}
      <div
        className="fixed top-0 left-0 z-[60] pointer-events-none"
        style={{
          height: '3px',
          width: `${scrollProgress * 100}%`,
          background: currentMeta.accent,
          boxShadow: `0 0 8px ${currentMeta.accent}60`,
          transition: 'width 0.1s ease-out',
        }}
      />

      {/* ---------------------------------------------------------------
          HERO LANDING -- Code Art themed
          --------------------------------------------------------------- */}
      <section className="relative flex flex-col items-center justify-center text-center overflow-hidden" style={{
        minHeight: '100vh',
        background: '#0c0c14',
        padding: '4rem 1.5rem 3rem',
      }}>
        {/* Background: grid + radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          animation: 'heroGridPulse 6s ease-in-out infinite',
        }} />
        {/* Noise/grain texture overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(199,146,234,0.08) 0%, transparent 70%)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 40% 30% at 70% 60%, rgba(137,180,250,0.06) 0%, transparent 70%)',
        }} />

        {/* Glowing orbs */}
        <div className="absolute pointer-events-none" style={{ top: '18%', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,146,234,0.08) 0%, transparent 70%)', animation: 'heroOrbPulse 6s ease-in-out infinite' }} />
        <div className="absolute pointer-events-none" style={{ top: '45%', right: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(137,180,250,0.07) 0%, transparent 70%)', animation: 'heroOrbPulse 6s ease-in-out infinite 2s' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '15%', left: '35%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(166,227,161,0.06) 0%, transparent 70%)', animation: 'heroOrbPulse 6s ease-in-out infinite 4s' }} />

        {/* Morphing organic blob -- decorative accent */}
        <div className="absolute pointer-events-none" style={{ top: '30%', right: '20%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(199,146,234,0.06) 0%, rgba(137,180,250,0.03) 50%, transparent 70%)', animation: 'morphBlob 12s ease-in-out infinite', opacity: 0.5 }} />
        <div className="absolute pointer-events-none" style={{ bottom: '25%', left: '15%', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(166,227,161,0.05) 0%, rgba(199,146,234,0.03) 50%, transparent 70%)', animation: 'morphBlob 10s ease-in-out infinite 3s', opacity: 0.4 }} />

        {/* Floating particles */}
        <div className="absolute pointer-events-none" style={{ top: '15%', left: '12%', width: '4px', height: '4px', borderRadius: '50%', background: '#c792ea', animation: 'heroFloat1 8s ease-in-out infinite' }} />
        <div className="absolute pointer-events-none" style={{ top: '25%', right: '18%', width: '3px', height: '3px', borderRadius: '50%', background: '#89b4fa', animation: 'heroFloat2 10s ease-in-out infinite' }} />
        <div className="absolute pointer-events-none" style={{ top: '60%', left: '8%', width: '3px', height: '3px', borderRadius: '50%', background: '#a6e3a1', animation: 'heroFloat3 12s ease-in-out infinite' }} />
        <div className="absolute pointer-events-none" style={{ top: '35%', right: '10%', width: '5px', height: '5px', borderRadius: '50%', background: '#c792ea', animation: 'heroFloat2 9s ease-in-out infinite 1s', opacity: 0.4 }} />
        <div className="absolute pointer-events-none" style={{ top: '70%', left: '25%', width: '3px', height: '3px', borderRadius: '50%', background: '#89b4fa', animation: 'heroFloat1 11s ease-in-out infinite 2s', opacity: 0.3 }} />
        <div className="absolute pointer-events-none" style={{ top: '20%', left: '50%', width: '4px', height: '4px', borderRadius: '50%', background: '#a6e3a1', animation: 'heroFloat3 7s ease-in-out infinite 0.5s', opacity: 0.35 }} />
        <div className="absolute pointer-events-none" style={{ top: '80%', right: '30%', width: '3px', height: '3px', borderRadius: '50%', background: '#f0c020', animation: 'heroFloat1 13s ease-in-out infinite 3s', opacity: 0.25 }} />

        {/* Connection lines between particles */}
        <svg className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
          <line x1="12%" y1="15%" x2="50%" y2="20%" stroke="#c792ea" strokeWidth="0.5" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="50%" y1="20%" x2="82%" y2="25%" stroke="#89b4fa" strokeWidth="0.5" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="2.5s" repeatCount="indefinite" />
          </line>
          <line x1="8%" y1="60%" x2="25%" y2="70%" stroke="#a6e3a1" strokeWidth="0.5" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="3s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Floating code snippets */}
        <div className="absolute pointer-events-none" style={{ top: '22%', left: '6%', ...mono, fontSize: '0.6875rem', color: '#3b3f54', animation: 'heroFloat4 14s ease-in-out infinite', opacity: 0.2 }}>{'// design'}</div>
        <div className="absolute pointer-events-none" style={{ top: '50%', right: '7%', ...mono, fontSize: '0.6875rem', color: '#3b3f54', animation: 'heroFloat5 16s ease-in-out infinite 2s', opacity: 0.18 }}>{'{ style }'}</div>
        <div className="absolute pointer-events-none" style={{ top: '75%', left: '14%', ...mono, fontSize: '0.6875rem', color: '#3b3f54', animation: 'heroFloat4 18s ease-in-out infinite 4s', opacity: 0.15 }}>{'<Aesthetic />'}</div>

        {/* Content -- z-10 above particles */}
        <div className="relative z-10 flex flex-col items-center" style={{ animation: 'heroSlideUp 0.8s ease-out' }}>

          {/* Top label */}
          <div className="flex items-center gap-2" style={{ ...mono, fontSize: '0.75rem', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <span style={{ color: '#c792ea' }}>{'//'}</span>
            <span>Web Aesthetic Showcase <span style={{ color: '#c792ea', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', verticalAlign: 'super', marginLeft: '2px' }}>v2.0</span></span>
          </div>

          {/* Main heading: "Code is Visual." with gradient text */}
          <h1 className="glow-breath" style={{
            ...mono,
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginTop: '2rem',
            background: 'linear-gradient(135deg, #c792ea 0%, #89b4fa 50%, #a6e3a1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Code is Visual.
          </h1>

          {/* Subtitle with shimmer effect */}
          <p style={{
            ...sans,
            fontSize: 'clamp(0.875rem, 1.4vw, 1.0625rem)',
            lineHeight: 1.7,
            maxWidth: '560px',
            marginTop: '1.5rem',
            background: 'linear-gradient(90deg, #6b6b80 0%, #9b9bb0 40%, #c792ea 50%, #9b9bb0 60%, #6b6b80 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerText 3s ease-in-out infinite',
          }}>
            6 styles for web projects -- from CRT terminals to glitch aesthetics
          </p>

          {/* Animated import statement -- glassmorphism card */}
          <div className="mt-8 px-5 py-3.5 rounded-lg gradient-border-animate" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 0 0 1px rgba(199,146,234,0.05), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
            ...mono,
            fontSize: 'clamp(0.6875rem, 1.2vw, 0.8125rem)',
            lineHeight: 2,
            color: '#6b6b80',
            textAlign: 'left',
            maxWidth: '100%',
            overflowX: 'auto',
          }}>
            <div>
              <span style={{ color: '#c792ea' }}>import</span>
              {' \u007B '}
              <span style={{ color: '#f0c020' }}>Terminal</span>
              {', '}
              <span style={{ color: '#89b4fa' }}>CLI</span>
              {', '}
              <span style={{ color: '#c792ea' }}>CodeArt</span>
              {', '}
              <span style={{ color: '#a6e3a1' }}>Modern</span>
              {', '}
              <span style={{ color: '#ff6666' }}>Brutal</span>
              {', '}
              <span style={{ color: '#00f0ff' }}>SciFi</span>
              {' \u007D '}
              <span style={{ color: '#c792ea' }}>from</span>
              {' '}
              <span style={{ color: '#a6e3a1' }}>{'"@zai/aesthetics"'}</span>
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '1em',
                background: '#c792ea',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
                animation: 'heroTypingCursor 0.6s step-end infinite',
              }} />
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 mt-6" style={{ ...mono, fontSize: '0.625rem', letterSpacing: '0.1em', color: '#3b3f54' }}>
            {[
              { label: 'STYLES', value: '6' },
              { label: 'TOKENS', value: '48+' },
              { label: 'SHORTCUTS', value: '12' },
              { label: 'ANIMATIONS', value: '15+' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-1.5">
                <span style={{ color: '#c792ea', fontWeight: 700 }}>{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Style preview pills with accent dots */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {STYLES.map((s, i) => (
              <div
                key={s.key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: s.accent, boxShadow: `0 0 6px ${s.accent}40` }} />
                <span style={{ ...mono, fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.08em', color: '#8b8b9e' }}>{s.pill}</span>
                <span style={{ ...mono, fontSize: '0.5rem', color: '#3b3f54', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', padding: '0 4px', lineHeight: '1.6' }}>{i + 1}</span>
              </div>
            ))}
          </div>

          {/* Keyboard hint */}
          <div className="flex items-center gap-2 mt-4" style={{ ...mono, fontSize: '0.5625rem', color: '#3b3f54', letterSpacing: '0.1em' }}>
            <span className="relative" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '3px', padding: '1px 6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              KBD
              <span className="absolute inset-0" style={{ borderRadius: '3px', border: '1px solid rgba(199,146,234,0.3)', animation: 'heroPulseRing 2.5s ease-out infinite' }} />
            </span>
            <span>PRESS 1-6 TO SWITCH</span>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="flex flex-col items-center gap-1.5 mt-auto pt-10 relative z-10 float-y" style={{ ...mono, fontSize: '0.5625rem', color: '#3b3f54', letterSpacing: '0.2em' }}>
          <span>SCROLL DOWN</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'heroChevron 2s ease-in-out infinite' }}>
            <path d="M4 6L8 10L12 6" stroke="#c792ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* --- Style Switcher Section --- */}
      <nav ref={switcherRef} aria-label="Style switcher" className="flex-1 flex flex-col" style={{ ...sans }}>
      {/* --- Fixed Header with Style Switcher --- */}
      <header className="w-full sticky top-0 z-50 shrink-0" style={{
        background: isLight ? (activeStyle === 'brutalist' ? 'rgba(240,240,240,0.92)' : 'rgba(250,250,250,0.92)') : 'rgba(12,12,20,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isLight ? '1px solid #e5e5e5' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isLight ? 'none' : `0 1px 0 0 ${currentMeta.accent}20, 0 4px 16px rgba(0,0,0,0.2)`,
        height: '56px',
      }}>
        <div className="w-full h-full px-4 md:px-6 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-2 h-2 rounded-sm" style={{ background: currentMeta.accent, boxShadow: `0 0 8px ${currentMeta.accent}50` }} />
            <span className="hidden sm:inline" style={{ ...mono, fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.04em', color: isLight ? '#171717' : '#c3cee3' }}>Web Aesthetic Showcase <span style={{ fontSize: '0.6rem', color: currentMeta.accent, fontWeight: 700, letterSpacing: '0.08em', verticalAlign: 'super', marginLeft: '2px' }}>v2.0</span></span>
          </div>

          {/* Style pills -- scrollable on mobile */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max px-1">
              {STYLES.map((s) => {
                const isActive = activeStyle === s.key
                return (
                  <button
                    key={s.key}
                    onClick={() => switchStyle(s.key)}
                    className="relative px-3 py-1.5 rounded-md text-center transition-all duration-200 whitespace-nowrap group"
                    style={{
                      background: isActive ? `${s.accent}18` : 'transparent',
                      border: isActive ? `1px solid ${s.accent}35` : '1px solid transparent',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isActive ? `0 0 12px ${s.accent}25, 0 0 4px ${s.accent}15, 0 2px 0 0 ${s.accent}80` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = `${s.accent}0d`
                        e.currentTarget.style.boxShadow = `0 0 12px ${s.accent}20`
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                    aria-label={`Switch to ${s.label} style (key ${STYLES.indexOf(s) + 1})`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-1.5 h-1.5 rounded-full transition-opacity" style={{ background: s.accent, opacity: isActive ? 1 : 0.4, boxShadow: isActive ? `0 0 6px ${s.accent}50` : 'none' }} />
                        {isActive && (
                          <div className="absolute inset-0 w-1.5 h-1.5 rounded-full animate-ping" style={{ background: s.accent, opacity: 0.4 }} />
                        )}
                      </div>
                      <span style={{ ...mono, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', color: isActive ? s.accent : (isLight ? '#a3a3a3' : '#565575') }}>{s.pill}</span>
                    </div>
                  </button>
                )
              })}
              {/* Randomize button */}
              <button
                onClick={randomizeStyle}
                className="relative flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: isLight ? '#a3a3a3' : '#565575',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${currentMeta.accent}18`
                  e.currentTarget.style.borderColor = `${currentMeta.accent}35`
                  e.currentTarget.style.color = currentMeta.accent
                  e.currentTarget.style.boxShadow = `0 0 10px ${currentMeta.accent}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = isLight ? '#a3a3a3' : '#565575'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                title="Random style"
                aria-label="Switch to a random style"
              >
                <Shuffle size={13} />
              </button>
              {/* Auto-cycle Play/Pause button */}
              <button
                onClick={() => setAutoCycle(p => !p)}
                className="relative flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 group"
                style={{
                  background: autoCycle ? `${currentMeta.accent}18` : 'rgba(255,255,255,0.04)',
                  border: autoCycle ? `1px solid ${currentMeta.accent}35` : '1px solid rgba(255,255,255,0.08)',
                  color: autoCycle ? currentMeta.accent : (isLight ? '#a3a3a3' : '#565575'),
                  boxShadow: autoCycle ? `0 0 10px ${currentMeta.accent}20` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!autoCycle) {
                    e.currentTarget.style.background = `${currentMeta.accent}18`
                    e.currentTarget.style.borderColor = `${currentMeta.accent}35`
                    e.currentTarget.style.color = currentMeta.accent
                    e.currentTarget.style.boxShadow = `0 0 10px ${currentMeta.accent}20`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!autoCycle) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = isLight ? '#a3a3a3' : '#565575'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
                title="Auto-cycle (A)"
                aria-label="Toggle auto-cycle mode"
              >
                {autoCycle ? <Pause size={13} /> : <Play size={13} />}
              </button>
              {/* Share URL button */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?style=${activeStyle}`
                  navigator.clipboard.writeText(url).then(() => {
                    setShareToast(true)
                    setTimeout(() => setShareToast(false), 2000)
                  }).catch(() => {})
                }}
                className="relative flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: isLight ? '#a3a3a3' : '#565575',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${currentMeta.accent}18`
                  e.currentTarget.style.borderColor = `${currentMeta.accent}35`
                  e.currentTarget.style.color = currentMeta.accent
                  e.currentTarget.style.boxShadow = `0 0 10px ${currentMeta.accent}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = isLight ? '#a3a3a3' : '#565575'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                title="Share URL"
                aria-label="Copy share URL for current style"
              >
                <Share2 size={13} />
              </button>
              {/* KBD hint badge */}
              <span className="hidden sm:inline-flex items-center ml-1" style={{ ...mono, fontSize: '0.5rem', color: '#3b3f54', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', padding: '1px 5px', border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '0.08em' }}>1-6</span>
              {/* AUTO badge -- shown when auto-cycle is active */}
              {autoCycle && (
                <span
                  className="inline-flex items-center animate-pulse"
                  style={{
                    ...mono,
                    fontSize: '0.5rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: currentMeta.accent,
                    background: `${currentMeta.accent}15`,
                    borderRadius: '3px',
                    padding: '1px 5px',
                    border: `1px solid ${currentMeta.accent}30`,
                    marginLeft: '4px',
                  }}
                >
                  AUTO
                </span>
              )}
            </div>
          </div>

          {/* Style name */}
          <div className="hidden md:flex items-center shrink-0">
            <span style={{ ...mono, fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.04em', color: currentMeta.accent }}>{currentMeta.label}</span>
          </div>
        </div>
      </header>

      {/* --- Page Content --- */}
      <main id="main-content" key={transitionKey} className="flex-1 animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        {ActivePage}
      </main>

      {/* --- Footer -- Code Art aesthetic --- */}
      <footer className="w-full mt-auto shrink-0" style={{
        background: '#0c0c14',
      }}>
        {/* Animated gradient separator */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #c792ea60, #89b4fa60, #a6e3a160, transparent)',
          backgroundSize: '200% 100%',
          animation: 'footerGradientPulse 4s ease-in-out infinite',
        }} />
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(137,180,250,0.15), rgba(166,227,161,0.15), transparent)',
        }} />
        <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-center gap-1.5" style={{ ...mono, fontSize: '0.625rem', letterSpacing: '0.08em', color: '#3b3f54' }}>
          <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#c792ea', animation: 'footerDotPulse 2s ease-in-out infinite' }} />
          <span>{'// Web Aesthetic Showcase v2.0 | 6 styles | Interactive Demo'}</span>
          <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#89b4fa', animation: 'footerDotPulse 2s ease-in-out infinite 1s' }} />
        </div>
        <div className="px-6 pb-3 flex flex-wrap items-center justify-center gap-3" style={{ ...mono, fontSize: '0.5rem', letterSpacing: '0.08em', color: '#3b3f54' }}>
          {['GitHub', 'Docs', 'Tokens'].map((name) => (
            <span
              key={name}
              className="transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px', padding: '1px 8px', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#c792ea'
                e.currentTarget.style.borderColor = 'rgba(199,146,234,0.3)'
                e.currentTarget.style.boxShadow = '0 0 8px rgba(199,146,234,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3b3f54'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >{`{ ${name} }`}</span>
          ))}
          <span style={{ background: 'rgba(199,146,234,0.1)', border: '1px solid rgba(199,146,234,0.2)', borderRadius: '3px', padding: '1px 8px', color: '#c792ea' }}>v2.0</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="transition-all duration-200 ml-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px', padding: '1px 8px', cursor: 'pointer', color: '#3b3f54' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#89b4fa'
              e.currentTarget.style.borderColor = 'rgba(137,180,250,0.3)'
              e.currentTarget.style.boxShadow = '0 0 8px rgba(137,180,250,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#3b3f54'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            aria-label="Scroll to top"
          >^ TOP</button>
        </div>
      </footer>
      </nav>

      {/* --- Token Inspector --- */}
      <StyleHistory history={styleHistory} onSelectStyle={switchStyle} />
      <KeyboardHelp triggerOpen={helpTrigger} />
      <TokenInspector triggerOpen={tokenTrigger} />
      <StyleComparison />
      <StyleLegend onSelectStyle={switchStyle} triggerOpen={legendTrigger} />
      <StyleExport activeStyle={activeStyle} />
      <StylePlayground activeStyle={activeStyle} />
      <AnimationShowcase />
      <StyleStats />
      <StyleFavorites onSelectStyle={switchStyle} />
      <TransitionPicker />

      {/* --- Share URL Toast --- */}
      {shareToast && (
        <div
          className="fixed bottom-8 left-1/2 z-[70] pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
            style={{
              background: 'rgba(12,12,20,0.9)',
              border: '1px solid rgba(166,227,161,0.3)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 16px rgba(166,227,161,0.1), 0 8px 32px rgba(0,0,0,0.4)',
              ...mono,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#a6e3a1',
            }}
          >
            <span>URL copied to clipboard</span>
          </div>
        </div>
      )}
    </div>
  )
}
