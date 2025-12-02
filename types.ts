import { ThreeElements } from '@react-three/fiber';

export enum ShapeType {
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SATURN = 'SATURN',
  BUDDHA = 'BUDDHA',
  FIREWORK = 'FIREWORK'
}

export interface AppState {
  currentShape: ShapeType;
  particleColor: string;
  isHandDetected: boolean;
  interactionValue: number; // 0 to 1, derived from hand gesture
  particleCount: number;
}

export type ParticleData = {
  positions: Float32Array;
  targetPositions: Float32Array;
  colors: Float32Array;
};

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}