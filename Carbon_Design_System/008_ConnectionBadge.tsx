/**
 * ConnectionBadge — Displays real-time connection status with colored indicator.
 * Useful for WebSocket, SSE, or any live-connection UI feedback.
 *
 * De-hardcoded from: carbon-design-system-guide (examples/websocket/frontend.tsx)
 * - Extracted from a Socket.IO demo into a standalone, framework-agnostic badge
 * - Customizable labels, colors, and sizes
 * - Supports optional pulse animation for "connecting" state
 */

import { Badge } from '@mantine/core'

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

export interface ConnectionBadgeProps {
  /** Current connection status */
  status: ConnectionStatus
  /** Label for connected state (default: "Connected") */
  connectedLabel?: string
  /** Label for disconnected state (default: "Disconnected") */
  disconnectedLabel?: string
  /** Label for connecting state (default: "Connecting...") */
  connectingLabel?: string
  /** Label for error state (default: "Connection Error") */
  errorLabel?: string
  /** Badge size (default: "sm") */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Whether to show a pulsing dot indicator (default: true) */
  showDot?: boolean
  /** Custom color overrides */
  colors?: Partial<Record<ConnectionStatus, string>>
}

const defaultColors: Record<ConnectionStatus, string> = {
  connected: 'green',
  disconnected: 'gray',
  connecting: 'yellow',
  error: 'red',
}

export function ConnectionBadge({
  status,
  connectedLabel = 'Connected',
  disconnectedLabel = 'Disconnected',
  connectingLabel = 'Connecting...',
  errorLabel = 'Connection Error',
  size = 'sm',
  showDot = true,
  colors = {},
}: ConnectionBadgeProps) {
  const mergedColors = { ...defaultColors, ...colors }
  const color = mergedColors[status]

  const labels: Record<ConnectionStatus, string> = {
    connected: connectedLabel,
    disconnected: disconnectedLabel,
    connecting: connectingLabel,
    error: errorLabel,
  }

  const dotColor: Record<ConnectionStatus, string> = {
    connected: '#198038',
    disconnected: '#8d8d8d',
    connecting: '#f1c21b',
    error: '#da1e28',
  }

  return (
    <Badge
      color={color}
      size={size}
      variant="light"
      radius="sm"
      leftSection={
        showDot ? (
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: dotColor[status],
              animation: status === 'connecting' ? 'pulse 1.5s infinite' : undefined,
            }}
          />
        ) : undefined
      }
      styles={status === 'connecting' ? {
        root: {
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.4 },
          },
        },
      } : undefined}
    >
      {labels[status]}
    </Badge>
  )
}
