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
    environment: 'jsdom'
  },
  outputPath: 'lib',
  preset: 'node',
  remove: true,
  useTypescript: true
};
