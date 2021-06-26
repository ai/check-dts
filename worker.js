import { parentPort, workerData } from 'worker_threads'

import { createProgram } from './create-program.js'

let { files, compilerOptions } = workerData

parentPort.postMessage(createProgram(files, compilerOptions))
