import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'

// AI used to help set up linter for Phaser

export default [
  // Ignored min.js file as it is the "game engine"
  {
    ignores: ['**/phaser.min.js'],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        Phaser: 'readonly',
      },
    },
    rules: {
      // vars only used for initial tutorial code, will be using let and const later on
      'no-unused-vars': 'off',
      'no-undef': 'error',
    },
  },
]
