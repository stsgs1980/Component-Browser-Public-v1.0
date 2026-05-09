'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, User, Send, Trash2 } from 'lucide-react'
import { cn } from 'tailwind-variants'

/**
 * ChatPanel — role-based chat UI with message bubbles, typing indicator,
 * auto-scroll, and textarea input. No domain dependencies.
 *
 * Source: LLM-MEM-GUIDE /src/components/playground/LiveChatDemo.tsx (lines 152-270)
 * De-hardcoded:
 *   - Generic Message interface with role/content/timestamp
 *   - Configurable userLabel/assistantLabel/userIcon/assistantIcon
 *   - Optional tokenCountFn callback for per-message metadata
 *   - Optional onSend callback (was tightly coupled to simulated responses)
 *   - No hardcoded technique selector — accepts optional toolbar slot
 *   - Auto-scroll via useRef + useEffect
 */

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ChatMessageMeta {
  /** Token count for this message (displayed under message) */
  tokens?: number
}

interface ChatPanelProps {
  messages: ChatMessage[]
  onMessagesChange: (messages: ChatMessage[]) => void
  /** Called when user sends a message. Return the new message to append. */
  onSend: (content: string) => ChatMessage | Promise<ChatMessage>
  /** Extract metadata from a message (e.g. token count) */
  getMessageMeta?: (message: ChatMessage) => ChatMessageMeta
  /** Custom header content rendered above the chat */
  headerRight?: React.ReactNode
  /** Content rendered between header and messages */
  toolbar?: React.ReactNode
  /** Label for user role (default: 'You') */
  userLabel?: string
  /** Label for assistant role (default: 'AI') */
  assistantLabel?: string
  /** Icons for user and assistant roles */
  userIcon?: React.ReactNode
  assistantIcon?: React.ReactNode
  /** Placeholder text for input */
  inputPlaceholder?: string
  /** Whether AI is currently "thinking" (shows typing indicator) */
  isTyping?: boolean
  /** Additional class name */
  className?: string
}

export function ChatPanel({
  messages,
  onMessagesChange,
  onSend,
  getMessageMeta,
  headerRight,
  toolbar,
  userLabel = 'You',
  assistantLabel = 'AI',
  userIcon = <User className="size-3 w-3 text-primary" />,
  assistantIcon = <Bot className="size-3 w-3 text-muted-foreground" />,
  inputPlaceholder = 'Type a message...',
  isTyping = false,
  className,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleClear = useCallback(() => {
    onMessagesChange([])
  }, [onMessagesChange])

  const handleSend = useCallback(async () => {
    if (!inputText.trim()) return

    const msg = await onSend(inputText.trim())
    onMessagesChange([...messages, msg])
    setInputText('')
  }, [inputText, onSend, messages, onMessagesChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className={cn('flex flex-col overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2 font-mono text-sm text-primary">
          <Bot className="h-4 w-4" />
          <span>Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleClear} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-sm">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {headerRight}
        </div>
      </div>

      {/* Toolbar slot */}
      {toolbar}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            const meta = getMessageMeta?.(msg)
            return (
              <div key={i} className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] sm:max-w-[75%] rounded-md p-3',
                    isUser
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-card border border-border',
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {isUser ? userIcon : assistantIcon}
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {isUser ? userLabel : assistantLabel}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {meta?.tokens != null && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ~{meta.tokens} tokens
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-muted-foreground/50">
                      {new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-md p-3">
                <div className="flex items-center gap-1.5">
                  <Bot className="h-3 w-3 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            rows={1}
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono min-h-[36px] max-h-[120px]"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="flex items-center justify-center bg-primary text-primary-foreground h-[36px] px-3 rounded-md disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
