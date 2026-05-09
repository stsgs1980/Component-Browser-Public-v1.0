'use client'

/**
 * CategoryDetailCard — Expanded detail view for a category with all items.
 * Shows each item with description, feature badges, and optional external link.
 *
 * De-hardcoded from: carbon-design-system-guide (Mantine + Carbon DS)
 * - Replaced hardcoded "Документация" → `linkLabel` prop
 * - Made badge color, icon color configurable via props
 * - Added `onItemClick` callback
 * - Generic CategoryItem type shared with CategoryTile
 */

import { ReactNode } from 'react'
import {
  Card,
  Group,
  ThemeIcon,
  Box,
  Title,
  Text,
  Stack,
  Badge,
  Divider,
  Anchor,
} from '@mantine/core'
import { ExternalLink } from 'lucide-react'
import type { CategoryItem } from './CategoryTile'

export interface CategoryDetailCardProps {
  /** Category icon element */
  icon: ReactNode
  /** Category title */
  title: string
  /** Category description */
  description?: string
  /** All items to display */
  items: CategoryItem[]
  /** Label for the external documentation link (default: "Documentation") */
  linkLabel?: string
  /** Badge variant for feature tags (default: "outline") */
  badgeVariant?: 'outline' | 'filled' | 'light' | 'dot'
  /** Badge color for feature tags (default: "gray") */
  badgeColor?: string
  /** Card background color */
  backgroundColor?: string
  /** ThemeIcon color name (default: "blue") */
  themeIconColor?: string
  /** Callback when an item is clicked */
  onItemClick?: (item: CategoryItem) => void
}

export function CategoryDetailCard({
  icon,
  title,
  description,
  items,
  linkLabel = 'Documentation',
  badgeVariant = 'outline',
  badgeColor = 'gray',
  backgroundColor = 'var(--mantine-color-body)',
  themeIconColor = 'blue',
  onItemClick,
}: CategoryDetailCardProps) {
  return (
    <Card
      padding="xl"
      radius="sm"
      style={{
        background: backgroundColor,
        border: '1px solid var(--mantine-color-gray-30)',
      }}
    >
      <Group mb="xl">
        <ThemeIcon
          size="xl"
          radius="sm"
          variant="outline"
          color={themeIconColor}
        >
          {icon}
        </ThemeIcon>
        <Box>
          <Title order={3} fw={600}>
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Box>
      </Group>

      <Stack gap="md">
        {items.map((item, index) => (
          <Box key={item.id ?? index}>
            {index > 0 && <Divider my="md" />}
            <Group justify="space-between" align="flex-start">
              <Box
                flex={1}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                onClick={() => onItemClick?.(item)}
              >
                <Text fw={500} mb="xs">
                  {item.name}
                </Text>
                {item.description && (
                  <Text size="sm" c="dimmed" mb="sm">
                    {item.description}
                  </Text>
                )}
                {item.features && item.features.length > 0 && (
                  <Group gap="xs">
                    {item.features.map((feature, i) => (
                      <Badge
                        key={i}
                        variant={badgeVariant}
                        color={badgeColor}
                        size="sm"
                        style={{ borderRadius: 2 }}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </Group>
                )}
              </Box>
              {item.url && (
                <Anchor
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  c={`${themeIconColor}.6`}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Group gap={4}>
                    <span>{linkLabel}</span>
                    <ExternalLink size={14} />
                  </Group>
                </Anchor>
              )}
            </Group>
          </Box>
        ))}
      </Stack>
    </Card>
  )
}
