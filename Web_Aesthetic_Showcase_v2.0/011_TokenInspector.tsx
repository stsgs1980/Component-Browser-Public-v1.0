// Project: Web Aesthetic Showcase v2.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v2.0\src\components
// Lines: 805

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Paintbrush, X, Copy, Check, Search, ChevronRight } from 'lucide-react'

/* ----------------------------------------------------------------------
   TOKEN INSPECTOR
   Interactive panel for exploring design tokens across all 6 styles.
   Floating trigger + slide-out panel with Code Art aesthetic.
   ---------------------------------------------------------------------- */

const mono = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, monospace" }

type StyleTokenKey = 'retro' | 'brutalist' | 'cli' | 'scifi' | 'glitch' | 'codeart'

interface ColorToken {
  name: string
  hex: string
  usage: string
}

interface StyleTokenGroup {
  name: string
  accent: string
  colors: ColorToken[]
}

const STYLE_TOKENS: Record<StyleTokenKey, StyleTokenGroup> = {
  retro: {
    name: 'Retro Terminal',
    accent: '#f0c020',
    colors: [
      { name: 'amber', hex: '#f0c020', usage: 'Primary text' },
      { name: 'amberDim', hex: '#b8960f', usage: 'Secondary text' },
      { name: 'amberBright', hex: '#ffe066', usage: 'Highlights' },
      { name: 'bg', hex: '#0a0800', usage: 'Background' },
      { name: 'bezel', hex: '#1a1a1a', usage: 'Panel background' },
      { name: 'error', hex: '#ff6666', usage: 'Error messages' },
      { name: 'muted', hex: '#555555', usage: 'Muted text' },
    ]
  },
  brutalist: {
    name: 'Brutalist Shell',
    accent: '#000000',
    colors: [
      { name: 'black', hex: '#000000', usage: 'Borders & text' },
      { name: 'white', hex: '#ffffff', usage: 'Background' },
      { name: 'yellow', hex: '#ffff00', usage: 'Accent' },
      { name: 'gray', hex: '#555555', usage: 'Body text' },
      { name: 'lightGray', hex: '#f9f9f9', usage: 'Card background' },
    ]
  },
  cli: {
    name: 'CLI / Command',
    accent: '#89b4fa',
    colors: [
      { name: 'base', hex: '#1e1e2e', usage: 'Background' },
      { name: 'mantle', hex: '#181825', usage: 'Sidebar' },
      { name: 'text', hex: '#cdd6f4', usage: 'Primary text' },
      { name: 'blue', hex: '#89b4fa', usage: 'Links & accent' },
      { name: 'green', hex: '#a6e3a1', usage: 'Success' },
      { name: 'red', hex: '#f38ba8', usage: 'Error' },
      { name: 'yellow', hex: '#f9e2af', usage: 'Warning' },
      { name: 'mauve', hex: '#cba6f7', usage: 'Keywords' },
      { name: 'overlay', hex: '#6c7086', usage: 'Muted text' },
    ]
  },
  scifi: {
    name: 'Sci-Fi UI',
    accent: '#00f0ff',
    colors: [
      { name: 'cyan', hex: '#00f0ff', usage: 'Primary accent' },
      { name: 'bg', hex: '#0a0e1a', usage: 'Background' },
      { name: 'green', hex: '#a6e3a1', usage: 'Active status' },
      { name: 'yellow', hex: '#f9e2af', usage: 'Warning' },
      { name: 'text', hex: '#cdd6f4', usage: 'Body text' },
      { name: 'hudDim', hex: 'rgba(0,240,255,0.5)', usage: 'HUD labels' },
    ]
  },
  glitch: {
    name: 'Glitch Aesthetic',
    accent: '#ff00ff',
    colors: [
      { name: 'red', hex: '#ff0040', usage: 'RGB split' },
      { name: 'blue', hex: '#0040ff', usage: 'RGB split' },
      { name: 'magenta', hex: '#ff00ff', usage: 'RGB split' },
      { name: 'cyan', hex: '#00ffff', usage: 'RGB split' },
      { name: 'white', hex: '#ffffff', usage: 'Text' },
      { name: 'bg', hex: '#0d0d0d', usage: 'Background' },
    ]
  },
  codeart: {
    name: 'Code Art',
    accent: '#c792ea',
    colors: [
      { name: 'purple', hex: '#c792ea', usage: 'Keywords' },
      { name: 'blue', hex: '#82aaff', usage: 'Functions' },
      { name: 'green', hex: '#c3e88d', usage: 'Strings' },
      { name: 'orange', hex: '#f78c6c', usage: 'Numbers' },
      { name: 'cyan', hex: '#89ddff', usage: 'Operators' },
      { name: 'white', hex: '#c3cee3', usage: 'Text' },
      { name: 'gray', hex: '#565575', usage: 'Comments' },
      { name: 'muted', hex: '#676e95', usage: 'Subtitles' },
      { name: 'bg', hex: '#0c0c14', usage: 'Background' },
    ]
  },
}

