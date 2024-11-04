import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
    },

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      eqeqeq: 'error',
      curly: 'error',
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'default-param-last': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-trailing-spaces': 'error',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          endOfLine: 'auto',
        },
      ],
    },
  },
];
