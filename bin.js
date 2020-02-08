#!/usr/bin/env node

let chalk = require('chalk')

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
    check()
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