const STYLE_TABS: { key: StyleTokenKey; label: string; accent: string }[] = [
  { key: 'retro', label: 'Retro', accent: '#f0c020' },
  { key: 'brutalist', label: 'Brutal', accent: '#111111' },
  { key: 'cli', label: 'CLI', accent: '#89b4fa' },
  { key: 'scifi', label: 'Sci-Fi', accent: '#00f0ff' },
  { key: 'glitch', label: 'Glitch', accent: '#ff00ff' },
  { key: 'codeart', label: 'Code Art', accent: '#c792ea' },
]

/* Type scale tokens */
const TYPE_SCALE = [
  { name: 'xs', size: '0.625rem', weight: 500, lineHeight: 1.5, letterSpacing: '0.1em', preview: 'LABEL' },
  { name: 'sm', size: '0.75rem', weight: 500, lineHeight: 1.6, letterSpacing: '0.06em', preview: 'Caption text' },
  { name: 'base', size: '0.8125rem', weight: 400, lineHeight: 1.7, letterSpacing: '0.02em', preview: 'Body text content' },
  { name: 'md', size: '0.875rem', weight: 600, lineHeight: 1.75, letterSpacing: '0.02em', preview: 'Emphasized text' },
  { name: 'lg', size: '1rem', weight: 700, lineHeight: 1.8, letterSpacing: '0.01em', preview: 'Heading level 3' },
  { name: 'xl', size: '1.25rem', weight: 700, lineHeight: 1.6, letterSpacing: '0em', preview: 'Heading level 2' },
  { name: '2xl', size: '1.5rem', weight: 800, lineHeight: 1.4, letterSpacing: '-0.01em', preview: 'Heading level 1' },
]

/* Layout tokens */
const LAYOUT_TOKENS = [
  { name: 'terminal-height', value: '420px', description: 'Terminal demo height' },
  { name: 'ide-panel-height', value: '460px', description: 'IDE panel height' },
  { name: 'accordion-max-h', value: '200px', description: 'Accordion max height' },
  { name: 'section-max-h', value: '600px', description: 'Section accordion height' },
  { name: 'header-height', value: '56px', description: 'Sticky header height' },
  { name: 'sidebar-width', value: '224px', description: 'IDE sidebar width' },
]

