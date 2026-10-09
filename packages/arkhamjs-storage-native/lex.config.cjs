module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  vitest: {
    coverage: {
      enabled: true,
      include: ['src/NativeStorage/NativeStorage.ts'],
      thresholds: {perFile: true, branches: 90, functions: 90, lines: 90, statements: 90}
    }
  },
  outputPath: 'lib',
  preset: 'web',
  remove: true,
  useTypescript: true
};
