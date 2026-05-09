// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 155

'use client'

import { ExternalLink, Github, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'
import { designSystems } from '@/data/design-systems'
import { Layers } from 'lucide-react'

const categoryNames: Record<string, string> = {
  enterprise: 'Корпоративная',
  framework: 'Фреймворк',
  library: 'Библиотека'
}

// SVG логотипы брендов
const brandLogos: Record<string, React.ReactNode> = {
  'material-design': (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M1 3h6v6H1V3zm0 6h6v6H1V9zm0 6h6v6H1v-6zM8 3h6v6H8V3zm0 6h6v6H8V9zm0 6h6v6H8v-6zM15 3h6v6h-6V3zm0 6h6v6h-6V9z"/>
    </svg>
  ),
  'fluent-ui': (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  'carbon': (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 1L3 5v6l9 4 9-4V5l-9-4zM3 13v6l9 4 9-4v-6l-9 4-9-4z"/>
    </svg>
  ),
  'ant-design': (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z"/>
    </svg>
  ),
  'chakra-ui': (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  ),
  'mantine': (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12l3-3v6l-3-3zm8 0l-3-3v6l3-3z" fill="white"/>
    </svg>
  ),
  'radix': (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" fill="white"/>
    </svg>
  ),
  'shadcn-ui': (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"/>
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="white"/>
    </svg>
  )
}

export function SystemsSection() {
  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Дизайн-системы</h1>
            <p className="text-muted-foreground">Обзор популярных дизайн-систем от ведущих компаний</p>
          </div>
        </div>
      </AnimatedContainer>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {designSystems.map((system, index) => (
          <AnimatedCard key={system.id} index={index}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: system.color }}
                    >
                      {brandLogos[system.id] || (
                        <span className="font-bold text-lg">{system.logo}</span>
                      )}
                    </div>
                    <div>
                      <CardTitle>{system.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {categoryNames[system.category] || system.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{system.popularity}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {system.description}
                </CardDescription>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Популярность</span>
                      <span>{system.popularity}%</span>
                    </div>
                    <Progress value={system.popularity} className="h-2" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {system.features.slice(0, 4).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" asChild>
                      <a href={system.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Сайт
                      </a>
                    </Button>
                    {system.github && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={system.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-1" />
                          GitHub
                        </a>
                      </Button>
                    )}
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
