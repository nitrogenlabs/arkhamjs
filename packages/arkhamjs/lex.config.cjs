module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  esbuild: {
    banner: {
      js: '/* ArkhamJS - Optimized Build */'
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    drop: ['console', 'debugger'],
    external: ['events', '@nlabs/utils/*'],
    footer: {
      js: '/* End ArkhamJS */'
    },
    format: 'esm',
    legalComments: 'none',
    metafile: true,
    minify: true,
    platform: 'browser',
    pure: ['console.log', 'console.warn', 'console.error'],
    sourcemap: false,
    splitting: true,
    target: 'es2020'
  },
  eslint: {
    parserOptions: {
      project: './tsconfig.lint.json'
    }
  },
  jest: {
    transformIgnorePatterns: [
      "/node_modules/(?!@nlabs/utils)"
    ],
    // moduleNameMapper: {
    //   '^@nlabs/utils$': '<rootDir>/../../node_modules/@nlabs/utils/lib/index.js'
    // },
    setupFilesAfterEnv: ['./jest.setup.js'],
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.tsx?$': ['ts-jest', {
        tsconfig: './tsconfig.test.json'
      }]
    }
  },
  outputPath: 'lib',
  preset: 'node',
  remove: true,
  useTypescript: true
};
