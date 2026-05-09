'use client';

// ─── Types ────────────────────────────────────────────────────────────

export interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action: string;
  colorClass?: string;
  bgClass?: string;
}

export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconColor?: string;
}

export interface WelcomeScreenStyle {
  background: string;
  title: string;
  subtitle: string;
  featureTitle: string;
  featureDesc: string;
  actionTitle: string;
  actionSubtitle: string;
  actionHoverTitle: string;
  actionBorder: string;
  actionHoverBg: string;
  sectionTitle: string;
  sectionIcon: string;
  hint: string;
  kbdBg: string;
  kbdText: string;
  featureIconBg: string;
}

export const DARK_STYLE: WelcomeScreenStyle = {
  background: '#0f172a',
  title: '#f9fafb',
  subtitle: '#94a3b8',
  featureTitle: '#f9fafb',
  featureDesc: '#6b7280',
  actionTitle: '#f9fafb',
  actionSubtitle: '#6b7280',
  actionHoverTitle: '#60a5fa',
  actionBorder: '#1e293b',
  actionHoverBg: 'rgba(30, 41, 59, 0.5)',
  sectionTitle: '#6b7280',
  sectionIcon: '#94a3b8',
  hint: '#4b5563',
  kbdBg: '#1e293b',
  kbdText: '#94a3b8',
  featureIconBg: '#1e293b',
};

export const LIGHT_STYLE: WelcomeScreenStyle = {
  background: '#ffffff',
  title: '#0f172a',
  subtitle: '#64748b',
  featureTitle: '#0f172a',
  featureDesc: '#94a3b8',
  actionTitle: '#0f172a',
  actionSubtitle: '#94a3b8',
  actionHoverTitle: '#3b82f6',
  actionBorder: '#e2e8f0',
  actionHoverBg: '#f1f5f9',
  sectionTitle: '#64748b',
  sectionIcon: '#94a3b8',
  hint: '#cbd5e1',
  kbdBg: '#f1f5f9',
  kbdText: '#64748b',
  featureIconBg: '#f1f5f9',
};

export interface WelcomeScreenProps {
  logoIcon?: React.ComponentType<{ className?: string }>;
  title?: string;
  subtitle?: string;
  quickActions?: QuickAction[];
  features?: Feature[];
  sectionTitle?: string;
  sectionIcon?: React.ComponentType<{ className?: string }>;
  shortcutHint?: string;
  shortcutKeys?: string;
  onQuickAction?: (action: string) => void;
  columns?: number;
  style?: WelcomeScreenStyle;
  logoGradient?: string;
  logoShadow?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────

import { Sparkles } from 'lucide-react';

export function WelcomeScreen({
  logoIcon: LogoIcon,
  title = 'Welcome',
  subtitle,
  quickActions = [],
  features = [],
  sectionTitle = 'Quick Actions',
  sectionIcon: SectionIcon = Sparkles,
  shortcutHint,
  shortcutKeys = 'Ctrl+K',
  onQuickAction,
  columns = 2,
  style = DARK_STYLE,
  logoGradient = 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  logoShadow = '0 10px 40px rgba(59, 130, 246, 0.25)',
  className = '',
}: WelcomeScreenProps) {
  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${className}`} style={{ backgroundColor: style.background }}>
      {/* Logo & Title */}
      {title && (
        <div className="mb-8">
          {LogoIcon && (
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: logoGradient, boxShadow: logoShadow }}>
              <LogoIcon className="w-10 h-10 text-white" />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-2" style={{ color: style.title }}>{title}</h1>
          {subtitle && <p className="text-lg" style={{ color: style.subtitle }}>{subtitle}</p>}
        </div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div className="flex gap-8 mb-12">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: style.featureIconBg }}>
                <feature.icon className="w-5 h-5" style={{ color: feature.iconColor || style.actionHoverTitle }} />
              </div>
              <div className="text-sm font-medium" style={{ color: style.featureTitle }}>{feature.title}</div>
              <div className="text-xs" style={{ color: style.featureDesc }}>{feature.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-sm font-medium mb-4 flex items-center justify-center gap-2" style={{ color: style.sectionTitle }}>
            <SectionIcon className="w-4 h-4" style={{ color: style.sectionIcon }} />
            {sectionTitle}
          </h2>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => onQuickAction?.(action.action)}
                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                style={{
                  border: `1px solid ${action.border || style.actionBorder}`,
                  cursor: 'pointer',
                  background: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = style.actionHoverTitle + '40';
                  e.currentTarget.style.backgroundColor = style.actionHoverBg;
                  const t = e.currentTarget.querySelector('.wa-title');
                  if (t) t.style.color = style.actionHoverTitle;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = action.border || style.actionBorder;
                  e.currentTarget.style.backgroundColor = 'transparent';
                  const t = e.currentTarget.querySelector('.wa-title');
                  if (t) t.style.color = style.actionTitle;
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: action.bgClass || style.actionHoverBg }}>
                  <action.icon className="w-5 h-5" style={{ color: action.colorClass || style.actionHoverTitle }} />
                </div>
                <div>
                  <div className="font-medium wa-title" style={{ color: style.actionTitle }}>{action.title}</div>
                  {action.subtitle && <div className="text-xs" style={{ color: style.actionSubtitle }}>{action.subtitle}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shortcut hint */}
      {shortcutHint && (
        <div className="mt-12 text-xs" style={{ color: style.hint }}>
          {shortcutHint} <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: style.kbdBg, color: style.kbdText }}>{shortcutKeys}</kbd>
        </div>
      )}
    </div>
  );
}

export default WelcomeScreen;
