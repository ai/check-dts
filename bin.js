#!/usr/bin/env node

import pico from 'picocolors'

import { check } from './check.js'
import { showHelp } from './show-help.js'
import { showVersion } from './show-version.js'

function error(message) {
  process.stderr.write(pico.red(message) + '\n')
}

function print(...lines) {
  process.stdout.write(lines.join('\n') + '\n')
}

async function run() {
  let arg = process.argv[2]
  if (arg === '--version') {
    showVersion(print)
  } else if (arg === '--help') {
    showHelp(print)
  } else if (!arg) {
    let result = await check(process.stderr, process.cwd(), print)
    if (!result) process.exit(1)
  } else {
    let result = await check(
      process.stderr,
      process.cwd(),
      print,
      process.argv.slice(2)
    )
    if (!result) process.exit(1)
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
