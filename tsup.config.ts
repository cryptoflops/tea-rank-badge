import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
  shims: true
});
