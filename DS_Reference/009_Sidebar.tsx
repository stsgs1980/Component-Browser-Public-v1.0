// Project: DS Reference
// Category: layout
// Source: design-systems\DS Reference\src\components\layout
// Lines: 160

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, Home, Box, Puzzle, Grid3X3, Layers, Package, Code2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useNavigationStore, sections } from '@/store/navigation'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Box,
  Puzzle,
  Grid3X3,
  Layers,
  Package,
  Code2,
  FolderOpen
}

export function Sidebar() {
  const { sidebarOpen, activeSection, setActiveSection, setSidebarOpen } = useNavigationStore()

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId)
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar - fixed */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-[280px] border-r bg-background lg:hidden"
          >
            <SidebarContent
              activeSection={activeSection}
              handleSectionClick={handleSectionClick}
              setSidebarOpen={setSidebarOpen}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar - static */}
      <aside
        className={cn(
          "hidden lg:block shrink-0 h-[calc(100vh-3.5rem)] w-[280px] border-r bg-background transition-all duration-300",
          !sidebarOpen && "w-0 overflow-hidden"
        )}
      >
        <SidebarContent
          activeSection={activeSection}
          handleSectionClick={handleSectionClick}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>
    </TooltipProvider>
  )
}

function SidebarContent({
  activeSection,
  handleSectionClick,
  setSidebarOpen
}: {
  activeSection: string
  handleSectionClick: (id: string) => void
  setSidebarOpen: (open: boolean) => void
}) {
  // Фильтруем главную из навигации
  const navSections = sections.filter(s => s.id !== 'home')

  return (
    <div className="flex h-full flex-col">
      {/* Desktop collapse button */}
      <div className="hidden lg:flex items-center justify-end p-2 border-b">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Скрыть панель</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile header */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <span className="font-semibold">Навигация</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navSections.map((section) => {
            const Icon = iconMap[section.icon]
            const isActive = activeSection === section.id

            return (
              <Button
                key={section.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-secondary'
                )}
                onClick={() => handleSectionClick(section.id)}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{section.name}</span>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>Справочник дизайн-систем</p>
          <p>Версия 1.5.0</p>
        </div>
      </div>
    </div>
  )
}
