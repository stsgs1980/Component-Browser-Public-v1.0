'use client';

import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/**
 * PostProcessing - A configurable post-processing effect stack for React Three Fiber scenes.
 *
 * Wraps EffectComposer with Bloom, ChromaticAberration, and Vignette effects.
 * All parameters are optional with sensible defaults for a cinematic sci-fi look.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <YourScene />
 *   <PostProcessing intensity={1.2} luminanceThreshold={0.2} />
 * </Canvas>
 * ```
 */
export interface PostProcessingProps {
  /** Luminance threshold for the bloom effect. Pixels below this brightness won't bloom. Default: 0.3 */
  luminanceThreshold?: number;
  /** Smoothing applied to the bloom luminance threshold. Higher = softer edges. Default: 0.9 */
  luminanceSmoothing?: number;
  /** Overall intensity of the bloom glow. Default: 0.8 */
  intensity?: number;
  /** Chromatic aberration offset (x, y). Creates RGB fringing at edges. Default: [0.0004, 0.0004] */
  chromaticOffset?: [number, number];
  /** Vignette offset from center (0 = none, 1 = max). Default: 0.3 */
  vignetteOffset?: number;
  /** Vignette darkness at edges (0 = transparent, 1 = black). Default: 0.6 */
  vignetteDarkness?: number;
}

export function PostProcessing({
  luminanceThreshold = 0.3,
  luminanceSmoothing = 0.9,
  intensity = 0.8,
  chromaticOffset = [0.0004, 0.0004],
  vignetteOffset = 0.3,
  vignetteDarkness = 0.6,
}: PostProcessingProps) {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={luminanceSmoothing}
        intensity={intensity}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(chromaticOffset[0], chromaticOffset[1])}
      />
      <Vignette
        offset={vignetteOffset}
        darkness={vignetteDarkness}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
