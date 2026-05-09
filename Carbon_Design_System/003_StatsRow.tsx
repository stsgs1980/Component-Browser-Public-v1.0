'use client'

/**
 * StatsRow — Responsive metrics dashboard row (Carbon-style).
 * Displays a grid of stat cards with value + label, optional accent styling
 * for the first card.
 *
 * De-hardcoded from: carbon-design-system-guide (Mantine + Carbon DS)
 * - Replaced hardcoded Russian labels → generic `label` prop
 * - Made accent color configurable via `accentColor` / `accentBg` props
 * - Accepts any number of stats (not limited to 4)
 * - Grid columns auto-adapt: 1 col on mobile, 2 on sm, 4 on md+
 */

import { ReactNode } from 'react'
import { Grid, Paper, Text } from '@mantine/core'

export interface StatItem {
  /** Metric value to display (e.g. "42", "99%") */
  value: string | number
  /** Label below the value (e.g. "Categories", "Users") */
  label: string
  /** Whether this stat should use the accent color (default: false) */
  accent?: boolean
  /** Optional icon displayed before the value */
  icon?: ReactNode
  /** Optional suffix appended to the value (e.g. "+", "%") */
  suffix?: string
}

export interface StatsRowProps {
  /** Array of stat items to display */
  stats: StatItem[]
  /** Accent text color for highlighted stats (default: Mantine blue-7) */
  accentColor?: string
  /** Accent card background (default: Mantine blue-0) */
  accentBg?: string
  /** Accent card border color (default: Mantine blue-2) */
  accentBorder?: string
  /** Normal card background (default: Mantine gray-0) */
  normalBg?: string
  /** Normal card border color (default: Mantine gray-2) */
  normalBorder?: string
  /** Columns at base breakpoint (default: 6) */
  baseCols?: number
  /** Columns at sm breakpoint (default: 3) */
  smCols?: number
  /** Gap between cards (default: "md") */
  gutter?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Bottom margin (default: "xl") */
  mb?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function StatsRow({
  stats,
  accentColor = 'var(--mantine-color-blue-7)',
  accentBg = 'var(--mantine-color-blue-0)',
  accentBorder = 'var(--mantine-color-blue-2)',
  normalBg = 'var(--mantine-color-gray-0)',
  normalBorder = 'var(--mantine-color-gray-2)',
  baseCols = 6,
  smCols = 3,
  gutter = 'md',
  mb = 'xl',
}: StatsRowProps) {
  return (
    <Grid gutter={gutter} mb={mb}>
      {stats.map((stat, index) => {
        const isAccent = stat.accent ?? index === 0
        return (
          <Grid.Col key={index} span={{ base: baseCols, sm: smCols }}>
            <Paper
              p="md"
              radius="sm"
              style={{
                background: isAccent ? accentBg : normalBg,
                border: `1px solid ${isAccent ? accentBorder : normalBorder}`,
              }}
            >
              <Text size="xl" fw={600} c={isAccent ? accentColor : undefined}>
                {stat.icon}
                {stat.value}
                {stat.suffix}
              </Text>
              <Text size="sm" c="dimmed">
                {stat.label}
              </Text>
            </Paper>
          </Grid.Col>
        )
      })}
    </Grid>
  )
}
