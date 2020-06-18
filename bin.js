#!/usr/bin/env node

let ciJobNumber = require('ci-job-number')
let kleur = require('kleur')

if (ciJobNumber() !== 1) {
  process.stdout.write(
    kleur.yellow('check-tds runs only on first CI job, to save CI resources\n')
  )
  process.exit()
}

let showVersion = require('./show-version')
let showHelp = require('./show-help')
let check = require('./check')

function error (message) {
  process.stderr.write(kleur.red(message) + '\n')
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
    let result = await check(process.stdout, process.cwd(), print)
    if (!result) process.exit(1)
  } else {
    error(`Unknown argument ${arg}\n`)
    showHelp(print)
    process.exit(1)
  }
}

run().catch(e => {
  if (e.own) {
    error(e.message)
  } else {
    error(e.stack)
  }
  process.exit(1)
})
