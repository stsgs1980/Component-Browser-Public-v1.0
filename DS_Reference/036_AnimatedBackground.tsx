'use client'

import { motion } from 'framer-motion'

interface BlobConfig {
  /** Tailwind gradient classes, e.g. 'from-violet-200/40 via-purple-100/30 to-transparent' */
  gradient: string
  size: string
  position: string
  blur?: string
}

interface FloatingOrbConfig {
  gradient: string
  size: string
  position: string
  blur?: string
  /** Animation config */
  animateY?: [number, number, number]
  animateX?: [number, number, number]
  duration?: number
  delay?: number
}

interface DotGridConfig {
  enabled?: boolean
  spacing?: number
  dotRadius?: number
  fill?: string
  fillOpacity?: number
}

interface AnimatedBackgroundProps {
  blobs?: BlobConfig[]
  floatingOrbs?: FloatingOrbConfig[]
  dotGrid?: DotGridConfig
  className?: string
}

const DEFAULT_BLOBS: BlobConfig[] = [
  {
    gradient: 'from-violet-200/40 via-purple-100/30 to-transparent',
    size: 'w-[800px] h-[800px]',
    position: 'top-0 right-0 translate-x-1/3 -translate-y-1/3',
    blur: 'blur-3xl',
  },
  {
    gradient: 'from-blue-100/30 via-cyan-50/20 to-transparent',
    size: 'w-[700px] h-[700px]',
    position: 'bottom-0 left-0 -translate-x-1/3 translate-y-1/3',
    blur: 'blur-3xl',
  },
  {
    gradient: 'from-pink-100/20 via-violet-50/20 to-transparent',
    size: 'w-[500px] h-[500px]',
    position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    blur: 'blur-3xl',
  },
]

const DEFAULT_ORBS: FloatingOrbConfig[] = [
  {
    gradient: 'from-violet-200/50 to-purple-100/30',
    size: 'w-32 h-32',
    position: 'top-1/4 right-1/4',
    blur: 'blur-2xl',
    animateY: [0, -20, 0],
    animateX: [0, 10, 0],
    duration: 8,
  },
  {
    gradient: 'from-blue-100/40 to-cyan-50/30',
    size: 'w-40 h-40',
    position: 'bottom-1/3 left-1/5',
    blur: 'blur-2xl',
    animateY: [0, 15, 0],
    animateX: [0, -10, 0],
    duration: 10,
    delay: 2,
  },
  {
    gradient: 'from-pink-100/40 to-rose-50/30',
    size: 'w-24 h-24',
    position: 'top-2/3 right-1/3',
    blur: 'blur-xl',
    animateY: [0, -12, 0],
    duration: 6,
    delay: 1,
  },
]

/**
 * AnimatedBackground — декоративный анимированный фон с blob-ами,
 * плавающими орбами и точечной сеткой.
 *
 * Извлечён из HomeSection (hero-фон).
 *
 * Пример:
 * ```tsx
 * <AnimatedBackground />  // дефолтная конфигурация
 * <AnimatedBackground
 *   blobs={[{ gradient: 'from-green-200/40 ...', size: 'w-[600px] h-[600px]', position: 'top-0 left-0' }]}
 *   dotGrid={{ spacing: 40, fill: '#10B981' }}
 * />
 * ```
 */
export function AnimatedBackground({
  blobs = DEFAULT_BLOBS,
  floatingOrbs = DEFAULT_ORBS,
  dotGrid = { enabled: true },
  className,
}: AnimatedBackgroundProps) {
  const {
    enabled: dotsEnabled = true,
    spacing = 60,
    dotRadius = 1,
    fill = '#8B5CF6',
    fillOpacity = 0.3,
  } = dotGrid

  return (
    <div className={`fixed inset-0 overflow-hidden -z-10 pointer-events-none ${className ?? ''}`}>
      {/* Gradient blobs */}
      {blobs.map((blob, i) => (
        <div
          key={`blob-${i}`}
          className={`absolute ${blob.size} rounded-full bg-gradient-to-br ${blob.gradient} ${blob.blur ?? 'blur-3xl'} ${blob.position}`}
        />
      ))}

      {/* Dot grid SVG */}
      {dotsEnabled && (
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern
              id={`dots-${spacing}`}
              x="0"
              y="0"
              width={spacing}
              height={spacing}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={dotRadius + 0.5} cy={dotRadius + 0.5} r={dotRadius} fill={fill} opacity={fillOpacity} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${spacing})`} />
        </svg>
      )}

      {/* Floating orbs */}
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          animate={{
            y: orb.animateY ?? [0, -15, 0],
            x: orb.animateX ?? [0, 8, 0],
          }}
          transition={{
            duration: orb.duration ?? 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay ?? 0,
          }}
          className={`absolute ${orb.size} rounded-full bg-gradient-to-br ${orb.gradient} ${orb.blur ?? 'blur-2xl'} ${orb.position}`}
        />
      ))}
    </div>
  )
}
