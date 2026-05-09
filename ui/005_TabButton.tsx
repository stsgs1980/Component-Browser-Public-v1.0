// --- source: UI-Stack-Guide / page.tsx (lines 1092-1116) ---
// Minimal monochrome tab button with uppercase tracking and border styling.
// Already clean — no de-hardcoding needed. Extracted as-is.

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function TabButton({ active, onClick, children, className }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 text-sm font-medium uppercase tracking-wider border transition-colors duration-200',
        active
          ? 'bg-foreground text-background border-foreground'
          : 'bg-transparent text-foreground border-border hover:border-foreground/50',
        className || '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

/**
 * Monochrome tab group — wraps multiple TabButtons.
 * Manages active state internally.
 */
interface TabGroupProps {
  tabs: Array<{ id: string; label: string }>;
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function TabGroup({ tabs, activeId, onChange, className }: TabGroupProps) {
  return (
    <div className={`flex flex-wrap gap-1 ${className || ''}`}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          active={tab.id === activeId}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </TabButton>
      ))}
    </div>
  );
}
