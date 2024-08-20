import { parentPort, workerData } from 'node:worker_threads'

import { createProgram } from './create-program.js'

let { compilerOptions, files } = workerData

let errors = createProgram(files, compilerOptions)
let cleaned = errors.map(error => {
  let cleanedError = {
    code: error.code,
    fileName: error.fileName,
    messageText: error.messageText,
    start: error.start
  }
  if (typeof cleanedError.messageText !== 'string') {
    cleanedError.messageText = {
      code: cleanedError.messageText.code,
      messageText: cleanedError.messageText.messageText
    }
  }
  if (error.file) {
    cleanedError.file = {
      fileName: error.file.fileName,
      text: error.file.text
    }
  }
  return cleanedError
})
parentPort.postMessage(cleaned)
