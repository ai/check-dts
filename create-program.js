let ts = require('typescript')

let defaultCompilerOptions = {
  allowSyntheticDefaultImports: true,
  strictFunctionTypes: false,
  noUnusedParameters: true,
  noImplicitReturns: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  noUnusedLocals: true,
  stripInternal: true,
  allowJs: true,
  module: 'esnext',
  strict: true,
  noEmit: true,
  jsx: 'react'
}

module.exports = function createProgram (files, compilerOptions) {
  if (!compilerOptions) {
    compilerOptions = defaultCompilerOptions
  }

  return ts.getPreEmitDiagnostics(ts.createProgram(files, compilerOptions))
}
