/**
 * Layout & Stack Advisor - Main Page
 * Educational app for beginners to visually select layouts and tech stacks
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppStore } from '@/store/useAppStore';
import { LayoutSelector } from '@/components/layout-advisor/LayoutSelector';
import { PreviewArea } from '@/components/layout-advisor/PreviewArea';
import { AdvisorPanel } from '@/components/layout-advisor/AdvisorPanel';
import { ThemeSettings } from '@/components/layout-advisor/ThemeSettings';
import { GoalSelector } from '@/components/layout-advisor/GoalSelector';
import { layouts } from '@/data/layouts';
import { cn } from '@/lib/utils';
import { LayoutGrid, Settings, Lightbulb, Sparkles, Heart, ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';

// Collapsible advisor footer
function AdvisorFooter() {
  const [expanded, setExpanded] = useState(false);
  const { advices } = useAppStore();
  
  const errorCount = advices.filter(a => a.type === 'error').length;
  const warningCount = advices.filter(a => a.type === 'warning').length;
  const successCount = advices.filter(a => a.type === 'success').length;
  
  return (
    <div className="border-t bg-background">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Советы ментора</span>
          
          {/* Type indicators */}
          <div className="flex items-center gap-1.5">
            {errorCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                {errorCount} errors
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                {warningCount} tips
              </span>
            )}
            {successCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                {successCount} ok
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs">{advices.length} советов</span>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </button>
      
      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-4 border-t bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <AdvisorPanel compact />
          </div>
        </div>
      )}
    </div>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-3 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Layout & Stack Advisor v2.0</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{layouts.length} CSS Grid макетов</span>
        </div>
        <div className="flex items-center gap-1">
          Сделано с <Heart className="h-3 w-3 text-red-500" /> для обучения
        </div>
      </div>
    </footer>
  );
}

// Header
function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur py-4 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Layout & Stack Advisor</h1>
            <p className="text-xs text-muted-foreground">
              Умный конструктор макетов для новичков
            </p>
          </div>
        </div>
        
        <GoalSelector />
      </div>
    </header>
  );
}

// Constructor tab
function ConstructorTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <LayoutSelector />
      <PreviewArea />
    </div>
  );
}

// Settings tab
function SettingsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      <ThemeSettings />
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg border bg-muted/30">
          <h3 className="font-medium mb-2">How to use</h3>
          <ol className="text-sm text-muted-foreground space-y-2">
            <li>1. Выберите цель проекта в шапке</li>
            <li>2. Кликните на макет для предпросмотра</li>
            <li>3. Изучите советы ментора внизу</li>
            <li>4. Настройте тему по вкусу</li>
          </ol>
        </div>
        
        <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <h3 className="font-medium mb-2 text-green-700 dark:text-green-300">
            What you will learn
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Какие макеты подходят для разных проектов</li>
            <li>• Основы CSS Grid и Flexbox</li>
            <li>• Bento Grid, Fibonacci Grid и другие</li>
            <li>• Как избежать типичных ошибок</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Recommendations tab
function RecommendationsTab() {
  const { selectedLayout, projectGoal, theme } = useAppStore();
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold mb-2">Ваш выбор</h2>
        <p className="text-muted-foreground">Сводка по текущей конфигурации</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Тип проекта</p>
          <p className="font-medium">
            {projectGoal === 'landing' && 'Landing'}
            {projectGoal === 'admin-panel' && 'Admin Panel'}
            {projectGoal === 'blog' && 'Blog'}
            {projectGoal === 'ecommerce' && 'E-commerce'}
          </p>
        </div>
        
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Макет</p>
          <p className="font-medium">{selectedLayout?.name || 'Не выбран'}</p>
        </div>
        
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Тема</p>
          <p className="font-medium">
            {theme.mode === 'light' ? 'Light' : 'Dark'}
          </p>
        </div>
        
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Шрифт</p>
          <p className="font-medium capitalize">
            {theme.fontFamily} ({theme.fontSize.toUpperCase()})
          </p>
        </div>
      </div>
      
      {selectedLayout && (
        <div className="p-6 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <h3 className="font-bold text-lg mb-3">Recommendation</h3>
          <p className="text-muted-foreground mb-4">{selectedLayout.techNotes}</p>
          
          <div className="space-y-2">
            <p className="font-medium">Подходит для:</p>
            <div className="flex flex-wrap gap-2">
              {selectedLayout.bestFor.map(use => (
                <span key={use} className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs">
                  {use === 'admin-panel' ? 'Админ-панель' : use === 'landing' ? 'Лендинг' : use === 'ecommerce' ? 'Магазин' : 'Блог'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {selectedLayout && selectedLayout.conflicts.includes(projectGoal) && (
        <div className="p-6 rounded-lg border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
          <h3 className="font-bold text-lg mb-3 text-red-600 dark:text-red-400">Warning!</h3>
          <p className="text-muted-foreground">
            Макет <strong>{selectedLayout.name}</strong> не рекомендуется для "{projectGoal}".
          </p>
        </div>
      )}
    </div>
  );
}

// Theme applier
function ThemeApplier({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore();
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme.mode]);
  
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', theme.accentColor);
  }, [theme.accentColor]);
  
  return <>{children}</>;
}

// Main page
export default function Home() {
  const generateAdvices = useAppStore(state => state.generateAdvices);
  
  useEffect(() => {
    generateAdvices();
  }, [generateAdvices]);
  
  return (
    <TooltipProvider delayDuration={300}>
      <ThemeApplier>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Header />
          
          <main className="flex-1 p-4 md:p-6">
            <Tabs defaultValue="constructor" className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="constructor" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Конструктор</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Настройки</span>
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden sm:inline">Рекомендации</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="constructor" className="flex-1 mt-0">
                <ConstructorTab />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <SettingsTab />
              </TabsContent>
              
              <TabsContent value="recommendations" className="mt-0">
                <RecommendationsTab />
              </TabsContent>
            </Tabs>
          </main>
          
          <AdvisorFooter />
          <Footer />
        </div>
      </ThemeApplier>
    </TooltipProvider>
  );
}
