import { readFileSync } from 'node:fs'
import { API } from 'typescript/unstable/async'

function overlayFs(configPath, configText) {
  return {
    readFile(name) {
      if (name === configPath) return configText
      return undefined
    }
  }
}

export async function parseConfig(cwd, configFileName) {
  let api = new API({ cwd })
  try {
    let parsed = await api.parseConfigFile(configFileName)
    return parsed.fileNames
  } finally {
    await api.close()
  }
}

export async function createProgram(cwd, configPath, configText) {
  let api = new API({ cwd, fs: overlayFs(configPath, configText) })
  try {
    let snapshot = await api.updateSnapshot({ openProjects: [configPath] })
    let program = snapshot.getProjects()[0].program

    let diagnostics = [
      ...(await program.getSyntacticDiagnostics()),
      ...(await program.getSemanticDiagnostics()),
      ...(await program.getGlobalDiagnostics())
    ]

    let texts = new Map()
    return diagnostics.map(diagnostic => {
      let cleaned = {
        code: diagnostic.code,
        fileName: diagnostic.fileName,
        messageText: diagnostic.text,
        start: diagnostic.pos
      }
      if (diagnostic.fileName && diagnostic.fileName !== configPath) {
        if (!texts.has(diagnostic.fileName)) {
          texts.set(
            diagnostic.fileName,
            readFileSync(diagnostic.fileName, 'utf8')
          )
        }
        cleaned.file = {
          fileName: diagnostic.fileName,
          text: texts.get(diagnostic.fileName)
        }
      }
      return cleaned
    })
  } finally {
    await api.close()
  }
}
