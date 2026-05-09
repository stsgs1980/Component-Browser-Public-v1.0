// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 114

'use client'

import { FolderOpen, ExternalLink, BookOpen, GraduationCap, Wrench, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'
import { resources } from '@/data'

const categoryIcons = {
  documentation: BookOpen,
  tutorial: GraduationCap,
  tool: Wrench,
  inspiration: Lightbulb
}

const categoryColors = {
  documentation: 'bg-blue-500/10 text-blue-600',
  tutorial: 'bg-green-500/10 text-green-600',
  tool: 'bg-purple-500/10 text-purple-600',
  inspiration: 'bg-yellow-500/10 text-yellow-600'
}

const categoryNames: Record<string, string> = {
  documentation: 'Документация',
  tutorial: 'Учебники',
  tool: 'Инструменты',
  inspiration: 'Вдохновение'
}

export function ResourcesSection() {
  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ресурсы</h1>
            <p className="text-muted-foreground">Внешние ресурсы и инструменты для дизайн-систем</p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Category Overview */}
      <AnimatedContainer delay={0.1}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Object.entries(categoryIcons).map(([key, Icon]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${categoryColors[key as keyof typeof categoryColors]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{categoryNames[key] || key}</p>
                    <p className="text-sm text-muted-foreground">
                      {resources.filter(r => r.category === key).length} элементов
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedContainer>

      {/* Resources List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {resources.map((resource, index) => {
          const Icon = categoryIcons[resource.category]
          return (
            <AnimatedCard key={resource.id} index={index}>
              <Card className="h-full cursor-pointer hover:border-primary/50 transition-colors group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${categoryColors[resource.category]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {resource.description}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline">
                            {categoryNames[resource.category] || resource.category}
                          </Badge>
                          {resource.free && (
                            <Badge variant="secondary">Бесплатно</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )
        })}
      </div>
    </div>
  )
}
