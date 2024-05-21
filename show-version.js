import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pico from 'picocolors'

export function showVersion(print) {
  let pkg = readFileSync(
    join(fileURLToPath(import.meta.url), '..', 'package.json')
  )
  print(`check-dts ${pico.bold(JSON.parse(pkg).version)}`)
}
