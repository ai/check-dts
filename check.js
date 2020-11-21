let { red: r, bold: b, green: g, gray, white } = require('colorette')
let { dirname, basename, join, relative } = require('path')
let vfileLocation = require('vfile-location')
let { promisify } = require('util')
let globby = require('globby')
let ora = require('ora')
let fs = require('fs')

let readFile = promisify(fs.readFile)

const TS_DIR = dirname(require.resolve('typescript'))
const WORKER = join(__dirname, 'worker.js')
const PREFIX = '// THROWS '

let Worker, createProgram
try {
  Worker = require('worker_threads').Worker
} catch {
  createProgram = require('./create-program')
}

function checkFiles (files, compilerOptions) {
  if (Worker) {
    return new Promise((resolve, reject) => {
      let worker = new Worker(WORKER, {
        workerData: { files, compilerOptions }
      })
      worker.on('message', resolve)
      worker.on('error', reject)
    })
  } else {
    return createProgram(files, compilerOptions)
  }
}

function getText (error) {
  if (typeof error.messageText === 'object') {
    return error.messageText.messageText
  } else {
    return error.messageText
  }
}

function formatName (cwd, file, color) {
  return gray(relative(cwd, file).replace(basename(file), i => color(i)))
}

async function parseTest (files) {
  let expects = []
  await Promise.all(
    files.map(async fileName => {
      let source = (await readFile(fileName)).toString()
      let prev, pos
      let lines = vfileLocation(source)
      while (true) {
        pos = source.indexOf(PREFIX, prev + 1)
        if (pos === -1) break
        let newline = source.indexOf('\n', pos)
        let pattern = source.slice(pos + PREFIX.length, newline)
        let { line, column } = lines.toPoint(pos)
        expects.push({ fileName, line: line + 1, column, pattern })
        prev = pos
      }
    })
  )
  return expects
}

module.exports = async function check (
  stdout,
  cwd,
  print,
  globs = ['**/*.{js,ts,jsx,tsx}']
) {
  let spinner = ora({ stream: stdout }).start('Check types')

  let compilerOptions
  let tsconfigPath = join(cwd, 'tsconfig.json')
  if (fs.existsSync(tsconfigPath)) {
    let tsconfig = JSON.parse(await readFile(tsconfigPath))
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
  function push (file, message) {
    if (!bad[file]) bad[file] = []
    bad[file].push(message)
  }

  for (let i of errors) {
    let { line, column } = vfileLocation(i.file.text).toPoint(i.start)
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
        prefix + b(' Type error ' + gray(`TS${i.code}`) + '\n') + '  ' + r(text)
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
    spinner.fail()
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
    spinner.succeed()
    for (let i of typeTests) {
      print(g('✔ ') + formatName(cwd, i, white))
    }
    return true
  }
}
