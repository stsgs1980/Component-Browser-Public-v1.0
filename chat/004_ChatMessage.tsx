'use client';

import { memo, useState, useEffect, useMemo } from 'react';
import { Copy, Check, ChevronUp, ChevronDown, Blocks, Play, Sparkles, FileCode2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

export interface MessageData {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface CodeBlockData {
  id: string;
  language: string;
  code: string;
  expanded: boolean;
}

export interface ChatMessageTheme {
  userColor: string;
  assistantColor: string;
  userBg: string;
  assistantBg: string;
  text: string;
  subtext: string;
  surface0: string;
  surface1: string;
  crust: string;
  mantle: string;
  accent: string;
  border: string;
}

export const DARK_THEME: ChatMessageTheme = {
  userColor: '#89b4fa',
  assistantColor: '#a6e3a1',
  userBg: 'rgba(137, 180, 250, 0.08)',
  assistantBg: 'rgba(166, 227, 161, 0.08)',
  text: '#cdd6f4',
  subtext: '#6c7086',
  surface0: '#313244',
  surface1: '#45475a',
  crust: '#11111b',
  mantle: '#1e1e2e',
  accent: '#b4befe',
  border: '#313244',
};

export const LIGHT_THEME: ChatMessageTheme = {
  userColor: '#3b82f6',
  assistantColor: '#22c55e',
  userBg: 'rgba(59, 130, 246, 0.08)',
  assistantBg: 'rgba(34, 197, 94, 0.08)',
  text: '#1e293b',
  subtext: '#94a3b8',
  surface0: '#f1f5f9',
  surface1: '#e2e8f0',
  crust: '#f8fafc',
  mantle: '#ffffff',
  accent: '#6366f1',
  border: '#e2e8f0',
};

export interface ChatMessageLabels {
  user: string;
  assistant: string;
  copy: string;
  copied: string;
  collapse: string;
  expand: string;
  blocks: (count: number) => string;
  lines: (count: number) => string;
}

export const DEFAULT_LABELS: ChatMessageLabels = {
  user: 'USER',
  assistant: 'ASSISTANT',
  copy: 'Copy',
  copied: 'Copied',
  collapse: 'Collapse',
  expand: 'Expand',
  blocks: (n) => `${n} block${n > 1 ? 's' : ''}`,
  lines: (n) => `${n} line${n !== 1 ? 's' : ''}`,
};

export interface ChatMessageProps {
  message: MessageData;
  theme?: ChatMessageTheme;
  labels?: ChatMessageLabels;
  onCopy?: (text: string, id: string) => void;
  copiedId?: string | null;
  locale?: string;
  maxCodeLines?: number;
  showTimeline?: boolean;
}

// ─── Code Block Extraction ────────────────────────────────────────────

function extractCodeBlocks(content: string): CodeBlockData[] {
  const blocks: CodeBlockData[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  let idx = 0;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({ id: `code-${idx++}`, language: match[1] || 'text', code: match[2].trimEnd(), expanded: false });
  }
  return blocks;
}

function removeCodeBlocks(content: string): string {
  return content.replace(/```[\s\S]*?```/g, '').trim();
}

// ─── CodeBlock sub-component ──────────────────────────────────────────

interface CodeBlockProps {
  block: CodeBlockData;
  theme: ChatMessageTheme;
  labels: ChatMessageLabels;
  onToggle: (id: string) => void;
  onCopy?: (text: string, id: string) => void;
  copiedId?: string | null;
  maxLines?: number;
}

const CodeBlock = memo(function CodeBlock({ block, theme, labels, onToggle, onCopy, copiedId, maxLines }: CodeBlockProps) {
  const lines = block.code.split('\n');
  const lineCount = lines.length;
  const maxLineNum = lineCount.toString().length;
  const displayLines = maxLines && !block.expanded ? lines.slice(0, maxLines) : lines;
  const isTruncated = maxLines && !block.expanded && lineCount > maxLines;

  return (
    <div className="rounded overflow-hidden" style={{ backgroundColor: theme.crust, border: `1px solid ${theme.border}` }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-2 py-1 cursor-pointer select-none"
        style={{ backgroundColor: theme.mantle }}
        onClick={() => onToggle(block.id)}
      >
        <div className="flex items-center gap-2">
          <Blocks className="w-3 h-3" style={{ color: theme.accent }} />
          <span style={{ color: theme.accent }} className="text-[10px] font-medium">{block.language}</span>
          <span style={{ color: theme.subtext }} className="text-[9px]">{labels.lines(lineCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          {onCopy && (
            <button
              onClick={(e) => { e.stopPropagation(); onCopy(block.code, block.id); }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] hover:opacity-80"
              style={{ color: copiedId === block.id ? theme.assistantColor : theme.subtext, backgroundColor: theme.surface0 }}
            >
              {copiedId === block.id ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              {copiedId === block.id ? labels.copied : labels.copy}
            </button>
          )}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ backgroundColor: theme.surface0, color: theme.subtext }}>
            {block.expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span className="text-[9px]">{block.expanded ? labels.collapse : labels.expand}</span>
          </div>
        </div>
      </div>

      {/* Code */}
      {block.expanded || (maxLines && lineCount <= maxLines) ? (
        <div className="p-2 font-mono text-[11px] overflow-x-auto" style={{ backgroundColor: theme.crust }}>
          {displayLines.map((line, i) => (
            <div key={i} className="flex group/code hover:bg-white/5">
              <span className="select-none pr-3 text-right" style={{ color: theme.surface1, minWidth: `${maxLineNum + 2}ch` }}>{i + 1}</span>
              <span style={{ color: theme.text }}>{line}</span>
            </div>
          ))}
        </div>
      ) : null}
      {isTruncated && (
        <button
          onClick={() => onToggle(block.id)}
          className="w-full py-1 text-[9px] text-center hover:opacity-80"
          style={{ color: theme.accent, backgroundColor: theme.mantle }}
        >
          {labels.expand} ({lineCount} {labels.lines(lineCount).toLowerCase()})
        </button>
      )}
    </div>
  );
});

// ─── ChatMessage Component ────────────────────────────────────────────

const ChatMessage = memo(function ChatMessage({
  message,
  theme = DARK_THEME,
  labels = DEFAULT_LABELS,
  onCopy,
  copiedId,
  locale = 'en-US',
  showTimeline: showTimelineProp = true,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [showTimeline, setShowTimeline] = useState(false);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlockData[]>([]);

  useEffect(() => {
    setCodeBlocks(extractCodeBlocks(message.content));
  }, [message.content]);

  const textContent = useMemo(() => removeCodeBlocks(message.content), [message.content]);

  const toggleCodeBlock = (id: string) => {
    setCodeBlocks(prev => prev.map(block => block.id === id ? { ...block, expanded: !block.expanded } : block));
  };

  const timestamp = message.timestamp || Date.now();
  const timeStr = new Date(timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="group relative mb-3"
      onMouseEnter={() => setShowTimeline(true)}
      onMouseLeave={() => setShowTimeline(false)}
    >
      {/* Timeline */}
      {showTimelineProp && (
        <div className={`absolute left-0 top-0 bottom-0 flex flex-col items-center transition-all duration-200 ${showTimeline ? 'opacity-100' : 'opacity-0'}`} style={{ width: '28px' }}>
          <div className="w-px flex-1" style={{ backgroundColor: isUser ? theme.userColor : theme.assistantColor }} />
          <div className="text-[8px] px-1 py-0.5 rounded whitespace-nowrap mb-1" style={{ backgroundColor: theme.surface0, color: theme.subtext }}>
            {timeStr}
          </div>
        </div>
      )}

      <div className="ml-7">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: isUser ? theme.userBg : theme.assistantBg }}>
            {isUser ? (
              <Play className="w-2.5 h-2.5" style={{ color: theme.userColor }} />
            ) : (
              <Sparkles className="w-2.5 h-2.5" style={{ color: theme.assistantColor }} />
            )}
            <span style={{ color: isUser ? theme.userColor : theme.assistantColor }} className="text-[9px] font-semibold uppercase tracking-wider">
              {isUser ? labels.user : labels.assistant}
            </span>
          </div>

          {codeBlocks.length > 0 && (
            <div className="flex items-center gap-1 px-1 py-0.5 rounded" style={{ backgroundColor: theme.surface0 }}>
              <FileCode2 className="w-2.5 h-2.5" style={{ color: theme.accent }} />
              <span style={{ color: theme.subtext }} className="text-[9px]">{labels.blocks(codeBlocks.length)}</span>
            </div>
          )}
        </div>

        {/* Text */}
        {textContent && (
          <div className="text-[11px] leading-relaxed whitespace-pre-wrap mb-2" style={{ color: theme.text }}>
            {textContent}
          </div>
        )}

        {/* Code blocks */}
        {codeBlocks.length > 0 && (
          <div className="space-y-2">
            {codeBlocks.map(block => (
              <CodeBlock
                key={block.id}
                block={block}
                theme={theme}
                labels={labels}
                onToggle={toggleCodeBlock}
                onCopy={onCopy}
                copiedId={copiedId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatMessage;
