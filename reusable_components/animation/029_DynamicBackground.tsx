// Project: UI RADAR
// Category: components
// Source: design-systems\UI RADAR\src\components
// Lines: 507

"use client";

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface DynamicBackgroundProps {
  variant?: "hero" | "subtle" | "full";
  intensity?: "low" | "medium" | "high";
  showParticles?: boolean;
  showGrid?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Animated Gradient Background
// ============================================================================

function AnimatedGradient({ intensity = "medium" }: { intensity?: "low" | "medium" | "high" }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary gradient orb */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary gradient orb */}
      <motion.div
        className="absolute right-0 top-1/4 w-[600px] h-[600px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(217, 70, 239, 0.4) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, 80, 40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Tertiary gradient orb */}
      <motion.div
        className="absolute left-1/3 bottom-0 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -60, -30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />
    </div>
  );
}

// ============================================================================
// Animated Lines Background
// ============================================================================

function AnimatedLines() {
  // Fixed deterministic values - no random
  const dots = useMemo(() => {
    return [
      { cx: 120, cy: 130, r: 4, duration: 4 },
      { cx: 320, cy: 180, r: 5, duration: 3.5 },
      { cx: 520, cy: 230, r: 3, duration: 4.5 },
      { cx: 220, cy: 280, r: 6, duration: 3 },
      { cx: 420, cy: 330, r: 4, duration: 4 },
      { cx: 620, cy: 130, r: 5, duration: 3.5 },
      { cx: 170, cy: 380, r: 3, duration: 4.5 },
      { cx: 370, cy: 430, r: 4, duration: 3 },
      { cx: 570, cy: 180, r: 5, duration: 4 },
      { cx: 270, cy: 230, r: 3, duration: 3.5 },
    ];
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {/* Animated wave lines */}
        {[...Array(8)].map((_, i) => (
          <motion.path
            key={i}
            d={`M -100 ${200 + i * 80} Q ${300 + i * 50} ${150 + i * 30} ${600 + i * 40} ${250 + i * 50} T ${1200 + i * 30} ${200 + i * 40} T 2000 ${200 + i * 80}`}
            fill="none"
            stroke={i % 2 === 0 ? "url(#lineGradient1)" : "url(#lineGradient2)"}
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0.3, 0.6, 0.3],
              x: [0, 20, 0],
            }}
            transition={{
              pathLength: { duration: 3, ease: "easeInOut" },
              opacity: { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 8 + i, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Floating dots */}
        {dots.map((dot, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill={i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#ec4899" : "#06b6d4"}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// ============================================================================
// Grid Pattern
// ============================================================================

function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Perspective grid lines */}
      <motion.div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 100px,
              rgba(139, 92, 246, 0.3) 100px,
              rgba(139, 92, 246, 0.3) 101px
            )
          `,
        }}
        animate={{
          opacity: [0.03, 0.08, 0.03],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ============================================================================
// Floating Particles
// ============================================================================

function FloatingParticles({ count = 50 }: { count?: number }) {
  // Fixed deterministic positions - no random
  const particles = useMemo(() => {
    const colors = ["bg-violet-400", "bg-fuchsia-400", "bg-cyan-400", "bg-blue-400"];
    // Generate deterministic positions based on index
    return Array.from({ length: count }, (_, i) => {
      // Use simple math for deterministic values
      const xPos = ((i * 37) % 100);
      const yPos = ((i * 53) % 100);
      const sizeVal = ((i * 17) % 4) + 1;
      const durVal = ((i * 23) % 20) + 10;
      const delayVal = ((i * 11) % 5);
      
      return {
        id: i,
        x: xPos,
        y: yPos,
        size: sizeVal + 1,
        duration: durVal + 10,
        delay: delayVal,
        color: colors[i % 4],
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn(
            "absolute rounded-full",
            particle.color,
            "opacity-30"
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 15, 0, -15, 0],
            scale: [1, 1.2, 1, 0.8, 1],
            opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Noise Texture Overlay
// ============================================================================

function NoiseOverlay() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-[0.015]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ============================================================================
// Image Layer with Parallax
// ============================================================================

function ImageLayer({ 
  src, 
  alt, 
  opacity = 0.1, 
  parallaxSpeed = 0.5,
  className 
}: { 
  src: string; 
  alt: string; 
  opacity?: number;
  parallaxSpeed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${parallaxSpeed * 100}%`]);

  return (
    <motion.div 
      ref={ref}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ y }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ opacity }}
        priority={false}
      />
    </motion.div>
  );
}

// ============================================================================
// Main Dynamic Background Component
// ============================================================================

export function DynamicBackground({
  variant = "hero",
  intensity = "medium",
  showParticles = true,
  showGrid = true,
  className,
  children,
}: DynamicBackgroundProps) {
  const variantStyles = {
    hero: "min-h-screen",
    subtle: "min-h-[50vh]",
    full: "fixed inset-0",
  };

  return (
    <div className={cn("relative", variantStyles[variant], className)}>
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      
      {/* Animated gradient orbs */}
      <AnimatedGradient intensity={intensity} />
      
      {/* Animated lines */}
      <AnimatedLines />

      {/* Grid pattern */}
      {showGrid && <GridPattern />}

      {/* Floating particles */}
      {showParticles && <FloatingParticles count={intensity === "high" ? 80 : intensity === "medium" ? 50 : 25} />}

      {/* Noise texture */}
      <NoiseOverlay />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-gray-950/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/30 via-transparent to-gray-950/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}

// ============================================================================
// Hero Background with Multiple Layers
// ============================================================================

export function HeroBackground({ children }: { children?: React.ReactNode }) {
  return (
    <DynamicBackground variant="hero" intensity="high" showParticles showGrid>
      {children}
    </DynamicBackground>
  );
}

// ============================================================================
// Section Background
// ============================================================================

export function SectionBackground({ 
  children,
  variant = "subtle",
  className,
}: { 
  children?: React.ReactNode;
  variant?: "subtle" | "gradient" | "pattern";
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Gradient background */}
      {variant === "gradient" && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-gray-900 to-fuchsia-950/20" />
      )}
      
      {/* Pattern background */}
      {variant === "pattern" && (
        <>
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.5) 1px, transparent 0)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </>
      )}

      {/* Subtle gradient */}
      {variant === "subtle" && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Glow Effect Component
// ============================================================================

export function GlowEffect({ 
  children,
  color = "violet",
  intensity = "medium",
  className,
}: { 
  children: React.ReactNode;
  color?: "violet" | "cyan" | "pink" | "mixed";
  intensity?: "low" | "medium" | "high";
  className?: string;
}) {
  const colorMap = {
    violet: "rgba(139, 92, 246, 0.5)",
    cyan: "rgba(6, 182, 212, 0.5)",
    pink: "rgba(236, 72, 153, 0.5)",
    mixed: "rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3)",
  };

  const intensityMap = {
    low: 0.2,
    medium: 0.4,
    high: 0.6,
  };

  return (
    <div className={cn("relative", className)}>
      {/* Glow backdrop */}
      <div 
        className="absolute inset-0 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${colorMap[color]}, transparent 70%)`,
          opacity: intensityMap[intensity],
          transform: "scale(1.5)",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default DynamicBackground;
