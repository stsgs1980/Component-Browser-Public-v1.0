// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 1128

'use client'

import { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Shield,
  Wifi,
  Lock,
  Terminal,
  Zap,
  Skull,
  Eye,
  Cpu,
  Radio,
  Activity,
  Keyboard,
} from 'lucide-react'

// ============================================================
// Types & Constants
// ============================================================

type ColorTheme = 'neon-green' | 'neon-pink' | 'neon-cyan'

interface LogEntry {
  id: string
  type: 'ERR' | 'WARN' | 'INFO'
  code: string
  message: string
  timestamp: string
}

const COLOR_THEMES: Record<ColorTheme, { primary: string; secondary: string; glow: string; bg: string }> = {
  'neon-green': {
    primary: '#00ff41',
    secondary: '#00cc33',
    glow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 40px #00ff41',
    bg: 'rgba(0, 255, 65, 0.05)',
  },
  'neon-pink': {
    primary: '#ff0080',
    secondary: '#cc0066',
    glow: '0 0 10px #ff0080, 0 0 20px #ff0080, 0 0 40px #ff0080',
    bg: 'rgba(255, 0, 128, 0.05)',
  },
  'neon-cyan': {
    primary: '#00ffff',
    secondary: '#00cccc',
    glow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
    bg: 'rgba(0, 255, 255, 0.05)',
  },
}

const ERROR_MESSAGES: Omit<LogEntry, 'id' | 'timestamp'>[] = [
  { type: 'ERR', code: '0x4F2A', message: 'Memory corruption detected at 0xDEADBEEF' },
  { type: 'WARN', code: '0x2B1C', message: 'Stack overflow in sector 7G' },
  { type: 'ERR', code: '0x8F1C', message: 'Neural pathway misalignment' },
  { type: 'INFO', code: '0x001F', message: 'Rebooting subsystem...' },
  { type: 'ERR', code: '0xA3B7', message: 'Firewall breach — sector 12' },
  { type: 'WARN', code: '0x7D4E', message: 'Unusual data pattern in buffer 0x4A2C' },
  { type: 'ERR', code: '0xC91F', message: 'Process injection attempt blocked' },
  { type: 'INFO', code: '0x000A', message: 'Checksum verification complete' },
  { type: 'ERR', code: '0xF205', message: 'Kernel panic — syncing disks' },
  { type: 'WARN', code: '0x3A8D', message: 'Anomalous traffic detected on port 443' },
  { type: 'INFO', code: '0x0003', message: 'Running diagnostic scan...' },
  { type: 'ERR', code: '0xB6E0', message: 'Encryption key compromised — rotating keys' },
  { type: 'WARN', code: '0x5C29', message: 'Temperature threshold exceeded in node 9' },
  { type: 'ERR', code: '0xD4A8', message: 'Database connection pool exhausted' },
  { type: 'INFO', code: '0x0012', message: 'Cache invalidated successfully' },
]

const HEX_CHARS = '0123456789ABCDEF'

function randomHex(bytes: number): string {
  let result = ''
  for (let i = 0; i < bytes; i++) {
    for (let j = 0; j < 2; j++) {
      result += HEX_CHARS[Math.floor(Math.random() * 16)]
    }
    if (i < bytes - 1) result += ' '
  }
  return result
}

function randomGlitchText(length: number): string {
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function getTimestamp(): string {
  const now = new Date()
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
}

// ============================================================
// Sub-components
// ============================================================

/** Floating hex dump decoration */
function HexDumpDecoration() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const lines = useMemo(() => {
    if (!mounted) return [] as string[]
    const result: string[] = []
    for (let i = 0; i < 60; i++) {
      const offset = (i * 16).toString(16).toUpperCase().padStart(8, '0')
      const hex = randomHex(16)
      const ascii = Array.from({ length: 16 }, () =>
        Math.random() > 0.3 ? String.fromCharCode(0x21 + Math.floor(Math.random() * 94)) : '.'
      ).join('')
      result.push(`${offset}  ${hex}  |${ascii}|`)
    }
    return result
  }, [mounted])

  if (lines.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.06] pointer-events-none select-none">
      <div className="hex-scroll font-mono text-[10px] leading-tight text-cyan-400 whitespace-pre">
        {lines.join('\n')}
        {lines.join('\n')}
      </div>
    </div>
  )
}

