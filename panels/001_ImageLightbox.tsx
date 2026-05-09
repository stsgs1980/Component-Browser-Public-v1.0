'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  src: string
  alt: string
  open: boolean
  onClose: () => void
  /** Maximum width of the image container (default: 'max-w-4xl') */
  maxWidth?: string
  className?: string
}

/**
 * ImageLightbox — легковесный просмотрщик изображений (lightbox).
 *
 * Извлечён из Industrial-Style-Guide (page.tsx ImageModal).
 * Улучшен по сравнению с оригиналом:
 *   - Закрытие по Escape
 *   - Блокировка скролла body при открытии
 *   - Анимация появления/исчезновения
 *   - Пропс `open` вместо условного рендера
 *   - aria-label для доступности
 *
 * Пример:
 * ```tsx
 * const [lightbox, setLightbox] = useState<string | null>(null)
 *
 * <ImageLightbox
 *   src={lightbox!}
 *   alt="Preview"
 *   open={!!lightbox}
 *   onClose={() => setLightbox(null)}
 * />
 * ```
 */
export function ImageLightbox({
  src,
  alt,
  open,
  onClose,
  maxWidth = 'max-w-4xl',
  className,
}: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in-0 duration-200 ${className ?? ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Image preview: ${alt}`}
    >
      <div className={`relative ${maxWidth} max-h-[90vh] w-full`}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-zinc-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={1024}
          className="w-full h-auto max-h-[85vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}
