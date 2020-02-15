let ts = require('typescript')

module.exports = function createProgram (files) {
  return ts.getPreEmitDiagnostics(ts.createProgram(files, {
    allowSyntheticDefaultImports: true,
    strictFunctionTypes: false,
    noUnusedParameters: true,
    noImplicitReturns: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noUnusedLocals: true,
    noImplicitAny: false,
    stripInternal: true,
    allowJs: true,
    module: 'esnext',
    strict: true,
    noEmit: true,
    jsx: 'react'
  }))
}
