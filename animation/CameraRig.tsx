'use client';

import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';

/**
 * CameraRig - A configurable orbital camera controller for R3F scenes.
 *
 * Wraps drei's OrbitControls with sensible defaults and exposes common
 * configuration as typed props. Supports auto-rotation, damping, and
 * polar angle clamping for constrained orbit behavior.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <YourScene />
 *   <CameraRig
 *     autoRotate
 *     autoRotateSpeed={0.8}
 *     targetY={5}
 *     minDistance={5}
 *     maxDistance={40}
 *   />
 * </Canvas>
 * ```
 */
export interface CameraRigProps {
  /** Whether the camera auto-rotates around the target. Default: false */
  autoRotate?: boolean;
  /** Speed of auto-rotation. Default: 0.5 */
  autoRotateSpeed?: number;
  /** Y position of the orbit target (vertical center of interest). Default: 0 */
  targetY?: number;
  /** Minimum zoom distance. Default: 3 */
  minDistance?: number;
  /** Maximum zoom distance. Default: 30 */
  maxDistance?: number;
  /** Minimum polar angle in radians (top limit). Default: Math.PI * 0.1 */
  minPolarAngle?: number;
  /** Maximum polar angle in radians (bottom limit). Default: Math.PI * 0.85 */
  maxPolarAngle?: number;
  /** Damping factor for inertia (0 = no damping, 1 = full damping). Default: 0.05 */
  dampingFactor?: number;
}

export function CameraRig({
  autoRotate = false,
  autoRotateSpeed = 0.5,
  targetY = 0,
  minDistance = 3,
  maxDistance = 30,
  minPolarAngle = Math.PI * 0.1,
  maxPolarAngle = Math.PI * 0.85,
  dampingFactor = 0.05,
}: CameraRigProps) {
  const controlsRef = useRef<any>(null);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={dampingFactor}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      target={[0, targetY, 0]}
    />
  );
}
