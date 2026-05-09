'use client'

interface FeedbackLoopArrowProps {
  fromIndex: number
  toIndex: number
  stepWidth: number
  isActive?: boolean
  color?: string
  label?: string
  gap?: number
  curveHeight?: number
}

export function FeedbackLoopArrow({ fromIndex, toIndex, stepWidth, isActive, color = '#EAB308', label = 'feedback', gap = 20, curveHeight = 50 }: FeedbackLoopArrowProps) {
  const fromX = fromIndex * (stepWidth + gap) + stepWidth / 2
  const toX = toIndex * (stepWidth + gap) + stepWidth / 2
  const midX = (fromX + toX) / 2

  const pathD = `M ${fromX} -5 C ${fromX} ${-curveHeight}, ${toX} ${-curveHeight}, ${toX} -5`

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: `${fromX + stepWidth / 2 + 10}px`,
        height: `${curveHeight + 20}px`,
        transform: `translateY(-${curveHeight + 10}px)`,
        overflow: 'visible',
      }}
    >
      <defs>
        <marker id={`feedback-arrow-${fromIndex}-${toIndex}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0,0 6,3 0,6" fill={color} />
        </marker>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="6 3"
        markerEnd={`url(#feedback-arrow-${fromIndex}-${toIndex})`}
        style={{
          animation: isActive ? 'feedbackPulse 1s ease-in-out infinite' : 'none',
          opacity: isActive ? 1 : 0.7,
        }}
      />
      <text
        x={midX}
        y={-curveHeight + 5}
        textAnchor="middle"
        fill={color}
        fontSize="8"
        fontWeight="600"
        style={{ opacity: 0.9 }}
      >
        {label}
      </text>
    </svg>
  )
}
