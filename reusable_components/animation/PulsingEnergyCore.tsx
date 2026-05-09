'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PulsingEnergyCore - A glowing animated sphere with emissive pulsing and inner glow.
 *
 * Renders a central energy core with a pulsing scale, emissive intensity animation,
 * and a larger transparent inner glow sphere. Includes a point light for ambient
 * scene illumination. Useful as a central focal point or "reactor core" element.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <PulsingEnergyCore
 *     position={[0, 3, 0]}
 *     color="#F59E0B"
 *     emissiveColor="#FBBF24"
 *     baseRadius={0.3}
 *     pulseSpeed={2.0}
 *   />
 * </Canvas>
 * ```
 */
export interface PulsingEnergyCoreProps {
  /** Position of the core group [x, y, z]. Default: [0, 0, 0] */
  position?: [number, number, number];
  /** Main color of the core sphere. Default: '#F59E0B' */
  color?: string;
  /** Emissive color of the core sphere and inner glow. Default: '#FBBF24' */
  emissiveColor?: string;
  /** Base radius of the core sphere. Default: 0.25 */
  baseRadius?: number;
  /** Speed of the pulse animation (higher = faster pulsing). Default: 1.5 */
  pulseSpeed?: number;
}

export function PulsingEnergyCore({
  position = [0, 0, 0],
  color = '#F59E0B',
  emissiveColor = '#FBBF24',
  baseRadius = 0.25,
  pulseSpeed = 1.5,
}: PulsingEnergyCoreProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const innerMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    // Scale pulse: 1.0 -> 1.3 -> 1.0
    const scalePulse = 1.0 + Math.sin(time * pulseSpeed) * 0.15;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(scalePulse);
    }
    if (innerGlowRef.current) {
      innerGlowRef.current.scale.setScalar(scalePulse * 1.6);
    }
    if (materialRef.current) {
      // Emissive intensity pulse
      materialRef.current.emissiveIntensity = 0.6 + Math.sin(time * pulseSpeed) * 0.4;
    }
    if (innerMaterialRef.current) {
      innerMaterialRef.current.opacity = 0.06 + Math.sin(time * pulseSpeed) * 0.03;
    }
  });

  return (
    <group position={position}>
      {/* Core sphere - emissive metallic */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[baseRadius, 24, 24]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner glow - larger, more transparent sphere */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[baseRadius, 16, 16]} />
        <meshBasicMaterial
          ref={innerMaterialRef}
          color={emissiveColor}
          transparent
          opacity={0.06}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light for ambient glow */}
      <pointLight color={color} intensity={0.5} distance={4} decay={2} />
    </group>
  );
}
