'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * HolographicGridFloor - An animated holographic grid floor with a radial glow shader.
 *
 * Renders a THREE.GridHelper overlaid with a custom shader plane that produces
 * a pulsing radial glow effect. The grid lines and glow plane animate together
 * with a synchronized pulse, creating a sci-fi "holographic projection" look.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <HolographicGridFloor
 *     gridSize={40}
 *     gridDivisions={80}
 *     color="#00FF88"
 *     position={[0, -2, 0]}
 *   />
 * </Canvas>
 * ```
 */
export interface HolographicGridFloorProps {
  /** Total size of the grid in world units. Default: 30 */
  gridSize?: number;
  /** Number of grid divisions. Default: 60 */
  gridDivisions?: number;
  /** Color of the grid lines and glow. Default: '#FFD700' */
  color?: string;
  /** Position of the grid floor group [x, y, z]. Default: [0, -1, 0] */
  position?: [number, number, number];
}

export function HolographicGridFloor({
  gridSize = 30,
  gridDivisions = 60,
  color = '#FFD700',
  position = [0, -1, 0],
}: HolographicGridFloorProps) {
  const gridHelperRef = useRef<THREE.GridHelper>(null);
  const gridMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Custom shader for the radial glow
  const glowShader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uMinOpacity: { value: 0.05 },
      uMaxOpacity: { value: 0.12 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uMinOpacity;
      uniform float uMaxOpacity;
      varying vec2 vUv;
      void main() {
        // Radial fade from center
        vec2 center = vUv - 0.5;
        float dist = length(center);
        float radialFade = 1.0 - smoothstep(0.0, 0.5, dist);

        // Pulse animation
        float pulse = mix(uMinOpacity, uMaxOpacity, (sin(uTime * 0.8) * 0.5 + 0.5));

        float alpha = radialFade * pulse;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  }), [color]);

  // Glow plane size scales with grid
  const glowPlaneSize = gridSize * 0.47;

  // Set gridHelper material to transparent on mount
  const gridHelperCallback = useMemo(() => (el: THREE.GridHelper | null) => {
    if (el) {
      (gridHelperRef as React.MutableRefObject<THREE.GridHelper | null>).current = el;
      const mats = Array.isArray(el.material) ? el.material : [el.material];
      mats.forEach((mat) => {
        mat.transparent = true;
        mat.opacity = 0.08;
        (mat as THREE.LineBasicMaterial).color.set(color);
        mat.depthWrite = false;
      });
    }
  }, [color]);

  useFrame((state) => {
    if (gridMaterialRef.current) {
      gridMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    // Pulse the grid helper opacity
    if (gridHelperRef.current) {
      const pulse = 0.05 + (Math.sin(state.clock.elapsedTime * 0.8) * 0.5 + 0.5) * 0.07;
      const mats = Array.isArray(gridHelperRef.current.material)
        ? gridHelperRef.current.material
        : [gridHelperRef.current.material];
      mats.forEach((mat) => {
        mat.opacity = pulse;
      });
    }
  });

  return (
    <group position={position}>
      {/* Grid lines */}
      <gridHelper ref={gridHelperCallback} args={[gridSize, gridDivisions, color, color]} />
      {/* Radial glow plane with animated shader */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[glowPlaneSize, glowPlaneSize]} />
        <shaderMaterial
          ref={gridMaterialRef}
          transparent
          depthWrite={false}
          uniforms={glowShader.uniforms}
          vertexShader={glowShader.vertexShader}
          fragmentShader={glowShader.fragmentShader}
        />
      </mesh>
    </group>
  );
}
