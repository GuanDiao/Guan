import * as THREE from 'three';
import { ShapeType } from '../types';

export const generateShapePositions = (type: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;
    const t = Math.random() * Math.PI * 2;
    const u = Math.random() * Math.PI * 2;
    const v = Math.random();

    switch (type) {
      case ShapeType.HEART:
        // 3D Heart approximation
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // Add some depth with z
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * 2 * Math.PI;
        
        // Base heart shape on XY plane, extruded slightly to Z
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        // Randomize inside the volume
        const scale = 0.15;
        const r = Math.cbrt(Math.random()) * scale; 
        
        x = hx * r;
        y = hy * r;
        z = (Math.random() - 0.5) * 2; // Thickness
        break;

      case ShapeType.FLOWER:
        // Rose curve / Polar flower
        const k = 4; // Petals
        const radius = 3 * Math.cos(k * t) * Math.random();
        x = radius * Math.cos(t);
        y = radius * Math.sin(t);
        z = (Math.random() - 0.5) * 1.5 * Math.exp(-radius); // Curvature
        break;

      case ShapeType.SATURN:
        const isRing = Math.random() > 0.4;
        if (isRing) {
          // Ring
          const ringR = 3 + Math.random() * 2;
          x = ringR * Math.cos(t);
          z = ringR * Math.sin(t); // Rings on XZ plane
          y = (Math.random() - 0.5) * 0.2;
        } else {
          // Planet Body
          const bodyR = 1.8 * Math.cbrt(Math.random());
          const thetaP = Math.random() * Math.PI * 2;
          const phiP = Math.acos(2 * Math.random() - 1);
          x = bodyR * Math.sin(phiP) * Math.cos(thetaP);
          y = bodyR * Math.sin(phiP) * Math.sin(thetaP);
          z = bodyR * Math.cos(phiP);
        }
        // Tilt Saturn
        const tilt = Math.PI / 6;
        const tempX = x;
        x = tempX * Math.cos(tilt) - y * Math.sin(tilt);
        y = tempX * Math.sin(tilt) + y * Math.cos(tilt);
        break;

      case ShapeType.BUDDHA:
        // Abstract Meditating Figure (Stacked spheres approximation)
        const part = Math.random();
        if (part < 0.4) {
          // Base/Legs (Flat Ellipsoid)
          const lr = 2 * Math.sqrt(Math.random());
          const la = Math.random() * Math.PI * 2;
          x = lr * Math.cos(la);
          z = lr * Math.sin(la) * 0.8;
          y = -1.5 + Math.random() * 0.5;
        } else if (part < 0.8) {
          // Body (Sphere)
          const br = 1.2 * Math.cbrt(Math.random());
          const bphi = Math.acos(2 * Math.random() - 1);
          const btheta = Math.random() * Math.PI * 2;
          x = br * Math.sin(bphi) * Math.cos(btheta);
          y = -0.2 + br * Math.sin(bphi) * Math.sin(btheta);
          z = br * Math.cos(bphi);
        } else {
          // Head
          const hr = 0.7 * Math.cbrt(Math.random());
          const hphi = Math.acos(2 * Math.random() - 1);
          const htheta = Math.random() * Math.PI * 2;
          x = hr * Math.sin(hphi) * Math.cos(htheta);
          y = 1.3 + hr * Math.sin(hphi) * Math.sin(htheta);
          z = hr * Math.cos(hphi);
        }
        break;

      case ShapeType.FIREWORK:
      default:
        // Sphere explosion
        const fr = 4 * Math.cbrt(Math.random());
        const fphi = Math.acos(2 * Math.random() - 1);
        const ftheta = Math.random() * Math.PI * 2;
        x = fr * Math.sin(fphi) * Math.cos(ftheta);
        y = fr * Math.sin(fphi) * Math.sin(ftheta);
        z = fr * Math.cos(fphi);
        break;
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  return positions;
};