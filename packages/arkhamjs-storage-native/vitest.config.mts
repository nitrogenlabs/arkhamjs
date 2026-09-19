import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: ['src/**/*.test.ts', 'src/secure/types.ts', 'src/secure/index.ts'],
      include: ['src/secure/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      thresholds: {branches: 90, functions: 90, lines: 90, statements: 90}
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    maxWorkers: 2
  }
});
