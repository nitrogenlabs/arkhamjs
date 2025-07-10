module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  eslint: {
    parserOptions: {
      project: './tsconfig.lint.json'
    }
  },
  jest: {
    testEnvironment: 'jsdom'
  },
  outputPath: 'lib',
  preset: 'web',
  remove: true,
  tsconfig: 'tsconfig.build.json',
  useTypescript: true
};
