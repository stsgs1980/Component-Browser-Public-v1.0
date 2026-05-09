"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * AnimatedCounter — eased count-up on scroll.
 * When the element enters the viewport the displayed number animates
 * from 0 to the target `value` using a cubic ease-out over 800 ms.
 * Non-numeric values are rendered as-is without animation.
 */
export function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: string;
  suffix?: string;
}) {
  const num = parseFloat(value);
  const isNumeric = !isNaN(num);
  const [display, setDisplay] = useState(isNumeric ? "0" : value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!inView || !isNumeric || animatedRef.current) return;
    animatedRef.current = true;

    const duration = 800;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // cubic ease-out: 1 - (1 - t)³
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;

      if (Number.isInteger(num)) {
        setDisplay(Math.round(current).toString());
      } else {
        setDisplay(current.toFixed(1));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };
    requestAnimationFrame(animate);
  }, [inView, value, num, isNumeric]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
