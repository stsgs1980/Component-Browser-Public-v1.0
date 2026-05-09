/**
 * GoalSelector - Project goal selector component
 */

'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { goalLabels } from '@/data/layouts';
import { ProjectGoal } from '@/types/layout';
import { cn } from '@/lib/utils';

const goals: ProjectGoal[] = ['landing', 'admin-panel', 'blog', 'ecommerce'];

export function GoalSelector() {
  const { projectGoal, setGoal } = useAppStore();
  
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {goals.map((goal) => (
        <button
          key={goal}
          onClick={() => setGoal(goal)}
          className={cn(
            "px-3 py-1.5 text-sm rounded transition-all",
            "border border-border hover:border-primary/50",
            projectGoal === goal 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-background hover:bg-muted"
          )}
        >
          {goalLabels[goal]}
        </button>
      ))}
    </div>
  );
}
