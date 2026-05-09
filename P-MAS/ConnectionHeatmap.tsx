'use client'
import { Grid3X3 } from 'lucide-react'

interface ConnectionHeatmapProps {
  data: number[][]
  rowLabels: string[]
  colLabels: string[]
  colColors: string[]
  title?: string
}

export function ConnectionHeatmap({ data, rowLabels, colLabels, colColors, title = 'Connection Heatmap' }: ConnectionHeatmapProps) {
  const getDotSize = (count: number): number => {
    if (count === 0) return 0
    if (count <= 2) return 6
    if (count <= 5) return 10
    return 14
  }

  const getDotOpacity = (count: number): number => {
    if (count === 0) return 0
    if (count <= 2) return 0.5
    if (count <= 5) return 0.7
    return 0.9
  }

  return (
    <div
      className="rounded-xl p-4 sm:p-6 overflow-x-auto"
      style={{
        background: 'rgba(45, 45, 45, 0.3)',
        border: '1px solid rgba(51, 51, 51, 0.5)',
      }}
    >
      <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
        <Grid3X3 className="w-3.5 h-3.5" style={{ color: '#06B6D4' }} />
        {title}
      </h3>
      <div className="min-w-[520px]">
        <div className="grid gap-0" style={{ gridTemplateColumns: `64px repeat(${colLabels.length}, 1fr)` }}>
          <div />
          {colLabels.map((label, i) => (
            <div key={label} className="text-center py-2">
              <span className="text-[8px] font-bold" style={{ color: colColors[i] }}>{label}</span>
            </div>
          ))}
        </div>
        {data.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-0 border-b border-white/[0.03]"
            style={{ gridTemplateColumns: `64px repeat(${colLabels.length}, 1fr)` }}
          >
            <div className="flex items-center pr-2 py-2">
              <span className="text-[8px] font-bold truncate" style={{ color: colColors[rowIdx] }}>
                {rowLabels[rowIdx]}
              </span>
            </div>
            {row.map((count, colIdx) => {
              const isDiagonal = rowIdx === colIdx
              const dotSize = getDotSize(count)
              const dotOpacity = getDotOpacity(count)
              const cellColor = colColors[colIdx]

              return (
                <div key={colIdx} className="flex items-center justify-center py-2">
                  {count > 0 && (
                    <div className="relative flex items-center justify-center">
                      {isDiagonal ? (
                        <svg width={dotSize + 4} height={dotSize + 4} viewBox={`0 0 ${dotSize + 4} ${dotSize + 4}`}>
                          <rect
                            x={(dotSize + 4) / 2 - dotSize / 2}
                            y={(dotSize + 4) / 2 - dotSize / 2}
                            width={dotSize}
                            height={dotSize}
                            rx={1}
                            fill={cellColor}
                            fillOpacity={dotOpacity}
                            stroke={cellColor}
                            strokeWidth={0.5}
                            strokeOpacity={0.6}
                            transform={`rotate(45 ${(dotSize + 4) / 2} ${(dotSize + 4) / 2})`}
                          />
                        </svg>
                      ) : (
                        <span
                          className="rounded-full"
                          style={{
                            width: dotSize,
                            height: dotSize,
                            background: cellColor,
                            opacity: dotOpacity,
                            boxShadow: `0 0 ${dotSize}px ${cellColor}44`,
                          }}
                        />
                      )}
                      {count > 2 && (
                        <span className="absolute text-[6px] font-bold" style={{ color: '#FFFFFF' }}>
                          {count}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
