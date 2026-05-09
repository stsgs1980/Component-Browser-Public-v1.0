'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface Tab {
  value: string
  label: string
}

interface UnderlineTabsProps {
  tabs: Tab[]
  activeValue: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  /** Additional class for the TabsList */
  className?: string
}

/**
 * UnderlineTabs — табы с подчёркиванием (bottom-border indicator).
 *
 * Извлечён из Industrial-Style-Guide. Альтернатива стандартным shadcn Tabs
 * с заливкой фона. Использует `border-b-2` + `data-[state=active]:border-*`
 * вместо `data-[state=active]:bg-*`.
 *
 * Стиль: `rounded-none`, прозрачный фон, uppercase, tracking-wider.
 *
 * Пример:
 * ```tsx
 * <UnderlineTabs
 *   tabs={[
 *     { value: 'all', label: 'All' },
 *     { value: 'active', label: 'Active' },
 *   ]}
 *   activeValue={tab}
 *   onValueChange={setTab}
 * >
 *   <TabsContent value="all">...</TabsContent>
 *   <TabsContent value="active">...</TabsContent>
 * </UnderlineTabs>
 * ```
 */
export function UnderlineTabs({
  tabs,
  activeValue,
  onValueChange,
  children,
  className,
}: UnderlineTabsProps) {
  return (
    <Tabs value={activeValue} onValueChange={onValueChange} className="w-full">
      <TabsList
        className={`w-full justify-start border-b border-zinc-200 dark:border-zinc-800 bg-transparent h-auto p-0 mb-8 flex-wrap ${className ?? ''}`}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 data-[state=active]:bg-transparent bg-transparent px-4 py-3 text-xs tracking-wider uppercase"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
}
