import ts from 'typescript'
import { createRequire } from 'module'
import { dirname, join } from 'path'

let require = createRequire(import.meta.url)

const TS_DIR = dirname(require.resolve('typescript'))

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

export function createProgram(files, opts = DEFAULT) {
  opts.moduleResolution = 'node'

  let { options, errors } = ts.convertCompilerOptionsFromJson(opts, './')

  if (errors.length) {
    throw errors
  }

  if (options.lib) {
    options.lib.forEach(path => {
      files.push(join(TS_DIR, path))
    })
    options.lib.length = 0
  }

  options.noEmit = true

  return ts.getPreEmitDiagnostics(ts.createProgram(files, options))
}
