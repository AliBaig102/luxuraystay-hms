import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
      {
      files: ['src/**/*.ts'],
      languageOptions: {
        parser: typescriptParser,
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          project: './tsconfig.json',
        },
        globals: {
          process: 'readonly',
          console: 'readonly',
        },
      },
      plugins: {
        '@typescript-eslint': typescript,
        prettier: prettier,
      },
      rules: {
        ...typescript.configs.recommended.rules,
        ...typescript.configs['recommended-requiring-type-checking'].rules,
        ...prettierConfig.rules,
        'prettier/prettier': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'no-undef': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
      },
    },
  {
    ignores: ['dist/', 'node_modules/', '*.js'],
  },
];
