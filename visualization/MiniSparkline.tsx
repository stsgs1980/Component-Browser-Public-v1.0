'use client'
import { useState, useEffect } from 'react'

interface MiniSparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
  showArea?: boolean
}

export function MiniSparkline({ data, color, width = 48, height = 16, showArea = true }: MiniSparklineProps) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padY = 2
  const plotH = height - padY * 2

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = padY + plotH - ((v - min) / range) * plotH
    return `${x},${y}`
  }).join(' ')

  const areaPath = `M0,${height} ` +
    data.map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = padY + plotH - ((v - min) / range) * plotH
      return `L${x},${y}`
    }).join(' ') +
    ` L${width},${height} Z`

  const gradId = `spark-grad-${color.replace('#', '')}`

  return (
    <svg width={width} height={height} className="flex-shrink-0" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {showArea && (
        <path
          d={areaPath}
          fill={`url(#${gradId})`}
          style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.5s ease' }}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity={animated ? 0.7 : 0}
        style={{ transition: 'opacity 0.5s ease' }}
        strokeLinejoin="round"
      />
    </svg>
  )
}
