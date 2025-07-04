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
  copyFiles: [
    'manifest.json',
    'manifest-safari.json',
    'popup.html',
    'welcome.html',
    'background.js',
    'popup.js',
    'app.html',
    'devtoolsBackground.html',
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'icons/icon128.png'
  ]
};
