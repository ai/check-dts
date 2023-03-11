import { join } from 'path'
import { existsSync, promises as fs } from 'fs'
import JSON5 from "json5";

export async function getCompilerOptions(cwd) {
  let compilerOptions
  let tsconfigPath = join(cwd, 'tsconfig.json')
  if (existsSync(tsconfigPath)) {
    let tsconfig = JSON5.parse(await fs.readFile(tsconfigPath))
    compilerOptions = tsconfig.compilerOptions
  }
  return compilerOptions;
}
