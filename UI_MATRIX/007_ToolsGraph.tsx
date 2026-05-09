// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 288

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type CompatibilityLevel,
  type ToolCategory,
  uiTools,
  categories,
} from "@/lib/ui-tools-data";

interface ToolsGraphProps {
  selectedCategory?: ToolCategory | "all";
}

// Позиции категорий - распределены по ширине
const categoryLayouts: Record<ToolCategory, { x: number; y: number; maxPerRow: number }> = {
  "headless": { x: 15, y: 25, maxPerRow: 2 },
  "styled-library": { x: 50, y: 25, maxPerRow: 3 },
  "css-framework": { x: 85, y: 25, maxPerRow: 1 },
  "animation": { x: 30, y: 70, maxPerRow: 1 },
  "icons": { x: 70, y: 70, maxPerRow: 1 },
};

const compatibilityColors: Record<CompatibilityLevel, string> = {
  excellent: "#10b981",
  good: "#0ea5e9",
  caution: "#f59e0b",
  avoid: "#ef4444",
};

export function ToolsGraph({ selectedCategory = "all" }: ToolsGraphProps) {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    if (selectedCategory === "all") return uiTools;
    return uiTools.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  // Алгоритм позиционирования с увеличенными отступами
  const toolPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    
    const categoryGroups: Record<ToolCategory, typeof uiTools> = {
      "headless": [],
      "styled-library": [],
      "css-framework": [],
      "animation": [],
      "icons": [],
    };

    filteredTools.forEach(tool => {
      categoryGroups[tool.category].push(tool);
    });

    Object.entries(categoryGroups).forEach(([cat, tools]) => {
      const category = cat as ToolCategory;
      const layout = categoryLayouts[category];
      const count = tools.length;
      
      if (count === 0) return;
      
      const cols = Math.min(count, layout.maxPerRow);
      const rows = Math.ceil(count / cols);
      
      // Увеличенные отступы
      const cellWidth = 20;
      const cellHeight = 12;
      
      tools.forEach((tool, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const itemsInThisRow = Math.min(cols, count - row * cols);
        const rowOffset = (cols - itemsInThisRow) / 2;
        
        const x = layout.x + (col + rowOffset - (cols - 1) / 2) * cellWidth;
        const y = layout.y + row * cellHeight;
        
        positions[tool.id] = {
          x: Math.max(10, Math.min(90, x)),
          y: Math.max(8, Math.min(92, y)),
        };
      });
    });

    return positions;
  }, [filteredTools]);

  const connections = useMemo(() => {
    if (!selectedTool && !hoveredTool) return [];
    
    const sourceId = selectedTool || hoveredTool;
    if (!sourceId) return [];

    const sourceTool = uiTools.find(t => t.id === sourceId);
    if (!sourceTool) return [];

    const conns: { from: string; to: string; level: CompatibilityLevel }[] = [];
    
    sourceTool.bestWith.forEach(comp => {
      if (filteredTools.some(t => t.id === comp.toolId)) {
        conns.push({ from: sourceId, to: comp.toolId, level: comp.level });
      }
    });

    filteredTools.forEach(tool => {
      const hasBackConnection = tool.bestWith.some(
        comp => comp.toolId === sourceId && comp.level === "excellent"
      );
      if (hasBackConnection && !conns.some(c => c.to === tool.id)) {
        conns.push({ from: sourceId, to: tool.id, level: "good" });
      }
    });

    return conns;
  }, [selectedTool, hoveredTool, filteredTools]);

  const getToolById = (id: string) => uiTools.find(t => t.id === id);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Граф связей инструментов</CardTitle>
        <p className="text-sm text-muted-foreground">
          Кликните на инструмент для отображения связей
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[380px] bg-muted/30 rounded-lg overflow-hidden">
          {/* Линии связей с анимацией */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {connections.map((conn, index) => {
              const fromPos = toolPositions[conn.from];
              const toPos = toolPositions[conn.to];
              if (!fromPos || !toPos) return null;

              return (
                <line
                  key={`${conn.from}-${conn.to}-${index}`}
                  x1={`${fromPos.x}%`}
                  y1={`${fromPos.y}%`}
                  x2={`${toPos.x}%`}
                  y2={`${toPos.y}%`}
                  stroke={compatibilityColors[conn.level]}
                  strokeWidth={conn.level === "excellent" ? 3 : 2}
                  strokeDasharray={conn.level === "good" ? "6,4" : undefined}
                  opacity={0.8}
                  filter="url(#glow)"
                  className="animate-pulse"
                  style={{ animationDuration: "2s" }}
                />
              );
            })}
          </svg>

          {/* Метки категорий */}
          {Object.entries(categoryLayouts).map(([cat, layout]) => {
            const category = cat as ToolCategory;
            const info = categories[category];
            const toolsInCategory = filteredTools.filter(t => t.category === category);
            if (toolsInCategory.length === 0) return null;
            
            return (
              <div
                key={`label-${cat}`}
                className="absolute text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider"
                style={{ 
                  left: `${layout.x}%`, 
                  top: `${Math.max(layout.y - 12, 2)}%`,
                  transform: "translateX(-50%)"
                }}
              >
                {info.name}
              </div>
            );
          })}

          {/* Узлы инструментов */}
          <TooltipProvider>
            {filteredTools.map(tool => {
              const pos = toolPositions[tool.id];
              if (!pos) return null;

              const isActive = hoveredTool === tool.id || selectedTool === tool.id;
              const hasConnection = connections.some(c => c.to === tool.id || c.from === tool.id);
              const categoryInfo = categories[tool.category];

              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
                        ${isActive ? "scale-110 z-30" : "z-10 hover:scale-105"}
                        ${hasConnection && !isActive ? "scale-105 z-20" : ""}
                      `}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      onMouseEnter={() => setHoveredTool(tool.id)}
                      onMouseLeave={() => setHoveredTool(null)}
                      onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                    >
                      <div
                        className={`px-2 py-1 rounded-md border shadow-sm cursor-pointer whitespace-nowrap
                          transition-all duration-300
                          ${isActive 
                            ? "border-primary bg-background shadow-lg ring-2 ring-primary/30" 
                            : "bg-background/95 backdrop-blur-sm hover:shadow-md"
                          }
                          ${hasConnection ? "ring-2 ring-primary/40" : ""}
                        `}
                      >
                        <span className={`text-xs font-medium transition-colors duration-300
                          ${isActive ? "text-primary" : "text-muted-foreground"}
                        `}>
                          {tool.name}
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="space-y-1">
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.role}</p>
                      <p className="text-xs">Связей: {tool.bestWith.length}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>

          {/* Легенда */}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 text-[10px]">
            {Object.entries(categories).map(([cat, info]) => {
              const count = filteredTools.filter(t => t.category === cat).length;
              if (count === 0) return null;
              return (
                <div 
                  key={cat} 
                  className={`px-1.5 py-0.5 rounded ${info.color}`}
                >
                  {info.name} ({count})
                </div>
              );
            })}
          </div>
        </div>

        {/* Выбранный инструмент */}
        {selectedTool && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm">Выбрано:</span>
            <Badge variant="secondary">{getToolById(selectedTool)?.name}</Badge>
            <span className="text-sm text-muted-foreground">
              Связей: {getToolById(selectedTool)?.bestWith.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTool(null)}
            >
              Сбросить
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
