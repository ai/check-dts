import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { styleText } from 'node:util'

export function showVersion(print) {
  let pkg = readFileSync(join(import.meta.dirname, 'package.json'))
  print(`check-dts ${styleText('bold', JSON.parse(pkg).version)}`)
}
