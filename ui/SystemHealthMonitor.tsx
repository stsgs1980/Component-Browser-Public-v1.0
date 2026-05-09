'use client'
import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface HealthMetric {
  label: string
  value: number
  color: string
  icon: LucideIcon
}

export interface LiveIndicator {
  icon: LucideIcon
  label: string
  value: string
  color: string
  sparkline?: number[]
}

interface SystemHealthMonitorProps {
  metrics: HealthMetric[]
  indicators?: LiveIndicator[]
  shimmerAnimationName?: string
}

export function SystemHealthMonitor({ metrics, indicators = [], shimmerAnimationName = 'shimmer' }: SystemHealthMonitorProps) {
  const [widths, setWidths] = useState<number[]>(metrics.map(() => 0))

  useEffect(() => {
    const timers = metrics.map((m, i) =>
      setTimeout(() => {
        setWidths(prev => {
          const next = [...prev]
          next[i] = m.value
          return next
        })
      }, 100 + i * 100)
    )
    return () => timers.forEach(clearTimeout)
  }, [metrics])

  return (
    <div
      className="rounded-xl p-4 sm:p-6 relative overflow-hidden"
      style={{
        background: 'rgba(45, 45, 45, 0.3)',
        border: '1px solid rgba(51, 51, 51, 0.5)',
      }}
    >
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(103,232,249,0.04), rgba(6,182,212,0.03), rgba(14,116,144,0.03))',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite',
        }}
      />

      <div className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {metrics.map((m, i) => {
            const MetricIcon = m.icon
            return (
              <div key={m.label} className="rounded-lg p-3 transition-colors duration-200 hover:bg-white/[0.02]" style={{ background: 'rgba(13, 13, 13, 0.8)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <MetricIcon size={12} style={{ color: m.color }} />
                    <span className="text-slate-400 text-[10px]">{m.label}</span>
                  </div>
                  <span className="font-bold text-xs" style={{ color: m.color }}>{m.value}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${widths[i]}%`, background: `linear-gradient(90deg, ${m.color}88, ${m.color})` }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                        backgroundSize: '200% 100%',
                        animation: `${shimmerAnimationName} 2s ease infinite`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {indicators.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {indicators.map((ind) => {
              const IndIcon = ind.icon
              return (
                <div key={ind.label} className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-white/[0.03]" style={{ background: 'rgba(13, 13, 13, 0.8)' }}>
                  {ind.label === 'Uptime' ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                    </span>
                  ) : (
                    <IndIcon className="w-3 h-3" style={{ color: ind.color }} />
                  )}
                  <span className="text-slate-400 text-[10px]">{ind.label}</span>
                  <span className="font-bold text-xs" style={{ color: ind.color }}>{ind.value}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
