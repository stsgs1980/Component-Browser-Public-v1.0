"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * AnimatedProgressBar — InView progress bar.
 * Renders a track with a fill bar whose width animates from 0 % to
 * `(value / max) * 100 %` the first time it enters the viewport.
 */
export function AnimatedProgressBar({
  value,
  max,
  className = "",
  fillClassName = "",
}: {
  value: number;
  max: number;
  className?: string;
  fillClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: "100%", background: "#1c1c1c", borderRadius: 2, height: 6 }}
    >
      <div
        className={fillClassName}
        style={{
          width: inView ? `${pct}%` : "0%",
          height: "100%",
          background: "#ff6b2b",
          borderRadius: 2,
          transition: "width 0.6s ease-out",
        }}
      />
    </div>
  );
}
