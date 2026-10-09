module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  vitest: {
    alias: {
      '@nlabs/arkhamjs': require.resolve('../arkhamjs/src/index.ts')
    },
    coverage: {
      enabled: true,
      include: ['src/FluxProvider.tsx', 'src/useFluxState.ts', 'src/useFluxSnapshot.ts'],
      thresholds: {perFile: true, branches: 90, functions: 90, lines: 90, statements: 90}
    },
    environment: 'jsdom'
  },
  outputPath: 'lib',
  preset: 'node',
  remove: true,
  useTypescript: true
};
