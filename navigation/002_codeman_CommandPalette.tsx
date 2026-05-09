'use client';

import { memo, useMemo } from 'react';
import { Command, Search } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  shortcut?: string;
  action: string;
  group?: string;
}

export interface CommandPaletteTheme {
  background: string;
  border: string;
  searchBg: string;
  searchBorder: string;
  searchIcon: string;
  inputText: string;
  badgeBg: string;
  badgeText: string;
  emptyText: string;
  selectedBg: string;
  selectedText: string;
  normalText: string;
  descText: string;
  shortcutBg: string;
  shortcutText: string;
  iconNormal: string;
  iconSelected: string;
}

export const DARK_THEME: CommandPaletteTheme = {
  background: '#1e1e2e',
  border: '#313244',
  searchBg: '#181825',
  searchBorder: '#313244',
  searchIcon: '#b4befe',
  inputText: '#cdd6f4',
  badgeBg: '#313244',
  badgeText: '#6c7086',
  emptyText: '#6c7086',
  selectedBg: '#313244',
  selectedText: '#cdd6f4',
  normalText: '#a6adc8',
  descText: '#6c7086',
  shortcutBg: '#45475a',
  shortcutText: '#a6adc8',
  iconNormal: '#6c7086',
  iconSelected: '#b4befe',
};

export const LIGHT_THEME: CommandPaletteTheme = {
  background: '#ffffff',
  border: '#e2e8f0',
  searchBg: '#f8fafc',
  searchBorder: '#e2e8f0',
  searchIcon: '#6366f1',
  inputText: '#1e293b',
  badgeBg: '#f1f5f9',
  badgeText: '#94a3b8',
  emptyText: '#94a3b8',
  selectedBg: '#f1f5f9',
  selectedText: '#1e293b',
  normalText: '#475569',
  descText: '#94a3b8',
  shortcutBg: '#f1f5f9',
  shortcutText: '#64748b',
  iconNormal: '#94a3b8',
  iconSelected: '#6366f1',
};

// ─── Props ────────────────────────────────────────────────────────────

export interface CommandPaletteProps {
  isOpen: boolean;
  filter: string;
  selectedIndex: number;
  commands: CommandItem[];
  onSelect: (action: string) => void;
  onFilterChange: (filter: string) => void;
  onMouseEnter: (index: number) => void;
  searchPlaceholder?: string;
  emptyText?: string;
  dismissLabel?: string;
  theme?: CommandPaletteTheme;
  maxHeight?: number;
}

// ─── Component ────────────────────────────────────────────────────────

const CommandPalette = memo(function CommandPalette({
  isOpen,
  filter,
  selectedIndex,
  commands,
  onSelect,
  onFilterChange,
  onMouseEnter,
  searchPlaceholder = 'Search commands...',
  emptyText = 'No commands found',
  dismissLabel = 'ESC',
  theme = DARK_THEME,
  maxHeight = 300,
}: CommandPaletteProps) {
  const filteredCommands = useMemo(() => {
    if (!filter) return commands;
    const lower = filter.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lower) ||
      (cmd.description && cmd.description.toLowerCase().includes(lower)) ||
      cmd.id.toLowerCase().includes(lower)
    );
  }, [filter, commands]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-1 rounded-lg overflow-hidden shadow-2xl z-50"
      style={{
        backgroundColor: theme.background,
        border: `1px solid ${theme.border}`,
        maxHeight: `${maxHeight}px`,
      }}
    >
      {/* Search input */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: theme.searchBg, borderBottom: `1px solid ${theme.searchBorder}` }}
      >
        <Search className="w-3.5 h-3.5" style={{ color: theme.searchIcon }} />
        <input
          type="text"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent outline-none text-[11px]"
          style={{ color: theme.inputText }}
          autoFocus
        />
        <span
          className="text-[9px] px-1.5 py-0.5 rounded"
          style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
        >
          {dismissLabel}
        </span>
      </div>

      {/* Command list */}
      <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight - 50}px` }}>
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-4 text-center text-[11px]" style={{ color: theme.emptyText }}>
            {emptyText}
          </div>
        ) : (
          filteredCommands.map((cmd, index) => {
            const Icon = cmd.icon;
            const isSelected = index === selectedIndex;

            return (
              <div
                key={cmd.id}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors"
                style={{ backgroundColor: isSelected ? theme.selectedBg : 'transparent' }}
                onClick={() => onSelect(cmd.action)}
                onMouseEnter={() => onMouseEnter(index)}
              >
                {Icon && (
                  <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? theme.iconSelected : theme.iconNormal }} />
                )}
                <span className="text-[11px] flex-1" style={{ color: isSelected ? theme.selectedText : theme.normalText }}>
                  {cmd.label}
                </span>
                {cmd.description && (
                  <span className="text-[9px] max-w-[120px] truncate" style={{ color: theme.descText }}>
                    {cmd.description}
                  </span>
                )}
                {cmd.shortcut && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: theme.shortcutBg, color: theme.shortcutText }}>
                    {cmd.shortcut}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

export default CommandPalette;

// ─── useCommandPalette Hook ───────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';

export function useCommandPalette(commands: CommandItem[], options?: { triggerKey?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const open = useCallback(() => { setIsOpen(true); setFilter(''); setSelectedIndex(0); }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const filteredCount = useMemo(() => {
    if (!filter) return commands.length;
    const lower = filter.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lower) ||
      (cmd.description && cmd.description.toLowerCase().includes(lower)) ||
      cmd.id.toLowerCase().includes(lower)
    ).length;
  }, [filter, commands]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filteredCount - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const filtered = commands.filter(cmd => {
        if (!filter) return true;
        const lower = filter.toLowerCase();
        return cmd.label.toLowerCase().includes(lower) || (cmd.description && cmd.description.toLowerCase().includes(lower)) || cmd.id.toLowerCase().includes(lower);
      });
      if (filtered[selectedIndex]) {
        const action = filtered[selectedIndex].action;
        setIsOpen(false);
        setFilter('');
        return action;
      }
    }
    if (e.key === 'Escape') { e.preventDefault(); setIsOpen(false); setFilter(''); }
    return null;
  }, [isOpen, selectedIndex, filter, filteredCount, commands]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e);
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, handleKeyDown]);

  return { isOpen, filter, selectedIndex, open, close, setFilter, setSelectedIndex, handleKeyDown, filteredCount };
}
