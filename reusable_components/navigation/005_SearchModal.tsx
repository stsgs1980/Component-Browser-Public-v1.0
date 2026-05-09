// Project: DS Reference
// Category: common
// Source: design-systems\DS Reference\src\components\common
// Lines: 123

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNavigationStore, sections } from '@/store/navigation'

export function SearchModal() {
  const { searchOpen, setSearchOpen, setActiveSection } = useNavigationStore()
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, setSearchOpen])

  React.useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  const filteredSections = React.useMemo(() => {
    if (!query) return sections
    return sections.filter((section) =>
      section.name.toLowerCase().includes(query.toLowerCase()) ||
      section.description.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  const handleSelect = (sectionId: string) => {
    setActiveSection(sectionId)
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border bg-background shadow-xl overflow-hidden"
          >
            <div className="flex items-center border-b px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск разделов..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-72 overflow-y-auto">
              <div className="p-2">
                {filteredSections.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground text-sm">
                    Ничего не найдено
                  </p>
                ) : (
                  filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSelect(section.id)}
                      className="w-full rounded-md px-3 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <div className="font-medium truncate">{section.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {section.description}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="border-t px-4 py-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span>Нажмите</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
              <span>+</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">K</kbd>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
