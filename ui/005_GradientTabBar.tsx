'use client'

/**
 * GradientTabBar — Tab navigation with gradient-accented active state.
 * Pills with gradient background when active, plain when inactive.
 *
 * De-hardcoded from: Orchestration-of-AI-Agents (main page tab bar)
 * - Replaced hardcoded pattern configs → generic `TabItem[]` prop
 * - Made gradient color, icon, layout configurable
 */

import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  /** Gradient class when active (default: cyan-purple) */
  gradientClass?: string
}

export interface GradientTabBarProps {
  /** Tab items */
  tabs: TabItem[]
  /** Currently active tab ID */
  activeId: string
  /** Callback when a tab is clicked */
  onChange: (tabId: string) => void
  /** Default gradient class for active tab (if not specified per-tab) */
  defaultGradientClass?: string
  /** Additional container class */
  className?: string
}

export function GradientTabBar({
  tabs,
  activeId,
  onChange,
  defaultGradientClass = 'bg-gradient-to-r from-cyan-500 to-purple-500',
  className,
}: GradientTabBarProps) {
  return (
    <div className={cn('inline-flex gap-1 p-1 rounded-full bg-slate-800/50', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              isActive
                ? cn(tab.gradientClass || defaultGradientClass, 'text-white shadow-lg')
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
