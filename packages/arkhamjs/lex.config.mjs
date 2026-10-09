export default {
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
  vitest: {
    coverage: {
      enabled: true,
      include: ['src/PersistedPreferences/PersistedPreferences.ts'],
      thresholds: {perFile: true, branches: 90, functions: 90, lines: 90, statements: 90}
    },
    environment: 'jsdom'
  },
  outputPath: 'lib',
  preset: 'node',
  remove: true,
  swc: {
    jsc: {
      minify: {
        compress: {
          drop_console: true
        },
        mangle: true
      },
      target: 'es2020'
    },
    minify: true,
    module: {
      type: 'es6'
    },
    sourceMaps: false
  },
  tsconfig: 'tsconfig.build.json',
  useTypescript: true
};
