#!/usr/bin/env node

let ciJobNumber = require('ci-job-number')
let chalk = require('chalk')

if (ciJobNumber() !== 1) {
  process.stdout.write(
    chalk.yellow('check-tds runs only on first CI job, to save CI resources\n')
  )
  process.exit()
}

let showVersion = require('./show-version')
let showHelp = require('./show-help')
let check = require('./check')

function error (message) {
  process.stderr.write(chalk.red(message) + '\n')
}

function print (...lines) {
  process.stdout.write(lines.join('\n') + '\n')
}

async function run () {
  let arg = process.argv[2]
  if (arg === '--version') {
    showVersion(print)
  } else if (arg === '--help') {
    showHelp(print)
  } else if (!arg) {
    let result = await check(print, process.cwd())
    if (!result) process.exit(1)
  } else {
    error(`Unknown argument ${ arg }\n`)
    showHelp(print)
    process.exit(1)
  }
}

run().catch(e => {
  error(e.stack)
  process.exit(1)
})
