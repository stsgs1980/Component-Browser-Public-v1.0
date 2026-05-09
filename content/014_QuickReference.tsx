'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Search,
  Copy,
  Check,
  RotateCcw,
  RotateCcwIcon,
  Info,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react'

// ============================================
// Exported Interfaces
// ============================================

/** Color utility classes applied to cards and badges per item */
export interface ColorClasses {
  bg: string
  bgDark: string
  text: string
  textDark: string
  border: string
  borderDark: string
  accentBg: string
  accentBgDark: string
  badge: string
  badgeDark: string
}

/** A single reference item displayed as a flip-card */
export interface QuickReferenceItem {
  id: string
  title: string
  description: string
  icon?: React.ReactNode
  colorClasses?: ColorClasses
  code?: string
  codeLanguage?: string
  category?: string
  tags?: string[]
  tips?: string[]
  warnings?: string[]
  metadata?: Record<string, string | number>
}

/** One option inside a filter group */
export interface FilterOption {
  label: string
  value: string
}

/** A group of filter buttons that maps to a metadata key on items */
export interface FilterGroup {
  key: string
  label: string
  options: FilterOption[]
}

/** Props for the QuickReference component */
export interface QuickReferenceProps {
  /** Section title shown in the header card */
  title?: string
  /** Description shown below the title */
  description?: string
  /** Header icon (defaults to BookOpen) */
  icon?: React.ReactNode
  /** The reference items to display */
  items: QuickReferenceItem[]
  /** Filter groups that map to `metadata` keys on items */
  filters?: FilterGroup[]
  /** Extra fields to include in search (in addition to title, description, tags, tips, warnings) */
  extraSearchableFields?: string[]
  /** Message when no items match (default: "No items found") */
  emptyMessage?: string
  /** Label for the "best for" / tags section (default: "Best for") */
  tagsLabel?: string
  /** Label for tips section (default: "Tips") */
  tipsLabel?: string
  /** Label for warnings section (default: "Warnings") */
  warningsLabel?: string
}

// ============================================
// Defaults
// ============================================

const DEFAULT_COLOR: ColorClasses = {
  bg: 'bg-slate-50',
  bgDark: 'dark:bg-slate-950/40',
  text: 'text-slate-700',
  textDark: 'dark:text-slate-300',
  border: 'border-slate-200',
  borderDark: 'dark:border-slate-800',
  accentBg: 'bg-slate-100',
  accentBgDark: 'dark:bg-slate-900/30',
  badge: 'bg-slate-100 text-slate-700',
  badgeDark: 'dark:bg-slate-900/30 dark:text-slate-300',
}

// ============================================
// Syntax Highlighting (lightweight Python helper)
// ============================================

const PYTHON_KEYWORDS = [
  'def', 'class', 'if', 'else', 'elif', 'for', 'in', 'return',
  'import', 'from', 'as', 'not', 'and', 'or', 'is', 'with',
  'self', 'None', 'True', 'False', 'lambda', 'try', 'except',
  'raise', 'finally', 'while', 'break', 'continue', 'pass',
  'yield', 'async', 'await',
]

const JS_KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for',
  'while', 'class', 'new', 'this', 'async', 'await', 'import', 'from',
  'export', 'default', 'try', 'catch', 'throw', 'typeof', 'instanceof',
  'true', 'false', 'null', 'undefined', 'switch', 'case', 'break',
]

function getKeywords(lang?: string): string[] {
  if (!lang) return []
  const l = lang.toLowerCase()
  if (l.startsWith('py')) return PYTHON_KEYWORDS
  if (l.startsWith('js') || l.startsWith('ts') || l.startsWith('type')) return JS_KEYWORDS
  return PYTHON_KEYWORDS
}

function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (!keywords.length) return <>{text}</>
  const parts: React.ReactNode[] = []
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g')
  let key = 0
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} className="text-zinc-300">
          {text.slice(lastIndex, match.index)}
        </span>
      )
    }
    parts.push(
      <span key={key++} className="text-sky-400 dark:text-sky-300 font-semibold">
        {match[0]}
      </span>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={key++} className="text-zinc-300">
        {text.slice(lastIndex)}
      </span>
    )
  }

  return <>{parts}</>
}

