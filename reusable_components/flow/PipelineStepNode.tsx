'use client'
import { Timer } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface PipelineStep {
  id: string
  name: string
  action: string
  actionColor: string
  actionIcon?: LucideIcon
  roleGroup?: string
  timeout: number
}

export const STATUS_COLORS: Record<string, string> = {
  completed: '#22C55E',
  running: '#06B6D4',
  failed: '#EF4444',
  waiting_feedback: '#EAB308',
  skipped: '#64748B',
  pending: '#475569',
}

interface PipelineStepNodeProps {
  step: PipelineStep
  execStatus?: string
  isAnimating?: boolean
  isHighlighted?: boolean
  onClick?: () => void
}

export function PipelineStepNode({ step, execStatus, isAnimating, isHighlighted, onClick }: PipelineStepNodeProps) {
  const actionColor = step.actionColor || '#475569'
  const statusColor = execStatus ? (STATUS_COLORS[execStatus] || '#475569') : actionColor
  const ActionIcon = step.actionIcon || Timer

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 min-w-[90px] max-w-[120px] text-left"
      style={{
        background: isHighlighted ? `${statusColor}15` : 'rgba(13,13,13,0.8)',
        border: `1px solid ${isHighlighted ? `${statusColor}40` : 'rgba(51,51,51,0.4)'}`,
        boxShadow: isAnimating ? `0 0 12px ${statusColor}40` : isHighlighted ? `0 0 8px ${statusColor}20` : 'none',
      }}
    >
      {isAnimating && (
        <div className="absolute inset-0 rounded-lg" style={{ border: `1.5px solid ${statusColor}`, animation: 'pulseRing 1.5s ease-out infinite' }} />
      )}

      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${actionColor}20` }}>
        <ActionIcon size={12} style={{ color: actionColor }} />
      </div>

      <span className="text-[9px] font-medium text-center leading-tight truncate w-full" style={{ color: isHighlighted ? statusColor : '#B0B0B0' }}>
        {step.name}
      </span>

      {step.roleGroup && (
        <span className="text-[7px] px-1 py-0.5 rounded font-medium" style={{ background: `${actionColor}15`, color: actionColor }}>
          {step.roleGroup}
        </span>
      )}

      <div className="flex items-center gap-0.5">
        <Timer size={7} style={{ color: '#64748B' }} />
        <span className="text-[7px]" style={{ color: '#64748B' }}>{step.timeout}s</span>
      </div>

      {execStatus && (
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[execStatus], boxShadow: `0 0 4px ${STATUS_COLORS[execStatus]}44` }} />
      )}
    </button>
  )
}
