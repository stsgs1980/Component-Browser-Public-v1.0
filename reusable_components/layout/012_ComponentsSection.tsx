// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 162

'use client'

import { useState } from 'react'
import { Puzzle, Search, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'
import { components } from '@/data/components'

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'inputs', name: 'Ввод' },
  { id: 'navigation', name: 'Навигация' },
  { id: 'feedback', name: 'Обратная связь' },
  { id: 'data-display', name: 'Отображение данных' },
  { id: 'layout', name: 'Макет' },
  { id: 'overlay', name: 'Наложения' }
]

const categoryNames: Record<string, string> = {
  inputs: 'Ввод',
  navigation: 'Навигация',
  feedback: 'Обратная связь',
  'data-display': 'Отображение данных',
  layout: 'Макет',
  overlay: 'Наложения'
}

export function ComponentsSection() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredComponents = components.filter((comp) => {
    const matchesSearch = comp.name.toLowerCase().includes(search.toLowerCase()) ||
      comp.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || comp.category === category
    return matchesSearch && matchesCategory
  })

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Puzzle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Компоненты</h1>
            <p className="text-muted-foreground">Справочник UI-компонентов с примерами</p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Search and Filter */}
      <AnimatedContainer delay={0.1}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск компонентов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </AnimatedContainer>

      {/* Components Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredComponents.map((component, index) => (
          <AnimatedCard key={component.id} index={index}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{component.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {categoryNames[component.category] || component.category}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{component.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Использование</h4>
                  <p className="text-sm text-muted-foreground">{component.usage}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Варианты</h4>
                  <div className="flex flex-wrap gap-1">
                    {component.variants.map((variant) => (
                      <Badge key={variant} variant="secondary">
                        {variant}
                      </Badge>
                    ))}
                  </div>
                </div>

                {component.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Пример</h4>
                    <div className="relative rounded-lg bg-muted p-4">
                      <pre className="text-sm overflow-x-auto">
                        <code>{component.examples[0].code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => handleCopy(component.examples[0].code, component.id)}
                      >
                        {copiedId === component.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Доступность</h4>
                  <p className="text-sm text-muted-foreground">{component.accessibility}</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Компоненты не найдены по вашему запросу.</p>
        </div>
      )}
    </div>
  )
}
