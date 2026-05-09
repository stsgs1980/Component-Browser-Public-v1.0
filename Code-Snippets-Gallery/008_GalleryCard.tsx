// --- source: Code-Snippets-Gallery / snippet-card.tsx ---
// Animated gallery card with accent bar, inline Preview/Code tabs, like button,
// and Framer Motion entrance + hover lift. Fully generic — any content type.
// De-hardcoded: colors/heights/text → props, removed i18n, removed LANGUAGE_COLORS.

'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Eye, Code2, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GalleryCardProps {
  /** Card title */
  title: string;
  /** Author / attribution line */
  author?: string;
  /** Short description */
  description?: string;
  /** Language/technology badge */
  badge?: string;
  /** Badge color class (e.g. "text-emerald-600 border-emerald-600/30 bg-emerald-600/10") */
  badgeClass?: string;
  /** Top accent bar color (Tailwind bg class, e.g. "bg-amber-500") */
  accentColor?: string;
  /** Show featured star icon */
  featured?: boolean;
  /** Like count */
  likes?: number;
  /** "By" label (default "by") */
  byLabel?: string;
  /** Preview tab content */
  previewContent?: ReactNode;
  /** Code preview text (first N lines shown with fade) */
  codePreview?: string;
  /** Maximum code lines to show (default 5) */
  maxCodeLines?: number;
  /** Preview area height (default 160) */
  previewHeight?: number;
  /** Like callback */
  onLike?: () => void;
  /** "View full" callback */
  onViewFull?: () => void;
  /** View button label (default "View Code") */
  viewLabel?: string;
  /** Tab labels */
  tabLabels?: { preview?: string; code?: string };
}

type TabType = 'preview' | 'code';

export function GalleryCard({
  title, author, description, badge, badgeClass,
  accentColor = 'bg-gray-500',
  featured, likes,
  byLabel = 'by',
  previewContent, codePreview,
  maxCodeLines = 5, previewHeight = 160,
  onLike, onViewFull, viewLabel = 'View Code',
  tabLabels = {},
}: GalleryCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(
    previewContent ? 'preview' : 'code',
  );

  const hasPreview = !!previewContent;
  const hasCode = !!codePreview;

  const previewLines = codePreview
    ? codePreview.split('\n').slice(0, maxCodeLines).join('\n')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-xl border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className={cn('h-1', accentColor)} />

      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-1 flex-1">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {featured && <Star className="size-4 fill-amber-400 text-amber-400" />}
            {badge && (
              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', badgeClass)}>
                {badge}
              </Badge>
            )}
          </div>
        </div>

        {/* Author */}
        {author && (
          <p className="text-xs text-muted-foreground">
            {byLabel} {author}
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tab bar + Content (only if we have preview or code) */}
        {(hasPreview || hasCode) && (
          <div className="rounded-lg overflow-hidden border border-border/50">
            {/* Tab buttons */}
            <div className="flex border-b border-border/50 bg-muted/40" role="tablist">
              {hasPreview && (
                <button
                  onClick={() => setActiveTab('preview')}
                  role="tab" aria-selected={activeTab === 'preview'}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors',
                    activeTab === 'preview'
                      ? 'text-foreground bg-background border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Play className="size-3" />
                  {tabLabels.preview || 'Preview'}
                </button>
              )}
              {hasCode && (
                <button
                  onClick={() => setActiveTab('code')}
                  role="tab" aria-selected={activeTab === 'code'}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors',
                    activeTab === 'code'
                      ? 'text-foreground bg-background border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Code2 className="size-3" />
                  {tabLabels.code || 'Code'}
                </button>
              )}
            </div>

            {/* Tab content */}
            <div className="relative bg-[#0c0c14] dark:bg-[#08080e]" style={{ height: previewHeight }}>
              {activeTab === 'preview' && hasPreview && previewContent}

              {activeTab === 'code' && hasCode && (
                <div className="relative h-full overflow-hidden p-3">
                  <pre className="text-[11px] sm:text-xs font-mono leading-relaxed text-foreground/60 overflow-hidden">
                    <code>{previewLines}</code>
                  </pre>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0c0c14] dark:from-[#08080e] to-transparent pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {onLike && likes !== undefined ? (
            <Button
              variant="ghost" size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-rose-500"
              onClick={onLike}
            >
              <Heart className="size-3.5" />
              <span className="text-xs">{likes}</span>
            </Button>
          ) : <div />}
          {onViewFull && (
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onViewFull}>
              <Eye className="size-3.5" />
              {viewLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