/** Cyberpunk perspective grid background */
function CyberpunkGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        background: `
          linear-gradient(180deg, transparent 0%, rgba(138, 43, 226, 0.03) 40%, rgba(138, 43, 226, 0.08) 100%),
          linear-gradient(90deg, rgba(0, 255, 255, 0.04) 1px, transparent 1px),
          linear-gradient(0deg, rgba(0, 255, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
      }}
    >
      {/* Perspective floor grid */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '50%',
          background: `
            linear-gradient(to bottom, transparent, rgba(138, 43, 226, 0.15) 70%, rgba(138, 43, 226, 0.3)),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 79px,
              rgba(0, 255, 255, 0.06) 79px,
              rgba(0, 255, 255, 0.06) 80px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(0, 255, 255, 0.06) 39px,
              rgba(0, 255, 255, 0.06) 40px
            )
          `,
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'bottom center',
        }}
      />
    </div>
  )
}

/** Floating particles */
function FloatingParticles() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const particles = useMemo(() => {
    if (!mounted) return []
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 10,
      opacity: 0.2 + Math.random() * 0.5,
    }))
  }, [mounted])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [p.opacity, p.opacity * 0.3, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeatType: "loop",
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/** Vignette overlay */
function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 20, 0.7) 100%)',
        zIndex: 5,
      }}
    />
  )
}

/** Status panel for dashboard */
function StatusPanel({
  title,
  icon: Icon,
  children,
  colorTheme,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  colorTheme: ColorTheme
}) {
  const theme = COLOR_THEMES[colorTheme]
  return (
    <motion.div
      className="cyber-border rounded-sm relative overflow-hidden bg-[#0a0014]/90 backdrop-blur-sm"
      style={{ borderColor: theme.primary }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(${colorTheme === 'neon-green' ? '0,255,65' : colorTheme === 'neon-pink' ? '255,0,128' : '0,255,255'}, 0.02) 2px,
            rgba(${colorTheme === 'neon-green' ? '0,255,65' : colorTheme === 'neon-pink' ? '255,0,128' : '0,255,255'}, 0.02) 4px
          )`,
        }}
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} style={{ color: theme.primary }} />
          <Icon size={16} style={{ color: theme.primary }} />
          <h3 className="font-mono text-sm font-bold tracking-wider" style={{ color: theme.primary }}>
            {title}
          </h3>
        </div>
        {children}
      </div>
    </motion.div>
  )
}

// ============================================================
// Main Component
// ============================================================

