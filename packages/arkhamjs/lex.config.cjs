module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  outputPath: 'lib',
  preset: 'web',
  remove: true,
  useTypescript: true,
  esbuild: {
    minify: true,
    treeShaking: true,
    drop: ['console', 'debugger'],
    pure: ['console.log', 'console.warn', 'console.error'],
    target: 'es2020',
    format: 'esm',
    platform: 'browser',
    splitting: true,
    metafile: true,
    sourcemap: false,
    legalComments: 'none',
    external: ['events', '@nlabs/utils/*'],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    banner: {
      js: '/* ArkhamJS - Optimized Build */'
    },
    footer: {
      js: '/* End ArkhamJS */'
    }
  }
};
