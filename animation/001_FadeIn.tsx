"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * FadeIn — scroll-triggered fade animation wrapper.
 * Content starts invisible (opacity 0, slight y-offset) and fades in
 * once the element enters the viewport (IntersectionObserver via framer-motion).
 */
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.2, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
