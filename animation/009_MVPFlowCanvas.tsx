// Project: MVP Flow Studio Pro
// Category: components
// Source: flow-studio\MVP Flow Studio Pro\apps\studio-frontend\src\components
// Lines: 27

import React from 'react'

type Node = {
  id: string
  type: string
  position?: { x: number; y: number }
  label?: string
}

type Edge = { from: string; to: string }

export const FlowCanvas: React.FC<{ nodes: Node[]; edges: Edge[] }> = ({ nodes, edges }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '60vh', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      {nodes.map((n) => (
        <div key={n.id} style={{ position: 'absolute', left: (n.position?.x ?? 0), top: (n.position?.y ?? 0), padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}>
          <span style={{ fontSize: 12, color: '#374151' }}>{n.type}</span>
          {n.label && <div style={{ fontSize: 12, marginTop: 4 }}>{n.label}</div>}
        </div>
      ))}
      {/* Edges rendering is omitted for brevity in MVP placeholder */}
    </div>
  )
}

export default FlowCanvas
