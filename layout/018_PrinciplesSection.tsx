// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 79

'use client'

import { BookOpen, Palette, Accessibility, Zap, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'
import { principles } from '@/data'

const categoryIcons = {
  design: Palette,
  accessibility: Accessibility,
  performance: Zap,
  usability: Users
}

const categoryNames: Record<string, string> = {
  design: 'Дизайн',
  accessibility: 'Доступность',
  performance: 'Производительность',
  usability: 'Юзабилити'
}

export function PrinciplesSection() {
  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Принципы</h1>
            <p className="text-muted-foreground">Принципы дизайна и руководства для согласованного опыта</p>
          </div>
        </div>
      </AnimatedContainer>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {principles.map((principle, index) => {
          const Icon = categoryIcons[principle.category]
          return (
            <AnimatedCard key={principle.id} index={index}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{principle.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {categoryNames[principle.category] || principle.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="mt-4">
                    {principle.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-medium mb-3">Руководства</h4>
                  <ul className="space-y-2">
                    {principle.guidelines.map((guideline, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-muted-foreground">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedCard>
          )
        })}
      </div>
    </div>
  )
}
