// --- source: UI-Stack-Guide / page.tsx (lines 1376-1439) ---
// Side-by-side comparison card with 1-5 star ratings and conclusion.
// De-hardcoded: "Headless"/"Styled" labels → generic leftLabel/rightLabel props.

interface RatingCardProps {
  title: string;
  leftLabel?: string;
  rightLabel?: string;
  leftRating: number;
  rightRating: number;
  leftDescription: string;
  rightDescription: string;
  conclusion: string;
  /** Conclusion label (default "Conclusion:") */
  conclusionLabel?: string;
  maxRating?: number;
  className?: string;
}

export function RatingComparisonCard({
  title,
  leftLabel = 'Option A',
  rightLabel = 'Option B',
  leftRating, rightRating,
  leftDescription, rightDescription,
  conclusion,
  conclusionLabel = 'Conclusion:',
  maxRating = 5,
  className,
}: RatingCardProps) {
  const renderRating = (rating: number) => (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }, (_, i) => (
        <span
          key={i}
          className={[
            'w-4 h-4 border transition-colors',
            i < rating
              ? 'bg-foreground border-foreground'
              : 'bg-transparent border-border',
          ].join(' ')}
        />
      ))}
    </div>
  );

  return (
    <div className={`border border-border ${className || ''}`}>
      <div className="px-5 py-4 border-b border-border bg-muted/10">
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-px bg-border">
        <div className="bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium uppercase tracking-wider">{leftLabel}</span>
            {renderRating(leftRating)}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{leftDescription}</p>
        </div>
        <div className="bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium uppercase tracking-wider">{rightLabel}</span>
            {renderRating(rightRating)}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{rightDescription}</p>
        </div>
      </div>

      <div className="px-5 py-4 bg-muted/5 border-t border-border">
        <p className="text-sm">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">
            {conclusionLabel}
          </span>
          {conclusion}
        </p>
      </div>
    </div>
  );
}
