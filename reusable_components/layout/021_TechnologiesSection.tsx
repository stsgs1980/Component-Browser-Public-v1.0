// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 99

'use client'

import { Code2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'
import { technologies } from '@/data'

const levelColors = {
  beginner: 'bg-green-500/10 text-green-600',
  intermediate: 'bg-yellow-500/10 text-yellow-600',
  advanced: 'bg-red-500/10 text-red-600'
}

const levelNames: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый'
}

const categoryNames: Record<string, string> = {
  framework: 'Фреймворк',
  language: 'Язык',
  tooling: 'Инструмент',
  testing: 'Тестирование',
  deployment: 'Деплой'
}

export function TechnologiesSection() {
  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Технологии</h1>
            <p className="text-muted-foreground">Руководства по стеку технологий для современной веб-разработки</p>
          </div>
        </div>
      </AnimatedContainer>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {technologies.map((tech, index) => (
          <AnimatedCard key={tech.id} index={index}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{tech.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{categoryNames[tech.category] || tech.category}</Badge>
                      <Badge className={levelColors[tech.level]}>
                        {levelNames[tech.level] || tech.level}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={tech.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <CardDescription className="mt-4">
                  {tech.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Требования</h4>
                  <div className="flex flex-wrap gap-1">
                    {tech.prerequisites.map((prereq) => (
                      <Badge key={prereq} variant="secondary">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Темы</h4>
                  <div className="flex flex-wrap gap-1">
                    {tech.topics.map((topic) => (
                      <Badge key={topic} variant="outline">
                        {topic}
                      </Badge>
                    ))}
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
