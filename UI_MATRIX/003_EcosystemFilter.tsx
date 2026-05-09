// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 57

"use client";

import { type Ecosystem } from "@/lib/ui-tools-data";

interface EcosystemFilterProps {
  selectedEcosystem: Ecosystem | "All";
  onEcosystemChange: (ecosystem: Ecosystem | "All") => void;
  stackCounts: Record<Ecosystem | "All", number>;
}

export function EcosystemFilter({
  selectedEcosystem,
  onEcosystemChange,
  stackCounts,
}: EcosystemFilterProps) {
  const ecosystems: (Ecosystem | "All")[] = [
    "All",
    "React",
    "Vue",
    "Framework-agnostic",
  ];

  const ecosystemLabels: Record<Ecosystem | "All", string> = {
    All: "Все",
    React: "React",
    Vue: "Vue",
    "Framework-agnostic": "Универсальные"
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ecosystems.map((ecosystem) => (
        <button
          key={ecosystem}
          onClick={() => onEcosystemChange(ecosystem)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${selectedEcosystem === ecosystem 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
            }
          `}
        >
          {ecosystemLabels[ecosystem]}
          <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs
            ${selectedEcosystem === ecosystem 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-background"
            }
          `}>
            {stackCounts[ecosystem]}
          </span>
        </button>
      ))}
    </div>
  );
}
