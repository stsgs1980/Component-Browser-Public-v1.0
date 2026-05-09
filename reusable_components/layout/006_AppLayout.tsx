// Project: DS Reference
// Category: layout
// Source: design-systems\DS Reference\src\components\layout
// Lines: 50

'use client'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { SearchModal } from '@/components/common/SearchModal'
import { useNavigationStore } from '@/store/navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { activeSection, sidebarOpen } = useNavigationStore()
  const isHomePage = activeSection === 'home'

  // Landing layout для главной страницы
  if (isHomePage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
        <SearchModal />
      </div>
    )
  }

  // Dashboard layout для остальных страниц
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
          <div className="container mx-auto px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
      <SearchModal />
    </div>
  )
}
