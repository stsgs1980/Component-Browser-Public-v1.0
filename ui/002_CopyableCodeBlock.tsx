'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from './ui-button' // shadcn/ui button

/**
 * CopyableCodeBlock — inline code block with labeled header, hover-reveal copy button,
 * and "ok" confirmation state. No toast dependency — feedback is fully internal.
 *
 * Source: Wiki-Codex-v2 /src/components/codex/instructions-view.tsx (lines 393-430)
 * De-hardcoded:
 *   - Removed useToast dependency
 *   - Added optional onCopy callback
 *   - Made variant/style configurable
 */

interface CopyableCodeBlockProps {
  /** Header label shown above the code */
  label: string
  /** Raw code content */
  code: string
  /** Called after successful copy (optional) */
  onCopy?: (code: string) => void
  /** Confirmation timeout in ms (default: 2000) */
  confirmTimeout?: number
  /** Additional class name for the wrapper */
  className?: string
}

export function CopyableCodeBlock({
  label,
  code,
  onCopy,
  confirmTimeout = 2000,
  className,
}: CopyableCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      onCopy?.(code)
      setTimeout(() => setCopied(false), confirmTimeout)
    } catch {
      // Silently fail — consumer can add their own error handling via onCopy
    }
  }, [code, onCopy, confirmTimeout])

  return (
    <div className={`group relative rounded-md border border-dashed bg-muted/30 overflow-hidden ${className ?? ''}`}>
      <div className="flex items-center justify-between px-3 py-1 border-b border-dashed bg-muted/60">
        <span className="text-[10px] font-mono font-medium text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 gap-1 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono"
          onClick={handleCopy}
        >
          {copied ? (
            <><Check className="size-2.5 text-green-600 dark:text-green-400" /><span className="text-green-600 dark:text-green-400">ok</span></>
          ) : (
            <><Copy className="size-2.5" /><span>copy</span></>
          )}
        </Button>
      </div>
      <pre className="px-3 py-2 overflow-x-auto text-[12px] leading-relaxed">
        <code className="font-mono text-foreground/85 whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}
