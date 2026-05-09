// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 131

"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  type ToolStack,
  uiTools,
  categories,
} from "@/lib/ui-tools-data";

interface ToolStackCardProps {
  stack: ToolStack;
}

const difficultyConfig = {
  easy: { label: "Легкий", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  medium: { label: "Средний", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  advanced: { label: "Продвинутый", color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" }
};

const ecosystemColors: Record<string, string> = {
  "React": "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  "Vue": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "Framework-agnostic": "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
};

export function ToolStackCard({ stack }: ToolStackCardProps) {
  const getTool = (toolId: string) => uiTools.find(t => t.id === toolId);
  const difficulty = difficultyConfig[stack.difficulty];

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base">{stack.name}</CardTitle>
            <CardDescription className="text-xs">{stack.description}</CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {stack.ecosystem.map((eco) => (
            <Badge key={eco} className={`text-xs ${ecosystemColors[eco] || ""}`}>
              {eco}
            </Badge>
          ))}
          <Badge className={`text-xs ${difficulty.color}`}>
            {difficulty.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1">
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Состав:</h4>
          <div className="space-y-1.5">
            {stack.tools.map((item, index) => {
              const tool = getTool(item.toolId);
              if (!tool) return null;
              
              const categoryInfo = categories[tool.category];
              
              return (
                <div key={item.toolId} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-sm truncate">{tool.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${categoryInfo.color}`}>
                        {categoryInfo.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t space-y-1.5">
          <div className="flex items-center gap-1">
            <h4 className="text-xs font-medium">Для чего:</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{stack.useCase}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">{stack.useCase}</p>
        </div>

        <div className="pt-2 border-t space-y-1.5">
          <h4 className="text-xs font-medium">Плюсы:</h4>
          <div className="flex flex-wrap gap-1">
            {stack.pros.slice(0, 3).map((pro, index) => (
              <Badge key={index} variant="secondary" className="text-[10px]">
                {pro}
              </Badge>
            ))}
            {stack.pros.length > 3 && (
              <Badge variant="outline" className="text-[10px]">
                +{stack.pros.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
