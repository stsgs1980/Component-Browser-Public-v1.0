'use client'

import * as React from 'react'

/**
 * useIsMobile — responsive breakpoint detection hook.
 * Returns true when the viewport width is below the given breakpoint.
 *
 * Source: Wiki-Codex-v2 /src/hooks/use-mobile.ts (shadcn/ui boilerplate)
 * De-hardcoded:
 *   - Added configurable breakpoint parameter (default: 768)
 *   - Optional matchMedia query string override
 */

interface UseIsMobileOptions {
  /** Max viewport width in px to be considered "mobile" (default: 768) */
  breakpoint?: number
  /** Custom matchMedia query string. If provided, overrides breakpoint. */
  query?: string
}

export function useIsMobile(options: UseIsMobileOptions = {}): boolean {
  const { breakpoint = 768, query } = options
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(query ?? `(max-width: ${breakpoint - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < breakpoint)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint, query])

  return !!isMobile
}
