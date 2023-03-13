import ts from 'typescript'

const DEFAULT_OPTIONS = ts.convertCompilerOptionsFromJson(
  {
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
  },
  './'
).options

export function getCompilerOptions(cwd, configName = 'tsconfig.json') {
  let configFileName = ts.findConfigFile(cwd, ts.sys.fileExists, configName)
  if (configFileName === undefined) {
    return DEFAULT_OPTIONS
  }
  let configFile = ts.readConfigFile(configFileName, ts.sys.readFile)
  let parsedCommandLine = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    cwd
  )
  return parsedCommandLine.options
}
