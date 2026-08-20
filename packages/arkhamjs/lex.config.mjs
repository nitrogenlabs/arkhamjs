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
