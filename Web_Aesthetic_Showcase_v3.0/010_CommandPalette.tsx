// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 266

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  sections: ReadonlyArray<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>;
  onNavigate: (id: string) => void;
}

export function CommandPalette({ sections, onNavigate }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef(query);

  const filtered = useMemo(() => {
    if (!query.trim()) return sections.map((s, i) => ({ ...s, index: i }));
    const q = query.toLowerCase();
    return sections
      .map((s, i) => ({ ...s, index: i }))
      .filter((s) => s.label.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [query, sections]);

  // Reset selected index when query changes (via input onChange)
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    if (newQuery !== lastQueryRef.current) {
      lastQueryRef.current = newQuery;
      setSelectedIndex(0);
    }
    setQuery(newQuery);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input after animation
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => {
        document.body.style.overflow = '';
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current || filtered.length === 0) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, filtered]);

  const handleSelect = useCallback(
    (id: string) => {
      setIsOpen(false);
      setQuery('');
      onNavigate(id);
    },
    [onNavigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[selectedIndex]) {
            handleSelect(filtered[selectedIndex].id);
          }
          break;
      }
    },
    [filtered, selectedIndex, handleSelect]
  );

  return (
    <>
      {/* Trigger hint in hero area - only shown when palette is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-black/60 backdrop-blur-xl text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 2, duration: 0.5 }}
            aria-label="Open command palette"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">Quick Navigate</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-white/20">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/70 command-palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Palette dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-x-0 top-[15%] z-[110] mx-auto w-[90vw] max-w-lg"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            {/* Search input */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] shadow-2xl shadow-black/60 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onKeyDown={handleKeyDown}
                  className="command-palette-input flex-1 bg-transparent text-white text-sm font-mono outline-none"
                  placeholder="Search sections..."
                  aria-label="Search sections"
                />
                <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-white/20 flex-shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Results list */}
              <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-white/20">
                    <Search className="w-8 h-8 mb-3 opacity-40" />
                    <p className="text-sm font-mono">No sections found</p>
                    <p className="text-xs font-mono mt-1 opacity-60">Try a different search term</p>
                  </div>
                ) : (
                  <>
                    <div className="px-2 py-1.5 text-[10px] font-mono text-white/20 uppercase tracking-wider">
                      {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'All Sections'}
                    </div>
                    {filtered.map((section) => {
                      const isActive = selectedIndex === section.index;
                      return (
                        <motion.button
                          key={section.id}
                          data-index={section.index}
                          data-active={isActive}
                          onClick={() => handleSelect(section.id)}
                          onMouseEnter={() => setSelectedIndex(section.index)}
                          className={`command-palette-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-left cursor-pointer ${
                            isActive ? 'text-white' : 'text-white/50 hover:text-white/70'
                          }`}
                          layout
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                            style={{
                              backgroundColor: `${section.color}15`,
                              border: `1px solid ${section.color}25`,
                            }}
                          >
                            <section.icon className="w-4 h-4" style={{ color: section.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-mono">{section.label}</div>
                            <div className="text-[10px] text-white/20 font-mono mt-0.5">
                              Section {String(section.index + 1).padStart(2, '0')}
                            </div>
                          </div>
                          <ArrowRight
                            className={`w-4 h-4 flex-shrink-0 transition-opacity ${
                              isActive ? 'opacity-100 text-emerald-400' : 'opacity-0'
                            }`}
                          />
                        </motion.button>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] text-[10px] font-mono text-white/15">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">↵</kbd>
                    select
                  </span>
                </div>
                <span>{filtered.length} section{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
