// --- source: Radix-Template / page.tsx (lines 523-548) ---
// Feature card with gradient icon background, hover scale effect.
// De-hardcoded: gradient colors, icon, text → props.

'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Gradient classes for the icon background (e.g. "from-purple-500 to-blue-500") */
  iconGradient?: string;
  /** Hover scale (default "[1.02]") */
  hoverScale?: string;
  /** Stagger delay index (for whileInView animation) */
  index?: number;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconGradient = 'from-purple-500 to-blue-500',
  hoverScale = '[1.02]',
  index = 0,
  className,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className={[
          'h-full border transition-all duration-300 hover:scale-',
          hoverScale,
          'cursor-pointer group',
          className,
        ].join(' ')}
      >
        <CardHeader>
          <div
            className={[
              'w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br',
              iconGradient,
            ].join(' ')}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
