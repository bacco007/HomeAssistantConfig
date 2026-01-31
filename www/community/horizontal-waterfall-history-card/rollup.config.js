import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

const timestamp = new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

export default {
  input: 'src/waterfall-history-card.ts',
  output: {
    file: 'dist/horizontal-waterfall-history-card.js',
    format: 'es',
    sourcemap: true,
    inlineDynamicImports: true,
    banner: `/* Waterfall History Card v4.2.0 - Last changed: ${timestamp} */`,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      declaration: false,
    }),
    json(),
    terser({
      format: {
        comments: /^!/,
        preamble: `/* Waterfall History Card v4.2.0 */`,
      },
    }),
  ],
};
