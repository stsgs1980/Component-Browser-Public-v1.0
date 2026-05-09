'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  BookOpen,
  Zap,
  DollarSign,
  Settings,
  Star,
  TrendingUp,
  X,
  MessageSquare,
  Sparkles,
  Eye,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/*  */
/*  Exported Types                                                  */
/*  */

export type Difficulty = 'basic' | 'intermediate' | 'advanced'

export interface FaqItem {
  id: string
  question: string
  answer: React.ReactNode
  difficulty: Difficulty
  popular?: boolean
  demoTab?: string
}

export interface FaqColorClasses {
  bg: string
  text: string
  darkBg: string
  border: string
}

export interface FaqCategory {
  id: string
  title: string
  icon: LucideIcon
  color: string
  colorClasses: FaqColorClasses
  items: FaqItem[]
}

export interface FaqAccordionProps {
  /** FAQ categories with nested items */
  categories: FaqCategory[]
  /** Optional header title (default: "Frequently Asked Questions") */
  title?: string
  /** Optional header description */
  description?: string
  /** Optional custom difficulty labels */
  difficultyLabels?: Record<Difficulty, string>
  /** Optional color theme overrides (keyed by category color name) */
  categoryColors?: Record<string, FaqColorClasses>
  /** Optional custom search placeholder */
  searchPlaceholder?: string
}

/*  */
/*  Default color class mapping (static to avoid dynamic Tailwind)  */
/*  */

const defaultCategoryColors: Record<string, FaqColorClasses> = {
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600 dark:text-emerald-400',
    darkBg: 'dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600 dark:text-cyan-400',
    darkBg: 'dark:bg-cyan-900/30',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  violet: {
    bg: 'bg-violet-100',
    text: 'text-violet-600 dark:text-violet-400',
    darkBg: 'dark:bg-violet-900/30',
    border: 'border-violet-200 dark:border-violet-800',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-600 dark:text-amber-400',
    darkBg: 'dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
  rose: {
    bg: 'bg-rose-100',
    text: 'text-rose-600 dark:text-rose-400',
    darkBg: 'dark:bg-rose-900/30',
    border: 'border-rose-200 dark:border-rose-800',
  },
}

/*  */
/*  Difficulty badge mapping                                       */
/*  */

const defaultDifficultyLabels: Record<Difficulty, string> = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const difficultyStyles: Record<Difficulty, string> = {
  basic: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

/*  */
/*  Utility: extract text content from React nodes                 */
/*  */

export function extractTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractTextContent).join(' ')
  if (typeof node === 'object' && 'props' in node) {
    return extractTextContent((node as React.ReactElement<{ children?: React.ReactNode }>).props.children ?? '')
  }
  return ''
}

/*  */
/*  Helper: highlight matching text                                */
/*  */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-700/50 rounded px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

/*  */
/*  Stats Bar Component                                            */
/*  */

function StatsBar({
  totalQuestions,
  totalCategories,
  helpfulRatings,
  popularId,
  onScrollToPopular,
}: {
  totalQuestions: number
  totalCategories: number
  helpfulRatings: { yes: number; no: number }
  popularId: string | null
  onScrollToPopular: () => void
}) {
  const total = helpfulRatings.yes + helpfulRatings.no
  const avgRating = total > 0 ? Math.round((helpfulRatings.yes / total) * 100) : 0

  const stats = [
    {
      icon: MessageSquare,
      label: 'Questions',
      value: totalQuestions,
      color: 'text-emerald-500',
    },
    {
      icon: HelpCircle,
      label: 'Categories',
      value: totalCategories,
      color: 'text-violet-500',
    },
    {
      icon: Star,
      label: 'Helpfulness',
      value: `${avgRating}%`,
      color: 'text-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted/50 shrink-0">
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold leading-none">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          </div>
        )
      })}
      {popularId && (
        <button
          onClick={onScrollToPopular}
          className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow cursor-pointer text-left col-span-2 sm:col-span-1 group"
        >
          <div className="flex items-center justify-center h-9 w-9 rounded-md bg-rose-100 dark:bg-rose-900/30 shrink-0">
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Most popular</div>
            <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 group-hover:underline mt-0.5">
              View &rarr;
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

/*  */
/*  Search Bar Component                                           */
/*  */

function SearchBar({
  query,
  onQueryChange,
  resultCount,
  totalCount,
  placeholder,
}: {
  query: string
  onQueryChange: (q: string) => void
  resultCount: number
  totalCount: number
  placeholder?: string
}) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder ?? 'Search questions\u2026'}
        className="pl-10 pr-20 h-11"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {query && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {resultCount} of {totalCount}
          </span>
        )}
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}

/*  */
/*  Category Filter Tabs                                           */
/*  */