/* CSS Variables from globals.css */
const CSS_VARIABLES = [
  { name: '--background', light: 'oklch(1 0 0)', dark: 'oklch(0.145 0 0)', type: 'color' as const },
  { name: '--foreground', light: 'oklch(0.145 0 0)', dark: 'oklch(0.985 0 0)', type: 'color' as const },
  { name: '--primary', light: 'oklch(0.205 0 0)', dark: 'oklch(0.922 0 0)', type: 'color' as const },
  { name: '--primary-foreground', light: 'oklch(0.985 0 0)', dark: 'oklch(0.205 0 0)', type: 'color' as const },
  { name: '--secondary', light: 'oklch(0.97 0 0)', dark: 'oklch(0.269 0 0)', type: 'color' as const },
  { name: '--muted', light: 'oklch(0.97 0 0)', dark: 'oklch(0.269 0 0)', type: 'color' as const },
  { name: '--muted-foreground', light: 'oklch(0.556 0 0)', dark: 'oklch(0.708 0 0)', type: 'color' as const },
  { name: '--accent', light: 'oklch(0.97 0 0)', dark: 'oklch(0.269 0 0)', type: 'color' as const },
  { name: '--destructive', light: 'oklch(0.577 0.245 27.325)', dark: 'oklch(0.704 0.191 22.216)', type: 'color' as const },
  { name: '--border', light: 'oklch(0.922 0 0)', dark: 'oklch(1 0 0 / 10%)', type: 'color' as const },
  { name: '--ring', light: 'oklch(0.708 0 0)', dark: 'oklch(0.556 0 0)', type: 'color' as const },
  { name: '--radius', light: '0.625rem', dark: '0.625rem', type: 'spacing' as const },
  { name: '--chart-1', light: 'oklch(0.646 0.222 41.116)', dark: 'oklch(0.488 0.243 264.376)', type: 'color' as const },
  { name: '--chart-2', light: 'oklch(0.6 0.118 184.704)', dark: 'oklch(0.696 0.17 162.48)', type: 'color' as const },
  { name: '--chart-3', light: 'oklch(0.398 0.07 227.392)', dark: 'oklch(0.769 0.188 70.08)', type: 'color' as const },
  { name: '--chart-4', light: 'oklch(0.828 0.189 84.429)', dark: 'oklch(0.627 0.265 303.9)', type: 'color' as const },
  { name: '--chart-5', light: 'oklch(0.769 0.188 70.08)', dark: 'oklch(0.645 0.246 16.439)', type: 'color' as const },
]

/* --- Toast notification --- */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className="fixed bottom-20 left-1/2 z-[100] pointer-events-none"
      style={{
        transform: `translateX(-50%) translateY(${visible ? '0' : '12px'})`,
        opacity: visible ? 1 : 0,
        transition: 'all 0.25s ease',
      }}
    >
      <div
        className="px-4 py-2 rounded-md"
        style={{
          ...mono,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          color: '#c3e88d',
          background: 'rgba(12,12,20,0.95)',
          border: '1px solid rgba(195,232,141,0.2)',
          boxShadow: '0 0 20px rgba(195,232,141,0.1), 0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        <Check size={12} style={{ color: '#89ddff', display: 'inline', verticalAlign: 'middle' }} /> {message}
      </div>
    </div>
  )
}

