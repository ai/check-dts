let { dirname, basename, join, relative } = require('path')
let { promisify } = require('util')
let lineColumn = require('line-column')
let globby = require('globby')
let kleur = require('kleur')
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

let r = kleur.red
let b = kleur.bold
let g = kleur.green

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

function formatName (cwd, file) {
  return kleur.gray(
    relative(cwd, file).replace(basename(file), i => kleur.white().bold(i))
  )
}

async function parseTest (files) {
  let expects = []
  await Promise.all(
    files.map(async fileName => {
      let source = (await readFile(fileName)).toString()
      let prev, pos
      let lines = lineColumn(source)
      while (true) {
        pos = source.indexOf(PREFIX, prev + 1)
        if (pos === -1) break
        let newline = source.indexOf('\n', pos)
        let pattern = source.slice(pos + PREFIX.length, newline)
        let { line, col } = lines.fromIndex(pos)
        expects.push({ fileName, line: line + 1, col, pattern })
        prev = pos
      }
    })
  )
  return expects
}

module.exports = async function check (stdout, cwd, print) {
  let spinner = ora({ stream: stdout }).start('Check types')

  let compilerOptions
  let tsconfigPath = join(cwd, 'tsconfig.json')
  if (fs.existsSync(tsconfigPath)) {
    let tsconfig = JSON.parse(await readFile(tsconfigPath))
    compilerOptions = tsconfig.compilerOptions
  }

  let opts = { cwd, ignore: ['node_modules'], gitignore: true, absolute: true }
  let all = await globby('**/*.{js,ts,jsx,tsx}', opts)

  if (!all.some(i => /\.tsx?$/.test(i))) {
    let err = new Error(
      'TypeScript files was not found. ' +
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
    let { line, col } = lineColumn(i.file.text).fromIndex(i.start)
    let expect = expects.find(j => {
      return i.file.fileName === j.fileName && line === j.line && !j.used
    })
    let pos = r(`${line}:${col}:`)
    let text = getText(i)
    if (!failTests.includes(i.file.fileName)) {
      push(
        i.file.fileName,
        '  ' +
          b(pos + ' Type error ' + kleur.gray(`TS${i.code}`) + '\n') +
          '  ' +
          r(text)
      )
    } else if (!expect) {
      push(
        i.file.fileName,
        '  ' + b(pos + ' Unexpected error\n') + '  ' + r(text)
      )
    } else {
      expect.used = true
      if (!text.includes(expect.pattern)) {
        push(
          i.file.fileName,
          '  ' +
            b(pos + ' Wrong error\n') +
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
      '  ' +
        b(r(`${i.line}:${i.col}:`) + ' Error was not found\n') +
        '  ' +
        r(i.pattern)
    )
  }

  let failed = Object.keys(bad).length > 0
  if (failed) {
    spinner.fail()
    for (let file in bad) {
      print(r('✖ ') + formatName(cwd, file) + '\n')
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
      print(kleur.green('✔ ') + formatName(cwd, i))
    }
    return true
  }
}
