'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  ClipboardList,
  Filter,
  LucideIcon,
} from 'lucide-react'

// ============================================
// Exported TypeScript Interfaces
// ============================================

/** Difficulty level for a template */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

/** Tag type for categorising templates within a category */
export type Tag = 'system prompt' | 'function' | 'pipeline' | 'handler' | 'configuration' | string

/** Colour token classes used to theme each category */
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
  promptBg: string
  promptBgDark: string
  promptBorder: string
  promptBorderDark: string
}

/** A single prompt template entry */
export interface PromptTemplate {
  /** Unique identifier */
  id: string
  /** Display title */
  title: string
  /** Short description shown under the title */
  description: string
  /** Full prompt text (supports {{VARIABLE}} placeholders) */
  prompt: string
  /** Difficulty level */
  difficulty: Difficulty
  /** Tags for filtering */
  tags: Tag[]
}

/** A category grouping multiple templates */
export interface CategoryData {
  /** Unique category slug */
  id: string
  /** Display name */
  name: string
  /** Icon element rendered in headers */
  icon: React.ReactNode
  /** Tailwind colour name for reference */
  color: string
  /** Tailwind colour class map */
  colorClasses: ColorClasses
  /** Templates in this category */
  templates: PromptTemplate[]
}

/** Configuration labels (all optional, with English defaults) */
export interface PromptTemplatesLabels {
  title: string
  description: string
  searchPlaceholder: string
  allCategories: string
  templatesLabel: string
  categoriesLabel: string
  resetFilters: string
  showing: string
  of: string
  copied: string
  copy: string
  copyAll: string
  allCopied: string
  noResults: string
  noResultsHint: string
  resetFiltersBtn: string
  lines: string
  showMore: string
  collapse: string
  systemPromptLabel: string
  templateSingular: string
  templatePlural: string
}

/** Props for the PromptTemplates component */
export interface PromptTemplatesProps {
  /** Array of categories, each containing templates */
  categories: CategoryData[]
  /** Optional label overrides (English defaults provided) */
  labels?: Partial<PromptTemplatesLabels>
  /** Optional CSS class for the root container */
  className?: string
}

// ============================================
// Default English Labels
// ============================================

const DEFAULT_LABELS: PromptTemplatesLabels = {
  title: 'Prompt Gallery — Ready-made Templates',
  description:
    'A collection of production-ready system prompts and code patterns. Copy and adapt them for your project.',
  searchPlaceholder: 'Search templates, prompts, tags...',
  allCategories: 'All',
  templatesLabel: 'templates',
  categoriesLabel: 'categories',
  resetFilters: 'Reset',
  showing: 'Showing',
  of: 'of',
  copied: 'Copied!',
  copy: 'Copy',
  copyAll: 'Copy All',
  allCopied: 'All copied!',
  noResults: 'No templates found',
  noResultsHint: 'Try adjusting your search or reset filters',
  resetFiltersBtn: 'Reset Filters',
  lines: 'lines',
  showMore: 'Show {count} more lines',
  collapse: 'Collapse',
  systemPromptLabel: 'SYSTEM PROMPT',
  templateSingular: 'template',
  templatePlural: 'templates',
}

// ============================================
// Difficulty badge styling
// ============================================

const difficultyClasses: Record<Difficulty, { label: string; className: string }> = {
  beginner: {
    label: 'Beginner',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0',
  },
  advanced: {
    label: 'Advanced',
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0',
  },
}

// ============================================
// Tag badge styling (extensible with unknown keys)
// ============================================

const tagClasses: Record<string, string> = {
  'system prompt': 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  function: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  pipeline: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  handler: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  configuration: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
}

// ============================================
// Utilities
// ============================================

const COLLAPSE_THRESHOLD = 12

/** Regex to match {{VARIABLE}} placeholders */
const VARIABLE_RE = /\{\{(\w+)\}\}/g

// ============================================
// Prompt Display with variable highlighting
// ============================================

