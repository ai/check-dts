import { parentPort, workerData } from 'worker_threads'

import { createProgram } from './create-program.js'

let { files, compilerOptions } = workerData

let errors = createProgram(files, compilerOptions)
let cleaned = errors.map(i => ({
  messageText: i.messageText,
  fileName: i.fileName,
  start: i.start,
  code: i.code,
  file: {
    fileName: i.file.fileName,
    text: i.file.text
  }
}))
parentPort.postMessage(cleaned)
