let { parentPort, workerData } = require('worker_threads')

let createProgram = require('./create-program')

parentPort.postMessage(createProgram(workerData))
