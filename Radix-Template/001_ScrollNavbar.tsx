// --- source: Radix-Template / page.tsx (lines 126-314) ---
// Scroll-aware sticky navbar with backdrop blur, mobile hamburger menu,
// theme toggle, CTA button, and animated entrance. Fully de-hardcoded.

'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
//  TYPES
// ============================================================

interface NavLink {
  label: string;
  href: string;
}

interface ScrollNavbarProps {
  /** Brand element (logo + name) */
  brand?: ReactNode;
  /** Navigation links */
  links: NavLink[];
  /** Right-side action buttons (theme toggle, icons, etc.) */
  actions?: ReactNode;
  /** CTA button (shown on desktop) */
  cta?: ReactNode;
  /** Scroll threshold in px to activate blur (default 20) */
  scrollThreshold?: number;
  /** Custom scrolled/unscrolled class pairs */
  scrolledClass?: string;
  unscrolledClass?: string;
  /** Mobile menu open state controlled externally */
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
  className?: string;
}

// ============================================================
//  HOOK: useScrolled — returns true when scrollY > threshold
// ============================================================

export function useScrolled(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}

// ============================================================
//  COMPONENT
// ============================================================

export function ScrollNavbar({
  brand, links, actions, cta,
  scrollThreshold = 20,
  scrolledClass, unscrolledClass = 'bg-transparent',
  className,
}: ScrollNavbarProps) {
  const scrolled = useScrolled(scrollThreshold);
  const [mobileOpen, setMobileOpen] = useState(false);

  const bgClass = scrolled
    ? scrolledClass || 'bg-background/80 backdrop-blur-xl border-b border-border'
    : unscrolledClass;

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', bgClass, className)}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          {brand && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              {brand}
            </motion.div>
          )}

          {/* Desktop links */}
          {links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hidden md:flex items-center gap-1"
            >
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}

          {/* Right side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            {actions}
            {cta && <div className="hidden sm:flex">{cta}</div>}
            {links.length > 0 && (
              <button
                className="md:hidden p-2 rounded-lg text-muted-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            )}
          </motion.div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
