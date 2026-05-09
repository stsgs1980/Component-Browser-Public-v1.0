'use client'

import { useEffect, useCallback } from 'react'

/**
 * useKeyboardShortcuts — declarative keyboard shortcut registration.
 * Generic alternative to per-app shortcut hooks.
 *
 * Source: Wiki-Codex-v2 /src/hooks/use-keyboard-shortcuts.ts
 * De-hardcoded:
 *   - Accepts generic keybindings map instead of hardcoded store actions
 *   - Configurable modifier key (Ctrl/Cmd/Meta)
 *   - Proper cleanup on unmount
 *
 * @example
 * useKeyboardShortcuts({
 *   'Ctrl+n': () => createNote(),
 *   'Ctrl+u': () => openUpload(),
 *   'Escape': () => goBack(),
 * })
 */

export interface KeyCombo {
  /** Key string (e.g. 'n', 'u', 'Escape', 'Enter') */
  key: string
  /** Required modifier: Ctrl, Meta, Alt, Shift, or null */
  mod?: 'ctrl' | 'meta' | 'alt' | 'shift' | null
}

function parseCombo(combo: string): KeyCombo {
  const parts = combo.toLowerCase().split('+').map(s => s.trim())
  let mod: KeyCombo['mod'] = null
  let key = ''

  for (const part of parts) {
    if (part === 'ctrl' || part === 'control') mod = 'ctrl'
    else if (part === 'meta' || part === 'cmd' || part === 'command') mod = 'meta'
    else if (part === 'alt' || part === 'option') mod = 'alt'
    else if (part === 'shift') mod = 'shift'
    else key = part
  }

  return { key, mod }
}

function matchesCombo(event: KeyboardEvent, combo: KeyCombo): boolean {
  if (event.key.toLowerCase() !== combo.key.toLowerCase()) return false

  const hasCtrl = event.ctrlKey || event.metaKey

  switch (combo.mod) {
    case 'ctrl': return hasCtrl
    case 'meta': return event.metaKey
    case 'alt': return event.altKey
    case 'shift': return event.shiftKey
    case null: return !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey
  }
}

export type ShortcutMap = Record<string, () => void>

interface UseKeyboardShortcutsOptions {
  /** Map of "key combo" → callback. Examples: "Ctrl+n", "Escape", "Alt+ArrowUp" */
  shortcuts: ShortcutMap
  /** Only listen when condition is true (e.g. not typing in an input) */
  enabled?: boolean
  /** Prevent default browser behavior for matched shortcuts (default: true) */
  preventDefault?: boolean
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  preventDefault = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    // Skip when typing in input/textarea/select
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      // Allow Escape even in inputs
      if (e.key !== 'Escape') return
    }

    for (const [combo, callback] of Object.entries(shortcuts)) {
      const parsed = parseCombo(combo)
      if (matchesCombo(e, parsed)) {
        if (preventDefault) e.preventDefault()
        callback()
        break
      }
    }
  }, [shortcuts, enabled, preventDefault])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
