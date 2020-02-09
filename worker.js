let { parentPort, workerData } = require('worker_threads')
let ts = require('typescript')

let files = workerData

let result = ts.getPreEmitDiagnostics(ts.createProgram(files, {
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

parentPort.postMessage(result)
