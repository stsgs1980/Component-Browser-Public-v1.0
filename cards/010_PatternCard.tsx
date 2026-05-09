'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

// ============== SIMPLE TOOLTIP ==============
/**
 * Простая обёртка над shadcn Tooltip с тёмным стилем.
 * Используется внутри PatternCard и SectionTitle.
 */
function SimpleTooltip({ children, content, side = 'top' }: { children: React.ReactNode; content: string; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="bg-neutral-800 text-white text-[10px] px-2 py-1 font-mono">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

// ============== PATTERN CARD ==============
/**
 * Карточка с двумя табами: Preview (визуальный пример) и Code (CSS/JS код).
 * Универсальный компонент для справочников, документации, шпаргалок.
 *
 * @example
 * <PatternCard
 *   title="grid-template-columns"
 *   badge="Единицы"
 *   description="Определяет колонки сетки"
 *   preview={<div style={{display:'grid', gridTemplateColumns:'1fr 2fr'}}>...</div>}
 *   code=".grid { display: grid; grid-template-columns: 1fr 2fr; }"
 * />
 *
 * Props:
 *   title     — название примера (отображается в заголовке карточки)
 *   badge     — опциональная метка категории (отображается рядом с названием)
 *   description — опциональное описание (НЕ используется в текущей версии, зарезервирован)
 *   preview   — React-нода с визуальным превью
 *   code      — строка с кодом (CSS, HTML, JS)
 */
export function PatternCard({
  title,
  badge,
  description,
  preview,
  code
}: {
  title: string
  badge?: string
  description?: string
  preview: React.ReactNode
  code: string
}) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      <Tabs defaultValue="preview">
        <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 bg-neutral-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-800 font-semibold">{title}</span>
            {badge && (
              <SimpleTooltip content={`Категория: ${badge}`}>
                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded font-mono uppercase font-medium cursor-help">{badge}</span>
              </SimpleTooltip>
            )}
          </div>
          <TabsList className="h-auto p-0 bg-transparent gap-0.5">
            <SimpleTooltip content="Показать визуальный пример">
              <TabsTrigger 
                value="preview" 
                className="text-[10px] px-2.5 py-1 h-auto data-[state=active]:bg-neutral-800 data-[state=active]:text-white border border-neutral-300 rounded text-neutral-600 font-medium"
              >
                Preview
              </TabsTrigger>
            </SimpleTooltip>
            <SimpleTooltip content="Показать CSS код">
              <TabsTrigger 
                value="code" 
                className="text-[10px] px-2.5 py-1 h-auto data-[state=active]:bg-neutral-800 data-[state=active]:text-white border border-neutral-300 rounded text-neutral-600 font-medium"
              >
                Code
              </TabsTrigger>
            </SimpleTooltip>
          </TabsList>
        </div>
        <TabsContent value="preview" className="p-5 m-0 bg-white min-h-[80px] flex items-center justify-center">
          {preview}
        </TabsContent>
        <TabsContent value="code" className="p-0 m-0">
          <pre className="text-xs text-neutral-800 font-mono bg-neutral-50 p-4 overflow-x-auto leading-relaxed border-t border-neutral-200">
            <code>{code}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============== PATTERN CARD TALL ==============
/**
 * Высокая версия PatternCard (min-height 110px вместо 80px).
 * Для превью, которым нужно больше вертикального пространства.
 *
 * Props — те же, что у PatternCard, кроме description (удалён).
 */
export function PatternCardTall({
  title,
  badge,
  preview,
  code
}: {
  title: string
  badge?: string
  preview: React.ReactNode
  code: string
}) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      <Tabs defaultValue="preview">
        <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 bg-neutral-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-800 font-semibold">{title}</span>
            {badge && <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded font-mono uppercase font-medium">{badge}</span>}
          </div>
          <TabsList className="h-auto p-0 bg-transparent gap-0.5">
            <TabsTrigger 
              value="preview" 
              className="text-[10px] px-2.5 py-1 h-auto data-[state=active]:bg-neutral-800 data-[state=active]:text-white border border-neutral-300 rounded text-neutral-600 font-medium"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className="text-[10px] px-2.5 py-1 h-auto data-[state=active]:bg-neutral-800 data-[state=active]:text-white border border-neutral-300 rounded text-neutral-600 font-medium"
            >
              Code
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" className="p-5 m-0 bg-white min-h-[110px] flex items-center justify-center">
          {preview}
        </TabsContent>
        <TabsContent value="code" className="p-0 m-0">
          <pre className="text-xs text-neutral-800 font-mono bg-neutral-50 p-4 overflow-x-auto leading-relaxed border-t border-neutral-200">
            <code>{code}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  )
}
