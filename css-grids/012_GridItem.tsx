'use client'

/**
 * Ячейка-заглушка для CSS Grid демо.
 * Отображается как закрашенный прямоугольник с текстом.
 *
 * @example
 * <div style={{display:'grid', gridTemplateColumns:'1fr 2fr'}}>
 *   <GridItem>1fr</GridItem>
 *   <GridItem>2fr</GridItem>
 * </div>
 *
 * <GridItem dark>Тёмная ячейка</GridItem>
 * <GridItem className="col-span-2">На две колонки</GridItem>
 *
 * Props:
 *   children  — содержимое ячейки (текст или React-нода)
 *   className — дополнительные CSS-классы (для span, placement и т.д.)
 *   dark      — тёмная тема ячейки (вместо светлой)
 */
export function GridItem({ 
  children, 
  className = "",
  dark = false 
}: { 
  children: React.ReactNode
  className?: string 
  dark?: boolean 
}) {
  return (
    <div className={`${dark ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700 border border-neutral-300'} 
                    text-xs font-mono flex items-center justify-center p-2 rounded ${className}`}>
      {children}
    </div>
  )
}
