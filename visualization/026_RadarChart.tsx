// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 272

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { uiTools, type UITool } from "@/lib/ui-tools-data";

interface RadarChartProps {
  selectedCategory?: string;
}

// Характеристики для диаграммы
const metrics = [
  { id: "rating", label: "Рейтинг", max: 5 },
  { id: "popularity", label: "Популярность", max: 3 },
  { id: "connections", label: "Связи", max: 10 },
  { id: "flexibility", label: "Гибкость", max: 5 },
  { id: "dx", label: "DX", max: 5 },
];

// Вычисляемые характеристики
function calculateMetrics(tool: UITool) {
  const popularityScore = tool.popularity === "high" ? 3 : tool.popularity === "medium" ? 2 : 1;
  
  const flexibilityScore = tool.category === "headless" ? 5 : 
                           tool.category === "css-framework" ? 4 : 
                           tool.category === "animation" ? 3 : 2;
  
  const dxScore = tool.rating * 0.7 + (tool.popularity === "high" ? 1.5 : tool.popularity === "medium" ? 1 : 0.5);
  
  return {
    rating: tool.rating,
    popularity: popularityScore,
    connections: Math.min(tool.bestWith.length, 10),
    flexibility: flexibilityScore,
    dx: Math.min(dxScore, 5),
  };
}

export function RadarChart({ selectedCategory }: RadarChartProps) {
  const [selectedTools, setSelectedTools] = useState<string[]>(["shadcn-ui", "radix-ui", "tailwind-css"]);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const tools = selectedCategory 
    ? uiTools.filter(t => t.category === selectedCategory)
    : uiTools;

  const handleToolToggle = (toolId: string) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      }
      if (prev.length < 4) {
        return [...prev, toolId];
      }
      return prev;
    });
  };

  // Константы для SVG
  const size = 280;
  const center = size / 2;
  const radius = 100;
  const levels = 5;

  // Углы для осей
  const angleStep = (2 * Math.PI) / metrics.length;
  const angles = metrics.map((_, i) => -Math.PI / 2 + i * angleStep);

  // Точки для сетки - вычисляем без useMemo
  const gridPoints: string[][] = [];
  for (let level = 1; level <= levels; level++) {
    const levelRadius = (radius / levels) * level;
    const levelPoints = angles.map(angle => {
      const x = center + levelRadius * Math.cos(angle);
      const y = center + levelRadius * Math.sin(angle);
      return `${x},${y}`;
    });
    gridPoints.push(levelPoints);
  }

  // Данные для выбранных инструментов
  const toolsData = selectedTools.map(toolId => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return null;
    
    const toolMetrics = calculateMetrics(tool);
    
    const points = metrics.map((metric, i) => {
      const value = toolMetrics[metric.id as keyof typeof toolMetrics];
      const ratio = value / metric.max;
      const pointRadius = radius * ratio;
      const x = center + pointRadius * Math.cos(angles[i]);
      const y = center + pointRadius * Math.sin(angles[i]);
      return { x, y, value };
    });
    
    return { tool, points, metrics: toolMetrics };
  }).filter(Boolean);

  const colors = ["#10b981", "#8b5cf6", "#f59e0b", "#0ea5e9"];

  return (
    <Card className="py-2">
      <CardHeader className="pb-1 pt-0">
        <CardTitle className="text-sm">Сравнение инструментов</CardTitle>
        <p className="text-xs text-muted-foreground">
          Выберите до 4 инструментов для сравнения
        </p>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Диаграмма */}
          <div className="flex-1 flex justify-center">
            <TooltipProvider>
              <svg width={size} height={size} className="max-w-full">
                {/* Сетка */}
                {gridPoints.map((points, level) => (
                  <polygon
                    key={level}
                    points={points.join(" ")}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    className="text-muted-foreground"
                  />
                ))}
                
                {/* Оси */}
                {angles.map((angle, i) => {
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  const labelX = center + (radius + 18) * Math.cos(angle);
                  const labelY = center + (radius + 18) * Math.sin(angle);
                  
                  return (
                    <g key={i}>
                      <line
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity={0.2}
                        className="text-muted-foreground"
                      />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-muted-foreground"
                      >
                        {metrics[i].label}
                      </text>
                    </g>
                  );
                })}
                
                {/* Данные инструментов */}
                {toolsData.map((data, index) => {
                  if (!data) return null;
                  
                  const pointsStr = data.points
                    .map(p => `${p.x},${p.y}`)
                    .join(" ");
                  
                  const isHovered = hoveredTool === data.tool.id;
                  
                  return (
                    <g key={data.tool.id}>
                      <polygon
                        points={pointsStr}
                        fill={colors[index]}
                        fillOpacity={isHovered ? 0.4 : 0.2}
                        stroke={colors[index]}
                        strokeWidth={isHovered ? 3 : 2}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredTool(data.tool.id)}
                        onMouseLeave={() => setHoveredTool(null)}
                      />
                      {/* Точки */}
                      {data.points.map((point, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={isHovered ? 5 : 4}
                              fill={colors[index]}
                              className="transition-all duration-200"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {metrics[i].label}: {point.value.toFixed(1)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </TooltipProvider>
          </div>
          
          {/* Легенда и выбор */}
          <div className="space-y-3 lg:w-48">
            <div className="flex flex-wrap gap-2 justify-center">
              {tools.map(tool => {
                const isSelected = selectedTools.includes(tool.id);
                const index = selectedTools.indexOf(tool.id);
                
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolToggle(tool.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium transition-all
                      ${isSelected 
                        ? "ring-2 ring-offset-1 ring-offset-background" 
                        : "bg-muted hover:bg-muted/80"
                      }
                    `}
                    style={{
                      backgroundColor: isSelected ? colors[index] : undefined,
                      color: isSelected ? "white" : undefined,
                      boxShadow: isSelected ? `0 0 0 2px ${colors[index]}40` : undefined
                    }}
                    title={tool.name}
                  >
                    {tool.name.slice(0, 2)}
                  </button>
                );
              })}
            </div>
            
            {/* Легенда */}
            <div className="pt-2 border-t space-y-1">
              <h4 className="text-[10px] font-medium text-muted-foreground text-center">Выбрано:</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {toolsData.map((data, index) => {
                  if (!data) return null;
                  return (
                    <div key={data.tool.id} className="flex items-center gap-1.5">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="text-[10px]">{data.tool.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
