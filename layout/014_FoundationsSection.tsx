// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 215

'use client'

import { motion } from 'framer-motion'
import { Box, Palette, Type, Grid3X3, Move, Sun, Circle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'

const foundations = [
  {
    icon: Palette,
    title: 'Цвет',
    description: 'Цветовые системы, палитры и семантическое использование цветов.',
    topics: ['Цветовые шкалы', 'Семантические цвета', 'Тёмная тема', 'Контраст']
  },
  {
    icon: Type,
    title: 'Типографика',
    description: 'Шрифтовые системы, масштабы и правила стилизации текста.',
    topics: ['Шрифты', 'Масштаб типов', 'Межстрочный интервал', 'Насыщенность']
  },
  {
    icon: Grid3X3,
    title: 'Отступы',
    description: 'Согласованные масштабы отступов и ритмы макета.',
    topics: ['Шкала отступов', 'Внешние отступы', 'Внутренние отступы', 'Промежутки']
  },
  {
    icon: Move,
    title: 'Движение',
    description: 'Принципы анимации и руководства по переходам.',
    topics: ['Функции времени', 'Длительности', 'Easing', 'Ключевые кадры']
  },
  {
    icon: Sun,
    title: 'Возвышение',
    description: 'Системы теней и визуальная иерархия через глубину.',
    topics: ['Шкала теней', 'Z-Index', 'Слои', 'Глубина']
  },
  {
    icon: Circle,
    title: 'Форма',
    description: 'Скругление углов и согласованность форм.',
    topics: ['Шкала радиусов', 'Острые углы', 'Скруглённые углы', 'Формы']
  },
  {
    icon: Sparkles,
    title: 'Иконки',
    description: 'Принципы дизайна иконок и реализация.',
    topics: ['Наборы иконок', 'Размеры', 'Стили', 'Доступность']
  },
  {
    icon: Box,
    title: 'Макет',
    description: 'Грид-системы и паттерны адаптивного дизайна.',
    topics: ['Грид-системы', 'Брейкпоинты', 'Контейнеры', 'Адаптивность']
  }
]

export function FoundationsSection() {
  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Box className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Основы</h1>
            <p className="text-muted-foreground">Базовые принципы дизайна, на которых строится всё остальное</p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Color Demo */}
      <AnimatedContainer delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Цветовая система
            </CardTitle>
            <CardDescription>Палитры основаны на Tailwind CSS с оттенками 50-950</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Левая колонка - основные палитры */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Брендовые цвета</h4>
                {/* Primary - Violet */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 shrink-0">Primary</span>
                  <div className="flex gap-0.5">
                    {['#f5f3ff', '#ddd6fe', '#a78bfa', '#7c3aed', '#5b21b6', '#3b0764'].map((color, i) => (
                      <div key={i} className="h-6 w-6 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
                {/* Accent - Cyan */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 shrink-0">Accent</span>
                  <div className="flex gap-0.5">
                    {['#ecfeff', '#a5f3fc', '#22d3ee', '#0891b2', '#155e75', '#042f2e'].map((color, i) => (
                      <div key={i} className="h-6 w-6 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
                {/* Neutral */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 shrink-0">Neutral</span>
                  <div className="flex gap-0.5">
                    {['#fafafa', '#e5e5e5', '#a3a3a3', '#525252', '#262626', '#0a0a0a'].map((color, i) => (
                      <div key={i} className="h-6 w-6 rounded border border-border" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Правая колонка - семантические */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Семантические цвета</h4>
                {/* Success */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 shrink-0">Success</span>
                  <div className="flex gap-0.5">
                    {['#f0fdf4', '#bbf7d0', '#22c55e', '#15803d', '#14532d'].map((color, i) => (
                      <div key={i} className="h-6 w-6 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
                {/* Warning */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 shrink-0">Warning</span>
                  <div className="flex gap-0.5">
                    {['#fffbeb', '#fde68a', '#f59e0b', '#b45309', '#78350f'].map((color, i) => (
                      <div key={i} className="h-6 w-6 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
                {/* Danger */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 shrink-0">Danger</span>
                  <div className="flex gap-0.5">
                    {['#fef2f2', '#fecaca', '#ef4444', '#b91c1c', '#450a0a'].map((color, i) => (
                      <div key={i} className="h-6 w-6 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
                {/* Info */}
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16 shrink-0">Info</span>
                  <div className="flex gap-0.5">
                    {['#eff6ff', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'].map((color, i) => (
                      <div key={i} className="h-6 w-6 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Применение */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Применение</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-primary" />
                  <span>Кнопки, ссылки, акценты</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-500" />
                  <span>Успех, подтверждение</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-amber-500" />
                  <span>Предупреждение</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-red-500" />
                  <span>Ошибка, удаление</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Foundations Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {foundations.map((foundation, index) => (
          <AnimatedCard key={foundation.title} index={index}>
            <Card className="h-full cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <foundation.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{foundation.title}</CardTitle>
                <CardDescription>{foundation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {foundation.topics.map((topic) => (
                    <li key={topic} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>
    </div>
  )
}
