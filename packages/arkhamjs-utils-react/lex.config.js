module.exports = {
  outputPath: 'lib',
  useTypescript: true,
  webpack: {
    resolve: {
      alias: {
        react: path.resolve(path.join(__dirname, '../node_modules/react')),
        'react-dom': path.resolve(path.join(__dirname, '../node_modules/react-dom')),
      }
    }
  }
};
