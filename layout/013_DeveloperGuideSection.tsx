// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 193

'use client'

import { Terminal, Copy, Check, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'

const guides = [
  {
    title: 'Начало работы с shadcn/ui',
    description: 'Узнайте, как настроить shadcn/ui в проекте Next.js.',
    steps: [
      { step: 'Установите зависимости', code: 'bun add tailwindcss @radix-ui/react-accordion' },
      { step: 'Инициализируйте shadcn/ui', code: 'npx shadcn@latest init' },
      { step: 'Добавьте компоненты', code: 'npx shadcn@latest add button card input' }
    ]
  },
  {
    title: 'Настройка Tailwind CSS',
    description: 'Настройте Tailwind CSS для вашей дизайн-системы.',
    steps: [
      { step: 'Установите Tailwind', code: 'bun add -D tailwindcss postcss autoprefixer' },
      { step: 'Инициализируйте конфиг', code: 'npx tailwindcss init -p' },
      { step: 'Настройте пути', code: '// Добавьте в tailwind.config.js\ncontent: ["./src/**/*.{js,ts,jsx,tsx}"]' }
    ]
  },
  {
    title: 'Добавление тёмной темы',
    description: 'Реализуйте тёмную тему с помощью next-themes.',
    steps: [
      { step: 'Установите next-themes', code: 'bun add next-themes' },
      { step: 'Создайте провайдер', code: '// Оберните приложение ThemeProvider' },
      { step: 'Добавьте переключатель', code: '// Добавьте компонент переключения темы' }
    ]
  }
]

const bestPractices = [
  {
    title: 'Композиция компонентов',
    description: 'Создавайте компоненты, используя паттерны композиции для гибкости.',
    example: 'Паттерн составных компонентов для сложных UI-элементов.'
  },
  {
    title: 'Доступность на первом месте',
    description: 'Убедитесь, что все компоненты соответствуют стандартам WCAG 2.1 AA.',
    example: 'Используйте семантический HTML и правильные ARIA-атрибуты.'
  },
  {
    title: 'Интеграция TypeScript',
    description: 'Используйте TypeScript для лучшего опыта разработки.',
    example: 'Строгая типизация для пропсов и API компонентов.'
  },
  {
    title: 'Оптимизация производительности',
    description: 'Оптимизируйте размер бандла и производительность во время выполнения.',
    example: 'Ленивая загрузка компонентов и разделение кода.'
  }
]

export function DeveloperGuideSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Terminal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Руководство разработчика</h1>
            <p className="text-muted-foreground">Руководства по реализации и лучшие практики</p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Quick Start */}
      <AnimatedContainer delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Быстрый старт</CardTitle>
            <CardDescription>
              Начните работу за несколько минут
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg bg-muted p-4">
              <pre className="text-sm overflow-x-auto">
                <code>npx create-next-app@latest my-app --typescript --tailwind --eslint</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => handleCopy('npx create-next-app@latest my-app --typescript --tailwind --eslint')}
              >
                {copiedCode === 'npx create-next-app@latest my-app --typescript --tailwind --eslint' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Guides */}
      <div className="grid grid-cols-1 gap-6">
        {guides.map((guide, index) => (
          <AnimatedCard key={guide.title} index={index}>
            <Card>
              <CardHeader>
                <CardTitle>{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="steps">
                    <AccordionTrigger>Показать шаги</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {guide.steps.map((item, i) => (
                          <div key={i} className="flex items-start gap-4">
                            <Badge variant="outline" className="mt-1">{i + 1}</Badge>
                            <div className="flex-1">
                              <p className="font-medium mb-2">{item.step}</p>
                              <div className="relative rounded-lg bg-muted p-3">
                                <pre className="text-sm overflow-x-auto">
                                  <code>{item.code}</code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2"
                                  onClick={() => handleCopy(item.code)}
                                >
                                  {copiedCode === item.code ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      {/* Best Practices */}
      <AnimatedContainer delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Лучшие практики</CardTitle>
            <CardDescription>
              Следуйте этим рекомендациям для создания поддерживаемых дизайн-систем
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {bestPractices.map((practice) => (
                <div key={practice.title} className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-1">{practice.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{practice.description}</p>
                  <p className="text-xs text-muted-foreground italic">{practice.example}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  )
}
