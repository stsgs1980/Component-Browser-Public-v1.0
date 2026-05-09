// Project: Web Aesthetic Showcase v2.0
// Category: styles
// Source: showcases\Web Aesthetic Showcase v2.0\src\components\styles
// Lines: 224

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { mono, ACCORDION_MAX_H, SECTION_ACCORDION_MAX_H } from '@/lib/style-constants'

/* -----------------------------------------------------------------------
   1. RETRO TERMINAL -- full-page CRT experience
   ----------------------------------------------------------------------- */

const TERMINAL_HEIGHT = '420px'

export const BOOT_LINES = [
  { text: 'Phoenix BIOS v4.06  (C) 1999 Phoenix Technologies', delay: 60 },
  { text: 'CPU: Intel Pentium III 500MHz', delay: 80 },
  { text: 'Memory Test: 65536K OK', delay: 150 },
  { text: '', delay: 40 },
  { text: 'Loading Z.AI System...', delay: 300 },
  { text: '==================================== 100%', delay: 120 },
  { text: '', delay: 40 },
  { text: '  +--------------------------------------------------+', delay: 15 },
  { text: '  |     Z.AI  TERMINAL  SYSTEM  v3.1                 |', delay: 15 },
  { text: '  |     (c) 1999 Z.ai Corporation                    |', delay: 15 },
  { text: '  +--------------------------------------------------+', delay: 15 },
  { text: '', delay: 40 },
  { text: 'Type "help" for available commands.', delay: 80, isPrompt: true },
]

export const COMMANDS: Record<string, string[]> = {
  help: ['Available commands:', '', '  help    - Show this help', '  sysinfo - System info', '  usecase - When to use this style', '  props   - Key properties', '  matrix  - Enter the matrix', '  cls     - Clear screen', '  ls      - List files', '  ver     - Version', '  whoami  - Who are you?', '  echo    - Echo text'],
  sysinfo: ['+----------------------------------+', '|  OS      : Z.AI DOS 7.1         |', '|  CPU     : Pentium III 500MHz    |', '|  RAM     : 64 MB                 |', '|  CRT     : Amber P3              |', '|  Uptime  : 47d 13h 22m           |', '+----------------------------------+'],
  ls: ['  COMMAND  COM    93,890  12-01-99', '  CONFIG   SYS       256  12-01-99', '  WINDOWS      <DIR>  12-01-99', '  TERMINAL EXE   45,312  12-01-99', '  README   TXT     1,024  12-01-99', '', '  4 File(s)  140,634 bytes', '  1 Dir(s)   2,048,000 bytes free'],
  ver: ['Z.AI [Version 3.1.1999]', 'Phosphor Amber Edition', '(C) Copyright Z.ai Corp.'],
  whoami: ['user@zai-terminal', 'Privilege level: ADMINISTRATOR', 'Session: TTY1'],
  usecase: ['', '+-------------------------------------+', '|  WHEN TO USE                       |', '+-------------------------------------+', '|  > DevTools & developer utilities   |', '|  > Retro games & game landing pages |', '|  > Interactive demos & education    |', '|  > CLI onboarding & SaaS wizards   |', '+-------------------------------------+'],
  props: ['', '+-------------------------------------+', '|  KEY FEATURES                      |', '+-------------------------------------+', '|  > Amber glow -- phosphor effect   |', '|  > Scanline overlay -- CRT realism |', '|  > Boot sequence -- dramatic entry |', '|  > Monospace-only -- pure terminal |', '+-------------------------------------+'],
  matrix: ['__MATRIX__'],
  cls: ['__CLS__'],
}

