module.exports = {
  preset: 'web',
  useTypescript: true,
  vitest: {
    alias: {
      '@nlabs/arkhamjs': require.resolve('../arkhamjs/src/index.ts'),
      '@nlabs/arkhamjs-middleware-logger': require.resolve('../arkhamjs-middleware-logger/src/index.ts'),
      '@nlabs/arkhamjs-storage-browser': require.resolve('../arkhamjs-storage-browser/src/index.ts'),
      '@nlabs/arkhamjs-utils-react': require.resolve('../arkhamjs-utils-react/src/index.ts'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      react: require.resolve('react')
    },
    environment: 'happy-dom'
  }
};
