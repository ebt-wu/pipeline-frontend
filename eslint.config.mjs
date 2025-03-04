import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import tsEslint from 'typescript-eslint'
import angular from 'angular-eslint'
import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'

export default tsEslint.config(
  {
    files: ['**/*.{ts,tsx,jsx}'],
    ignores: ['**/generated/**'],
    extends: [
      eslint.configs.recommended,
      tsEslint.configs.recommended,
      tsEslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    plugins: { import: importPlugin },
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
    rules: {
      // Note: you must disable the base rule as it can report incorrect errors
      'no-unused-vars': 'off',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@angular-eslint/no-async-lifecycle-method': 'warn',
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      'import/order': ['error', { alphabetize: { order: 'asc' }, 'newlines-between': 'never' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      // ...angular.configs.templateAccessibility, // that is a bit too much for now
    ],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    },
  },
  eslintPluginPrettierRecommended,
)
