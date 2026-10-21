import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: ['src/**/*.test.ts', 'src/**/*.types.ts', 'src/secure/types.ts'],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {branches: 90.01, functions: 90.01, lines: 90.01, statements: 90.01}
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    maxWorkers: 2
  }
});
