// Project: DS Reference
// Category: layout
// Source: design-systems\DS Reference\src\components\layout
// Lines: 89

'use client'

import { Menu, Search, PanelLeftClose, PanelLeft, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useNavigationStore } from '@/store/navigation'

export function Header() {
  const { toggleSidebar, toggleSearch, sidebarOpen, activeSection, setActiveSection } = useNavigationStore()
  const isHomePage = activeSection === 'home'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* Back button - только если не главная */}
        {!isHomePage && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-1"
            onClick={() => setActiveSection('home')}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">На главную</span>
          </Button>
        )}

        {/* Mobile menu button - только если не главная */}
        {!isHomePage && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Открыть меню</span>
          </Button>
        )}

        {/* Desktop sidebar toggle - только если не главная */}
        {!isHomePage && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 hidden lg:flex"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
            <span className="sr-only">
              {sidebarOpen ? 'Скрыть панель' : 'Показать панель'}
            </span>
          </Button>
        )}

        <div className="flex items-center gap-2 flex-1">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveSection('home')}
          >
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">DS</span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">
              Справочник дизайн-систем
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Поиск</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
