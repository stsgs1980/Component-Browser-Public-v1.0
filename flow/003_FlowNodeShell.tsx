'use client';

import React, { memo, useState } from 'react';
import type { NodeProps, HandleProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';

// ─── Types ────────────────────────────────────────────────────────────

export interface FlowNodeConfig {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultLabel: string;
  defaultContent?: string;
}

export interface FlowNodeHandles {
  /** Left/target input handle */
  input?: boolean;
  /** Right/source output handle */
  output?: boolean;
  /** Custom handles (e.g. true/false for condition nodes) */
  custom?: HandleDef[];
}

export interface HandleDef {
  id: string;
  type: 'source' | 'target';
  position: Position;
  color?: string;
  label?: string;
  labelColor?: string;
  topPercent?: string;
}

export interface FlowNodeShellProps {
  data: Record<string, unknown>;
  selected?: boolean;
  config: FlowNodeConfig;
  handles?: FlowNodeHandles;
  width?: number;
  /** Render custom content in the body area */
  renderContent?: (data: Record<string, unknown>) => React.ReactNode;
  /** Badge text in the header */
  badge?: string;
  /** Status indicator in the header (e.g. running spinner) */
  statusIndicator?: React.ReactNode;
  /** Additional content after body (e.g. action buttons) */
  footer?: React.ReactNode;
  /** Empty state text when content is missing */
  emptyText?: string;
  /** Content line clamp */
  lineClamp?: number;
  /** Content max chars for preview */
  maxChars?: number;
  /** Allow expanding content in modal */
  expandable?: boolean;
  className?: string;
}

// ─── Default handles ──────────────────────────────────────────────────

const DEFAULT_HANDLES: FlowNodeHandles = {
  input: true,
  output: true,
  custom: [],
};

// ─── FlowNodeShell Component ──────────────────────────────────────────

export const FlowNodeShell = memo(function FlowNodeShell({
  data,
  selected = false,
  config,
  handles = DEFAULT_HANDLES,
  width = 220,
  renderContent,
  badge,
  statusIndicator,
  footer,
  emptyText = 'No content',
  lineClamp = 2,
  maxChars = 60,
  expandable = false,
  className = '',
}: FlowNodeShellProps) {
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const label = (data.label as string) || config.defaultLabel;
  const content = (data.content as string) || '';
  const hasContent = content && content.length > 0;
  const Icon = config.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewText = content.length > maxChars ? content.slice(0, maxChars) + '...' : content;

  return (
    <>
      <div
        className={`bg-card border-2 rounded-lg shadow-md transition-all duration-150 relative ${className}`}
        style={{
          minWidth: `${width}px`,
          borderColor: selected ? config.color : undefined,
          boxShadow: selected ? `0 4px 12px ${config.color}30` : undefined,
        }}
      >
        {/* Input Handle */}
        {handles.input && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 border-2 border-white"
            style={{ backgroundColor: config.color }}
          />
        )}

        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2 border-b border-border rounded-t-lg shrink-0"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: config.color }}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium flex-1 truncate">{label}</span>
          {badge && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
              {badge}
            </span>
          )}
          {statusIndicator}
        </div>

        {/* Body */}
        <div className="p-3 min-h-[40px]">
          {renderContent ? (
            renderContent(data)
          ) : hasContent ? (
            <div className="space-y-2">
              <div
                className="text-xs overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: lineClamp,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                  color: 'var(--foreground, #0f172a)',
                }}
              >
                {previewText}
              </div>
              {expandable && content.length > maxChars && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowFull(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
                  >
                    Expand
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs italic" style={{ color: 'var(--muted-foreground, #6b7280)' }}>
              {emptyText}
            </p>
          )}
        </div>

        {/* Footer */}
        {footer && <div className="px-3 pb-3">{footer}</div>}

        {/* Output Handle */}
        {handles.output && !handles.custom?.length && (
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white"
            style={{ backgroundColor: config.color }}
          />
        )}

        {/* Custom Handles */}
        {handles.custom?.map((h) => (
          <React.Fragment key={h.id}>
            <Handle
              type={h.type}
              position={h.position}
              id={h.id}
              className="w-3 h-3 border-2 border-white"
              style={{
                backgroundColor: h.color || config.color,
                ...(h.topPercent ? { top: h.topPercent } : {}),
              }}
            />
            {h.label && (
              <div
                className="absolute right-0 translate-x-full pr-2 text-xs font-medium"
                style={{
                  top: `calc(${h.topPercent || '50%'} - 8px)`,
                  color: h.labelColor || h.color || config.color,
                }}
              >
                {h.label}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Expand Modal */}
      {showFull && hasContent && expandable && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowFull(false)}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <span className="font-semibold">{label}</span>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded transition-colors">
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={() => setShowFull(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(80vh-80px)]">
              <pre className="text-sm whitespace-pre-wrap break-words font-mono bg-secondary/30 p-4 rounded-lg">
                {content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

// ─── Close icon ───────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default FlowNodeShell;
