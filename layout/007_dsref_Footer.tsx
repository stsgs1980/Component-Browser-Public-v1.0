// Project: DS Reference
// Category: layout
// Source: design-systems\DS Reference\src\components\layout
// Lines: 75

import { Github, Twitter, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8 lg:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">DS</span>
              </div>
              <span className="font-semibold">Справочник дизайн-систем</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Комплексное руководство по дизайн-системам, компонентам и лучшим практикам для современной веб-разработки.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Ресурсы</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Документация</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Компоненты</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Паттерны</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Принципы</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Дизайн-системы</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Material Design</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Fluent UI</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Ant Design</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Chakra UI</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Связаться</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon">
                <BookOpen className="h-5 w-5" />
                <span className="sr-only">Документация</span>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            Создано с Next.js, Tailwind CSS и shadcn/ui
          </p>
          <p className="text-sm text-muted-foreground">
            Справочник дизайн-систем - Все права защищены
          </p>
        </div>
      </div>
    </footer>
  )
}
