/**
 * @file GlitchBlock — A reusable React component that renders a glitch-aesthetic
 *        text block with RGB split, noise overlay, scan lines, binary decoration,
 *        and configurable tag badges.
 *
 * @author Generated
 * @since 2024
 *
 * @example
 * ```tsx
 * import GlitchBlock from './004_GlitchBlock';
 *
 * <GlitchBlock
 *   text="ERROR"
 *   glitchInterval={3000}
 *   glitchDuration={250}
 *   redColor="#ff0040"
 *   blueColor="#00ffff"
 *   tags={[
 *     { text: 'BUG', color: '#ff3333' },
 *     { text: '404', color: '#33ffcc' },
 *   ]}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Shape of a single tag badge rendered below the glitch text.
 */
interface GlitchTag {
  /** Label shown inside the badge. */
  text: string;
  /** Badge background / accent colour. */
  color: string;
}

/**
 * Props accepted by the {@link GlitchBlock} component.
 */
interface GlitchBlockProps {
  /** Main display text rendered with the glitch effect. @default 'GLITCH' */
  text?: string;

  /**
   * How often (ms) the glitch animation fires.
   * A `setInterval` is created with this value.
   * @default 2500
   */
  glitchInterval?: number;

  /**
   * Duration (ms) of a single glitch burst.
   * After this many milliseconds the glitch state resets to idle.
   * @default 200
   */
  glitchDuration?: number;

  /** CSS colour applied to the red / left-shifted text layer. @default '#ff0040' */
  redColor?: string;

  /** CSS colour applied to the blue / right-shifted text layer. @default '#00ffff' */
  blueColor?: string;

  /** Background colour of the outer wrapper. @default '#0a0a0a' */
  bgColor?: string;

  /** Tag badges displayed below the main text. @default see source */
  tags?: Array<GlitchTag>;

  /** Lines of binary / hex decoration rendered above the main text. @default see source */
  binaryLines?: string[];

  /** When `true` an SVG `feTurbulence` noise texture is overlaid. @default true */
  showNoise?: boolean;

  /** When `true` coloured horizontal bars sweep across during glitch. @default true */
  showGlitchLines?: boolean;

  /** When `true` a rainbow-gradient separator line is rendered below the text. @default true */
  showRainbowLine?: boolean;

  /** Optional extra class names forwarded to the outermost `<div>`. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_TAGS: Array<GlitchTag> = [
  { text: 'D4T4_C0RR', color: '#ff0040' },
  { text: 'ERR:0xFF', color: '#00ffff' },
  { text: 'S3GM3NT', color: '#ff00ff' },
];

const DEFAULT_BINARY_LINES = [
  '01110011 01010100 00110001 11010010',
  '10010110 00111010 11100101 01001011',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Return a random integer in `[min, max]`. */
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * `GlitchBlock` — a self-contained glitch-aesthetic widget.
 *
 * **Visual features:**
 * - RGB split via three stacked text layers (`mix-blend-mode: screen`)
 * - Periodic glitch burst driven by `setInterval` + `setTimeout`
 * - Text skew / translate jitter during the glitch state
 * - Horizontal coloured scan-lines
 * - SVG `feTurbulence` noise overlay
 * - Decorative binary / hex data lines
 * - Rainbow gradient separator bar
 * - Configurable tag badges with pill styling
 *
 * **Performance notes:**
 * - All animation is CSS-transition–driven; only class toggling happens in JS.
 * - The noise SVG is static (re-renders only when `showNoise` changes).
 *
 * @param props - {@link GlitchBlockProps}
 * @returns The rendered glitch block element.
 */
const GlitchBlock: React.FC<GlitchBlockProps> = ({
  text = 'GLITCH',
  glitchInterval = 2500,
  glitchDuration = 200,
  redColor = '#ff0040',
  blueColor = '#00ffff',
  bgColor = '#0a0a0a',
  tags = DEFAULT_TAGS,
  binaryLines = DEFAULT_BINARY_LINES,
  showNoise = true,
  showGlitchLines = true,
  showRainbowLine = true,
  className,
}) => {
  /* ---- state ---- */
  const [glitching, setGlitching] = useState<boolean>(false);
  const [skewX, setSkewX] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);
  const [lineOffsets, setLineOffsets] = useState<number[]>([]);

  /* ---- glitch trigger (setInterval) ---- */
  const fireGlitch = useCallback(() => {
    setGlitching(true);
    setSkewX(rand(-12, 12));
    setTranslateX(rand(-6, 6));

    // Compute random vertical offsets for the horizontal glitch bars
    if (showGlitchLines) {
      setLineOffsets(
        Array.from({ length: rand(2, 5) }, () => rand(5, 95)),
      );
    }

    const timeout = setTimeout(() => {
      setGlitching(false);
      setSkewX(0);
      setTranslateX(0);
      setLineOffsets([]);
    }, glitchDuration);

    return () => clearTimeout(timeout);
  }, [glitchDuration, showGlitchLines]);

