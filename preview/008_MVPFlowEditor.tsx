// Project: MVP Flow Studio Pro
// Category: src
// Source: flow-studio\MVP Flow Studio Pro\studio-frontend\src
// Lines: 18

import React from 'react'
import FlowCanvas from './components/FlowCanvas'

type Node = { id: string; type: string; position?: { x: number; y: number }; label?: string }
type Edge = { from: string; to: string }

export const FlowEditor: React.FC<{ flow?: { nodes: Node[]; edges: Edge[] } }> = ({ flow }) => {
  const nodes = flow?.nodes ?? []
  const edges = flow?.edges ?? []
  return (
    <div style={{ border: '1px solid #e5e7eb', height: '60vh', borderRadius: 8, padding: 8 }}>
      <FlowCanvas nodes={nodes} edges={edges} />
    </div>
  )
}

export default FlowEditor
