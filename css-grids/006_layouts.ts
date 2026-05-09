/**
 * Layout Data - All CSS Grid layouts for the advisor
 */

import { Layout, LayoutCategory } from '@/types/layout';

/**
 * All available layouts
 */
export const layouts: Layout[] = [
  // ═══════════════════════════════════════════════════════════════
  // БАЗОВЫЕ МАКЕТЫ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'sidebar-left',
    name: 'Sidebar Left',
    description: 'Классический макет с боковой панелью слева.',
    structure: 'sidebar-left',
    bestFor: ['admin-panel', 'ecommerce'],
    conflicts: ['landing'],
    icon: 'LayoutPanelLeft',
    techNotes: 'grid-template-columns: 250px 1fr'
  },
  {
    id: 'sidebar-right',
    name: 'Sidebar Right',
    description: 'Боковая панель справа. Хорошо для SEO.',
    structure: 'sidebar-right',
    bestFor: ['blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'LayoutPanelTop',
    techNotes: 'grid-template-columns: 1fr 250px'
  },
  {
    id: 'top-nav',
    name: 'Top Navigation',
    description: 'Простая навигация сверху. Минималистичный дизайн.',
    structure: 'top-nav',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'LayoutList',
    techNotes: 'Flexbox для nav + Grid для секций'
  },
  {
    id: 'two-columns',
    name: 'Two Columns',
    description: 'Простая двухколоночная структура.',
    structure: 'two-columns',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: [],
    icon: 'Columns2',
    techNotes: 'grid-template-columns: 1fr 1fr'
  },
  {
    id: 'three-columns',
    name: 'Three Columns',
    description: 'Трёхколоночный макет для каталогов.',
    structure: 'three-columns',
    bestFor: ['ecommerce', 'blog'],
    conflicts: ['landing'],
    icon: 'Columns3',
    techNotes: 'grid-template-columns: repeat(3, 1fr)'
  },

  // ═══════════════════════════════════════════════════════════════
  // CSS GRID КЛАССИЧЕСКИЕ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'holy-grail',
    name: 'Holy Grail',
    description: 'Легендарный трёхколоночный макет с хедером и футером.',
    structure: 'holy-grail',
    bestFor: ['ecommerce', 'blog'],
    conflicts: ['landing'],
    icon: 'Layout',
    techNotes: 'grid-template-areas: "header header header" "nav main aside" "footer footer footer"'
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Экран разделён на две части (50/50).',
    structure: 'split-screen',
    bestFor: ['landing'],
    conflicts: ['admin-panel'],
    icon: 'Split',
    techNotes: 'grid-template-columns: 1fr 1fr'
  },
  {
    id: 'cards-grid',
    name: 'Cards Grid',
    description: 'Сетка карточек с auto-fill. Адаптивная!',
    structure: 'cards-grid',
    bestFor: ['ecommerce', 'blog'],
    conflicts: ['landing'],
    icon: 'LayoutGrid',
    techNotes: 'grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))'
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Журнальный стиль с асимметричными блоками.',
    structure: 'magazine',
    bestFor: ['blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Newspaper',
    techNotes: 'grid-row: span 2, grid-column: span 2'
  },
  {
    id: 'fullscreen-hero',
    name: 'Fullscreen Hero',
    description: 'Полноэкранный Hero-блок. Трендовый дизайн.',
    structure: 'fullscreen-hero',
    bestFor: ['landing'],
    conflicts: ['admin-panel', 'ecommerce'],
    icon: 'Monitor',
    techNotes: 'grid-template-rows: 100vh auto'
  },

  // ═══════════════════════════════════════════════════════════════
  // BENTO GRID
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'bento-grid',
    name: 'Bento Grid',
    description: 'Классический японский стиль. Блоки разного размера.',
    structure: 'bento-grid',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Grid3x3',
    techNotes: 'grid-auto-flow: dense + span классы для размеров блоков'
  },
  {
    id: 'bento-sidebar',
    name: 'Bento Sidebar',
    description: 'Bento Grid с боковой панелью навигации.',
    structure: 'bento-sidebar',
    bestFor: ['admin-panel', 'ecommerce'],
    conflicts: ['landing'],
    icon: 'LayoutPanelLeft',
    techNotes: 'grid-template-columns: 200px repeat(3, 1fr) + span классы'
  },
  {
    id: 'bento-hero',
    name: 'Bento Hero',
    description: 'Bento Grid с большим hero-блоком сверху.',
    structure: 'bento-hero',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'Square',
    techNotes: 'grid-template-rows: 200px 1fr + span для hero блока'
  },
  {
    id: 'bento-masonry',
    name: 'Bento Masonry',
    description: 'Смешанный стиль: Bento + Masonry. Разная высота блоков.',
    structure: 'bento-masonry',
    bestFor: ['blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'LayoutList',
    techNotes: 'grid-auto-rows: masonry (экспериментально) или grid-row: span N'
  },

  // ═══════════════════════════════════════════════════════════════
  // ПРОДВИНУТЫЕ CSS GRID
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'masonry-grid',
    name: 'Masonry Grid',
    description: 'Кирпичная кладка. Pinterest-стиль через grid-auto-rows + span.',
    structure: 'masonry-grid',
    bestFor: ['blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Columns2',
    techNotes: 'grid-template-columns + grid-auto-rows: 8px + grid-row: span N'
  },
  {
    id: 'asymmetric-grid',
    name: 'Asymmetric Grid',
    description: 'Асимметричные блоки. Креативный дизайн.',
    structure: 'asymmetric-grid',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'SquareDashed',
    techNotes: 'grid-template-columns: 2fr 1fr 1fr + span для акцентов'
  },
  {
    id: 'span-grid',
    name: 'Span Grid',
    description: 'Сетка с блоками, охватывающими несколько ячеек.',
    structure: 'span-grid',
    bestFor: ['landing', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Table',
    techNotes: 'grid-column: span 2/3, grid-row: span 2 для больших блоков'
  },
  {
    id: 'overlap-grid',
    name: 'Overlap Grid',
    description: 'Блоки с перекрытием. Эффект глубины.',
    structure: 'overlap-grid',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel', 'ecommerce'],
    icon: 'Layers',
    techNotes: 'grid-row / grid-column + negative margin или z-index'
  },
  {
    id: 'honeycomb-grid',
    name: 'Honeycomb',
    description: 'Соты. Hexagon-стиль через CSS Grid + clip-path.',
    structure: 'honeycomb-grid',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'Hexagon',
    techNotes: 'grid-template-columns: repeat(6, 1fr) + clip-path: polygon() + offset columns'
  },
  {
    id: 'mosaic-grid',
    name: 'Mosaic Grid',
    description: 'Мозаичная сетка. Случайные размеры блоков.',
    structure: 'mosaic-grid',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Grid2x2',
    techNotes: 'Комбинация span значений: 1, 2, 3 для cols и rows'
  },
  {
    id: 'responsive-grid',
    name: 'Responsive Grid',
    description: 'Полностью адаптивная auto-fit сетка.',
    structure: 'responsive-grid',
    bestFor: ['ecommerce', 'blog', 'landing'],
    conflicts: ['admin-panel'],
    icon: 'Smartphone',
    techNotes: 'grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr))'
  },

  // ═══════════════════════════════════════════════════════════════
  // FIBONACCI GRID
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'fibonacci-grid',
    name: 'Fibonacci Grid',
    description: 'Пропорции Фибоначчи: 1, 1, 2, 3, 5, 8. Гармония природы!',
    structure: 'fibonacci-grid',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'Sigma',
    techNotes: 'grid-template-columns: 1fr 1fr 2fr 3fr 5fr или пропорции φ ≈ 1.618'
  },
  {
    id: 'fibonacci-columns',
    name: 'Fibonacci Columns',
    description: '5 колонок в пропорциях 1:1:2:3:5. Классический ряд.',
    structure: 'fibonacci-columns',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Columns3',
    techNotes: 'grid-template-columns: 1fr 1fr 2fr 3fr 5fr'
  },
  {
    id: 'fibonacci-tiles',
    name: 'Fibonacci Tiles',
    description: 'Плитки с размерами Фибоначчи. Идеально для портфолио.',
    structure: 'fibonacci-tiles',
    bestFor: ['blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Grid3x3',
    techNotes: 'grid-template: с колонками и строками 1, 2, 3, 5 + span классы'
  },
  {
    id: 'fibonacci-responsive',
    name: 'Fibonacci Responsive',
    description: 'Адаптивный Fibonacci. Пропорции меняются под экран.',
    structure: 'fibonacci-responsive',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Smartphone',
    techNotes: 'media queries: mobile 1:1, tablet 2:3, desktop 5:8'
  },
  {
    id: 'fibonacci-masonry',
    name: 'Fibonacci Masonry',
    description: 'Masonry с высотами Фибоначчи (3, 5, 8, 13) через grid-row: span.',
    structure: 'fibonacci-masonry',
    bestFor: ['blog', 'ecommerce'],
    conflicts: ['admin-panel', 'landing'],
    icon: 'LayoutList',
    techNotes: 'grid-template-columns + grid-auto-rows: 6px + grid-row: span 3/5/8/13'
  },
  {
    id: 'fibonacci-bento',
    name: 'Fibonacci Bento',
    description: 'Bento Grid с размерами Фибоначчи. Современный стиль.',
    structure: 'fibonacci-bento',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'Grid2x2',
    techNotes: 'grid-template-columns: 8fr 5fr 3fr + grid-row: span 2/3'
  },
  {
    id: 'fibonacci-steps',
    name: 'Fibonacci Steps',
    description: 'Ступенчатая структура. Каждый уровень больше предыдущего.',
    structure: 'fibonacci-steps',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'ArrowUpRight',
    techNotes: 'grid-template-rows: 1fr 2fr 3fr 5fr + align-items: end'
  },
  {
    id: 'fibonacci-cascade',
    name: 'Fibonacci Cascade',
    description: 'Каскадное расположение. Водопад блоков разного размера.',
    structure: 'fibonacci-cascade',
    bestFor: ['blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Waves',
    techNotes: 'grid-auto-flow: column + высоты 1, 2, 3, 5, 8 + offset'
  },

  // ═══════════════════════════════════════════════════════════════
  // МАТЕМАТИЧЕСКИЕ GRID
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'golden-ratio-grid',
    name: 'Golden Ratio',
    description: 'Золотое сечение (φ = 1.618). Идеальные пропорции.',
    structure: 'golden-ratio-grid',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Circle',
    techNotes: 'grid-template-columns: 61.8fr 38.2fr (золотое сечение)'
  },
  {
    id: 'phi-grid',
    name: 'Phi Grid (φ)',
    description: 'Сетка на основе φ по обеим осям. Идеальный баланс.',
    structure: 'phi-grid',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Grid3x3',
    techNotes: 'grid-template: 61.8fr 38.2fr / 61.8fr 38.2fr'
  },
  {
    id: 'rule-of-thirds',
    name: 'Rule of Thirds',
    description: 'Правило третей. Классика фотографии и дизайна.',
    structure: 'rule-of-thirds',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'Grid2x2',
    techNotes: 'grid-template-columns: 1fr 1fr 1fr / 1fr 1fr 1fr'
  },
  {
    id: 'harmonic-series',
    name: 'Harmonic Series',
    description: 'Гармонический ряд: 1, 1/2, 1/3, 1/4... Музыкальные пропорции.',
    structure: 'harmonic-series',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'Music',
    techNotes: 'grid-template-columns: 1fr 0.5fr 0.333fr 0.25fr'
  },
  {
    id: 'prime-grid',
    name: 'Prime Grid',
    description: 'Простые числа: 2, 3, 5, 7, 11... Математическая гармония.',
    structure: 'prime-grid',
    bestFor: ['landing', 'blog'],
    conflicts: ['admin-panel'],
    icon: 'Hash',
    techNotes: 'grid-template-columns: 2fr 3fr 5fr 7fr'
  },
  {
    id: 'sqrt-grid',
    name: 'Square Root Grid',
    description: 'Квадратные корни: √1, √2, √3, √4... Прогрессивный рост.',
    structure: 'sqrt-grid',
    bestFor: ['landing', 'blog', 'ecommerce'],
    conflicts: ['admin-panel'],
    icon: 'SquareRadical',
    techNotes: 'grid-template-columns: 1fr 1.414fr 1.732fr 2fr'
  },
  {
    id: 'modular-grid',
    name: 'Modular Grid',
    description: 'Модульная сетка. Основа типографики и дизайна.',
    structure: 'modular-grid',
    bestFor: ['blog', 'ecommerce'],
    conflicts: ['landing', 'admin-panel'],
    icon: 'LayoutGrid',
    techNotes: 'grid-template: repeat(6, 1fr) / repeat(6, 1fr)'
  },

  // ═══════════════════════════════════════════════════════════════
  // КОМПЛЕКСНЫЕ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Панель с виджетами. Для аналитики.',
    structure: 'dashboard',
    bestFor: ['admin-panel', 'ecommerce'],
    conflicts: ['landing', 'blog'],
    icon: 'LayoutDashboard',
    techNotes: 'grid-template-areas для виджетов + auto-rows: minmax(100px, auto)'
  },
  {
    id: 'blog',
    name: 'Blog Layout',
    description: 'Классический блог с сайдбаром.',
    structure: 'blog',
    bestFor: ['blog'],
    conflicts: ['admin-panel', 'landing'],
    icon: 'BookOpen',
    techNotes: 'grid-template-columns: 1fr 300px'
  }
];

