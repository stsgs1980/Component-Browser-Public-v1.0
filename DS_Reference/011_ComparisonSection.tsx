// Project: DS Reference
// Category: sections
// Source: design-systems\DS Reference\src\components\sections
// Lines: 124

'use client'

import { Columns, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AnimatedContainer } from '@/components/common/AnimatedComponents'
import { designSystems } from '@/data/design-systems'

const comparisonFeatures = [
  { name: 'Компоненты', key: 'components' },
  { name: 'Темы', key: 'theming' },
  { name: 'Тёмная тема', key: 'darkMode' },
  { name: 'Доступность', key: 'accessibility' },
  { name: 'TypeScript', key: 'typescript' },
  { name: 'Документация', key: 'docs' },
  { name: 'Активная разработка', key: 'maintained' }
]

const features: Record<string, Record<string, boolean>> = {
  'material-design': { components: true, theming: true, darkMode: true, accessibility: true, typescript: true, docs: true, maintained: true },
  'fluent-ui': { components: true, theming: true, darkMode: true, accessibility: true, typescript: true, docs: true, maintained: true },
  'carbon': { components: true, theming: true, darkMode: true, accessibility: true, typescript: true, docs: true, maintained: true },
  'ant-design': { components: true, theming: true, darkMode: true, accessibility: true, typescript: true, docs: true, maintained: true },
  'chakra-ui': { components: true, theming: true, darkMode: true, accessibility: true, typescript: true, docs: true, maintained: true },
  'mantine': { components: true, theming: true, darkMode: true, accessibility: true, typescript: true, docs: true, maintained: true },
  'radix': { components: true, theming: false, darkMode: false, accessibility: true, typescript: true, docs: true, maintained: true },
  'shadcn-ui': { components: true, theming: true, darkMode: true, accessibility: true, typescript: true, docs: true, maintained: true }
}

export function ComparisonSection() {
  return (
    <div className="space-y-8">
      <AnimatedContainer>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Columns className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Сравнение</h1>
            <p className="text-muted-foreground">Сравнение дизайн-систем друг с другом</p>
          </div>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Сравнение функций</CardTitle>
            <CardDescription>
              Сравнение ключевых функций популярных дизайн-систем
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Функция</TableHead>
                    {designSystems.slice(0, 6).map((system) => (
                      <TableHead key={system.id} className="text-center min-w-24">
                        {system.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonFeatures.map((feature) => (
                    <TableRow key={feature.key}>
                      <TableCell className="font-medium">{feature.name}</TableCell>
                      {designSystems.slice(0, 6).map((system) => (
                        <TableCell key={system.id} className="text-center">
                          {features[system.id]?.[feature.key] ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      <AnimatedContainer delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Рейтинг популярности</CardTitle>
            <CardDescription>
              Относительная популярность на основе звёзд GitHub и загрузок npm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {designSystems
                .sort((a, b) => b.popularity - a.popularity)
                .map((system, index) => (
                  <div key={system.id} className="flex items-center gap-4">
                    <span className="w-6 text-sm text-muted-foreground">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{system.name}</span>
                        <span className="text-sm text-muted-foreground">{system.popularity}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${system.popularity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  )
}
