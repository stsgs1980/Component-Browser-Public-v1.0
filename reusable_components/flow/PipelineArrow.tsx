'use client'

interface PipelineArrowProps {
  color?: string
  animated?: boolean
  width?: number
  height?: number
}

export function PipelineArrow({ color = 'rgba(255,255,255,0.1)', animated = false, width = 20, height = 12 }: PipelineArrowProps) {
  return (
    <div className="flex items-center flex-shrink-0 mx-1">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1="0" y1={height / 2} x2={width - 6} y2={height / 2}
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={animated ? '4 3' : 'none'}
        >
          {animated && (
            <animate attributeName="stroke-dashoffset" from="0" to="-7" dur="0.5s" repeatCount="indefinite" />
          )}
        </line>
        <polygon points={`${width - 6},2 ${width},${height / 2} ${width - 6},${height - 2}`} fill={color} />
      </svg>
    </div>
  )
}