export default function GlitchSection() {
  // ---- State ----
  const [colorTheme, setColorTheme] = useState<ColorTheme>('neon-cyan')
  const [accessGranted, setAccessGranted] = useState(false)
  const [accessGlitch, setAccessGlitch] = useState(false)
  const [neuralProgress, setNeuralProgress] = useState(0)
  const [firewallStatus, setFirewallStatus] = useState<'ACTIVE' | 'BREACHED'>('ACTIVE')
  const [encryptionKey, setEncryptionKey] = useState('00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00')
  const [signalStrength, setSignalStrength] = useState([3, 5, 4, 2, 5])
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [hackCooldown, setHackCooldown] = useState(0)
  const [hackPhase, setHackPhase] = useState<'idle' | 'flash' | 'glitch' | 'granted'>('idle')
  const [glitchText, setGlitchText] = useState('')
  const [glitchDisplay, setGlitchDisplay] = useState('')
  const [matrixHover, setMatrixHover] = useState(false)
  const [connectState, setConnectState] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [screenFlash, setScreenFlash] = useState(false)
  const [rapidGlitchLines, setRapidGlitchLines] = useState<string[]>([])

  const logRef = useRef<HTMLDivElement>(null)
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null)
  const matrixAnimRef = useRef<number>(0)
  const hackCooldownRef = useRef(0)
  const logIdRef = useRef(0)

  const theme = COLOR_THEMES[colorTheme]

  // ---- Access toggle ----
  const toggleAccess = useCallback(() => {
    setAccessGlitch(true)
    setTimeout(() => {
      setAccessGranted((prev) => !prev)
      setAccessGlitch(false)
    }, 600)
  }, [])

  // ---- Neural network progress ----
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralProgress((prev) => {
        if (prev >= 100) return 0
        return prev + Math.random() * 15
      })
    }, 800)
    return () => clearInterval(interval)
  }, [])

  // ---- Firewall status ----
  useEffect(() => {
    const interval = setInterval(() => {
      setFirewallStatus(Math.random() > 0.3 ? 'ACTIVE' : 'BREACHED')
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // ---- Encryption key cycling ----
  useEffect(() => {
    const interval = setInterval(() => {
      setEncryptionKey(randomHex(16))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // ---- Signal strength ----
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalStrength(Array.from({ length: 5 }, () => 1 + Math.floor(Math.random() * 5)))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  // ---- Error log ----
  useEffect(() => {
    const addEntry = () => {
      const msg = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]
      setLogEntries((prev) => {
        const id = `glitch-log-${logIdRef.current++}`
        const newEntries = [...prev, { ...msg, id, timestamp: getTimestamp() }]
        return newEntries.slice(-50)
      })
    }
    // Add initial entries
    for (let i = 0; i < 8; i++) addEntry()
    const interval = setInterval(addEntry, 2000)
    return () => {
      clearInterval(interval)
      setLogEntries([])
    }
  }, [])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logEntries])

  // ---- Glitch text generator ----
  useEffect(() => {
    if (!glitchText) return
    const interval = setInterval(() => {
      setGlitchDisplay(
        glitchText
          .split('')
          .map((ch) =>
            Math.random() > 0.7
              ? String.fromCharCode(33 + Math.floor(Math.random() * 94))
              : ch
          )
          .join('')
      )
    }, 80)
    return () => clearInterval(interval)
  }, [glitchText])

  // ---- Hack cooldown timer ----
  useEffect(() => {
    if (hackCooldown <= 0) return
    const timer = setInterval(() => {
      hackCooldownRef.current -= 1
      setHackCooldown(hackCooldownRef.current)
    }, 1000)
    return () => clearInterval(timer)
  }, [hackCooldown])

  // ---- Hack the system ----
  const handleHack = useCallback(() => {
    if (hackCooldown > 0 || hackPhase !== 'idle') return
    setHackPhase('flash')
    setScreenFlash(true)

    setTimeout(() => {
      setScreenFlash(false)
      setHackPhase('glitch')
      // Generate rapid glitch lines
      const lines: string[] = []
      for (let i = 0; i < 20; i++) {
        lines.push(randomGlitchText(30 + Math.floor(Math.random() * 40)))
      }
      setRapidGlitchLines(lines)

      setTimeout(() => {
        setHackPhase('granted')
        setTimeout(() => {
          setHackPhase('idle')
          setRapidGlitchLines([])
          hackCooldownRef.current = 5
          setHackCooldown(5)
        }, 3000)
      }, 1500)
    }, 300)
  }, [hackCooldown, hackPhase])

  // ---- Matrix Rain ----
  useEffect(() => {
    const canvas = matrixCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * -100)
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'

    let speedMultiplier = 1

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = theme.primary
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Lead character is brighter
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 0.9
        ctx.fillText(char, x, y)

        // Trail
        ctx.fillStyle = theme.primary
        ctx.globalAlpha = 0.6
        const trailChar = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(trailChar, x, y - fontSize)

        ctx.globalAlpha = 1

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += speedMultiplier
      }

      matrixAnimRef.current = requestAnimationFrame(draw)
    }

    draw()

    // Observe hover changes
    const unobserve = () => {
      speedMultiplier = matrixHover ? 3 : 1
    }
    unobserve()

    return () => {
      cancelAnimationFrame(matrixAnimRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [matrixHover, theme.primary])

  // ---- Connect button handler ----
  const handleConnect = useCallback(() => {
    if (connectState !== 'idle') return
    setConnectState('connecting')
    setTimeout(() => {
      setConnectState('connected')
      setTimeout(() => {
        setConnectState('idle')
      }, 3000)
    }, 2000)
  }, [connectState])

  // ---- Render helpers ----
  const logColor = (type: string) => {
    switch (type) {
      case 'ERR':
        return '#ff0040'
      case 'WARN':
        return '#ffcc00'
      case 'INFO':
        return '#00ffff'
      default:
        return '#888888'
    }
  }

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden crt-effect scanlines"
      style={{ backgroundColor: '#0a0014', color: '#e0e0e0' }}
    >
      {/* Background layers */}
      <CyberpunkGrid />
      <FloatingParticles />
      <Vignette />
      <HexDumpDecoration />

      {/* Screen flash overlay */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            className="fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Rapid glitch overlay */}
      <AnimatePresence>
        {hackPhase === 'glitch' && rapidGlitchLines.length > 0 && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: 'rgba(10, 0, 20, 0.9)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {rapidGlitchLines.map((line, i) => (
              <motion.div
                key={`glitch-line-${i}`}
                className="absolute font-mono text-sm"
                style={{
                  color: i % 2 === 0 ? '#ff0040' : '#00ffff',
                  top: `${10 + (i / rapidGlitchLines.length) * 80}%`,
                  left: `${5 + ((i * 37 + 13) % 30)}%`,
                }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: [0, 1, 1, 0], x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                {line}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACCESS GRANTED overlay */}
      <AnimatePresence>
        {hackPhase === 'granted' && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 20, 0.95)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="glitch-text font-mono font-black text-6xl md:text-8xl tracking-widest mb-4"
                data-text="ACCESS GRANTED"
                style={{ color: theme.primary, textShadow: theme.glow }}
              >
                ACCESS GRANTED
              </div>
              <motion.div
                className="font-mono text-lg"
                style={{ color: theme.secondary }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {'> SYSTEM OVERRIDE COMPLETE'}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ===== HERO AREA ===== */}
        <div className="text-center mb-16 relative">
          {/* Glitch heading */}
          <motion.h1
            className="glitch-text font-mono font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider mb-4"
            data-text="GLITCH//"
            style={{
              color: '#ffffff',
              textShadow: `
                0 0 10px ${theme.primary},
                0 0 20px ${theme.primary},
                0 0 40px ${theme.primary},
                3px 0 0 #ff0040,
                -3px 0 0 #00ffff
              `,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            GLITCH//
          </motion.h1>

          {/* Subtitle with flicker */}
          <motion.p
            className="flicker font-mono text-lg sm:text-xl md:text-2xl tracking-[0.3em] mb-8"
            style={{ color: theme.secondary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            SYSTEM infiltrated
          </motion.p>

          {/* ACCESS DENIED / GRANTED toggle */}
          <motion.div
            className="inline-block cursor-pointer select-none"
            onClick={toggleAccess}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`font-mono font-black text-2xl sm:text-3xl md:text-4xl tracking-widest px-8 py-4 border-2 rounded-sm transition-all duration-200 ${
                accessGlitch ? 'animate-pulse' : ''
              }`}
              style={{
                color: accessGranted ? theme.primary : '#ff0040',
                borderColor: accessGranted ? theme.primary : '#ff0040',
                textShadow: accessGranted
                  ? `0 0 10px ${theme.primary}, 0 0 20px ${theme.primary}`
                  : '0 0 10px #ff0040, 0 0 20px #ff0040',
                boxShadow: accessGranted
                  ? `0 0 15px ${theme.primary}, inset 0 0 15px ${theme.bg}`
                  : '0 0 15px #ff0040, inset 0 0 15px rgba(255,0,64,0.1)',
              }}
            >
              {accessGlitch ? randomGlitchText(14) : accessGranted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
            </div>
          </motion.div>

          {/* Color theme toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="font-mono text-xs tracking-widest" style={{ color: theme.secondary }}>
              THEME://
            </span>
            {(['neon-green', 'neon-pink', 'neon-cyan'] as ColorTheme[]).map((ct) => (
              <button
                key={ct}
                onClick={() => setColorTheme(ct)}
                className="w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-125"
                style={{
                  backgroundColor: COLOR_THEMES[ct].primary,
                  borderColor: colorTheme === ct ? '#ffffff' : 'transparent',
                  boxShadow: colorTheme === ct ? COLOR_THEMES[ct].glow : 'none',
                }}
                aria-label={`Switch to ${ct} theme`}
              />
            ))}
          </div>
        </div>

        {/* ===== SYSTEM STATUS DASHBOARD ===== */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} style={{ color: theme.primary }} />
            <h2 className="font-mono text-xl font-bold tracking-widest" style={{ color: theme.primary }}>
              SYSTEM STATUS
            </h2>
            <div className="flex-1 h-px ml-3" style={{ backgroundColor: `${theme.primary}33` }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Neural Network */}
            <StatusPanel title="NEURAL NETWORK" icon={Cpu} colorTheme={colorTheme}>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span style={{ color: theme.secondary }}>PROGRESS</span>
                  <span style={{ color: theme.primary }}>{Math.min(Math.round(neuralProgress), 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-sm overflow-hidden" style={{ backgroundColor: '#1a0025' }}>
                  <motion.div
                    className="h-full rounded-sm"
                    style={{
                      backgroundColor: theme.primary,
                      boxShadow: theme.glow,
                    }}
                    animate={{ width: `${Math.min(neuralProgress, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="font-mono text-[10px]" style={{ color: '#666' }}>
                  {neuralProgress >= 100 ? 'SYNC COMPLETE' : 'TRAINING IN PROGRESS...'}
                </div>
              </div>
            </StatusPanel>

            {/* Firewall */}
            <StatusPanel title="FIREWALL" icon={Shield} colorTheme={colorTheme}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: firewallStatus === 'ACTIVE' ? '#00ff41' : '#ff0040',
                      boxShadow:
                        firewallStatus === 'ACTIVE'
                          ? '0 0 8px #00ff41'
                          : '0 0 8px #ff0040',
                    }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeatType: "loop", repeat: Infinity }}
                  />
                  <span
                    className="font-mono text-lg font-bold tracking-wider"
                    style={{
                      color: firewallStatus === 'ACTIVE' ? '#00ff41' : '#ff0040',
                      textShadow:
                        firewallStatus === 'ACTIVE'
                          ? '0 0 10px #00ff41'
                          : '0 0 10px #ff0040',
                    }}
                  >
                    {firewallStatus}
                  </span>
                </div>
                <div className="font-mono text-[10px]" style={{ color: '#666' }}>
                  {firewallStatus === 'ACTIVE'
                    ? 'All sectors secure'
                    : 'BREACH DETECTED — sector 12'}
                </div>
              </div>
            </StatusPanel>

            {/* Encryption */}
            <StatusPanel title="ENCRYPTION" icon={Lock} colorTheme={colorTheme}>
              <div className="space-y-2">
                <div className="font-mono text-[10px]" style={{ color: '#666' }}>
                  AES-256 KEY
                </div>
                <div
                  className="font-mono text-xs p-2 rounded-sm tracking-wider break-all"
                  style={{
                    backgroundColor: '#0d001a',
                    color: theme.primary,
                    border: `1px solid ${theme.primary}33`,
                    textShadow: `0 0 5px ${theme.primary}`,
                  }}
                >
                  {encryptionKey}
                </div>
                <div className="font-mono text-[10px]" style={{ color: '#666' }}>
                  AUTO-ROTATING...
                </div>
              </div>
            </StatusPanel>

            {/* Uplink */}
            <StatusPanel title="UPLINK" icon={Wifi} colorTheme={colorTheme}>
              <div className="space-y-2">
                <div className="flex items-end gap-1 h-10">
                  {signalStrength.map((level, i) => (
                    <motion.div
                      key={`signal-${i}`}
                      className="w-3 rounded-sm"
                      style={{
                        backgroundColor:
                          level > 3
                            ? theme.primary
                            : level > 1
                              ? theme.secondary
                              : '#333',
                        boxShadow: level > 3 ? theme.glow : 'none',
                        opacity: level === 0 ? 0.3 : 1,
                      }}
                      animate={{ height: `${(level / 5) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
                </div>
                <div className="font-mono text-[10px]" style={{ color: '#666' }}>
                  SIGNAL: {signalStrength.reduce((a, b) => a + b, 0) > 15 ? 'STRONG' : signalStrength.reduce((a, b) => a + b, 0) > 10 ? 'MODERATE' : 'WEAK'}
                </div>
              </div>
            </StatusPanel>
          </div>
        </div>

        {/* ===== ERROR LOG / TERMINAL ===== */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Terminal size={20} style={{ color: theme.primary }} />
            <h2 className="font-mono text-xl font-bold tracking-widest" style={{ color: theme.primary }}>
              ERROR LOG
            </h2>
            <div className="flex-1 h-px ml-3" style={{ backgroundColor: `${theme.primary}33` }} />
          </div>

          <div
            className="cyber-border rounded-sm overflow-hidden"
            style={{ backgroundColor: '#050010', borderColor: '#ff004033' }}
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: '#0d001a' }}>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-mono text-xs ml-2" style={{ color: '#666' }}>
                system_monitor.log — {logEntries.length} entries
              </span>
            </div>

            {/* Log content */}
            <div
              ref={logRef}
              className="p-4 h-64 overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed space-y-1"
            >
              {logEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  className="flex gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span style={{ color: '#444' }}>[{entry.timestamp}]</span>
                  <span style={{ color: logColor(entry.type), fontWeight: entry.type === 'ERR' ? 'bold' : 'normal' }}>
                    [{entry.type}]
                  </span>
                  <span style={{ color: '#888' }}>{entry.code}:</span>
                  <span style={{ color: '#ccc' }}>{entry.message}</span>
                </motion.div>
              ))}
              <div className="flex items-center gap-1 mt-2">
                <span style={{ color: theme.primary }}>{'>'}</span>
                <span className="cursor-blink" style={{ color: theme.secondary }}>
                  _
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== MATRIX RAIN ===== */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Skull size={20} style={{ color: theme.primary }} />
            <h2 className="font-mono text-xl font-bold tracking-widest" style={{ color: theme.primary }}>
              MATRIX RAIN
            </h2>
            <div className="flex-1 h-px ml-3" style={{ backgroundColor: `${theme.primary}33` }} />
          </div>

          <div
            className="cyber-border rounded-sm relative overflow-hidden"
            style={{ height: '300px', backgroundColor: '#000000', borderColor: `${theme.primary}33` }}
            onMouseEnter={() => setMatrixHover(true)}
            onMouseLeave={() => setMatrixHover(false)}
          >
            <canvas
              ref={matrixCanvasRef}
              className="w-full h-full"
              style={{ display: 'block' }}
            />

            {/* Hover indicator */}
            <AnimatePresence>
              {matrixHover && (
                <motion.div
                  className="absolute top-2 right-2 font-mono text-[10px] px-2 py-1 rounded-sm"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: theme.primary,
                    border: `1px solid ${theme.primary}33`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  BOOST ACTIVE
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connect button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                onClick={handleConnect}
                className="font-mono font-bold text-sm px-6 py-3 border-2 rounded-sm tracking-widest transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color:
                    connectState === 'connected'
                      ? '#00ff41'
                      : connectState === 'connecting'
                        ? '#ffcc00'
                        : theme.primary,
                  borderColor:
                    connectState === 'connected'
                      ? '#00ff41'
                      : connectState === 'connecting'
                        ? '#ffcc00'
                        : theme.primary,
                  textShadow:
                    connectState === 'connected'
                      ? '0 0 10px #00ff41'
                      : connectState === 'connecting'
                        ? '0 0 10px #ffcc00'
                        : theme.glow,
                  boxShadow:
                    connectState === 'connected'
                      ? '0 0 20px #00ff41'
                      : connectState === 'connecting'
                        ? '0 0 20px #ffcc00'
                        : `0 0 10px ${theme.primary}`,
                }}
                whileTap={{ scale: 0.9 }}
                disabled={connectState !== 'idle'}
              >
                {connectState === 'idle' && (
                  <>
                    <Radio className="inline-block mr-2" size={14} />
                    CONNECT
                  </>
                )}
                {connectState === 'connecting' && (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeatType: "loop", repeat: Infinity, ease: 'linear' }}
                      className="inline-block mr-2"
                    >
                      ⟳
                    </motion.span>
                    CONNECTING...
                  </>
                )}
                {connectState === 'connected' && (
                  <>
                    <Eye className="inline-block mr-2" size={14} />
                    CONNECTED
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ===== INTERACTIVE ELEMENTS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* HACK THE SYSTEM */}
          <div
            className="cyber-border rounded-sm relative overflow-hidden p-6"
            style={{ backgroundColor: '#0a0014', borderColor: `${theme.primary}33` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} style={{ color: theme.primary }} />
              <h3 className="font-mono text-sm font-bold tracking-widest" style={{ color: theme.primary }}>
                HACK THE SYSTEM
              </h3>
            </div>

            <p className="font-mono text-xs mb-4" style={{ color: '#888' }}>
              {'>'} Initiate full system override sequence. Warning: this may cause visual anomalies.
            </p>

            <motion.button
              onClick={handleHack}
              disabled={hackCooldown > 0 || hackPhase !== 'idle'}
              className="w-full font-mono font-bold text-base px-6 py-4 border-2 rounded-sm tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: hackCooldown > 0 ? '#1a001a' : '#1a002a',
                color: hackCooldown > 0 ? '#444' : theme.primary,
                borderColor: hackCooldown > 0 ? '#222' : theme.primary,
                textShadow: hackCooldown > 0 ? 'none' : theme.glow,
                boxShadow: hackCooldown > 0 ? 'none' : `0 0 15px ${theme.primary}40`,
              }}
              whileHover={hackCooldown <= 0 ? { scale: 1.02 } : {}}
              whileTap={hackCooldown <= 0 ? { scale: 0.98 } : {}}
            >
              {hackCooldown > 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <Lock size={16} />
                  COOLDOWN: {hackCooldown}s
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Skull size={16} />
                  HACK THE SYSTEM
                </span>
              )}
            </motion.button>

            {hackCooldown > 0 && (
              <div className="mt-3 w-full h-1 rounded-sm overflow-hidden" style={{ backgroundColor: '#1a001a' }}>
                <motion.div
                  className="h-full rounded-sm"
                  style={{ backgroundColor: theme.primary }}
                  animate={{ width: `${((5 - hackCooldown) / 5) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            )}
          </div>

          {/* Glitch Text Generator */}
          <div
            className="cyber-border rounded-sm relative overflow-hidden p-6"
            style={{ backgroundColor: '#0a0014', borderColor: `${theme.primary}33` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Keyboard size={18} style={{ color: theme.primary }} />
              <h3 className="font-mono text-sm font-bold tracking-widest" style={{ color: theme.primary }}>
                GLITCH TEXT GENERATOR
              </h3>
            </div>

            <input
              type="text"
              value={glitchText}
              onChange={(e) => setGlitchText(e.target.value)}
              placeholder="Type something..."
              className="w-full font-mono text-sm px-3 py-2 mb-4 rounded-sm border bg-transparent outline-none focus:ring-1"
              style={{
                backgroundColor: '#0d001a',
                color: theme.primary,
                borderColor: `${theme.primary}44`,
                caretColor: theme.primary,
                ['--tw-ring-color' as string]: theme.primary,
              }}
            />

            {glitchDisplay && (
              <div className="p-4 rounded-sm" style={{ backgroundColor: '#0d001a', minHeight: '60px' }}>
                <div
                  className="glitch-text font-mono text-xl sm:text-2xl font-black tracking-wider break-words"
                  data-text={glitchText}
                  style={{
                    color: '#ffffff',
                    textShadow: `
                      0 0 10px ${theme.primary},
                      3px 0 0 #ff0040,
                      -3px 0 0 #00ffff
                    `,
                  }}
                >
                  {glitchDisplay}
                </div>
              </div>
            )}

            {!glitchDisplay && (
              <div
                className="p-4 rounded-sm font-mono text-xs text-center"
                style={{ backgroundColor: '#0d001a', color: '#333', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {'> AWAITING INPUT...'}
              </div>
            )}
          </div>
        </div>

        {/* ===== FOOTER DECORATION ===== */}
        <div className="text-center">
          <div
            className="font-mono text-[10px] tracking-widest pb-4"
            style={{ color: '#333' }}
          >
            {'// GLITCH_SECTION v1.0.0 — CYBERPUNK AESTHETIC MODULE //'}
          </div>
          <div
            className="h-px mx-auto max-w-md"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
            }}
          />
        </div>
      </div>
    </section>
  )
}
