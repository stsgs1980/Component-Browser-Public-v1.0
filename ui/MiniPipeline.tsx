'use client'
import type { PipelineStep } from './PipelineStepNode'

interface MiniPipelineProps {
  steps: PipelineStep[]
  lineColor?: string
  dotSize?: number
}

export function MiniPipeline({ steps, lineColor = 'rgba(255,255,255,0.1)', dotSize = 8 }: MiniPipelineProps) {
  return (
    <div className="flex items-center gap-0.5 overflow-hidden">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div
            className="rounded-full flex-shrink-0 transition-all duration-300"
            style={{
              width: dotSize,
              height: dotSize,
              background: step.actionColor || '#475569',
              boxShadow: `0 0 4px ${step.actionColor}44`,
            }}
            title={`${step.name} (${step.action})`}
          />
          {i < steps.length - 1 && (
            <div className="flex-shrink-0" style={{ width: 12, height: 1, background: lineColor }} />
          )}
        </div>
      ))}
    </div>
  )
}
