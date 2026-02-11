module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  jest: {
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    testEnvironment: 'jsdom'
  },
  outputPath: 'lib',
  preset: 'web',
  remove: true,
  useTypescript: true
};
