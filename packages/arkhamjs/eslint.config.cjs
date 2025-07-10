import lexEslintConfig from '@nlabs/lex/eslint.config.js';

export default [
  ...lexEslintConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.lint.json'
      }
    }
  }
];
