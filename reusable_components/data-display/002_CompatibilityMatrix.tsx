// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 191

"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import {
  type CompatibilityLevel,
  type ToolCategory,
  uiTools,
  categories,
  getCompatibility,
  getCompatibilityNotes,
} from "@/lib/ui-tools-data";

const compatibilityColors: Record<CompatibilityLevel | "none", { bg: string; text: string }> = {
  excellent: {
    bg: "bg-emerald-500",
    text: "text-white"
  },
  good: {
    bg: "bg-sky-500",
    text: "text-white"
  },
  caution: {
    bg: "bg-amber-500",
    text: "text-white"
  },
  avoid: {
    bg: "bg-red-500",
    text: "text-white"
  },
  none: {
    bg: "bg-muted",
    text: "text-muted-foreground"
  }
};

interface CompatibilityMatrixProps {
  selectedCategory?: ToolCategory | "all";
}

export function CompatibilityMatrix({ selectedCategory = "all" }: CompatibilityMatrixProps) {
  const [search, setSearch] = useState("");
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string } | null>(null);

  const filteredTools = useMemo(() => {
    let tools = uiTools;
    
    if (selectedCategory !== "all") {
      tools = tools.filter(t => t.category === selectedCategory);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }
    
    return tools;
  }, [selectedCategory, search]);

  const renderCell = (rowToolId: string, colToolId: string) => {
    if (rowToolId === colToolId) {
      return (
        <div className="w-3.5 h-3.5 rounded-full bg-muted/30 border border-muted/50 mx-auto" />
      );
    }

    const level = getCompatibility(rowToolId, colToolId);
    const notes = getCompatibilityNotes(rowToolId, colToolId);
    const colors = compatibilityColors[level ?? "none"];
    const isHovered = hoveredCell?.row === rowToolId && hoveredCell?.col === colToolId;

    if (!level) {
      return (
        <div 
          className={`w-3.5 h-3.5 rounded-full border border-dashed border-muted-foreground/60 bg-muted/30 mx-auto transition-all ${isHovered ? "ring-2 ring-primary scale-125" : ""}`}
          onMouseEnter={() => setHoveredCell({ row: rowToolId, col: colToolId })}
          onMouseLeave={() => setHoveredCell(null)}
        />
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`w-3.5 h-3.5 rounded-full ${colors.bg} shadow-sm mx-auto transition-all cursor-pointer ${isHovered ? "ring-2 ring-primary ring-offset-1 scale-125 shadow-md" : ""}`}
            onMouseEnter={() => setHoveredCell({ row: rowToolId, col: colToolId })}
            onMouseLeave={() => setHoveredCell(null)}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{level === "excellent" ? "Отлично" : level === "good" ? "Хорошо" : level === "caution" ? "Осторожно" : "Избегать"}</p>
            {notes && <p className="text-sm text-muted-foreground">{notes}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск инструментов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 text-xs">
          {(["excellent", "good", "caution", "avoid"] as CompatibilityLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${compatibilityColors[level].bg}`} />
              <span>{level === "excellent" ? "Отлично" : level === "good" ? "Хорошо" : level === "caution" ? "Осторожно" : "Избегать"}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${compatibilityColors.none.bg} border border-dashed border-muted-foreground/30`} />
            <span>Нет данных</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <TooltipProvider>
          <ScrollArea className="w-full">
            <div className="max-h-[450px] overflow-auto">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 top-0 bg-background z-20 min-w-[90px] border-r border-b">
                      Инструмент
                    </TableHead>
                    {filteredTools.map((tool) => (
                      <TableHead key={tool.id} className="text-center p-1 border-b bg-background sticky top-0 z-10 min-w-[36px]">
                        <span className={`text-[10px] px-1 py-0.5 rounded whitespace-nowrap ${categories[tool.category].color}`}>
                          {tool.name}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTools.map((rowTool) => (
                    <TableRow key={rowTool.id}>
                      <TableCell className="sticky left-0 bg-background z-10 font-medium border-r p-1.5">
                        <span className={`text-[10px] px-1 py-0.5 rounded whitespace-nowrap ${categories[rowTool.category].color}`}>
                          {rowTool.name}
                        </span>
                      </TableCell>
                      {filteredTools.map((colTool) => (
                        <TableCell key={colTool.id} className="p-1 text-center min-w-[36px]">
                          {renderCell(rowTool.id, colTool.id)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>
      </div>
    </div>
  );
}
