// Project: Web Aesthetic Showcase v3.0
// Category: components
// Source: showcases\Web Aesthetic Showcase v3.0\src\components
// Lines: 475

'use client';

import { useCallback, useState } from 'react';
import { useSyncExternalStore, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Plus, Minus } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SoundType = 'key' | 'hover' | 'click' | 'scroll' | 'success';

interface SoundContextValue {
  soundEnabled: boolean;
  playSound: (type: SoundType) => void;
  volume: number;
  setVolume: (v: number) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const SoundContext = createContext<SoundContextValue>({
  soundEnabled: false,
  playSound: () => {},
  volume: 1,
  setVolume: () => {},
});

export function useSound() {
  return useContext(SoundContext);
}

// ---------------------------------------------------------------------------
// SSR-safe mounted hook (matches ThemeToggle pattern)
// ---------------------------------------------------------------------------

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY_ENABLED = 'sound-effects-enabled';
const STORAGE_KEY_VOLUME = 'sound-effects-volume';
const VOLUME_STEPS = [0.5, 1, 1.5] as const;

// No-op subscriber placeholder – actual subscribers are created per-hook
function createSubscribe(channel: string) {
  return (onStoreChange: () => void) => {
    const handler = () => onStoreChange();
    window.addEventListener(channel, handler);
    return () => window.removeEventListener(channel, handler);
  };
}

const SOUND_ENABLED_CHANGE = 'sound-enabled-change';
const SOUND_VOLUME_CHANGE = 'sound-volume-change';

function readEnabledFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_ENABLED) === 'true';
  } catch {
    return false;
  }
}

function writeEnabledToStorage(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_ENABLED, String(v));
  } catch {
    /* ignore */
  }
}

function readVolumeFromStorage(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOLUME);
    const n = parseFloat(raw ?? '');
    return VOLUME_STEPS.includes(n as (typeof VOLUME_STEPS)[number]) ? n : 1;
  } catch {
    return 1;
  }
}

function writeVolumeToStorage(v: number) {
  try {
    localStorage.setItem(STORAGE_KEY_VOLUME, String(v));
  } catch {
    /* ignore */
  }
}

/**
 * useSyncExternalStore-based localStorage hook.
 * Server snapshot always returns `serverFallback`; client snapshot reads
 * from localStorage.  This avoids hydration mismatches without needing
 * useEffect + setState.
 */
function useLocalStorageBoolean(
  read: () => boolean,
  write: (v: boolean) => void,
  serverFallback: boolean,
  channel: string
): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(createSubscribe(channel), read, () => serverFallback);
  const setValue = useCallback(
    (v: boolean) => {
      write(v);
      window.dispatchEvent(new Event(channel));
    },
    [write, channel]
  );
  return [value, setValue];
}

function useLocalStorageNumber(
  read: () => number,
  write: (v: number) => void,
  serverFallback: number,
  channel: string
): [number, (v: number) => void] {
  const value = useSyncExternalStore(createSubscribe(channel), read, () => serverFallback);
  const setValue = useCallback(
    (v: number) => {
      write(v);
      window.dispatchEvent(new Event(channel));
    },
    [write, channel]
  );
  return [value, setValue];
}

// ---------------------------------------------------------------------------
// Sound engine – lazily creates AudioContext on first user interaction
// ---------------------------------------------------------------------------

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Terminal key click – short sine wave beep */
  playKey(multiplier: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 440;

    gain.gain.setValueAtTime(0.03 * multiplier, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /** Button hover – soft noise burst */
  playHover(multiplier: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.01; // 10 ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02 * multiplier;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);

    source.connect(gain).connect(ctx.destination);
    source.start(now);
  }

  /** Button click – short low thud */
  playClick(multiplier: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 100;

    gain.gain.setValueAtTime(0.04 * multiplier, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /** Section scroll – soft whoosh (white noise fade in/out) */
  playScroll(multiplier: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const duration = 0.15;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.01 * multiplier, now + duration * 0.4);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);

    source.connect(gain).connect(ctx.destination);
    source.start(now);
  }

  /** Success sound – two-note ascending chime */
  playSuccess(multiplier: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const playNote = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.03 * multiplier, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.08);
    };

    playNote(523, now);       // C5
    playNote(659, now + 0.1); // E5
  }

  play(type: SoundType, volumeMultiplier: number) {
    switch (type) {
      case 'key':
        this.playKey(volumeMultiplier);
        break;
      case 'hover':
        this.playHover(volumeMultiplier);
        break;
      case 'click':
        this.playClick(volumeMultiplier);
        break;
      case 'scroll':
        this.playScroll(volumeMultiplier);
        break;
      case 'success':
        this.playSuccess(volumeMultiplier);
        break;
    }
  }
}

