// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 132

'use client'

import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Clock, GraduationCap, Target, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedContainer, AnimatedCard } from '@/components/common/AnimatedComponents'

const courses = [
  {
    title: 'Основы дизайн-систем',
    description: 'Изучите базовые концепции дизайн-систем и их роль в разработке продуктов.',
    duration: '2 часа',
    level: 'Начинающий',
    lessons: 12
  },
  {
    title: 'Архитектура компонентов',
    description: 'Поймите, как структурировать и организовывать UI-компоненты для масштабируемости.',
    duration: '3 часа',
    level: 'Средний',
    lessons: 18
  },
  {
    title: 'Доступность в дизайне',
    description: 'Освойте стандарты WCAG и создавайте инклюзивные пользовательские интерфейсы.',
    duration: '2.5 часа',
    level: 'Средний',
    lessons: 15
  },
  {
    title: 'Дизайн-токены',
    description: 'Научитесь реализовывать и управлять дизайн-токенами на разных платформах.',
    duration: '1.5 часа',
    level: 'Продвинутый',
    lessons: 10
  }
]

export function AcademySection() {
  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Академия</h1>
            <p className="text-muted-foreground">Изучите дизайн-системы с основ</p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Learning Paths */}
      <AnimatedContainer delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Учебные курсы
            </CardTitle>
            <CardDescription>
              Структурированные курсы для изучения дизайн-систем
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-semibold mb-2">Начинающий</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Начните с основ и базовых концепций
                </p>
                <Badge variant="secondary">5 курсов</Badge>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-semibold mb-2">Средний</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Углубитесь в компоненты и паттерны
                </p>
                <Badge variant="secondary">8 курсов</Badge>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-semibold mb-2">Продвинутый</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Освойте токены, темы и масштабирование
                </p>
                <Badge variant="secondary">6 курсов</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Courses List */}
      <div className="grid grid-cols-1 gap-4">
        {courses.map((course, index) => (
          <AnimatedCard key={course.title} index={index}>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{course.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </Badge>
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="outline">{course.lessons} уроков</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
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
