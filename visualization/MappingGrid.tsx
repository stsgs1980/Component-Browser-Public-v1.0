'use client'
import { Network } from 'lucide-react'

interface MappingEntry {
  rowLabel: string
  activeCols: number[]
  rowColor?: string
}

interface MappingGridProps {
  rowLabels: string[]
  colLabels: string[]
  colColors: string[]
  colFullNames?: string[]
  mappings: MappingEntry[]
  title?: string
}

export function MappingGrid({ colLabels, colColors, colFullNames, mappings, title = 'Mapping Grid' }: MappingGridProps) {
  return (
    <div
      className="rounded-xl p-4 sm:p-6 overflow-x-auto"
      style={{
        background: 'rgba(45, 45, 45, 0.3)',
        border: '1px solid rgba(51, 51, 51, 0.5)',
      }}
    >
      <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
        <Network className="w-3.5 h-3.5" style={{ color: '#999' }} />
        {title}
      </h3>
      <div className="min-w-[480px]">
        <div className="grid gap-0" style={{ gridTemplateColumns: `80px repeat(${colLabels.length}, 1fr)` }}>
          <div />
          {colLabels.map((abbr, i) => (
            <div key={abbr} className="text-center py-1.5">
              <span className="text-[8px] font-bold" style={{ color: colColors[i] }}>{abbr}</span>
            </div>
          ))}
        </div>
        {mappings.map((row) => (
          <div
            key={row.rowLabel}
            className="grid gap-0 border-b border-white/[0.03]"
            style={{ gridTemplateColumns: `80px repeat(${colLabels.length}, 1fr)` }}
          >
            <div className="flex items-center py-1.5 pr-2">
              <span className="text-[9px] font-bold truncate" style={{ color: row.rowColor || '#94a3b8' }}>{row.rowLabel}</span>
            </div>
            {Array.from({ length: colLabels.length }, (_, colIdx) => {
              const isMapped = row.activeCols.includes(colIdx)
              return (
                <div key={colIdx} className="flex items-center justify-center py-1.5">
                  {isMapped && (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: colColors[colIdx],
                        boxShadow: `0 0 6px ${colColors[colIdx]}44`,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {colFullNames && (
        <div className="mt-3 flex flex-wrap gap-2">
          {colLabels.map((abbr, i) => (
            <div key={abbr} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: colColors[i] }} />
              <span className="text-[8px] text-slate-500">{abbr} = {colFullNames[i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
