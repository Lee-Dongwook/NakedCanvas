export interface NakedOptions {
  particleGap: number; // Pixel sampling interval (lower values ​​indicate higher density)
  mouseRadius: number; // Radius of physical interaction with the mouse
  pushForce: number; // Strength of the pushing force from the mouse
  returnEase: number; // Elastic force for returning to the original position (0.01 ~ 0.2)
  friction: number; // Friction (0.8 ~ 0.98)
  defaultColor: string; // Default particle color
}

// Data structure for particles to be created by the thousands at runtime (struct-like, without methods)
export interface ParticleData {
  x: number; // Current X-coordinate
  y: number; // Current Y-coordinate
  vx: number; // X-axis velocity
  vy: number; // Y-axis velocity
  tx: number; // Target X-coordinate (text pixel)
  ty: number; // Target Y-coordinate (text pixel)
  color: string;
}