function PromptDisplay({
  prompt,
  colorClasses: cc,
  collapsed,
  onToggle,
  labels,
}: {
  prompt: string
  colorClasses: ColorClasses
  collapsed: boolean
  onToggle: () => void
  labels: PromptTemplatesLabels
}) {
  const lines = prompt.split('\n')
  const isLong = lines.length > COLLAPSE_THRESHOLD
  const visibleLines = collapsed && isLong ? lines.slice(0, COLLAPSE_THRESHOLD) : lines
  const hiddenCount = lines.length - COLLAPSE_THRESHOLD

  /** Split a line into text and variable spans */
  function highlightVariables(line: string) {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    let keyIdx = 0

    while ((match = VARIABLE_RE.exec(line)) !== null) {
      // Text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={keyIdx++}>{line.slice(lastIndex, match.index)}</span>
        )
      }
      // The {{VAR}} match itself
      parts.push(
        <span
          key={keyIdx++}
          className="bg-yellow-200/60 dark:bg-yellow-700/40 text-yellow-900 dark:text-yellow-200 px-0.5 rounded font-semibold"
        >
          {match[0]}
        </span>
      )
      lastIndex = match.index + match[0].length
    }
    // Remaining text
    if (lastIndex < line.length) {
      parts.push(<span key={keyIdx++}>{line.slice(lastIndex)}</span>)
    }
    return parts.length > 0 ? parts : line
  }

  return (
    <div className={`rounded-lg border ${cc.promptBorder} ${cc.promptBorderDark} ${cc.promptBg} ${cc.promptBgDark} overflow-hidden`}>
      {/* Prompt block header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="micro-text text-muted-foreground ml-1 font-medium">{labels.systemPromptLabel}</span>
        </div>
        <span className="micro-text text-muted-foreground">
          {lines.length} {labels.lines}
        </span>
      </div>
      {/* Prompt text with line numbers and variable highlighting */}
      <div className="p-3 overflow-x-auto max-h-64 overflow-y-auto custom-scrollbar">
        <pre className="text-xs leading-relaxed font-mono">
          <code>
            {visibleLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="inline-block w-7 text-right mr-3 text-muted-foreground/40 select-none shrink-0 micro-text">
                  {i + 1}
                </span>
                <span className="text-foreground/80 whitespace-pre">{highlightVariables(line)}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
      {/* Expand / collapse toggle */}
      {isLong && (
        <button
          onClick={onToggle}
          className="w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-border/50 hover:bg-muted/30 flex items-center justify-center gap-1"
        >
          {collapsed ? (
            <>
              <ChevronDown className="h-3 w-3" />
              {labels.showMore.replace('{count}', String(hiddenCount))}
            </>
          ) : (
            <>
              <ChevronUp className="h-3 w-3" />
              {labels.collapse}
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ============================================
// Copy Button
// ============================================

function CopyButton({
  text,
  labels,
}: {
  text: string
  labels: PromptTemplatesLabels
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [text])

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 text-xs"
      onClick={handleCopy}
      aria-label={labels.copy}
    >
      <motion.div
        initial={false}
        animate={{ rotate: copied ? 360 : 0, scale: copied ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </motion.div>
      <span className={copied ? 'text-green-500' : ''}>
        {copied ? labels.copied : labels.copy}
      </span>
    </Button>
  )
}

// ============================================
// Template Card
// ============================================

function TemplateCard({
  template,
  category,
  labels,
}: {
  template: PromptTemplate
  category: CategoryData
  labels: PromptTemplatesLabels
}) {
  const [collapsed, setCollapsed] = useState(true)
  const cc = category.colorClasses
  const diff = difficultyClasses[template.difficulty]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={`h-full border ${cc.border} ${cc.borderDark} ${cc.bg} ${cc.bgDark} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}>
        <CardContent className="p-4 flex flex-col h-full gap-3">
          {/* Title with icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className={`h-8 w-8 rounded-lg ${cc.accentBg} ${cc.accentBgDark} flex items-center justify-center shrink-0 ${cc.text} ${cc.textDark} mt-0.5`}>
                {category.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm leading-tight">{template.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>
            </div>
          </div>

          {/* Prompt display */}
          <div className="flex-1">
            <PromptDisplay
              prompt={template.prompt}
              colorClasses={cc}
              collapsed={collapsed}
              onToggle={() => setCollapsed(!collapsed)}
              labels={labels}
            />
          </div>

          {/* Tags and copy */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className={`micro-text ${diff.className}`}>
                {diff.label}
              </Badge>
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center rounded-md px-1.5 py-0.5 micro-text font-medium ${tagClasses[tag] ?? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <CopyButton text={template.prompt} labels={labels} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// Copy All Button (per-category)
// ============================================

function CopyAllButton({
  templates,
  categoryName,
  labels,
}: {
  templates: PromptTemplate[]
  categoryName: string
  labels: PromptTemplatesLabels
}) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = useCallback(async () => {
    const allText = templates
      .map((t) => `=== ${t.title} ===\n${t.prompt}`)
      .join('\n\n---\n\n')
    try {
      await navigator.clipboard.writeText(allText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }, [templates])

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 text-xs"
      onClick={handleCopyAll}
      aria-label={`${labels.copyAll} — ${categoryName}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: copied ? 360 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <ClipboardList className="h-3.5 w-3.5" />
        )}
      </motion.div>
      <span className={copied ? 'text-green-500' : 'text-muted-foreground'}>
        {copied ? labels.allCopied : labels.copyAll}
      </span>
    </Button>
  )
}

// ============================================
// Main Component
// ============================================

export default function PromptTemplates({
  categories,
  labels: partialLabels,
  className,
}: PromptTemplatesProps) {
  const labels: PromptTemplatesLabels = { ...DEFAULT_LABELS, ...partialLabels }

  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Total template count
  const totalTemplates = useMemo(
    () => categories.reduce((acc, cat) => acc + cat.templates.length, 0),
    [categories]
  )

  // Category filter options
  const categoryFilters = useMemo(
    () => [
      { id: 'all', label: labels.allCategories },
      ...categories.map((cat) => ({ id: cat.id, label: cat.name })),
    ],
    [categories, labels.allCategories]
  )

  // Filtered categories and templates
  const filteredData = useMemo(() => {
    let cats =
      activeCategory === 'all'
        ? categories
        : categories.filter((cat) => cat.id === activeCategory)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      cats = cats
        .map((cat) => ({
          ...cat,
          templates: cat.templates.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q) ||
              t.prompt.toLowerCase().includes(q) ||
              t.tags.some((tag) => tag.toLowerCase().includes(q))
          ),
        }))
        .filter((cat) => cat.templates.length > 0)
    }

    return cats
  }, [activeCategory, searchQuery, categories])

  const visibleCount = useMemo(
    () => filteredData.reduce((acc, cat) => acc + cat.templates.length, 0),
    [filteredData]
  )

  // Reset filters
  const resetFilters = useCallback(() => {
    setActiveCategory('all')
    setSearchQuery('')
  }, [])

  const hasActiveFilters = activeCategory !== 'all' || searchQuery.length > 0

  return (
    <div className={`space-y-5 ${className ?? ''}`}>
      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-100 to-rose-100 dark:from-violet-900/30 dark:to-rose-900/30 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-1">{labels.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {labels.description}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {totalTemplates} {labels.templatesLabel}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {categories.length} {labels.categoriesLabel}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  production-ready
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls panel */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={labels.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            {categoryFilters.map((filter) => {
              const isActive = activeCategory === filter.id
              const cat =
                filter.id !== 'all'
                  ? categories.find((c) => c.id === filter.id)
                  : null
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2.5 gap-1.5"
                  onClick={() => setActiveCategory(filter.id)}
                >
                  {cat ? (
                    <span className={isActive ? 'inherit' : ''}>{cat.icon}</span>
                  ) : null}
                  {filter.label}
                </Button>
              )
            })}
          </div>

          {/* Active filters indicator and reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {labels.showing}{' '}
                <span className="font-semibold text-foreground">{visibleCount}</span>{' '}
                {labels.of}{' '}
                <span className="font-semibold text-foreground">{totalTemplates}</span>{' '}
                {labels.templatesLabel}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={resetFilters}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {labels.resetFilters}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template grid by category */}
      <LayoutGroup>
        <AnimatePresence mode="wait">
          {filteredData.map((category) => (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* Category header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-lg ${category.colorClasses.accentBg} ${category.colorClasses.accentBgDark} flex items-center justify-center ${category.colorClasses.text} ${category.colorClasses.textDark}`}
                  >
                    {category.icon}
                  </div>
                  <h4 className="font-semibold text-sm">{category.name}</h4>
                  <Badge variant="outline" className="micro-text">
                    {category.templates.length}{' '}
                    {category.templates.length === 1
                      ? labels.templateSingular
                      : labels.templatePlural}
                  </Badge>
                </div>
                <CopyAllButton
                  templates={category.templates}
                  categoryName={category.name}
                  labels={labels}
                />
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {category.templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      category={category}
                      labels={labels}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>

      {/* Empty state */}
      {filteredData.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h4 className="font-semibold text-sm mb-1">{labels.noResults}</h4>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {labels.noResultsHint}
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            {labels.resetFiltersBtn}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
