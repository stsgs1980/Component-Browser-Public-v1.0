'use client'

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

// ============== TECH MARKER ==============
/**
 * Маленький бейдж с номером секции и тултипом.
 * Внутренний компонент для SectionTitle.
 */
function TechMarker({ number, size }: { number: string; size?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 font-mono text-[9px] text-neutral-400 cursor-help">
          <div className="w-2 h-2 border border-neutral-400 rounded-full flex items-center justify-center">
            <div className="w-0.5 h-0.5 bg-neutral-400 rounded-full"></div>
          </div>
          <span className="tracking-wider">{number}</span>
          {size && <span className="text-neutral-300 ml-0.5">[{size}]</span>}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-neutral-800 text-white text-[10px] px-2 py-1 font-mono">
        Секция {number}
      </TooltipContent>
    </Tooltip>
  )
}

// ============== DASHED DIVIDER ==============
/**
 * Пунктирный горизонтальный разделитель с опциональной меткой по центру.
 * Для визуального разделения секций в документации / справочниках.
 *
 * @example
 * <DashedDivider />                 // простая линия
 * <DashedDivider label="Advanced" /> // линия с меткой
 */
export function DashedDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex-1 border-t border-dashed border-neutral-300"></div>
      {label && <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-widest">{label}</span>}
      {label && <div className="flex-1 border-t border-dashed border-neutral-300"></div>}
      {!label && <div className="flex-1 border-t border-dashed border-neutral-300"></div>}
    </div>
  )
}

// ============== SECTION TITLE ==============
/**
 * Нумерованный заголовок раздела с декоративным оформлением.
 * Используется в справочниках и документации для визуального разделения секций.
 *
 * @example
 * <SectionTitle number="01">Display</SectionTitle>
 * <SectionTitle>Без номера</SectionTitle>
 *
 * Props:
 *   children — текст заголовка (React-нода)
 *   number   — опциональный номер секции (отображается в квадрате + тултип)
 */
export function SectionTitle({ children, number }: { children: React.ReactNode; number?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {number && (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 border-2 border-neutral-800 flex items-center justify-center bg-white">
            <span className="text-[9px] text-neutral-800 font-mono font-bold">{number}</span>
          </div>
          <div className="w-10 border-t border-dashed border-neutral-400"></div>
        </div>
      )}
      <div className="text-sm font-bold text-neutral-900 tracking-tight font-mono uppercase">
        {children}
      </div>
      <div className="flex-1 border-t border-dashed border-neutral-300"></div>
      {number && (
        <TechMarker number={`\u00a7${number}`} />
      )}
    </div>
  )
}
