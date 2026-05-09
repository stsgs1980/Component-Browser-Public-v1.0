// Project: UI MATRIX
// Category: app
// Source: design-systems\UI MATRIX\src\app
// Lines: 217

"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Link2, TrendingUp, ArrowUpDown } from "lucide-react";
import { ToolCard } from "@/components/ui-tool-card";
import { CompatibilityMatrix } from "@/components/compatibility-matrix";
import { ToolsGraph } from "@/components/tools-graph";
import { UsageGuide } from "@/components/usage-guide";
import { WarningsBlock } from "@/components/warnings-block";
import { RadarChart } from "@/components/radar-chart";
import { Glossary } from "@/components/glossary";
import { StacksSection } from "@/components/stacks-section";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  type ToolCategory,
  type SortOption,
  uiTools,
  sortTools,
  categories,
} from "@/lib/ui-tools-data";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  const sortedTools = useMemo(() => {
    let tools = uiTools;
    if (selectedCategory !== "all") {
      tools = tools.filter(t => t.category === selectedCategory);
    }
    return sortTools(tools, sortBy);
  }, [selectedCategory, sortBy]);

  const getCategoryLabel = (cat: ToolCategory | "all"): string => {
    if (cat === "all") return "Все";
    return categories[cat].name;
  };

  const getCount = (cat: ToolCategory | "all"): number => {
    if (cat === "all") return uiTools.length;
    return uiTools.filter(t => t.category === cat).length;
  };

  const allCategories: (ToolCategory | "all")[] = [
    "all",
    "headless",
    "styled-library",
    "css-framework",
    "animation",
    "icons",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Декоративный фон */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  Матрица совместимости UI-инструментов
                </h1>
                <p className="text-sm text-muted-foreground">
                  Интерактивный справочник по выбору и комбинированию UI-библиотек
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-full lg:w-[180px] bg-background/50">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        По рейтингу
                      </div>
                    </SelectItem>
                    <SelectItem value="popularity">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        По популярности
                      </div>
                    </SelectItem>
                    <SelectItem value="connections">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        По связям
                      </div>
                    </SelectItem>
                    <SelectItem value="name">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        По названию
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${selectedCategory === category 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"
                    }
                  `}
                >
                  {getCategoryLabel(category)}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs
                    ${selectedCategory === category 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-background"
                    }
                  `}>
                    {getCount(category)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-6 space-y-6">
        {/* Глоссарий */}
        <Glossary />

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="cards">Карточки</TabsTrigger>
            <TabsTrigger value="matrix">Матрица</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <UsageGuide />
              <WarningsBlock />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            <Separator />

            <StacksSection />
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <UsageGuide />
              <WarningsBlock />
            </div>

            <CompatibilityMatrix selectedCategory={selectedCategory} />
            
            <Separator />

            <StacksSection />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-muted/30 border-t backdrop-blur-sm">
        <div className="px-4 lg:px-8 py-6 space-y-6">
          <RadarChart selectedCategory={selectedCategory === "all" ? undefined : selectedCategory} />
          <ToolsGraph selectedCategory={selectedCategory} />
        </div>
        <div className="border-t bg-background/80">
          <div className="px-4 lg:px-8 py-3">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <p>Основано на Radix UI + Tailwind CSS + shadcn/ui</p>
              <p>Данные собраны из официальной документации</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
