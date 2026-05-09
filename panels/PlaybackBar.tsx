'use client';

/**
 * PlaybackBar — A fixed-bottom transport bar for stepping through a sequence
 * of items (e.g. time-series candles). Provides play/pause, skip, speed control,
 * a seek slider, and a date label.
 *
 * @example
 * ```tsx
 * <PlaybackBar
 *   totalItems={200}
 *   currentIndex={87}
 *   isPlaying={true}
 *   speed={2}
 *   dateLabel="Jan 15, 2025"
 *   onPlay={() => setIsPlaying(true)}
 *   onPause={() => setIsPlaying(false)}
 *   onReset={() => setIndex(0)}
 *   onSeek={(i) => setIndex(i)}
 *   onSpeedChange={(s) => setSpeed(s)}
 * />
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
// lucide-react dependency: import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind, RotateCcw } from 'lucide-react'
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind, RotateCcw } from 'lucide-react';
// shadcn/ui dependency: import { Button } from '@/components/ui/button'
/* Using a plain <button> styled to look like a shadcn Button — replace with <Button variant="ghost" size="sm"> if shadcn/ui is available */

type PlaybackSpeed = 0.5 | 1 | 2 | 4 | 8;

export interface PlaybackBarProps {
  /** Total number of items in the sequence. */
  totalItems: number;
  /** Index of the currently visible item. */
  currentIndex: number;
  /** Whether playback is currently running. */
  isPlaying: boolean;
  /** Current playback speed multiplier. */
  speed: number;
  /** Optional date label shown between controls. */
  dateLabel?: string;
  /** Called when the user presses Play. */
  onPlay?: () => void;
  /** Called when the user presses Pause. */
  onPause?: () => void;
  /** Called when the user presses Reset (go to index 0 and pause). */
  onReset?: () => void;
  /** Called when the user drags the seek slider or clicks skip buttons. */
  onSeek?: (index: number) => void;
  /** Called when the user cycles playback speed. */
  onSpeedChange?: (speed: number) => void;
}

/** Ghost-style button used throughout the bar (mimics shadcn Button ghost). */
function GhostButton({
  onClick,
  children,
  className = '',
  active = false,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-7 w-7 p-0 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-colors ${active ? 'h-8 w-8 text-amber-400 border border-amber-500/20 hover:text-amber-300 hover:bg-amber-400/10' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function PlaybackBar(props: PlaybackBarProps) {
  const {
    totalItems,
    currentIndex,
    isPlaying,
    speed,
    dateLabel,
    onPlay,
    onPause,
    onReset,
    onSeek,
    onSpeedChange,
  } = props;

  const progress = totalItems > 0 ? (currentIndex / totalItems) * 100 : 0;

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  }, [isPlaying, onPlay, onPause]);

  const cycleSpeed = useCallback(() => {
    const speeds: PlaybackSpeed[] = [0.5, 1, 2, 4, 8];
    const currentIdx = speeds.indexOf(speed as PlaybackSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    onSpeedChange?.(speeds[nextIdx]);
  }, [speed, onSpeedChange]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[600px] max-w-[90vw] animate-in fade-in slide-in-from-bottom-10">
      <div className="bg-gray-950/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
        {/* Progress bar */}
        <div className="relative mb-2">
          <input
            type="range"
            min={0}
            max={totalItems}
            value={currentIndex}
            onChange={(e) => onSeek?.(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-white/[0.06] rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400
              [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:shadow-amber-400/30
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${progress}%, rgba(255,255,255,0.06) ${progress}%, rgba(255,255,255,0.06) 100%)`,
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <GhostButton onClick={onReset}>
              <RotateCcw className="w-3.5 h-3.5" />
            </GhostButton>
            <GhostButton onClick={() => onSeek?.(Math.max(0, currentIndex - 10))}>
              <Rewind className="w-3.5 h-3.5" />
            </GhostButton>
            <GhostButton onClick={() => onSeek?.(Math.max(0, currentIndex - 1))}>
              <SkipBack className="w-3.5 h-3.5" />
            </GhostButton>
            <GhostButton onClick={handlePlayToggle} active>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </GhostButton>
            <GhostButton onClick={() => onSeek?.(Math.min(totalItems, currentIndex + 1))}>
              <SkipForward className="w-3.5 h-3.5" />
            </GhostButton>
            <GhostButton onClick={() => onSeek?.(Math.min(totalItems, currentIndex + 10))}>
              <FastForward className="w-3.5 h-3.5" />
            </GhostButton>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="tabular-nums">
              {currentIndex} / {totalItems}
            </span>
            <span className="text-gray-600">|</span>
            <span>{dateLabel ?? ''}</span>
          </div>

          <button
            onClick={cycleSpeed}
            className="h-7 px-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-500/20 rounded-md transition-colors"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
}
