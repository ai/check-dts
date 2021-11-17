import { parentPort, workerData } from 'worker_threads'

import { createProgram } from './create-program.js'

let { files, compilerOptions } = workerData

let errors = createProgram(files, compilerOptions)
let cleaned = errors.map(error => {
  let cleanedError = {
    messageText: error.messageText,
    fileName: error.fileName,
    start: error.start,
    code: error.code
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
