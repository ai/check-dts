import { dirname, basename, join, relative } from 'path'
import { existsSync, promises as fs } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { createSpinner } from 'nanospinner'
import { location } from 'vfile-location'
import { Worker } from 'worker_threads'
import globby from 'globby'
import pico from 'picocolors'

let require = createRequire(import.meta.url)

let r = pico.red
let b = pico.bold
let g = pico.green

const ROOT = dirname(fileURLToPath(import.meta.url))
const TS_DIR = dirname(require.resolve('typescript'))
const WORKER = join(ROOT, 'worker.js')
const PREFIX = '// THROWS '

function checkFiles(files, compilerOptions) {
  return new Promise((resolve, reject) => {
    let worker = new Worker(WORKER, {
      workerData: { files, compilerOptions }
    })
    worker.on('message', resolve)
    worker.on('error', reject)
  })
}

function getText(error) {
  if (typeof error.messageText === 'object') {
    return error.messageText.messageText
  } else {
    return error.messageText
  }
}

function formatName(cwd, file, color) {
  return pico.gray(relative(cwd, file).replace(basename(file), i => color(i)))
}

async function parseTest(files) {
  let expects = []
  await Promise.all(
    files.map(async fileName => {
      let source = (await fs.readFile(fileName)).toString()
      let prev, pos
      let lines = location(source)
      while (true) {
        pos = source.indexOf(PREFIX, prev + 1)
        if (pos === -1) break
        let newline = source.slice(pos).search(/\r?\n/)
        if (newline !== -1) newline += pos

        let pattern = source.slice(pos + PREFIX.length, newline)
        let { line, column } = lines.toPoint(pos)
        expects.push({ fileName, line: line + 1, column, pattern })
        prev = pos
      }
    })
  )
  return expects
}

export async function check(
  stderr,
  cwd,
  print,
  globs = ['**/*.{js,ts,jsx,tsx}']
) {
  let spinner = createSpinner('Check types', { stream: stderr })

  let compilerOptions
  let tsconfigPath = join(cwd, 'tsconfig.json')
  if (existsSync(tsconfigPath)) {
    let tsconfig = JSON.parse(await fs.readFile(tsconfigPath))
    compilerOptions = tsconfig.compilerOptions
  }

  let opts = { cwd, ignore: ['node_modules'], gitignore: true, absolute: true }
  let all = await globby(globs, opts)

  if (!all.some(i => /\.tsx?$/.test(i))) {
    let err = new Error(
      'TypeScript files were not found. ' +
        'Create .d.ts files and test/types.ts and test/errors.ts.'
    )
    err.own = true
    throw err
  }

  let typeTests = all.filter(i => /\.?(errors|types)\.tsx?/.test(i))
  let failTests = all.filter(i => /\.?errors\.tsx?$/.test(i))

  all.push(join(TS_DIR, 'lib.dom.d.ts'))
  all.push(join(TS_DIR, 'lib.es2018.d.ts'))

  let expects = await parseTest(failTests)
  let errors = await checkFiles(all, compilerOptions)

  let bad = {}
  function push(file, message) {
    if (!bad[file]) bad[file] = []
    bad[file].push(message)
  }

  for (let i of errors) {
    if (i.messageText.code === 6504 || i.messageText.code === 6054) {
      // Unsupported files
      continue
    }
    let { line, column } = location(i.file.text).toPoint(i.start)
    let expect = expects.find(j => {
      return i.file.fileName === j.fileName && line === j.line && !j.used
    })
    let prefix = r(
      `✖ ${formatName(cwd, i.file.fileName, r)}:${line}:${column}:`
    )
    let text = getText(i)
    if (!failTests.includes(i.file.fileName)) {
      push(
        i.fileName,
        prefix +
          b(' Type error ' + pico.gray(`TS${i.code}`) + '\n') +
          '  ' +
          r(text)
      )
    } else if (!expect) {
      push(i.fileName, prefix + b(' Unexpected error\n') + '  ' + r(text))
    } else {
      expect.used = true
      if (!text.includes(expect.pattern)) {
        push(
          i.fileName,
          prefix +
            b(' Wrong error\n') +
            '  Expected: ' +
            g(expect.pattern) +
            '\n' +
            '  Got: ' +
            r(text)
        )
      }
    }
  }
  let unused = expects.filter(i => !i.used)
  for (let i of unused) {
    push(
      i.fileName,
      r(`✖ ${formatName(cwd, i.fileName, r)}:${i.line}:${i.column}:`) +
        b(' Error was not found\n') +
        '  ' +
        r(i.pattern)
    )
  }

  let failed = Object.keys(bad).length > 0
  if (failed) {
    spinner.error()
    print('')
    for (let file in bad) {
      let messages = (bad[file] || []).sort((msg1, msg2) => {
        let line1 = parseInt(msg1.match(/(\d+):/)[1])
        let line2 = parseInt(msg2.match(/(\d+):/)[1])
        return line1 - line2
      })
      for (let i of messages) {
        print(i + '\n')
      }
    }
    return false
  } else {
    spinner.success()
    for (let i of typeTests) {
      print(g('✔ ') + formatName(cwd, i, pico.white))
    }
    return true
  }
}
