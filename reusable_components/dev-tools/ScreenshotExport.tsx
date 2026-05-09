'use client';

/**
 * ScreenshotExport — A button that captures the first `<canvas>` element on the
 * page as a PNG and triggers a download. Includes a full-screen flash animation
 * and a confirmation checkmark on completion. Also listens for a custom
 * `chrome-dna-screenshot` DOM event so it can be triggered via keyboard shortcuts.
 *
 * @example
 * ```tsx
 * <ScreenshotExport filename="my-capture" />
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
// lucide-react dependency: import { Camera, Check } from 'lucide-react'
import { Camera, Check } from 'lucide-react';

export interface ScreenshotExportProps {
  /** Base filename for the downloaded PNG (without extension). Default: "screenshot". */
  filename?: string;
}

export function ScreenshotExport(props: ScreenshotExportProps) {
  const { filename = 'screenshot' } = props;
  const [isFlashing, setIsFlashing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const takeScreenshot = useCallback(() => {
    // Find the first canvas element on the page
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');

      // Generate filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fullFilename = `${filename}-${timestamp}.png`;

      // Create a download link and trigger it
      const link = document.createElement('a');
      link.download = fullFilename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Trigger flash animation
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 400);

      // Show confirmation checkmark
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 1500);
    } catch {
      // Canvas may be tainted or unavailable — silently fail
    }
  }, [filename]);

  // Listen for keyboard shortcut custom event
  useEffect(() => {
    const handler = () => takeScreenshot();
    window.addEventListener('chrome-dna-screenshot', handler);
    return () => window.removeEventListener('chrome-dna-screenshot', handler);
  }, [takeScreenshot]);

  return (
    <>
      {/* Screenshot button */}
      <button
        onClick={takeScreenshot}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-amber-400 hover:bg-white/[0.06] hover:border-amber-500/20 transition-all duration-200"
        title="Screenshot [S]"
      >
        {showConfirm ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Camera className="w-3 h-3" />
        )}
        <span className="text-[9px] font-medium tracking-wide">{showConfirm ? 'Saved!' : 'Screenshot'}</span>
      </button>

      {/* Full-screen flash overlay */}
      {isFlashing && (
        <div className="fixed inset-0 bg-white z-[200] pointer-events-none screenshot-flash" />
      )}
    </>
  );
}
