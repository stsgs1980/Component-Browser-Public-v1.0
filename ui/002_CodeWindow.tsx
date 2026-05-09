// --- source: Radix-Template / page.tsx (lines 409-423, 628-656) ---
// macOS-style code window chrome (3 dots + filename) wrapping any content.
// De-hardcoded: filename "app/page.tsx" → prop, specific border colors → theme variables.

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CodeWindowProps {
  /** Filename shown in the title bar */
  filename?: string;
  /** Content to display inside the window */
  children: ReactNode;
  /** Additional class for the outer container */
  className?: string;
}

export function CodeWindow({ filename, children, className }: CodeWindowProps) {
  return (
    <div className={cn('rounded-2xl border overflow-hidden shadow-2xl bg-background', className)}>
      {/* macOS-style window controls */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        {filename && (
          <span className="ml-4 text-sm font-medium text-muted-foreground">
            {filename}
          </span>
        )}
      </div>
      {/* Window content */}
      <div className="p-4 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
