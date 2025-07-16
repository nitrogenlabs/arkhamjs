module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  jest: {
    testEnvironment: 'jsdom'
  },
  outputPath: 'lib',
  preset: 'node',
  remove: true,
  useTypescript: true
};
