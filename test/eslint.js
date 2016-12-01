import lint from 'mocha-eslint';

const paths = [
  'src/*.js',
  'tests/**/*.spec.js'
];

const options = {
  formatter: 'stylish',
  alwaysWarn: true,
  timeout: 5000,
  slow: 1000,
  strict: true
};

// Run the tests
lint(paths, options);