/**
 * Layout categories for UI grouping
 */
export const layoutCategories: LayoutCategory[] = [
  {
    id: 'basic',
    name: 'Базовые',
    description: 'Простые и универсальные',
    layouts: ['sidebar-left', 'sidebar-right', 'top-nav', 'two-columns', 'three-columns']
  },
  {
    id: 'classic',
    name: 'Grid Классика',
    description: 'Проверенные временем',
    layouts: ['holy-grail', 'split-screen', 'cards-grid', 'magazine', 'fullscreen-hero']
  },
  {
    id: 'bento',
    name: 'Bento',
    description: 'Японский стиль',
    layouts: ['bento-grid', 'bento-sidebar', 'bento-hero', 'bento-masonry']
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    description: 'Пропорции природы',
    layouts: [
      'fibonacci-grid', 'fibonacci-columns', 'fibonacci-tiles',
      'fibonacci-responsive', 'fibonacci-masonry', 'fibonacci-bento',
      'fibonacci-steps', 'fibonacci-cascade'
    ]
  },
  {
    id: 'math',
    name: 'Math',
    description: 'Phi, Pi, roots, primes',
    layouts: [
      'golden-ratio-grid', 'phi-grid', 'rule-of-thirds',
      'harmonic-series',
      'prime-grid', 'sqrt-grid', 'modular-grid'
    ]
  },
  {
    id: 'advanced',
    name: 'Продвинутые',
    description: 'Креативные решения',
    layouts: ['masonry-grid', 'asymmetric-grid', 'span-grid', 'overlap-grid', 
              'honeycomb-grid', 'mosaic-grid', 'responsive-grid']
  },
  {
    id: 'complex',
    name: 'Комплексные',
    description: 'Сложные структуры',
    layouts: ['dashboard', 'blog']
  }
];

/**
 * Project goal labels (Russian)
 */
export const goalLabels: Record<string, string> = {
  'landing': 'Landing',
  'admin-panel': 'Admin Panel',
  'blog': 'Blog',
  'ecommerce': 'E-commerce'
};

/**
 * Font family labels
 */
export const fontLabels: Record<string, string> = {
  'sans': 'Sans-serif',
  'serif': 'Serif',
  'mono': 'Monospace'
};

/**
 * Font size labels
 */
export const sizeLabels: Record<string, string> = {
  'sm': 'S',
  'md': 'M',
  'lg': 'L'
};

/**
 * Accent color presets
 */
export const colorPresets = [
  { name: 'Зелёный', value: '#10b981' },
  { name: 'Фиолетовый', value: '#8b5cf6' },
  { name: 'Оранжевый', value: '#f97316' },
  { name: 'Розовый', value: '#ec4899' },
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Красный', value: '#ef4444' }
];
