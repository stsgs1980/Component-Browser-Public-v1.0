'use client'
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MiniSparkline } from './MiniSparkline'

interface Performer {
  name: string
  group: string
  score: number
}

interface StatusItem {
  label: string
  count: number
  color: string
}

interface PerformanceMetric {
  label: string
  value: string
  color: string
  icon: LucideIcon
  sparkData?: number[]
  trendUp?: boolean
}

interface PerformanceDashboardProps {
  performers: Performer[]
  statusDistribution: StatusItem[]
  metrics: PerformanceMetric[]
  groupColorMap?: Record<string, string>
  title?: string
}

export function PerformanceDashboard({ performers, statusDistribution, metrics, groupColorMap = {}, title = 'Performance Dashboard' }: PerformanceDashboardProps) {
  const [barWidths, setBarWidths] = useState<number[]>(performers.map(() => 0))

  useEffect(() => {
    const timers = performers.map((_, i) =>
      setTimeout(() => {
        setBarWidths(prev => {
          const next = [...prev]
          next[i] = performers[i].score
          return next
        })
      }, 100 + i * 80)
    )
    return () => timers.forEach(clearTimeout)
  }, [performers])

  const getGroupColor = (groupName: string): string => groupColorMap[groupName] || '#94a3b8'

  const donutRadius = 50
  const donutStroke = 10
  const donutCircumference = 2 * Math.PI * donutRadius
  const totalAgents = statusDistribution.reduce((sum, s) => sum + s.count, 0)

  const donutSegments = statusDistribution.filter(s => s.count > 0).reduce<Array<{
    label: string; count: number; color: string; segmentLength: number; offset: number
  }>>((acc, status) => {
    const segmentLength = (status.count / totalAgents) * donutCircumference
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].segmentLength : 0
    acc.push({ ...status, segmentLength, offset })
    return acc
  }, [])

  return (
    <div className="rounded-xl p-4 sm:p-6" style={{ background: 'rgba(45, 45, 45, 0.3)', border: '1px solid rgba(51, 51, 51, 0.5)' }}>
      <h3 className="text-white font-semibold text-xs mb-5 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: '#06B6D4' }} />
        <BarChart3 className="w-3.5 h-3.5" style={{ color: '#06B6D4' }} />
        {title}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <p className="text-[10px] text-[#B0B0B0] mb-3 font-medium uppercase tracking-wider">Top Performers</p>
          <div className="space-y-2.5">
            {performers.map((agent, i) => {
              const barColor = getGroupColor(agent.group)
              return (
                <div key={agent.name} className="flex items-center gap-3 group">
                  <span className="text-[10px] font-medium w-24 sm:w-28 truncate text-right flex-shrink-0" style={{ color: barColor }}>{agent.name}</span>
                  <div className="flex-1 h-5 rounded-sm relative overflow-hidden transition-all duration-200 group-hover:h-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="h-full rounded-sm transition-all duration-700 ease-out" style={{ width: `${barWidths[i]}%`, background: `linear-gradient(90deg, ${barColor}44, ${barColor}aa)`, boxShadow: `0 0 8px ${barColor}22` }} />
                  </div>
                  <span className="text-[10px] font-bold w-8 text-right flex-shrink-0" style={{ color: barColor }}>{barWidths[i] > 0 ? agent.score : ''}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-[10px] text-[#B0B0B0] mb-3 font-medium uppercase tracking-wider">Status Distribution</p>
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={donutRadius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={donutStroke} />
              {donutSegments.map((segment, i) => (
                <circle key={i} cx="70" cy="70" r={donutRadius} fill="none" stroke={segment.color} strokeWidth={donutStroke} strokeDasharray={`${segment.segmentLength} ${donutCircumference - segment.segmentLength}`} strokeDashoffset={-segment.offset} strokeLinecap="butt" transform="rotate(-90 70 70)" style={{ opacity: 0.8 }} />
              ))}
              <text x="70" y="65" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="18" fontWeight="700">{totalAgents}</text>
              <text x="70" y="80" textAnchor="middle" dominantBaseline="middle" fill="#B0B0B0" fontSize="7">total</text>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 w-full">
            {statusDistribution.map((status) => (
              <div key={status.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: status.color, opacity: status.count > 0 ? 1 : 0.3 }} />
                <span className="text-[9px] text-[#B0B0B0] truncate">{status.label}</span>
                <span className="text-[9px] font-bold" style={{ color: status.count > 0 ? status.color : '#555' }}>{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[10px] text-[#B0B0B0] mb-3 font-medium uppercase tracking-wider">Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map((metric) => {
            const MetricIcon = metric.icon
            return (
              <div key={metric.label} className="rounded-lg p-3 relative overflow-hidden transition-all duration-200 hover:scale-[1.02]" style={{ background: 'rgba(13, 13, 13, 0.8)', border: '1px solid rgba(51, 51, 51, 0.4)' }}>
                <div className="absolute left-0 top-0 bottom-0 rounded-l-lg" style={{ width: 2, background: metric.color, opacity: 0.6 }} />
                <div className="flex items-center gap-2 ml-2 mb-1.5">
                  <MetricIcon size={11} style={{ color: metric.color }} />
                  <span className="text-[9px] text-[#B0B0B0] leading-tight">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-bold" style={{ color: metric.color }}>{metric.value}</span>
                  {metric.sparkData && <MiniSparkline data={metric.sparkData} color={metric.color} />}
                  {metric.trendUp && <TrendingUp size={12} style={{ color: metric.color }} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