export default function RetroPage() {
  const [lines, setLines] = useState<Array<{ text: string; type: 'boot' | 'cmd' | 'output' | 'error' | 'prompt' }>>([])
  const [inputVal, setInputVal] = useState('')
  const [inputVisible, setInputVisible] = useState(false)
  const [showUseCases, setShowUseCases] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const [expandedUseCase, setExpandedUseCase] = useState<string | null>(null)
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let totalDelay = 0
    const t: ReturnType<typeof setTimeout>[] = []
    for (const line of BOOT_LINES) {
      totalDelay += line.delay
      t.push(setTimeout(() => setLines((p) => [...p, { text: line.text, type: line.isPrompt ? 'prompt' : 'boot' }]), totalDelay))
    }
    t.push(setTimeout(() => { setInputVisible(true); const focusTimer = setTimeout(() => inputRef.current?.focus(), 50); t.push(focusTimer) }, totalDelay + 200))
    return () => t.forEach(clearTimeout)
  }, [])
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [lines])

  const processCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase()
    const sp = cmd.indexOf(' ')
    const base = sp > -1 ? cmd.slice(0, sp) : cmd
    const arg = sp > -1 ? raw.trim().slice(sp + 1) : ''
    if (base === 'cls') { setLines([]); return }
    if (base === 'echo') { setLines((p) => [...p, { text: `C:\\>${raw.trim()}`, type: 'cmd' }, { text: arg || '', type: 'output' }]); return }
    if (base === 'matrix') {
      const matrixLines = ['', '  01001000 01100101 01101100 01101100 01101111', '  01010111 01101111 01110010 01101100 01100100', '  01011001 01101111 01110101 00100000 01100001', '  01110010 01100101 00100000 01100001 01110111', '  01100101 01110011 01101111 01101101 01100101', '']
      setLines((p) => [...p, { text: `C:\\>${raw.trim()}`, type: 'cmd' }, ...matrixLines.map((t) => ({ text: t, type: 'output' as const }))]); return
    }
    if (base === '') { setLines((p) => [...p, { text: 'C:\\>', type: 'cmd' }]); return }
    const r = COMMANDS[base]
    if (r) setLines((p) => [...p, { text: `C:\\>${raw.trim()}`, type: 'cmd' }, ...r.map((t) => ({ text: t, type: 'output' as const }))])
    else setLines((p) => [...p, { text: `C:\\>${raw.trim()}`, type: 'cmd' }, { text: `  '${base}' is not recognized as an internal or external command.`, type: 'error' }, { text: '', type: 'output' }])
  }, [])

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col" style={{ background: '#0a0800' }}>

      {/* -- Block 1: What is this -- */}
      <div className="shrink-0 px-5 py-3" style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#f0c020]" style={{ boxShadow: '0 0 8px rgba(240,192,32,0.6)' }} />
          <span style={{ ...mono, fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.06em', color: '#f0c020' }}>CRT terminal with amber phosphor, scanlines and boot animation</span>
        </div>
      </div>

      {/* -- Block 2: Interactive Demo -- Terminal -- */}
      <div className="relative shrink-0 flex flex-col" style={{ height: TERMINAL_HEIGHT }}>
        {/* Scanline overlay -- scoped to terminal */}
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)' }} />
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />

        {/* Bezel top */}
        <div className="flex items-center justify-between px-5 py-2.5 relative z-10 shrink-0" style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#f0c020]" style={{ boxShadow: '0 0 8px rgba(240,192,32,0.6)' }} />
            <span style={{ ...mono, fontSize: '0.75rem', letterSpacing: '0.08em', color: '#f0c020', fontWeight: 600 }}>Z.AI TERMINAL v3.1</span>
          </div>
          <div className="flex items-center gap-4" style={{ ...mono, fontSize: '0.6875rem', color: '#555' }}>
            <span>CRT-15</span>
            <span>640x480</span>
            <span className="hidden sm:inline">Amber P3</span>
          </div>
        </div>

        {/* Terminal content */}
        <div ref={scrollRef} className="overflow-y-auto relative z-10 p-5 flex-1" style={{ ...mono, fontSize: '0.9375rem', lineHeight: 1.75, color: '#f0c020', textShadow: '0 0 6px rgba(240,192,32,0.45)', fontFeatureSettings: '"liga" off, "calt" off' }}>
          {lines.map((line, i) => {
            if (line.type === 'error') return <div key={i} style={{ color: '#ff6666' }}>{line.text || '\u00A0'}</div>
            if (line.type === 'prompt') return <div key={i} style={{ color: '#ffe066' }}>{line.text || '\u00A0'}</div>
            return <div key={i}>{line.text || '\u00A0'}</div>
          })}
          {inputVisible && (
            <div className="flex items-center">
              <span style={{ color: '#f0c020' }}>C:\&gt;</span>
              <span className="mx-1">&nbsp;</span>
              <input ref={inputRef} value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && inputVal.trim()) { processCommand(inputVal); setInputVal('') } }} className="flex-1 bg-transparent outline-none caret-[#f0c020]" style={{ color: '#f0c020', textShadow: '0 0 6px rgba(240,192,32,0.45)', ...mono, fontSize: '0.9375rem', fontFeatureSettings: '"liga" off, "calt" off' }} autoFocus spellCheck={false} autoComplete="off" />
              <span className="inline-block w-[6px] h-[15px] bg-[#f0c020] animate-[blink_0.7s_step-end_infinite]" style={{ boxShadow: '0 0 6px rgba(240,192,32,0.7)' }} />
            </div>
          )}
        </div>

      </div>

      {/* Bottom bar -- outside the terminal box, between CRT and accordions */}
      <div className="flex items-center justify-between px-5 py-2.5 mt-2 mx-1 shrink-0 rounded-sm" style={{ background: '#0d0d0d', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
        <span style={{ ...mono, fontSize: '0.625rem', letterSpacing: '0.1em', color: '#444' }}>C:\\ZAI\\TERMINAL</span>
        <span style={{ ...mono, fontSize: '0.625rem', letterSpacing: '0.1em', color: '#444' }}>{'='.repeat(20)}{'.'.repeat(8)}</span>
      </div>

      {/* -- Block 3 & 4: Expandable sections -- When to use + Key features -- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-10">
        {/* When to use */}
        <div>
          <button
            onClick={() => setShowUseCases((p) => !p)}
            aria-expanded={showUseCases}
            className="w-full flex items-center gap-3 mb-3 group cursor-pointer"
            style={{ ...mono, fontSize: '0.8125rem', color: '#f0c020', textShadow: '0 0 4px rgba(240,192,32,0.3)', background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFeatureSettings: '"liga" off, "calt" off' }}
          >
            <span style={{ fontSize: '0.75rem', transition: 'transform 0.2s', display: 'inline-block', transform: showUseCases ? 'rotate(90deg)' : 'rotate(0deg)' }}>{'>'}</span>
            <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>{'WHEN TO USE'}</span>
            <span style={{ color: '#555' }}>[tab]</span>
          </button>
          <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: showUseCases ? SECTION_ACCORDION_MAX_H : '0px', opacity: showUseCases ? 1 : 0 }}>
            <div style={{ ...mono, fontSize: '0.8125rem', lineHeight: 1.8, color: '#f0c020', textShadow: '0 0 4px rgba(240,192,32,0.3)', fontFeatureSettings: '"liga" off, "calt" off' }}>
              <div style={{ border: '1px solid rgba(240,192,32,0.15)', borderRadius: '2px', padding: '4px 0' }}>
                <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(240,192,32,0.1)', fontWeight: 700, letterSpacing: '0.04em', color: '#ffe066' }}>{'WHEN TO USE'}</div>
                {[
                  { id: 'devtools', title: 'DevTools & developer utilities', desc: 'Developer tools in retro style -- debugger, profiler, network inspector. The user feels as if working in a real DOS system.' },
                  { id: 'retro', title: 'Retro games & game landing pages', desc: 'Games with pixel-art aesthetics, text-based adventures, promo sites for indie games. CRT effect immerses in the 90s atmosphere.' },
                  { id: 'demo', title: 'Interactive demos & education', desc: 'Educational platforms, CLI training interfaces, onboarding scripts for new employees. Terminal is an intuitive UI for developers.' },
                  { id: 'cli', title: 'CLI onboarding & SaaS wizards', desc: 'Step-by-step setup through terminal interface: project configuration, deploy, environment setup. Familiar UX for technical audience.' },
                ].map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => setExpandedUseCase((p) => p === item.id ? null : item.id)}
                      className="w-full text-left cursor-pointer flex items-center gap-2 transition-colors"
                      style={{ ...mono, fontSize: '0.8125rem', padding: '8px 12px', background: 'none', border: 'none', color: '#f0c020', borderBottom: expandedUseCase === item.id ? '1px solid rgba(240,192,32,0.1)' : 'none' }}
                    >
                      <span style={{ fontSize: '0.625rem', transition: 'transform 0.2s', display: 'inline-block', transform: expandedUseCase === item.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>{'>'}</span>
                      <span>{'>'}</span>
                      <span>{item.title}</span>
                    </button>
                    <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: expandedUseCase === item.id ? ACCORDION_MAX_H : '0px', opacity: expandedUseCase === item.id ? 1 : 0 }}>
                      <div style={{ padding: '6px 12px 10px 34px', fontSize: '0.75rem', lineHeight: 1.7, color: '#b8960f' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div>
          <button
            onClick={() => setShowFeatures((p) => !p)}
            aria-expanded={showFeatures}
            className="w-full flex items-center gap-3 mb-3 group cursor-pointer"
            style={{ ...mono, fontSize: '0.8125rem', color: '#f0c020', textShadow: '0 0 4px rgba(240,192,32,0.3)', background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFeatureSettings: '"liga" off, "calt" off' }}
          >
            <span style={{ fontSize: '0.75rem', transition: 'transform 0.2s', display: 'inline-block', transform: showFeatures ? 'rotate(90deg)' : 'rotate(0deg)' }}>{'>'}</span>
            <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>{'KEY FEATURES'}</span>
            <span style={{ color: '#555' }}>[tab]</span>
          </button>
          <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: showFeatures ? SECTION_ACCORDION_MAX_H : '0px', opacity: showFeatures ? 1 : 0 }}>
            <div style={{ ...mono, fontSize: '0.8125rem', lineHeight: 1.8, color: '#f0c020', textShadow: '0 0 4px rgba(240,192,32,0.3)', fontFeatureSettings: '"liga" off, "calt" off' }}>
              <div style={{ border: '1px solid rgba(240,192,32,0.15)', borderRadius: '2px', padding: '4px 0' }}>
                <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(240,192,32,0.1)', fontWeight: 700, letterSpacing: '0.04em', color: '#ffe066' }}>{'KEY FEATURES'}</div>
                {[
                  { id: 'glow', title: 'Amber glow -- phosphor CRT', desc: 'Warm amber glow with text-shadow emulating phosphor afterglow. Creates the feel of a real CRT monitor without CSS filters.' },
                  { id: 'scanline', title: 'Scanline overlay -- authentic', desc: 'Semi-transparent horizontal lines via repeating-linear-gradient. Scalable, no render slowdown.' },
                  { id: 'boot', title: 'Boot sequence -- dramatic start', desc: 'Step-by-step BIOS -> system -> prompt boot animation. Delays via setTimeout chain for realistic pacing.' },
                  { id: 'feat-mono', title: 'Monospace-only -- pure terminal', desc: 'Geist Mono with disabled ligatures (liga off, calt off). Each character has fixed width for perfect column alignment.' },
                ].map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => setExpandedFeature((p) => p === item.id ? null : item.id)}
                      className="w-full text-left cursor-pointer flex items-center gap-2 transition-colors"
                      style={{ ...mono, fontSize: '0.8125rem', padding: '8px 12px', background: 'none', border: 'none', color: '#f0c020', borderBottom: expandedFeature === item.id ? '1px solid rgba(240,192,32,0.1)' : 'none' }}
                    >
                      <span style={{ fontSize: '0.625rem', transition: 'transform 0.2s', display: 'inline-block', transform: expandedFeature === item.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>{'>'}</span>
                      <span>{'>'}</span>
                      <span>{item.title}</span>
                    </button>
                    <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: expandedFeature === item.id ? ACCORDION_MAX_H : '0px', opacity: expandedFeature === item.id ? 1 : 0 }}>
                      <div style={{ padding: '6px 12px 10px 34px', fontSize: '0.75rem', lineHeight: 1.7, color: '#b8960f' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
