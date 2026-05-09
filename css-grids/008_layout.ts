/**
 * Layout & Stack Advisor - Type Definitions
 */

// Цель проекта
export type ProjectGoal = 'landing' | 'admin-panel' | 'blog' | 'ecommerce';

// Тип совета
export type AdviceType = 'error' | 'warning' | 'success' | 'info';

// Структура макета (CSS Grid pattern)
export type LayoutStructure = 
  | 'sidebar-left' | 'sidebar-right' | 'top-nav' | 'two-columns' | 'three-columns'
  | 'holy-grail' | 'split-screen' | 'cards-grid' | 'magazine' | 'fullscreen-hero'
  | 'bento-grid' | 'bento-sidebar' | 'bento-hero' | 'bento-masonry'
  | 'masonry-grid' | 'asymmetric-grid' | 'span-grid' | 'overlap-grid' 
  | 'honeycomb-grid' | 'mosaic-grid' | 'responsive-grid'
  | 'fibonacci-grid' | 'fibonacci-columns' | 'fibonacci-tiles'
  | 'fibonacci-responsive' | 'fibonacci-masonry' | 'fibonacci-bento'
  | 'fibonacci-steps' | 'fibonacci-cascade'
  | 'golden-ratio-grid' | 'phi-grid' | 'rule-of-thirds'
  | 'harmonic-series'
  | 'prime-grid' | 'sqrt-grid' | 'modular-grid'
  | 'dashboard' | 'blog';

// Интерфейс макета
export interface Layout {
  id: string;
  name: string;
  description: string;
  structure: LayoutStructure;
  bestFor: ProjectGoal[];
  conflicts: ProjectGoal[];
  icon: string;
  techNotes: string;
  category?: string;
}

// Совет ментора
export interface Advice {
  id: string;
  type: AdviceType;
  title: string;
  message: string;
  suggestion?: string;
}

// Настройки темы
export interface ThemeSettings {
  mode: 'light' | 'dark';
  accentColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'sm' | 'md' | 'lg';
}

// Категория макетов
export interface LayoutCategory {
  id: string;
  name: string;
  description: string;
  layouts: string[];
}
