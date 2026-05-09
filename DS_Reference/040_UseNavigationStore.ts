import { create } from 'zustand'

interface NavigationState {
  /** Current active section / view key */
  activeSection: string
  /** Default section key */
  defaultSection: string
  sidebarOpen: boolean
  searchOpen: boolean
  setActiveSection: (section: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchOpen: (open: boolean) => void
  toggleSearch: () => void
  reset: () => void
}

interface UseNavigationStoreOptions {
  /** Initial active section (default: 'home') */
  defaultSection?: string
  /** Initial sidebar state (default: true) */
  initialSidebarOpen?: boolean
}

/**
 * useNavigationStore — Zustand-хранилище навигационного состояния SPA.
 *
 * Извлечён из DS-Reference (store/navigation.ts).
 * Управляет: активная секция, сайдбар, поиск, модалки.
 *
 * Пример:
 * ```tsx
 * // Создание кастомного стора:
 * const useAppNav = createNavigationStore({ defaultSection: 'dashboard' })
 *
 * // Или прямое использование:
 * const { activeSection, setActiveSection, toggleSidebar } = useNavigationStore()
 * ```
 */
export function createNavigationStore(options: UseNavigationStoreOptions = {}) {
  const { defaultSection = 'home', initialSidebarOpen = true } = options

  return create<NavigationState>((set) => ({
    activeSection: defaultSection,
    defaultSection,
    sidebarOpen: initialSidebarOpen,
    searchOpen: false,
    setActiveSection: (section) => set({ activeSection: section }),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSearchOpen: (open) => set({ searchOpen: open }),
    toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
    reset: () =>
      set({
        activeSection: defaultSection,
        sidebarOpen: initialSidebarOpen,
        searchOpen: false,
      }),
  }))
}

/** Pre-configured store with defaults */
export const useNavigationStore = createNavigationStore()
