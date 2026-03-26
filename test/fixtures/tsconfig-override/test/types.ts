import getValue from '../index.js'

// This would fail with strict: true (strictNullChecks),
// but passes with strict: false proving tsconfig override works
let value: string = getValue()

value.trim()
