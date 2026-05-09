'use client'

/**
 * PipelineSimulator — Generic step-by-step animated simulation engine.
 * Manages agents/nodes through sequential phases with status transitions,
 * progress messages, and completion tracking.
 *
 * De-hardcoded from: Orchestration-of-AI-Agents (shared state logic in 3 pattern components)
 * - Extracted the common pattern from SequentialPattern, ParallelPattern, HierarchicalPattern
 * - Made phase definitions fully data-driven via props
 * - Removed hardcoded agent IDs, translation keys, timeouts
 * - Generic: works for any pipeline/workflow visualization
 */

import { useState, useCallback, useRef } from 'react'
import { Loader2, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LogEntry } from './EventLogPanel'
import type { StatusState } from './AnimatedStatusCard'

export interface PipelineNode {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  messages: string[]
}

export interface PipelinePhase {
  /** Unique phase identifier */
  id: string
  /** Nodes that are active during this phase */
  nodeIds: string[]
  /** Whether nodes in this phase run in parallel (default: false) */
  parallel?: boolean
  /** Delay between each progress message (ms, default: 600) */
  messageDelay?: number
  /** Delay before phase starts (ms, default: 0) */
  startDelay?: number
  /** Delay after phase completes (ms, default: 500) */
  endDelay?: number
}

export type NodeStatusMap = Record<string, {
  status: StatusState
  result?: string
}>

export interface PipelineSimulatorProps {
  /** All pipeline nodes */
  nodes: PipelineNode[]
  /** Ordered list of phases */
  phases: PipelinePhase[]
  /** Callback when a log entry is added */
  onLog?: (entry: LogEntry) => void
  /** Callback when a node's status changes */
  onNodeStatusChange?: (nodeId: string, status: StatusState, result?: string) => void
  /** Callback when simulation starts/ends */
  onRunningChange?: (running: boolean) => void
  /** Run button gradient class (default: cyan-to-purple) */
  runButtonClass?: string
  /** Label for run button (default: "Run") */
  runLabel?: string
  /** Label for reset button (default: "Reset") */
  resetLabel?: string
  /** Label for running state (default: "Running...") */
  runningLabel?: string
  /** Children — render the node layout between run buttons and log */
  children?: React.ReactNode
}

let _idCounter = 0
function uid(): string {
  return `evt-${Date.now()}-${++_idCounter}-${Math.random().toString(36).slice(2, 9)}`
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function PipelineSimulator({
  nodes,
  phases,
  onLog,
  onNodeStatusChange,
  onRunningChange,
  runButtonClass = 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600',
  runLabel = 'Run',
  resetLabel = 'Reset',
  runningLabel = 'Running...',
  children,
}: PipelineSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const nodeStatusRef = useRef<NodeStatusMap>({})

  const log = useCallback(
    (from: string, content: string) => {
      onLog?.({ id: uid(), from, content, timestamp: Date.now() })
    },
    [onLog],
  )

  const setNodeStatus = useCallback(
    (nodeId: string, status: StatusState, result?: string) => {
      nodeStatusRef.current[nodeId] = { status, result }
      onNodeStatusChange?.(nodeId, status, result)
    },
    [onNodeStatusChange],
  )

  const run = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    onRunningChange?.(true)
    nodeStatusRef.current = {}

    for (const phase of phases) {
      const msgDelay = phase.messageDelay ?? 600
      const startDelay = phase.startDelay ?? 0
      const endDelay = phase.endDelay ?? 500

      // Start phase
      if (startDelay > 0) await sleep(startDelay)

      // Set nodes to running
      for (const nodeId of phase.nodeIds) {
        setNodeStatus(nodeId, 'running')
      }

      // Run messages
      if (phase.parallel && phase.nodeIds.length > 1) {
        // Parallel: all nodes emit messages concurrently
        await Promise.all(
          phase.nodeIds.map(async (nodeId) => {
            const node = nodes.find((n) => n.id === nodeId)
            if (!node) return
            const msgs = node.messages.slice(0, -1) // all but last
            for (const msg of msgs) {
              await sleep(msgDelay + Math.random() * msgDelay * 0.5)
              log(node.title, msg)
            }
            const result = node.messages[node.messages.length - 1]
            setNodeStatus(nodeId, 'completed', result)
          }),
        )
      } else {
        // Sequential: one node at a time
        for (const nodeId of phase.nodeIds) {
          const node = nodes.find((n) => n.id === nodeId)
          if (!node) continue
          const msgs = node.messages.slice(0, -1)
          for (const msg of msgs) {
            await sleep(msgDelay)
            log(node.title, msg)
          }
          const result = node.messages[node.messages.length - 1] ?? 'Done'
          setNodeStatus(nodeId, 'completed', result)
        }
      }

      // End phase
      if (endDelay > 0) await sleep(endDelay)
    }

    setIsRunning(false)
    onRunningChange?.(false)
  }, [isRunning, nodes, phases, log, setNodeStatus, onRunningChange])

  const reset = useCallback(() => {
    setIsRunning(false)
    onRunningChange?.(false)
    nodeStatusRef.current = {}
    for (const node of nodes) {
      setNodeStatus(node.id, 'idle')
    }
  }, [nodes, setNodeStatus, onRunningChange])

  return (
    <div className="space-y-6">
      {/* Controls — passed via children composition */}
      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={run}
          disabled={isRunning}
          className={runButtonClass}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {runningLabel}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {runLabel}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={reset} disabled={isRunning}>
          <RotateCcw className="w-4 h-4" />
          {resetLabel}
        </Button>
      </div>

      {/* Node layout — consumer provides this */}
      {children}

      {/* Engine is controlled via callbacks; parent wires nodeStatusRef */}
      <PipelineSimulator.ControlledEngine
        isRunning={isRunning}
        resetTrigger={reset}
      />
    </div>
  )
}

/** Internal: exposes run/reset for parent wiring */
PipelineSimulator.ControlledEngine = function ControlledEngine({
  isRunning,
  resetTrigger,
}: {
  isRunning: boolean
  resetTrigger: () => void
}) {
  // This component is a placeholder for the engine's side effects.
  // The actual state management happens in PipelineSimulator via callbacks.
  return null
}
