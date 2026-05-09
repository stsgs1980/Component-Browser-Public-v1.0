'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FloatingParticles - A field of animated floating particles using instanced mesh rendering.
 *
 * Renders a set of small spheres that drift gently through 3D space with
 * sinusoidal motion, creating an atmospheric particle field effect. Uses
 * instanced mesh for efficient rendering of many particles.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <FloatingParticles count={300} spread={30} color="#00FFFF" opacity={0.4} />
 * </Canvas>
 * ```
 */
export interface FloatingParticlesProps {
  /** Number of particles to render. Default: 200 */
  count?: number;
  /** The spread (bounding box size) of the particle field in world units. Default: 25 */
  spread?: number;
  /** Color of each particle. Default: '#FFD700' */
  color?: string;
  /** Opacity of each particle (0-1). Default: 0.3 */
  opacity?: number;
}

export function FloatingParticles({
  count = 200,
  spread = 25,
  color = '#FFD700',
  opacity = 0.3,
}: FloatingParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * (spread * 0.6);
      const speed = 0.01 + Math.random() * 0.03;
      temp.push({ x, y, z, speed, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, [count, spread]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const dummy = dummyRef.current;

    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(time * p.speed + p.phase) * 0.5,
        p.y + Math.cos(time * p.speed + p.phase) * 0.3,
        p.z + Math.sin(time * p.speed * 0.7 + p.phase) * 0.4
      );
      dummy.scale.setScalar(0.02 + Math.sin(time + p.phase) * 0.01);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </instancedMesh>
  );
}
