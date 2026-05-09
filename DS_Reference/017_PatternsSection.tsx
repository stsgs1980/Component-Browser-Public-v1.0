// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 82

'use client'

import { Grid3X3, Check, Lightbulb, Code } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'
import { patterns } from '@/data'

const categoryNames: Record<string, string> = {
  layout: 'Макет',
  forms: 'Формы',
  feedback: 'Обратная связь',
  data: 'Данные',
  navigation: 'Навигация',
  accessibility: 'Доступность'
}

export function PatternsSection() {
  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Grid3X3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Паттерны</h1>
            <p className="text-muted-foreground">Типовые решения дизайна</p>
          </div>
        </div>
      </AnimatedContainer>

      <div className="grid grid-cols-1 gap-6">
        {patterns.map((pattern, index) => (
          <AnimatedCard key={pattern.id} index={index}>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{pattern.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {categoryNames[pattern.category] || pattern.category}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{pattern.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <h4 className="font-medium">Проблема</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.problem}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <h4 className="font-medium">Решение</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.solution}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Применение</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{pattern.usage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>
    </div>
  )
}
