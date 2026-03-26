import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      all: false,
      provider: 'v8',
      thresholds: {
        statements: 100
      }
    },
    exclude: ['**/node_modules/**', 'test/fixtures/**'],
    globals: true,
    testTimeout: 20000
  }
})
