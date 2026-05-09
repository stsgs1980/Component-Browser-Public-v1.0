'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * WeatherParticles - Animated instanced particles driven by a data array.
 *
 * Renders floating particles at specified 3D positions with per-particle
 * animation parameters. Each particle drifts, oscillates, and scales based
 * on its impact value, phase, and speed. Ideal for visualizing event
 * impact, density maps, or atmospheric effects.
 *
 * @example
 * ```tsx
 * const points = [
 *   { x: 1.2, y: 3.4, z: -0.5, impact: 80, phase: 0.0, speed: 0.5 },
 *   { x: -0.8, y: 2.1, z: 1.0, impact: 45, phase: 1.5, speed: 0.3 },
 * ];
 *
 * <Canvas>
 *   <WeatherParticles
 *     points={points}
 *     color="#FF6B35"
 *     emissiveColor="#FF4500"
 *   />
 * </Canvas>
 * ```
 */
export interface ParticlePoint {
  /** X position in world space */
  x: number;
  /** Y position in world space */
  y: number;
  /** Z position in world space */
  z: number;
  /** Impact intensity (0-100+). Higher values produce larger particles. */
  impact: number;
  /** Phase offset for sinusoidal animation (radians) */
  phase: number;
  /** Speed multiplier for animation */
  speed: number;
}

export interface WeatherParticlesProps {
  /** Array of particle data points defining position and animation params */
  points: ParticlePoint[];
  /** Base color of each particle. Default: '#FF6B35' */
  color?: string;
  /** Emissive glow color. Default: '#FF4500' */
  emissiveColor?: string;
}

export function WeatherParticles({
  points,
  color = '#FF6B35',
  emissiveColor = '#FF4500',
}: WeatherParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const count = points.length;

  useFrame((state) => {
    if (!meshRef.current || count === 0) return;
    const time = state.clock.elapsedTime;
    const dummy = dummyRef.current;

    points.forEach((p, i) => {
      // Float upward gently, oscillate horizontally
      const floatY = p.y + Math.sin(time * p.speed + p.phase) * 0.08;
      const floatX = p.x + Math.cos(time * p.speed * 0.7 + p.phase) * 0.04;
      const floatZ = p.z + Math.sin(time * p.speed * 0.5 + p.phase) * 0.04;
      dummy.position.set(floatX, floatY, floatZ);
      // Size scales with impact, pulses gently
      const baseScale = 0.02 + (p.impact / 100) * 0.04;
      const pulseScale = baseScale + Math.sin(time * 2 + p.phase) * 0.005;
      dummy.scale.setScalar(pulseScale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={0.6}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  );
}
