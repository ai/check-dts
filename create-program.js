import ts from 'typescript'
import { createRequire } from 'module'
import { dirname, join } from 'path'

let require = createRequire(import.meta.url)

const TS_DIR = dirname(require.resolve('typescript'))

export function createProgram(files, options) {
  options.moduleResolution = ts.ModuleResolutionKind.NodeJs

  if (options.lib) {
    for (let path of options.lib) {
      files.push(join(TS_DIR, path))
    }
    options.lib.length = 0
  }

  options.noEmit = true

  return ts.getPreEmitDiagnostics(ts.createProgram(files, options))
}
