'use client'

import { Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Column {
  id: string
  name: string
}

interface ComparisonTableProps {
  title?: string
  description?: string
  /** Feature row labels */
  features: string[]
  /** Columns (e.g. product names) */
  columns: Column[]
  /** Feature matrix: features[rowKey]?.[columnId] = true/false */
  featureValues: Record<string, Record<string, boolean>>
  /** Icons for check/cross (default: lucide Check/X) */
  checkIcon?: React.ReactNode
  crossIcon?: React.ReactNode
  className?: string
}

/**
 * ComparisonTable — матрица сравнения функций с Check/X иконками.
 *
 * Извлечён из ComparisonSection. Частый паттерн для:
 *   - страниц тарифов
 *   - сравнения продуктов
 *   - feature matrices
 *
 * Пример:
 * ```tsx
 * <ComparisonTable
 *   features={['Theming', 'Dark Mode', 'TypeScript']}
 *   columns={[
 *     { id: 'shadcn', name: 'shadcn/ui' },
 *     { id: 'mantine', name: 'Mantine' },
 *   ]}
 *   featureValues={{
 *     shadcn: { theming: true, 'dark-mode': true, typescript: true },
 *     mantine: { theming: true, 'dark-mode': true, typescript: true },
 *   }}
 * />
 * ```
 */
export function ComparisonTable({
  title,
  description,
  features,
  columns,
  featureValues,
  checkIcon,
  crossIcon,
  className,
}: ComparisonTableProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Feature</TableHead>
                {columns.map((col) => (
                  <TableHead key={col.id} className="text-center min-w-24">
                    {col.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature}>
                  <TableCell className="font-medium">{feature}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.id} className="text-center">
                      {featureValues[col.id]?.[feature.toLowerCase()] ? (
                        checkIcon ?? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        )
                      ) : (
                        crossIcon ?? (
                          <X className="h-5 w-5 text-red-400 mx-auto" />
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
