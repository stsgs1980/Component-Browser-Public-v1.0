// --- source: Radix-Template / page.tsx (lines 174-187) ---
// Decorative blurred gradient orbs as fixed background effect.
// De-hardcoded: colors, positions, sizes → configurable props.

import { cn } from '@/lib/utils';

interface GradientOrb {
  /** Tailwind position classes (e.g. "-top-40 -right-40") */
  position: string;
  /** Size class (e.g. "w-[600px] h-[600px]") */
  size: string;
  /** Dark mode color (e.g. "bg-purple-600") */
  darkColor: string;
  /** Light mode color (e.g. "bg-purple-300") */
  lightColor: string;
  /** Blur amount (default "[120px]") */
  blur?: string;
  /** Opacity (e.g. "opacity-30") */
  opacity?: string;
}

interface AmbientBackgroundProps {
  /** Orb definitions */
  orbs: GradientOrb[];
  /** Whether to use dark mode colors (default false) */
  dark?: boolean;
  className?: string;
}

export function AmbientBackground({
  orbs,
  dark = false,
  className,
}: AmbientBackgroundProps) {
  return (
    <div className={cn('fixed inset-0 overflow-hidden pointer-events-none', className)}>
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={cn(
            'absolute rounded-full',
            orb.position,
            orb.size,
            `blur-${orb.blur || '[120px]'}`,
            orb.opacity || 'opacity-30',
            dark ? orb.darkColor : orb.lightColor,
          )}
        />
      ))}
    </div>
  );
}

/** Preset: standard 3-orb background (purple, blue, cyan) */
export const defaultOrbs: GradientOrb[] = [
  { position: '-top-40 -right-40', size: 'w-[600px] h-[600px]', darkColor: 'bg-purple-600', lightColor: 'bg-purple-300', blur: '[120px]', opacity: 'opacity-30' },
  { position: 'top-1/2 -left-40', size: 'w-[500px] h-[500px]', darkColor: 'bg-blue-600', lightColor: 'bg-blue-300', blur: '[120px]', opacity: 'opacity-20' },
  { position: '-bottom-40 right-1/3', size: 'w-[400px] h-[400px]', darkColor: 'bg-cyan-600', lightColor: 'bg-cyan-300', blur: '[100px]', opacity: 'opacity-25' },
];
