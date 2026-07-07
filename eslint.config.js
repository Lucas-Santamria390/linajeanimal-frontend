import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsdoc from 'eslint-plugin-jsdoc'
import { defineConfig, globalIgnores } from 'eslint/config'

/** Configuracion de ESLint con JSDoc obligatorio en funciones exportadas */
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsdoc.configs['flat/recommended'],
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
    rules: {
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/no-defaults': 'off',
      'jsdoc/require-jsdoc': ['warn', {
        publicOnly: true,
        contexts: [
          'ExportNamedDeclaration',
          'ExportDefaultDeclaration',
        ],
      }],
      'jsdoc/require-param': ['warn', {
        exemptedBy: ['type', 'typedef'],
      }],
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-returns-description': 'off',
    },
  },
])
