import lexEslintConfig from '@nlabs/lex/eslint.config.js';

export default [
  ...lexEslintConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        project: './packages/arkhamjs/tsconfig.lint.json'
      }
    }
  }
];
