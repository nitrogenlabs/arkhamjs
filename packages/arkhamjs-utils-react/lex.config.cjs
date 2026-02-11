module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  jest: {
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
      '^@nlabs/arkhamjs$': '<rootDir>/../../node_modules/@nlabs/arkhamjs/index.js',
      '^@nlabs/utils$': '<rootDir>/../../node_modules/@nlabs/utils/lib/index.js',
      '^@nlabs/utils/(.*)$': '<rootDir>/../../node_modules/@nlabs/utils/lib/$1'
    },
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
      '/node_modules/(?!@nlabs/(arkhamjs|utils))'
    ]
  },
  outputPath: 'lib',
  preset: 'node',
  remove: true,
  useTypescript: true
};
