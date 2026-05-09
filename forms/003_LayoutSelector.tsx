/**
 * LayoutSelector - Grid of layout cards with categories
 */

'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { layouts, layoutCategories } from '@/data/layouts';
import { Layout } from '@/types/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  LayoutPanelLeft, LayoutPanelTop, LayoutList, Columns2, Columns3,
  Layout, Split, LayoutGrid, Newspaper, Monitor, Grid3x3, Square,
  LayoutDashboard, BookOpen, Sigma, RefreshCw, Circle, Grid2x2,
  Table, Layers, Hexagon, SquareDashed, Smartphone,
  TrendingUp, ArrowUpRight, Sun, Waves, Triangle,
  RectangleHorizontal, Diamond, Music, Pi, Hash,
  SquareDashedBottom, SquareRadical
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutPanelLeft, LayoutPanelTop, LayoutList, Columns2, Columns3,
  Layout, Split, LayoutGrid, Newspaper, Monitor, Grid3x3, Square,
  LayoutDashboard, BookOpen, Sigma, RefreshCw, Circle, Grid2x2,
  Table, Layers, Hexagon, SquareDashed, Smartphone,
  TrendingUp, ArrowUpRight, Sun, Waves, Triangle,
  RectangleHorizontal, Diamond, Music, Pi, Hash,
  SquareDashedBottom, SquareRadical
};

interface LayoutCardProps {
  layout: Layout;
  isSelected: boolean;
  hasConflict: boolean;
  isBestMatch: boolean;
  onClick: () => void;
}

function LayoutCard({ layout, isSelected, hasConflict, isBestMatch, onClick }: LayoutCardProps) {
  const Icon = iconMap[layout.icon] || LayoutGrid;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded border transition-all group",
        "hover:shadow-md hover:scale-[1.02]",
        isSelected 
          ? "border-primary bg-primary/5 ring-1 ring-primary" 
          : "border-border hover:border-primary/50 bg-background"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded shrink-0 transition-colors",
          isSelected ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{layout.name}</span>
            {hasConflict && (
              <Badge variant="destructive" className="text-[10px] px-1.5">!</Badge>
            )}
            {isBestMatch && !hasConflict && (
              <Badge variant="outline" className="text-[10px] px-1.5 border-green-500 text-green-600">OK</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {layout.description}
          </p>
        </div>
      </div>
    </button>
  );
}

interface CategorySectionProps {
  categoryId: string;
  name: string;
  description: string;
  layouts: string[];
  selectedId: string | null;
  projectGoal: string;
  onSelect: (layout: Layout) => void;
}

function CategorySection({ 
  categoryId, name, description, layouts: categoryLayoutIds, selectedId, projectGoal, onSelect 
}: CategorySectionProps) {
  const categoryLayouts = layouts.filter(l => categoryLayoutIds.includes(l.id));
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="font-medium text-sm">{name}</span>
        <span className="text-xs text-muted-foreground">({categoryLayouts.length})</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {categoryLayouts.map(layout => (
          <LayoutCard
            key={layout.id}
            layout={layout}
            isSelected={selectedId === layout.id}
            hasConflict={layout.conflicts.includes(projectGoal as any)}
            isBestMatch={layout.bestFor.includes(projectGoal as any)}
            onClick={() => onSelect(layout)}
          />
        ))}
      </div>
    </div>
  );
}

export function LayoutSelector() {
  const { selectedLayout, projectGoal, setLayout } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories = activeCategory 
    ? layoutCategories.filter(c => c.id === activeCategory)
    : layoutCategories;
  
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Макеты</h2>
          <span className="text-xs text-muted-foreground">
            {layouts.length} вариантов
          </span>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              !activeCategory 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Все
          </button>
          {layoutCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                activeCategory === cat.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {categories.map(category => (
            <CategorySection
              key={category.id}
              {...category}
              selectedId={selectedLayout?.id || null}
              projectGoal={projectGoal}
              onSelect={setLayout}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
