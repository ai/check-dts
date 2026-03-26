import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import pico from 'picocolors'

export function showVersion(print) {
  let pkg = readFileSync(join(import.meta.dirname, 'package.json'))
  print(`check-dts ${pico.bold(JSON.parse(pkg).version)}`)
}
