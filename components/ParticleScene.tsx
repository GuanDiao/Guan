import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateShapePositions } from '../utils/math';

interface ParticleSceneProps {
  shape: ShapeType;
  color: string;
  interactionValue: number; // 0 to 1
  particleCount: number;
}

const ParticleScene: React.FC<ParticleSceneProps> = ({ 
  shape, 
  color, 
  interactionValue,
  particleCount 
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Create buffers
  const [positions, targetPositions] = useMemo(() => {
    const currentPositions = new Float32Array(particleCount * 3);
    const targets = generateShapePositions(shape, particleCount);
    
    // Initialize random start positions
    for(let i=0; i<particleCount * 3; i++) {
        currentPositions[i] = (Math.random() - 0.5) * 10;
    }
    
    return [currentPositions, targets];
  }, [particleCount, shape]);

  // Update target positions when shape changes
  useEffect(() => {
    const newTargets = generateShapePositions(shape, particleCount);
    // Smooth transition logic handled in useFrame, we just update the reference data
    // We can't easily swap the Float32Array prop in the geometry without re-instantiating,
    // so we'll store targets in a ref or just closure.
    // Actually, let's use a ref for targets to avoid re-running useMemo too hard.
    if (pointsRef.current) {
        (pointsRef.current.userData as any).targetPositions = newTargets;
    }
  }, [shape, particleCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const currentArr = posAttr.array as Float32Array;
    
    // Get latest targets
    const targets = (pointsRef.current.userData as any).targetPositions || targetPositions;
    
    // Interaction Factor affects:
    // 1. Expansion (Scale)
    // 2. Noise/Jitter (Diffusion)
    // 3. Rotation Speed
    
    // Map interaction (0-1)
    // 0 (Closed): Compact, organized, shape is clear.
    // 1 (Open): Expanded, chaotic, exploded.
    
    const expansion = 1 + interactionValue * 2.0; // 1x to 3x size
    const chaos = interactionValue * 0.5; // Amount of random noise
    const rotationSpeed = 0.1 + interactionValue * 0.5;

    // Slowly rotate the whole system
    pointsRef.current.rotation.y += delta * rotationSpeed;
    pointsRef.current.rotation.z += delta * (rotationSpeed * 0.2);

    const lerpFactor = 3.0 * delta; // Speed of shape morphing

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      
      // Target coordinates
      let tx = targets[idx];
      let ty = targets[idx + 1];
      let tz = targets[idx + 2];

      // Apply expansion based on distance from center
      tx *= expansion;
      ty *= expansion;
      tz *= expansion;

      // Add chaos/diffusion based on interaction
      // Using Math.sin/cos with time to create "breathing" or "orbiting" noise
      if (chaos > 0.01) {
        const time = state.clock.elapsedTime;
        tx += Math.sin(time * 2 + i) * chaos;
        ty += Math.cos(time * 3 + i) * chaos;
        tz += Math.sin(time * 4 + i) * chaos;
      }

      // Interpolate current position to target
      currentArr[idx] += (tx - currentArr[idx]) * lerpFactor;
      currentArr[idx + 1] += (ty - currentArr[idx + 1]) * lerpFactor;
      currentArr[idx + 2] += (tz - currentArr[idx + 2]) * lerpFactor;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleScene;