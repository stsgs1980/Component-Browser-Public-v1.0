// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 83

"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolStackCard } from "@/components/tool-stack-card";
import { recommendedStacks, type Ecosystem } from "@/lib/ui-tools-data";

export function StacksSection() {
  const stackCounts = useMemo(() => {
    const counts: Record<Ecosystem | "All", number> = {
      All: recommendedStacks.length,
      React: recommendedStacks.filter(s => s.ecosystem.includes("React")).length,
      Vue: recommendedStacks.filter(s => s.ecosystem.includes("Vue")).length,
      "Framework-agnostic": recommendedStacks.filter(s => s.ecosystem.includes("Framework-agnostic")).length,
    };
    return counts;
  }, []);

  const getStacks = (ecosystem: Ecosystem | "All") => {
    if (ecosystem === "All") return recommendedStacks;
    return recommendedStacks.filter(s => s.ecosystem.includes(ecosystem));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Рекомендуемые связки</h2>
      
      <Tabs defaultValue="All" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[400px] h-auto">
          <TabsTrigger value="All" className="text-xs px-2">
            Все
            <span className="ml-1 text-muted-foreground">({stackCounts.All})</span>
          </TabsTrigger>
          <TabsTrigger value="React" className="text-xs px-2">
            React
            <span className="ml-1 text-muted-foreground">({stackCounts.React})</span>
          </TabsTrigger>
          <TabsTrigger value="Vue" className="text-xs px-2">
            Vue
            <span className="ml-1 text-muted-foreground">({stackCounts.Vue})</span>
          </TabsTrigger>
          <TabsTrigger value="Framework-agnostic" className="text-xs px-2">
            Универс.
            <span className="ml-1 text-muted-foreground">({stackCounts["Framework-agnostic"]})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="All" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {getStacks("All").map(stack => (
              <ToolStackCard key={stack.id} stack={stack} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="React" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {getStacks("React").map(stack => (
              <ToolStackCard key={stack.id} stack={stack} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Vue" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {getStacks("Vue").map(stack => (
              <ToolStackCard key={stack.id} stack={stack} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Framework-agnostic" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {getStacks("Framework-agnostic").map(stack => (
              <ToolStackCard key={stack.id} stack={stack} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