function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  itemCounts,
}: {
  categories: FaqCategory[]
  activeCategory: string
  onCategoryChange: (id: string) => void
  itemCounts: Record<string, number>
}) {
  const totalItems = Object.values(itemCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin mb-6">
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          activeCategory === 'all'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        All
        <span
          className={`ml-0.5 text-xs ${
            activeCategory === 'all'
              ? 'text-primary-foreground/70'
              : 'text-muted-foreground/60'
          }`}
        >
          {totalItems}
        </span>
      </button>
      {categories.map((cat) => {
        const Icon = cat.icon
        const count = itemCounts[cat.id] || 0
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? `${cat.colorClasses.bg} ${cat.colorClasses.text} shadow-sm`
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.title}
            <span
              className={`ml-0.5 text-xs ${
                isActive
                  ? 'opacity-70'
                  : 'text-muted-foreground/60'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/*  */
/*  FAQ Item Component                                             */
/*  */

function FaqItemCard({
  item,
  isOpen,
  onToggle,
  query,
  onHelpful,
  helpfulData,
  difficultyLabels,
}: {
  item: FaqItem
  isOpen: boolean
  onToggle: () => void
  query: string
  onHelpful: (id: string, type: 'yes' | 'no') => void
  helpfulData: Record<string, { yes: number; no: number }>
  difficultyLabels: Record<Difficulty, string>
}) {
  const label = difficultyLabels[item.difficulty]
  const style = difficultyStyles[item.difficulty]
  const stats = helpfulData[item.id] || { yes: 0, no: 0 }
  const hasVoted = stats.yes > 0 || stats.no > 0

  return (
    <div className="rounded-lg border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded micro-text font-medium ${style}`}
            >
              {label}
            </span>
            {item.popular && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded micro-text font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 float-badge">
                <TrendingUp className="h-2.5 w-2.5" />
                Popular
              </span>
            )}
            {item.demoTab && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded micro-text font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <Sparkles className="h-2.5 w-2.5" />
                Demo
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
            <HighlightText text={item.question} query={query} />
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="border-t pt-4">
                {item.answer}
              </div>

              {/* Demo link */}
              {item.demoTab && (
                <div className="mt-3 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    See demo: <strong className="text-primary">{item.demoTab}</strong>
                  </span>
                </div>
              )}

              {/* Helpfulness */}
              <div className="mt-3 pt-3 border-t flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onHelpful(item.id, 'yes')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      stats.yes > 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-muted/50 text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Yes
                  </button>
                  <button
                    onClick={() => onHelpful(item.id, 'no')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      stats.no > 0
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                        : 'bg-muted/50 text-muted-foreground hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/30 dark:hover:text-rose-300'
                    }`}
                  >
                    <ThumbsDown className="h-3 w-3" />
                    No
                  </button>
                </div>
                {hasVoted && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Yes: {stats.yes} / No: {stats.no}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/*  */
/*  Empty State Component                                          */
/*  */

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16 px-4"
    >
      <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-semibold text-lg mb-2">Nothing found</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        No questions matched &laquo;{query}&raquo;. Try rephrasing or removing some words.
      </p>
      <Button variant="outline" size="sm" onClick={onClear}>
        <X className="h-3.5 w-3.5 mr-1" />
        Clear search
      </Button>
    </motion.div>
  )
}

/*  */
/*  Main FaqAccordion Component                                    */
/*  */

export default function FaqAccordion({
  categories: faqCategories,
  title,
  description,
  difficultyLabels: customDifficultyLabels,
  searchPlaceholder,
}: FaqAccordionProps) {
  /* Merged config */
  const difficultyLabels = { ...defaultDifficultyLabels, ...customDifficultyLabels }

  /* State */
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [allExpanded, setAllExpanded] = useState(false)
  const [helpfulData, setHelpfulData] = useState<Record<string, { yes: number; no: number }>>({})
  const popularRef = useRef<HTMLDivElement>(null)

  /* Flatten all items */
  const allItems = useMemo(
    () => faqCategories.flatMap((cat) => cat.items),
    [faqCategories]
  )

  const totalQuestions = allItems.length
  const totalCategories = faqCategories.length

  /* Filter items by search query */
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems
    const q = searchQuery.toLowerCase().trim()
    return allItems.filter((item) => {
      const questionMatch = item.question.toLowerCase().includes(q)
      const answerText = extractTextContent(item.answer)
      const answerMatch = answerText.toLowerCase().includes(q)
      return questionMatch || answerMatch
    })
  }, [allItems, searchQuery])

  /* Filter items by category */
  const displayedItems = useMemo(() => {
    if (activeCategory === 'all') return filteredItems
    const category = faqCategories.find((c) => c.id === activeCategory)
    if (!category) return filteredItems
    const categoryItemIds = new Set(category.items.map((i) => i.id))
    return filteredItems.filter((item) => categoryItemIds.has(item.id))
  }, [filteredItems, activeCategory, faqCategories])

  /* Item counts per category (respecting search) */
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    faqCategories.forEach((cat) => {
      const catIds = new Set(cat.items.map((i) => i.id))
      counts[cat.id] = filteredItems.filter((item) => catIds.has(item.id)).length
    })
    return counts
  }, [filteredItems, faqCategories])

  /* Total helpful ratings */
  const totalHelpful = useMemo(() => {
    let yes = 0
    let no = 0
    Object.values(helpfulData).forEach((v) => {
      yes += v.yes
      no += v.no
    })
    return { yes, no }
  }, [helpfulData])

  /* Most popular item */
  const popularItemId = useMemo(() => {
    const popularItem = allItems.find((i) => i.popular)
    return popularItem?.id || null
  }, [allItems])

  /* Get category for an item */
  const getCategoryForItem = useCallback(
    (itemId: string): FaqCategory | undefined => {
      return faqCategories.find((cat) => cat.items.some((i) => i.id === itemId))
    },
    [faqCategories]
  )

  /* Toggle item */
  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allExpanded) {
          next.clear()
        }
        next.add(id)
      }
      return next
    })
  }, [allExpanded])

  /* Expand all / Collapse all */
  const handleToggleAll = useCallback(() => {
    if (allExpanded) {
      setOpenItems(new Set())
      setAllExpanded(false)
    } else {
      const allIds = new Set(displayedItems.map((i) => i.id))
      setOpenItems(allIds)
      setAllExpanded(true)
    }
  }, [allExpanded, displayedItems])

  /* Handle helpful vote */
  const handleHelpful = useCallback((id: string, type: 'yes' | 'no') => {
    setHelpfulData((prev) => ({
      ...prev,
      [id]: {
        yes: (prev[id]?.yes || 0) + (type === 'yes' ? 1 : 0),
        no: (prev[id]?.no || 0) + (type === 'no' ? 1 : 0),
      },
    }))
  }, [])

  /* Scroll to popular item */
  const scrollToPopular = useCallback(() => {
    if (!popularItemId) return
    const cat = getCategoryForItem(popularItemId)
    if (cat && activeCategory !== 'all' && activeCategory !== cat.id) {
      setActiveCategory(cat.id)
    }
    if (!openItems.has(popularItemId)) {
      toggleItem(popularItemId)
    }
    setTimeout(() => {
      popularRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [popularItemId, activeCategory, getCategoryForItem, openItems, toggleItem])

  /* Group displayed items by category */
  const groupedItems = useMemo(() => {
    if (activeCategory !== 'all') {
      const cat = faqCategories.find((c) => c.id === activeCategory)
      if (!cat) return []
      return [{ category: cat, items: displayedItems.filter((i) => cat.items.some((ci) => ci.id === i.id)) }]
    }
    return faqCategories
      .map((cat) => ({
        category: cat,
        items: displayedItems.filter((i) => cat.items.some((ci) => ci.id === i.id)),
      }))
      .filter((group) => group.items.length > 0)
  }, [displayedItems, activeCategory, faqCategories])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            {title ?? 'Frequently Asked Questions'}
          </h2>
          {description !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleAll}
          className="shrink-0"
        >
          {allExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Collapse all
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Expand all
            </>
          )}
        </Button>
      </div>

      {/* Stats Bar */}
      <StatsBar
        totalQuestions={totalQuestions}
        totalCategories={totalCategories}
        helpfulRatings={totalHelpful}
        popularId={popularItemId}
        onScrollToPopular={scrollToPopular}
      />

      {/* Search Bar */}
      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        resultCount={displayedItems.length}
        totalCount={totalQuestions}
        placeholder={searchPlaceholder}
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={faqCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        itemCounts={itemCounts}
      />

      {/* FAQ Items */}
      {displayedItems.length === 0 ? (
        <EmptyState query={searchQuery} onClear={() => setSearchQuery('')} />
      ) : (
        <div className="space-y-8">
          {groupedItems.map((group) => {
            const CatIcon = group.category.icon
            return (
              <div key={group.category.id}>
                {/* Category header */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`h-7 w-7 rounded-md ${group.category.colorClasses.bg} ${group.category.colorClasses.darkBg} flex items-center justify-center`}
                  >
                    <CatIcon className={`h-3.5 w-3.5 ${group.category.colorClasses.text}`} />
                  </div>
                  <h3 className="text-sm font-semibold">{group.category.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {group.items.length}
                  </Badge>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {group.items.map((item, idx) => {
                    const isPopular = item.id === popularItemId
                    return (
                      <motion.div
                        key={item.id}
                        ref={isPopular ? popularRef : undefined}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                      >
                        <FaqItemCard
                          item={item}
                          isOpen={openItems.has(item.id)}
                          onToggle={() => toggleItem(item.id)}
                          query={searchQuery}
                          onHelpful={handleHelpful}
                          helpfulData={helpfulData}
                          difficultyLabels={difficultyLabels}
                        />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer info */}
      {displayedItems.length > 0 && (
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-muted-foreground">
            <MessageSquare className="inline h-3 w-3 mr-1" />
            Showing {displayedItems.length} of {totalQuestions} questions
            {searchQuery && (
              <span>
                {' '}
                &middot; Search: &laquo;{searchQuery}&raquo;
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
