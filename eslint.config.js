import eslint from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '**/*.test.ts'],
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      'prettier': prettierPlugin
    },
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // Testing globals
        jest: true,
        expect: true,
        describe: true,
        it: true,
        beforeEach: true,
        afterEach: true
      }
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-console': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  {
    files: ['**/*.test.ts'],
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      'prettier': prettierPlugin
    },
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.test.json'
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // Testing globals
        jest: true,
        expect: true,
        describe: true,
        it: true,
        beforeEach: true,
        afterEach: true
      }
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-console': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  prettierConfig
];
