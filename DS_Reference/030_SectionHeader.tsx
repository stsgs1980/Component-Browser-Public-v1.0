import { type LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

/**
 * SectionHeader — повторяемый паттерн заголовка секции:
 * иконка в кружке + заголовок + описание.
 *
 * Использовался в 12 секциях приложения (ComponentsSection, LibrariesSection и др.).
 * Ранее копипастился инлайн — теперь единый компонент с пропсами.
 */
export function SectionHeader({ icon: Icon, title, description, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-4 mb-8 ${className ?? ''}`}>
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
