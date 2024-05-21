import loguxTsConfig from '@logux/eslint-config'

export default [
  ...loguxTsConfig,
  {
    files: ['test/**/*.test.js'],
    languageOptions: {
      globals: {
        expect: 'readonly',
        it: 'readonly'
      }
    }
  }
]