function HighlightedCode({ code, language }: { code: string; language?: string }) {
  const keywords = useMemo(() => getKeywords(language), [language])

  const highlightLine = (line: string) => {
    const trimmed = line.trimStart()
    // Comments
    if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
      return <span className="text-emerald-600 dark:text-emerald-400">{line}</span>
    }

    const tokens: React.ReactNode[] = []
    let remaining = line

    // Handle quoted strings
    const stringRegex = /(["'`])(?:(?!\1|\\).|\\.)*\1|f(["'])((?:(?!\2|\\).|\\.)*)\2/g

    let key = 0
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = stringRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        const before = remaining.slice(lastIndex, match.index)
        tokens.push(
          <span key={key++}>{highlightKeywords(before, keywords)}</span>
        )
      }
      tokens.push(
        <span key={key++} className="text-amber-600 dark:text-amber-400">
          {match[0]}
        </span>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < remaining.length) {
      tokens.push(
        <span key={key++}>{highlightKeywords(remaining.slice(lastIndex), keywords)}</span>
      )
    }

    return <>{tokens}</>
  }

  const lines = code.split('\n')

  return (
    <div className="rounded-lg bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 overflow-hidden">
      {/* File header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-zinc-500 ml-2">{language ?? 'Code'}</span>
        </div>
      </div>
      {/* Code */}
      <div className="p-4 overflow-x-auto max-h-80 overflow-y-auto custom-scrollbar">
        <pre className="text-xs leading-relaxed font-mono">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="inline-block w-8 text-right mr-4 text-zinc-600 select-none shrink-0">
                  {i + 1}
                </span>
                <span className="text-zinc-300 whitespace-pre">{highlightLine(line)}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

// ============================================
// Reference Card (flip to reveal code)
// ============================================

function ReferenceCard({
  item,
  tagsLabel,
  tipsLabel,
  warningsLabel,
}: {
  item: QuickReferenceItem
  tagsLabel: string
  tipsLabel: string
  warningsLabel: string
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!item.code) return
    try {
      await navigator.clipboard.writeText(item.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [item.code])

  const c = item.colorClasses ?? DEFAULT_COLOR
  const hasCode = !!item.code

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '380px',
        }}
        onClick={() => hasCode && setIsFlipped(!isFlipped)}
        role={hasCode ? 'button' : undefined}
        tabIndex={hasCode ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasCode && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setIsFlipped(!isFlipped)
          }
        }}
        aria-label={hasCode ? `${item.title} — click to view code` : item.title}
      >
        {/* Front side */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl border shadow-sm"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Card className={`h-full border ${c.border} ${c.borderDark} ${c.bg} ${c.bgDark} transition-shadow hover:shadow-md`}>
            <CardContent className="p-4 flex flex-col h-full gap-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon && (
                    <div className={`h-9 w-9 rounded-lg ${c.accentBg} ${c.accentBgDark} flex items-center justify-center shrink-0 ${c.text} ${c.textDark}`}>
                      {item.icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                  </div>
                </div>
              </div>

              {/* Category & metadata badges */}
              {(item.category || (item.metadata && Object.keys(item.metadata).length > 0)) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {item.category && (
                    <Badge variant="outline" className="micro-text">
                      <Info className="h-2.5 w-2.5 mr-1" />
                      {item.category}
                    </Badge>
                  )}
                  {item.metadata?.map !== undefined && (
                    <Badge variant="outline" className="micro-text">
                      {item.metadata.map as string}
                    </Badge>
                  )}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <p className="micro-text font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    {tagsLabel}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 micro-text font-medium ${c.accentBg} ${c.accentBgDark} ${c.text} ${c.textDark}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips & Warnings */}
              {(item.tips || item.warnings) && (
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  {item.tips && item.tips.length > 0 && (
                    <div>
                      <p className="micro-text font-medium text-green-600 dark:text-green-400 mb-1">
                        <Lightbulb className="h-3 w-3 inline mr-0.5" />
                        {tipsLabel}
                      </p>
                      <ul className="space-y-0.5">
                        {item.tips.map((tip) => (
                          <li key={tip} className="text-[11px] text-muted-foreground leading-snug">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.warnings && item.warnings.length > 0 && (
                    <div>
                      <p className="micro-text font-medium text-red-500 dark:text-red-400 mb-1">
                        <AlertTriangle className="h-3 w-3 inline mr-0.5" />
                        {warningsLabel}
                      </p>
                      <ul className="space-y-0.5">
                        {item.warnings.map((w) => (
                          <li key={w} className="text-[11px] text-muted-foreground leading-snug">
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Flip hint */}
              {hasCode && (
                <div className="flex items-center justify-center gap-1 pt-1 micro-text text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <RotateCcw className="h-3 w-3" />
                  Click to view code
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back side — code */}
        {hasCode && (
          <div
            className="absolute inset-0 w-full h-full rounded-xl border shadow-sm"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <Card className="h-full bg-card border-zinc-200 dark:border-zinc-700 flex flex-col">
              <CardContent className="p-3 flex flex-col h-full gap-2">
                {/* Back header */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    {item.icon && (
                      <div className={`h-7 w-7 rounded-lg ${c.accentBg} ${c.accentBgDark} flex items-center justify-center ${c.text} ${c.textDark}`}>
                        {item.icon}
                      </div>
                    )}
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <Badge variant="secondary" className="micro-text border-0 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Code Example
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopy()
                    }}
                    aria-label="Copy code"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>

                {/* Code */}
                <div className="flex-1 min-h-0">
                  <HighlightedCode code={item.code!} language={item.codeLanguage} />
                </div>

                {/* Flip hint */}
                <div className="flex items-center justify-center gap-1 pt-1 micro-text text-muted-foreground shrink-0">
                  <RotateCcw className="h-3 w-3" />
                  Click to flip back
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// Main Component
// ============================================

export default function QuickReference({
  title = 'Quick Reference — Cheat Sheet',
  description = 'Interactive reference cards with code examples. Click a card to view the code. Use filters to narrow results.',
  icon,
  items,
  filters = [],
  extraSearchableFields = [],
  emptyMessage = 'No items found. Try adjusting your search or resetting filters.',
  tagsLabel = 'Best for',
  tipsLabel = 'Tips',
  warningsLabel = 'Warnings',
}: QuickReferenceProps) {
  // Build initial filter state from filter groups
  const initialFilterState = useMemo(() => {
    const state: Record<string, string> = {}
    for (const fg of filters) {
      const allOption = fg.options[0]
      state[fg.key] = allOption?.value ?? ''
    }
    return state
  }, [filters])

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState(initialFilterState)

  const setFilter = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setActiveFilters(initialFilterState)
  }, [initialFilterState])

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const searchable = [
          item.title,
          item.description,
          item.category ?? '',
          item.code ?? '',
          ...(item.tags ?? []),
          ...(item.tips ?? []),
          ...(item.warnings ?? []),
        ]
          .join(' ')
          .toLowerCase()
        if (!searchable.includes(q)) return false
      }

      // Filter groups
      for (const fg of filters) {
        const activeVal = activeFilters[fg.key]
        if (!activeVal || activeVal === 'all') continue

        const itemVal = item.metadata?.[fg.key]
        if (itemVal === undefined || itemVal === null) return false
        if (String(itemVal) !== activeVal) return false
      }

      return true
    })
  }, [items, searchQuery, filters, activeFilters])

  const activeFilterCount =
    (searchQuery.length > 0 ? 1 : 0) +
    filters.filter((fg) => {
      const val = activeFilters[fg.key]
      const allVal = fg.options[0]?.value ?? ''
      return val !== allVal
    }).length

  const headerIcon = icon ?? (
    <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-900/30 dark:to-rose-900/30 flex items-center justify-center shrink-0">
              {headerIcon}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter panel */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter groups */}
          {filters.length > 0 && (
            <div className="space-y-3">
              {filters.map((fg) => (
                <div key={fg.key} className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground shrink-0 min-w-[80px]">
                    {fg.label}:
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {fg.options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={activeFilters[fg.key] === opt.value ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => setFilter(fg.key, opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filter count & reset */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between pt-1 border-t">
              <p className="text-xs text-muted-foreground">
                Found: <span className="font-semibold text-foreground">{filteredItems.length}</span> of{' '}
                <span className="font-semibold text-foreground">{items.length}</span> items
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={resetFilters}
              >
                <RotateCcwIcon className="h-3 w-3 mr-1" />
                Reset filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card grid */}
      <LayoutGroup>
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <ReferenceCard
                key={item.id}
                item={item}
                tagsLabel={tagsLabel}
                tipsLabel={tipsLabel}
                warningsLabel={warningsLabel}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h4 className="font-semibold text-sm mb-1">No results</h4>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">{emptyMessage}</p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcwIcon className="h-3.5 w-3.5 mr-1.5" />
            Reset filters
          </Button>
        </motion.div>
      )}
    </div>
  )
}