/* --- Color Swatch --- */
function ColorSwatch({ token, onCopy, copied }: { token: ColorToken; onCopy: (hex: string) => void; copied: boolean }) {
  const [hovered, setHovered] = useState(false)
  const isRgba = token.hex.startsWith('rgba')
  const swatchBg = isRgba ? token.hex : token.hex

  return (
    <div
      className="group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
      style={{
        background: hovered ? 'rgba(199,146,234,0.04)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
      onClick={() => onCopy(token.hex)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color circle */}
      <div className="relative shrink-0">
        <div
          className="w-7 h-7 rounded-full border transition-transform"
          style={{
            background: swatchBg,
            borderColor: 'rgba(255,255,255,0.1)',
            transform: hovered ? 'scale(1.15)' : 'scale(1)',
            boxShadow: isRgba ? 'none' : `0 0 12px ${token.hex}30`,
          }}
        />
        {/* Enlarged preview on hover */}
        {hovered && (
          <div
            className="absolute -top-1 -left-1 w-10 h-10 rounded-full pointer-events-none z-10"
            style={{
              background: swatchBg,
              boxShadow: isRgba ? 'none' : `0 0 24px ${token.hex}50`,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          />
        )}
      </div>

      {/* Token info */}
      <div className="flex-1 min-w-0">
        <div style={{ ...mono, fontSize: '0.75rem', fontWeight: 600, color: '#c3cee3' }}>
          {token.name}
        </div>
        <div style={{ ...mono, fontSize: '0.625rem', color: '#565575', marginTop: '1px' }}>
          {token.usage}
        </div>
      </div>

      {/* Hex value + copy icon */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          style={{
            ...mono,
            fontSize: '0.6875rem',
            color: hovered ? '#c792ea' : '#676e95',
            transition: 'color 0.15s',
          }}
        >
          {token.hex}
        </span>
        {copied ? (
          <Check size={12} style={{ color: '#c3e88d' }} />
        ) : (
          <Copy size={12} style={{ color: hovered ? '#676e95' : 'transparent', transition: 'color 0.15s' }} />
        )}
      </div>
    </div>
  )
}

/* --- CSS Variable Row --- */
function CssVarRow({ variable, onCopy, copied }: { variable: typeof CSS_VARIABLES[0]; onCopy: (val: string) => void; copied: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors"
      style={{
        background: hovered ? 'rgba(199,146,234,0.04)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
      onClick={() => onCopy(variable.name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-5 h-5 rounded shrink-0"
        style={{
          background: variable.type === 'color' ? 'linear-gradient(135deg, var(--background), var(--primary))' : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      <div className="flex-1 min-w-0">
        <div style={{ ...mono, fontSize: '0.6875rem', fontWeight: 600, color: '#82aaff' }}>
          {variable.name}
        </div>
        <div style={{ ...mono, fontSize: '0.5625rem', color: '#565575', marginTop: '1px' }} className="truncate">
          {variable.dark}
        </div>
      </div>
      {copied ? (
        <Check size={12} style={{ color: '#c3e88d' }} />
      ) : (
        <Copy size={12} style={{ color: hovered ? '#676e95' : 'transparent', transition: 'color 0.15s' }} />
      )}
    </div>
  )
}

/* ----------------------------------------------------------------------
   MAIN COMPONENT
   ---------------------------------------------------------------------- */

interface TokenInspectorProps {
  triggerOpen?: number
}

export default function TokenInspector({ triggerOpen }: TokenInspectorProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<StyleTokenKey>('codeart')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  /* --- External trigger: listen for custom event --- */
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener('zai-open-tokens', handleOpen)
    return () => window.removeEventListener('zai-open-tokens', handleOpen)
  }, [])

  /* --- triggerOpen prop: dispatch custom event to open the panel --- */
  useEffect(() => {
    if (triggerOpen && triggerOpen > 0) {
      window.dispatchEvent(new CustomEvent('zai-open-tokens'))
    }
  }, [triggerOpen])

  const copyToClipboard = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedHex(value)
      setToastMessage(`Copied ${value}`)
      setToastVisible(true)
      setTimeout(() => {
        setCopiedHex(null)
        setToastVisible(false)
      }, 1800)
    } catch {
      // Fallback: do nothing
    }
  }, [])

  /* --- Close on Escape --- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  /* --- Close on click outside --- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [open])

  /* --- Filter tokens by search --- */
  const filteredColors = STYLE_TOKENS[activeTab].colors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hex.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.usage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCssVars = CSS_VARIABLES.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.dark.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentAccent = STYLE_TOKENS[activeTab].accent

  return (
    <>
      {/* --- Floating Trigger Button --- */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: 'rgba(12,12,20,0.9)',
          border: '1px solid rgba(199,146,234,0.25)',
          boxShadow: '0 0 20px rgba(199,146,234,0.15), 0 4px 12px rgba(0,0,0,0.4)',
          opacity: open ? 0 : 1,
          pointerEvents: open ? 'none' : 'auto',
          transform: open ? 'scale(0.8)' : 'scale(1)',
        }}
        aria-label="Open Token Inspector"
      >
        <Paintbrush size={18} style={{ color: '#c792ea' }} />
      </button>

      {/* --- Backdrop --- */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={() => setOpen(false)}
      />

      {/* --- Slide-out Panel --- */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-50 h-full flex flex-col"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#0c0c14',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          boxShadow: open ? '-20px 0 60px rgba(0,0,0,0.5)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* -- Header -- */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-3">
            <Paintbrush size={14} style={{ color: '#c792ea' }} />
            <span
              style={{
                ...mono,
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#c3cee3',
              }}
            >
              TOKEN INSPECTOR
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: 'none' }}
            aria-label="Close Token Inspector"
          >
            <X size={14} style={{ color: '#676e95' }} />
          </button>
        </div>

        {/* -- Style Selector Tabs -- */}
        <div
          className="px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex flex-wrap gap-1.5">
            {STYLE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200"
                style={{
                  background: activeTab === tab.key ? `${tab.accent}15` : 'transparent',
                  border: activeTab === tab.key ? `1px solid ${tab.accent}30` : '1px solid transparent',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: tab.accent,
                    opacity: activeTab === tab.key ? 1 : 0.5,
                    boxShadow: activeTab === tab.key ? `0 0 6px ${tab.accent}50` : 'none',
                  }}
                />
                <span
                  style={{
                    ...mono,
                    fontSize: '0.625rem',
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    letterSpacing: '0.06em',
                    color: activeTab === tab.key ? tab.accent : '#676e95',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* -- Search -- */}
        <div
          className="px-4 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Search size={13} style={{ color: '#565575', shrink: 0 }} />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tokens..."
              className="flex-1 bg-transparent outline-none"
              style={{
                ...mono,
                fontSize: '0.75rem',
                color: '#c3cee3',
                caretColor: '#c792ea',
              }}
              spellCheck={false}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="shrink-0"
                style={{ background: 'none', border: 'none' }}
              >
                <X size={12} style={{ color: '#565575' }} />
              </button>
            )}
          </div>
        </div>

        {/* -- Scrollable Content -- */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2d3e transparent' }}>
          {/* -- Color Tokens Section -- */}
          <div>
            <div
              className="flex items-center gap-2 px-5 py-3 sticky top-0 z-10"
              style={{
                background: '#0c0c14',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <ChevronRight size={10} style={{ color: currentAccent }} />
              <span
                style={{
                  ...mono,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: currentAccent,
                  textTransform: 'uppercase',
                }}
              >
                COLORS
              </span>
              <span
                style={{
                  ...mono,
                  fontSize: '0.5625rem',
                  color: '#565575',
                  marginLeft: 'auto',
                }}
              >
                {filteredColors.length} tokens
              </span>
            </div>
            {filteredColors.map((token) => (
              <ColorSwatch
                key={token.name}
                token={token}
                onCopy={copyToClipboard}
                copied={copiedHex === token.hex}
              />
            ))}
            {filteredColors.length === 0 && (
              <div className="px-5 py-6 text-center" style={{ ...mono, fontSize: '0.75rem', color: '#565575' }}>
                No matching colors
              </div>
            )}
          </div>

          {/* -- Typography Tokens Section -- */}
          <div>
            <div
              className="flex items-center gap-2 px-5 py-3 sticky top-0 z-10"
              style={{
                background: '#0c0c14',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <ChevronRight size={10} style={{ color: '#82aaff' }} />
              <span
                style={{
                  ...mono,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#82aaff',
                  textTransform: 'uppercase',
                }}
              >
                TYPOGRAPHY
              </span>
              <span
                style={{
                  ...mono,
                  fontSize: '0.5625rem',
                  color: '#565575',
                  marginLeft: 'auto',
                }}
              >
                {TYPE_SCALE.length} steps
              </span>
            </div>
            <div className="px-4 py-1">
              {TYPE_SCALE.map((ts) => (
                <div
                  key={ts.name}
                  className="flex items-start gap-3 px-2 py-2.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <div className="shrink-0 w-10">
                    <span
                      style={{
                        ...mono,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: '#82aaff',
                      }}
                    >
                      {ts.name}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="mb-1 truncate"
                      style={{
                        ...mono,
                        fontSize: ts.size,
                        fontWeight: ts.weight,
                        lineHeight: ts.lineHeight,
                        letterSpacing: ts.letterSpacing,
                        color: '#c3cee3',
                      }}
                    >
                      {ts.preview}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5" style={{ ...mono, fontSize: '0.5625rem', color: '#565575' }}>
                      <span>{ts.size}</span>
                      <span>w:{ts.weight}</span>
                      <span>lh:{ts.lineHeight}</span>
                      <span>ls:{ts.letterSpacing}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* -- Layout Tokens Section -- */}
          <div>
            <div
              className="flex items-center gap-2 px-5 py-3 sticky top-0 z-10"
              style={{
                background: '#0c0c14',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <ChevronRight size={10} style={{ color: '#c3e88d' }} />
              <span
                style={{
                  ...mono,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#c3e88d',
                  textTransform: 'uppercase',
                }}
              >
                LAYOUT
              </span>
            </div>
            <div className="px-4 py-1">
              {LAYOUT_TOKENS.map((lt) => (
                <div
                  key={lt.name}
                  className="px-2 py-2.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      style={{
                        ...mono,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: '#c3cee3',
                      }}
                    >
                      {lt.name}
                    </span>
                    <span
                      style={{
                        ...mono,
                        fontSize: '0.6875rem',
                        color: '#c3e88d',
                      }}
                    >
                      {lt.value}
                    </span>
                  </div>
                  {/* Visual bar */}
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(195,232,141,0.06)' }}>
                    <div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{
                        width: lt.value,
                        maxWidth: '100%',
                        background: 'linear-gradient(90deg, rgba(195,232,141,0.3), rgba(195,232,141,0.1))',
                        boxShadow: '0 0 8px rgba(195,232,141,0.15)',
                      }}
                    />
                  </div>
                  <div style={{ ...mono, fontSize: '0.5625rem', color: '#565575', marginTop: '4px' }}>
                    {lt.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* -- CSS Variables Section -- */}
          <div>
            <div
              className="flex items-center gap-2 px-5 py-3 sticky top-0 z-10"
              style={{
                background: '#0c0c14',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <ChevronRight size={10} style={{ color: '#f78c6c' }} />
              <span
                style={{
                  ...mono,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#f78c6c',
                  textTransform: 'uppercase',
                }}
              >
                CSS VARIABLES
              </span>
              <span
                style={{
                  ...mono,
                  fontSize: '0.5625rem',
                  color: '#565575',
                  marginLeft: 'auto',
                }}
              >
                {filteredCssVars.length} vars
              </span>
            </div>
            {filteredCssVars.map((variable) => (
              <CssVarRow
                key={variable.name}
                variable={variable}
                onCopy={copyToClipboard}
                copied={copiedHex === variable.name}
              />
            ))}
            {filteredCssVars.length === 0 && (
              <div className="px-5 py-6 text-center" style={{ ...mono, fontSize: '0.75rem', color: '#565575' }}>
                No matching variables
              </div>
            )}
          </div>

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>

        {/* -- Panel Footer -- */}
        <div
          className="shrink-0 px-5 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span style={{ ...mono, fontSize: '0.5625rem', letterSpacing: '0.08em', color: '#3b3f54' }}>
            {'//'} design tokens
          </span>
          <span style={{ ...mono, fontSize: '0.5625rem', letterSpacing: '0.08em', color: '#3b3f54' }}>
            {STYLE_TOKENS[activeTab].colors.length + CSS_VARIABLES.length + TYPE_SCALE.length + LAYOUT_TOKENS.length} total
          </span>
        </div>
      </div>

      {/* --- Toast --- */}
      <Toast message={toastMessage} visible={toastVisible} />
    </>
  )
}