// Singleton engine
const engine = new SoundEngine();

// ---------------------------------------------------------------------------
// Volume sub-component
// ---------------------------------------------------------------------------

function VolumeControl({
  volume,
  onChange,
}: {
  volume: number;
  onChange: (v: number) => void;
}) {
  const currentIndex = VOLUME_STEPS.indexOf(volume as (typeof VOLUME_STEPS)[number]);

  const cycleUp = useCallback(() => {
    const next = (currentIndex + 1) % VOLUME_STEPS.length;
    onChange(VOLUME_STEPS[next]);
  }, [currentIndex, onChange]);

  const cycleDown = useCallback(() => {
    const prev = (currentIndex - 1 + VOLUME_STEPS.length) % VOLUME_STEPS.length;
    onChange(VOLUME_STEPS[prev]);
  }, [currentIndex, onChange]);

  return (
    <div className="flex items-center gap-0.5">
      <motion.button
        type="button"
        onClick={cycleDown}
        className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        whileTap={{ scale: 0.85 }}
        aria-label="Decrease volume"
      >
        <Minus className="w-3 h-3 text-white/70" />
      </motion.button>

      <span className="text-[10px] font-medium text-white/60 min-w-[24px] text-center select-none">
        {volume === 1 ? '1x' : `${volume}x`}
      </span>

      <motion.button
        type="button"
        onClick={cycleUp}
        className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        whileTap={{ scale: 0.85 }}
        aria-label="Increase volume"
      >
        <Plus className="w-3 h-3 text-white/70" />
      </motion.button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main SoundToggle component
// ---------------------------------------------------------------------------

export function SoundToggle() {
  const mounted = useMounted();
  const [soundEnabled, setSoundEnabled] = useLocalStorageBoolean(
    readEnabledFromStorage,
    writeEnabledToStorage,
    false,
    SOUND_ENABLED_CHANGE
  );
  const [volume, setVolume] = useLocalStorageNumber(
    readVolumeFromStorage,
    writeVolumeToStorage,
    1,
    SOUND_VOLUME_CHANGE
  );
  const [expanded, setExpanded] = useState(false);

  const toggleEnabled = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      engine.play('click', volume);
    }
  }, [soundEnabled, volume, setSoundEnabled]);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
  }, [setVolume]);

  const playSound = useCallback(
    (type: SoundType) => {
      if (soundEnabled) {
        engine.play(type, volume);
      }
    },
    [soundEnabled, volume]
  );

  // Context value
  const contextValue: SoundContextValue = {
    soundEnabled,
    playSound,
    volume,
    setVolume: handleVolumeChange,
  };

  // SSR skeleton
  if (!mounted) {
    return (
      <div className="fixed top-16 right-[68px] sm:top-6 sm:right-[68px] z-50 w-11 h-11 rounded-full bg-black/50 backdrop-blur-xl border border-white/10" />
    );
  }

  return (
    <SoundContext.Provider value={contextValue}>
      {/* Toggle button */}
      <motion.button
        onClick={() => {
          toggleEnabled();
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          setExpanded((p) => !p);
        }}
        className="fixed top-16 right-[68px] sm:top-6 sm:right-[68px] z-50 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer bg-black/50 backdrop-blur-xl border border-white/10 shadow-lg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{
          scale: 1.12,
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderColor: 'rgba(255,255,255,0.2)',
        }}
        whileTap={{ scale: 0.92 }}
        aria-label="Toggle sound effects"
      >
        <AnimatePresence mode="wait" initial={false}>
          {soundEnabled ? (
            <motion.div
              key="on"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Volume2 className="w-5 h-5 text-emerald-400" />
            </motion.div>
          ) : (
            <motion.div
              key="off"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <VolumeX className="w-5 h-5 text-white/50" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Volume popover */}
      <AnimatePresence>
        {expanded && soundEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[104px] right-6 sm:top-[72px] sm:right-6 z-50 flex items-center gap-2 px-2.5 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg"
          >
            <VolumeControl volume={volume} onChange={handleVolumeChange} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close volume popover when clicking outside */}
      {expanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setExpanded(false)}
          aria-hidden
        />
      )}
    </SoundContext.Provider>
  );
}
