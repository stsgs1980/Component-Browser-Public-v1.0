// Project: Industrial Style Guide
// Category: app
// Source: design-systems\Industrial Style Guide\src\app
// Lines: 973

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  ChevronRight,
  Grid3X3,
  Ruler,
  Component,
  X,
  ZoomIn
} from 'lucide-react'

// Компонент для избранного примера
function FeaturedExample({ example }: { example: typeof featuredExamples[0] }) {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <>
      <div className="group">
        <div 
          className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          onClick={() => setShowModal(true)}
        >
          <Image
            src={example.image}
            alt={example.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-bold text-sm">{example.title}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{example.description}</p>
        </div>
      </div>
      {showModal && (
        <ImageModal
          src={example.image}
          alt={example.title}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

// Избранные примеры
const featuredExamples = [
  {
    id: 'eng-minimal',
    title: 'Инженерный минимализм',
    description: 'Минималистичный архитектурный набросок — чистые линии, лёгкая штриховка графитом',
    image: '/styles/engineering_drawing_minimal.png'
  },
  {
    id: 'eng-example',
    title: 'Технический чертёж',
    description: 'Механические компоненты с точными линиями и штриховкой',
    image: '/styles/engineering_drawing_example.png'
  },
  {
    id: 'eng-mechanism',
    title: 'Взрыв-схема механизма',
    description: 'Винтажное инженерное черчение с разобранным механизмом',
    image: '/styles/engineering_drawing_mechanism.png'
  },
  {
    id: 'ind-01',
    title: 'Индустриальный минимализм',
    description: 'Техническая эстетика — линии, текстуры, геометрия',
    image: '/styles/industrial_minimalism_01.png'
  },
  {
    id: 'ind-02',
    title: 'Механический объект',
    description: 'Чистый дизайн продукта с тонкими линиями',
    image: '/styles/industrial_minimalism_02.png'
  },
  {
    id: 'ind-ui',
    title: 'UI в стиле индустриализма',
    description: 'Технический интерфейс, дашборд, инженерная эстетика',
    image: '/styles/industrial_minimalism_ui.png'
  }
]

// Данные о стилях с изображениями
const technicalStyles = [
  {
    id: 'blueprint',
    title: 'Blueprint',
    subtitle: 'Синий чертёж',
    description: 'Классический стиль инженерных чертежей на синем фоне с белыми линиями. Используется в архитектуре и машиностроении.',
    features: ['Синий фон', 'Белые линии', 'Размерные линии', 'Масштаб'],
    image: '/styles/style_01_blueprint.png'
  },
  {
    id: 'technical',
    title: 'Technical Drawing',
    subtitle: 'Технический рисунок',
    description: 'Точные пропорции, размерные линии, сечения и разрезы. Профессиональный стиль для документации.',
    features: ['Точные размеры', 'Сечения', 'Разрезы', 'Допуски'],
    image: '/styles/style_02_technical_drawing.png'
  },
  {
    id: 'isometric',
    title: 'Isometric',
    subtitle: 'Изометрия',
    description: 'Трёхмерное изображение без перспективных искажений. Популярно в технической иллюстрации и инди-играх.',
    features: ['3D эффект', 'Нет перспективы', '120° оси', 'Точные пропорции'],
    image: '/styles/style_03_isometric.png'
  },
  {
    id: 'exploded',
    title: 'Exploded View',
    subtitle: 'Взрыв-схема',
    description: 'Разобранный механизм с показом всех компонентов и их взаимного расположения.',
    features: ['Детали', 'Позиции', 'Линии связи', 'Сборка'],
    image: '/styles/style_04_exploded_view.png'
  },
  {
    id: 'patent',
    title: 'Patent Drawing',
    subtitle: 'Патентный чертёж',
    description: 'Стиль чертежей для патентной документации — чёткие линии, нумерация элементов, минималистичный.',
    features: ['Нумерация', 'Чистые линии', 'Без теней', 'Проекции'],
    image: '/styles/style_05_patent.png'
  },
  {
    id: 'architectural',
    title: 'Architectural',
    subtitle: 'Архитектурный',
    description: 'Планы зданий, фасады, разрезы с точными пропорциями и детализацией.',
    features: ['Планы', 'Фасады', 'Разрезы', 'Условные обозначения'],
    image: '/styles/style_06_architectural.png'
  }
]

const pencilStyles = [
  {
    id: 'pencil',
    title: 'Pencil Sketch',
    subtitle: 'Карандашный набросок',
    description: 'Свободный рисунок графитовым карандашом с разной степенью нажима и штриховки.',
    image: '/styles/style_07_pencil_sketch.png'
  },
  {
    id: 'charcoal',
    title: 'Charcoal',
    subtitle: 'Уголь',
    description: 'Более грубый, контрастный стиль с глубокими тенями и текстурой.',
    image: '/styles/style_08_charcoal.png'
  },
  {
    id: 'ink',
    title: 'Ink Drawing',
    subtitle: 'Тушь',
    description: 'Чёткие чёрные линии, часто используется в технической иллюстрации и комиксах.',
    image: '/styles/style_09_ink_drawing.png'
  },
  {
    id: 'pen',
    title: 'Pen & Ink',
    subtitle: 'Перо и тушь',
    description: 'Тонкие точные линии, штриховка, кросс-хэтчинг. Похож на гравюру.',
    image: '/styles/style_10_pen_and_ink.png'
  },
  {
    id: 'graphite',
    title: 'Graphite Realism',
    subtitle: 'Графитовый реализм',
    description: 'Фотореалистичные рисунки карандашом с детальной проработкой.',
    image: '/styles/style_11_graphite_realism.png'
  },
  {
    id: 'conte',
    title: 'Conté Crayon',
    subtitle: 'Сангина/Сепия',
    description: 'Тёплые коричневые или красноватые тона, классический академический стиль.',
    image: '/styles/style_12_conte_crayon.png'
  }
]

const minimalStyles = [
  {
    id: 'lineart',
    title: 'Line Art',
    subtitle: 'Линейный рисунок',
    description: 'Только контуры, без заливки и теней. Максимальный минимализм.',
    uiScore: 90,
    image: '/styles/style_13_line_art.png'
  },
  {
    id: 'minimal',
    title: 'Minimalist Sketch',
    subtitle: 'Минимальный набросок',
    description: 'Несколько штрихов, передающих суть объекта. Экономия средств.',
    uiScore: 85,
    image: '/styles/style_14_minimalist_sketch.png'
  },
  {
    id: 'monoline',
    title: 'Monoline',
    subtitle: 'Монолиния',
    description: 'Линии одинаковой толщины. Идеально для логотипов и иконок.',
    uiScore: 85,
    image: '/styles/style_15_monoline.png'
  },
  {
    id: 'continuous',
    title: 'Continuous Line',
    subtitle: 'Непрерывная линия',
    description: 'Рисунок одной линией без отрыва — популярный современный стиль.',
    uiScore: 70,
    image: '/styles/style_16_continuous_line.png'
  },
  {
    id: 'wireframe',
    title: 'Wireframe',
    subtitle: 'Каркасная модель',
    description: 'Только рёбра и контуры объекта. Идеально для прототипов.',
    uiScore: 95,
    image: '/styles/style_17_wireframe.png'
  },
  {
    id: 'outline',
    title: 'Outline',
    subtitle: 'Контурный рисунок',
    description: 'Простой контур объекта без внутренних деталей.',
    uiScore: 80,
    image: '/styles/style_18_outline.png'
  }
]

const architecturalStyles = [
  {
    id: 'arch-sketch',
    title: 'Architectural Sketch',
    subtitle: 'Архитектурный эскиз',
    description: 'Быстрые наброски зданий от руки, часто с акварельным подкрашиванием.',
    image: '/styles/style_19_architectural_sketch.png'
  },
  {
    id: 'construction',
    title: 'Construction Drawing',
    subtitle: 'Строительный чертёж',
    description: 'Детальные чертежи для строительства с размерами и спецификациями.',
    image: '/styles/style_20_construction.png'
  },
  {
    id: 'schematic',
    title: 'Schematic Drawing',
    subtitle: 'Схематический чертёж',
    description: 'Упрощённое изображение, показывающее принцип работы или структуру.',
    image: '/styles/style_21_schematic.png'
  },
  {
    id: 'orthographic',
    title: 'Orthographic Projection',
    subtitle: 'Ортогональная проекция',
    description: 'Виды спереди, сбоку и сверху на одном листе.',
    image: '/styles/style_22_orthographic.png'
  }
]

const vintageStyles = [
  {
    id: 'vintage-tech',
    title: 'Vintage Technical',
    subtitle: 'Винтажная техническая',
    description: 'Стиль старых энциклопедий и справочников XIX-XX века.',
    image: '/styles/style_23_vintage_technical.png'
  },
  {
    id: 'engraving',
    title: 'Engraving Style',
    subtitle: 'Гравюра',
    description: 'Стиль старинных гравюр Дюрера, с тонкими параллельными линиями.',
    image: '/styles/style_24_engraving.png'
  },
  {
    id: 'botanical',
    title: 'Botanical Illustration',
    subtitle: 'Ботаническая иллюстрация',
    description: 'Научные рисунки растений с высокой детализацией на белом фоне.',
    image: '/styles/style_25_botanical.png'
  },
  {
    id: 'scientific',
    title: 'Scientific Diagram',
    subtitle: 'Научная диаграмма',
    description: 'Иллюстрации из старых научных трудов, анатомические атласы.',
    image: '/styles/style_26_scientific_diagram.png'
  },
  {
    id: 'davinci',
    title: 'Da Vinci Sketch',
    subtitle: 'Эскизы Леонардо',
    description: 'Стиль рукописей и чертежей эпохи Возрождения.',
    image: '/styles/style_27_da_vinci.png'
  }
]

const digitalStyles = [
  {
    id: 'lowpoly',
    title: 'Low Poly',
    subtitle: 'Низкополигональный',
    description: 'Геометрический стиль из треугольников и многоугольников.',
    score: 75,
    use: ['Иллюстрации', 'Фоны', '3D иконки', 'Splash screens'],
    image: '/styles/style_28_low_poly.png'
  },
  {
    id: 'geometric',
    title: 'Geometric Minimalism',
    subtitle: 'Геометрический минимализм',
    description: 'Простые формы, чистые линии, ограниченная палитра.',
    score: 80,
    use: ['Лендинги', 'Hero секции', 'Фоны', 'Декор'],
    image: '/styles/style_29_geometric_minimalism.png'
  },
  {
    id: 'flat',
    title: 'Flat Design Technical',
    subtitle: 'Плоский технический дизайн',
    description: 'Стандарт индустрии. Чистота, масштабируемость, профессионализм.',
    score: 100,
    use: ['Иконки', 'Кнопки', 'Карточки', 'Инфографика'],
    image: '/styles/style_30_flat_design.png'
  },
  {
    id: 'dotted',
    title: 'Dotted Drawing',
    subtitle: 'Точечный рисунок',
    description: 'Изображение из точек. Уникальная текстура и стиль.',
    score: 60,
    use: ['Арт', 'Иллюстрации', 'Декор', 'Специальные проекты'],
    image: '/styles/style_31_dotted.png'
  }
]

// Модальное окно для просмотра изображения
function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-zinc-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={1024}
          className="w-full h-auto object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

// Карточка стиля с изображением
function StyleCard({ style, index, showImage = true }: { style: any; index: number; showImage?: boolean }) {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <>
      <Card className="border border-zinc-200 dark:border-zinc-800 rounded-none shadow-none hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors bg-transparent overflow-hidden group">
        {showImage && style.image && (
          <div 
            className="relative h-40 bg-zinc-100 dark:bg-zinc-900 cursor-pointer overflow-hidden"
            onClick={() => setShowModal(true)}
          >
            <Image
              src={style.image}
              alt={style.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
              {style.subtitle}
            </span>
          </div>
          <CardTitle className="text-lg font-bold mt-2">{style.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{style.description}</p>
          {style.features && (
            <div className="flex flex-wrap gap-2">
              {style.features.map((feature: string) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
          {style.uiScore && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">UI Score:</span>
              <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100"
                  style={{ width: `${style.uiScore}%` }}
                />
              </div>
              <span className="text-xs font-bold">{style.uiScore}%</span>
            </div>
          )}
          {style.use && (
            <div className="flex flex-wrap gap-2">
              {style.use.map((u: string) => (
                <span
                  key={u}
                  className="text-xs px-2 py-1 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                >
                  {u}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {showModal && (
        <ImageModal
          src={style.image}
          alt={style.title}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('technical')

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono transition-colors">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-950 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-zinc-900 dark:border-zinc-100 flex items-center justify-center">
                <Ruler className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-wider uppercase">
                Industrial Style
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#styles" className="text-xs tracking-wider uppercase hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
                Стили
              </a>
              <a href="#comparison" className="text-xs tracking-wider uppercase hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
                Сравнение
              </a>
              <a href="#ui" className="text-xs tracking-wider uppercase hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
                Для UI
              </a>
              <a href="#about" className="text-xs tracking-wider uppercase hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
                О стиле
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {/* Mobile menu button */}
              <button className="md:hidden p-2 border border-zinc-300 dark:border-zinc-700">
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-12 h-[1px] bg-zinc-400 dark:bg-zinc-600" />
                <span className="text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                  Справочник
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Индустриальный
                <br />
                <span className="text-zinc-400 dark:text-zinc-500">Минимализм</span>
              </h1>

              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-md leading-relaxed">
                Полное руководство по стилям технической иллюстрации.
                От инженерных чертежей до современного UI дизайна.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#styles"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs tracking-wider uppercase hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Изучить стили
                  <ChevronRight className="w-3 h-3" />
                </a>
                <a
                  href="#ui"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-xs tracking-wider uppercase hover:border-zinc-900 dark:hover:border-zinc-400 transition-colors"
                >
                  Для UI дизайна
                </a>
              </div>
            </div>

            {/* Geometric decoration */}
            <div className="hidden md:block relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Grid */}
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="border border-zinc-200 dark:border-zinc-800" />
                    ))}
                  </div>

                  {/* Geometric shapes */}
                  <div className="absolute top-4 left-4 w-16 h-16 border-2 border-zinc-900 dark:border-zinc-100" />
                  <div className="absolute top-12 right-8 w-12 h-12 border-2 border-zinc-400 dark:border-zinc-600 rounded-full" />
                  <div className="absolute bottom-8 left-12">
                    <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[40px] border-l-transparent border-r-transparent border-b-zinc-300 dark:border-b-zinc-700" />
                  </div>
                  <div className="absolute bottom-4 right-4 w-20 h-1 bg-zinc-900 dark:bg-zinc-100" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-zinc-400 dark:border-zinc-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-l-2 border-zinc-900 dark:border-zinc-100 pl-4">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Чертёж</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Документ для производства с размерами, допусками, техническими требованиями.
              </p>
            </div>
            <div className="border-l-2 border-zinc-400 dark:border-zinc-600 pl-4">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Минимализм</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Художественный стиль. Красивые линии без цифр. Для дизайна и UI.
              </p>
            </div>
            <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-4">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Разница</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Чертёж = «Как сделать». Минимализм = «Как выглядит красиво».
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Examples */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-8 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
              <span className="text-xs font-bold">★</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Избранные примеры</h2>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredExamples.map((example) => (
              <FeaturedExample key={example.id} example={example} />
            ))}
          </div>
        </div>
      </section>

      {/* Styles Section */}
      <section id="styles" className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-8 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
              <span className="text-xs font-bold">01</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Каталог стилей</h2>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b border-zinc-200 dark:border-zinc-800 bg-transparent h-auto p-0 mb-8 flex-wrap">
              <TabsTrigger
                value="technical"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent bg-transparent px-4 py-3 text-xs tracking-wider uppercase"
              >
                Технические
              </TabsTrigger>
              <TabsTrigger
                value="pencil"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent bg-transparent px-4 py-3 text-xs tracking-wider uppercase"
              >
                Карандашные
              </TabsTrigger>
              <TabsTrigger
                value="minimal"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent bg-transparent px-4 py-3 text-xs tracking-wider uppercase"
              >
                Минималистичные
              </TabsTrigger>
              <TabsTrigger
                value="architectural"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent bg-transparent px-4 py-3 text-xs tracking-wider uppercase"
              >
                Архитектурные
              </TabsTrigger>
              <TabsTrigger
                value="vintage"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent bg-transparent px-4 py-3 text-xs tracking-wider uppercase"
              >
                Винтажные
              </TabsTrigger>
              <TabsTrigger
                value="digital"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent bg-transparent px-4 py-3 text-xs tracking-wider uppercase"
              >
                Цифровые
              </TabsTrigger>
            </TabsList>

            {/* Technical Styles */}
            <TabsContent value="technical">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {technicalStyles.map((style, index) => (
                  <StyleCard key={style.id} style={style} index={index} />
                ))}
              </div>
            </TabsContent>

            {/* Pencil Styles */}
            <TabsContent value="pencil">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pencilStyles.map((style, index) => (
                  <StyleCard key={style.id} style={style} index={index + 6} />
                ))}
              </div>
            </TabsContent>

            {/* Minimal Styles */}
            <TabsContent value="minimal">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {minimalStyles.map((style, index) => (
                  <StyleCard key={style.id} style={style} index={index + 12} />
                ))}
              </div>
            </TabsContent>

            {/* Architectural Styles */}
            <TabsContent value="architectural">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {architecturalStyles.map((style, index) => (
                  <StyleCard key={style.id} style={style} index={index + 18} />
                ))}
              </div>
            </TabsContent>

            {/* Vintage Styles */}
            <TabsContent value="vintage">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vintageStyles.map((style, index) => (
                  <StyleCard key={style.id} style={style} index={index + 22} />
                ))}
              </div>
            </TabsContent>

            {/* Digital Styles */}
            <TabsContent value="digital">
              <div className="grid md:grid-cols-2 gap-4">
                {digitalStyles.map((style, index) => (
                  <StyleCard key={style.id} style={style} index={index + 27} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center">
              <span className="text-xs font-bold">02</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Чертёж vs Минимализм</h2>
          </div>

          {/* Comparison table */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Drawing */}
            <div className="border border-zinc-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Ruler className="w-5 h-5" />
                <h3 className="text-lg font-bold">Индустриальный Чертёж</h3>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Цель: Изготовить деталь</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Содержание: Размеры, допуски, сечения</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Функция: Документ для производства</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Детали: Максимально подробно</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Использование: Завод, инженеры</span>
                </li>
              </ul>
            </div>

            {/* Minimalism */}
            <div className="border border-zinc-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Component className="w-5 h-5" />
                <h3 className="text-lg font-bold">Индустриальный Минимализм</h3>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Цель: Выглядеть красиво</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Содержание: Только эстетика</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Функция: Стиль для дизайна</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Детали: Минимально, только суть</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-500" />
                  <span>Использование: UI, брендинг, арт</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 border border-zinc-700 text-center">
            <p className="text-sm text-zinc-400">
              <span className="text-white font-bold">Чертёж</span> = «Как это сделать» → 
              <span className="text-white font-bold ml-2">Минимализм</span> = «Как это выглядит красиво»
            </p>
          </div>
        </div>
      </section>

      {/* UI Section */}
      <section id="ui" className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-8 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
              <span className="text-xs font-bold">03</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">ТОП-5 для UI</h2>
          </div>

          {/* Ranking */}
          <div className="space-y-4">
            {[
              { name: 'Flat Design Technical', score: 100, desc: 'Стандарт индустрии' },
              { name: 'Line Art', score: 90, desc: 'Тренд минимализма' },
              { name: 'Monoline', score: 85, desc: 'Для иконок и логотипов' },
              { name: 'Geometric Minimalism', score: 80, desc: 'Современный стиль' },
              { name: 'Isometric', score: 75, desc: 'Инфографика, дашборды' }
            ].map((item, index) => (
              <div key={item.name} className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                <span className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 w-8">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold">{item.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="about" className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-8 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
              <span className="text-xs font-bold">04</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Частые вопросы</h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="q1" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4">
              <AccordionTrigger className="text-left font-bold hover:no-underline">
                Что такое индустриальный минимализм?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                Это художественный стиль, вдохновлённый инженерными чертежами. Берёт эстетику технического рисования — 
                точные линии, геометрию, механические формы — но без технических данных (размеров, допусков). 
                Используется в UI дизайне, брендинге, иллюстрации.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4">
              <AccordionTrigger className="text-left font-bold hover:no-underline">
                Engineering Drawing = Индустриальный чертёж?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                <strong>Да, это одно и то же.</strong> Engineering Drawing (англ.) = Инженерный чертёж (русск.) = 
                Индустриальный чертёж. Это профессиональный документ для производства с размерами и спецификациями.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4">
              <AccordionTrigger className="text-left font-bold hover:no-underline">
                Какой стиль лучше для UI?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                <strong>Flat Design Technical (100%)</strong> — стандарт индустрии. Также хороши: Line Art (90%) для 
                empty states и иконок, Monoline (85%) для логотипов, Wireframe (95%) для прототипов.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4">
              <AccordionTrigger className="text-left font-bold hover:no-underline">
                Чем чертёж отличается от минимализма?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                <strong>Чертёж</strong> — документ для производства: размеры, допуски, технические требования.<br/>
                <strong>Минимализм</strong> — художественный стиль: красивые линии без цифр, для дизайна.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 dark:bg-zinc-950 text-white border-t border-zinc-800 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border-2 border-white flex items-center justify-center">
                  <Ruler className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold tracking-wider uppercase">
                  Industrial Style
                </span>
              </div>
              <p className="text-sm text-zinc-400 max-w-md">
                Полный справочник по стилям технической иллюстрации и индустриального минимализма 
                для дизайнеров и инженеров.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Разделы</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#styles" className="hover:text-white transition-colors">Каталог стилей</a></li>
                <li><a href="#comparison" className="hover:text-white transition-colors">Сравнение</a></li>
                <li><a href="#ui" className="hover:text-white transition-colors">Для UI</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Stats */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4">Статистика</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>31 стиль</li>
                <li>6 категорий</li>
                <li>С примерами</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-500">
              © 2024 Industrial Style Guide. Справочник стилей.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 border border-zinc-600" />
              <div className="w-3 h-3 border border-zinc-600 rounded-full" />
              <div className="w-3 h-3 border border-zinc-600 rotate-45" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
