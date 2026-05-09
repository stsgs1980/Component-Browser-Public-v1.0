'use client'

/**
 * CategoryTile — Generic catalog card for browsing categorized items.
 * Shows an icon, title, description, and a preview of items with an overflow indicator.
 *
 * De-hardcoded from: carbon-design-system-guide (Mantine + Carbon DS)
 * - Replaced hardcoded `slice(0, 4)` → `maxVisibleItems` prop
 * - Replaced hardcoded `"+N ещё"` → `overflowLabel` prop
 * - Replaced hardcoded Mantine color refs → generic props
 * - Made `onItemClick` callback configurable
 */

import { ReactNode } from 'react'
import {
  Card,
  Group,
  ThemeIcon,
  Box,
  Text,
  Stack,
  Paper,
} from '@mantine/core'
import { ChevronRight } from 'lucide-react'

export interface CategoryItem {
  id?: string
  name: string
  description?: string
  url?: string
  features?: string[]
}

export interface CategoryTileProps {
  /** Category icon element */
  icon: ReactNode
  /** Category title */
  title: string
  /** Category description */
  description?: string
  /** Items to preview inside the tile */
  items: CategoryItem[]
  /** Max items to show before overflow (default: 4) */
  maxVisibleItems?: number
  /** Label for overflow indicator (e.g. "+5 more") */
  overflowLabel?: string
  /** Whether this tile is currently active/selected */
  isActive?: boolean
  /** Active border color (default: blue) */
  activeBorderColor?: string
  /** Card background color */
  backgroundColor?: string
  /** Callback when an item is clicked */
  onItemClick?: (item: CategoryItem) => void
  /** ThemeIcon color name (default: "blue") */
  themeIconColor?: string
}

export function CategoryTile({
  icon,
  title,
  description,
  items,
  maxVisibleItems = 4,
  overflowLabel,
  isActive = false,
  activeBorderColor = 'var(--mantine-color-blue-6)',
  backgroundColor = 'var(--mantine-color-body)',
  onItemClick,
  themeIconColor = 'blue',
}: CategoryTileProps) {
  const visibleItems = items.slice(0, maxVisibleItems)
  const overflowCount = items.length - maxVisibleItems

  return (
    <Card
      padding="lg"
      radius="sm"
      style={{
        background: backgroundColor,
        border: isActive
          ? `2px solid ${activeBorderColor}`
          : '1px solid var(--mantine-color-gray-30)',
        transition: 'all 70ms ease',
        height: '100%',
      }}
    >
      <Group gap="sm" mb="md">
        <ThemeIcon
          size="lg"
          radius="sm"
          variant="outline"
          color={themeIconColor}
          style={{ border: `1px solid ${activeBorderColor}` }}
        >
          {icon}
        </ThemeIcon>
        <Box flex={1}>
          <Text fw={600} size="lg" component="h3">
            {title}
          </Text>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Box>
      </Group>

      <Stack gap="xs">
        {visibleItems.map((item, index) => (
          <Paper
            key={item.id ?? index}
            p="sm"
            radius="sm"
            style={{
              background: 'var(--mantine-color-gray-0)',
              border: '1px solid var(--mantine-color-gray-20)',
              cursor: onItemClick ? 'pointer' : 'default',
              transition: 'all 70ms ease',
            }}
            onClick={() => onItemClick?.(item)}
          >
            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Text size="sm" fw={500}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {item.description}
                  </Text>
                )}
              </Box>
              <ChevronRight
                size={16}
                style={{ minWidth: 16, color: 'var(--mantine-color-gray-50)' }}
              />
            </Group>
          </Paper>
        ))}
        {overflowCount > 0 && (
          <Text size="xs" c="dimmed" ta="center">
            {overflowLabel ?? `+${overflowCount} more`}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
