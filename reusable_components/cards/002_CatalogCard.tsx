'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageLightbox } from './001_ImageLightbox'

interface CatalogCardTags {
  /** Filled feature chips (label only) */
  features?: string[]
  /** Outlined use-case tags */
  useCases?: string[]
}

interface CatalogCardProps {
  title: string
  subtitle?: string
  description?: string
  image?: string
  /** 0-padded index number (e.g. '01', '12') */
  index?: number | string
  /** Optional UI score (0-100) */
  score?: number
  /** Score label (default: 'Score') */
  scoreLabel?: string
  /** Tags — filled features + outlined use-cases */
  tags?: CatalogCardTags
  /** Show image section (default: true) */
  showImage?: boolean
  /** Override image height (default: 'h-40') */
  imageHeight?: string
  className?: string
  children?: React.ReactNode
}

/**
 * CatalogCard — составная карточка каталога с опциональными секциями:
 *   - Изображение с hover-overlay (zoom icon) + lightbox при клике
 *   - Индекс + подзаголовок + заголовок
 *   - Описание
 *   - Feature-чипы (залитые) + Use-case-чипы (outlined)
 *   - Inline progress bar для score
 *   - Произвольный children
 *
 * Извлечён из Industrial-Style-Guide (StyleCard).
 * Де-хардкожен: убраны `style: any`, фиксированные классы zinc → пропсы.
 *
 * Пример:
 * ```tsx
 * <CatalogCard
 *   title="Flat Design"
 *   subtitle="Flat Design Technical"
 *   description="Industry standard UI style"
 *   image="/flat.png"
 *   index={1}
 *   score={100}
 *   tags={{ features: ['Scalable', 'Clean'], useCases: ['Icons', 'Buttons'] }}
 * />
 * ```
 */
export function CatalogCard({
  title,
  subtitle,
  description,
  image,
  index,
  score,
  scoreLabel = 'Score',
  tags,
  showImage = true,
  imageHeight = 'h-40',
  className,
  children,
}: CatalogCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const indexStr = index !== undefined ? String(index).padStart(2, '0') : undefined

  return (
    <>
      <Card className={`border border-zinc-200 dark:border-zinc-800 shadow-none hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors bg-transparent overflow-hidden group ${className ?? ''}`}>
        {/* Image with hover zoom overlay */}
        {showImage && image && (
          <div
            className={`relative ${imageHeight} bg-zinc-100 dark:bg-zinc-900 cursor-pointer overflow-hidden`}
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            {indexStr && (
              <>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                  {indexStr}
                </span>
                <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700" />
              </>
            )}
            {subtitle && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
                {subtitle}
              </span>
            )}
          </div>
          <CardTitle className="text-lg font-bold mt-2">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          )}

          {/* Filled feature chips */}
          {tags?.features && tags.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Inline score progress bar */}
          {score !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{scoreLabel}:</span>
              <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-xs font-bold">{score}%</span>
            </div>
          )}

          {/* Outlined use-case tags */}
          {tags?.useCases && tags.useCases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.useCases.map((u) => (
                <span
                  key={u}
                  className="text-xs px-2 py-1 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                >
                  {u}
                </span>
              ))}
            </div>
          )}

          {children}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {image && (
        <ImageLightbox
          src={image}
          alt={title}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
