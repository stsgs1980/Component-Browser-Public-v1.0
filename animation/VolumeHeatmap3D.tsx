'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * VolumeHeatmap3D - A cylindrical volume heatmap using torus ring segments.
 *
 * Renders a series of horizontal torus rings at specified Y positions,
 * with each ring's thickness, color, and opacity driven by its intensity
 * value (0-1). Higher intensity produces brighter, thicker rings.
 * Each ring pulses gently with a phase offset for a living data feel.
 *
 * @example
 * ```tsx
 * const data = [
 *   { y: 0.0, intensity: 0.2, index: 0 },
 *   { y: 0.22, intensity: 0.8, index: 1 },
 *   { y: 0.44, intensity: 1.0, index: 2 },
 *   { y: 0.66, intensity: 0.5, index: 3 },
 * ];
 *
 * <Canvas>
 *   <VolumeHeatmap3D
 *     data={data}
 *     radius={2.5}
 *     color="#FBBF24"
 *   />
 * </Canvas>
 * ```
 */
export interface HeatmapDataPoint {
  /** Y position of this ring segment in world space */
  y: number;
  /** Normalized intensity value (0 to 1). Controls thickness, color, and opacity. */
  intensity: number;
  /** Unique index/key for React keying */
  index: number;
}

export interface VolumeHeatmap3DProps {
  /** Array of heatmap data points defining ring positions and intensities */
  data: HeatmapDataPoint[];
  /** Radius of the torus rings. Default: 2.5 */
  radius?: number;
  /** Base hue color for the heatmap gradient. Rings interpolate from dim to bright based on intensity. Default: '#FBBF24' */
  color?: string;
}

export function VolumeHeatmap3D({
  data,
  radius = 2.5,
  color = '#FBBF24',
}: VolumeHeatmap3DProps) {
  const materialRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  // Compute color for a given intensity level
  const getColorForIntensity = (intensity: number): string => {
    if (intensity > 0.8) return '#fff7ed';   // near white for very high
    if (intensity > 0.5) return '#fbbf24';   // bright amber for high
    return '#92400e';                          // dim amber for low
  };

  // Animate: pulse each ring's opacity
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    materialRefs.current.forEach((mat, i) => {
      if (!mat || !data[i]) return;
      // Each ring pulses with a phase offset based on its position
      const baseOpacity = 0.15 + data[i].intensity * 0.45;
      const pulse = baseOpacity + Math.sin(time * 0.8 + i * 0.3) * (baseOpacity * 0.1);
      mat.opacity = pulse;
    });
  });

  if (data.length === 0) return null;

  return (
    <group>
      {data.map((d, i) => {
        const volColor = getColorForIntensity(d.intensity);
        const emissiveIntensity = 0.2 + d.intensity * 0.8;
        const tubeRadius = 0.015 + d.intensity * 0.04; // thicker for higher intensity

        return (
          <mesh key={`vh-${d.index}`} position={[0, d.y, 0]}>
            <torusGeometry args={[radius, tubeRadius, 6, 32]} />
            <meshStandardMaterial
              ref={(el) => { materialRefs.current[i] = el; }}
              color={volColor}
              emissive={volColor}
              emissiveIntensity={emissiveIntensity}
              transparent
              opacity={0.15 + d.intensity * 0.45}
              metalness={0.5}
              roughness={0.4}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
