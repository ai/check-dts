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

async function run () {
  let arg = process.argv[2]
  if (arg === '--version') {
    await showVersion()
  } else if (arg === '--help') {
    showHelp()
  } else if (!arg) {
    let result = await check()
    if (!result) process.exit(1)
  } else {
    process.stderr.write(chalk.red(`Unknown argument ${ arg }`) + '\n\n')
    showHelp()
    process.exit(1)
  }
}

run().catch(e => {
  if (!e.own) process.stderr.write(chalk.red(e.stack) + '\n')
  process.exit(1)
})
