'use client'

import { useState, useMemo, useCallback, useRef, type ReactNode, type LucideIcon } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Send,
  UserCircle,
  Bot,
  MessageSquare,
  DollarSign,
  Zap,
  RotateCcw,
  AlertTriangle,
  Eye,
  Sparkles,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
//  Exported Interfaces
// ═══════════════════════════════════════════════════════════════

/** A single chat message exchanged in the playground. */
export interface PlaygroundMessage {
  id: number
  role: 'user' | 'bot'
  text: string
}

/** Tailwind color classes for a single mode button & its processing view. */
export interface ModeColorScheme {
  icon: string
  border: string
  badge: string
  lightBg: string
  lightBorder: string
  accent: string
  badgeAlt: string
}

/** A selectable processing mode rendered as a toggle button. */
export interface PlaygroundMode<TMode extends string = string> {
  id: TMode
  label: string
  icon: LucideIcon
  description: string
  colors: ModeColorScheme
}

/** One stat tile shown below the context bar. */
export interface StatItem {
  icon: LucideIcon
  label: string
  value: string | number
  highlight?: boolean
  highlightClass?: string
}

/** Context passed to the `renderProcessingView` callback. */
export interface ProcessingViewContext<TMode extends string = string> {
  messages: PlaygroundMessage[]
  modeId: TMode
  rawTokenCount: number
  effectiveTokenCount: number
  messageCount: number
  savingsPct: number
  contextPct: number
}

/** Context passed to the `computeEffectiveTokens` callback. */
export interface TokenComputationContext<TMode extends string = string> {
  messages: PlaygroundMessage[]
  modeId: TMode
  rawTokenCount: number
}

/** All props accepted by the generic InteractivePlayground. */
export interface InteractivePlaygroundProps<TMode extends string = string> {
  // ── Title ──────────────────────────────────────────────
  /** Card title shown at the top. */
  title?: string
  /** Icon displayed next to the title. */
  titleIcon?: LucideIcon

  // ── Messages ───────────────────────────────────────────
  /** Seed messages loaded on first render. */
  initialMessages: PlaygroundMessage[]
  /** Pool of bot responses cycled through automatically. */
  botResponses: string[]
  /** Placeholder text in the input textarea. */
  inputPlaceholder?: string

  // ── Modes ──────────────────────────────────────────────
  /** Available processing modes rendered as toggle buttons. */
  modes: PlaygroundMode<TMode>[]
  /** Which mode is selected on first render (defaults to first). */
  defaultModeId?: TMode
  /** Label above the mode selector row. */
  modeSelectorLabel?: string

  // ── Processing View ────────────────────────────────────
  /** Renders the right-hand panel for the active mode. */
  renderProcessingView: (ctx: ProcessingViewContext<TMode>) => ReactNode

  // ── Token Computation ──────────────────────────────────
  /** Computes the effective token count for the active mode. */
  computeEffectiveTokens: (ctx: TokenComputationContext<TMode>) => number

  // ── Stats ──────────────────────────────────────────────
  /** Custom stat tiles. Rendered in a 2×2 (or 2×N) grid. Falls back to built-in defaults when omitted. */
  stats?: (ctx: ProcessingViewContext<TMode>) => StatItem[]

  // ── Configuration ──────────────────────────────────────
  /** Maximum tokens for the context-window bar (default 128 000). */
  maxContextTokens?: number
  /** Cost per token in USD (default $10 / 1M). */
  costPerToken?: number
  /** Delay in ms before the bot "replies" (default 1 200). */
  typingDelay?: number

  // ── Labels ─────────────────────────────────────────────
  chatLabel?: string
  resetLabel?: string
  howItWorksLabel?: string
  contextWindowLabel?: string
  legendFreeLabel?: string
  legendFillingLabel?: string
  legendCriticalLabel?: string

  // ── Callbacks ──────────────────────────────────────────
  /** Called after every full reset (messages, mode, input). */
  onReset?: () => void
}

// ═══════════════════════════════════════════════════════════════
//  Internal Helpers
// ═══════════════════════════════════════════════════════════════

function countTokens(text: string): number {
  if (!text || !text.trim()) return 0
  return Math.ceil(text.split(/\s+/).length * 1.3)
}

