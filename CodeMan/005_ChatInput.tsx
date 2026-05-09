'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

export interface ModeOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ChatInputLabels {
  send?: string;
  enterToSend?: string;
  shiftEnterForNewLine?: string;
  poweredBy?: string;
  characterCount?: (count: number) => string;
}

export const DEFAULT_LABELS: ChatInputLabels = {
  enterToSend: 'to send',
  shiftEnterForNewLine: 'for new line',
  poweredBy: 'AI-powered',
  characterCount: (n) => `${n}`,
};

export interface ChatInputStyle {
  containerBg: string;
  containerBorder: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  inputFocusRing: string;
  sendBg: string;
  sendHoverBg: string;
  sendDisabled: string;
  modeMenuBg: string;
  modeMenuBorder: string;
  modeItemHover: string;
  modeItemActive: string;
  modeActiveBorder: string;
  modeActiveBg: string;
  hintText: string;
  kbdBg: string;
  kbdText: string;
  descriptionText: string;
}

export const DARK_STYLE: ChatInputStyle = {
  containerBg: 'rgba(17, 24, 39, 0.95)',
  containerBorder: '#1e293b',
  inputBg: '#1e293b',
  inputBorder: '#334155',
  inputText: '#f9fafb',
  inputPlaceholder: '#6b7280',
  inputFocusRing: 'rgba(59, 130, 246, 0.5)',
  sendBg: '#2563eb',
  sendHoverBg: '#3b82f6',
  sendDisabled: 'rgba(37, 99, 235, 0.5)',
  modeMenuBg: '#1e293b',
  modeMenuBorder: '#334155',
  modeItemHover: '#334155',
  modeItemActive: '#334155',
  modeActiveBorder: 'rgba(59, 130, 246, 0.5)',
  modeActiveBg: 'rgba(59, 130, 246, 0.1)',
  hintText: '#6b7280',
  kbdBg: '#1e293b',
  kbdText: '#94a3b8',
  descriptionText: '#6b7280',
};

export const LIGHT_STYLE: ChatInputStyle = {
  containerBg: '#ffffff',
  containerBorder: '#e2e8f0',
  inputBg: '#f8fafc',
  inputBorder: '#e2e8f0',
  inputText: '#0f172a',
  inputPlaceholder: '#94a3b8',
  inputFocusRing: 'rgba(99, 102, 241, 0.3)',
  sendBg: '#4f46e5',
  sendHoverBg: '#6366f1',
  sendDisabled: 'rgba(79, 70, 229, 0.3)',
  modeMenuBg: '#ffffff',
  modeMenuBorder: '#e2e8f0',
  modeItemHover: '#f1f5f9',
  modeItemActive: '#f1f5f9',
  modeActiveBorder: 'rgba(99, 102, 241, 0.3)',
  modeActiveBg: 'rgba(99, 102, 241, 0.05)',
  hintText: '#94a3b8',
  kbdBg: '#f1f5f9',
  kbdText: '#64748b',
  descriptionText: '#94a3b8',
};

export interface ChatInputProps {
  onSend: (message: string, mode: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  modes?: ModeOption[];
  defaultMode?: string;
  labels?: ChatInputLabels;
  style?: ChatInputStyle;
  showKeyboardHints?: boolean;
  showCharCount?: boolean;
  showPoweredBy?: boolean;
  maxTextareaHeight?: number;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────

export function ChatInput({
  onSend,
  disabled,
  isStreaming,
  placeholder = 'Type a message...',
  modes,
  defaultMode,
  labels = DEFAULT_LABELS,
  style = DARK_STYLE,
  showKeyboardHints = true,
  showCharCount = true,
  showPoweredBy = false,
  maxTextareaHeight = 200,
  className = '',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState(defaultMode || modes?.[0]?.id || 'default');
  const [showModes, setShowModes] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasModes = modes && modes.length > 1;
  const currentMode = modes?.find(m => m.id === mode) || modes?.[0];
  const ModeIcon = currentMode?.icon;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxTextareaHeight)}px`;
    }
  }, [message, maxTextareaHeight]);

  const handleSubmit = () => {
    if (!message.trim() || disabled || isStreaming) return;
    onSend(message.trim(), mode);
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`p-4 backdrop-blur ${className}`} style={{ borderTop: `1px solid ${style.containerBorder}`, backgroundColor: style.containerBg }}>
      {/* Mode selector */}
      {hasModes && (
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <button
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors ${mode !== (defaultMode || modes[0].id) ? '' : ''}`}
              style={{
                borderColor: mode !== (defaultMode || modes[0].id) ? style.modeActiveBorder : style.inputBorder,
                backgroundColor: mode !== (defaultMode || modes[0].id) ? style.modeActiveBg : 'transparent',
                color: style.inputText,
              }}
              onClick={() => setShowModes(!showModes)}
            >
              {ModeIcon && <ModeIcon className="w-4 h-4" />}
              {currentMode?.label}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showModes && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModes(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg shadow-xl overflow-hidden z-50" style={{ backgroundColor: style.modeMenuBg, border: `1px solid ${style.modeMenuBorder}` }}>
                  {modes.map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setMode(m.id); setShowModes(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                        style={{
                          backgroundColor: mode === m.id ? style.modeItemActive : 'transparent',
                          color: style.inputText,
                        }}
                        onMouseEnter={(e) => { if (mode !== m.id) e.currentTarget.style.backgroundColor = style.modeItemHover; }}
                        onMouseLeave={(e) => { if (mode !== m.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <div>
                          <div className="font-medium">{m.label}</div>
                          {m.description && <div className="text-xs" style={{ color: style.descriptionText }}>{m.description}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          {currentMode?.description && (
            <div className="text-xs" style={{ color: style.hintText }}>
              {currentMode.description}
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full rounded-lg px-4 py-3 text-sm resize-none transition-all duration-200 outline-none"
            style={{
              backgroundColor: style.inputBg,
              border: `1px solid ${style.inputBorder}`,
              color: style.inputText,
              placeholder: style.inputPlaceholder,
            }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${style.inputFocusRing}`; e.currentTarget.style.borderColor = style.sendBg; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = style.inputBorder; }}
          />
          {showCharCount && message.length > 0 && (
            <div className="absolute bottom-1 right-3 text-xs" style={{ color: style.hintText }}>
              {labels.characterCount?.(message.length) ?? message.length}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled || isStreaming}
          className="px-4 h-12 rounded-lg text-white transition-colors disabled:cursor-not-allowed"
          style={{ backgroundColor: (!message.trim() || disabled || isStreaming) ? style.sendDisabled : style.sendBg }}
          onMouseEnter={(e) => { if (message.trim() && !disabled && !isStreaming) e.currentTarget.style.backgroundColor = style.sendHoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = (!message.trim() || disabled || isStreaming) ? style.sendDisabled : style.sendBg; }}
        >
          {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>

      {/* Hints */}
      {(showKeyboardHints || showPoweredBy) && (
        <div className="flex items-center justify-between mt-2 text-xs" style={{ color: style.hintText }}>
          {showKeyboardHints && (
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: style.kbdBg, color: style.kbdText }}>Enter</kbd>
                {' '}{labels.enterToSend}
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: style.kbdBg, color: style.kbdText }}>Shift+Enter</kbd>
                {' '}{labels.shiftEnterForNewLine}
              </span>
            </div>
          )}
          {showPoweredBy && <span>{labels.poweredBy}</span>}
        </div>
      )}
    </div>
  );
}

export default ChatInput;
