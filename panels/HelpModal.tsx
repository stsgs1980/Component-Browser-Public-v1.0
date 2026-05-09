'use client';

/**
 * HelpModal — A centred modal overlay that displays a list of keyboard shortcuts
 * (or any key-description pairs). Includes a backdrop click to close, a header
 * with icon and close button, a scrollable shortcuts list, and a footer hint.
 *
 * @example
 * ```tsx
 * <HelpModal
 *   isOpen={true}
 *   onClose={() => setShowHelp(false)}
 *   shortcuts={[
 *     { keys: 'S', description: 'Screenshot Export' },
 *     { keys: '?', description: 'Show Help' },
 *   ]}
 *   title="Keyboard Shortcuts"
 *   icon={<KeyboardIcon />}
 * />
 * ```
 */

import { useEffect } from 'react';
// lucide-react dependency: import { X } from 'lucide-react'
import { X } from 'lucide-react';

export interface HelpModalProps {
  /** Whether the modal is currently visible. */
  isOpen: boolean;
  /** Called when the user requests closing the modal. */
  onClose: () => void;
  /** List of shortcut entries to display. */
  shortcuts: { keys: string; description: string }[];
  /** Title displayed in the modal header. Default: "Keyboard Shortcuts". */
  title?: string;
  /** Optional icon rendered in the header. */
  icon?: React.ReactNode;
}

export function HelpModal(props: HelpModalProps) {
  const { isOpen, onClose, shortcuts, title = 'Keyboard Shortcuts', icon } = props;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-gray-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              {icon ?? (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-white text-sm font-bold">⌨</span>
                </div>
              )}
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
                <p className="text-[10px] text-gray-500">Quick access to all controls</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Shortcuts list */}
          <div className="px-5 py-4 space-y-1">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.keys}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors duration-150"
              >
                {/* Key badge */}
                <div className="flex-shrink-0 min-w-[40px] h-7 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center px-2">
                  <span className="text-[11px] font-bold text-white tracking-wide">{shortcut.keys}</span>
                </div>
                {/* Description */}
                <span className="text-xs text-gray-300 font-medium">{shortcut.description}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center justify-center">
              <span className="text-[9px] text-gray-600">
                Press <span className="text-amber-400/70 font-medium">?</span> anytime to toggle this panel
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
