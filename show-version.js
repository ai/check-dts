import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import { bold } from 'colorette'
import { join } from 'path'

export function showVersion(print) {
  let pkg = readFileSync(
    join(fileURLToPath(import.meta.url), '..', 'package.json')
  )
  print(`check-dts ${bold(JSON.parse(pkg).version)}`)
}
