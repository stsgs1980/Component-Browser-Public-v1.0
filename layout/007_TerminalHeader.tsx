'use client';

import { Terminal, Maximize2, Minimize2, MoreVertical, Trash2, Download, Settings } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

export interface HeaderMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  separatorAfter?: boolean;
}

export interface TerminalHeaderTheme {
  background: string;
  border: string;
  titleColor: string;
  statusBg: string;
  statusText: string;
  connectedDot: string;
  offlineDot: string;
  streamingDot: string;
  menuBg: string;
  menuBorder: string;
  menuItemText: string;
  menuItemHover: string;
  menuSeparator: string;
  iconButtonHover: string;
  iconButtonColor: string;
  iconColor: string;
}

export const DARK_THEME: TerminalHeaderTheme = {
  background: '#0f172a',
  border: '#1e293b',
  titleColor: '#f9fafb',
  statusBg: '#1e293b',
  statusText: '#94a3b8',
  connectedDot: '#34d399',
  offlineDot: '#f87171',
  streamingDot: '#34d399',
  menuBg: '#1e293b',
  menuBorder: '#334155',
  menuItemText: '#cbd5e1',
  menuItemHover: '#334155',
  menuSeparator: '#334155',
  iconButtonHover: '#f9fafb',
  iconButtonColor: '#94a3b8',
  iconColor: '#60a5fa',
};

export const LIGHT_THEME: TerminalHeaderTheme = {
  background: '#ffffff',
  border: '#e2e8f0',
  titleColor: '#0f172a',
  statusBg: '#f1f5f9',
  statusText: '#64748b',
  connectedDot: '#22c55e',
  offlineDot: '#ef4444',
  streamingDot: '#22c55e',
  menuBg: '#ffffff',
  menuBorder: '#e2e8f0',
  menuItemText: '#334155',
  menuItemHover: '#f1f5f9',
  menuSeparator: '#e2e8f0',
  iconButtonHover: '#0f172a',
  iconButtonColor: '#94a3b8',
  iconColor: '#3b82f6',
};

export interface TerminalHeaderProps {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isConnected?: boolean;
  isStreaming?: boolean;
  connectedLabel?: string;
  offlineLabel?: string;
  streamingLabel?: string;
  menuItems?: HeaderMenuItem[];
  theme?: TerminalHeaderTheme;
  height?: number;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────

import { useState } from 'react';

export function TerminalHeader({
  title = 'Terminal',
  icon: Icon = Terminal,
  isConnected = false,
  isStreaming = false,
  connectedLabel = 'Connected',
  offlineLabel = 'Offline',
  streamingLabel = 'Processing...',
  menuItems,
  theme = DARK_THEME,
  height = 48,
  className = '',
}: TerminalHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const statusLabel = isStreaming ? streamingLabel : isConnected ? connectedLabel : offlineLabel;
  const statusDotColor = isStreaming ? theme.streamingDot : isConnected ? theme.connectedDot : theme.offlineDot;

  return (
    <div
      className={`flex items-center px-4 gap-4 ${className}`}
      style={{ height: `${height}px`, backgroundColor: theme.background, borderBottom: `1px solid ${theme.border}` }}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: theme.iconColor }} />
          <span className="font-semibold" style={{ color: theme.titleColor }}>{title}</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: theme.statusBg }}>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusDotColor, animation: isStreaming ? 'pulse 1.5s infinite' : 'none' }}
          />
          <span className="text-xs" style={{ color: theme.statusText }}>{statusLabel}</span>
        </div>
      </div>

      {/* Right section */}
      <div className="ml-auto flex items-center gap-2">
        {menuItems && menuItems.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="h-8 w-8 p-0 rounded transition-colors"
              style={{ color: theme.iconButtonColor, background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = theme.iconButtonHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = theme.iconButtonColor; }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-xl overflow-hidden z-50" style={{ backgroundColor: theme.menuBg, border: `1px solid ${theme.menuBorder}` }}>
                  {menuItems.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={() => { item.onClick?.(); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                        style={{ color: theme.menuItemText, background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.menuItemHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        {item.label}
                      </button>
                      {item.separatorAfter && <div style={{ borderTop: `1px solid ${theme.menuSeparator}` }} />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TerminalHeader;
