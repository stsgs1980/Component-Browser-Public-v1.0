/**
 * AdvisorPanel - Mentor tips panel (collapsible)
 */

'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lightbulb, AlertCircle, CheckCircle2, Info, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { Advice, AdviceType } from '@/types/layout';

// Icons for advice types
const icons: Record<AdviceType, React.ComponentType<{ className?: string }>> = {
  error: AlertCircle,
  warning: Lightbulb,
  success: CheckCircle2,
  info: Info
};

// Styles for advice types
const styles: Record<AdviceType, { bg: string; border: string; icon: string; text: string }> = {
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    text: 'text-red-700 dark:text-red-300'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-300'
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500',
    text: 'text-green-700 dark:text-green-300'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    text: 'text-blue-700 dark:text-blue-300'
  }
};

// Single advice card
function AdviceCard({ advice, compact }: { advice: Advice; compact?: boolean }) {
  const Icon = icons[advice.type];
  const style = styles[advice.type];
  
  if (compact) {
    return (
      <div className={cn("p-2 rounded border text-xs", style.bg, style.border)}>
        <div className="flex items-start gap-2">
          <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", style.icon)} />
          <div className="flex-1 min-w-0">
            <p className={cn("font-medium", style.text)}>{advice.title}</p>
            <p className="text-muted-foreground line-clamp-2 mt-0.5">{advice.message}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("p-3 rounded-lg border", style.bg, style.border)}>
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", style.icon)} />
        <div className="flex-1 space-y-1">
          <p className={cn("font-medium text-sm", style.text)}>{advice.title}</p>
          <p className="text-sm text-muted-foreground">{advice.message}</p>
          {advice.suggestion && (
            <p className="text-xs text-muted-foreground italic mt-2 pl-3 border-l-2 border-muted-foreground/30">
              Tip: {advice.suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty state
function EmptyState({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="text-center py-3">
        <Sparkles className="h-6 w-6 mx-auto text-muted-foreground/30 mb-1" />
        <p className="text-xs text-muted-foreground">Выберите макет для советов</p>
      </div>
    );
  }
  
  return (
    <div className="text-center py-8">
      <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground font-medium">Начните выбирать макет</p>
      <p className="text-sm text-muted-foreground/70 mt-1">Здесь появятся советы</p>
    </div>
  );
}

// Quick links
function QuickLinks({ compact }: { compact?: boolean }) {
  const links = [
    { label: 'Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' },
    { label: 'Grid', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/' },
    { label: 'Tailwind', url: 'https://tailwindcss.com/docs/responsive-design' }
  ];
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <BookOpen className="h-3 w-3" />
        <span>Ресурсы:</span>
        {links.map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            {link.label} <ExternalLink className="h-2.5 w-2.5 inline" />
          </a>
        ))}
      </div>
    );
  }
  
  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <BookOpen className="h-4 w-4" />
        <span>Полезные ресурсы:</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {links.map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted/50 rounded hover:bg-muted transition-colors text-center">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// Compatibility badge
function CompatibilityBadge({ compact }: { compact?: boolean }) {
  const { advices } = useAppStore();
  
  const hasError = advices.some(a => a.type === 'error');
  const hasWarning = advices.some(a => a.type === 'warning');
  const hasSuccess = advices.some(a => a.type === 'success');
  
  const status = hasError ? { label: 'Низкая', variant: 'destructive' as const } :
                 hasWarning ? { label: 'Средняя', variant: 'outline' as const } :
                 hasSuccess ? { label: 'Отличная', variant: 'outline' as const } :
                 { label: 'Проверка...', variant: 'secondary' as const };
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Совместимость:</span>
        <Badge variant={status.variant} className="text-[10px] px-1.5">{status.label}</Badge>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Совместимость:</span>
      <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
    </div>
  );
}

// Main component
export function AdvisorPanel({ compact = false }: { compact?: boolean }) {
  const { advices } = useAppStore();
  
  // Compact mode (for footer)
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <CompatibilityBadge compact />
          <span className="text-xs text-muted-foreground">
            {advices.length} {advices.length === 1 ? 'совет' : advices.length < 5 ? 'совета' : 'советов'}
          </span>
        </div>
        
        {advices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {advices.map(advice => (
              <AdviceCard key={advice.id} advice={advice} compact />
            ))}
          </div>
        ) : (
          <EmptyState compact />
        )}
        
        <QuickLinks compact />
      </div>
    );
  }
  
  // Full mode (standalone panel)
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Советы ментора
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <CompatibilityBadge />
        
        {advices.length > 0 ? (
          <div className="space-y-3">
            {advices.map(advice => (
              <AdviceCard key={advice.id} advice={advice} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
        
        <QuickLinks />
      </CardContent>
    </Card>
  );
}
