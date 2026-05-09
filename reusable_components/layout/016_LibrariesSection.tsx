// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 135

'use client'

import { useState } from 'react'
import { Package, ExternalLink, Github, Star, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'
import { libraries } from '@/data/libraries'

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'component', name: 'Компоненты' },
  { id: 'styling', name: 'Стилизация' },
  { id: 'animation', name: 'Анимация' },
  { id: 'state', name: 'Состояние' },
  { id: 'form', name: 'Формы' },
  { id: 'data', name: 'Данные' }
]

const categoryNames: Record<string, string> = {
  component: 'Компоненты',
  styling: 'Стилизация',
  animation: 'Анимация',
  state: 'Состояние',
  form: 'Формы',
  data: 'Данные'
}

export function LibrariesSection() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filteredLibraries = libraries.filter((lib) => {
    const matchesSearch = lib.name.toLowerCase().includes(search.toLowerCase()) ||
      lib.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || lib.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Библиотеки</h1>
            <p className="text-muted-foreground">Сравнение UI-библиотек и ресурсы</p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Search and Filter */}
      <AnimatedContainer delay={0.1}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск библиотек..."
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

      {/* Libraries Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLibraries.map((lib, index) => (
          <AnimatedCard key={lib.id} index={index}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{lib.name}</CardTitle>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{(lib.stars / 1000).toFixed(0)}k</span>
                  </div>
                </div>
                <Badge variant="outline">{categoryNames[lib.category] || lib.category}</Badge>
                <CardDescription>{lib.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {lib.features.slice(0, 4).map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Размер: {lib.bundleSize}</span>
                  {lib.typescript && (
                    <Badge className="bg-blue-500/10 text-blue-600">TypeScript</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <a href={lib.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Сайт
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={lib.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-1" />
                      GitHub
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>
    </div>
  )
}
