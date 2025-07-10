module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  jest: {
    testEnvironment: 'jsdom'
    // transformIgnorePatterns: [
    //   'node_modules/(?!@nlabs/arkhamjs|@nlabs/utils)'
    // ],
    // moduleNameMapper: {
    //   '^@nlabs/arkhamjs$': '<rootDir>/../arkhamjs/src/index.ts',
    //   '^@nlabs/utils/(.*)$': '<rootDir>/node_modules/@nlabs/utils/$1'
    // }
  },
  outputPath: 'lib',
  preset: 'node',
  remove: true,
  useTypescript: true
};
