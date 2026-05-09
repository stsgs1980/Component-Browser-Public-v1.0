/**
 * App Store - Zustand state management with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Layout, ThemeSettings, ProjectGoal, Advice } from '@/types/layout';
import { layouts } from '@/data/layouts';

interface AppState {
  // State
  selectedLayout: Layout | null;
  projectGoal: ProjectGoal;
  theme: ThemeSettings;
  advices: Advice[];
  
  // Actions
  setLayout: (layout: Layout | null) => void;
  setGoal: (goal: ProjectGoal) => void;
  setTheme: (theme: Partial<ThemeSettings>) => void;
  generateAdvices: () => void;
}

/**
 * Generate smart advices based on current selection
 */
function createAdvices(layout: Layout | null, goal: ProjectGoal): Advice[] {
  const advices: Advice[] = [];
  
  if (!layout) {
    advices.push({
      id: 'select-layout',
      type: 'info',
      title: 'Выберите макет',
      message: 'Кликните на карточку макета слева для предпросмотра.',
      suggestion: 'Начните с категории "Базовые" для простых проектов.'
    });
    return advices;
  }
  
  // Check for conflicts
  if (layout.conflicts.includes(goal)) {
    const goalNames: Record<ProjectGoal, string> = {
      'landing': 'лендинг',
      'admin-panel': 'админ-панель',
      'blog': 'блог',
      'ecommerce': 'интернет-магазин'
    };
    
    advices.push({
      id: 'conflict',
      type: 'error',
      title: 'Конфликт совместимости',
      message: `Макет "${layout.name}" не рекомендуется для ${goalNames[goal]}.`,
      suggestion: 'Рассмотрите альтернативный макет или измените цель проекта.'
    });
  }
  
  // Best match advice
  if (layout.bestFor.includes(goal)) {
    advices.push({
      id: 'best-match',
      type: 'success',
      title: 'Отличный выбор!',
      message: `Макет "${layout.name}" идеально подходит для вашего проекта.`,
      suggestion: 'Продолжайте настройку темы для персонализации.'
    });
  }
  
  // Category-specific tips
  const categoryTips: Record<string, Advice> = {
    'fibonacci': {
      id: 'fibonacci-tip',
      type: 'info',
      title: 'Пропорции Фибоначчи',
      message: 'Числа Фибоначчи (1, 1, 2, 3, 5, 8...) создают естественную гармонию.',
      suggestion: 'Используйте для портфолио или креативных проектов.'
    },
    'bento': {
      id: 'bento-tip',
      type: 'info',
      title: 'Bento Grid',
      message: 'Японский стиль упаковки еды теперь в веб-дизайне!',
      suggestion: 'Современный тренд для лендингов и дашбордов.'
    },
    'basic': {
      id: 'basic-tip',
      type: 'info',
      title: 'Базовый макет',
      message: 'Простые макеты легко поддерживать и адаптировать.',
      suggestion: 'Идеально для начинающих разработчиков.'
    }
  };
  
  // Find category
  const category = Object.entries(categoryTips).find(([catId]) => 
    layouts.find(l => l.id === layout.id)?.structure.includes(catId) ||
    layout.id.includes(catId)
  );
  
  if (category) {
    advices.push(category[1]);
  }
  
  // Learning resources
  advices.push({
    id: 'learn-more',
    type: 'warning',
    title: 'Углублённое изучение',
    message: 'Изучите CSS Grid для полного понимания макета.',
    suggestion: 'css-tricks.com/snippets/css/complete-guide-grid/'
  });
  
  return advices;
}

/**
 * Create store with persistence
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedLayout: null,
      projectGoal: 'landing',
      theme: {
        mode: 'light',
        accentColor: '#10b981',
        fontFamily: 'sans',
        fontSize: 'md'
      },
      advices: [],
      
      // Actions
      setLayout: (layout) => {
        set({ selectedLayout: layout });
        get().generateAdvices();
      },
      
      setGoal: (goal) => {
        set({ projectGoal: goal });
        get().generateAdvices();
      },
      
      setTheme: (newTheme) => {
        set((state) => ({
          theme: { ...state.theme, ...newTheme }
        }));
      },
      
      generateAdvices: () => {
        const { selectedLayout, projectGoal } = get();
        set({ advices: createAdvices(selectedLayout, projectGoal) });
      }
    }),
    {
      name: 'layout-advisor-storage',
      partialize: (state) => ({
        selectedLayout: state.selectedLayout,
        projectGoal: state.projectGoal,
        theme: state.theme
      })
    }
  )
);