function countAllTokens(messages: PlaygroundMessage[]): number {
  return messages.reduce((sum, m) => sum + countTokens(m.text), 0)
}

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function formatCost(tokens: number, costPerToken: number): string {
  const cost = tokens * costPerToken
  if (cost < 0.001) return '< $0.01'
  if (cost < 1) return `$${cost.toFixed(3)}`
  return `$${cost.toFixed(2)}`
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components (internal)
// ═══════════════════════════════════════════════════════════════

function ChatBubble({ msg }: { msg: PlaygroundMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
          msg.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}>
          {msg.role === 'user'
            ? <UserCircle className="h-4 w-4" />
            : <Bot className="h-4 w-4" />}
        </div>
        <div className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
          msg.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border'
        }`}>
          {msg.text}
        </div>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="flex items-start gap-2">
        <div className="shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
          <Bot className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="h-2 w-2 rounded-full bg-muted-foreground/50"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════════════

export default function InteractivePlayground<TMode extends string = string>({
  // Title
  title = 'Interactive Playground',
  titleIcon = Sparkles,
  // Messages
  initialMessages,
  botResponses,
  inputPlaceholder = 'Type a message... (Enter to send)',
  // Modes
  modes,
  defaultModeId,
  modeSelectorLabel = 'Select a processing mode:',
  // Processing
  renderProcessingView,
  computeEffectiveTokens,
  // Stats
  stats: customStats,
  // Config
  maxContextTokens = 128_000,
  costPerToken = 10 / 1_000_000,
  typingDelay = 1200,
  // Labels
  chatLabel = 'Chat',
  resetLabel = 'Reset',
  howItWorksLabel = 'How it works',
  contextWindowLabel = 'Context Window',
  legendFreeLabel = 'Free',
  legendFillingLabel = 'Filling',
  legendCriticalLabel = 'Critical',
  // Callbacks
  onReset,
}: InteractivePlaygroundProps<TMode>) {
  // ── State ──────────────────────────────────────────────
  const startId = initialMessages.length > 0
    ? Math.max(...initialMessages.map(m => m.id)) + 1
    : 1

  const [messages, setMessages] = useState<PlaygroundMessage[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [activeModeId, setActiveModeId] = useState<TMode>(
    defaultModeId ?? (modes.length > 0 ? modes[0].id : ('' as TMode))
  )
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [nextId, setNextId] = useState(startId)
  const botIdxRef = useRef(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Derived: tokens ────────────────────────────────────
  const rawTokens = useMemo(() => countAllTokens(messages), [messages])

  const effectiveTokens = useMemo(
    () => computeEffectiveTokens({ messages, modeId: activeModeId, rawTokenCount: rawTokens }),
    [messages, activeModeId, rawTokens, computeEffectiveTokens],
  )

  const contextPct = useMemo(
    () => Math.min((effectiveTokens / maxContextTokens) * 100, 100),
    [effectiveTokens, maxContextTokens],
  )

  const barColor = useMemo(() => {
    if (contextPct < 50) return 'bg-emerald-500'
    if (contextPct < 80) return 'bg-amber-500'
    return 'bg-red-500'
  }, [contextPct])

  const savingsPct = useMemo(() => {
    if (rawTokens === 0 || effectiveTokens >= rawTokens) return 0
    return Math.round(((rawTokens - effectiveTokens) / rawTokens) * 100)
  }, [rawTokens, effectiveTokens])

  // ── Active mode lookup ─────────────────────────────────
  const activeMode = useMemo(
    () => modes.find(m => m.id === activeModeId),
    [modes, activeModeId],
  )

  // ── Processing view context ────────────────────────────
  const processingCtx = useMemo<ProcessingViewContext<TMode>>(
    () => ({
      messages,
      modeId: activeModeId,
      rawTokenCount: rawTokens,
      effectiveTokenCount: effectiveTokens,
      messageCount: messages.length,
      savingsPct,
      contextPct,
    }),
    [messages, activeModeId, rawTokens, effectiveTokens, savingsPct, contextPct],
  )

  // ── Stats (built-in or custom) ─────────────────────────
  const statItems = useMemo<StatItem[]>(() => {
    if (customStats) return customStats(processingCtx)
    return [
      {
        icon: Zap,
        label: 'Tokens',
        value: formatNumber(effectiveTokens),
      },
      {
        icon: DollarSign,
        label: 'Cost',
        value: formatCost(effectiveTokens, costPerToken),
      },
      {
        icon: MessageSquare,
        label: 'Messages',
        value: messages.length,
      },
      {
        icon: Eye,
        label: 'Savings',
        value: savingsPct > 0 ? `${savingsPct}%` : '\u2014',
        highlight: savingsPct > 0,
        highlightClass: savingsPct > 0 ? 'text-emerald-500' : 'text-muted-foreground',
      },
    ]
  }, [customStats, processingCtx, effectiveTokens, costPerToken, messages.length, savingsPct])

  // ── Handlers ───────────────────────────────────────────

  const handleSend = useCallback(() => {
    const text = inputText.trim()
    if (!text || isBotTyping) return

    const userMsg: PlaygroundMessage = { id: nextId, role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    const newId = nextId + 1
    setNextId(newId)
    setIsBotTyping(true)

    setTimeout(() => {
      const botMsg: PlaygroundMessage = {
        id: newId,
        role: 'bot',
        text: botResponses[botIdxRef.current % botResponses.length],
      }
      setMessages(prev => [...prev, botMsg])
      setNextId(prev => prev + 1)
      setIsBotTyping(false)
      botIdxRef.current++
    }, typingDelay)
  }, [inputText, isBotTyping, nextId, botResponses, typingDelay])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleReset = useCallback(() => {
    setMessages(initialMessages)
    setInputText('')
    setActiveModeId(defaultModeId ?? (modes.length > 0 ? modes[0].id : ('' as TMode)))
    setIsBotTyping(false)
    setNextId(startId)
    botIdxRef.current = 0
    onReset?.()
  }, [initialMessages, defaultModeId, modes, startId, onReset])

  // ═════════════════════════════════════════════════════════
  //  Render
  // ═════════════════════════════════════════════════════════

  const TitleIcon = titleIcon

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TitleIcon className="h-5 w-5 text-amber-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* ── Mode Selector ───────────────────────────── */}
          {modes.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">{modeSelectorLabel}</div>
              <div className="flex flex-wrap gap-2">
                {modes.map((mode) => {
                  const isActive = activeModeId === mode.id
                  const Icon = mode.icon
                  return (
                    <motion.button
                      key={mode.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveModeId(mode.id)}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? `${mode.colors.border} ${mode.colors.lightBg} ${mode.colors.accent} shadow-sm`
                          : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? mode.colors.icon : ''}`} />
                      <span>{mode.label}</span>
                      <span className="hidden sm:inline text-xs opacity-60">&mdash; {mode.description}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Stats Bar ───────────────────────────────── */}
          <div className="space-y-3">
            {/* Context Window Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  {contextWindowLabel}
                </span>
                <span className="font-mono font-medium">
                  {formatNumber(effectiveTokens)} / {formatNumber(maxContextTokens)} tokens
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(contextPct, 1)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${barColor}`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1">
                    <div className="h-1.5 w-3 rounded-full bg-emerald-500" /> {legendFreeLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-1.5 w-3 rounded-full bg-amber-500" /> {legendFillingLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-1.5 w-3 rounded-full bg-red-500" /> {legendCriticalLabel}
                  </span>
                </div>
                <span>100%</span>
              </div>
            </div>

            {/* Context Warning */}
            {contextPct > 60 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  contextPct > 80
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {contextPct > 80
                    ? 'Context nearly full! Older messages will be truncated.'
                    : 'Context is filling up. Data loss will begin once the limit is reached.'}
                </span>
              </motion.div>
            )}

            {/* Stat Tiles */}
            <div className={`grid gap-3 ${statItems.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5'}`}>
              {statItems.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                    </div>
                    <div className={`text-lg font-bold font-mono ${stat.highlight && stat.highlightClass ? stat.highlightClass : ''}`}>
                      {stat.value}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Main Content: Chat + Processing View ──── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chat Panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {chatLabel}
                </span>
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1 h-7">
                  <RotateCcw className="h-3 w-3" />
                  {resetLabel}
                </Button>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4 min-h-[320px] max-h-[420px] overflow-y-auto space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map(msg => (
                    <ChatBubble key={msg.id} msg={msg} />
                  ))}
                </AnimatePresence>
                <AnimatePresence>
                  {isBotTyping && <TypingIndicator />}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={inputPlaceholder}
                  className="min-h-[44px] max-h-[120px] resize-none text-sm flex-1"
                  rows={1}
                  disabled={isBotTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isBotTyping}
                  size="default"
                  className="h-[44px] w-[44px] p-0 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Processing View Panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-2">
                  {activeMode && (
                    <>
                      <activeMode.icon className={`h-4 w-4 ${activeMode.colors.icon}`} />
                      {activeMode.label}
                    </>
                  )}
                </span>
                <Badge variant="outline" className="text-xs">
                  {howItWorksLabel}
                </Badge>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4 min-h-[320px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModeId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    {renderProcessingView(processingCtx)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