  useEffect(() => {
    const id = setInterval(() => {
      fireGlitch();
    }, glitchInterval);
    return () => clearInterval(id);
  }, [glitchInterval, fireGlitch]);

  /* ---- inline styles ---- */
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    backgroundColor: bgColor,
    padding: '2.5rem 2rem',
    fontFamily:
      "'Fira Code', 'SF Mono', 'Consolas', 'Menlo', 'Courier New', monospace",
    overflow: 'hidden',
    color: '#fff',
    borderRadius: 4,
    border: `1px solid ${glitching ? redColor : '#222'}`,
    transition: 'border-color 0.1s ease',
  };

  const textContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    transform: glitching
      ? `skewX(${skewX}deg) translateX(${translateX}px)`
      : 'skewX(0deg) translateX(0)',
    transition: 'transform 0.08s ease',
  };

  const textStyle: React.CSSProperties = {
    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
    fontWeight: 900,
    letterSpacing: '0.08em',
    margin: 0,
    lineHeight: 1.1,
    position: 'relative',
  };

  const layerBase: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    mixBlendMode: 'screen' as const,
    pointerEvents: 'none',
    opacity: glitching ? 0.9 : 0,
    transition: 'opacity 0.1s ease',
  };

  const redLayerStyle: React.CSSProperties = {
    ...layerBase,
    color: redColor,
    transform: glitching ? 'translate(-3px, -1px)' : 'translate(0)',
    transition: 'opacity 0.1s ease, transform 0.08s ease',
  };

  const blueLayerStyle: React.CSSProperties = {
    ...layerBase,
    color: blueColor,
    transform: glitching ? 'translate(3px, 1px)' : 'translate(0)',
    transition: 'opacity 0.1s ease, transform 0.08s ease',
  };

  const binaryContainerStyle: React.CSSProperties = {
    marginBottom: '0.75rem',
    opacity: 0.45,
    fontSize: '0.65rem',
    letterSpacing: '0.15em',
    lineHeight: 1.6,
    overflow: 'hidden',
    userSelect: 'none',
  };

  const tagContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginTop: '1.25rem',
  };

  const rainbowLineStyle: React.CSSProperties = {
    height: 3,
    marginTop: '1.25rem',
    borderRadius: 2,
    background:
      'linear-gradient(90deg, #ff0040, #ff8000, #ffff00, #00ff40, #00ffff, #0040ff, #ff00ff, #ff0040)',
    backgroundSize: '200% 100%',
    animation: 'glitch-rainbow-slide 3s linear infinite',
  };

  /* ---- render ---- */
  return (
    <div className={className} style={wrapperStyle}>
      {/* ---- SVG noise overlay ---- */}
      {showNoise && (
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: glitching ? 0.08 : 0.04,
            transition: 'opacity 0.15s ease',
          }}
        >
          <filter id="glitch-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves={4}
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#glitch-noise)" />
        </svg>
      )}

      {/* ---- Horizontal glitch lines ---- */}
      {showGlitchLines &&
        glitching &&
        lineOffsets.map((top, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${top}%`,
              height: rand(1, 3),
              backgroundColor:
                i % 2 === 0 ? redColor : blueColor,
              opacity: 0.6,
              pointerEvents: 'none',
            }}
          />
        ))}

      {/* ---- Binary decoration ---- */}
      <div style={binaryContainerStyle} aria-hidden="true">
        {binaryLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* ---- Main glitch text ---- */}
      <div style={textContainerStyle}>
        {/* Base layer (white) */}
        <span style={textStyle} data-text={text}>
          {text}
        </span>

        {/* Red channel (left-shifted) */}
        <span style={redLayerStyle} aria-hidden="true">
          {text}
        </span>

        {/* Blue channel (right-shifted) */}
        <span style={blueLayerStyle} aria-hidden="true">
          {text}
        </span>
      </div>

      {/* ---- Rainbow gradient separator ---- */}
      {showRainbowLine && (
        <div style={rainbowLineStyle} aria-hidden="true" />
      )}

      {/* ---- Tags ---- */}
      <div style={tagContainerStyle}>
        {tags.map((tag, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              padding: '0.2em 0.65em',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              borderRadius: 3,
              border: `1px solid ${tag.color}`,
              color: tag.color,
              backgroundColor: `${tag.color}18`,
              userSelect: 'none',
            }}
          >
            {tag.text}
          </span>
        ))}
      </div>

      {/* ---- Keyframes (injected once) ---- */}
      <style>{`
        @keyframes glitch-rainbow-slide {
          0%   { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export default GlitchBlock;
export { GlitchBlock };
