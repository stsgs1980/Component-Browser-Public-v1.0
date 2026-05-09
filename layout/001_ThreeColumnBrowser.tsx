'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, type LucideIcon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

interface Category<C> {
  id: string
  name: string
  icon: LucideIcon
  items: C[]
}

interface BrowserItem {
  name: string
  description?: string
}

interface ViewTab {
  id: string
  name: string
  icon: LucideIcon
}

interface ThreeColumnBrowserProps<C extends BrowserItem> {
  open: boolean
  onClose: () => void
  /** Title shown in column 1 header (default: 'Items') */
  title?: string
  categories: Category<C>[]
  /** Tabs shown above the detail panel (e.g. Preview / Code / Props) */
  viewTabs?: ViewTab[]
  /** Optional secondary tabs (e.g. library variants: shadcn / MUI / Chakra) */
  secondaryTabs?: ViewTab[]
  /** Render the detail panel content */
  renderDetail: (item: C, viewTab: string, secondaryTab: string) => ReactNode
  /** Column widths (default: '240px 280px 1fr') */
  columnWidths?: string
  className?: string
}

// ─── Component ────────────────────────────────────────────────

/**
 * ThreeColumnBrowser — полноэкранный 3-колоночный мастер-деталь браузер.
 *
 * Извлечён из DesignSystems-Hub-industrial (page.tsx, lines 2300–3090).
 * Паттерн: Categories → Items → Detail с двухуровневыми табами.
 *
 * Обобщён в дженерик `<C extends BrowserItem>`:
 *   - Колонка 1: список категорий с иконками и счётчиками
 *   - Колонка 2: список элементов выбранной категории
 *   - Колонка 3: панель деталей с контекстными табами
 *
 * Подходит для:
 *   - Браузеров компонентов (design system docs)
 *   - Файловых менеджеров
 *   - CMS / admin-панелей
 *   - API reference browsers
 *   - Asset managers
 *
 * Пример:
 * ```tsx
 * <ThreeColumnBrowser
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="UI Components"
 *   categories={categories}
 *   viewTabs={[
 *     { id: 'preview', name: 'Preview', icon: Eye },
 *     { id: 'code', name: 'Code', icon: Code2 },
 *   ]}
 *   renderDetail={(comp, tab) => tab === 'preview' ? <Preview /> : <Code />}
 * />
 * ```
 */
export function ThreeColumnBrowser<C extends BrowserItem>({
  open,
  onClose,
  title = 'Items',
  categories,
  viewTabs,
  secondaryTabs,
  renderDetail,
  columnWidths = '240px 280px 1fr',
  className,
}: ThreeColumnBrowserProps<C>) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<C | null>(null)
  const [viewTab, setViewTab] = useState<string>(viewTabs?.[0]?.id ?? '')
  const [secondaryTab, setSecondaryTab] = useState<string>(secondaryTabs?.[0]?.id ?? '')

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const items = selectedCategory?.items ?? []

  // Reset item when category changes
  const handleCategorySelect = (id: string) => {
    const isCurrentlySelected = selectedCategoryId === id
    setSelectedCategoryId(isCurrentlySelected ? null : id)
    setSelectedItem(null)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="three-column-browser"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed inset-0 z-[100] bg-background flex ${className ?? ''}`}
        >
          <div className={`grid h-full w-full`} style={{ gridTemplateColumns: columnWidths }}>

            {/* ─── Column 1: Categories ─── */}
            <div className="border-r border-border flex flex-col h-full">
              <div className="h-16 px-4 flex items-center gap-3 border-b border-border flex-shrink-0">
                <button
                  onClick={onClose}
                  className="w-10 h-10 border-2 border-foreground/20 flex items-center justify-center hover:border-foreground transition-all flex-shrink-0"
                  aria-label="Close"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-base font-bold truncate">{title}</span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {categories.map((category) => {
                  const IconComponent = category.icon
                  const isSelected = selectedCategoryId === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full h-14 px-4 flex items-center gap-3 transition-colors text-left ${
                        isSelected ? 'bg-muted/50' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-foreground' : 'border-border'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{category.name}</span>
                      <span className="text-sm text-muted-foreground w-6 text-right flex-shrink-0">
                        {category.items.length}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${
                          isSelected ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ─── Column 2: Items List ─── */}
            <div className="border-r border-border flex flex-col h-full">
              <div className="h-16 px-4 flex items-center border-b border-border flex-shrink-0">
                <span className="text-base font-bold truncate">
                  {selectedCategory?.name ?? title}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {selectedCategoryId ? (
                  items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() =>
                        setSelectedItem({
                          ...item,
                          // Preserve any extra fields for renderDetail
                        } as C)
                      }
                      className={`w-full h-16 px-4 text-left transition-colors ${
                        selectedItem?.name === item.name
                          ? 'bg-muted/50 border-l-2 border-foreground'
                          : 'hover:bg-muted/30 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="text-sm font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    &larr; Select a category
                  </div>
                )}
              </div>
            </div>

            {/* ─── Column 3: Detail Panel ─── */}
            <div className="flex flex-col overflow-hidden h-full">
              {/* Breadcrumb header */}
              <div className="h-16 px-4 flex items-center border-b border-border flex-shrink-0">
                {selectedItem ? (
                  <>
                    <span className="text-sm text-muted-foreground">{selectedCategory?.name}</span>
                    <span className="text-muted-foreground mx-2">/</span>
                    <span className="text-base font-bold truncate">{selectedItem.name}</span>
                  </>
                ) : (
                  <span className="text-base font-bold">Preview</span>
                )}
              </div>

              {/* Two-level tabs */}
              {selectedItem && (viewTabs || secondaryTabs) && (
                <div className="h-14 flex items-center justify-center gap-4 px-4 border-b border-border flex-shrink-0">
                  {secondaryTabs && (
                    <>
                      <div className="flex gap-1">
                        {secondaryTabs.map((tab) => {
                          const IconComponent = tab.icon
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setSecondaryTab(tab.id)}
                              className={`h-9 px-4 text-sm font-medium whitespace-nowrap transition-all ${
                                secondaryTab === tab.id
                                  ? 'bg-foreground text-background'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                              }`}
                            >
                              {tab.name}
                            </button>
                          )
                        })}
                      </div>
                      <div className="w-px h-8 bg-border" />
                    </>
                  )}
                  {viewTabs && (
                    <div className="flex gap-2">
                      {viewTabs.map((tab) => {
                        const IconComponent = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setViewTab(tab.id)}
                            className={`h-9 px-4 text-sm font-medium flex items-center gap-2 border transition-all ${
                              viewTab === tab.id
                                ? 'bg-foreground text-background border-foreground'
                                : 'text-muted-foreground border-border hover:border-foreground/50'
                            }`}
                          >
                            {tab.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {selectedItem ? (
                  <div className="p-6">{renderDetail(selectedItem, viewTab, secondaryTab)}</div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      {selectedCategoryId ? 'Select an item from the list' : 'Select a category to begin'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
