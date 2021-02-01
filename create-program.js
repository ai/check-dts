let ts = require('typescript')

const DEFAULT = {
  allowSyntheticDefaultImports: true,
  strictFunctionTypes: false,
  noUnusedParameters: true,
  noImplicitReturns: true,
  moduleResolution: 'NodeJs',
  noUnusedLocals: true,
  stripInternal: true,
  allowJs: true,
  module: 'esnext',
  strict: true,
  noEmit: true,
  jsx: 'react'
}

const KEY_TO_MODULE = {
  none: ts.ModuleKind.None,
  commonjs: ts.ModuleKind.CommonJS,
  amd: ts.ModuleKind.AMD,
  umd: ts.ModuleKind.UMD,
  system: ts.ModuleKind.System,
  es2015: ts.ModuleKind.ES2015,
  es2020: ts.ModuleKind.ES2020,
  esnext: ts.ModuleKind.ESNext
}

module.exports = function createProgram (files, opts = DEFAULT) {
  opts.moduleResolution = ts.ModuleResolutionKind.NodeJs
  if (typeof opts.module === 'string') {
    opts.module = ts.ModuleKind[KEY_TO_MODULE[opts.module.toLowerCase()]]
  }
  opts.noEmit = true
  return ts.getPreEmitDiagnostics(ts.createProgram(files, opts))
}
