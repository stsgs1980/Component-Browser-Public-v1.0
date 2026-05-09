'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AmbientGlowRing - A slowly rotating, pulsing translucent torus ring.
 *
 * Renders a large semi-transparent torus that slowly rotates and pulses
 * in opacity. Useful as an ambient decorative element around a central
 * focal point or as a framing ring in a 3D scene.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <AmbientGlowRing
 *     radius={4}
 *     color="#FFD700"
 *     opacity={0.08}
 *   />
 * </Canvas>
 * ```
 */
export interface AmbientGlowRingProps {
  /** Radius of the torus ring. Default: 3.7 */
  radius?: number;
  /** Color of the ring material. Default: '#FFD700' */
  color?: string;
  /** Base opacity of the ring (pulses around this value). Default: 0.06 */
  opacity?: number;
}

export function AmbientGlowRing({
  radius = 3.7,
  color = '#FFD700',
  opacity = 0.06,
}: AmbientGlowRingProps) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (materialRef.current) {
      // Pulse opacity between (opacity - 0.02) and (opacity + 0.02)
      materialRef.current.opacity = opacity + Math.sin(time * 0.5) * 0.02;
    }
    if (meshRef.current) {
      // Slow rotation
      meshRef.current.rotation.z = time * 0.05;
      meshRef.current.rotation.x = Math.sin(time * 0.03) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.15, 8, 64]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
