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
  outputPath: 'lib',
  preset: 'web',
  remove: true,
  useTypescript: true
};
