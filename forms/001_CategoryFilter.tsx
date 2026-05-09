// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 54

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ToolCategory, categories, uiTools } from "@/lib/ui-tools-data";

interface CategoryFilterProps {
  selectedCategory: ToolCategory | "all";
  onCategoryChange: (category: ToolCategory | "all") => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const allCategories: (ToolCategory | "all")[] = [
    "all",
    "headless",
    "styled-library",
    "css-framework",
    "animation",
    "icons",
  ];

  const getCategoryLabel = (cat: ToolCategory | "all"): string => {
    if (cat === "all") return "Все";
    return categories[cat].name;
  };

  const getCount = (cat: ToolCategory | "all"): number => {
    if (cat === "all") return uiTools.length;
    return uiTools.filter(t => t.category === cat).length;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className="gap-2"
        >
          {getCategoryLabel(category)}
          <Badge variant={selectedCategory === category ? "secondary" : "outline"}>
            {getCount(category)}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
