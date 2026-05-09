'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

/**
 * CodeBlock — отображение кода с кнопкой «Копировать».
 *
 * Паттерн повторялся 3+ раза (ComponentsSection, DeveloperGuideSection, LivePreview):
 *   <div className="relative rounded-lg bg-muted p-4">
 *     <pre><code>{code}</code></pre>
 *     <Button onClick={copy}>copied ? <Check> : <Copy></Button>
 *   </div>
 *
 * После клика иконка Copy меняется на Check с зелёной галочкой на 2 секунды.
 */
export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback — выделение текста
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`relative rounded-lg bg-muted p-4 ${className ?? ''}`}>
      {language && (
        <span className="absolute left-3 top-2 text-xs text-muted-foreground font-mono">
          {language}
        </span>
      )}
      <pre className="text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
