## 📌 Project Overview

- Project Name: NakedCanvas

- Core Objective: A lightweight, high-performance interactive particle graphics engine built completely from scratch using pure TypeScript and the HTML5 Canvas API. This project strictly excludes any external graphics libraries (such as Three.js, Pixi.js, or GSAP).

- Target Size: Must remain under 3KB (Minified + Gzipped).

## 🚫 Strict Constraints

### Zero Dependencies

- The dependencies section in package.json must always remain completely empty ({}).

- **Do not install or import any external modules, including utilities, math operations, or helper libraries** (e.g., lodash, ramda). Write all required logic from scratch.

### Zero GC Layout (Minimize Garbage Collection)

- Never use the new keyword to create objects, arrays, or class instances inside the `requestAnimationFrame` loop (which runs at 60fps).

- Pre-allocate variables outside the rendering loop or overwrite them between frames to prevent memory fragmentation and frame drops (jank).

### Data-Oriented Approach (Avoid Runtime Abstractions)

- Do not bind class instances or common methods to individual particle elements that generate by the thousands.

- Treat particles purely as raw data structures (ParticleData interface). Process all operations directly inside a flat, single-loop iteration within the parent manager class.

### Native Browser Rendering Optimization

Avoid using the high-overhead `arc()` method for drawing circular particles. Use `fillRect()` by default for pixel and rectangle-based rendering to maximize hardware acceleration efficiency.

## 💻 Code Convention

### Immutable Data Patterns & Ban on let

- To ensure code predictability and prevent side effects, **do not use the let keyword**. Declare all variables using `const`.

- When structural changes are required, mutate object properties directly within clearly defined data structures rather than reassigning variables.

### Strict Typing

- **Never use the any type**. Explicitly define interfaces or primitive types for all method parameters and return types.

- Adhere **strictly to the definitions** declared in the core data contract (types.ts).

### Active Voice & Precise Naming

- Begin functions and methods with strong, active verbs that explicitly describe their internal operations.
  - Good: `convertTextToParticles()`, `updateAndRender()`, `clearPointer()`
  - Bad: `process()`, `handleData()`, `doAnimation()`

### Mathematical Optimization Rules

Avoid redundant square root calculations (`Math.sqrt`) when evaluating distances from the mouse pointer. Compare values using squared terms (`distanceSq < radiusSq`) to save CPU cycles.

## 🛠 Tooling & Build Guidelines

### Build Tool: Use Vite.

- Target the latest ECMAScript specification (ESNext) for production builds to prevent polyfills or TS compiler helper functions from bloating the bundle size.

### Canvas Context Optimization:

Pass the `{ willReadFrequently: true }` flag when calling getContext('2d') to optimize pixel stream analysis performance.
