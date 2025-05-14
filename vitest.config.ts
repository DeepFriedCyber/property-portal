import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['**/*.{test,spec,vitest}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**'],
    globals: true,
    coverage: {
      provider: 'istanbul', // Use istanbul instead of v8
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'dist/', '.turbo/'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './apps/web/src'),
      '@components': resolve(__dirname, './apps/web/components'),
      '@lib': resolve(__dirname, './lib'),
      '@your-org/ui': resolve(__dirname, './packages/ui'),
      '@your-org/db': resolve(__dirname, './packages/db/src'),
    },
  },
});