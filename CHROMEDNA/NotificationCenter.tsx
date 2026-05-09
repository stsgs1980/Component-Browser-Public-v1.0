'use client';

/**
 * NotificationCenter — A dropdown panel that displays a list of notification items
 * with severity colouring, read/unread state, and actions for marking read,
 * dismissing individual notifications, or clearing all.
 *
 * @example
 * ```tsx
 * <NotificationCenter
 *   notifications={[
 *     { id: '1', icon: <AlertIcon />, title: 'Price Surge', description: '...', timestamp: new Date(), severity: 'warning', read: false },
 *   ]}
 *   onMarkAllRead={() => markAllRead()}
 *   onDismiss={(id) => dismiss(id)}
 *   onClearAll={() => clearAll()}
 * />
 * ```
 */

import { useState, useMemo, useCallback } from 'react';
// lucide-react dependency: import { Bell, CheckCheck, X } from 'lucide-react'
import { Bell, CheckCheck, X } from 'lucide-react';
// shadcn/ui dependency: import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
// shadcn/ui dependency: import { Button } from '@/components/ui/button'
// shadcn/ui dependency: import { ScrollArea } from '@/components/ui/scroll-area'
/* Using plain HTML elements styled to match shadcn/ui — replace with the shadcn components if available */

/** Severity levels for notification items. */
export type Severity = 'info' | 'warning' | 'critical';

/** A single notification item. */
export interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: Date;
  severity: Severity;
  read: boolean;
}

export interface NotificationCenterProps {
  /** The list of notifications to display. */
  notifications: NotificationItem[];
  /** Called when the user clicks "Mark all read". */
  onMarkAllRead?: () => void;
  /** Called with a notification id when the user dismisses it. */
  onDismiss?: (id: string) => void;
  /** Called when the user clears all notifications. */
  onClearAll?: () => void;
}

function severityColors(severity: Severity) {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400', text: 'text-red-400' };
    case 'warning':
      return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400', text: 'text-amber-400' };
    case 'info':
      return { bg: 'bg-gray-500/10', border: 'border-gray-500/20', dot: 'bg-gray-400', text: 'text-gray-400' };
  }
}

/** Relative time string (e.g. "3m ago", "2h ago"). */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationCenter(props: NotificationCenterProps) {
  const { notifications, onMarkAllRead, onDismiss, onClearAll } = props;
  const [open, setOpen] = useState(false);

  // Internal read/dismiss tracking (component-local state)
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const effectiveNotifications = useMemo(() => {
    return notifications
      .filter((a) => !dismissedIds.has(a.id))
      .map((a) => ({ ...a, read: a.read || readIds.has(a.id) }))
      .slice(0, 20);
  }, [notifications, readIds, dismissedIds]);

  const unreadCount = useMemo(() => effectiveNotifications.filter((n) => !n.read).length, [effectiveNotifications]);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      effectiveNotifications.forEach((n) => next.add(n.id));
      return next;
    });
    onMarkAllRead?.();
  }, [effectiveNotifications, onMarkAllRead]);

  const dismissNotification = useCallback(
    (id: string) => {
      setDismissedIds((prev) => new Set(prev).add(id));
      onDismiss?.(id);
    },
    [onDismiss],
  );

  const clearAll = useCallback(() => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      effectiveNotifications.forEach((n) => next.add(n.id));
      return next;
    });
    onClearAll?.();
  }, [effectiveNotifications, onClearAll]);

  return (
    <div className="relative inline-block">
      {/* Trigger button — styled as shadcn Button ghost */}
      <button
        onClick={() => setOpen(!open)}
        className="relative h-8 w-8 p-0 rounded-md border border-white/[0.06] bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/10 hover:border-amber-500/20 transition-all duration-200"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white px-0.5 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Invisible backdrop to close */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1 z-50 w-[340px] bg-gray-950/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list — replaces shadcn ScrollArea */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {effectiveNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                  <Bell className="w-6 h-6 mb-2 opacity-30" />
                  <span className="text-xs">No notifications</span>
                </div>
              ) : (
                <div className="p-1.5 space-y-1">
                  {effectiveNotifications.map((notif) => {
                    const colors = severityColors(notif.severity);
                    return (
                      <div
                        key={notif.id}
                        className={`group relative flex gap-2.5 rounded-lg px-3 py-2.5 transition-all duration-200 ${colors.bg} border ${colors.border} ${!notif.read ? 'ring-1 ring-inset ring-amber-500/10' : ''}`}
                      >
                        {!notif.read && (
                          <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        )}
                        <div className="flex-shrink-0 mt-0.5 ml-1">{notif.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <span className={`text-[11px] font-semibold leading-tight ${notif.read ? 'text-gray-400' : 'text-gray-200'}`}>
                              {notif.title}
                            </span>
                            <button
                              onClick={() => dismissNotification(notif.id)}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-gray-600 hover:text-gray-400" />
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                            {notif.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-gray-600">{timeAgo(notif.timestamp)}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${colors.text}`}>
                              {notif.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clear all footer */}
            {effectiveNotifications.length > 0 && (
              <div className="border-t border-white/[0.06] px-4 py-2">
                <button
                  onClick={clearAll}
                  className="w-full text-center text-[10px] text-gray-600 hover:text-gray-400 transition-colors py-1"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
