import { defineConfig } from "vite";

// ESNext target keeps TS/polyfill helpers out of the bundle to protect the <3KB budget.
export default defineConfig({
  build: {
    target: "esnext",
    minify: "esbuild",
    lib: {
      entry: "src/index.ts",
      name: "NakedCanvas",
      formats: ["es", "umd"],
      fileName: "naked-canvas",
    },
  },
});
