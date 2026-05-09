/**
 * useIconRegistry — Dynamic icon resolution by string key.
 * Maps string names to React icon components for use in data-driven UIs
 * (nav menus, tile grids, tree views, etc.).
 *
 * De-hardcoded from: carbon-design-system-guide (iconMap pattern)
 * - Extracted from a hardcoded Record<string, ReactNode> into a reusable hook
 * - Supports registration of new icons at runtime
 * - Returns a lookup function with a configurable fallback
 * - Generic: works with any icon library (Lucide, Heroicons, etc.)
 */

import { useCallback, useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Layout,
  Target,
  Settings,
  Box,
  Palette,
  Type,
  Sparkles,
  Smartphone,
  Layers,
  AlertTriangle,
  FolderTree,
  FolderKanban,
  BookOpen,
  Blocks,
  Hexagon,
  Database,
  Search,
  Code,
  Zap,
  Globe,
  Shield,
  Sliders,
  FileText,
  Users,
  BarChart3,
  Bell,
  Home,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

/** Default icon registry — maps string names to Lucide icons */
const defaultRegistry: Record<string, LucideIcon> = {
  Layout,
  Target,
  Settings,
  Box,
  Palette,
  Type,
  Sparkles,
  Smartphone,
  Layers,
  AlertTriangle,
  FolderTree,
  FolderKanban,
  BookOpen,
  Blocks,
  Hexagon,
  Database,
  Search,
  Code,
  Zap,
  Globe,
  Shield,
  Sliders,
  FileText,
  Users,
  BarChart3,
  Bell,
  Home,
  ChevronRight,
  ExternalLink,
}

export interface UseIconRegistryOptions {
  /** Custom icons to merge with the default registry */
  customIcons?: Record<string, LucideIcon>
  /** Default fallback icon when a key is not found (default: Box) */
  fallbackIcon?: LucideIcon
  /** Default icon size (default: 16) */
  defaultSize?: number
}

export interface UseIconRegistryReturn {
  /** Get an icon component by string key */
  getIcon: (key: string) => LucideIcon
  /** Render an icon by key with given size */
  renderIcon: (key: string, size?: number) => React.ReactElement | null
  /** Check if an icon key exists in the registry */
  hasIcon: (key: string) => boolean
  /** Full merged registry */
  registry: Record<string, LucideIcon>
}

export function useIconRegistry(options: UseIconRegistryOptions = {}): UseIconRegistryReturn {
  const {
    customIcons = {},
    fallbackIcon = Box,
    defaultSize = 16,
  } = options

  const registry = useMemo(
    () => ({ ...defaultRegistry, ...customIcons }),
    [customIcons]
  )

  const getIcon = useCallback(
    (key: string): LucideIcon => {
      return registry[key] ?? fallbackIcon
    },
    [registry, fallbackIcon]
  )

  const renderIcon = useCallback(
    (key: string, size?: number): React.ReactElement | null => {
      const Icon = getIcon(key)
      return <Icon size={size ?? defaultSize} />
    },
    [getIcon, defaultSize]
  )

  const hasIcon = useCallback(
    (key: string): boolean => key in registry,
    [registry]
  )

  return { getIcon, renderIcon, hasIcon, registry }
}
