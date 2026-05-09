'use client'
import React, { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

interface EdgeTypeConfig {
  color: string
  label: string
  strokeDasharray?: string
}

interface ParticleConfig {
  offset: number
  sizeMultiplier: number
}

interface AnimatedEdgeParticlesProps extends EdgeProps {
  edgeConfig: EdgeTypeConfig
  duration?: number
  strength?: number
  flowAnimation?: boolean
  particles?: ParticleConfig[]
  glowStdDeviation?: number
  trailStdDeviation?: number
}

const DEFAULT_PARTICLES: ParticleConfig[] = [
  { offset: 0, sizeMultiplier: 1 },
  { offset: 0.33, sizeMultiplier: 0.85 },
  { offset: 0.66, sizeMultiplier: 0.7 },
]

function AnimatedEdgeParticlesComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  edgeConfig,
  duration = 3,
  strength = 1,
  flowAnimation = true,
  particles = DEFAULT_PARTICLES,
  glowStdDeviation = 2,
  trailStdDeviation = 4,
}: AnimatedEdgeParticlesProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    borderRadius: 8,
  })

  const opacity = selected ? 0.7 : 0.2 + strength * 0.2
  const strokeWidth = selected ? 1.5 : 0.5 + strength * 0.5

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeConfig.color,
          strokeWidth,
          strokeOpacity: opacity,
          strokeDasharray: edgeConfig.strokeDasharray || undefined,
        }}
      />

      {flowAnimation && (
        <g>
          <defs>
            <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={glowStdDeviation} result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id={`trail-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={trailStdDeviation} result="blur" />
              <feMerge><feMergeNode in="blur" /></feMerge>
            </filter>
          </defs>

          {particles.map((particle, i) => {
            const baseRadius = 2 + strength * 0.5
            const radius = baseRadius * particle.sizeMultiplier
            const beginOffset = particle.offset * duration

            return (
              <g key={`${id}-particle-${i}`}>
                <circle r={radius * 2.5} fill={edgeConfig.color} opacity={0.15} filter={`url(#trail-${id})`}>
                  <animateMotion path={edgePath} dur={`${duration}s`} begin={`${beginOffset}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                </circle>
                <circle r={radius} fill={edgeConfig.color} opacity={0.7} filter={`url(#glow-${id})`}>
                  <animateMotion path={edgePath} dur={`${duration}s`} begin={`${beginOffset}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                  <animate attributeName="opacity" values="0.5;0.85;0.5" dur={`${duration * 0.5}s`} repeatCount="indefinite" />
                </circle>
              </g>
            )
          })}
        </g>
      )}

      {selected && (
        <EdgeLabelRenderer>
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            fontSize: 8, fontWeight: 700,
            color: edgeConfig.color,
            background: 'rgba(10,10,10,0.9)',
            padding: '1px 4px', borderRadius: 3,
            pointerEvents: 'none',
            border: `1px solid ${edgeConfig.color}30`,
          }}>
            {edgeConfig.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const AnimatedEdgeParticles = memo(AnimatedEdgeParticlesComponent)
