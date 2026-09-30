import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/explorer/__tests__/*.test.{ts,tsx}'],
    setupFiles: ['src/explorer/__tests__/setup.ts'],
    testTimeout: 20000,
  },
});
