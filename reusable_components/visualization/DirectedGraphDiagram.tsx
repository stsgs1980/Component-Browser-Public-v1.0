'use client'
import { Workflow } from 'lucide-react'

interface GraphNode {
  id: string
  x: number
  y: number
  color: string
  isRoot?: boolean
}

interface GraphEdge {
  from: string
  to: string
}

interface DirectedGraphDiagramProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  width?: number
  height?: number
  nodeRadius?: number
  title?: string
}

export function DirectedGraphDiagram({ nodes, edges, width = 440, height = 370, nodeRadius = 14, title = 'Graph Diagram' }: DirectedGraphDiagramProps) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  return (
    <div
      className="rounded-xl p-4 sm:p-6 overflow-x-auto"
      style={{
        background: 'rgba(45, 45, 45, 0.3)',
        border: '1px solid rgba(51, 51, 51, 0.5)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      <h3 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
        <Workflow className="w-3.5 h-3.5 text-cyan-400" />
        {title}
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl mx-auto" style={{ minHeight: '280px' }}>
        {edges.map((edge, i) => {
          const from = nodeMap[edge.from]
          const to = nodeMap[edge.to]
          if (!from || !to) return null
          const dx = to.x - from.x
          const dy = to.y - from.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const startX = from.x + (dx / dist) * nodeRadius
          const startY = from.y + (dy / dist) * nodeRadius
          const endX = to.x - (dx / dist) * nodeRadius
          const endY = to.y - (dy / dist) * nodeRadius

          const arrowLen = 5
          const angle = Math.atan2(dy, dx)
          const ax1 = endX - arrowLen * Math.cos(angle - Math.PI / 6)
          const ay1 = endY - arrowLen * Math.sin(angle - Math.PI / 6)
          const ax2 = endX - arrowLen * Math.cos(angle + Math.PI / 6)
          const ay2 = endY - arrowLen * Math.sin(angle + Math.PI / 6)

          return (
            <g key={i}>
              <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1.5" />
              <polygon points={`${endX},${endY} ${ax1},${ay1} ${ax2},${ay2}`} fill="rgba(6, 182, 212, 0.3)" />
            </g>
          )
        })}

        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={nodeRadius + 3} fill={`${node.color}10`} stroke={node.color} strokeWidth="0.3" strokeOpacity="0.2" />
            {node.isRoot && (
              <circle cx={node.x} cy={node.y} r={nodeRadius + 6} fill="none" stroke={node.color} strokeWidth="0.5" strokeOpacity="0.15">
                <animate attributeName="r" from={`${nodeRadius + 6}`} to={`${nodeRadius + 14}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="strokeOpacity" from="0.15" to="0" dur="2s" repeatCount="indefinite" />
                <animate attributeName="strokeWidth" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={node.x} cy={node.y} r={nodeRadius} fill={`${node.color}18`} stroke={node.color} strokeWidth="0.8" strokeOpacity="0.5" />
            <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill={node.color} fontSize="6" fontWeight="700" style={{ pointerEvents: 'none' }}>
              {node.id.length > 6 ? node.id.substring(0, 6) : node.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
