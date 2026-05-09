"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Eye, Search, Zap, Trophy, BookOpen, XCircle, type LucideIcon } from "lucide-react";

/** Shape of an achievement item passed to the toast. */
export interface Achievement {
  /** Lookup key used to pick an icon (e.g. "EYE", "TRO", "ZAP"). */
  icon: string;
  /** Display name. */
  name: string;
  /** Short description. */
  desc: string;
}

/**
 * AchievementToast — auto-dismissing toast notification.
 * Slides in from below, auto-dismisses after 4 s, or can be
 * closed manually via the × button.
 */
export function AchievementToast({
  achievement,
  onDismiss,
  durationMs = 4000,
}: {
  achievement: Achievement;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  const iconMap: Record<string, LucideIcon> = {
    EYE: Eye,
    MAG: Search,
    ZAP: Zap,
    TRO: Trophy,
    BOK: BookOpen,
  };
  const Comp = iconMap[achievement.icon] || Award;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      className="fixed top-20 right-6 z-[70] p-4 w-72"
      style={{
        background: "rgba(20,20,20,0.92)",
        border: "1px solid #262626",
        backdropFilter: "blur(12px)",
        borderRadius: 6,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="size-8 shrink-0 flex items-center justify-center"
          style={{ background: "#0f0f0f", border: "1px solid #262626", borderRadius: 4 }}
        >
          <Comp className="size-4 text-[#fbbf24]" />
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="text-[9px] text-[#fbbf24] uppercase tracking-widest mb-0.5"
            style={{ fontFamily: "monospace" }}
          >
            Achievement Unlocked
          </p>
          <p className="text-sm font-bold text-[#d4d4d4]">{achievement.name}</p>
          <p className="text-[10px] text-[#8a8a8a]">{achievement.desc}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#666666] hover:text-[#8a8a8a] transition-colors"
        >
          <XCircle className="size-3" />
        </button>
      </div>
    </motion.div>
  );
}
