import ts from 'typescript'

const DEFAULT_OPTIONS = ts.convertCompilerOptionsFromJson(
  {
    allowJs: true,
    allowSyntheticDefaultImports: true,
    jsx: 'react',
    module: 'esnext',
    moduleResolution: 'NodeJs',
    noEmit: true,
    noImplicitReturns: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    strict: true,
    strictFunctionTypes: false,
    stripInternal: true
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
