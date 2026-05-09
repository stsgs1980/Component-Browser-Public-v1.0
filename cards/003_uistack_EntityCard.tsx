'use client';

import { memo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────

export interface EntityCardProps {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  tags?: string[];
  metrics?: Record<string, number>;
  maxMetric?: number;
  metricLabels?: Record<string, string>;
  links?: EntityLink[];
  /** Primary CTA */
  cta?: { label: string; href: string };
  /** Top-right badge (e.g. rating) */
  badge?: { icon?: React.ReactNode; value: string; subtext?: string };
  /** Character limit for description */
  descriptionLines?: number;
  /** Max tags to show */
  maxTags?: number;
  className?: string;
}

export interface EntityLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────

export const EntityCard = memo(function EntityCard({
  name,
  slug,
  description,
  color = '#339af0',
  tags,
  metrics,
  maxMetric = 5,
  metricLabels,
  links,
  cta,
  badge,
  descriptionLines = 2,
  maxTags = 3,
  className = '',
}: EntityCardProps) {
  const metricEntries = metrics ? Object.entries(metrics) : [];
  const displayMetrics = metricEntries.slice(0, 4);

  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 transition-all hover:shadow-lg group ${className}`}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary, #3b82f6)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center font-bold text-lg text-white"
            style={{ backgroundColor: color }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-semibold group-hover:text-[var(--primary,#3b82f6)] transition-colors">
            {name}
          </h3>
        </div>
        {badge && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--secondary, #f1f5f9)' }}>
            {badge.icon}
            <span className="font-semibold">{badge.value}</span>
            {badge.subtext && <span className="text-xs text-muted-foreground">({badge.subtext})</span>}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-4">
        {/* Description */}
        {description && (
          <p className="text-muted-foreground text-sm" style={{
            display: '-webkit-box',
            WebkitLineClamp: descriptionLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {description}
          </p>
        )}

        {/* Metrics grid */}
        {displayMetrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {displayMetrics.map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-muted-foreground">
                  {(metricLabels && metricLabels[key]) || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:
                </span>{' '}
                <span className="font-semibold text-[var(--primary,#3b82f6)]">
                  {value}/{maxMetric}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, maxTags).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--secondary, #f1f5f9)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {links && links.length > 0 && (
          <div className="flex gap-2 pt-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded transition-colors"
                style={{ border: '1px solid var(--border, #e2e8f0)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary, #f1f5f9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        {cta && (
          <a
            href={cta.href}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--primary, #3b82f6)' }}
          >
            {cta.label}
          </a>
        )}
      </div>
    </div>
  );
});

export default EntityCard;
