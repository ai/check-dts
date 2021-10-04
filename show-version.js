import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import { join } from 'path'
import pico from 'picocolors'

export function showVersion(print) {
  let pkg = readFileSync(
    join(fileURLToPath(import.meta.url), '..', 'package.json')
  )
  print(`check-dts ${pico.bold(JSON.parse(pkg).version)}`)
}
