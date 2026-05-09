// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 215

"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ExternalLink, Star, TrendingUp } from "lucide-react";
import {
  type UITool,
  type ToolCompatibility,
  type CompatibilityLevel,
  uiTools,
  categories,
} from "@/lib/ui-tools-data";

interface ToolCardProps {
  tool: UITool;
  isExpanded?: boolean;
  onToggle?: () => void;
  highlightedCompatibilities?: Set<string>;
  onToolHover?: (toolId: string | null) => void;
}

const compatibilityColors: Record<CompatibilityLevel, { bg: string; text: string; label: string }> = {
  excellent: {
    bg: "bg-emerald-100 dark:bg-emerald-900",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "[Отлично]"
  },
  good: {
    bg: "bg-sky-100 dark:bg-sky-900",
    text: "text-sky-700 dark:text-sky-300",
    label: "[Хорошо]"
  },
  caution: {
    bg: "bg-amber-100 dark:bg-amber-900",
    text: "text-amber-700 dark:text-amber-300",
    label: "[Осторожно]"
  },
  avoid: {
    bg: "bg-red-100 dark:bg-red-900",
    text: "text-red-700 dark:text-red-300",
    label: "[Избегать]"
  }
};

const popularityLabels = {
  high: "Высокая",
  medium: "Средняя",
  low: "Низкая"
};

export function ToolCard({
  tool,
  isExpanded = false,
  onToggle,
  highlightedCompatibilities,
  onToolHover,
}: ToolCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = isExpanded ?? internalExpanded;
  
  const categoryInfo = categories[tool.category];

  const getToolName = (toolId: string): string => {
    const found = uiTools.find(t => t.id === toolId);
    return found?.name ?? toolId;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400" />);
    }
    
    return stars;
  };

  const renderCompatibility = (comp: ToolCompatibility) => {
    const colors = compatibilityColors[comp.level];
    const isHighlighted = highlightedCompatibilities?.has(comp.toolId);
    
    return (
      <Tooltip key={comp.toolId}>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer
              ${colors.bg} ${isHighlighted ? "ring-2 ring-primary ring-offset-2" : ""}`}
            onMouseEnter={() => onToolHover?.(comp.toolId)}
            onMouseLeave={() => onToolHover?.(null)}
          >
            <Badge variant="outline" className="text-xs">
              {colors.label}
            </Badge>
            <span className={`text-sm font-medium ${colors.text}`}>
              {getToolName(comp.toolId)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="text-sm">{comp.notes}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <CardDescription className="text-xs">{tool.role}</CardDescription>
          </div>
          <Badge className={categoryInfo.color}>
            {categoryInfo.name}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1">
        {/* Рейтинг и популярность */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {renderStars(tool.rating)}
            <span className="text-sm font-medium ml-1">{tool.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs">{popularityLabels[tool.popularity]}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{tool.description}</p>
        
        <Collapsible open={expanded} onOpenChange={() => onToggle?.() ?? setInternalExpanded(!expanded)}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>Совместимость ({tool.bestWith.length})</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            <div className="space-y-1.5">
              <h4 className="text-xs font-medium text-muted-foreground">Лучше всего с:</h4>
              <TooltipProvider>
                <div className="grid gap-1.5">
                  {tool.bestWith.length > 0 ? (
                    tool.bestWith.map(renderCompatibility)
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Самостоятельная экосистема
                    </p>
                  )}
                </div>
              </TooltipProvider>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-1.5 pt-2 border-t">
        {tool.features.slice(0, 3).map((feature, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {feature}
          </Badge>
        ))}
        {tool.features.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{tool.features.length - 3}
          </Badge>
        )}
        {tool.officialUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            asChild
          >
            <a href={tool.officialUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Docs
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
