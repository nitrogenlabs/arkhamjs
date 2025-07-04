module.exports = {
  ai: {
    maxTokens: 4000,
    model: 'cursor-code',
    provider: 'cursor',
    temperature: 0.1
  },
  copyFiles: [
    'app.html',
    'background.js',
    'devtoolsBackground.html',
    'icons/icon128.png',
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'manifest-safari.json',
    'manifest.json',
    'popup.html',
    'popup.js',
    'welcome.html'
  ],
  outputPath: 'lib',
  preset: 'web',
  remove: true,
  useTypescript: true
};
