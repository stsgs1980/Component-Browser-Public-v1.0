// Project: Portfolio-Conversion
// Category: components
// Source: showcases\Portfolio-Conversion\src\components
// Lines: 99

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const savedTheme = localStorage.getItem('theme') as Theme | null
  return savedTheme || 'system'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement

    const getEffectiveTheme = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return theme
    }

    const effectiveTheme = getEffectiveTheme()

    // Apply theme to document
    root.classList.remove('light', 'dark')
    root.classList.add(effectiveTheme)

    // Update CSS variables for Tailwind dark mode
    if (effectiveTheme === 'dark') {
      root.style.setProperty('--background', '0 0% 3.9%')
      root.style.setProperty('--foreground', '0 0% 98%')
    } else {
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--foreground', '0 0% 3.9%')
    }

    // Save preference
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }

  const getIcon = () => {
    if (theme === 'light') return <Sun size={20} />
    if (theme === 'dark') return <Moon size={20} />
    return <Monitor size={20} />
  }

  const getLabel = () => {
    if (theme === 'light') return 'Light mode'
    if (theme === 'dark') return 'Dark mode'
    return 'System theme'
  }

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className="relative p-2 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={getLabel()}
        title={getLabel()}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
        >
          {getIcon()}
        </motion.div>
      </button>

      {/* Tooltip */}
      <motion.div
        className="absolute right-0 top-full mt-2 px-3 py-1.5 text-xs font-mono text-white bg-neutral-800 border border-neutral-700 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 0, y: -5 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {getLabel()}
      </motion.div>
    </div>
  )
}
