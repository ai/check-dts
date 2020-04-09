let { parentPort, workerData } = require('worker_threads')

let createProgram = require('./create-program')

let { files, compilerOptions } = workerData

parentPort.postMessage(createProgram(files, compilerOptions))
